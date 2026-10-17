// scripts/verify-conditionals.js
import { isRealUrl, testimonialsList, portfolioContent } from '../src/data/content.js';

console.log('--- 1. Testing isRealUrl helper ---');
console.log('Placeholder URL ("https://www.linkedin.com/in/YOUR-PROFILE/"):', isRealUrl("https://www.linkedin.com/in/YOUR-PROFILE/"), '(Expect false)');
console.log('Empty URL (""):', isRealUrl(""), '(Expect false)');
console.log('Hash URL ("#"):', isRealUrl("#"), '(Expect false)');
console.log('Real URL ("https://www.linkedin.com/in/kesavkumar/"):', isRealUrl("https://www.linkedin.com/in/kesavkumar/"), '(Expect true)');

console.log('\n--- 2. Testing Testimonials Default State ---');
console.log('Default testimonialsList length:', testimonialsList.length, '(Expect 0)');
console.log('Default nav items:', portfolioContent.nav.map(n => n.label));
const hasKindWordsInNav = portfolioContent.nav.some(n => n.label.toLowerCase().includes('kind words'));
console.log('Nav contains Kind Words when empty:', hasKindWordsInNav, '(Expect false)');

const allPassed =
  !isRealUrl("https://www.linkedin.com/in/YOUR-PROFILE/") &&
  isRealUrl("https://www.linkedin.com/in/kesavkumar/") &&
  testimonialsList.length === 0 &&
  !hasKindWordsInNav;

console.log('\nResult:', allPassed ? '✅ PASS' : '❌ FAIL');
if (!allPassed) process.exit(1);
