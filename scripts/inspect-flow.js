import { fetchText } from './fetch-logos-helper.js';

async function run() {
  try {
    const html = await fetchText('https://flow.google/');
    console.log('Fetched flow.google, length:', html.length);
    const icons = html.match(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]*>/gi);
    console.log('Icons:', icons);
    const svgs = html.match(/<svg[\s\S]*?<\/svg>/gi);
    console.log('SVGs found:', svgs ? svgs.length : 0);
    // Search for any img src, og:image, or asset urls
    const imgMatches = html.match(/https:\/\/[^"'\s]+(?:logo|icon|brand|flow)[^"'\s]*/gi) || [];
    console.log('Unique asset matches:', Array.from(new Set(imgMatches)));
    
    const wikiHtml = await fetchText('https://commons.wikimedia.org/wiki/File:Google_Flow_logo.svg');
    const matches = wikiHtml.match(/https?:\/\/[^\s"']+/g) || [];
    const sourceUrls = matches.filter(u => u.includes('flow') || u.includes('google') || u.includes('aitestkitchen'));
    console.log('Source URLs mentioned in wiki:', Array.from(new Set(sourceUrls)));
  } catch (err) {
    console.error('Error fetching flow.google:', err.message);
  }
}

run();
