import { fetchText } from './fetch-logos-helper.js';

async function checkJsBundles() {
  const html = await fetchText('https://flow.google/');
  const scripts = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]);
  console.log('Found scripts:', scripts);

  for (const scriptUrl of scripts) {
    const fullUrl = scriptUrl.startsWith('http') ? scriptUrl : new URL(scriptUrl, 'https://flow.google/').href;
    console.log('Fetching script:', fullUrl);
    try {
      const js = await fetchText(fullUrl);
      const svgMatches = js.match(/<svg[\s\S]*?<\/svg>/gi);
      if (svgMatches) {
        console.log(`Found ${svgMatches.length} SVGs in ${fullUrl}`);
        svgMatches.forEach((s, i) => console.log(`SVG ${i}:`, s.slice(0, 150)));
      }
      const logoMatches = js.match(/https:\/\/[^"'\s]+\.svg/gi);
      if (logoMatches) {
        console.log('SVG URLs:', Array.from(new Set(logoMatches)));
      }
    } catch (e) {
      console.log('Failed to fetch:', fullUrl, e.message);
    }
  }
}

checkJsBundles();
