// scripts/verify-carousel-controls.js
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = path.join(process.cwd(), '.chrome-temp-carousel');
const PORT = 9226;
const BASE_URL = 'http://localhost:5173';

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
  console.log('=== TESTIMONIAL CAROUSEL CONTROLS AUDIT ===\n');
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

    const viewports = [
      { width: 360, height: 800, name: '360px', isCarousel: true },
      { width: 390, height: 844, name: '390px', isCarousel: true },
      { width: 768, height: 1024, name: '768px', isCarousel: false },
    ];

    const modes = ['light', 'dark'];
    let allChecksPassed = true;

    for (const vp of viewports) {
      for (const mode of modes) {
        console.log(`\n==================================================`);
        console.log(`Testing Viewport ${vp.name} in ${mode.toUpperCase()} mode`);
        console.log(`==================================================`);

        await client.send('Emulation.setDeviceMetricsOverride', {
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: 1,
          mobile: vp.width < 768,
        });

        // Set theme mode by clicking the navbar toggle if needed
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

        if (vp.isCarousel) {
          // Audit carousel buttons and controls in DOM
          const audit = await client.eval(`
            (() => {
              function parseRgb(colorStr) {
                const m = colorStr ? colorStr.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)/) : null;
                return m ? {
                  r: parseInt(m[1]),
                  g: parseInt(m[2]),
                  b: parseInt(m[3]),
                  a: m[4] !== undefined ? parseFloat(m[4]) : 1
                } : { r: 0, g: 0, b: 0, a: 1 };
              }
              function getLuminance({ r, g, b }) {
                const a = [r, g, b].map(v => {
                  v /= 255;
                  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
                });
                return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
              }
              function getContrast(c1, c2) {
                const lum1 = getLuminance(c1);
                const lum2 = getLuminance(c2);
                const brightest = Math.max(lum1, lum2);
                const darkest = Math.min(lum1, lum2);
                return (brightest + 0.05) / (darkest + 0.05);
              }

              const sec = document.getElementById('testimonials');
              if (!sec) return { error: 'Testimonials section not found' };

              const pageBgStr = window.getComputedStyle(sec).backgroundColor;
              const pageBg = parseRgb(pageBgStr);

              const prevBtn = sec.querySelector('button[aria-label="Previous testimonial"]');
              const nextBtn = sec.querySelector('button[aria-label="Next testimonial"]');
              const dotsList = Array.from(sec.querySelectorAll('div[role="tablist"] button[role="tab"]'));

              function inspectBtn(btn, label) {
                if (!btn) return { found: false, label };
                const style = window.getComputedStyle(btn);
                const rect = btn.getBoundingClientRect();
                const svg = btn.querySelector('svg');
                const svgStyle = svg ? window.getComputedStyle(svg) : null;

                const bg = parseRgb(style.backgroundColor);
                const iconColor = svgStyle ? parseRgb(svgStyle.color) : parseRgb(style.color);
                const iconContrast = getContrast(iconColor, bg);
                const btnContrast = getContrast(bg, pageBg);

                return {
                  found: true,
                  label,
                  width: Math.round(rect.width),
                  height: Math.round(rect.height),
                  backgroundColor: style.backgroundColor,
                  borderColor: style.borderColor,
                  borderWidth: style.borderWidth,
                  opacity: parseFloat(style.opacity),
                  disabled: btn.disabled,
                  ariaDisabled: btn.getAttribute('aria-disabled'),
                  iconColor: svgStyle ? svgStyle.color : style.color,
                  iconContrast: iconContrast.toFixed(2),
                  btnContrast: btnContrast.toFixed(2),
                  cursor: style.cursor,
                };
              }

              const inspectedDots = dotsList.map((d, i) => {
                const rect = d.getBoundingClientRect();
                const span = d.querySelector('span');
                const spanStyle = span ? window.getComputedStyle(span) : null;
                const spanRect = span ? span.getBoundingClientRect() : null;

                return {
                  index: i,
                  tapWidth: Math.round(rect.width),
                  tapHeight: Math.round(rect.height),
                  ariaSelected: d.getAttribute('aria-selected'),
                  dotWidth: spanRect ? Math.round(spanRect.width) : null,
                  dotHeight: spanRect ? Math.round(spanRect.height) : null,
                  dotBg: spanStyle ? spanStyle.backgroundColor : null,
                  dotOpacity: spanStyle ? parseFloat(spanStyle.opacity) : 1,
                };
              });

              // Swipe hint
              const swipeHint = Array.from(sec.querySelectorAll('div')).find(d => d.textContent.trim().startsWith('Swipe'));

              return {
                pageBg: pageBgStr,
                prev: inspectBtn(prevBtn, 'Previous'),
                next: inspectBtn(nextBtn, 'Next'),
                dots: inspectedDots,
                swipeHintVisible: !!swipeHint && window.getComputedStyle(swipeHint).display !== 'none',
              };
            })()
          `);

          if (audit.error) {
            console.error('Audit Error:', audit.error);
            allChecksPassed = false;
            continue;
          }

          console.log(`  Page Background: ${audit.pageBg}`);
          
          // 1. Prev Button
          console.log(`\n  Prev Button:`);
          console.log(`    Size: ${audit.prev.width}x${audit.prev.height}px (expected 44x44) -> ${audit.prev.width >= 44 && audit.prev.height >= 44 ? '✅ PASS' : '❌ FAIL'}`);
          console.log(`    Fill: ${audit.prev.backgroundColor} | Border: ${audit.prev.borderWidth} ${audit.prev.borderColor}`);
          console.log(`    Icon Color: ${audit.prev.iconColor}`);
          console.log(`    Icon Contrast: ${audit.prev.iconContrast}:1 (>= 4.5:1) -> ${parseFloat(audit.prev.iconContrast) >= 4.5 ? '✅ PASS' : '❌ FAIL'}`);
          console.log(`    Button Contrast against page: ${audit.prev.btnContrast}:1 (>= 3:1) -> ${parseFloat(audit.prev.btnContrast) >= 3 ? '✅ PASS' : '❌ FAIL'}`);
          console.log(`    Disabled: ${audit.prev.disabled} | aria-disabled: "${audit.prev.ariaDisabled}" | opacity: ${audit.prev.opacity} (expected 0.4) -> ${audit.prev.opacity === 0.4 ? '✅ PASS' : '❌ FAIL'}`);

          if (audit.prev.width < 44 || audit.prev.height < 44 || parseFloat(audit.prev.iconContrast) < 4.5 || parseFloat(audit.prev.btnContrast) < 3 || audit.prev.opacity !== 0.4) {
            allChecksPassed = false;
          }

          // 2. Next Button
          console.log(`\n  Next Button:`);
          console.log(`    Size: ${audit.next.width}x${audit.next.height}px (expected 44x44) -> ${audit.next.width >= 44 && audit.next.height >= 44 ? '✅ PASS' : '❌ FAIL'}`);
          console.log(`    Fill: ${audit.next.backgroundColor} | Border: ${audit.next.borderWidth} ${audit.next.borderColor}`);
          console.log(`    Icon Color: ${audit.next.iconColor}`);
          console.log(`    Icon Contrast: ${audit.next.iconContrast}:1 (>= 4.5:1) -> ${parseFloat(audit.next.iconContrast) >= 4.5 ? '✅ PASS' : '❌ FAIL'}`);
          console.log(`    Button Contrast against page: ${audit.next.btnContrast}:1 (>= 3:1) -> ${parseFloat(audit.next.btnContrast) >= 3 ? '✅ PASS' : '❌ FAIL'}`);
          console.log(`    Disabled: ${audit.next.disabled} | opacity: ${audit.next.opacity}`);

          if (audit.next.width < 44 || audit.next.height < 44 || parseFloat(audit.next.iconContrast) < 4.5 || parseFloat(audit.next.btnContrast) < 3) {
            allChecksPassed = false;
          }

          // 3. Dots
          console.log(`\n  Pagination Dots (${audit.dots.length} dots):`);
          for (const dot of audit.dots) {
            console.log(`    Dot ${dot.index + 1}: selected=${dot.ariaSelected}, tapArea=${dot.tapWidth}x${dot.tapHeight}px, visualDot=${dot.dotWidth}x${dot.dotHeight}px, bg=${dot.dotBg}, opacity=${dot.dotOpacity}`);
            if (dot.tapWidth < 44 || dot.tapHeight < 44) {
              console.error(`    ❌ Dot ${dot.index + 1} tap area is less than 44px!`);
              allChecksPassed = false;
            }
            if (dot.ariaSelected === 'true') {
              if (dot.dotWidth !== 24 || dot.dotHeight !== 8) {
                console.error(`    ❌ Active dot size expected 24x8, got ${dot.dotWidth}x${dot.dotHeight}`);
                allChecksPassed = false;
              }
            } else {
              if (dot.dotWidth !== 8 || dot.dotHeight !== 8) {
                console.error(`    ❌ Inactive dot size expected 8x8, got ${dot.dotWidth}x${dot.dotHeight}`);
                allChecksPassed = false;
              }
              if (mode === 'dark' && dot.dotOpacity !== 0.6) {
                console.error(`    ❌ Inactive dot opacity expected 0.6 in dark mode, got ${dot.dotOpacity}`);
                allChecksPassed = false;
              }
            }
          }

          // 4. Test Interaction: Next button click transitions to card 2
          console.log(`\n  Testing Next Button click interaction:`);
          await client.eval(`
            (() => {
              const nextBtn = document.querySelector('#testimonials button[aria-label="Next testimonial"]');
              if (nextBtn) nextBtn.click();
            })()
          `);
          await new Promise(r => setTimeout(r, 600));

          const afterClick = await client.eval(`
            (() => {
              const sec = document.getElementById('testimonials');
              const prevBtn = sec.querySelector('button[aria-label="Previous testimonial"]');
              const nextBtn = sec.querySelector('button[aria-label="Next testimonial"]');
              const swipeHint = Array.from(sec.querySelectorAll('div')).find(d => d.textContent.trim().startsWith('Swipe'));
              const activeDot = sec.querySelector('button[role="tab"][aria-selected="true"]');
              const dots = Array.from(sec.querySelectorAll('button[role="tab"]'));
              const activeDotIdx = dots.indexOf(activeDot);

              return {
                activeDotIdx,
                prevDisabled: prevBtn.disabled,
                prevOpacity: parseFloat(window.getComputedStyle(prevBtn).opacity),
                nextDisabled: nextBtn.disabled,
                nextAriaDisabled: nextBtn.getAttribute('aria-disabled'),
                nextOpacity: parseFloat(window.getComputedStyle(nextBtn).opacity),
                swipeHintPresent: !!swipeHint,
              };
            })()
          `);

          console.log(`    After Next click: activeDotIdx=${afterClick.activeDotIdx}`);
          console.log(`    Prev button disabled=${afterClick.prevDisabled}, opacity=${afterClick.prevOpacity}`);
          console.log(`    Next button disabled=${afterClick.nextDisabled}, aria-disabled="${afterClick.nextAriaDisabled}", opacity=${afterClick.nextOpacity} (expected 0.4 on last card)`);
          console.log(`    Swipe hint present: ${afterClick.swipeHintPresent ? 'Visible' : 'Hidden (as expected)'}`);

          if (afterClick.activeDotIdx !== 1 || !afterClick.nextDisabled || afterClick.nextOpacity !== 0.4 || afterClick.swipeHintPresent) {
            console.error(`    ❌ Transition state check failed`);
            allChecksPassed = false;
          } else {
            console.log(`    ✅ Transition, disabled state on last card, and hidden Swipe hint verified!`);
          }

          // Reset back to card 1 by clicking Prev
          await client.eval(`
            (() => {
              const prevBtn = document.querySelector('#testimonials button[aria-label="Previous testimonial"]');
              if (prevBtn) prevBtn.click();
            })()
          `);
          await new Promise(r => setTimeout(r, 600));
        } else {
          // 768px: verify desktop 2-column layout and cards visibility
          const desktopAudit = await client.eval(`
            (() => {
              const sec = document.getElementById('testimonials');
              if (!sec) return { error: 'Testimonials section not found' };
              const articles = Array.from(sec.querySelectorAll('article')).filter(c => c.offsetParent !== null);
              const allDivs = Array.from(sec.querySelectorAll('div'));
              const desktopGrid = allDivs.find(d => typeof d.className === 'string' && d.className.includes('md:grid'));
              const isDesktopGridVisible = desktopGrid ? window.getComputedStyle(desktopGrid).display !== 'none' : false;
              const scrollWidth = document.documentElement.scrollWidth;
              const winWidth = window.innerWidth;

              return {
                visibleCards: articles.length,
                isDesktopGridVisible,
                noOverflow: scrollWidth <= winWidth,
              };
            })()
          `);

          console.log(`  768px Desktop Grid Visible: ${desktopAudit.isDesktopGridVisible ? '✅ YES' : '❌ NO'}`);
          console.log(`  Visible Cards: ${desktopAudit.visibleCards} (expected 2) -> ${desktopAudit.visibleCards === 2 ? '✅ PASS' : '❌ FAIL'}`);
          console.log(`  Horizontal Overflow: ${desktopAudit.noOverflow ? '✅ NO OVERFLOW' : '❌ OVERFLOW'}`);

          if (!desktopAudit.isDesktopGridVisible || desktopAudit.visibleCards !== 2 || !desktopAudit.noOverflow) {
            allChecksPassed = false;
          }
        }

        // Take a screenshot
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
        const artifactPath = `C:\\Users\\DELL\\.gemini\\antigravity-ide\\brain\\dd8225c0-cffa-4e2a-8b11-51e914fd41c9\\testimonials-${vp.name}-${mode}.png`;
        fs.writeFileSync(artifactPath, Buffer.from(screenshotRes.data, 'base64'));
        console.log(`    Saved screenshot to ${artifactPath}`);
      }
    }

    client.close();
    console.log(`\n==================================================`);
    console.log(`FINAL RESULT: ${allChecksPassed ? '🎉 ALL CHECKS PASSED' : '❌ CHECKS FAILED'}`);
    console.log(`==================================================\n`);
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
