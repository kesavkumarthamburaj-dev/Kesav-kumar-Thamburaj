import { fetchText } from './fetch-logos-helper.js';

async function listSymbolIds() {
  const brandHtml = await fetchText('https://brand.linkedin.com/downloads');
  const symbols = brandHtml.match(/<symbol[\s\S]*?<\/symbol>/gi) || [];
  symbols.forEach(s => {
    const id = s.match(/id="([^"]+)"/)?.[1];
    const vb = s.match(/viewBox="([^"]+)"/)?.[1];
    console.log(id, 'viewBox:', vb);
  });
}

listSymbolIds();
