import { fetchText } from './fetch-logos-helper.js';

async function checkLinkedInSvgSymbols() {
  const brandHtml = await fetchText('https://brand.linkedin.com/downloads');
  const symbols = brandHtml.match(/<symbol[\s\S]*?<\/symbol>/gi) || [];
  for (const s of symbols) {
    const id = s.match(/id="([^"]+)"/)?.[1];
    console.log('Symbol ID:', id);
    if (id?.includes('bug') || id?.includes('icon') || id?.includes('logo')) {
      console.log('--- ' + id + ' ---');
      console.log(s);
    }
  }
}

checkLinkedInSvgSymbols();
