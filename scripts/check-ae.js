import { fetchText } from './fetch-logos-helper.js';

async function checkAe() {
  const svg = await fetchText('https://upload.wikimedia.org/wikipedia/commons/c/cb/Adobe_After_Effects_CC_icon.svg');
  console.log('AE SVG length:', svg.length);
  console.log(svg.slice(0, 500));
}

checkAe();
