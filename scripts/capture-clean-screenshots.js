// scripts/capture-clean-screenshots.js
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = path.join(process.cwd(), '.chrome-temp-shots');
const PORT = 9228;
const BASE_URL = 'http://localhost:5173';
const ARTIFACTS_DIR = 'C:\\Users\\DELL\\.gemini\\antigravity-ide\\brain\\dd8225c0-cffa-4e2a-8b11-51e914fd41c9';

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
  throw new Error('Chrome remote debugging port not ready');
}

class CdpClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.pending = new Map();
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
        }
      };
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result?.value;
  }

  close() {
    try { this.ws.close(); } catch {}
  }
}

async function run() {
  cleanDir(USER_DATA_DIR);
  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--headless=new',
    '--disable-gpu',
    '--window-size=1200,900',
  ]);

  try {
    await getWsUrl();
    const targetRes = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' });
    const target = await targetRes.json();
    const client = new CdpClient(target.webSocketDebuggerUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Network.enable');
    await client.send('Network.setCacheDisabled', { cacheDisabled: true });
    await client.send('Page.navigate', { url: `${BASE_URL}/` });
    await new Promise(r => setTimeout(r, 2000));

    async function waitForTestimonials() {
      for (let i = 0; i < 20; i++) {
        const found = await client.eval(`!!document.getElementById('testimonials')`);
        if (found) return;
        await new Promise(r => setTimeout(r, 300));
      }
      throw new Error('Testimonials section not found in 6s');
    }

    await waitForTestimonials();

    const viewports = [
      { width: 320, height: 740, name: '320px' },
      { width: 360, height: 800, name: '360px' },
      { width: 390, height: 844, name: '390px' },
      { width: 412, height: 915, name: '412px' },
    ];

    const modes = ['light', 'dark'];

    for (const vp of viewports) {
      for (const mode of modes) {
        await client.send('Emulation.setDeviceMetricsOverride', {
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: 2,
          mobile: true,
        });

        // Set theme mode and dismiss welcome modal
        await client.eval(`
          (() => {
            // Dismiss welcome modal
            const skipBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'SKIP');
            if (skipBtn) skipBtn.click();
            const closeBtn = document.querySelector('button[aria-label*="close" i], button[aria-label*="Close" i]');
            if (closeBtn) closeBtn.click();

            const isDarkWanted = ${mode === 'dark'};
            const btn = document.querySelector('button[aria-label^="Switch to"]');
            if (btn) {
              const label = btn.getAttribute('aria-label');
              const isCurrentlyDark = label.includes('light');
              if (isCurrentlyDark !== isDarkWanted) btn.click();
            }
          })()
        `);
        await new Promise(r => setTimeout(r, 600));

        // Scroll carousel into view
        await client.eval(`
          (() => {
            const sec = document.getElementById('testimonials');
            if (sec) sec.scrollIntoView({ behavior: 'instant', block: 'center' });
          })()
        `);
        await new Promise(r => setTimeout(r, 500));

        // Get coordinates relative to page
        const clip = await client.eval(`
          (() => {
            const sec = document.getElementById('testimonials');
            const rect = sec.getBoundingClientRect();
            return {
              x: 0,
              y: window.scrollY + rect.top,
              width: window.innerWidth,
              height: Math.min(rect.height, 900),
            };
          })()
        `);

        const screenshotRes = await client.send('Page.captureScreenshot', {
          format: 'png',
          clip: {
            x: clip.x,
            y: clip.y,
            width: clip.width,
            height: clip.height,
            scale: 1,
          },
          captureBeyondViewport: true,
        });

        const filename = `testimonials-carousel-${vp.name}-${mode}.png`;
        const filepath = path.join(ARTIFACTS_DIR, filename);
        fs.writeFileSync(filepath, Buffer.from(screenshotRes.data, 'base64'));
        console.log(`Saved screenshot: ${filename} (w=${clip.width}, h=${clip.height})`);
      }
    }

    client.close();
  } finally {
    try { chromeProc.kill(); } catch {}
    cleanDir(USER_DATA_DIR);
  }
}

run().catch(console.error);
