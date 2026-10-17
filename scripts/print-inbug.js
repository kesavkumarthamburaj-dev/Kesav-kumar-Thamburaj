import { fetchText } from './fetch-logos-helper.js';

async function printInBug() {
  const brandHtml = await fetchText('https://brand.linkedin.com/downloads');
  const symbols = brandHtml.match(/<symbol[^>]*id="inbug-blue-40"[^>]*>[\s\S]*?<\/symbol>/i);
  console.log('inbug-blue-40:', symbols ? symbols[0] : 'not found');
  const symbols48 = brandHtml.match(/<symbol[^>]*id="inbug-blue-48"[^>]*>[\s\S]*?<\/symbol>/i);
  console.log('inbug-blue-48:', symbols48 ? symbols48[0] : 'not found');
}

printInBug();
