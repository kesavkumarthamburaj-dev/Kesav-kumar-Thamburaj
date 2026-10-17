// scripts/test-api-suite.js
import { randomUUID } from 'crypto';

const BASE = 'http://127.0.0.1:4173';
const ADMIN_KEY = 'test_admin_key_super_secret_123';

async function runApiTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE API TEST SUITE');
  console.log('====================================================\n');

  const results = [];

  async function testCase(suite, name, fn) {
    try {
      const res = await fn();
      results.push({ suite, name, ...res });
      console.log(`[${suite}] ${name} -> Status: ${res.status} | ${res.pass ? '✅ PASS' : '❌ FAIL'} (${res.detail})`);
    } catch (err) {
      results.push({ suite, name, status: 'ERROR', pass: false, detail: err.message });
      console.log(`[${suite}] ${name} -> ❌ EXCEPTION: ${err.message}`);
    }
  }

  // --- /api/contact ---
  console.log('--- Testing /api/contact ---');

  // 1. Invalid email
  await testCase('/api/contact', 'Invalid Email', async () => {
    const res = await fetch(`${BASE}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Kesav Test',
        email: 'invalid-email-address',
        projectType: 'Packaging',
        message: 'This is a test message for testing invalid email handling.',
      }),
    });
    const data = await res.json().catch(() => ({}));
    const pass = res.status === 400 && data.error === 'validation' && !!data.fields?.email;
    return { status: res.status, pass, detail: JSON.stringify(data) };
  });

  // 2. Short message
  await testCase('/api/contact', 'Short Message', async () => {
    const res = await fetch(`${BASE}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Kesav Test',
        email: 'tester@example.com',
        projectType: 'Packaging',
        message: 'Too short',
      }),
    });
    const data = await res.json().catch(() => ({}));
    const pass = res.status === 400 && data.error === 'validation' && !!data.fields?.message;
    return { status: res.status, pass, detail: JSON.stringify(data) };
  });

  // 3. Honeypot
  await testCase('/api/contact', 'Honeypot filled (_hp or honeypot)', async () => {
    const res = await fetch(`${BASE}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Spam Bot',
        email: 'bot@spam.com',
        projectType: 'Packaging',
        message: 'Spam message text over 10 chars',
        _hp: 'gotcha_bot',
      }),
    });
    const data = await res.json().catch(() => ({}));
    const pass = res.status === 200 && data.ok === true;
    return { status: res.status, pass, detail: JSON.stringify(data) };
  });

  // 4. Valid contact submission
  await testCase('/api/contact', 'Valid Submission', async () => {
    const res = await fetch(`${BASE}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Kesav QA Automated',
        email: 'kesav.qa@example.com',
        projectType: 'Packaging',
        message: 'This is a valid portfolio test enquiry verifying endpoint delivery.',
      }),
    });
    const data = await res.json().catch(() => ({}));
    const pass = res.status === 200 && (data.ok === true || data.success === true);
    return { status: res.status, pass, detail: JSON.stringify(data) };
  });

  // --- /api/visit ---
  console.log('\n--- Testing /api/visit ---');

  // 5. Valid visit
  const validUuid = randomUUID();
  await testCase('/api/visit', 'Valid visit', async () => {
    const res = await fetch(`${BASE}/api/visit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0',
        'X-Forwarded-For': '198.51.100.10',
      },
      body: JSON.stringify({
        visitorId: validUuid,
        name: 'QA Visitor',
        purpose: 'Packaging project',
        consent: true,
      }),
    });
    const data = await res.json().catch(() => ({}));
    const pass = res.status === 200 && (data.success === true || data.ok === true);
    return { status: res.status, pass, detail: JSON.stringify(data) };
  });

  // 6. Bad visitorId
  await testCase('/api/visit', 'Bad visitorId', async () => {
    const res = await fetch(`${BASE}/api/visit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0',
        'X-Forwarded-For': '198.51.100.20',
      },
      body: JSON.stringify({
        visitorId: 'invalid-non-uuid-string-1234',
        name: 'Bad ID Visitor',
        purpose: 'Packaging project',
        consent: true,
      }),
    });
    const data = await res.json().catch(() => ({}));
    const pass = res.status === 400 && data.error === 'validation';
    return { status: res.status, pass, detail: JSON.stringify(data) };
  });

  // 7. Rate limit on /api/visit
  await testCase('/api/visit', 'Rate Limit (Trigger >10 requests)', async () => {
    let lastStatus = 200;
    let hitRateLimit = false;
    let lastData = null;
    const testIp = '198.51.100.99';

    // Send 12 requests with unique UUIDs from same client IP
    for (let i = 0; i < 12; i++) {
      const res = await fetch(`${BASE}/api/visit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0',
          'X-Forwarded-For': testIp,
        },
        body: JSON.stringify({
          visitorId: randomUUID(),
          name: `RateLimit Tester ${i}`,
          purpose: 'Just looking around',
          consent: true,
        }),
      });
      lastStatus = res.status;
      lastData = await res.json().catch(() => ({}));
      if (res.status === 429) {
        hitRateLimit = true;
        break;
      }
    }
    const pass = hitRateLimit && lastStatus === 429;
    return { status: lastStatus, pass, detail: JSON.stringify(lastData) };
  });

  // --- /api/admin-visitors ---
  console.log('\n--- Testing /api/admin-visitors ---');

  // 8. No key
  await testCase('/api/admin-visitors', 'No key (no Authorization header)', async () => {
    const res = await fetch(`${BASE}/api/admin-visitors`);
    const data = await res.json().catch(() => ({}));
    const pass = res.status === 401 && data.error === 'unauthorized';
    return { status: res.status, pass, detail: JSON.stringify(data) };
  });

  // 9. Wrong key
  await testCase('/api/admin-visitors', 'Wrong key', async () => {
    const res = await fetch(`${BASE}/api/admin-visitors`, {
      headers: { Authorization: 'Bearer totally_wrong_secret_key' },
    });
    const data = await res.json().catch(() => ({}));
    const pass = res.status === 401 && data.error === 'unauthorized';
    return { status: res.status, pass, detail: JSON.stringify(data) };
  });

  // 10. Correct key
  await testCase('/api/admin-visitors', 'Correct key', async () => {
    const res = await fetch(`${BASE}/api/admin-visitors`, {
      headers: { Authorization: `Bearer ${ADMIN_KEY}` },
    });
    const data = await res.json().catch(() => ({}));
    const pass = res.status === 200 && data.ok === true && Array.isArray(data.visitors);
    return { status: res.status, pass, detail: `Visitors count: ${data.visitors?.length}, Metrics: ${JSON.stringify(data.metrics || {})}` };
  });

  console.log('\n====================================================');
  const allPass = results.every(r => r.pass);
  console.log(allPass ? '🎉 ALL API TESTS PASSED!' : '⚠️ SOME API TESTS FAILED');
  console.log('====================================================');
}

runApiTests();
