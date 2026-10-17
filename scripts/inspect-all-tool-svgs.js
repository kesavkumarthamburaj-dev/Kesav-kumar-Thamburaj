import { portfolioContent } from '../src/data/content.js';
import fs from 'fs';
import path from 'path';

console.log('Inspecting all tool SVGs...');
for (const col of portfolioContent.arsenal.columns) {
  for (const tool of col.tools) {
    const filePath = path.resolve('public', tool.logo.replace(/^\//, ''));
    if (!fs.existsSync(filePath)) {
      console.log(`[MISSING] ${tool.name}: ${filePath}`);
      continue;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const fills = [...content.matchAll(/fill=["']([^"']+)["']/g)].map(x => x[1]).filter(f => f !== 'none');
    const strokes = [...content.matchAll(/stroke=["']([^"']+)["']/g)].map(x => x[1]).filter(s => s !== 'none');
    console.log(`Tool: ${tool.name.padEnd(16)} | File: ${tool.logo.padEnd(25)} | Fills: ${fills.slice(0, 3).join(', ')} | Strokes: ${strokes.join(', ')}`);
  }
}
