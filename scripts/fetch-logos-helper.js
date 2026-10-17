// scripts/fetch-logos-helper.js
import fs from 'fs';
import path from 'path';

export async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

export async function fetchBuffer(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export function saveArsenalLogo(filename, content) {
  const targetPath = path.join(process.cwd(), 'arsenal-logos', filename);
  fs.writeFileSync(targetPath, content);
  console.log(`Saved ${filename} (${content.length} bytes) to ${targetPath}`);
}
