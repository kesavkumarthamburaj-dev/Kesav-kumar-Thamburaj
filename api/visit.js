// api/visit.js
// Handles visitor registration, privacy-preserving metrics counting, and choices.
import crypto from 'crypto';
import {
  redisCommand,
  redisPipeline,
  getMissingRedisEnvVars,
  escapeHtml,
  getDeviceType,
  BOT_USER_AGENT_REGEX,
  ALLOWED_PURPOSES,
} from './_lib/redis.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TWELVE_MONTHS_SECONDS = 365 * 24 * 60 * 60; // 31,536,000s

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'method_not_allowed',
      message: 'Method Not Allowed. Please send a POST request.',
    });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({
          error: 'validation',
          message: 'Invalid JSON request payload',
        });
      }
    }
    body = body || {};
    const { visitorId, name, purpose, consent, _hp } = body;

    // 1. Honeypot check
    if (_hp) {
      console.warn('[Visit API] Honeypot triggered');
      return res.status(400).json({
        error: 'validation',
        message: 'Bot detected',
      });
    }

    // 2. Bot User-Agent check
    const userAgent = req.headers['user-agent'] || '';
    if (BOT_USER_AGENT_REGEX.test(userAgent)) {
      console.warn('[Visit API] Bot user-agent blocked:', userAgent.slice(0, 50));
      return res.status(400).json({
        error: 'validation',
        message: 'Bot user-agent detected',
      });
    }

    // 3. Client IP extraction & Rate limiting (10 requests per hour per IP)
    const forwardedFor = req.headers['x-forwarded-for'];
    const clientIp = typeof forwardedFor === 'string'
      ? forwardedFor.split(',')[0].trim()
      : req.socket?.remoteAddress || '127.0.0.1';

    // Check env vars first
    if (process.env.USE_MOCK_REDIS !== 'true') {
      const missing = getMissingRedisEnvVars();
      if (missing.length > 0) {
        console.error('[Visit API] Missing environment variables:', missing);
        return res.status(500).json({
          error: 'config',
          missing,
        });
      }
    }

    // IP rate limit check (never stores raw IP; hashes with sha256)
    const ipHash = crypto.createHash('sha256').update(clientIp).digest('hex').slice(0, 16);
    const rateLimitKey = `ratelimit:visit:${ipHash}`;

    try {
      const currentCount = await redisCommand('INCR', rateLimitKey);
      if (currentCount === 1) {
        await redisCommand('EXPIRE', rateLimitKey, 3600); // 1 hour TTL
      }
      if (currentCount > 10) {
        return res.status(429).json({
          error: 'rate_limit',
          message: 'Too many requests. Please try again later.',
        });
      }
    } catch (rlErr) {
      console.error('[Visit API] Rate limit check error:', rlErr);
      // If redis is unavailable and not in mock mode, will be caught below
    }

    // 4. Validate visitorId (UUID format required)
    if (!visitorId || typeof visitorId !== 'string' || !UUID_REGEX.test(visitorId)) {
      return res.status(400).json({
        error: 'validation',
        message: 'Invalid visitorId format. Must be a valid UUID.',
      });
    }

    // 5. Validate name (optional, 2 to 40 chars, HTML escaped)
    let cleanName = '';
    if (name !== undefined && name !== null && name !== '') {
      if (typeof name !== 'string') {
        return res.status(400).json({
          error: 'validation',
          message: 'Name must be a string.',
        });
      }
      const trimmedName = name.trim();
      if (trimmedName.length < 2 || trimmedName.length > 40) {
        return res.status(400).json({
          error: 'validation',
          message: 'Name must be between 2 and 40 characters.',
        });
      }
      cleanName = escapeHtml(trimmedName);
    }

    // 6. Validate purpose (optional or one of 4 allowed values)
    let cleanPurpose = '';
    if (purpose !== undefined && purpose !== null && purpose !== '') {
      if (typeof purpose !== 'string' || !ALLOWED_PURPOSES.includes(purpose)) {
        return res.status(400).json({
          error: 'validation',
          message: 'Invalid purpose. Must be one of the predefined options.',
        });
      }
      cleanPurpose = purpose;
    }

    // 7. Consent check: Name ONLY stored if consent is true
    const isConsentGiven = consent === true || consent === 'true';
    const finalStoredName = isConsentGiven && cleanName ? cleanName : '';

    // 8. Prepare metadata
    const now = new Date();
    const nowIso = now.toISOString();
    const dateStr = nowIso.slice(0, 10); // YYYY-MM-DD
    const country = req.headers['x-vercel-ip-country'] || 'unknown';
    const deviceType = getDeviceType(userAgent);

    // Check if visitor already exists to preserve firstSeen
    let firstSeen = nowIso;
    try {
      const existing = await redisCommand('HGETALL', `visitor:${visitorId}`);
      if (existing && existing.firstSeen) {
        firstSeen = existing.firstSeen;
      }
    } catch {
      // Ignore and proceed
    }

    // 9. Execute Upstash Redis pipeline
    const pipelineCommands = [
      ['INCR', 'visits:total'],
      ['SADD', 'visitors:unique', visitorId],
      ['INCR', `visits:${dateStr}`],
      ['EXPIRE', `visits:${dateStr}`, TWELVE_MONTHS_SECONDS],
      [
        'HSET',
        `visitor:${visitorId}`,
        'visitorId', visitorId,
        'name', finalStoredName,
        'purpose', cleanPurpose || 'Skipped',
        'firstSeen', firstSeen,
        'lastSeen', nowIso,
        'country', country,
        'device', deviceType,
        'consent', isConsentGiven ? 'true' : 'false',
      ],
      ['EXPIRE', `visitor:${visitorId}`, TWELVE_MONTHS_SECONDS],
      ['ZADD', 'visitors:timeline', Date.now(), visitorId],
    ];

    if (cleanPurpose) {
      pipelineCommands.push(['HINCRBY', 'visits:purposes', cleanPurpose, 1]);
    } else {
      pipelineCommands.push(['HINCRBY', 'visits:purposes', 'Skipped', 1]);
    }

    await redisPipeline(pipelineCommands);

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('[Visit API Error]', error);
    return res.status(500).json({
      error: 'server_error',
      message: 'Failed to record visit',
    });
  }
}
