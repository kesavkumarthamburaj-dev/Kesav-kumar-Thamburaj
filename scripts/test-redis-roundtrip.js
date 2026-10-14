// scripts/test-redis-roundtrip.js
// Tests real HTTP INCR/GET round trip via api/_lib/redis.js against an HTTP REST endpoint.
// Validates KV_REST_API_URL, KV_REST_API_TOKEN, Upstash fallback, read-only token safety, and config error responses.

import http from 'http';

// Local storage for the mock Upstash/Vercel KV REST server
const store = new Map();

// 1. Create a real HTTP server conforming to Vercel KV / Upstash Redis REST specs
const server = http.createServer(async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  // If client used read-only token for mutation command, reject as Upstash/Vercel KV does
  if (token === 'readonly_token_test') {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'NOPERM: Read-only token cannot execute write commands' }));
    return;
  }

  if (token !== 'valid_kv_write_token') {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return;
  }

  // Read request body
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString('utf-8');

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Invalid JSON' }));
    return;
  }

  const url = req.url?.split('?')[0];

  // Handle pipeline endpoint
  if (url === '/pipeline') {
    const results = [];
    for (const [cmd, ...args] of body) {
      results.push({ result: executeCommand(cmd, ...args) });
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(results));
    return;
  }

  // Handle single command endpoint
  const [cmd, ...args] = body;
  const result = executeCommand(cmd, ...args);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ result }));
});

function executeCommand(cmd, ...args) {
  const upper = (cmd || '').toUpperCase();
  switch (upper) {
    case 'INCR': {
      const key = args[0];
      const val = (Number(store.get(key)) || 0) + 1;
      store.set(key, String(val));
      return val;
    }
    case 'GET': {
      const key = args[0];
      return store.get(key) || null;
    }
    case 'SET': {
      const [key, val] = args;
      store.set(key, String(val));
      return 'OK';
    }
    case 'DEL': {
      const key = args[0];
      store.delete(key);
      return 1;
    }
    default:
      return 'OK';
  }
}

