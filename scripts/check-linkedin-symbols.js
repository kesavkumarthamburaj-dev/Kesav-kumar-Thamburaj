import { fetchText } from './fetch-logos-helper.js';

async function printLinkedInSymbols() {
  const brandHtml = await fetchText('https://brand.linkedin.com/downloads');
  const symbols = brandHtml.match(/<symbol[\s\S]*?<\/symbol>/gi) || [];
  symbols.forEach((s) => {
    if (s.includes('in-') || s.includes('icon') || s.includes('blue') || s.includes('bug')) {
      console.log('Symbol:', s);
    }
  });
}

printLinkedInSymbols();
