// scripts/check-simple-icons.js
const tools = [
  'googlegemini',
  'gemini',
  'googleflow',
  'flow',
  'higgsfield',
  'higgsfieldai',
  'adobeaftereffects',
  'aftereffects',
  'cavalry',
  'github',
  'vercel',
  'supabase',
  'linkedin'
];

async function check() {
  for (const t of tools) {
    const url = `https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/${t}.svg`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      console.log(`Simple Icons [${t}]: status ${res.status}`);
      if (res.ok) {
        const text = await res.text();
        console.log(`   Length: ${text.length}, viewBox:`, text.match(/viewBox="[^"]+"/)?.[0]);
      }
    } catch (e) {
      console.log(`Simple Icons [${t}]: error ${e.message}`);
    }
  }
}

check();
