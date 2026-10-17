import fs from 'fs';

const r = JSON.parse(fs.readFileSync('lighthouse-report.json', 'utf8'));
console.log('--- LIGHTHOUSE MOBILE SCORES ---');
for (const [k, v] of Object.entries(r.categories)) {
  console.log(`${v.title}: ${Math.round(v.score * 100)} / 100`);
}
console.log('\n--- CORE WEB VITALS & METRICS ---');
const metrics = [
  'first-contentful-paint',
  'largest-contentful-paint',
  'total-blocking-time',
  'cumulative-layout-shift',
  'speed-index',
];
metrics.forEach(m => {
  const audit = r.audits[m];
  console.log(`${audit.title}: ${audit.displayValue} (Score: ${Math.round(audit.score * 100)})`);
});

console.log('\n--- OPPORTUNITIES / DIAGNOSTICS ---');
Object.values(r.audits)
  .filter(a => a.details && a.details.type === 'opportunity' && a.score < 0.9)
  .forEach(a => {
    console.log(`- ${a.title}: ${a.displayValue || ''}`);
  });
