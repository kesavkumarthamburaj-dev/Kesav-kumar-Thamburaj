// scripts/test-visitor-system.js
// Automated verification suite for Visitor Welcome Card, APIs, Admin Portal, and Privacy.

import http from 'http';
import { randomUUID } from 'crypto';

process.env.USE_MOCK_REDIS = 'true';
process.env.ADMIN_KEY = 'test_admin_key_super_secret_123';

// Dynamically import API handlers
const visitModule = await import('../api/visit.js');
const visitHandler = visitModule.default;

const visitDeleteModule = await import('../api/visit-delete.js');
const visitDeleteHandler = visitDeleteModule.default;

const adminVisitorsModule = await import('../api/admin-visitors.js');
const adminVisitorsHandler = adminVisitorsModule.default;

// Helper to simulate request/response against serverless function
async function callHandler(handler, { method = 'POST', body = {}, headers = {}, query = {} } = {}) {
  let statusCode = 200;
  let responseData = null;
  const responseHeaders = {};

  const req = {
    method,
    headers: {
      'content-type': 'application/json',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
      'x-forwarded-for': '127.0.0.1',
      ...headers,
    },
    query,
    body,
  };

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    setHeader(key, val) {
      responseHeaders[key] = val;
    },
    json(data) {
      responseData = data;
      return this;
    },
    end() {
      return this;
    },
  };

  await handler(req, res);
  return { status: statusCode, data: responseData, headers: responseHeaders };
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING VISITOR WELCOME CARD & TELEMETRY TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} - ${details}`);
      failed++;
    }
  }

  // 1. Enter with valid name and consent
  const visitorA = randomUUID();
  const res1 = await callHandler(visitHandler, {
    method: 'POST',
    body: {
      visitorId: visitorA,
      name: 'Priya Sharma',
      purpose: 'Packaging project',
      consent: true,
      _hp: '',
    },
  });
  assert(res1.status === 200 && res1.data?.ok === true, '1. Enter with name and consent', `Status ${res1.status}`);

  // 2. Skip / Anonymous visit (no name, no consent)
  const visitorB = randomUUID();
  const res2 = await callHandler(visitHandler, {
    method: 'POST',
    body: {
      visitorId: visitorB,
      purpose: 'Just looking around',
      consent: false,
      _hp: '',
    },
  });
  assert(res2.status === 200 && res2.data?.ok === true, '2. Skip / Anonymous visit', `Status ${res2.status}`);

  // 3. Invalid visitorId format
  const res3 = await callHandler(visitHandler, {
    method: 'POST',
    body: {
      visitorId: 'not-a-valid-uuid',
      name: 'Tester',
      consent: true,
    },
  });
  assert(res3.status === 400 && res3.data?.error === 'validation', '3. Reject invalid visitorId UUID', `Status ${res3.status}`);

  // 4. Invalid name length (too short < 2 chars)
  const res4 = await callHandler(visitHandler, {
    method: 'POST',
    body: {
      visitorId: randomUUID(),
      name: 'A',
      consent: true,
    },
  });
  assert(res4.status === 400 && res4.data?.error === 'validation', '4. Reject name < 2 chars', `Status ${res4.status}`);

  // 5. Invalid name length (too long > 40 chars)
  const res5 = await callHandler(visitHandler, {
    method: 'POST',
    body: {
      visitorId: randomUUID(),
      name: 'A'.repeat(45),
      consent: true,
    },
  });
  assert(res5.status === 400 && res5.data?.error === 'validation', '5. Reject name > 40 chars', `Status ${res5.status}`);

  // 6. Invalid purpose
  const res6 = await callHandler(visitHandler, {
    method: 'POST',
    body: {
      visitorId: randomUUID(),
      purpose: 'Random unknown option',
      consent: false,
    },
  });
  assert(res6.status === 400 && res6.data?.error === 'validation', '6. Reject invalid purpose', `Status ${res6.status}`);

  // 7. Honeypot rejection
  const res7 = await callHandler(visitHandler, {
    method: 'POST',
    body: {
      visitorId: randomUUID(),
      name: 'Spam Bot',
      _hp: 'spam-bot-trap-field',
    },
  });
  assert(res7.status === 400 && res7.data?.message === 'Bot detected', '7. Honeypot rejection', `Status ${res7.status}`);

  // 8. Bot user-agent rejection
  const res8 = await callHandler(visitHandler, {
    method: 'POST',
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    },
    body: {
      visitorId: randomUUID(),
      name: 'Google Crawler',
      consent: true,
    },
  });
  assert(res8.status === 400 && res8.data?.message === 'Bot user-agent detected', '8. Bot user-agent rejection', `Status ${res8.status}`);

  // 9. Rate limit (10 requests per hour per IP)
  const rateLimitIp = '192.168.1.99';
  let lastStatus = 200;
  for (let i = 1; i <= 12; i++) {
    const rlRes = await callHandler(visitHandler, {
      method: 'POST',
      headers: { 'x-forwarded-for': rateLimitIp },
      body: {
        visitorId: randomUUID(),
        consent: false,
      },
    });
    lastStatus = rlRes.status;
  }
  assert(lastStatus === 429, '9. IP Rate Limit triggers 429 on > 10 req/hr', `Last status ${lastStatus}`);

  // 10. Admin API: Wrong ADMIN_KEY (401)
  const res10 = await callHandler(adminVisitorsHandler, {
    method: 'GET',
    headers: {
      authorization: 'Bearer wrong_password_123',
    },
  });
  assert(res10.status === 401 && res10.data?.error === 'unauthorized', '10. Admin API 401 on wrong ADMIN_KEY', `Status ${res10.status}`);

  // 11. Admin API: Correct ADMIN_KEY (200 + Telemetry)
  const res11 = await callHandler(adminVisitorsHandler, {
    method: 'GET',
    headers: {
      authorization: 'Bearer test_admin_key_super_secret_123',
    },
  });
  const hasMetrics = res11.data?.metrics?.total > 0;
  const hasVisitors = Array.isArray(res11.data?.visitors);
  assert(res11.status === 200 && hasMetrics && hasVisitors, '11. Admin API 200 with metrics & visitor records', `Total: ${res11.data?.metrics?.total}`);

  // 12. Privacy self-service delete (/api/visit-delete)
  const res12 = await callHandler(visitDeleteHandler, {
    method: 'POST',
    body: { visitorId: visitorA },
  });
  assert(res12.status === 200 && res12.data?.ok === true, '12. Privacy self-service delete (POST /api/visit-delete)', `Status ${res12.status}`);

  // 13. Admin delete single visitor
  const res13 = await callHandler(adminVisitorsHandler, {
    method: 'DELETE',
    headers: {
      authorization: 'Bearer test_admin_key_super_secret_123',
    },
    query: { visitorId: visitorB },
  });
  assert(res13.status === 200 && res13.data?.ok === true, '13. Admin delete single visitor (DELETE /api/admin-visitors)', `Status ${res13.status}`);

  // 14. Verify visitor is removed from telemetry
  const res14 = await callHandler(adminVisitorsHandler, {
    method: 'GET',
    headers: {
      authorization: 'Bearer test_admin_key_super_secret_123',
    },
  });
  const remainingIds = (res14.data?.visitors || []).map((v) => v.visitorId);
  const deletedCleanly = !remainingIds.includes(visitorA) && !remainingIds.includes(visitorB);
  assert(deletedCleanly, '14. Deleted visitors removed from timeline list', `Remaining: ${remainingIds.length}`);

  console.log(`\n====================================================`);
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`====================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
