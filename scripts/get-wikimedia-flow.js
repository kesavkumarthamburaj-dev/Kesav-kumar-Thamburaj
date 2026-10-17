import { fetchText } from './fetch-logos-helper.js';

async function getFlowSvg() {
  const urls = [
    'https://commons.wikimedia.org/wiki/File:Google_Flow_logo.svg',
    'https://commons.wikimedia.org/wiki/File:Google_Flow_icon.svg',
    'https://commons.wikimedia.org/wiki/File:Flow_logo.svg'
  ];

  for (const u of urls) {
    try {
      const html = await fetchText(u);
      console.log('Status 200 for:', u);
      const matches = html.match(/https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/[a-z0-9\/%._-]+\.svg/gi);
      console.log('Matches:', matches ? matches.slice(0, 3) : 'none');
    } catch (e) {
      console.log(`Failed for ${u}: ${e.message}`);
    }
  }
}

getFlowSvg();
