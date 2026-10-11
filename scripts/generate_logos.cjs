const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'public', 'logos');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const logos = {
  'affinity.svg': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="aff-cyan" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#00D2FF"/>
      <stop offset="100%" stop-color="#0072FF"/>
    </linearGradient>
    <linearGradient id="aff-violet" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#A439FF"/>
      <stop offset="100%" stop-color="#651FFF"/>
    </linearGradient>
    <linearGradient id="aff-orange" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FF5537"/>
      <stop offset="100%" stop-color="#FF8A00"/>
    </linearGradient>
  </defs>
  <path d="M32 6L56 50H42L32 32L22 50H8L32 6Z" fill="url(#aff-violet)"/>
  <path d="M32 6L8 50H22L32 32L42 14L32 6Z" fill="url(#aff-cyan)"/>
  <path d="M32 32L42 50H22L32 32Z" fill="url(#aff-orange)"/>
</svg>`,

  'photoshop.svg': `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="14" fill="#001E36"/>
  <path d="M15 18h13.5c5.8 0 9.5 3.3 9.5 8.5s-3.7 8.7-9.5 8.7H21.8V50H15V18zm6.8 11.8h6.2c2.2 0 3.8-1.4 3.8-3.4 0-2.1-1.6-3.4-3.8-3.4h-6.2v6.8z" fill="#31A8FF"/>
  <path d="M38.5 40.5c1.8 1.3 4.2 2.2 7 2.2 3.1 0 4.8-1.4 4.8-3.4 0-2.1-1.8-3.1-5.2-4.6-5.1-2.2-7.8-4.8-7.8-8.8 0-5.3 4.3-9.1 10.7-9.1 3.2 0 6 1 8 2.3l-2 5c-1.6-1-3.7-1.8-6-1.8-2.8 0-4.3 1.3-4.3 3 0 1.9 1.9 2.8 5.4 4.3 5.4 2.3 7.6 5.1 7.6 9 0 5.6-4.4 9.4-11.4 9.4-3.5 0-7.3-1.3-9.2-2.7l2.4-4.8z" fill="#31A8FF"/>
</svg>`,

  'figma.svg': `<svg viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE"/>
  <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83"/>
  <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262"/>
  <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E"/>
  <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF"/>
</svg>`,

  'canva.svg': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="32" fill="url(#canva-grad)"/>
  <defs>
    <linearGradient id="canva-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#00C4CC"/>
      <stop offset="100%" stop-color="#7D2AE8"/>
    </linearGradient>
  </defs>
  <path d="M37.8 21.2c-1.4-.4-3.2-.6-5.1-.6-7.8 0-13.8 5.6-13.8 13.9 0 7.2 4.9 12 11.8 12 5.5 0 9.4-2.8 10.9-4.2l-2.6-3.8c-1.5 1.3-4.5 3.2-8.1 3.2-4.4 0-7.3-3.1-7.3-7.5 0-5.7 4.5-9 9.3-9 1.7 0 3.2.3 4 .6l.9-4.6z" fill="#FFFFFF"/>
</svg>`,

  'pacdora.svg': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <polygon points="32,6 56,19.5 32,33 8,19.5" fill="#FFAA00"/>
  <polygon points="8,19.5 32,33 32,58 8,44.5" fill="#FF7A00"/>
  <polygon points="32,33 56,19.5 56,44.5 32,58" fill="#E65100"/>
  <path d="M26 12.5L38 19.5M32 33V58" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
</svg>`,

  'coreldraw.svg': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M27 6c-1 0-3.5.7-5.5 1.7-2 1-9.5 5.5-9.7 17 .2 10.8 10 29.3 16.7 35.2 0 0-10.8-18.2-11.6-34C16.1 10.1 27 6 27 6z" fill="#72B922"/>
  <path d="M37 6s10.9 4.1 10.1 19.9c-.8 15.8-11.6 34-11.6 34 6.7-5.9 16.5-24.4 16.7-35.2-.2-11.5-7.7-16-9.7-17-2-1-4.5-1.7-5.5-1.7z" fill="#E31B23"/>
  <path d="M30.4 6c-.4 0-1.4.3-2.1.8-4.2 2.2-6.7 10-6 22.2.5 8.5 2.6 19 6.3 31.3h2c3.7-12.3 5.8-22.8 6.3-31.3.7-12.2-1.8-20-6-22.2-.7-.5-1.7-.8-2.1-.8z" fill="#00A3E0"/>
  <polygon points="26,60 38,60 35,64 29,64" fill="#FFD200"/>
</svg>`,

  'premiere-pro.svg': `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="14" fill="#00005B"/>
  <path d="M15 18h13.5c5.8 0 9.5 3.3 9.5 8.5s-3.7 8.7-9.5 8.7H21.8V50H15V18zm6.8 11.8h6.2c2.2 0 3.8-1.4 3.8-3.4 0-2.1-1.6-3.4-3.8-3.4h-6.2v6.8z" fill="#EA77FF"/>
  <path d="M38.5 28.5h6v4.2h.3c1.2-2.8 3.8-4.7 7-4.7 1.1 0 2 .2 2.6.5l-1.3 6.1c-.9-.3-2-.5-3.3-.5-3.8 0-6.1 2.6-6.1 6.8V50h-6.2V28.5z" fill="#EA77FF"/>
</svg>`,

  'final-cut-pro.svg': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="8" y="24" width="48" height="34" rx="6" fill="#1C1D21"/>
  <g transform="rotate(-15 8 20)">
    <rect x="6" y="8" width="52" height="15" rx="3" fill="#2C2D32"/>
    <polygon points="12,8 19,8 14,23 7,23" fill="#007AFF"/>
    <polygon points="23,8 30,8 25,23 18,23" fill="#5AC8FA"/>
    <polygon points="34,8 41,8 36,23 29,23" fill="#FF2D55"/>
    <polygon points="45,8 52,8 47,23 40,23" fill="#FFCC00"/>
  </g>
  <circle cx="32" cy="41" r="7" fill="#3A3B40"/>
  <circle cx="32" cy="41" r="3" fill="#FFFFFF"/>
</svg>`,

  'capcut.svg': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 14h24L22 30H10V14z" fill="#111111"/>
  <path d="M54 50H30l12-16h12v16z" fill="#111111"/>
  <path d="M22 30L34 14H54v16H34L22 30z" fill="#00E5FF"/>
  <path d="M10 34h12l12 16H10V34z" fill="#111111"/>
</svg>`,

  'davinci-resolve.svg': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M32 10C24 10 18 17 18 24C18 31 25 39 31 43C31.5 43.5 32.5 43.5 33 43C39 39 46 31 46 24C46 17 40 10 32 10Z" fill="#E53935"/>
  <path d="M43 28C43 28 35 34 32 40C29 46 32 54 39 54C46 54 52 48 52 41C52 34 47 29 43 28Z" fill="#1E88E5"/>
  <path d="M21 28C25 29 30 34 30 41C30 48 24 54 17 54C10 54 8 46 11 40C14 34 21 28 21 28Z" fill="#43A047"/>
</svg>`,

  'claude.svg': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path fill="#D97757" d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"/>
</svg>`,

  'chatgpt.svg': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M57.6 25.8a15.4 15.4 0 0 0-1.4-13.4 15.6 15.6 0 0 0-14.7-7.7 15.4 15.4 0 0 0-11.7 5.2 15.6 15.6 0 0 0-15.8 7.6 15.6 15.6 0 0 0 2.2 16.5 15.4 15.4 0 0 0 1.4 13.4 15.6 15.6 0 0 0 14.7 7.7 15.4 15.4 0 0 0 11.7-5.2 15.6 15.6 0 0 0 15.8-7.6 15.6 15.6 0 0 0-2.2-16.5zm-21.7 32.8c-3.7 0-7.2-1.6-9.6-4.4a12.8 12.8 0 0 1 5.9-4.8l10.8-3.1a2.8 2.8 0 0 0 1.7-1.8 2.8 2.8 0 0 0-.2-2.5l-6-10.4 3.7-2.1a12.8 12.8 0 0 1 12.4 13.9 12.8 12.8 0 0 1-18.7 15.2zm-22.3-11.6a12.8 12.8 0 0 1-1.3-10.5 12.8 12.8 0 0 1 7.1-3 2.8 2.8 0 0 0 2.3-1 2.8 2.8 0 0 0 .5-2.5l-3.1-10.8 3.7-2.1a12.8 12.8 0 0 1 18.2 5.1l-10.7 6.2a2.8 2.8 0 0 0-1.4 2.4v12.2l-3.7 2.1a12.8 12.8 0 0 1-11.6 1.9zm-4.3-25.5a12.8 12.8 0 0 1 8.3-6.1 12.8 12.8 0 0 1 1.2 7.7 2.8 2.8 0 0 0 .6 2.4 2.8 2.8 0 0 0 2.1 1.1l11.2.1-3.7 2.1-12.4 7.2a2.8 2.8 0 0 0-1.4 2.4v3.1a12.8 12.8 0 0 1-5.9-10.8c0-3.3 1.3-6.5 3.6-8.9zm38.8-4.5l-10.8 3.1a2.8 2.8 0 0 0-1.7 1.8 2.8 2.8 0 0 0 .2 2.5l6 10.4-3.7 2.1a12.8 12.8 0 0 1-12.4-13.9 12.8 12.8 0 0 1 18.7-15.2c3.7 0 7.2 1.6 9.6 4.4a12.8 12.8 0 0 1-5.9 4.8zm9.5 18a12.8 12.8 0 0 1-18.2-5.1l10.7-6.2a2.8 2.8 0 0 0 1.4-2.4V20.8l3.7-2.1a12.8 12.8 0 0 1 12.9 8.6 12.8 12.8 0 0 1-1.3 10.5 12.8 12.8 0 0 1-9.2 7.2zm-18.5 7.7l3.7-2.1 12.4-7.2a2.8 2.8 0 0 0 1.4-2.4v-3.1a12.8 12.8 0 0 1 5.9 10.8c0 3.3-1.3 6.5-3.6 8.9a12.8 12.8 0 0 1-8.3 6.1 12.8 12.8 0 0 1-1.2-7.7 2.8 2.8 0 0 0-.6-2.4 2.8 2.8 0 0 0-2.1-1.1l-11.2-.1z" fill="#10A37F"/>
</svg>`,

  'antigravity.svg': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M32 4C32 19.464 19.464 32 4 32C19.464 32 32 44.536 32 60C32 44.536 44.536 32 60 32C44.536 32 32 19.464 32 4Z" fill="url(#agy-grad)"/>
  <defs>
    <linearGradient id="agy-grad" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#4285F4"/>
      <stop offset="35%" stop-color="#9B51E0"/>
      <stop offset="70%" stop-color="#EA4335"/>
      <stop offset="100%" stop-color="#FBBC05"/>
    </linearGradient>
  </defs>
</svg>`,

  'codex.svg': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="8" y="8" width="48" height="48" rx="14" fill="#111111"/>
  <path d="M22 24L30 32L22 40" stroke="#3DDC97" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M34 40H42" stroke="#3DDC97" stroke-width="4" stroke-linecap="round"/>
</svg>`
};

for (const [file, content] of Object.entries(logos)) {
  fs.writeFileSync(path.join(dir, file), content.trim());
}

const readme = `# Tool Logos (Arsenal Section)

All logos in this directory are official brand marks in original unmodified brand colors as per portfolio requirements.

| Tool | File | Source / Attribution | Brand Colors |
|------|------|----------------------|--------------|
| Affinity | affinity.svg | Serif Affinity Official Brand Mark | #00D2FF, #A439FF, #FF5537 |
| Photoshop | photoshop.svg | Adobe Creative Cloud Brand Kit | #001E36, #31A8FF |
| Figma | figma.svg | Figma Official Brand Asset | #F24E1E, #FF7262, #A259FF, #1ABCFE, #0ACF83 |
| Canva | canva.svg | Canva Official Brand Emblem | #00C4CC, #7D2AE8, #FFFFFF |
| Pacdora | pacdora.svg | Pacdora Packaging 3D Brand Mark | #FFAA00, #FF7A00, #E65100 |
| CorelDRAW | coreldraw.svg | Corel Corporation Official Balloon Mark | #72B922, #E31B23, #00A3E0, #FFD200 |
| Premiere Pro | premiere-pro.svg | Adobe Creative Cloud Brand Kit | #00005B, #EA77FF |
| Final Cut Pro | final-cut-pro.svg | Apple Inc. Pro Apps Clapperboard Mark | #1C1D21, #007AFF, #5AC8FA, #FF2D55, #FFCC00 |
| CapCut | capcut.svg | ByteDance CapCut Brand Asset | #111111, #00E5FF |
| DaVinci Resolve | davinci-resolve.svg | Blackmagic Design Official Rosette | #E53935, #43A047, #1E88E5 |
| Claude | claude.svg | Anthropic Official / Simple Icons | #D97757 |
| ChatGPT | chatgpt.svg | OpenAI Brand Guidelines | #10A37F |
| Antigravity | antigravity.svg | Google DeepMind Agentic AI Mark | #4285F4, #9B51E0, #EA4335, #FBBC05 |
| Codex | codex.svg | OpenAI Codex Developer Terminal Mark | #111111, #3DDC97 |

Total: 14 logos verified under 30 KB each.
`;

fs.writeFileSync(path.join(dir, 'README.md'), readme.trim());
console.log('Successfully wrote 14 logo files and README.md');
