import { fetchText } from './fetch-logos-helper.js';

async function checkLabsFlow() {
  try {
    const text = await fetchText('https://labs.google/flow/about/hero/wordmark.svg');
    console.log('wordmark.svg length:', text.length);
  } catch (e) {
    console.log('Failed wordmark.svg:', e.message);
  }

  try {
    const html = await fetchText('https://labs.google/flow');
    console.log('labs.google/flow html length:', html.length);
    const svgs = html.match(/https?:\/\/[^\s"']+\.svg/gi) || [];
    console.log('SVGs on labs.google/flow:', Array.from(new Set(svgs)));
  } catch (e) {
    console.log('Failed labs.google/flow:', e.message);
  }
}

checkLabsFlow();
