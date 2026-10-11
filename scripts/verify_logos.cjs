const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '../public/logos');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg') || f.endsWith('.png'));

console.log(`Checking ${files.length} logo files in ${dir}...\n`);
let allValid = true;

files.forEach(f => {
  const fullPath = path.join(dir, f);
  const buf = fs.readFileSync(fullPath);
  const size = buf.length;
  const sizeKb = (size / 1024).toFixed(2);
  const under30Kb = size < 30 * 1024;

  let isValid = false;
  let type = '';

  if (f.endsWith('.svg')) {
    type = 'SVG';
    const text = buf.toString('utf8');
    const hasSvgStart = /<svg[^>]*>/i.test(text);
    const hasSvgEnd = /<\/svg>/i.test(text);
    isValid = hasSvgStart && hasSvgEnd;
  } else if (f.endsWith('.png')) {
    type = 'PNG';
    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    const isPngSig = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
    isValid = isPngSig;
  }

  const pass = under30Kb && isValid;
  if (!pass) allValid = false;

  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${f.padEnd(20)} | Type: ${type.padEnd(4)} | Size: ${sizeKb.padStart(5)} KB | Valid: ${isValid} | Under 30KB: ${under30Kb}`);
});

console.log(`\nOverall Validation: ${allValid ? 'ALL FILES VALID AND UNDER 30 KB' : 'SOME FILES FAILED'}`);
