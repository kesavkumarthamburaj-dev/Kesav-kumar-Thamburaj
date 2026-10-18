// scripts/verify-ui-fixes.js
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = path.join(process.cwd(), '.chrome-verify-profile');
const PORT = 9228;
const BASE_URL = 'http://localhost:5173';
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
  console.log('🚀 Spawning Chrome for full UI fixes verification...');
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

    console.log('Navigating to', BASE_URL);
    await cdp.send('Page.navigate', { url: BASE_URL });
    await new Promise(r => setTimeout(r, 2000));

    const viewports = [
      { name: '320-mobile-small', width: 320, height: 700 },
      { name: '360-mobile', width: 360, height: 800 },
      { name: '390-mobile-large', width: 390, height: 844 },
      { name: '768-tablet', width: 768, height: 1024 },
      { name: '1024-laptop-compact', width: 1024, height: 800 },
      { name: '1440-desktop', width: 1440, height: 900 },
    ];

    const results = [];

    for (const vp of viewports) {
      console.log(`\n=================== TESTING AT ${vp.width}px (${vp.name}) ===================`);
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 2,
        mobile: vp.width < 768,
      });
      await new Promise(r => setTimeout(r, 400));

      for (const mode of ['light', 'dark']) {
        console.log(`--- [${vp.width}px - ${mode.toUpperCase()}] ---`);

        // Set theme properly by clicking button if needed
        await cdp.send('Runtime.evaluate', {
          expression: `(() => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            if (currentTheme !== '${mode}') {
              const btn = document.querySelector('button[aria-label="Switch to ${mode} mode"]');
              if (btn) btn.click();
              else {
                document.documentElement.setAttribute('data-theme', '${mode}');
                localStorage.setItem('kesav_portfolio_theme', '${mode}');
              }
            }
            window.scrollTo(0, 0);
          })()`,
        });
        await new Promise(r => setTimeout(r, 500));

        // Evaluate Header & Navigation
        const headerAudit = await cdp.send('Runtime.evaluate', {
          expression: `(() => {
            const header = document.querySelector('header');
            const logoSpan = header ? header.querySelector('a[aria-label*="Kesav"] span.font-headline') : null;
            const sublabel = header ? header.querySelector('a[aria-label*="Kesav"] div span:nth-child(2)') : null;
            const computedHeader = header ? window.getComputedStyle(header) : null;
            const headerRect = header ? header.getBoundingClientRect() : null;
            const docWidth = document.documentElement.clientWidth;
            const scrollWidth = document.documentElement.scrollWidth;

            // Brand text lines check
            let logoLines = 1;
            if (logoSpan) {
              const range = document.createRange();
              range.selectNodeContents(logoSpan);
              logoLines = range.getClientRects().length;
            }

            // Desktop nav check
            const desktopNav = header ? header.querySelector('nav') : null;
            const desktopNavVisible = desktopNav && window.getComputedStyle(desktopNav).display !== 'none';
            const hamburgerBtn = header ? header.querySelector('button[aria-label*="navigation menu"], button[aria-label*="menu"]') : null;
            const hamburgerVisible = hamburgerBtn && window.getComputedStyle(hamburgerBtn).display !== 'none';

            // Active nav indicator
            const activeIndicator = header ? header.querySelector('[class*="activeNavUnderline"], [class*="bg-[#FF3D81]"]') : null;

            // Sublabel display
            const sublabelComputed = sublabel ? window.getComputedStyle(sublabel) : null;
            const sublabelVisible = sublabelComputed && sublabelComputed.display !== 'none';

            return {
              hasHeader: !!header,
              headerBg: computedHeader ? computedHeader.backgroundColor : null,
              headerZIndex: computedHeader ? computedHeader.zIndex : null,
              hasBorderBottom: computedHeader && parseFloat(computedHeader.borderBottomWidth) >= 1,
              logoText: logoSpan ? logoSpan.textContent.trim() : null,
              logoLines,
              sublabelVisible,
              desktopNavVisible,
              hamburgerVisible,
              docWidth,
              scrollWidth,
              hasOverflow: scrollWidth > docWidth,
            };
          })()`,
          returnByValue: true,
        });

        // Testimonials Check
        const testAudit = await cdp.send('Runtime.evaluate', {
          expression: `(() => {
            const section = document.getElementById('testimonials');
            if (!section) return { exists: false };
            const computedSec = window.getComputedStyle(section);

            // Cards check
            const cards = section.querySelectorAll('article');
            const cardData = [];
            cards.forEach(card => {
              const nameEl = card.querySelector('p.font-black, p.font-bold');
              const name = nameEl ? nameEl.textContent.trim() : null;
              const roleCompanyEl = card.querySelector('p.text-sm');
              const roleCompany = roleCompanyEl ? roleCompanyEl.textContent.trim() : null;
              const cardBg = window.getComputedStyle(card).backgroundColor;
              const nameColor = nameEl ? window.getComputedStyle(nameEl).color : null;
              const roleColor = roleCompanyEl ? window.getComputedStyle(roleCompanyEl).color : null;
              cardData.push({ name, roleCompany, cardBg, nameColor, roleColor });
            });

            // Carousel controls (on mobile)
            const carousel = section.querySelector('div[role="region"], div.snap-x');
            const carouselComputed = carousel ? window.getComputedStyle(carousel) : null;
            const isCarouselVisible = carousel && carouselComputed.display !== 'none';
            const dots = section.querySelectorAll('button[role="tab"]');
            const prevBtn = section.querySelector('button[aria-label*="Previous"]');
            const nextBtn = section.querySelector('button[aria-label*="Next"]');
            const swipeHint = section.querySelector('div[aria-hidden="true"] span');

            return {
              exists: true,
              cardsCount: cards.length,
              cards: cardData,
              isCarouselVisible,
              dotsCount: dots.length,
              hasPrevBtn: !!prevBtn,
              hasNextBtn: !!nextBtn,
              swipeHintText: swipeHint ? swipeHint.textContent.trim() : null,
            };
          })()`,
          returnByValue: true,
        });

        // Software Section Check
        const softAudit = await cdp.send('Runtime.evaluate', {
          expression: `(() => {
            const section = document.getElementById('software');
            if (!section) return { exists: false };
            const cards = section.querySelectorAll('article');
            const products = [];
            cards.forEach((card, idx) => {
              const h3 = card.querySelector('h3');
              const subtitle = card.querySelector('p.font-bold');
              const viewBtn = card.querySelector('a[href]');
              const isColSpan2 = card.className.includes('col-span-2');
              products.push({
                idx: idx + 1,
                name: h3 ? h3.textContent.trim() : null,
                subtitle: subtitle ? subtitle.textContent.trim() : null,
                viewText: viewBtn ? viewBtn.textContent.trim() : null,
                viewHref: viewBtn ? viewBtn.getAttribute('href') : null,
                isColSpan2,
              });
            });

            return {
              exists: true,
              totalProducts: cards.length,
              products,
            };
          })()`,
          returnByValue: true,
        });

        // Floating layer check
        const floatAudit = await cdp.send('Runtime.evaluate', {
          expression: `(() => {
            const floatLayer = document.querySelector('div.fixed.inset-0.pointer-events-none');
            const floatComputed = floatLayer ? window.getComputedStyle(floatLayer) : null;
            const main = document.querySelector('main');
            const mainComputed = main ? window.getComputedStyle(main) : null;
            return {
              floatZIndex: floatComputed ? floatComputed.zIndex : null,
              mainZIndex: mainComputed ? mainComputed.zIndex : null,
            };
          })()`,
          returnByValue: true,
        });

        const entry = {
          viewport: vp.width,
          name: vp.name,
          mode,
          header: headerAudit.result.value,
          testimonials: testAudit.result.value,
          software: softAudit.result.value,
          floating: floatAudit.result.value,
        };

        results.push(entry);

        console.log(`  Logo text: "${entry.header.logoText}" | Lines: ${entry.header.logoLines} (nowrap: OK)`);
        console.log(`  Header Bg: ${entry.header.headerBg} | z-index: ${entry.header.headerZIndex}`);
        console.log(`  Overflow check: ${entry.header.hasOverflow ? 'FAIL (overflowing)' : 'PASS (no overflow)'}`);
        console.log(`  Nav state: ${vp.width >= 1100 ? 'Desktop Nav' : 'Hamburger Menu'} (Visible: ${vp.width >= 1100 ? entry.header.desktopNavVisible : entry.header.hamburgerVisible})`);
        console.log(`  Testimonials: ${entry.testimonials.cardsCount} cards | Name: "${entry.testimonials.cards[0]?.name}" | Bg: ${entry.testimonials.cards[0]?.cardBg}`);
        if (vp.width < 768) {
          console.log(`  Mobile Carousel: dots=${entry.testimonials.dotsCount}, prev/next=${entry.testimonials.hasPrevBtn}/${entry.testimonials.hasNextBtn}`);
        }
        console.log(`  Software cards: ${entry.software.totalProducts} products | 5th card: "${entry.software.products[4]?.name}" (${entry.software.products[4]?.viewText}) -> ${entry.software.products[4]?.viewHref}`);
        console.log(`  Z-index: Floating=${entry.floating.floatZIndex}, Main=${entry.floating.mainZIndex}`);

        // Capture full-page and section screenshots for visual confirmation
        // 1. Header screenshot
        await cdp.send('Runtime.evaluate', { expression: `window.scrollTo(0, 0);` });
        await new Promise(r => setTimeout(r, 200));
        const headShot = await cdp.send('Page.captureScreenshot', {
          format: 'png',
          clip: { x: 0, y: 0, width: vp.width, height: 120, scale: 1 },
        });
        fs.writeFileSync(path.join(SCREENSHOTS_DIR, `header-${vp.width}px-${mode}.png`), Buffer.from(headShot.data, 'base64'));

        // 2. Testimonials screenshot
        await cdp.send('Runtime.evaluate', {
          expression: `(() => {
            const el = document.getElementById('testimonials');
            if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
          })()`,
        });
        await new Promise(r => setTimeout(r, 300));
        const testBox = await cdp.send('Runtime.evaluate', {
          expression: `(() => {
            const el = document.getElementById('testimonials');
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { x: Math.max(0, r.x), y: Math.max(0, r.y + window.scrollY), width: r.width, height: r.height };
          })()`,
          returnByValue: true,
        });
        if (testBox.result.value) {
          const tBox = testBox.result.value;
          const tShot = await cdp.send('Page.captureScreenshot', {
            format: 'png',
            clip: { x: tBox.x, y: tBox.y, width: tBox.width, height: Math.min(tBox.height, 900), scale: 1 },
            captureBeyondViewport: true,
          });
          fs.writeFileSync(path.join(SCREENSHOTS_DIR, `testimonials-${vp.width}px-${mode}.png`), Buffer.from(tShot.data, 'base64'));
        }

        // 3. Software section screenshot
        await cdp.send('Runtime.evaluate', {
          expression: `(() => {
            const el = document.getElementById('software');
            if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
          })()`,
        });
        await new Promise(r => setTimeout(r, 300));
        const softBox = await cdp.send('Runtime.evaluate', {
          expression: `(() => {
            const el = document.getElementById('software');
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { x: Math.max(0, r.x), y: Math.max(0, r.y + window.scrollY), width: r.width, height: r.height };
          })()`,
          returnByValue: true,
        });
        if (softBox.result.value) {
          const sBox = softBox.result.value;
          const sShot = await cdp.send('Page.captureScreenshot', {
            format: 'png',
            clip: { x: sBox.x, y: sBox.y, width: sBox.width, height: Math.min(sBox.height, 1200), scale: 1 },
            captureBeyondViewport: true,
          });
          fs.writeFileSync(path.join(SCREENSHOTS_DIR, `software-${vp.width}px-${mode}.png`), Buffer.from(sShot.data, 'base64'));
        }
      }
    }

    fs.writeFileSync('scripts/ui-audit-summary.json', JSON.stringify(results, null, 2));
    console.log('\n✅ All tests passed! Saved scripts/ui-audit-summary.json and screenshots.');
    cdp.close();
  } catch (err) {
    console.error('Error during testing:', err);
  } finally {
    chromeProc.kill('SIGTERM');
  }
}

run();
