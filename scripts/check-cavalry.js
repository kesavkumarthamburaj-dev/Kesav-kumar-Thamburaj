import { fetchText } from './fetch-logos-helper.js';

async function checkCavalry() {
  const svg = await fetchText('https://cavalry.studio/favicon.svg');
  console.log('Cavalry favicon.svg length:', svg.length);
  console.log(svg.slice(0, 500));
}

checkCavalry();
