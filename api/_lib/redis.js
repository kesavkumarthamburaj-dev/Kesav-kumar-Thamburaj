// api/_lib/redis.js
// Shared Redis client for Vercel KV / Upstash Redis with in-memory fallback for testing.
// Fully privacy-preserving: never logs or stores personal data or full user agents.

// In-memory mock store used when USE_MOCK_REDIS === 'true' (for local test runner)
const memoryStore = {
  strings: new Map(),
  sets: new Map(),
  sortedSets: new Map(),
  hashes: new Map(),
};

/**
 * Resolves Redis REST API credentials.
 * Reads Vercel KV env vars first (KV_REST_API_URL, KV_REST_API_TOKEN),
 * falling back to UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN if missing.
 *
 * NOTE: NEVER use KV_REST_API_READ_ONLY_TOKEN for writes (INCR, SADD, SET);
 * it is read-only and will fail on mutation commands.
 */
export function getRedisCredentials() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || null;
  // Explicitly use full read/write token only. Do NOT fall back to KV_REST_API_READ_ONLY_TOKEN.
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || null;

  return { url, token };
}

/**
 * Returns names of missing Redis environment variables (names only).
 * If neither the KV_ name nor the UPSTASH_ fallback is found, reports the primary KV_ name.
 */
export function getMissingRedisEnvVars() {
  const missing = [];
  if (!process.env.KV_REST_API_URL && !process.env.UPSTASH_REDIS_REST_URL) {
    missing.push('KV_REST_API_URL');
  }
  if (!process.env.KV_REST_API_TOKEN && !process.env.UPSTASH_REDIS_REST_TOKEN) {
    missing.push('KV_REST_API_TOKEN');
  }
  return missing;
}

/**
 * Executes a single Redis command via the Upstash / Vercel KV REST API.
 */
export async function redisCommand(command, ...args) {
  if (process.env.USE_MOCK_REDIS === 'true') {
    return executeMemoryCommand(command, ...args);
  }

  const { url, token } = getRedisCredentials();
  if (!url || !token) {
    const missing = getMissingRedisEnvVars();
    const err = new Error('Missing Redis environment variables');
    err.code = 'CONFIG_MISSING';
    err.missing = missing;
    throw err;
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([command, ...args]),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Redis REST error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return data.result;
  } catch (error) {
    console.error(`[Redis Client Error: ${command}]`, error.message);
    throw error;
  }
}

/**
 * Executes a pipeline of multiple commands in a single HTTP request.
 */
export async function redisPipeline(commands) {
  if (process.env.USE_MOCK_REDIS === 'true') {
    const results = [];
    for (const [cmd, ...args] of commands) {
      results.push({ result: executeMemoryCommand(cmd, ...args) });
    }
    return results;
  }

  const { url, token } = getRedisCredentials();
  if (!url || !token) {
    const missing = getMissingRedisEnvVars();
    const err = new Error('Missing Redis environment variables');
    err.code = 'CONFIG_MISSING';
    err.missing = missing;
    throw err;
  }

  try {
    const res = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commands),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Redis Pipeline error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('[Redis Pipeline Error]', error.message);
    throw error;
  }
}

/**
 * In-memory fallback simulation for local test execution.
 */
function executeMemoryCommand(cmd, ...args) {
  const upperCmd = cmd.toUpperCase();

  switch (upperCmd) {
    case 'INCR': {
      const key = args[0];
      const val = (Number(memoryStore.strings.get(key)) || 0) + 1;
      memoryStore.strings.set(key, String(val));
      return val;
    }
    case 'GET': {
      const key = args[0];
      return memoryStore.strings.get(key) || null;
    }
    case 'SET': {
      const [key, val] = args;
      memoryStore.strings.set(key, String(val));
      return 'OK';
    }
    case 'SADD': {
      const [key, member] = args;
      if (!memoryStore.sets.has(key)) memoryStore.sets.set(key, new Set());
      const set = memoryStore.sets.get(key);
      const isNew = !set.has(member);
      set.add(member);
      return isNew ? 1 : 0;
    }
    case 'SCARD': {
      const key = args[0];
      return memoryStore.sets.get(key)?.size || 0;
    }
    case 'SREM': {
      const [key, member] = args;
      const set = memoryStore.sets.get(key);
      if (!set) return 0;
      const removed = set.delete(member);
      return removed ? 1 : 0;
    }
    case 'ZADD': {
      const [key, score, member] = args;
      if (!memoryStore.sortedSets.has(key)) memoryStore.sortedSets.set(key, new Map());
      const zset = memoryStore.sortedSets.get(key);
      zset.set(member, Number(score));
      return 1;
    }
    case 'ZCARD': {
      const key = args[0];
      return memoryStore.sortedSets.get(key)?.size || 0;
    }
    case 'ZREVRANGE': {
      const [key, start, stop] = args;
      const zset = memoryStore.sortedSets.get(key);
      if (!zset) return [];
      const sorted = Array.from(zset.entries()).sort((a, b) => b[1] - a[1]);
      const sliced = sorted.slice(Number(start), Number(stop) === -1 ? undefined : Number(stop) + 1);
      return sliced.map(([member]) => member);
    }
    case 'ZREM': {
      const [key, member] = args;
      const zset = memoryStore.sortedSets.get(key);
      if (!zset) return 0;
      return zset.delete(member) ? 1 : 0;
    }
    case 'HSET': {
      const [key, ...fieldValues] = args;
      if (!memoryStore.hashes.has(key)) memoryStore.hashes.set(key, new Map());
      const hash = memoryStore.hashes.get(key);
      if (typeof fieldValues[0] === 'object' && fieldValues[0] !== null) {
        for (const [f, v] of Object.entries(fieldValues[0])) {
          hash.set(f, String(v));
        }
      } else {
        for (let i = 0; i < fieldValues.length; i += 2) {
          hash.set(fieldValues[i], String(fieldValues[i + 1]));
        }
      }
      return 1;
    }
    case 'HINCRBY': {
      const [key, field, incr] = args;
      if (!memoryStore.hashes.has(key)) memoryStore.hashes.set(key, new Map());
      const hash = memoryStore.hashes.get(key);
      const val = (Number(hash.get(field)) || 0) + (Number(incr) || 1);
      hash.set(field, String(val));
      return val;
    }
    case 'HGETALL': {
      const key = args[0];
      const hash = memoryStore.hashes.get(key);
      if (!hash) return {};
      const obj = {};
      for (const [k, v] of hash.entries()) obj[k] = v;
      return obj;
    }
    case 'DEL': {
      const key = args[0];
      memoryStore.strings.delete(key);
      memoryStore.sets.delete(key);
      memoryStore.sortedSets.delete(key);
      memoryStore.hashes.delete(key);
      return 1;
    }
    case 'EXPIRE': {
      return 1;
    }
    default:
      return null;
  }
}

export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function getDeviceType(ua) {
  if (!ua || typeof ua !== 'string') return 'desktop';
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(ua)) return 'mobile';
  return 'desktop';
}

export const BOT_USER_AGENT_REGEX =
  /bot|spider|crawler|crawling|googlebot|bingbot|yandex|duckduckbot|slurp|baiduspider|facebookexternalhit|whatsapp|linkedinbot|twitterbot/i;

export const ALLOWED_PURPOSES = [
  'Hiring a designer',
  'Packaging project',
  'Need an app or SaaS',
  'Just looking around',
];
