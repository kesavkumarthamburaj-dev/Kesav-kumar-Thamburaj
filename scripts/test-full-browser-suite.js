// scripts/test-full-browser-suite.js
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = path.join(process.cwd(), '.chrome-full-suite-profile');
const PORT = 9224;
const BASE_URL = 'http://127.0.0.1:4173';
const ADMIN_KEY = 'test_admin_key_super_secret_123';

function cleanDir(dir) {
  try {
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}

async function getWsUrl() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) {
        const data = await res.json();
        return data.webSocketDebuggerUrl;
      }
    } catch {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  throw new Error('Chrome CDP port not ready');
}

class CdpClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.pending = new Map();
    this.eventHandlers = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id !== undefined && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        } else if (msg.method) {
          const handlers = this.eventHandlers.get(msg.method) || [];
          for (const h of handlers) h(msg.params);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.id;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, handler) {
    if (!this.eventHandlers.has(method)) this.eventHandlers.set(method, []);
    this.eventHandlers.get(method).push(handler);
  }

  close() {
    try { this.ws.close(); } catch {}
  }
}

async function runFullSuite() {
  cleanDir(USER_DATA_DIR);
  console.log('====================================================');
  console.log('🚀 RUNNING END-TO-END BROWSER SUITE (CHROME HEADLESS)');
  console.log('====================================================\n');

  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${USER_DATA_DIR}`,
    'about:blank',
  ]);

  try {
    const wsUrl = await getWsUrl();
    const targetRes = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' });
    const target = await targetRes.json();
    const cdp = new CdpClient(target.webSocketDebuggerUrl);
    await cdp.connect();

    const consoleErrors = [];
    const failedRequests = [];
    const networkPosts = [];

    await cdp.send('Network.enable');
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    cdp.on('Runtime.consoleAPICalled', (params) => {
      if (params.type === 'error') {
        const text = params.args.map(a => a.value || a.description || '').join(' ');
        consoleErrors.push(text);
        console.error('  [Console Error]:', text);
      }
    });

    cdp.on('Network.requestWillBeSent', (params) => {
      if (params.request.method === 'POST') {
        networkPosts.push({ url: params.request.url, postData: params.request.postData });
      }
    });

    cdp.on('Network.responseReceived', (params) => {
      const url = params.response.url;
      const status = params.response.status;
      if (status >= 400 && !url.includes('/api/')) {
        failedRequests.push({ url, status });
      }
    });

    // ----------------------------------------------------
    // TEST 1: HOME PAGE AT 1440px
    // ----------------------------------------------------
    console.log('--- 1. Testing Home Page at 1440px (Desktop) ---');
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await cdp.send('Page.navigate', { url: BASE_URL });
    await new Promise(r => setTimeout(r, 2000));

    // Check Testimonials is hidden when empty
    const checkTestimonials = await cdp.send('Runtime.evaluate', {
      expression: `({
        sectionExists: document.getElementById('testimonials') !== null,
        navHasKindWords: Array.from(document.querySelectorAll('nav button, nav a')).some(el => el.textContent.toLowerCase().includes('kind words')),
      })`,
      returnByValue: true,
    });
    console.log('Testimonials section in DOM (expect false):', checkTestimonials.result.value.sectionExists);
    console.log('Nav contains Kind Words (expect false):', checkTestimonials.result.value.navHasKindWords);

    // Check LinkedIn is visible and links correctly
    const checkLinkedIn = await cdp.send('Runtime.evaluate', {
      expression: `({
        linkedInBtnInContact: document.querySelector('a[aria-label*="LinkedIn" i]') !== null,
        linkedInHref: document.querySelector('a[aria-label*="LinkedIn" i]')?.href,
        schemaHasLinkedIn: (document.getElementById('json-ld-schema')?.textContent || '').includes('https://www.linkedin.com/in/kesavkumart/'),
      })`,
      returnByValue: true,
    });
    console.log('LinkedIn button in DOM (expect true):', checkLinkedIn.result.value.linkedInBtnInContact);
    console.log('LinkedIn href:', checkLinkedIn.result.value.linkedInHref);
    console.log('Schema has LinkedIn (expect true):', checkLinkedIn.result.value.schemaHasLinkedIn);

    // ----------------------------------------------------
    // TEST 2: THEME TOGGLE (LIGHT & DARK)
    // ----------------------------------------------------
    console.log('\n--- 2. Testing Theme Toggle (Both Modes) ---');
    const toggle1 = await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.querySelector('button[aria-label*="theme" i], button[aria-label*="mode" i], button[title*="theme" i]');
        btn?.click();
        return document.documentElement.getAttribute('data-theme');
      })()`,
      returnByValue: true,
    });
    console.log('Theme after 1st toggle:', toggle1.result.value);

    await new Promise(r => setTimeout(r, 300));
    const toggle2 = await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.querySelector('button[aria-label*="theme" i], button[aria-label*="mode" i], button[title*="theme" i]');
        btn?.click();
        return document.documentElement.getAttribute('data-theme');
      })()`,
      returnByValue: true,
    });
    console.log('Theme after 2nd toggle (switch back):', toggle2.result.value);

    // ----------------------------------------------------
    // TEST 3: RESPONSIVE VIEWPORTS (768px & 360px)
    // ----------------------------------------------------
    console.log('\n--- 3. Testing Viewports (768px Tablet & 360px Mobile) ---');
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 768, height: 1024, deviceScaleFactor: 2, mobile: true });
    await new Promise(r => setTimeout(r, 800));
    const tabletEval = await cdp.send('Runtime.evaluate', {
      expression: '({ width: window.innerWidth, overflowX: document.documentElement.scrollWidth > window.innerWidth })',
      returnByValue: true,
    });
    console.log('Tablet (768px):', tabletEval.result.value);

    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 360, height: 640, deviceScaleFactor: 3, mobile: true });
    await new Promise(r => setTimeout(r, 800));
    const mobileEval = await cdp.send('Runtime.evaluate', {
      expression: '({ width: window.innerWidth, overflowX: document.documentElement.scrollWidth > window.innerWidth })',
      returnByValue: true,
    });
    console.log('Mobile (360px):', mobileEval.result.value);

    // ----------------------------------------------------
    // TEST 4: DIRECT GET /admin/visitors & RELOAD
    // ----------------------------------------------------
    console.log('\n--- 4. Testing /admin/visitors Direct & Reload SPA Routing ---');
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await cdp.send('Page.navigate', { url: `${BASE_URL}/admin/visitors` });
    await new Promise(r => setTimeout(r, 2000));

    const adminPage1 = await cdp.send('Runtime.evaluate', {
      expression: `({
        hasHeading: document.querySelector('h1')?.textContent,
        hasInput: document.getElementById('admin-key-input') !== null,
        metaRobots: document.querySelector('meta[name="robots"]')?.getAttribute('content'),
      })`,
      returnByValue: true,
    });
    console.log('Direct visit /admin/visitors:', adminPage1.result.value);

    // Reload page
    await cdp.send('Page.reload');
    await new Promise(r => setTimeout(r, 2000));

    const adminPage2 = await cdp.send('Runtime.evaluate', {
      expression: `({
        hasHeading: document.querySelector('h1')?.textContent,
        hasInput: document.getElementById('admin-key-input') !== null,
      })`,
      returnByValue: true,
    });
    console.log('Reload /admin/visitors:', adminPage2.result.value);

    // ----------------------------------------------------
    // TEST 5: DASHBOARD AUTH (WRONG KEY & CORRECT KEY)
    // ----------------------------------------------------
    console.log('\n--- 5. Testing Dashboard Auth (Wrong Key -> 401 & Correct Key -> 200) ---');

    // Test Wrong Key
    const wrongKeyResult = await cdp.send('Runtime.evaluate', {
      expression: `(async () => {
        const input = document.getElementById('admin-key-input');
        input.value = 'wrong_secret_key';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        const form = input.closest('form');
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        await new Promise(r => setTimeout(r, 1200));
        return {
          errorText: document.querySelector('.bg-pink\\/20')?.textContent?.trim() || '',
          unlocked: document.querySelector('table, [aria-label*="visitor" i]') !== null,
        };
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });
    console.log('Wrong key result:', wrongKeyResult.result.value);

    // Test Correct Key
    const correctKeyResult = await cdp.send('Runtime.evaluate', {
      expression: `(async () => {
        const input = document.getElementById('admin-key-input');
        input.value = '${ADMIN_KEY}';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        const form = input.closest('form');
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        await new Promise(r => setTimeout(r, 2000));
        return {
          unlocked: document.querySelector('table') !== null || document.querySelector('button[title*="CSV" i], button:has(svg)') !== null,
          hasMetrics: document.body.textContent.includes('TOTAL VISITS') || document.body.textContent.includes('UNIQUE VISITORS'),
          hasExportBtn: Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Export') || b.textContent.includes('CSV')),
          hasDeleteBtn: document.querySelector('button[aria-label*="delete" i], button:has(svg.lucide-trash-2)') !== null,
        };
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });
    console.log('Correct key result (Dashboard Unlocked):', correctKeyResult.result.value);

    console.log('\n--- 6. Test Suite Final Summary ---');
    console.log('Console errors count:', consoleErrors.length);
    console.log('Failed non-API network requests:', failedRequests.length);

    cdp.close();
  } finally {
    try { chromeProc.kill('SIGKILL'); } catch {}
    cleanDir(USER_DATA_DIR);
  }
}

runFullSuite().catch(err => {
  console.error('Fatal suite failure:', err);
  process.exit(1);
});
