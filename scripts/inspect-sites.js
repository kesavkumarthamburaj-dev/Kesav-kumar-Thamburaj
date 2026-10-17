import { fetchText } from './fetch-logos-helper.js';

async function inspectSites() {
  console.log('--- Inspecting Cavalry ---');
  try {
    const cavHtml = await fetchText('https://cavalry.scenegroup.co');
    const cavSvgs = cavHtml.match(/https?:\/\/[^"'\s]+\.svg/gi) || [];
    console.log('Cavalry SVGs:', cavSvgs);
    const cavIcons = cavHtml.match(/<link[^>]+(?:icon|shortcut)[^>]*>/gi) || [];
    console.log('Cavalry Icons:', cavIcons);
    const cavImgs = cavHtml.match(/<img[^>]+(?:logo|icon)[^>]*>/gi) || [];
    console.log('Cavalry Imgs:', cavImgs);
  } catch (e) {
    console.log('Cavalry error:', e.message);
  }

  console.log('\n--- Inspecting Higgsfield ---');
  try {
    const hfHtml = await fetchText('https://higgsfield.ai');
    const hfSvgs = hfHtml.match(/https?:\/\/[^"'\s]+\.svg/gi) || [];
    console.log('Higgsfield SVGs:', hfSvgs);
    const hfIcons = hfHtml.match(/<link[^>]+(?:icon|shortcut)[^>]*>/gi) || [];
    console.log('Higgsfield Icons:', hfIcons);
    const hfImgs = hfHtml.match(/<img[^>]+(?:logo|icon)[^>]*>/gi) || [];
    console.log('Higgsfield Imgs:', hfImgs);
  } catch (e) {
    console.log('Higgsfield error:', e.message);
  }
}

inspectSites();
