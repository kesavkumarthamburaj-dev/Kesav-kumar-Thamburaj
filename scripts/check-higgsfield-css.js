import { fetchText } from './fetch-logos-helper.js';

async function checkHiggsfieldCss() {
  const html = await fetchText('https://higgsfield.ai');
  const cssLinks = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/gi)].map(m => m[1]);
  console.log('CSS links:', cssLinks);
  for (const link of cssLinks) {
    const full = link.startsWith('http') ? link : new URL(link, 'https://higgsfield.ai').href;
    const css = await fetchText(full);
    const fillMatch = css.match(/\.hf-logo[^{]*\{[^}]*\}/gi);
    if (fillMatch) {
      console.log('Found hf-logo css:', fillMatch);
    }
  }
}

checkHiggsfieldCss();
