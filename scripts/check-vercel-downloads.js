import { fetchText } from './fetch-logos-helper.js';

async function checkVercelDownloads() {
  const brandHtml = await fetchText('https://vercel.com/design/brands');
  const links = brandHtml.match(/href="[^"]*(?:logo|brand|download|asset|svg|zip)[^"]*"/gi) || [];
  console.log('Download/brand links:', Array.from(new Set(links)));
}

checkVercelDownloads();
