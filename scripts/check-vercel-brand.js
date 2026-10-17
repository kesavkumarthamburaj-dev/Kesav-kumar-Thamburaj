import { fetchText } from './fetch-logos-helper.js';

async function checkVercelBrands() {
  const html = await fetchText('https://vercel.com/design/brands');
  const links = html.match(/href="[^"]*(?:logo|brand|download|logomark)[^"]*"/gi) || [];
  console.log('Vercel brand download links:', links);

  // Look for the logomark SVG
  const logomarkSvg = html.match(/<svg[^>]*viewBox="0 0 115 100"[^>]*>[\s\S]*?<\/svg>/i) ||
                      html.match(/<svg[^>]*viewBox="0 0 283 64"[^>]*>[\s\S]*?<\/svg>/i) ||
                      html.match(/<svg[^>]*viewBox="0 0 76 65"[^>]*>[\s\S]*?<\/svg>/i) ||
                      html.match(/<svg[^>]*>[\s\S]*?<path[^>]+d="M[0-9\.\s]+H0l[0-9\.\s]+z"[^>]*>[\s\S]*?<\/svg>/i);
  console.log('Logomark SVG found:', logomarkSvg ? logomarkSvg[0] : 'none');
}

checkVercelBrands();
