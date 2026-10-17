import { fetchText } from './fetch-logos-helper.js';

async function checkSupabase() {
  const html = await fetchText('https://supabase.com/brand-assets');
  const links = html.match(/href="[^"]*(?:logo|brand|download|assets|supabase)[^"]*"/gi) || [];
  console.log('Supabase links:', links.slice(0, 20));

  const svgs = html.match(/https?:\/\/[^"'\s]+\.svg/gi) || [];
  console.log('Supabase SVGs:', svgs.slice(0, 10));

  const inlines = html.match(/<svg[^>]*>[\s\S]*?<\/svg>/gi) || [];
  console.log('Supabase inlines count:', inlines.length);
  inlines.slice(0, 3).forEach((s, i) => console.log('SVG', i, s.slice(0, 200)));
}

checkSupabase();