async function runTest() {
  console.log('====================================================');
  console.log('🧪 REAL REDIS INCR/GET HTTP ROUND TRIP TEST');
  console.log('====================================================\n');

  // Start HTTP server on random available port
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const testRestUrl = `http://127.0.0.1:${port}`;
  console.log(`🌐 Real HTTP REST endpoint listening on ${testRestUrl}`);

  // Test Step 1: Real INCR/GET round-trip with KV_REST_API_URL & KV_REST_API_TOKEN
  delete process.env.USE_MOCK_REDIS; // Ensure REAL HTTP fetch execution
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  process.env.KV_REST_API_URL = testRestUrl;
  process.env.KV_REST_API_TOKEN = 'valid_kv_write_token';

  // Import shared helper
  const { redisCommand, getRedisCredentials, getMissingRedisEnvVars } = await import('../api/_lib/redis.js');

  console.log('\n--- 1. Testing Vercel KV env vars priority ---');
  const creds = getRedisCredentials();
  console.log('Resolved credentials:', { url: creds.url, token: creds.token ? '***' : null });
  if (creds.url !== testRestUrl || creds.token !== 'valid_kv_write_token') {
    throw new Error('Failed to resolve KV_REST_API_* credentials');
  }
  console.log('✅ Resolved KV_REST_API_URL and KV_REST_API_TOKEN correctly');

  console.log('\n--- 2. Executing Real HTTP INCR round trip ---');
  const incr1 = await redisCommand('INCR', 'test:visitor:counter');
  console.log('HTTP INCR #1 result:', incr1, `(Type: ${typeof incr1})`);
  if (incr1 !== 1) throw new Error(`Expected incr1 === 1, got ${incr1}`);

  const incr2 = await redisCommand('INCR', 'test:visitor:counter');
  console.log('HTTP INCR #2 result:', incr2, `(Type: ${typeof incr2})`);
  if (incr2 !== 2) throw new Error(`Expected incr2 === 2, got ${incr2}`);

  console.log('\n--- 3. Executing Real HTTP GET round trip ---');
  const getVal = await redisCommand('GET', 'test:visitor:counter');
  console.log('HTTP GET result:', getVal, `(Type: ${typeof getVal})`);
  if (getVal !== '2') throw new Error(`Expected getVal === '2', got ${getVal}`);
  console.log('✅ Real HTTP INCR/GET round trip succeeded over the wire!');

  // Test Step 4: Fallback to UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
  console.log('\n--- 4. Testing Fallback to UPSTASH_REDIS_REST_* ---');
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  process.env.UPSTASH_REDIS_REST_URL = testRestUrl;
  process.env.UPSTASH_REDIS_REST_TOKEN = 'valid_kv_write_token';

  const fallbackIncr = await redisCommand('INCR', 'test:fallback:counter');
  const fallbackGet = await redisCommand('GET', 'test:fallback:counter');
  console.log('Fallback INCR:', fallbackIncr, '| Fallback GET:', fallbackGet);
  if (fallbackIncr !== 1 || fallbackGet !== '1') throw new Error('Fallback failed');
  console.log('✅ Upstash legacy fallback works cleanly when KV_* is unset');

  // Test Step 5: Read-only token safety (NEVER use KV_REST_API_READ_ONLY_TOKEN for writes)
  console.log('\n--- 5. Verifying KV_REST_API_READ_ONLY_TOKEN safety ---');
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  process.env.KV_REST_API_URL = testRestUrl;
  process.env.KV_REST_API_READ_ONLY_TOKEN = 'readonly_token_test';
  // Notice KV_REST_API_TOKEN is NOT set!
  const missingWithReadOnly = getMissingRedisEnvVars();
  console.log('Missing env check with only read-only token present:', missingWithReadOnly);
  if (!missingWithReadOnly.includes('KV_REST_API_TOKEN')) {
    throw new Error('KV_REST_API_READ_ONLY_TOKEN should never satisfy write token requirement!');
  }
  console.log('✅ Read-only token is rejected for write operations');

  // Test Step 6: 500 config response with missing names only
  console.log('\n--- 6. Testing 500 { error: "config", missing: [...] } on endpoint ---');
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  delete process.env.KV_REST_API_READ_ONLY_TOKEN;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;

  const missingAll = getMissingRedisEnvVars();
  console.log('getMissingRedisEnvVars() with no env vars:', missingAll);
  if (missingAll.length !== 2 || !missingAll.includes('KV_REST_API_URL') || !missingAll.includes('KV_REST_API_TOKEN')) {
    throw new Error(`Expected ['KV_REST_API_URL', 'KV_REST_API_TOKEN'], got ${JSON.stringify(missingAll)}`);
  }

  // Call visit handler to verify 500 response without crashing
  const visitModule = await import('../api/visit.js');
  const visitHandler = visitModule.default;

  let statusCode = 200;
  let jsonResponse = null;
  const mockReq = {
    method: 'POST',
    headers: { 'user-agent': 'TestAgent/1.0', 'x-forwarded-for': '127.0.0.1' },
    body: { visitorId: '00000000-0000-4000-8000-000000000000', consent: false },
  };
  const mockRes = {
    status(code) {
      statusCode = code;
      return this;
    },
    setHeader() {},
    json(data) {
      jsonResponse = data;
      return this;
    },
  };

  await visitHandler(mockReq, mockRes);
  console.log('Visit API status with missing env:', statusCode, 'Response:', jsonResponse);
  if (statusCode !== 500 || jsonResponse?.error !== 'config' || !Array.isArray(jsonResponse?.missing)) {
    throw new Error('Visit handler did not return 500 { error: "config", missing }');
  }
  console.log('✅ Missing env vars returns 500 with missing names only and never crashes');

  // Close server
  await new Promise((resolve) => server.close(resolve));
  console.log('\n====================================================');
  console.log('🎉 ALL REAL HTTP ROUND TRIP CHECKS PASSED');
  console.log('====================================================\n');
}

runTest().catch((err) => {
  console.error('Test error:', err);
  server.close();
  process.exit(1);
});
