import fs from 'fs';
import path from 'path';

const srcDir = path.resolve('arsenal-logos');
const destDir = path.resolve('public/logos');

const filesToCopy = [
  'gemini.svg',
  'flow.svg',
  'flow.png',
  'higgsfield.svg',
  'after-effects.svg',
  'cavalry.svg',
  'github.svg',
  'vercel.svg',
  'supabase.svg',
  'linkedin.svg'
];

console.log('Copying official logos from arsenal-logos to public/logos:');
for (const file of filesToCopy) {
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(destDir, file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    const size = fs.statSync(destPath).size;
    console.log(`Copied ${file} (${size} bytes) -> public/logos/${file}`);
  } else {
    console.warn(`Source file not found: ${srcPath}`);
  }
}
