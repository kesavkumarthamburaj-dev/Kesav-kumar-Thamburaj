// scripts/test-routing-check.js
async function testRouting() {
  const base = 'http://127.0.0.1:4173';

  console.log('--- SPA Rewrite & Serverless API Routing Test ---');

  const r1 = await fetch(base + '/admin/visitors');
  const t1 = await r1.text();
  console.log('1. Direct GET /admin/visitors:', r1.status, '| HTML with root:', t1.includes('id="root"'));

  const r2 = await fetch(base + '/admin/visitors', { headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } });
  const t2 = await r2.text();
  console.log('2. Reload GET /admin/visitors:', r2.status, '| HTML with root:', t2.includes('id="root"'));

  const r3 = await fetch(base + '/api/admin-visitors');
  const d3 = await r3.json().catch(() => ({}));
  console.log('3. GET /api/admin-visitors:', r3.status, '| Is JSON:', r3.headers.get('content-type')?.includes('application/json'), '| API response:', d3.error);

  const r4 = await fetch(base + '/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  const d4 = await r4.json().catch(() => ({}));
  console.log('4. POST /api/contact:', r4.status, '| Is JSON:', r4.headers.get('content-type')?.includes('application/json'), '| API response:', d4.error);

  const r5 = await fetch(base + '/api/visit', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '198.51.100.55' }, body: '{}' });
  const d5 = await r5.json().catch(() => ({}));
  console.log('5. POST /api/visit:', r5.status, '| Is JSON:', r5.headers.get('content-type')?.includes('application/json'), '| API response:', d5.error);

  const pass = r1.status === 200 && t1.includes('id="root"') &&
               r2.status === 200 && t2.includes('id="root"') &&
               r3.status === 401 && d3.error === 'unauthorized' &&
               r4.status === 400 && d4.error === 'validation' &&
               r5.status === 400 && d5.error === 'validation';

  console.log('\nRouting Verification Result:', pass ? '✅ PASS' : '❌ FAIL');
}

testRouting();
