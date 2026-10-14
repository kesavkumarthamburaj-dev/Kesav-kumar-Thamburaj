// api/admin-visitors.js
// Private administrative endpoint for visitor telemetry and management.
// Protected by ADMIN_KEY header with constant-time comparison.
import crypto from 'crypto';
import {
  redisCommand,
  redisPipeline,
  getMissingRedisEnvVars,
} from './_lib/redis.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function constantTimeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. Check Server Config
  const missingEnv = [];
  if (!process.env.ADMIN_KEY) missingEnv.push('ADMIN_KEY');
  if (process.env.USE_MOCK_REDIS !== 'true') {
    missingEnv.push(...getMissingRedisEnvVars());
  }

  if (missingEnv.length > 0) {
    console.error('[Admin API] Missing environment variables:', missingEnv);
    return res.status(500).json({
      error: 'config',
      missing: missingEnv,
    });
  }

  // 2. IP Rate Limit for Admin API (prevents brute force: max 30 req/hour)
  const forwardedFor = req.headers['x-forwarded-for'];
  const clientIp = typeof forwardedFor === 'string'
    ? forwardedFor.split(',')[0].trim()
    : req.socket?.remoteAddress || '127.0.0.1';

  const ipHash = crypto.createHash('sha256').update(clientIp).digest('hex').slice(0, 16);
  const rateLimitKey = `ratelimit:admin:${ipHash}`;

  try {
    const adminReqCount = await redisCommand('INCR', rateLimitKey);
    if (adminReqCount === 1) {
      await redisCommand('EXPIRE', rateLimitKey, 3600);
    }
    if (adminReqCount > 30) {
      return res.status(429).json({
        error: 'rate_limit',
        message: 'Too many requests to admin portal. Please try again later.',
      });
    }
  } catch (rlErr) {
    console.error('[Admin API] Rate limit error:', rlErr);
  }

  // 3. Constant-Time Authentication Header Check
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token || !constantTimeCompare(token, process.env.ADMIN_KEY)) {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'Unauthorized: Invalid or missing administrator credentials.',
    });
  }

  // 4. Handle DELETE (Remove single visitor)
  if (req.method === 'DELETE') {
    let visitorId = req.query?.visitorId;
    if (!visitorId && req.body) {
      let parsed = req.body;
      if (typeof parsed === 'string') {
        try { parsed = JSON.parse(parsed); } catch { /* ignore */ }
      }
      visitorId = parsed?.visitorId;
    }

    if (!visitorId || !UUID_REGEX.test(visitorId)) {
      return res.status(400).json({
        error: 'validation',
        message: 'Valid visitorId UUID required for deletion.',
      });
    }

    try {
      await redisPipeline([
        ['DEL', `visitor:${visitorId}`],
        ['ZREM', 'visitors:timeline', visitorId],
        ['SREM', 'visitors:unique', visitorId],
      ]);
      return res.status(200).json({ ok: true, deleted: visitorId });
    } catch (delErr) {
      console.error('[Admin API Delete Error]', delErr);
      return res.status(500).json({ error: 'server_error', message: 'Failed to delete visitor' });
    }
  }

  // 5. Handle GET (Telemetry & List)
  if (req.method === 'GET') {
    try {
      const todayStr = new Date().toISOString().slice(0, 10);

      // Core counters
      const totalVisitsRaw = await redisCommand('GET', 'visits:total');
      const totalVisits = Number(totalVisitsRaw) || 0;

      const uniqueVisitors = await redisCommand('SCARD', 'visitors:unique') || 0;

      const todayVisitsRaw = await redisCommand('GET', `visits:${todayStr}`);
      const todayVisits = Number(todayVisitsRaw) || 0;

      // Last 7 days metrics
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStr = d.toISOString().slice(0, 10);
        const dayCountRaw = await redisCommand('GET', `visits:${dayStr}`);
        last7Days.push({
          date: dayStr,
          count: Number(dayCountRaw) || 0,
        });
      }

      // Purpose breakdown
      const purposeData = await redisCommand('HGETALL', 'visits:purposes') || {};
      const purposeBreakdown = {
        'Hiring a designer': Number(purposeData['Hiring a designer']) || 0,
        'Packaging project': Number(purposeData['Packaging project']) || 0,
        'Need an app or SaaS': Number(purposeData['Need an app or SaaS']) || 0,
        'Just looking around': Number(purposeData['Just looking around']) || 0,
        'Skipped': Number(purposeData['Skipped']) || 0,
      };

      // Pagination
      const page = Math.max(1, parseInt(req.query?.page || 1, 10));
      const limit = Math.min(100, Math.max(1, parseInt(req.query?.limit || 50, 10)));
      const start = (page - 1) * limit;
      const stop = start + limit - 1;

      const totalRecords = await redisCommand('ZCARD', 'visitors:timeline') || 0;
      const visitorIds = await redisCommand('ZREVRANGE', 'visitors:timeline', start, stop) || [];

      // Fetch visitor details
      const visitors = [];
      for (const id of visitorIds) {
        const visitorHash = await redisCommand('HGETALL', `visitor:${id}`);
        if (visitorHash && Object.keys(visitorHash).length > 0) {
          visitors.push({
            visitorId: id,
            name: visitorHash.name || '',
            purpose: visitorHash.purpose || 'Skipped',
            country: visitorHash.country || 'unknown',
            device: visitorHash.device || 'desktop',
            firstSeen: visitorHash.firstSeen || '',
            lastSeen: visitorHash.lastSeen || '',
            consent: visitorHash.consent === 'true',
          });
        }
      }

      return res.status(200).json({
        ok: true,
        metrics: {
          total: totalVisits,
          unique: uniqueVisitors,
          today: todayVisits,
        },
        last7Days,
        purposeBreakdown,
        visitors,
        pagination: {
          page,
          limit,
          total: totalRecords,
          totalPages: Math.ceil(totalRecords / limit) || 1,
        },
      });
    } catch (err) {
      console.error('[Admin API Fetch Error]', err);
      return res.status(500).json({
        error: 'server_error',
        message: 'Failed to retrieve visitor telemetry',
      });
    }
  }

  return res.status(405).json({
    error: 'method_not_allowed',
    message: 'Method Not Allowed.',
  });
}
