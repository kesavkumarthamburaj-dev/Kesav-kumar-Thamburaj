import { fetchText, fetchBuffer } from './fetch-logos-helper.js';

async function checkDetails() {
  console.log('--- Checking Cavalry /favicon.svg ---');
  try {
    const cavFav = await fetchText('https://cavalry.scenegroup.co/favicon.svg');
    console.log('Cavalry /favicon.svg content:');
    console.log(cavFav);
  } catch (e) {
    console.log('Error fetching Cavalry favicon.svg:', e.message);
  }

  console.log('\n--- Checking Cavalry inline SVGs ---');
  try {
    const html = await fetchText('https://cavalry.scenegroup.co');
    const inlines = html.match(/<svg[^>]*>[\s\S]*?<\/svg>/gi) || [];
    console.log('Cavalry inline SVGs count:', inlines.length);
    inlines.forEach((s, i) => console.log(`Cavalry SVG ${i}:`, s.slice(0, 200)));
  } catch (e) {
    console.log('Error checking Cavalry inline SVGs:', e.message);
  }

  console.log('\n--- Checking Higgsfield inline SVGs ---');
  try {
    const html = await fetchText('https://higgsfield.ai');
    const inlines = html.match(/<svg[^>]*>[\s\S]*?<\/svg>/gi) || [];
    console.log('Higgsfield inline SVGs count:', inlines.length);
    inlines.forEach((s, i) => console.log(`Higgsfield SVG ${i}:`, s.slice(0, 200)));
  } catch (e) {
    console.log('Error checking Higgsfield inline SVGs:', e.message);
  }

  console.log('\n--- Checking Higgsfield icon.png / apple-icon.png ---');
  try {
    const buf1 = await fetchBuffer('https://higgsfield.ai/icon.png');
    console.log('Higgsfield /icon.png size:', buf1.length);
    const buf2 = await fetchBuffer('https://higgsfield.ai/apple-icon.png');
    console.log('Higgsfield /apple-icon.png size:', buf2.length);
  } catch (e) {
    console.log('Error checking Higgsfield PNGs:', e.message);
  }
}

checkDetails();
