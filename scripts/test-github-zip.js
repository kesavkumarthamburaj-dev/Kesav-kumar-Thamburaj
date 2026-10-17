import { fetchBuffer } from './fetch-logos-helper.js';

async function testZip() {
  try {
    const buf = await fetchBuffer('https://brand.github.com/GitHub_Logos.zip');
    console.log('GitHub_Logos.zip downloaded:', buf.length, 'bytes');
  } catch (e) {
    console.log('Error downloading zip:', e.message);
  }
}

testZip();
