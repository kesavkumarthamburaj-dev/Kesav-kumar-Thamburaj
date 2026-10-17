import { fetchText } from './fetch-logos-helper.js';

async function checkGitHubLogos() {
  const html = await fetchText('https://github.com/logos');
  const zips = html.match(/https?:\/\/[^"'\s]+\.zip/gi) || [];
  console.log('GitHub logos zip links:', zips);

  const svgs = html.match(/https?:\/\/[^"'\s]+(?:mark|logo|github|octocat)[^"'\s]*\.svg/gi) || [];
  console.log('GitHub SVG links:', svgs);

  const inlines = html.match(/<svg[^>]*>[\s\S]*?<\/svg>/gi) || [];
  console.log('GitHub inline SVGs count:', inlines.length);
  inlines.slice(0, 5).forEach((s, i) => console.log('SVG', i, s.slice(0, 200)));
}

checkGitHubLogos();
