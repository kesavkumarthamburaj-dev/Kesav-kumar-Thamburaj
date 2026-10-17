import { fetchText } from './fetch-logos-helper.js';

async function checkHiggsfieldStyle() {
  const html = await fetchText('https://higgsfield.ai');
  const cssMatches = html.match(/class="[^"]*hf-logo[^"]*"/gi) || [];
  console.log('CSS classes with hf-logo:', cssMatches);
  const logoLink = html.match(/<a[^>]+href="\/?"[^>]*>[\s\S]*?<\/a>/i);
  console.log('Logo Link HTML:', logoLink ? logoLink[0] : 'not found');
}

checkHiggsfieldStyle();
