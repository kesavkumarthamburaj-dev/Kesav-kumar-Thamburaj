import fs from 'fs';
import path from 'path';
import { fetchText, fetchBuffer } from './fetch-logos-helper.js';

const ARSENAL_DIR = path.join(process.cwd(), 'arsenal-logos');
if (!fs.existsSync(ARSENAL_DIR)) {
  fs.mkdirSync(ARSENAL_DIR, { recursive: true });
}

async function buildAll() {
  console.log('Writing logos to:', ARSENAL_DIR);

  // 1. gemini.svg
  console.log('Fetching gemini.svg...');
  const geminiSvg = await fetchText('https://upload.wikimedia.org/wikipedia/commons/8/8f/Google-gemini-icon.svg');
  fs.writeFileSync(path.join(ARSENAL_DIR, 'gemini.svg'), geminiSvg.trim());

  // 2. flow.svg & flow.png
  console.log('Fetching flow assets...');
  const flowSvg = await fetchText('https://upload.wikimedia.org/wikipedia/commons/5/52/Google_Flow_logo.svg');
  fs.writeFileSync(path.join(ARSENAL_DIR, 'flow.svg'), flowSvg.trim());
  const flowPng = await fetchBuffer('https://www.gstatic.com/aitestkitchen/website/flow/favicon/flow_favicon_b.png');
  fs.writeFileSync(path.join(ARSENAL_DIR, 'flow.png'), flowPng);

  // 3. higgsfield.svg
  console.log('Building higgsfield.svg...');
  // Official Higgsfield SVG from navbar:
  const higgsfieldSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
  <path d="M18.3498 9.83713L18.3339 9.65759C18.1831 7.93447 17.0963 4.69261 14.0816 4.69261C11.8445 4.69261 10.1545 6.97097 8.66311 8.97967C7.47302 10.5883 6.4419 11.9683 5.3073 11.9683C5.00574 11.9357 4.61708 11.7805 4.3792 11.4294C4.16497 11.1108 4.10948 10.7026 4.22046 10.2126C4.39489 9.43684 5.39463 8.7182 6.44963 7.95063C7.02864 7.54238 7.6238 7.10955 8.03634 6.69311C9.22643 5.5091 9.82932 4.65164 9.82932 3.2717C9.82932 1.89176 9.09157 1.20565 8.47276 0.911636C7.23514 0.323844 5.41851 0.666781 4.26026 1.69583C4.08583 1.85922 3.91117 2.01418 3.75243 2.16119C2.58622 3.23097 1.80094 3.95781 0 3.40232V5.63972C2.38791 6.72588 4.39512 4.65164 5.15675 3.69633C5.74372 3.06758 6.36253 2.70006 6.82283 2.70006H6.84671C7.05298 2.70825 7.22741 2.78995 7.35454 2.93696C7.56081 3.18204 7.64018 3.46786 7.60038 3.78622C7.51305 4.45594 6.83875 5.23967 5.60113 6.09713C4.14928 7.10159 1.7218 8.78374 1.53122 10.8987C1.3884 12.4177 2.15003 13.9365 3.34012 14.5243C6.11669 15.8798 7.80665 13.5444 9.5994 11.0783C10.9719 9.1756 12.273 7.37103 14.0818 7.37103C15.7081 7.37103 16.311 8.75916 16.311 9.63301V9.80459L16.1523 9.83713C12.2095 10.5558 10.0595 14.3611 10.0595 16.1167C10.0595 17.8724 11.5034 19.375 13.2804 19.375C15.359 19.375 17.9293 17.5458 18.3419 12.4013L18.3578 12.2136H20V9.83737H18.3498V9.83713ZM16.1998 12.4746C15.8826 15.5531 14.3513 16.9904 13.4232 16.9904C13.0027 16.9904 12.4158 16.631 12.4158 15.9615C12.4158 15.2104 13.5026 12.932 15.946 12.2543L16.2316 12.1808L16.1998 12.4748V12.4746Z"/>
</svg>`;
  fs.writeFileSync(path.join(ARSENAL_DIR, 'higgsfield.svg'), higgsfieldSvg.trim());

  // 4. after-effects.svg
  console.log('Fetching after-effects.svg...');
  const aeSvg = await fetchText('https://upload.wikimedia.org/wikipedia/commons/c/cb/Adobe_After_Effects_CC_icon.svg');
  fs.writeFileSync(path.join(ARSENAL_DIR, 'after-effects.svg'), aeSvg.trim());

  // 5. cavalry.svg
  console.log('Fetching cavalry.svg...');
  const cavalrySvg = await fetchText('https://cavalry.studio/favicon.svg');
  fs.writeFileSync(path.join(ARSENAL_DIR, 'cavalry.svg'), cavalrySvg.trim());

  // 6. github.svg
  console.log('Copying github.svg from official kit...');
  const ghSvg = fs.readFileSync('temp_gh_extracted/GitHub Logos/SVG/GitHub_Invertocat_Black.svg', 'utf8');
  fs.writeFileSync(path.join(ARSENAL_DIR, 'github.svg'), ghSvg.trim());

  // 7. vercel.svg
  console.log('Fetching vercel.svg...');
  const vercelSvg = await fetchText('https://vercel.com/vc-ap-b3331f/_next/static/immutable/media/logo-vercel-light.1xgi91gcqswpt.svg');
  fs.writeFileSync(path.join(ARSENAL_DIR, 'vercel.svg'), vercelSvg.trim());

  // 8. supabase.svg
  console.log('Fetching supabase.svg...');
  const supabaseSvg = await fetchText('https://raw.githubusercontent.com/supabase/supabase/master/packages/common/assets/images/supabase-logo-icon.svg');
  fs.writeFileSync(path.join(ARSENAL_DIR, 'supabase.svg'), supabaseSvg.trim());

  // 9. linkedin.svg
  console.log('Building linkedin.svg...');
  const linkedinSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
  <path fill="#0A66C2" d="m37 0h-34c-1.7 0-3 1.3-3 2.9v34.2c0 1.6 1.3 2.9 3 2.9h34c1.6 0 2.9-1.3 3-2.9v-34.2c0-1.6-1.3-2.9-3-2.9zm-25.1 34.1h-6v-19.1h5.9v19.1zm-3-21.7c-1.9 0-3.4-1.5-3.4-3.4s1.5-3.5 3.4-3.5 3.4 1.5 3.4 3.4c0 2-1.5 3.5-3.4 3.5zm25.2 21.7h-5.9v-9.3c0-2.2 0-5.1-3.1-5.1s-3.6 2.4-3.6 4.9v9.4h-5.9v-19h5.7v2.6h0.1c0.8-1.5 2.7-3.1 5.6-3.1 6 0 7.1 4 7.1 9.1v10.5z"/>
</svg>`;
  fs.writeFileSync(path.join(ARSENAL_DIR, 'linkedin.svg'), linkedinSvg.trim());

  console.log('All files saved successfully!');
}

buildAll().catch(console.error);
