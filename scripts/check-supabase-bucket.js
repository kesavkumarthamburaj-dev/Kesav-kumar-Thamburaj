import { fetchText } from './fetch-logos-helper.js';

async function checkSupabaseBucket() {
  const html = await fetchText('https://supabase.com/brand-assets');
  const matches = html.match(/https:\/\/obuldanrptloktxcffvn\.supabase\.co\/storage\/v1\/object\/public\/supabase-brand-assets\/[^"'\s]+/gi) || [];
  console.log('Supabase brand assets bucket URLs:');
  const unique = Array.from(new Set(matches));
  unique.forEach(u => console.log(u));

  // Also check Supabase official repository
  const repoUrl = 'https://raw.githubusercontent.com/supabase/supabase/master/packages/common/assets/images/supabase-logo-icon.svg';
  try {
    const icon = await fetchText(repoUrl);
    console.log('GitHub repo supabase-logo-icon.svg:');
    console.log(icon.slice(0, 400));
  } catch (e) {
    console.log('Repo icon error:', e.message);
  }
}

checkSupabaseBucket();
