// scripts/test-vercel-full.js
import { randomUUID } from 'crypto';

const BASE = 'http://localhost:3000';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 TESTING VERCEL DEV ENDPOINTS & ROUTING');
  console.log('====================================================\n');

  let allPassed = true;

  // 1. Direct GET /
  try {
    const resHome = await fetch(`${BASE}/`);
    const homeHtml = await resHome.text();
    const ok = resHome.status === 200 && homeHtml.includes('id="root"');
    console.log(`1. GET / -> Status: ${resHome.status} | Content-Type: ${resHome.headers.get('content-type')} | ${ok ? '✅ PASS' : '❌ FAIL'}`);
    if (!ok) allPassed = false;
  } catch (e) {
    console.log('1. GET / -> Error:', e.message);
    allPassed = false;
  }

  // 2. Direct GET /admin/visitors (First visit)
  try {
    const resAdmin1 = await fetch(`${BASE}/admin/visitors`);
    const adminHtml1 = await resAdmin1.text();
    const ok = resAdmin1.status === 200 && adminHtml1.includes('id="root"');
    console.log(`2. Direct GET /admin/visitors -> Status: ${resAdmin1.status} | Has root: ${adminHtml1.includes('id="root"')} | ${ok ? '✅ PASS' : '❌ FAIL'}`);
    if (!ok) allPassed = false;
  } catch (e) {
    console.log('2. Direct GET /admin/visitors -> Error:', e.message);
    allPassed = false;
  }

  // 3. Reload GET /admin/visitors (Simulate browser reload)
  try {
    const resAdminReload = await fetch(`${BASE}/admin/visitors`, {
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
    });
    const reloadHtml = await resAdminReload.text();
    const ok = resAdminReload.status === 200 && reloadHtml.includes('id="root"');
    console.log(`3. Reload GET /admin/visitors -> Status: ${resAdminReload.status} | Has root: ${reloadHtml.includes('id="root"')} | ${ok ? '✅ PASS' : '❌ FAIL'}`);
    if (!ok) allPassed = false;
  } catch (e) {
    console.log('3. Reload GET /admin/visitors -> Error:', e.message);
    allPassed = false;
  }

  // 4. Test /api/contact
  try {
    const resContact = await fetch(`${BASE}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    // With empty body, /api/contact should validate and return 400 (validation error)
    const data = await resContact.json().catch(() => ({}));
    const ok = resContact.status === 400 && data.error === 'validation';
    console.log(`4. POST /api/contact (empty payload validation) -> Status: ${resContact.status} (${JSON.stringify(data)}) | ${ok ? '✅ PASS' : '❌ FAIL'}`);
    if (!ok) allPassed = false;
  } catch (e) {
    console.log('4. POST /api/contact -> Error:', e.message);
    allPassed = false;
  }

  // 5. Test /api/visit
  try {
    const visitorId = randomUUID();
    const resVisit = await fetch(`${BASE}/api/visit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
      },
      body: JSON.stringify({
        visitorId,
        name: 'Vercel Test User',
        purpose: 'Brand packaging enquiry',
        consent: true,
        _hp: '',
      }),
    });
    const visitData = await resVisit.json().catch(() => ({}));
    const ok = resVisit.status === 200 && visitData.success === true;
    console.log(`5. POST /api/visit -> Status: ${resVisit.status} | Result: ${JSON.stringify(visitData)} | ${ok ? '✅ PASS' : '❌ FAIL'}`);
    if (!ok) allPassed = false;
  } catch (e) {
    console.log('5. POST /api/visit -> Error:', e.message);
    allPassed = false;
  }

  // 6. Test /api/admin-visitors without key (Expect 401)
  try {
    const resAdminApi = await fetch(`${BASE}/api/admin-visitors`);
    const data = await resAdminApi.json().catch(() => ({}));
    const ok = resAdminApi.status === 401;
    console.log(`6. GET /api/admin-visitors (no key) -> Status: ${resAdminApi.status} (Expect 401) | ${ok ? '✅ PASS' : '❌ FAIL'}`);
    if (!ok) allPassed = false;
  } catch (e) {
    console.log('6. GET /api/admin-visitors -> Error:', e.message);
    allPassed = false;
  }

  console.log('\n====================================================');
  console.log(allPassed ? '🎉 ALL TESTS PASSED!' : '❌ SOME TESTS FAILED');
  console.log('====================================================');
}

runTests();
