import fs from 'fs';
import path from 'path';

const ARSENAL_DIR = path.join(process.cwd(), 'arsenal-logos');
const files = fs.readdirSync(ARSENAL_DIR);

console.log('Inspecting arsenal-logos contents:');
for (const file of files) {
  const fullPath = path.join(ARSENAL_DIR, file);
  const stat = fs.statSync(fullPath);
  console.log(`\n=== ${file} (${stat.size} bytes) ===`);
  if (file.endsWith('.svg')) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const hasSvgTag = content.includes('<svg') && content.includes('</svg>');
    const viewBox = content.match(/viewBox="([^"]+)"/)?.[1] || 'no viewBox';
    console.log(`Valid SVG: ${hasSvgTag}, viewBox: ${viewBox}, first 120 chars: ${content.slice(0, 120).replace(/\r?\n/g, ' ')}`);
  } else if (file.endsWith('.png')) {
    console.log(`PNG file verified, size: ${stat.size} bytes`);
  }
}
