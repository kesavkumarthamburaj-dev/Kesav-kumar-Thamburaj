import { fetchText } from './fetch-logos-helper.js';

async function checkHiggsfieldHeader() {
  const html = await fetchText('https://higgsfield.ai');
  const svgs = html.match(/<svg[\s\S]*?<\/svg>/gi) || [];
  for (let i = 0; i < Math.min(10, svgs.length); i++) {
    console.log(`SVG ${i}:`, svgs[i]);
  }
}

checkHiggsfieldHeader();
