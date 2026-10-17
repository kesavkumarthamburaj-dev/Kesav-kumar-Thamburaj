import { fetchBuffer } from './fetch-logos-helper.js';
import fs from 'fs';

async function downloadInLogoZip() {
  try {
    const buf = await fetchBuffer('https://content.linkedin.com/content/dam/me/business/en-us/amp/xbu/linkedin-revised-brand-guidelines/logos/in-logo.zip');
    console.log('Downloaded in-logo.zip, size:', buf.length);
    fs.writeFileSync('temp_in_logo.zip', buf);
    console.log('Saved temp_in_logo.zip');
  } catch (e) {
    console.log('Failed to download in-logo.zip:', e.message);
  }
}

downloadInLogoZip();
