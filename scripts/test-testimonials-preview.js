// scripts/test-testimonials-preview.js
// Tests that TestimonialsSection renders properly when VITE_SHOW_PLACEHOLDERS=true
process.env.VITE_SHOW_PLACEHOLDERS = 'true';

async function run() {
  const { testimonialsList, portfolioContent } = await import('../src/data/content.js?t=' + Date.now());
  console.log('--- Testimonials with VITE_SHOW_PLACEHOLDERS=true ---');
  console.log('Testimonials count:', testimonialsList.length);
  console.log('Nav items:', portfolioContent.nav.map(n => n.label));
  const hasKindWords = portfolioContent.nav.some(n => n.label === 'Kind Words');
  console.log('Nav includes "Kind Words":', hasKindWords);

  testimonialsList.forEach((t, i) => {
    console.log(`Card ${i + 1}: [${t.project}] "${t.quote}" — ${t.name} (${t.role}, ${t.company})`);
    if (t.quote.length > 220) {
      console.error(`Quote ${i + 1} exceeds 220 chars! Length: ${t.quote.length}`);
      process.exit(1);
    }
  });

  const pass = testimonialsList.length === 3 && hasKindWords;
  console.log('Testimonials placeholder test:', pass ? '✅ PASS' : '❌ FAIL');
}

run();
