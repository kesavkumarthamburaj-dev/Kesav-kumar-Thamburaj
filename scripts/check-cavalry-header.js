import { fetchText } from './fetch-logos-helper.js';

async function checkHeader() {
  const html = await fetchText('https://cavalry.scenegroup.co');
  const header = html.match(/<header[^>]*>[\s\S]*?<\/header>/gi);
  console.log('Header found:', header ? header[0].slice(0, 1000) : 'none');
}

checkHeader();
