import { fetchText } from './fetch-logos-helper.js';

async function checkLinkedIn() {
  const brandHtml = await fetchText('https://brand.linkedin.com/downloads');
  const links = brandHtml.match(/href="[^"]*(?:logo|icon|bug|svg|zip|download)[^"]*"/gi) || [];
  console.log('LinkedIn brand download links:', Array.from(new Set(links)));
  
  // Also check SVGs on brand.linkedin.com
  const svgs = brandHtml.match(/<svg[\s\S]*?<\/svg>/gi) || [];
  console.log('SVGs on page:', svgs.length);
  svgs.slice(0, 3).forEach((s, i) => console.log(`SVG ${i}:`, s.slice(0, 200)));
}

checkLinkedIn();
