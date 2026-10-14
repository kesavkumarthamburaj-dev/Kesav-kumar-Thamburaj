// scripts/test-live-server.js
// Tests the live Vite dev server running at http://localhost:5173

import { randomUUID } from 'crypto';

const BASE_URL = 'http://localhost:5173';
const ADMIN_KEY = 'test_admin_key_super_secret_123';

async function testLiveServer() {
  console.log('Testing live server at:', BASE_URL);

  // 1. Check home page
  const homeRes = await fetch(`${BASE_URL}/`);
  console.log('GET / -> status:', homeRes.status);
  const homeHtml = await homeRes.text();
  const hasNoWelcomeInPrerender = !homeHtml.includes('Hi! What should I call you?');
  console.log('Welcome card not in prerendered HTML:', hasNoWelcomeInPrerender ? 'PASS' : 'FAIL');

  // 2. Check /admin/visitors HTML response
  const adminPageRes = await fetch(`${BASE_URL}/admin/visitors`);
  console.log('GET /admin/visitors -> status:', adminPageRes.status);

  // 3. POST /api/visit with name and consent
  const visitorId = randomUUID();
  const visitRes = await fetch(`${BASE_URL}/api/visit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
      'x-vercel-ip-country': 'IN',
    },
    body: JSON.stringify({
      visitorId,
      name: 'Alex Rivera',
      purpose: 'Packaging project',
      consent: true,
      _hp: '',
    }),
  });
  console.log('POST /api/visit (Alex Rivera) -> status:', visitRes.status);
  const visitData = await visitRes.json();
  console.log('POST /api/visit response:', visitData);

  // 4. POST /api/visit honeypot check
  const hpRes = await fetch(`${BASE_URL}/api/visit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      visitorId: randomUUID(),
      name: 'Bot',
      _hp: 'spam',
    }),
  });
  console.log('POST /api/visit (honeypot) -> status:', hpRes.status, '(Expect 400)');

  // 5. GET /api/admin-visitors with wrong key
  const wrongKeyRes = await fetch(`${BASE_URL}/api/admin-visitors`, {
    headers: { Authorization: 'Bearer invalid_key' },
  });
  console.log('GET /api/admin-visitors (wrong key) -> status:', wrongKeyRes.status, '(Expect 401)');

  // 6. GET /api/admin-visitors with correct key
  const authRes = await fetch(`${BASE_URL}/api/admin-visitors`, {
    headers: { Authorization: `Bearer ${ADMIN_KEY}` },
  });
  console.log('GET /api/admin-visitors (correct key) -> status:', authRes.status, '(Expect 200)');
  const authData = await authRes.json();
  console.log('Telemetry metrics:', authData.metrics);
  console.log('Purpose breakdown:', authData.purposeBreakdown);
  console.log('Visitors recorded count:', authData.visitors?.length);
  const foundAlex = authData.visitors?.some((v) => v.name === 'Alex Rivera');
  console.log('Found "Alex Rivera" in visitor table:', foundAlex ? 'YES' : 'NO');

  // 7. Self-service deletion: POST /api/visit-delete
  const delRes = await fetch(`${BASE_URL}/api/visit-delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ visitorId }),
  });
  console.log('POST /api/visit-delete -> status:', delRes.status);
  const delData = await delRes.json();
  console.log('Deletion response:', delData);

  // 8. Confirm Alex Rivera is removed
  const recheckRes = await fetch(`${BASE_URL}/api/admin-visitors`, {
    headers: { Authorization: `Bearer ${ADMIN_KEY}` },
  });
  const recheckData = await recheckRes.json();
  const stillHasAlex = recheckData.visitors?.some((v) => v.visitorId === visitorId);
  console.log('Visitor data successfully removed from telemetry:', !stillHasAlex ? 'CONFIRMED' : 'FAILED');
}

testLiveServer().catch((e) => console.error('Live test failed:', e));
