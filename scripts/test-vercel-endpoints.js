// scripts/test-vercel-endpoints.js
import http from 'http';

const ports = [3000, 5173, 5174];

async function checkUrl(url) {
  try {
    const res = await fetch(url, { redirect: 'manual' });
    const text = await res.text();
    return {
      url,
      status: res.status,
      ok: res.ok,
      contentType: res.headers.get('content-type'),
      hasRoot: text.includes('id="root"'),
      bodySnippet: text.slice(0, 120),
    };
  } catch (err) {
    return { url, error: err.message };
  }
}

async function run() {
  console.log('Testing ports and endpoints...');
  for (const port of ports) {
    console.log(`\n--- Port ${port} ---`);
    const home = await checkUrl(`http://localhost:${port}/`);
    console.log('GET / :', home);
    const admin = await checkUrl(`http://localhost:${port}/admin/visitors`);
    console.log('GET /admin/visitors :', admin);
  }
}

run();
