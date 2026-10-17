import { fetchText, fetchBuffer } from './fetch-logos-helper.js';

async function checkHiggsfieldNavbar() {
  const html = await fetchText('https://higgsfield.ai');
  const nav = html.match(/<nav[^>]*>[\s\S]*?<\/nav>/gi) || [];
  console.log('Nav found count:', nav.length);
  if (nav.length > 0) {
    console.log('Nav 0:\n', nav[0].slice(0, 1000));
  }

  // Also check top-level anchor for home / logo
  const homeLinks = html.match(/<a[^>]+href="\/"[^>]*>[\s\S]*?<\/a>/gi) || [];
  console.log('Home links count:', homeLinks.length);
  homeLinks.forEach((l, i) => console.log(`Home link ${i}:`, l));

  // Check dimensions of PNGs
  const buf1 = await fetchBuffer('https://higgsfield.ai/icon.png');
  const buf2 = await fetchBuffer('https://higgsfield.ai/apple-icon.png');

  // Read PNG width/height from IHDR chunk (bytes 16-24)
  const w1 = buf1.readUInt32BE(16);
  const h1 = buf1.readUInt32BE(20);
  console.log(`icon.png dimensions: ${w1}x${h1}`);

  const w2 = buf2.readUInt32BE(16);
  const h2 = buf2.readUInt32BE(20);
  console.log(`apple-icon.png dimensions: ${w2}x${h2}`);
}

checkHiggsfieldNavbar();
