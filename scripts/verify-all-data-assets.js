// scripts/verify-all-data-assets.js
import fs from 'fs';
import path from 'path';
import { portfolioContent } from '../src/data/content.js';

console.log('--- Verifying all assets referenced in content.js ---');

let missing = [];
let found = 0;

function checkAsset(assetPath, desc) {
  if (!assetPath) return;
  const clean = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
  const distPath = path.join(process.cwd(), 'dist', clean);
  const pubPath = path.join(process.cwd(), 'public', clean);
  const exists = fs.existsSync(distPath) || fs.existsSync(pubPath);
  if (!exists) {
    missing.push({ desc, assetPath, distPath });
  } else {
    found++;
  }
}

// 1. Packaging
portfolioContent.packaging.projects.forEach(p => {
  checkAsset(p.image, `Packaging project: ${p.title}`);
});

// 2. Creatives
portfolioContent.creatives.gallery.forEach(c => {
  checkAsset(c.image, `Creative: ${c.title}`);
});

// 3. Software
portfolioContent.software.products.forEach(s => {
  checkAsset(s.image, `Software: ${s.name}`);
});

// 4. Video
portfolioContent.video?.reels?.forEach(r => {
  checkAsset(r.thumbnail, `Video reel: ${r.title}`);
});

// 5. Arsenal logos
portfolioContent.arsenal.columns.forEach(col => {
  col.tools.forEach(tool => {
    checkAsset(tool.logo, `Arsenal tool logo: ${tool.name}`);
  });
});

console.log(`Audited ${found} referenced assets in content.js.`);
if (missing.length > 0) {
  console.log('❌ Missing assets:');
  missing.forEach(m => console.log(`- ${m.desc}: ${m.assetPath}`));
} else {
  console.log('✅ 100% of referenced content assets exist on disk in dist/ & public/!');
}
