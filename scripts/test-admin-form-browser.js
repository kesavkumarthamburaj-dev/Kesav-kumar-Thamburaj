import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = path.join(process.cwd(), '.chrome-temp-admin-form');
const PORT = 9226;
const ADMIN_KEY = 'test_admin_key_super_secret_123';

function cleanDir(dir) {
  try { if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true }); } catch {}
}

cleanDir(USER_DATA_DIR);
const proc = spawn(CHROME_PATH, [
  `--remote-debugging-port=${PORT}`,
  '--headless=new',
  '--disable-gpu',
  `--user-data-dir=${USER_DATA_DIR}`,
  'about:blank',
]);

async function testAuth() {
  await new Promise(r => setTimeout(r, 1500));
  const v = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
  const target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 0;
  const send = (method, params = {}) => new Promise((resolve) => {
    const curId = ++id;
    const h = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id === curId) { ws.removeEventListener('message', h); resolve(msg.result); }
    };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await send('Page.navigate', { url: 'http://127.0.0.1:4173/admin/visitors' });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Enter wrong key
  await send('Runtime.evaluate', {
    expression: `(() => {
      const input = document.getElementById('admin-key-input');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, 'invalid_key_attempt');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      const btn = document.querySelector('button[type="submit"]');
      btn.click();
    })()`,
  });
  await new Promise(r => setTimeout(r, 1200));

  const checkWrong = await send('Runtime.evaluate', {
    expression: 'document.body.innerText',
    returnByValue: true,
  });
  const textWrong = checkWrong.result.value;
  const hasError = textWrong.includes('Unauthorized') || textWrong.includes('Incorrect');
  console.log('1. Wrong key triggers error message:', hasError, `(Text: "${textWrong.match(/Unauthorized[^\n]+/)?.[0] || 'none'}")`);

  // 2. Enter correct key
  await send('Runtime.evaluate', {
    expression: `(() => {
      const input = document.getElementById('admin-key-input');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, '${ADMIN_KEY}');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      const btn = document.querySelector('button[type="submit"]');
      btn.click();
    })()`,
  });
  await new Promise(r => setTimeout(r, 2000));

  const checkUnlocked = await send('Runtime.evaluate', {
    expression: `({
      hasHeading: document.body.innerText.includes('VISITOR TELEMETRY') || document.body.innerText.includes('TELEMETRY'),
      hasExport: document.body.innerText.includes('Export CSV'),
      hasTotalVisits: document.body.innerText.includes('TOTAL VISITS') || document.body.innerText.includes('Total'),
      hasPurposes: document.body.innerText.includes('Packaging') || document.body.innerText.includes('Purposes') || document.body.innerText.includes('PURPOSE BREAKDOWN'),
      hasVisitorsTable: document.querySelector('table') !== null,
    })`,
    returnByValue: true,
  });
  console.log('2. Correct key unlocks dashboard:', checkUnlocked.result.value);

  ws.close();
  proc.kill('SIGKILL');
  cleanDir(USER_DATA_DIR);
}

testAuth().catch(e => {
  console.error(e);
  try { proc.kill('SIGKILL'); } catch {}
  cleanDir(USER_DATA_DIR);
});
