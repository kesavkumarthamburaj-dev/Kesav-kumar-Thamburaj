import { fetchText } from './fetch-logos-helper.js';

async function checkVercel() {
  try {
    const si = await fetchText('https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/vercel.svg');
    console.log('Simple Icons Vercel SVG length:', si.length);
    console.log(si);
  } catch (e) {
    console.log('Failed SI vercel:', e.message);
  }

  try {
    const brandHtml = await fetchText('https://vercel.com/design/brands');
    const svgs = brandHtml.match(/<svg[\s\S]*?<\/svg>/gi) || [];
    console.log('SVGs on vercel brand page:', svgs.length);
    svgs.slice(0, 3).forEach((s, i) => console.log(`SVG ${i}:`, s.slice(0, 200)));
  } catch (e) {
    console.log('Failed vercel brands:', e.message);
  }
}

checkVercel();
