// scripts/screenshot-arsenal-chips.js
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = path.join(process.cwd(), '.chrome-arsenal-profile');
const PORT = 9225;
const BASE_URL = 'http://localhost:5173';
const ARTIFACTS_DIR = 'C:\\Users\\DELL\\.gemini\\antigravity-ide\\brain\\dd8225c0-cffa-4e2a-8b11-51e914fd41c9';
const SCREENSHOTS_DIR = path.join(process.cwd(), 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

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
      await new Promise(r => setTimeout(r, 400));
    }
  }
  throw new Error('Chrome remote debugging port not ready');
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

async function run() {
  cleanDir(USER_DATA_DIR);
  console.log('🚀 Spawning Chrome for Arsenal visual verification...');
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

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('DOM.enable');

    const consoleLogs = [];
    cdp.on('Runtime.consoleAPICalled', (params) => {
      const text = params.args.map(a => a.value || a.description || '').join(' ');
      consoleLogs.push({ type: params.type, text });
      if (params.type === 'warn' || params.type === 'error') {
        console.log(`[Browser ${params.type}]:`, text);
      }
    });

    console.log('Navigating to', BASE_URL);
    await cdp.send('Page.navigate', { url: BASE_URL });
    await new Promise(r => setTimeout(r, 2000));

    const viewports = [
      { name: '1440-desktop', width: 1440, height: 1000 },
      { name: '360-mobile', width: 360, height: 800 },
    ];

    const results = {};

    for (const vp of viewports) {
      console.log(`\n=================== TESTING AT ${vp.width}px (${vp.name}) ===================`);
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 2,
        mobile: vp.width < 768,
      });
      await new Promise(r => setTimeout(r, 500));

      for (const mode of ['light', 'dark']) {
        console.log(`\n--- Mode: ${mode.toUpperCase()} (${vp.width}px) ---`);
        await cdp.send('Runtime.evaluate', {
          expression: `(() => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            if (currentTheme !== '${mode}') {
              const btn = document.querySelector('button[aria-label="Switch to ${mode} mode"]');
              if (btn) {
                btn.click();
              } else {
                document.documentElement.setAttribute('data-theme', '${mode}');
                localStorage.setItem('kesav_portfolio_theme', '${mode}');
              }
            }
            const arsenalSec = document.getElementById('arsenal');
            if (arsenalSec) {
              arsenalSec.scrollIntoView({ behavior: 'instant', block: 'start' });
            }
          })()`,
        });
        await new Promise(r => setTimeout(r, 1000));

        // Capture Arsenal section screenshot
        const evalBox = await cdp.send('Runtime.evaluate', {
          expression: `(() => {
            const el = document.getElementById('arsenal');
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { x: Math.max(0, r.x), y: Math.max(0, r.y + window.scrollY), width: r.width, height: r.height };
          })()`,
          returnByValue: true,
        });

        const box = evalBox.result.value;
        if (box) {
          const shot = await cdp.send('Page.captureScreenshot', {
            format: 'png',
            clip: {
              x: box.x,
              y: box.y,
              width: box.width,
              height: box.height,
              scale: 1,
            },
            captureBeyondViewport: true,
          });
          const shotPath = path.join(SCREENSHOTS_DIR, `arsenal-${vp.name}-${mode}.png`);
          fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
          console.log(`Saved screenshot: ${shotPath}`);

          // Also copy to artifacts directory
          try {
            const artShotPath = path.join(ARTIFACTS_DIR, `arsenal-${vp.name}-${mode}.png`);
            fs.writeFileSync(artShotPath, Buffer.from(shot.data, 'base64'));
          } catch {}
        }

        // Audit all 22 chips
        const auditRes = await cdp.send('Runtime.evaluate', {
          expression: `(() => {
            const section = document.getElementById('arsenal');
            if (!section) return { error: 'Arsenal section not found' };

            // Find all columns
            const columns = [];
            const colHeaders = section.querySelectorAll('h3');
            colHeaders.forEach(h => {
              const colTitle = h.textContent.trim();
              const colCard = h.closest('.border-2\\\\.5, [class*="border"]') || h.parentElement.parentElement.parentElement;
              columns.push({ title: colTitle, card: colCard });
            });

            // Find all tool chips inside arsenal
            const chips = [];
            const chipEls = section.querySelectorAll('.group.rounded-xl');
            chipEls.forEach((chip) => {
              const labelEl = chip.querySelector('span.font-mono');
              const name = labelEl ? labelEl.textContent.trim() : 'UNKNOWN';
              const logoTile = chip.querySelector('div.w-10.h-10');
              const img = logoTile ? logoTile.querySelector('img') : null;
              const fallback = logoTile && !img ? logoTile.textContent.trim() : null;
              const tileComputed = logoTile ? window.getComputedStyle(logoTile) : null;
              const tileBg = tileComputed ? tileComputed.backgroundColor : 'unknown';
              const tileBorder = tileComputed ? tileComputed.borderColor : 'unknown';

              chips.push({
                name,
                hasTile: !!logoTile,
                tileBg,
                tileBorder,
                isImg: !!img,
                imgSrc: img ? img.getAttribute('src') : null,
                imgNaturalWidth: img ? img.naturalWidth : 0,
                imgNaturalHeight: img ? img.naturalHeight : 0,
                imgComplete: img ? img.complete : false,
                fallbackLetter: fallback,
              });
            });

            return { chipsCount: chips.length, chips };
          })()`,
          returnByValue: true,
        });

        const data = auditRes.result.value;
        results[`${vp.name}-${mode}`] = data;
        console.log(`Found ${data.chipsCount} chips in ${vp.name} (${mode})`);
        data.chips.forEach(c => {
          const status = c.isImg && c.imgNaturalWidth > 0 ? 'IMG_OK' : (c.fallbackLetter ? `FALLBACK_${c.fallbackLetter}` : 'ERROR');
          console.log(`  - [${status}] ${c.name.padEnd(16)} | TileBg: ${c.tileBg.padEnd(18)} | Img: ${c.imgNaturalWidth}x${c.imgNaturalHeight}`);
        });
      }
    }

    fs.writeFileSync('scripts/arsenal-audit-results.json', JSON.stringify(results, null, 2));
    console.log('\nAudit complete! Saved scripts/arsenal-audit-results.json');
    cdp.close();
  } catch (err) {
    console.error('Error during testing:', err);
  } finally {
    chromeProc.kill('SIGTERM');
  }
}

run();
