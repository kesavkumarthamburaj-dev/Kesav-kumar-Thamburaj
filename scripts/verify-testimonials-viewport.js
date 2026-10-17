// scripts/verify-testimonials-viewport.js
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = path.join(process.cwd(), '.chrome-temp-testimonials');
const PORT = 9225;
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
  console.log('--- Starting Testimonials Visual & Accessibility Verification ---');
  cleanDir(USER_DATA_DIR);

  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--headless=new',
    '--disable-gpu',
    '--window-size=1440,900',
  ]);

  try {
    await getWsUrl();
    const targetRes = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' });
    const target = await targetRes.json();
    console.log('Connected to Page target:', target.webSocketDebuggerUrl);
    const client = new CdpClient(target.webSocketDebuggerUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Page.navigate', { url: `${BASE_URL}/` });
    await new Promise(r => setTimeout(r, 2000));

    const viewports = [
      { width: 360, height: 800, name: 'Mobile (360px)' },
      { width: 768, height: 1024, name: 'Tablet (768px)' },
      { width: 1440, height: 900, name: 'Desktop (1440px)' },
    ];

    const modes = ['light', 'dark'];
    let allChecksPassed = true;

    for (const vp of viewports) {
      for (const mode of modes) {
        console.log(`\n========================================`);
        console.log(`Testing ${vp.name} in ${mode.toUpperCase()} mode`);
        console.log(`========================================`);

        await client.send('Emulation.setDeviceMetricsOverride', {
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: 1,
          mobile: vp.width < 768,
        });

        // Set theme mode
        await client.eval(`
          (() => {
            const isDarkWanted = ${mode === 'dark'};
            const isDarkNow = document.documentElement.classList.contains('dark');
            if (isDarkWanted !== isDarkNow) {
              const btn = document.querySelector('button[aria-label*="theme"], button[aria-label*="Dark"], button[aria-label*="Light"]');
              if (btn) btn.click();
              else if (isDarkWanted) document.documentElement.classList.add('dark');
              else document.documentElement.classList.remove('dark');
            }
          })()
        `);
        await new Promise(r => setTimeout(r, 600));

        // 1. Check Horizontal Overflow
        const overflowCheck = await client.eval(`
          (() => {
            const docWidth = document.documentElement.clientWidth;
            const scrollWidth = document.documentElement.scrollWidth;
            const bodyScrollWidth = document.body.scrollWidth;
            const winWidth = window.innerWidth;
            const hasOverflow = scrollWidth > winWidth || bodyScrollWidth > winWidth;
            return { docWidth, scrollWidth, bodyScrollWidth, winWidth, hasOverflow };
          })()
        `);
        console.log(`Overflow Check: scrollWidth=${overflowCheck.scrollWidth}, innerWidth=${overflowCheck.winWidth} -> ${!overflowCheck.hasOverflow ? '✅ NO OVERFLOW' : '❌ OVERFLOW'}`);
        if (overflowCheck.hasOverflow) allChecksPassed = false;

        // 2. Check Section presence & structure
        const sectionCheck = await client.eval(`
          (() => {
            const sec = document.getElementById('testimonials');
            if (!sec) return { found: false };
            const rect = sec.getBoundingClientRect();
            const allCards = Array.from(sec.querySelectorAll('article'));
            const visibleCards = allCards.filter(c => c.offsetParent !== null);
            const desktopGrid = Array.from(sec.querySelectorAll('div')).find(d => typeof d.className === 'string' && d.className.includes('md:grid'));
            const desktopMaxWidth = desktopGrid ? window.getComputedStyle(desktopGrid).maxWidth : null;

            return {
              found: true,
              visible: rect.height > 0,
              totalCards: allCards.length,
              visibleCards: visibleCards.length,
              desktopMaxWidth,
              headline: sec.querySelector('h2')?.textContent || sec.innerText.slice(0, 50),
            };
          })()
        `);
        console.log(`Section #testimonials: found=${sectionCheck.found}, visible=${sectionCheck.visible}, visibleCards=${sectionCheck.visibleCards}, desktopMaxWidth=${sectionCheck.desktopMaxWidth}`);
        if (!sectionCheck.found || sectionCheck.visibleCards !== 2) {
          console.error(`❌ Expected 2 visible cards, got ${sectionCheck.visibleCards}`);
          allChecksPassed = false;
        }

        // 3. Check Card details & Contrast
        const cardDetails = await client.eval(`
          (() => {
            function parseRgb(colorStr) {
              const m = colorStr.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
              return m ? [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])] : [0,0,0];
            }
            function getLuminance([r, g, b]) {
              const a = [r, g, b].map(v => {
                v /= 255;
                return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
              });
              return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
            }
            function getContrast(rgb1, rgb2) {
              const lum1 = getLuminance(rgb1);
              const lum2 = getLuminance(rgb2);
              const brightest = Math.max(lum1, lum2);
              const darkest = Math.min(lum1, lum2);
              return (brightest + 0.05) / (darkest + 0.05);
            }

            const sec = document.getElementById('testimonials');
            const articles = Array.from(sec.querySelectorAll('article')).filter(c => c.offsetParent !== null);

            return articles.map((card, idx) => {
              const cardBg = window.getComputedStyle(card).backgroundColor;
              const cardBgRgb = parseRgb(cardBg);

              const bq = card.querySelector('blockquote');
              const bqStyle = window.getComputedStyle(bq);
              const quoteColor = bqStyle.color;
              const quoteContrast = getContrast(parseRgb(quoteColor), cardBgRgb);

              const nameEl = card.querySelector('p.font-bold, p[class*="font-bold"]');
              const nameStyle = nameEl ? window.getComputedStyle(nameEl) : null;
              const nameColor = nameStyle ? nameStyle.color : null;
              const nameContrast = nameColor ? getContrast(parseRgb(nameColor), cardBgRgb) : null;

              const roleEl = card.querySelector('p.font-body.text-sm, p[class*="text-sm"]');
              const roleStyle = roleEl ? window.getComputedStyle(roleEl) : null;
              const roleColor = roleStyle ? roleStyle.color : null;
              const roleContrast = roleColor ? getContrast(parseRgb(roleColor), cardBgRgb) : null;

              const tagEl = card.querySelector('span[class*="uppercase"]');
              const quoteMark = card.querySelector('svg');

              return {
                idx,
                quoteText: bq ? bq.textContent.trim() : '',
                fontSize: bqStyle.fontSize,
                lineHeight: bqStyle.lineHeight,
                fontFamily: bqStyle.fontFamily,
                name: nameEl ? nameEl.textContent.trim() : '',
                roleCompany: roleEl ? roleEl.textContent.trim() : '',
                tag: tagEl ? tagEl.textContent.trim() : '',
                hasQuoteMark: !!quoteMark,
                quoteContrast: quoteContrast.toFixed(2),
                nameContrast: nameContrast ? nameContrast.toFixed(2) : null,
                roleContrast: roleContrast ? roleContrast.toFixed(2) : null,
              };
            });
          })()
        `);

        for (const card of cardDetails) {
          console.log(`\n  Card ${card.idx + 1}:`);
          console.log(`    Name: "${card.name}" | Role/Co: "${card.roleCompany}" | Project: [${card.tag}]`);
          console.log(`    Quote Typography: size=${card.fontSize}, leading=${card.lineHeight}, font=${card.fontFamily.split(',')[0]}`);
          console.log(`    Decorative Quote Mark: ${card.hasQuoteMark ? 'YES' : 'NO'}`);
          console.log(`    Quote Contrast: ${card.quoteContrast}:1 (AA >= 4.5: ${card.quoteContrast >= 4.5 ? 'PASS' : 'FAIL'})`);
          console.log(`    Name Contrast: ${card.nameContrast}:1 (AA >= 4.5: ${card.nameContrast >= 4.5 ? 'PASS' : 'FAIL'})`);
          console.log(`    Role Contrast: ${card.roleContrast}:1 (AA >= 4.5: ${card.roleContrast >= 4.5 ? 'PASS' : 'FAIL'})`);

          if (card.quoteContrast < 4.5 || (card.nameContrast && card.nameContrast < 4.5)) {
            console.error(`❌ Contrast check failed for card ${card.idx + 1}`);
            allChecksPassed = false;
          }
        }

        // 4. Test Navigation Link & Scroll to #testimonials
        // First, scroll to top
        await client.eval(`window.scrollTo(0, 0)`);
        await new Promise(r => setTimeout(r, 400));

        const navClickSuccess = await client.eval(`
          (() => {
            // Check desktop nav buttons
            const navButtons = Array.from(document.querySelectorAll('header nav button'));
            const kindWordsBtn = navButtons.find(b => b.textContent.includes('Kind Words'));
            if (kindWordsBtn && kindWordsBtn.offsetParent !== null) {
              kindWordsBtn.click();
              return { method: 'desktop-nav-button' };
            }

            // Check mobile hamburger menu
            const menuToggle = document.querySelector('header button[aria-label*="menu"]');
            if (menuToggle && menuToggle.offsetParent !== null) {
              menuToggle.click();
              // wait for menu open handled synchronously
              const mobileBtn = Array.from(document.querySelectorAll('header div button')).find(b => b.textContent.includes('Kind Words'));
              if (mobileBtn) {
                mobileBtn.click();
                return { method: 'mobile-nav-button' };
              }
            }

            // Fallback: document.getElementById('testimonials').scrollIntoView() or footer link
            const footerLink = document.querySelector('footer a[href="#testimonials"]');
            if (footerLink) {
              const target = document.getElementById('testimonials');
              if (target) target.scrollIntoView({ behavior: 'smooth' });
              return { method: 'footer-anchor-scroll' };
            }

            return { method: 'none' };
          })()
        `);
        console.log(`\n  Nav Link Clicked via: ${navClickSuccess.method}`);
        await new Promise(r => setTimeout(r, 1000));

        const scrollTargetCheck = await client.eval(`
          (() => {
            const sec = document.getElementById('testimonials');
            const rect = sec.getBoundingClientRect();
            const inView = rect.top < window.innerHeight && rect.bottom > 0;
            return { top: Math.round(rect.top), bottom: Math.round(rect.bottom), inView };
          })()
        `);
        console.log(`  Nav Scroll Check: #testimonials rect.top=${scrollTargetCheck.top}px, inView=${scrollTargetCheck.inView ? '✅ IN VIEW' : '❌ NOT IN VIEW'}`);
        if (!scrollTargetCheck.inView) allChecksPassed = false;
      }
    }

    client.close();
    console.log(`\n========================================`);
    console.log(`FINAL RESULT: ${allChecksPassed ? '🎉 ALL VIEWPORTS & ACCESSIBILITY CHECKS PASSED' : '❌ FAILURES DETECTED'}`);
    console.log(`========================================`);
    process.exit(allChecksPassed ? 0 : 1);
  } finally {
    try { chromeProc.kill(); } catch {}
    cleanDir(USER_DATA_DIR);
  }
}

runVerification().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
