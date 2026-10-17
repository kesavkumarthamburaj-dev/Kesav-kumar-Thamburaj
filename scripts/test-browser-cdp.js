// scripts/test-browser-cdp.js
import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = path.join(process.cwd(), '.chrome-test-profile');
const PORT = 9222;
const BASE_URL = 'http://127.0.0.1:4173';

function cleanDir(dir) {
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
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
  throw new Error('Chrome remote debugging port not ready in 15 seconds');
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

async function runTests() {
  cleanDir(USER_DATA_DIR);
  console.log('🚀 Spawning Chrome at:', CHROME_PATH);
  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${USER_DATA_DIR}`,
    'about:blank',
  ]);

  chromeProc.on('error', (err) => {
    console.error('Failed to spawn Chrome:', err);
  });

  try {
    const wsUrl = await getWsUrl();
    console.log('Connected to Chrome CDP:', wsUrl);

    // Create target page
    const targetRes = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' });
    const target = await targetRes.json();
    const cdp = new CdpClient(target.webSocketDebuggerUrl);
    await cdp.connect();

    // Setup logging
    const consoleErrors = [];
    const failedRequests = [];
    const loadedLogos = new Set();

    await cdp.send('Network.enable');
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    cdp.on('Runtime.consoleAPICalled', (params) => {
      if (params.type === 'error') {
        const text = params.args.map(a => a.value || a.description || '').join(' ');
        consoleErrors.push(text);
        console.error(' [Browser Console Error]:', text);
      }
    });

    cdp.on('Network.responseReceived', (params) => {
      const url = params.response.url;
      const status = params.response.status;
      if (url.includes('/logos/')) {
        const logoName = url.split('/logos/')[1]?.split('?')[0];
        if (status === 200) loadedLogos.add(logoName);
      }
      if (status >= 400 && !url.includes('/api/')) {
        failedRequests.push({ url, status });
        console.error(` [Failed Request]: ${status} ${url}`);
      }
    });

    // 1. Test at 1440px desktop
    console.log('\n--- 1. Testing at 1440px (Desktop) ---');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    await cdp.send('Page.navigate', { url: BASE_URL });
    await new Promise(r => setTimeout(r, 2000));

    const titleEval = await cdp.send('Runtime.evaluate', { expression: 'document.title' });
    console.log('Page Title:', titleEval.result.value);

    const themeEval = await cdp.send('Runtime.evaluate', { expression: 'document.documentElement.getAttribute("data-theme")' });
    console.log('Initial Theme:', themeEval.result.value);

    // Test Theme Toggle
    console.log('\n--- 2. Testing Theme Toggle ---');
    // Find theme toggle button and click it
    const toggleClick = await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.querySelector('button[aria-label*="theme" i], button[aria-label*="mode" i], button[title*="theme" i]') ||
                    Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Theme') || b.querySelector('svg'));
        if (btn) {
          btn.click();
          return { clicked: true, newTheme: document.documentElement.getAttribute('data-theme') };
        }
        return { clicked: false };
      })()`,
      returnByValue: true,
    });
    console.log('Theme toggle click 1:', toggleClick.result.value);

    await new Promise(r => setTimeout(r, 300));
    // Click toggle again
    const toggleClick2 = await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.querySelector('button[aria-label*="theme" i], button[aria-label*="mode" i], button[title*="theme" i]') ||
                    Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Theme') || b.querySelector('svg'));
        if (btn) {
          btn.click();
          return { clicked: true, newTheme: document.documentElement.getAttribute('data-theme') };
        }
        return { clicked: false };
      })()`,
      returnByValue: true,
    });
    console.log('Theme toggle click 2 (switch back):', toggleClick2.result.value);

    // 3. Test at 768px tablet
    console.log('\n--- 3. Testing at 768px (Tablet) ---');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 768,
      height: 1024,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await new Promise(r => setTimeout(r, 1000));
    const tabletEval = await cdp.send('Runtime.evaluate', {
      expression: `({
        innerWidth: window.innerWidth,
        hasOverflowX: document.documentElement.scrollWidth > window.innerWidth,
      })`,
      returnByValue: true,
    });
    console.log('Tablet metrics:', tabletEval.result.value);

    // 4. Test at 360px mobile
    console.log('\n--- 4. Testing at 360px (Mobile) ---');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 360,
      height: 640,
      deviceScaleFactor: 3,
      mobile: true,
    });
    await new Promise(r => setTimeout(r, 1000));
    const mobileEval = await cdp.send('Runtime.evaluate', {
      expression: `({
        innerWidth: window.innerWidth,
        hasOverflowX: document.documentElement.scrollWidth > window.innerWidth,
      })`,
      returnByValue: true,
    });
    console.log('Mobile metrics:', mobileEval.result.value);

    // 5. Scroll down to trigger lazy loading of all sections and logos
    console.log('\n--- 5. Scrolling to Arsenal section & testing logo loads ---');
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const arsenal = document.getElementById('arsenal');
        if (arsenal) arsenal.scrollIntoView();
        else window.scrollTo(0, document.body.scrollHeight);
      })()`,
    });
    await new Promise(r => setTimeout(r, 2000));

    // Scroll to bottom
    await cdp.send('Runtime.evaluate', { expression: 'window.scrollTo(0, document.body.scrollHeight);' });
    await new Promise(r => setTimeout(r, 2000));

    // Check images in DOM
    const imagesAudit = await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        const issues = [];
        imgs.forEach(img => {
          const src = img.getAttribute('src');
          const alt = img.getAttribute('alt');
          const width = img.getAttribute('width');
          const height = img.getAttribute('height');
          const naturalWidth = img.naturalWidth;
          const complete = img.complete;
          if (alt === null || alt === undefined) issues.push({ src, reason: 'missing alt' });
          if (!width || !height) issues.push({ src, reason: 'missing width/height' });
          if (complete && naturalWidth === 0) issues.push({ src, reason: 'broken image (naturalWidth 0)' });
        });
        return { totalImgs: imgs.length, issues };
      })()`,
      returnByValue: true,
    });
    console.log('DOM Images Audit:', imagesAudit.result.value);

    // Check Reduced Motion OFF animation check
    console.log('\n--- 6. Reduced Motion OFF Animation check ---');
    const motionCheck = await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const motionMatch = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        // Check if HeroOrbit / Framer motion has active animated transform or elements
        const animatedElements = document.querySelectorAll('[style*="transform"], [style*="rotate"]');
        return {
          prefersReducedMotion: motionMatch,
          animatedElementsCount: animatedElements.length,
        };
      })()`,
      returnByValue: true,
    });
    console.log('Motion status:', motionCheck.result.value);

    console.log('\n--- Logos Loaded Count ---');
    console.log(`Loaded ${loadedLogos.size} logos:`, Array.from(loadedLogos));

    console.log('\n--- Summary ---');
    console.log('Console errors count:', consoleErrors.length);
    console.log('Failed requests count:', failedRequests.length);

    cdp.close();
  } finally {
    try {
      chromeProc.kill('SIGKILL');
    } catch {}
    cleanDir(USER_DATA_DIR);
  }
}

runTests().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
