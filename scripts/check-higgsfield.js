import { fetchText } from './fetch-logos-helper.js';

async function checkHiggsfield() {
  try {
    const html = await fetchText('https://higgsfield.ai');
    console.log('Fetched higgsfield.ai, length:', html.length);
    const svgs = html.match(/<svg[\s\S]*?<\/svg>/gi) || [];
    console.log(`Found ${svgs.length} SVGs`);
    svgs.forEach((s, i) => {
      if (s.toLowerCase().includes('logo') || s.toLowerCase().includes('viewbox') || s.length < 2000) {
        console.log(`SVG ${i} (len ${s.length}):`, s.slice(0, 300));
      }
    });
  } catch (e) {
    console.error('Error fetching higgsfield:', e.message);
  }
}

checkHiggsfield();
