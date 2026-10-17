import { fetchText } from './fetch-logos-helper.js';

async function checkHfCss() {
  const html = await fetchText('https://higgsfield.ai');
  const cssLinks = html.match(/https?:\/\/[^"'\s]+\.css[^"'\s]*/gi) || [];
  console.log('CSS links on Higgsfield:', cssLinks);
  for (const link of cssLinks.slice(0, 3)) {
    const css = await fetchText(link);
    const m = css.match(/\.hf-logo[^{]*\{[^}]+\}/g);
    if (m) console.log('Found .hf-logo styles:', m);
    const glyphM = css.match(/\.hf-logo__glyph[^{]*\{[^}]+\}/g);
    if (glyphM) console.log('Found .hf-logo__glyph styles:', glyphM);
  }
}

checkHfCss();
