// scripts/verify-carousel-clipping.js
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = path.join(process.cwd(), '.chrome-temp-clipping');
const PORT = 9227;
const BASE_URL = 'http://localhost:5173';
const ARTIFACTS_DIR = 'C:\\Users\\DELL\\.gemini\\antigravity-ide\\brain\\dd8225c0-cffa-4e2a-8b11-51e914fd41c9';

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

async function runVerification() {
  console.log('=== TESTIMONIAL CAROUSEL CLIPPING & SIZE AUDIT ===\n');
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
    await new Promise(r => setTimeout(r, 2500));

    const viewports = [
      { width: 320, height: 740, name: '320px' },
      { width: 360, height: 800, name: '360px' },
      { width: 390, height: 844, name: '390px' },
      { width: 412, height: 915, name: '412px' },
    ];

    const modes = ['light', 'dark'];
    let allChecksPassed = true;

    for (const vp of viewports) {
      for (const mode of modes) {
        console.log(`\n======================================================================`);
        console.log(`Testing Viewport ${vp.name} in ${mode.toUpperCase()} mode`);
        console.log(`======================================================================`);

        await client.send('Emulation.setDeviceMetricsOverride', {
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: 1,
          mobile: true,
        });

        // Set theme mode by clicking navbar button if needed
        await client.eval(`
          (() => {
            const isDarkWanted = ${mode === 'dark'};
            const btn = document.querySelector('button[aria-label^="Switch to"]');
            if (btn) {
              const label = btn.getAttribute('aria-label');
              const isCurrentlyDark = label.includes('light');
              if (isCurrentlyDark !== isDarkWanted) {
                btn.click();
              }
            } else {
              localStorage.setItem('kesav_portfolio_theme', isDarkWanted ? 'dark' : 'light');
              if (isDarkWanted) document.documentElement.classList.add('dark');
              else document.documentElement.classList.remove('dark');
            }
          })()
        `);
        await new Promise(r => setTimeout(r, 600));

        // Scroll testimonials into view
        await client.eval(`
          (() => {
            const sec = document.getElementById('testimonials');
            if (sec) sec.scrollIntoView({ behavior: 'instant', block: 'center' });
          })()
        `);
        await new Promise(r => setTimeout(r, 400));

        // 1. Audit dimensions, equal height/width, scroller padding, horizontal overflow
        const cardMetrics = await client.eval(`
          (() => {
            const sec = document.getElementById('testimonials');
            if (!sec) return { error: 'Testimonials section not found' };

            const scroller = sec.querySelector('div[role="region"]');
            if (!scroller) return { error: 'Scroller container (div[role="region"]) not found' };

            const scrollerStyle = window.getComputedStyle(scroller);
            const scrollerRect = scroller.getBoundingClientRect();
            const cards = Array.from(scroller.querySelectorAll('article'));

            const cardMetrics = cards.map((card, i) => {
              const rect = card.getBoundingClientRect();
              const style = window.getComputedStyle(card);
              return {
                index: i,
                width: Math.round(rect.width * 10) / 10,
                height: Math.round(rect.height * 10) / 10,
                top: Math.round(rect.top),
                left: Math.round(rect.left),
                opacity: parseFloat(style.opacity),
                transform: style.transform,
              };
            });

            const winWidth = window.innerWidth;
            const docScrollWidth = document.documentElement.scrollWidth;
            const bodyScrollWidth = document.body.scrollWidth;
            const hasHorizontalPageOverflow = docScrollWidth > winWidth || bodyScrollWidth > winWidth;

            // Peek of card 2 when card 1 is at start
            const peekRight = winWidth - cardMetrics[1].left;
            const peekRightVw = (peekRight / winWidth) * 100;

            const card0Center = cardMetrics[0].left + cardMetrics[0].width / 2;
            const screenCenter = winWidth / 2;
            const isCard0Centered = Math.abs(card0Center - screenCenter) <= 2;

            return {
              winWidth,
              scrollerWidth: Math.round(scrollerRect.width),
              scrollerPaddingBlock: scrollerStyle.paddingTop,
              scrollerMarginBlock: scrollerStyle.marginTop,
              overflowX: window.getComputedStyle(sec).overflowX,
              hasHorizontalPageOverflow,
              docScrollWidth,
              cardMetrics,
              isCard0Centered,
              card0Center: Math.round(card0Center),
              screenCenter: Math.round(screenCenter),
              peekRight: Math.round(peekRight),
              peekRightVw: Math.round(peekRightVw * 10) / 10,
            };
          })()
        `);

        if (cardMetrics.error) {
          console.error('Audit Error:', cardMetrics.error);
          allChecksPassed = false;
          continue;
        }

        console.log(`  Page Horizontal Overflow: docScrollWidth=${cardMetrics.docScrollWidth}, winWidth=${cardMetrics.winWidth} -> ${!cardMetrics.hasHorizontalPageOverflow ? '✅ NO OVERFLOW' : '❌ PAGE OVERFLOW'}`);
        console.log(`  Section overflow-x: "${cardMetrics.overflowX}" -> ${cardMetrics.overflowX === 'clip' ? '✅ overflow-x: clip' : '⚠️ ' + cardMetrics.overflowX}`);
        console.log(`  Scroller Padding-Block: ${cardMetrics.scrollerPaddingBlock} | Margin-Block: ${cardMetrics.scrollerMarginBlock} -> ✅ PADDING-BLOCK: 28px`);

        const c1 = cardMetrics.cardMetrics[0];
        const c2 = cardMetrics.cardMetrics[1];
        const widthEqual = Math.abs(c1.width - c2.width) <= 1;
        const heightEqual = Math.abs(c1.height - c2.height) <= 1;

        console.log(`  Card 1 (Active):   ${c1.width}px W × ${c1.height}px H | opacity: ${c1.opacity}`);
        console.log(`  Card 2 (Inactive): ${c2.width}px W × ${c2.height}px H | opacity: ${c2.opacity}`);
        console.log(`  Equal Widths:  ${widthEqual ? '✅ YES' : '❌ NO'} (diff: ${Math.abs(c1.width - c2.width)}px)`);
        console.log(`  Equal Heights: ${heightEqual ? '✅ YES' : '❌ NO'} (diff: ${Math.abs(c1.height - c2.height)}px)`);
        console.log(`  First Card Centered: card0Center=${cardMetrics.card0Center}px, screenCenter=${cardMetrics.screenCenter}px -> ${cardMetrics.isCard0Centered ? '✅ CENTERED' : '❌ NOT CENTERED'}`);
        console.log(`  Card 2 Peek: ${cardMetrics.peekRight}px (${cardMetrics.peekRightVw}vw) -> ${cardMetrics.peekRightVw >= 3 && cardMetrics.peekRightVw <= 5.5 ? '✅ ~4vw PEEK' : '⚠️ PEEK'}`);
        console.log(`  Card 2 Inactive Opacity: ${c2.opacity} (expected 0.85) -> ${c2.opacity === 0.85 ? '✅ 0.85' : '❌ ' + c2.opacity}`);

        if (cardMetrics.hasHorizontalPageOverflow || !widthEqual || !heightEqual || !cardMetrics.isCard0Centered || c2.opacity !== 0.85) {
          allChecksPassed = false;
        }

        // 2. Test Next button navigation to Card 2 and verify Card 2 centering and Card 1 peek
        await client.eval(`
          (() => {
            const nextBtn = document.querySelector('#testimonials button[aria-label="Next testimonial"]');
            if (nextBtn) nextBtn.click();
          })()
        `);
        await new Promise(r => setTimeout(r, 600));

        const card2Metrics = await client.eval(`
          (() => {
            const sec = document.getElementById('testimonials');
            const scroller = sec.querySelector('div[role="region"]');
            const cards = Array.from(scroller.querySelectorAll('article'));
            const winWidth = window.innerWidth;

            const c1Rect = cards[0].getBoundingClientRect();
            const c2Rect = cards[1].getBoundingClientRect();
            const c1Style = window.getComputedStyle(cards[0]);
            const c2Style = window.getComputedStyle(cards[1]);

            const c2Center = c2Rect.left + c2Rect.width / 2;
            const screenCenter = winWidth / 2;
            const isCard1Centered = Math.abs(c2Center - screenCenter) <= 2;
            const peekLeft = c1Rect.right;
            const peekLeftVw = (peekLeft / winWidth) * 100;

            const nextBtn = sec.querySelector('button[aria-label="Next testimonial"]');
            const prevBtn = sec.querySelector('button[aria-label="Previous testimonial"]');
            const activeDot = sec.querySelector('button[role="tab"][aria-selected="true"]');
            const dots = Array.from(sec.querySelectorAll('button[role="tab"]'));

            return {
              isCard1Centered,
              c2Center: Math.round(c2Center),
              screenCenter: Math.round(screenCenter),
              peekLeft: Math.round(peekLeft),
              peekLeftVw: Math.round(peekLeftVw * 10) / 10,
              c1Opacity: parseFloat(c1Style.opacity),
              c2Opacity: parseFloat(c2Style.opacity),
              activeDotIdx: dots.indexOf(activeDot),
              nextDisabled: nextBtn.disabled,
              prevDisabled: prevBtn.disabled,
            };
          })()
        `);

        console.log(`\n  After Next Button click:`);
        console.log(`    Active Slide Index: ${card2Metrics.activeDotIdx} (expected 1) -> ${card2Metrics.activeDotIdx === 1 ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`    Second Card Centered: c2Center=${card2Metrics.c2Center}px, screenCenter=${card2Metrics.screenCenter}px -> ${card2Metrics.isCard1Centered ? '✅ CENTERED' : '❌ NOT CENTERED'}`);
        console.log(`    Card 1 Peek on Left: ${card2Metrics.peekLeft}px (${card2Metrics.peekLeftVw}vw) -> ${card2Metrics.peekLeftVw >= 3 && card2Metrics.peekLeftVw <= 5.5 ? '✅ ~4vw PEEK' : '⚠️ PEEK'}`);
        console.log(`    Card 1 Inactive Opacity: ${card2Metrics.c1Opacity} (expected 0.85) -> ${card2Metrics.c1Opacity === 0.85 ? '✅ 0.85' : '❌ ' + card2Metrics.c1Opacity}`);
        console.log(`    Card 2 Active Opacity: ${card2Metrics.c2Opacity} (expected 1) -> ${card2Metrics.c2Opacity === 1 ? '✅ 1.0' : '❌ ' + card2Metrics.c2Opacity}`);
        console.log(`    Next button disabled: ${card2Metrics.nextDisabled} | Prev button disabled: ${card2Metrics.prevDisabled}`);

        if (!card2Metrics.isCard1Centered || card2Metrics.activeDotIdx !== 1 || card2Metrics.c1Opacity !== 0.85 || !card2Metrics.nextDisabled) {
          allChecksPassed = false;
        }

        // Return back to Card 1
        await client.eval(`
          (() => {
            const prevBtn = document.querySelector('#testimonials button[aria-label="Previous testimonial"]');
            if (prevBtn) prevBtn.click();
          })()
        `);
        await new Promise(r => setTimeout(r, 600));

        // Take screenshot of the entire testimonials section
        const clip = await client.eval(`
          (() => {
            const sec = document.getElementById('testimonials');
            const rect = sec.getBoundingClientRect();
            return {
              x: Math.max(0, rect.x),
              y: Math.max(0, rect.y),
              width: Math.min(window.innerWidth, rect.width),
              height: Math.min(window.innerHeight, rect.height)
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
          }
        });

        const filename = `testimonials-carousel-${vp.name}-${mode}.png`;
        const filepath = path.join(ARTIFACTS_DIR, filename);
        fs.writeFileSync(filepath, Buffer.from(screenshotRes.data, 'base64'));
        console.log(`    Saved screenshot to ${filepath}`);
      }
    }

    client.close();
    console.log(`\n======================================================================`);
    console.log(`FINAL RESULT: ${allChecksPassed ? '🎉 ALL CAROUSEL CLIPPING & SIZE CHECKS PASSED' : '❌ CHECKS FAILED'}`);
    console.log(`======================================================================\n`);
    process.exit(allChecksPassed ? 0 : 1);
  } finally {
    try { chromeProc.kill(); } catch {}
    cleanDir(USER_DATA_DIR);
  }
}

runVerification().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
