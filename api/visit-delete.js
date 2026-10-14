// api/visit-delete.js
// Handles visitor privacy self-service data deletion (POST /api/visit-delete).
import crypto from 'crypto';
import {
  redisCommand,
  redisPipeline,
  getMissingRedisEnvVars,
  BOT_USER_AGENT_REGEX,
} from './_lib/redis.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
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
    const { visitorId } = body;

    // Bot User-Agent check
    const userAgent = req.headers['user-agent'] || '';
    if (BOT_USER_AGENT_REGEX.test(userAgent)) {
      return res.status(400).json({
        error: 'validation',
        message: 'Bot user-agent detected',
      });
    }

    // IP Rate limiting
    const forwardedFor = req.headers['x-forwarded-for'];
    const clientIp = typeof forwardedFor === 'string'
      ? forwardedFor.split(',')[0].trim()
      : req.socket?.remoteAddress || '127.0.0.1';

    if (process.env.USE_MOCK_REDIS !== 'true') {
      const missing = getMissingRedisEnvVars();
      if (missing.length > 0) {
        console.error('[Visit Delete API] Missing env vars:', missing);
        return res.status(500).json({
          error: 'config',
          missing,
        });
      }
    }

    const ipHash = crypto.createHash('sha256').update(clientIp).digest('hex').slice(0, 16);
    const rateLimitKey = `ratelimit:visit-delete:${ipHash}`;

    try {
      const currentCount = await redisCommand('INCR', rateLimitKey);
      if (currentCount === 1) {
        await redisCommand('EXPIRE', rateLimitKey, 3600);
      }
      if (currentCount > 10) {
        return res.status(429).json({
          error: 'rate_limit',
          message: 'Too many requests. Please try again later.',
        });
      }
    } catch (rlErr) {
      console.error('[Visit Delete API] Rate limit check error:', rlErr);
    }

    // Validate visitorId
    if (!visitorId || typeof visitorId !== 'string' || !UUID_REGEX.test(visitorId)) {
      return res.status(400).json({
        error: 'validation',
        message: 'Invalid visitorId format.',
      });
    }

    // Pipeline deletion of visitor data
    await redisPipeline([
      ['DEL', `visitor:${visitorId}`],
      ['ZREM', 'visitors:timeline', visitorId],
      ['SREM', 'visitors:unique', visitorId],
    ]);

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('[Visit Delete API Error]', error);
    return res.status(500).json({
      error: 'server_error',
      message: 'Failed to delete visitor data',
    });
  }
}
