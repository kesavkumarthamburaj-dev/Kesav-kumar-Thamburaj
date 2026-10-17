import { fetchText } from './fetch-logos-helper.js';

async function query() {
  const data = JSON.parse(await fetchText('https://unpkg.com/simple-icons/_data/simple-icons.json'));
  console.log('Total icons in Simple Icons:', data.icons.length);

  const targets = [
    'LinkedIn',
    'Adobe After Effects',
    'After Effects',
    'Cavalry',
    'Higgsfield',
    'Google Flow',
    'Flow',
    'Supabase',
    'Vercel',
    'GitHub',
    'Google Gemini',
    'Gemini'
  ];

  for (const t of targets) {
    const found = data.icons.find(i => 
      i.title.toLowerCase() === t.toLowerCase() || 
      (i.slug && i.slug.toLowerCase() === t.toLowerCase()) ||
      i.title.toLowerCase().includes(t.toLowerCase())
    );
    if (found) {
      const slug = found.slug || found.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      console.log(`Target [${t}] -> Title: "${found.title}", Slug: "${slug}", Hex: #${found.hex}, Source: ${found.source}`);
    } else {
      console.log(`Target [${t}] -> NOT FOUND`);
    }
  }
}

query();

