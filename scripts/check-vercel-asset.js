import { fetchText } from './fetch-logos-helper.js';

async function checkVercelAsset() {
  const svg = await fetchText('https://vercel.com/vc-ap-b3331f/_next/static/immutable/media/logo-vercel-dark.3bae9lxmoeqty.svg');
  console.log('Vercel official SVG length:', svg.length);
  console.log(svg);
}

checkVercelAsset();
