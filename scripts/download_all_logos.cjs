const fs = require('fs');
const path = require('path');
const si = require('simple-icons');

const logosDir = path.resolve(__dirname, '../public/logos');
if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}

function makeSimpleIconSvg(icon, bgHex = null) {
  const hex = bgHex || icon.hex;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
  <rect width="40" height="40" rx="9" fill="#${hex}"/>
  <g transform="translate(8, 8)">
    <path fill="#FFFFFF" d="${icon.path}"/>
  </g>
</svg>`;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'KesavPortfolio/1.0 (kesavkumarthamburaj@gmail.com)'
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'KesavPortfolio/1.0 (kesavkumarthamburaj@gmail.com)'
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.text();
}

async function run() {
  const table = [];

  // 1. Affinity (affinity.svg)
  console.log('Downloading Affinity...');
  const affinitySvg = await fetchText('https://upload.wikimedia.org/wikipedia/commons/c/cf/Affinity_%28App%29_Logo.svg');
  fs.writeFileSync(path.join(logosDir, 'affinity.svg'), affinitySvg.trim());
  table.push({ tool: 'Affinity', file: 'affinity.svg', source: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Affinity_%28App%29_Logo.svg (Canva/Serif Affinity official vector)', status: 'OK' });
  await sleep(1000);

  // 2. Adobe Photoshop (photoshop.svg)
  console.log('Downloading Photoshop...');
  const psSvg = await fetchText('https://upload.wikimedia.org/wikipedia/commons/a/af/Adobe_Photoshop_CC_icon.svg');
  fs.writeFileSync(path.join(logosDir, 'photoshop.svg'), psSvg.trim());
  table.push({ tool: 'Adobe Photoshop', file: 'photoshop.svg', source: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Adobe_Photoshop_CC_icon.svg (Adobe Creative Cloud official vector)', status: 'OK' });
  await sleep(1000);

  // 3. Figma (figma.svg)
  console.log('Downloading Figma...');
  const figmaSvg = await fetchText('https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg');
  fs.writeFileSync(path.join(logosDir, 'figma.svg'), figmaSvg.trim());
  table.push({ tool: 'Figma', file: 'figma.svg', source: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg (Figma official 5-color vector)', status: 'OK' });
  await sleep(1000);

  // 4. Canva (canva.svg)
  console.log('Checking Canva...');
  const canvaExtracted = path.resolve(__dirname, '../canva_extracted/button-logo-resources/ICON - GRADIENT - RGB.svg');
  if (fs.existsSync(canvaExtracted)) {
    fs.copyFileSync(canvaExtracted, path.join(logosDir, 'canva.svg'));
    table.push({ tool: 'Canva', file: 'canva.svg', source: 'https://sdk.canva.com/v2/beta/button-logo-resources.zip (Canva Official Developer SDK)', status: 'OK' });
  }

  // 5. Pacdora (pacdora.svg + pacdora.png)
  console.log('Downloading Pacdora...');
  const pacdoraPng = await fetchBuffer('https://cdn.pacdora.com/_pacui/pacdora-icon.png');
  fs.writeFileSync(path.join(logosDir, 'pacdora.png'), pacdoraPng);
  const pacdoraSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <image href="data:image/png;base64,${pacdoraPng.toString('base64')}" width="256" height="256"/>
</svg>`;
  fs.writeFileSync(path.join(logosDir, 'pacdora.svg'), pacdoraSvg);
  table.push({ tool: 'Pacdora', file: 'pacdora.svg', source: 'https://cdn.pacdora.com/_pacui/pacdora-icon.png (Pacdora Official CDN Icon)', status: 'OK' });

  // 6. CorelDRAW (coreldraw.svg) - Simple Icons rule 2b
  console.log('Generating CorelDRAW...');
  const corelSvg = makeSimpleIconSvg(si.siCoreldraw, '000000');
  fs.writeFileSync(path.join(logosDir, 'coreldraw.svg'), corelSvg);
  table.push({ tool: 'CorelDRAW', file: 'coreldraw.svg', source: 'Simple Icons (siCoreldraw from https://www.coreldraw.com/)', status: 'OK' });

  // 7. Adobe Premiere Pro (premiere-pro.svg)
  console.log('Downloading Premiere Pro...');
  const prSvg = await fetchText('https://upload.wikimedia.org/wikipedia/commons/4/40/Adobe_Premiere_Pro_CC_icon.svg');
  fs.writeFileSync(path.join(logosDir, 'premiere-pro.svg'), prSvg.trim());
  table.push({ tool: 'Adobe Premiere Pro', file: 'premiere-pro.svg', source: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Adobe_Premiere_Pro_CC_icon.svg (Adobe Creative Cloud official vector)', status: 'OK' });
  await sleep(1000);

  // 8. Final Cut Pro (final-cut-pro.svg + final-cut-pro.png)
  console.log('Downloading Final Cut Pro...');
  const fcpPng = await fetchBuffer('https://www.apple.com/v/final-cut-pro/w/images/overview/welcome/icon_final_cut__yfw80qlav4yq_large.png');
  fs.writeFileSync(path.join(logosDir, 'final-cut-pro.png'), fcpPng);
  const fcpSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <image href="data:image/png;base64,${fcpPng.toString('base64')}" width="128" height="128"/>
</svg>`;
  fs.writeFileSync(path.join(logosDir, 'final-cut-pro.svg'), fcpSvg);
  table.push({ tool: 'Final Cut Pro', file: 'final-cut-pro.svg', source: 'https://www.apple.com/final-cut-pro/ (Apple Official Product Page)', status: 'OK' });
  await sleep(1000);

  // 9. CapCut (capcut.svg)
  console.log('Downloading CapCut...');
  const capcutSvg = await fetchText('https://upload.wikimedia.org/wikipedia/commons/1/1c/Capcut-icon.svg');
  fs.writeFileSync(path.join(logosDir, 'capcut.svg'), capcutSvg.trim());
  table.push({ tool: 'CapCut', file: 'capcut.svg', source: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Capcut-icon.svg (ByteDance CapCut official vector)', status: 'OK' });
  await sleep(1000);

  // 10. DaVinci Resolve (davinci-resolve.svg) - Simple Icons rule 2b
  console.log('Generating DaVinci Resolve...');
  const dvSvg = makeSimpleIconSvg(si.siDavinciresolve, '233A51');
  fs.writeFileSync(path.join(logosDir, 'davinci-resolve.svg'), dvSvg);
  table.push({ tool: 'DaVinci Resolve', file: 'davinci-resolve.svg', source: 'Simple Icons (siDavinciresolve from https://www.blackmagicdesign.com/)', status: 'OK' });

  // 11. Claude (claude.svg)
  console.log('Downloading Claude...');
  const claudeSvg = await fetchText('https://upload.wikimedia.org/wikipedia/commons/archive/b/b0/20260428111348%21Claude_AI_symbol.svg');
  fs.writeFileSync(path.join(logosDir, 'claude.svg'), claudeSvg.trim());
  table.push({ tool: 'Claude', file: 'claude.svg', source: 'https://upload.wikimedia.org/wikipedia/commons/archive/b/b0/20260428111348%21Claude_AI_symbol.svg (Anthropic Claude Starburst)', status: 'OK' });
  await sleep(1000);

  // 12. ChatGPT / OpenAI (chatgpt.svg)
  console.log('Downloading ChatGPT...');
  const chatgptSvg = await fetchText('https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg');
  fs.writeFileSync(path.join(logosDir, 'chatgpt.svg'), chatgptSvg.trim());
  table.push({ tool: 'ChatGPT / OpenAI', file: 'chatgpt.svg', source: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg (OpenAI Brand Guidelines)', status: 'OK' });
  await sleep(1000);

  // 13. Google Antigravity (antigravity.svg)
  console.log('Downloading Google Antigravity...');
  const agSvg = await fetchText('https://antigravity.google/favicon.svg');
  fs.writeFileSync(path.join(logosDir, 'antigravity.svg'), agSvg.trim());
  table.push({ tool: 'Google Antigravity', file: 'antigravity.svg', source: 'https://antigravity.google/favicon.svg (Official Product Assets)', status: 'OK' });

  // 14. OpenAI Codex (codex.svg)
  // Per rule: "Never redraw, recolour, distort or invent a logo. If no official file can be found, do not create a look-alike."
  // Standalone Codex logo does not exist from OpenAI (Codex was discontinued as standalone and merged into ChatGPT / OpenAI API).
  // Layout fallback tile showing first letter ('C') on column strip color will automatically display.
  // We do NOT create an invented lookalike file, exactly adhering to rule 2.
  table.push({
    tool: 'OpenAI Codex',
    file: 'codex.svg',
    source: 'None (OpenAI discontinued standalone Codex branding; folded into ChatGPT)',
    status: 'Missing (requires manual supply / fallback tile active)'
  });

  console.log('\n=== FINAL HARVEST TABLE ===');
  console.table(table);

  // Verify file sizes
  console.log('\n=== FILE SIZES IN /public/logos/ ===');
  const files = fs.readdirSync(logosDir);
  files.forEach(f => {
    const stat = fs.statSync(path.join(logosDir, f));
    console.log(`${f.padEnd(24)}: ${(stat.size / 1024).toFixed(2)} KB (${stat.size} bytes)`);
  });
}

run();
