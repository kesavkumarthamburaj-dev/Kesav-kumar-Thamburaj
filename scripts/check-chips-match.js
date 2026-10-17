import fs from 'fs';
import path from 'path';
import { portfolioContent } from '../src/data/content.js';
import { TOOL_LOGOS } from '../src/data/motion.config.js';

const logosDir = path.resolve('public/logos');
const existingFiles = fs.readdirSync(logosDir);

console.log('Real files in public/logos:');
existingFiles.forEach(f => console.log('  -', f));

console.log('\n--- Checking portfolioContent.arsenal tools ---');
portfolioContent.arsenal.columns.forEach(col => {
  col.tools.forEach(tool => {
    const logoFile = tool.logo ? path.basename(tool.logo) : null;
    const exists = logoFile ? existingFiles.includes(logoFile) : false;
    console.log(`[${col.title}] ${tool.name}: ${tool.logo} -> exists: ${exists}`);
  });
});

console.log('\n--- Checking TOOL_LOGOS in motion.config.js ---');
TOOL_LOGOS.forEach(tool => {
  const logoFile = tool.logo ? path.basename(tool.logo) : null;
  const exists = logoFile ? existingFiles.includes(logoFile) : false;
  console.log(`${tool.name}: ${tool.logo} -> exists: ${exists}`);
});
