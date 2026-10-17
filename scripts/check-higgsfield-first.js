import { fetchText } from './fetch-logos-helper.js';

async function checkHiggsfieldFirstTwo() {
  const html = await fetchText('https://higgsfield.ai');
  const svgs = html.match(/<svg[\s\S]*?<\/svg>/gi) || [];
  console.log('SVG 0:', svgs[0]);
  console.log('SVG 1:', svgs[1]);
}

checkHiggsfieldFirstTwo();
