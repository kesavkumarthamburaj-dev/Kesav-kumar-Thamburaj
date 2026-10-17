import { fetchText } from './fetch-logos-helper.js';

async function test() {
  const code = await fetchText('https://unpkg.com/simple-icons@16.35.0/index.mjs');
  
  // Find adobe products
  const adobeMatches = Array.from(code.matchAll(/title:"([^"]*adobe[^"]*)"/gi));
  console.log('Adobe matches:', adobeMatches.map(m => m[1]));

  // Find linkedin
  const liMatches = Array.from(code.matchAll(/title:"([^"]*linke[^"]*)"/gi));
  console.log('LinkedIn matches:', liMatches.map(m => m[1]));

  // Find effects
  const fxMatches = Array.from(code.matchAll(/title:"([^"]*effects[^"]*)"/gi));
  console.log('Effects matches:', fxMatches.map(m => m[1]));
}

test();
