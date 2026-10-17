import { fetchText } from './fetch-logos-helper.js';

async function checkSupabase() {
  const repoSvg = await fetchText('https://raw.githubusercontent.com/supabase/supabase/master/packages/common/assets/images/supabase-logo-icon.svg');
  console.log('Supabase repo SVG length:', repoSvg.length);
  console.log(repoSvg.slice(0, 500));

  const siSvg = await fetchText('https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/supabase.svg');
  console.log('Simple icons Supabase length:', siSvg.length);
  console.log(siSvg);
}

checkSupabase();
