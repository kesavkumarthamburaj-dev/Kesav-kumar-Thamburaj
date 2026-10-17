import { fetchText } from './fetch-logos-helper.js';

async function getCavalryLogo() {
  const html = await fetchText('https://cavalry.studio');
  const m = html.match(/<symbol id="cavalry-logo"[\s\S]*?<\/symbol>/i);
  if (m) {
    console.log('Cavalry logo symbol:\n', m[0]);
  }
}

getCavalryLogo();
