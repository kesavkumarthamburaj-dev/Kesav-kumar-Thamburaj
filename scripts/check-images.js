// scripts/check-images.js
import fs from 'fs';
import path from 'path';

function walk(dir) {
  let files = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) files = files.concat(walk(full));
    else if (full.endsWith('.jsx') || full.endsWith('.html')) files.push(full);
  }
  return files;
}

const files = walk('src');
files.push('index.html');

console.log('Checking images across', files.length, 'files...\n');
let issues = [];
let totalImages = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Strip comments (/* ... */ and // ...)
  content = content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
  const imgRegex = /<img\b([^>]*?)(\/?>)/gi;
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    totalImages++;
    const attrs = match[1];
    const hasAlt = /\balt\s*=\s*['"{]/i.test(attrs);
    const hasWidth = /\bwidth\s*=\s*['"{]/i.test(attrs);
    const hasHeight = /\bheight\s*=\s*['"{]/i.test(attrs);
    if (!hasAlt || !hasWidth || !hasHeight) {
      issues.push({
        file: path.relative(process.cwd(), file),
        snippet: match[0].replace(/\s+/g, ' ').slice(0, 120),
        hasAlt,
        hasWidth,
        hasHeight,
      });
    }
  }
});

console.log(`Audited ${totalImages} images across project.`);
console.log('Total issues found:', issues.length);
if (issues.length > 0) {
  issues.forEach(iss => console.log(iss));
} else {
  console.log('✅ All images have alt, width, and height!');
}
