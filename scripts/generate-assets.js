import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const outputDir = path.resolve('public', 'work');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Helper to generate SVG string with poster/print aesthetics
function createPosterSvg({
  width,
  height,
  bgColor,
  accentColor,
  tag,
  title,
  subtitle,
  specText,
  iconShape = 'box',
  dieline = true,
  number = ''
}) {
  const dotPattern = `
    <pattern id="halftone" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
      <circle cx="8" cy="8" r="2.5" fill="#111111" opacity="0.08" />
    </pattern>
  `;

  let graphicElement = '';
  if (iconShape === 'box') {
    graphicElement = `
      <!-- 3D Packaging Pack Graphic -->
      <g transform="translate(${width / 2 - 140}, ${height / 2 - 160})">
        <!-- Isometric Bottle & Box Silhouette -->
        <rect x="30" y="40" width="160" height="260" rx="8" fill="#111111" />
        <rect x="25" y="35" width="160" height="260" rx="8" fill="${accentColor}" stroke="#111111" stroke-width="4" />
        <rect x="50" y="70" width="110" height="150" fill="#FFF8EC" stroke="#111111" stroke-width="3" />
        <text x="105" y="115" font-family="'Anton', sans-serif" font-size="22" font-weight="900" fill="#111111" text-anchor="middle">500ml</text>
        <line x1="65" y1="135" x2="145" y2="135" stroke="#111111" stroke-width="3" />
        <text x="105" y="160" font-family="'DM Sans', sans-serif" font-size="12" font-weight="700" fill="#111111" text-anchor="middle">PURE ORGANIC</text>
        <text x="105" y="180" font-family="'DM Sans', sans-serif" font-size="11" font-weight="500" fill="#111111" text-anchor="middle">COLD PRESSED</text>
        <!-- Seal top -->
        <polygon points="65,35 105,10 145,35" fill="#111111" />
        <polygon points="62,32 105,7 148,32" fill="${bgColor}" stroke="#111111" stroke-width="3" />
        <circle cx="105" cy="22" r="6" fill="#111111" />
      </g>
    `;
  } else if (iconShape === 'pouch') {
    graphicElement = `
      <!-- Stand-up Pouch Graphic -->
      <g transform="translate(${width / 2 - 120}, ${height / 2 - 150})">
        <path d="M 40,280 L 10,60 L 60,30 L 180,30 L 230,60 L 200,280 Z" fill="#111111" />
        <path d="M 35,275 L 5,55 L 55,25 L 175,25 L 225,55 L 195,275 Z" fill="${accentColor}" stroke="#111111" stroke-width="4" />
        <!-- Zipper notch -->
        <line x1="20" y1="80" x2="210" y2="80" stroke="#111111" stroke-width="3" stroke-dasharray="6,4" />
        <!-- Pouch label -->
        <rect x="45" y="105" width="140" height="130" fill="#FFF8EC" stroke="#111111" stroke-width="3" />
        <text x="115" y="145" font-family="'Anton', sans-serif" font-size="24" font-weight="900" fill="#111111" text-anchor="middle">HERITAGE</text>
        <text x="115" y="170" font-family="'DM Sans', sans-serif" font-size="12" font-weight="700" fill="#FF3D81" text-anchor="middle">SPICE BLEND</text>
        <circle cx="115" cy="205" r="14" fill="${bgColor}" stroke="#111111" stroke-width="2"/>
        <text x="115" y="210" font-family="'Anton', sans-serif" font-size="12" fill="#111111" text-anchor="middle">250g</text>
      </g>
    `;
  } else if (iconShape === 'jar') {
    graphicElement = `
      <!-- Hexagonal Jar Graphic -->
      <g transform="translate(${width / 2 - 110}, ${height / 2 - 140})">
        <rect x="25" y="55" width="170" height="190" rx="16" fill="#111111" />
        <rect x="20" y="50" width="170" height="190" rx="16" fill="${accentColor}" stroke="#111111" stroke-width="4" />
        <!-- Lid -->
        <rect x="40" y="15" width="130" height="35" rx="6" fill="#111111" />
        <rect x="35" y="10" width="130" height="35" rx="6" fill="#FFD60A" stroke="#111111" stroke-width="3" />
        <line x1="45" y1="28" x2="155" y2="28" stroke="#111111" stroke-width="2" />
        <!-- Label -->
        <rect x="45" y="85" width="120" height="120" fill="#FFF8EC" stroke="#111111" stroke-width="3" />
        <text x="105" y="125" font-family="'Anton', sans-serif" font-size="20" fill="#111111" text-anchor="middle">RAW FOREST</text>
        <text x="105" y="150" font-family="'DM Sans', sans-serif" font-size="12" font-weight="700" fill="#FF7A1A" text-anchor="middle">WILD HONEY</text>
        <text x="105" y="180" font-family="'DM Sans', sans-serif" font-size="11" fill="#111111" text-anchor="middle">TAMIL NADU</text>
      </g>
    `;
  } else if (iconShape === 'poster') {
    graphicElement = `
      <!-- Screenprint Risograph Graphic -->
      <g transform="translate(${width / 2 - 130}, ${height / 2 - 170})">
        <rect x="15" y="15" width="230" height="290" fill="#111111" />
        <rect x="10" y="10" width="230" height="290" fill="#FFF8EC" stroke="#111111" stroke-width="4" />
        <circle cx="125" cy="110" r="60" fill="${accentColor}" stroke="#111111" stroke-width="3" />
        <text x="125" y="120" font-family="'Anton', sans-serif" font-size="34" fill="#111111" text-anchor="middle">RISO</text>
        <!-- Typographic stripes -->
        <rect x="30" y="195" width="190" height="18" fill="#111111" />
        <rect x="30" y="222" width="140" height="18" fill="${bgColor}" stroke="#111111" stroke-width="2" />
        <rect x="30" y="249" width="170" height="12" fill="#111111" />
      </g>
    `;
  } else if (iconShape === 'reel') {
    graphicElement = `
      <!-- Video Reel Graphic with Play Badge -->
      <g transform="translate(${width / 2 - 100}, ${height / 2 - 130})">
        <rect x="15" y="15" width="170" height="240" rx="12" fill="#111111" />
        <rect x="10" y="10" width="170" height="240" rx="12" fill="#1F2438" stroke="#111111" stroke-width="4" />
        <!-- Big Play Ring -->
        <circle cx="95" cy="115" r="42" fill="${accentColor}" stroke="#111111" stroke-width="4" />
        <polygon points="85,95 85,135 120,115" fill="#111111" />
        <!-- Audio waveform bars -->
        <g transform="translate(30, 180)">
          <rect x="0" y="20" width="6" height="25" fill="${accentColor}" />
          <rect x="12" y="10" width="6" height="35" fill="#FFF8EC" />
          <rect x="24" y="5" width="6" height="40" fill="${accentColor}" />
          <rect x="36" y="18" width="6" height="27" fill="#FFF8EC" />
          <rect x="48" y="2" width="6" height="43" fill="${accentColor}" />
          <rect x="60" y="12" width="6" height="33" fill="#FFF8EC" />
          <rect x="72" y="24" width="6" height="21" fill="${accentColor}" />
          <rect x="84" y="8" width="6" height="37" fill="#FFF8EC" />
          <rect x="96" y="15" width="6" height="30" fill="${accentColor}" />
          <rect x="108" y="22" width="6" height="23" fill="#FFF8EC" />
          <rect x="120" y="10" width="6" height="35" fill="${accentColor}" />
        </g>
      </g>
    `;
  } else if (iconShape === 'software') {
    graphicElement = `
      <!-- Software UI Preview Graphic -->
      <g transform="translate(${width / 2 - 170}, ${height / 2 - 120})">
        <rect x="15" y="15" width="310" height="210" rx="8" fill="#111111" />
        <rect x="10" y="10" width="310" height="210" rx="8" fill="#FFFFFF" stroke="#111111" stroke-width="4" />
        <!-- Window title bar -->
        <rect x="10" y="10" width="310" height="32" fill="#111111" />
        <circle cx="28" cy="26" r="5" fill="#FF3D81" />
        <circle cx="44" cy="26" r="5" fill="#FFD60A" />
        <circle cx="60" cy="26" r="5" fill="#3DDC97" />
        <text x="165" y="30" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" fill="#FFF8EC" text-anchor="middle">APP DASHBOARD</text>
        <!-- App content mockup -->
        <rect x="25" y="58" width="80" height="145" fill="#F4F4F6" stroke="#111111" stroke-width="2" />
        <rect x="118" y="58" width="185" height="45" fill="${accentColor}" stroke="#111111" stroke-width="2" />
        <rect x="118" y="115" width="85" height="40" fill="#FFF8EC" stroke="#111111" stroke-width="2" />
        <rect x="215" y="115" width="88" height="40" fill="#FFF8EC" stroke="#111111" stroke-width="2" />
        <rect x="118" y="167" width="185" height="35" fill="#111111" />
        <text x="210" y="189" font-family="'Anton', sans-serif" font-size="14" fill="#FFD60A" text-anchor="middle">GENERATE GST INVOICE</text>
      </g>
    `;
  }

  const dielineElements = dieline ? `
    <!-- Registration Marks & Technical Dieline Marks -->
    <g opacity="0.35" stroke="#111111" stroke-width="1.5">
      <!-- Top Left Registration Cross -->
      <circle cx="35" cy="35" r="14" fill="none" />
      <line x1="35" y1="15" x2="35" y2="55" />
      <line x1="15" y1="35" x2="55" y2="35" />

      <!-- Top Right Registration Cross -->
      <circle cx="${width - 35}" cy="35" r="14" fill="none" />
      <line x1="${width - 35}" y1="15" x2="${width - 35}" y2="55" />
      <line x1="${width - 55}" y1="35" x2="${width - 15}" y2="35" />

      <!-- Bottom Registration Cross -->
      <circle cx="35" cy="${height - 35}" r="14" fill="none" />
      <line x1="35" y1="${height - 55}" x2="35" y2="${height - 15}" />
      <line x1="15" y1="${height - 35}" x2="55" y2="${height - 35}" />

      <!-- Technical Border Guide Lines -->
      <line x1="20" y1="20" x2="${width - 20}" y2="20" stroke-dasharray="8,6" />
      <line x1="20" y1="${height - 20}" x2="${width - 20}" y2="${height - 20}" stroke-dasharray="8,6" />
      <line x1="20" y1="20" x2="20" y2="${height - 20}" stroke-dasharray="8,6" />
      <line x1="${width - 20}" y1="20" x2="${width - 20}" y2="${height - 20}" stroke-dasharray="8,6" />
    </g>
  ` : '';

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        ${dotPattern}
      </defs>

      <!-- Background solid pop color -->
      <rect width="${width}" height="${height}" fill="${bgColor}" />

      <!-- Halftone overlay -->
      <rect width="${width}" height="${height}" fill="url(#halftone)" />

      ${dielineElements}

      <!-- Top Tag Sticker -->
      <g transform="translate(35, 45)">
        <rect x="0" y="0" width="${tag.length * 9.5 + 24}" height="32" rx="4" fill="#111111" />
        <rect x="-3" y="-3" width="${tag.length * 9.5 + 24}" height="32" rx="4" fill="#FFD60A" stroke="#111111" stroke-width="2.5" />
        <text x="${(tag.length * 9.5 + 24) / 2 - 3}" y="18" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" fill="#111111" text-anchor="middle" letter-spacing="1">${tag.toUpperCase()}</text>
      </g>

      ${number ? `
        <!-- Number Tag -->
        <g transform="translate(${width - 85}, 45)">
          <rect x="0" y="0" width="50" height="32" rx="4" fill="#111111" />
          <rect x="-3" y="-3" width="50" height="32" rx="4" fill="#FFFFFF" stroke="#111111" stroke-width="2.5" />
          <text x="22" y="19" font-family="'Anton', sans-serif" font-size="16" fill="#111111" text-anchor="middle">${number}</text>
        </g>
      ` : ''}

      <!-- Main Illustrated Graphic -->
      ${graphicElement}

      <!-- Bottom Information Ribbon / Placard -->
      <g transform="translate(30, ${height - 130})">
        <rect x="5" y="5" width="${width - 60}" height="95" rx="6" fill="#111111" />
        <rect x="0" y="0" width="${width - 60}" height="95" rx="6" fill="#FFF8EC" stroke="#111111" stroke-width="3" />
        
        <!-- Title -->
        <text x="20" y="34" font-family="'Anton', sans-serif" font-size="24" font-weight="900" fill="#111111" letter-spacing="0.5">${title.toUpperCase().replace(/&/g, '&amp;')}</text>
        
        <!-- Subtitle -->
        <text x="20" y="58" font-family="'DM Sans', sans-serif" font-size="13" font-weight="700" fill="#111111">${subtitle.replace(/&/g, '&amp;')}</text>
        
        <!-- Spec text / Replacement badge -->
        <text x="20" y="78" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" fill="#FF3D81">${specText.toUpperCase().replace(/&/g, '&amp;')}</text>
      </g>
    </svg>
  `;
}

// Generate assets list
const assets = [
  // PACKAGING (6 items, 800x1000)
  {
    filename: 'packaging-aura-oil.webp',
    width: 800,
    height: 1000,
    bgColor: '#FF3D81',
    accentColor: '#FFD60A',
    tag: 'FMCG Organic Food',
    title: 'Aura Cold-Pressed Oils',
    subtitle: '500ml Glass Bottle & Outer Carton Box',
    specText: 'REPLACE WITH YOUR PACK MOCKUP (800x1000 WebP)',
    iconShape: 'box'
  },
  {
    filename: 'packaging-kaveri-spices.webp',
    width: 800,
    height: 1000,
    bgColor: '#FF7A1A',
    accentColor: '#3DDC97',
    tag: 'Heritage Spices',
    title: 'Kaveri Heritage Masalas',
    subtitle: '250g Stand-up Zipper Pouch with Aroma Valve',
    specText: 'REPLACE WITH YOUR PACK MOCKUP (800x1000 WebP)',
    iconShape: 'pouch'
  },
  {
    filename: 'packaging-botanica-luxe.webp',
    width: 800,
    height: 1000,
    bgColor: '#3DDC97',
    accentColor: '#FF3D81',
    tag: 'Ayurvedic Wellness',
    title: 'Botanica Luxe Herbal Care',
    subtitle: '200ml Amber Pump Bottle & Rigid Mailer',
    specText: 'REPLACE WITH YOUR PACK MOCKUP (800x1000 WebP)',
    iconShape: 'box'
  },
  {
    filename: 'packaging-nilgiri-coffee.webp',
    width: 800,
    height: 1000,
    bgColor: '#2F5BFF',
    accentColor: '#FFD60A',
    tag: 'Specialty Coffee',
    title: 'Nilgiri Mountain Brew',
    subtitle: '250g Matte Tin Canister & Degassing Valve Pack',
    specText: 'REPLACE WITH YOUR PACK MOCKUP (800x1000 WebP)',
    iconShape: 'box'
  },
  {
    filename: 'packaging-vanam-honey.webp',
    width: 800,
    height: 1000,
    bgColor: '#FFD60A',
    accentColor: '#FF7A1A',
    tag: 'Sustainable Agro',
    title: 'Vanam Raw Forest Honey',
    subtitle: '350g Hexagonal Jar with Tamper-Proof Tag',
    specText: 'REPLACE WITH YOUR PACK MOCKUP (800x1000 WebP)',
    iconShape: 'jar'
  },
  {
    filename: 'packaging-podi-tin.webp',
    width: 800,
    height: 1000,
    bgColor: '#FFF8EC',
    accentColor: '#FF3D81',
    tag: 'Heritage Ready-to-Eat',
    title: 'Podi & Co. Condiments',
    subtitle: '200g Cylindrical Tin Canister with Food Grade Seal',
    specText: 'REPLACE WITH YOUR PACK MOCKUP (800x1000 WebP)',
    iconShape: 'box'
  },

  // POSTERS, BANNERS & WEB CREATIVES (6 items, masonry dimensions)
  {
    filename: 'poster-filter-kaapi.webp',
    width: 800,
    height: 1100,
    bgColor: '#3DDC97',
    accentColor: '#FF3D81',
    tag: 'Screenprint Typographic Poster',
    number: '#01',
    title: 'Filter Kaapi Club',
    subtitle: '3-Color Screenprint Tribute to South Indian Brews',
    specText: 'REPLACE WITH YOUR CREATIVE (800x1100 WebP)',
    iconShape: 'poster'
  },
  {
    filename: 'poster-tamil-noir.webp',
    width: 800,
    height: 950,
    bgColor: '#FFD60A',
    accentColor: '#111111',
    tag: 'Film Festival Poster',
    number: '#02',
    title: 'Tamil Cinema Noir',
    subtitle: 'High-Contrast Monochromatic Screenprint',
    specText: 'REPLACE WITH YOUR CREATIVE (800x950 WebP)',
    iconShape: 'poster'
  },
  {
    filename: 'poster-mango-banner.webp',
    width: 800,
    height: 1050,
    bgColor: '#FF7A1A',
    accentColor: '#FFD60A',
    tag: 'Retail FMCG Campaign',
    number: '#03',
    title: 'Summer Mango Meltdown',
    subtitle: 'High-Impact Point-of-Sale Retail Display',
    specText: 'REPLACE WITH YOUR CREATIVE (800x1050 WebP)',
    iconShape: 'pouch'
  },
  {
    filename: 'poster-coimbatore-gig.webp',
    width: 800,
    height: 1150,
    bgColor: '#2F5BFF',
    accentColor: '#FF3D81',
    tag: 'Music Event Poster',
    number: '#04',
    title: 'Coimbatore Indie Gig',
    subtitle: 'Halftone Print with Distorted Typography',
    specText: 'REPLACE WITH YOUR CREATIVE (800x1150 WebP)',
    iconShape: 'poster'
  },
  {
    filename: 'poster-gathex-keynote.webp',
    width: 800,
    height: 950,
    bgColor: '#FF3D81',
    accentColor: '#3DDC97',
    tag: 'Tech Launch Visuals',
    number: '#05',
    title: 'SaaS Launch Creatives',
    subtitle: 'Geometric Social Banners & Ad Campaign Kit',
    specText: 'REPLACE WITH YOUR CREATIVE (800x950 WebP)',
    iconShape: 'poster'
  },
  {
    filename: 'poster-rice-revival.webp',
    width: 800,
    height: 1100,
    bgColor: '#FFF8EC',
    accentColor: '#FF7A1A',
    tag: 'Heritage Revival',
    number: '#06',
    title: 'Traditional Rice Heritage',
    subtitle: 'Tamil Typography & Sustainable Agriculture Poster',
    specText: 'REPLACE WITH YOUR CREATIVE (800x1100 WebP)',
    iconShape: 'poster'
  },

  // VIDEO REELS (3 items, 800x1200 9:16 vertical)
  {
    filename: 'reel-packaging-shelf.webp',
    width: 800,
    height: 1200,
    bgColor: '#2F5BFF',
    accentColor: '#FFD60A',
    tag: '0:42 Reel',
    title: 'Packaging Reveal Reel',
    subtitle: 'Dieline to 3D Render & Shelf Placement Showcase',
    specText: 'REPLACE WITH YOUR REEL THUMB (800x1200 WebP)',
    iconShape: 'reel'
  },
  {
    filename: 'reel-commercial-ad.webp',
    width: 800,
    height: 1200,
    bgColor: '#FF3D81',
    accentColor: '#3DDC97',
    tag: '0:30 Reel',
    title: 'Commercial Social Ad',
    subtitle: 'Snappy Cuts & Sound Design for D2C Beverage',
    specText: 'REPLACE WITH YOUR REEL THUMB (800x1200 WebP)',
    iconShape: 'reel'
  },
  {
    filename: 'reel-brand-story.webp',
    width: 800,
    height: 1200,
    bgColor: '#FF7A1A',
    accentColor: '#FFD60A',
    tag: '0:58 Reel',
    title: 'Brand Storytelling Reel',
    subtitle: 'Cinematic Montage & Client Brand Unveilings',
    specText: 'REPLACE WITH YOUR REEL THUMB (800x1200 WebP)',
    iconShape: 'reel'
  },

  // SOFTWARE PRODUCTS (4 items, 1000x700)
  {
    filename: 'software-gathex-invoice.webp',
    width: 1000,
    height: 700,
    bgColor: '#FF7A1A',
    accentColor: '#FFD60A',
    tag: 'Status: Live',
    title: 'Gathex Invoice',
    subtitle: 'GST-Compliant Invoicing SaaS for Indian Businesses',
    specText: 'REPLACE WITH YOUR APP SCREENSHOT (1000x700 WebP)',
    iconShape: 'software'
  },
  {
    filename: 'software-gathex-chat.webp',
    width: 1000,
    height: 700,
    bgColor: '#2F5BFF',
    accentColor: '#3DDC97',
    tag: 'Status: In build',
    title: 'Gathex Chat',
    subtitle: 'End-to-End Encrypted Messaging Application',
    specText: 'REPLACE WITH YOUR APP SCREENSHOT (1000x700 WebP)',
    iconShape: 'software'
  },
  {
    filename: 'software-krishna-eng.webp',
    width: 1000,
    height: 700,
    bgColor: '#3DDC97',
    accentColor: '#FF3D81',
    tag: 'Status: Client work',
    title: 'Krishna Engineering',
    subtitle: 'Automated Industrial Quotation Pipeline App',
    specText: 'REPLACE WITH YOUR APP SCREENSHOT (1000x700 WebP)',
    iconShape: 'software'
  },
  {
    filename: 'software-vishakha.webp',
    width: 1000,
    height: 700,
    bgColor: '#FFD60A',
    accentColor: '#111111',
    tag: 'Status: Client work',
    title: 'Vishakha Quotation',
    subtitle: 'Mobile-First Quotation App (Vishakha Industries, CBE)',
    specText: 'REPLACE WITH YOUR APP SCREENSHOT (1000x700 WebP)',
    iconShape: 'software'
  }
];

async function generateAll() {
  console.log(`Generating ${assets.length} WebP images into ${outputDir}...`);

  for (const item of assets) {
    const svg = createPosterSvg(item);
    const dest = path.join(outputDir, item.filename);

    await sharp(Buffer.from(svg))
      .webp({ quality: 90 })
      .toFile(dest);

    console.log(`Created: ${item.filename} (${item.width}x${item.height})`);
  }

  // Also create Open Graph image og-image.png (1200x630)
  const ogSvg = createPosterSvg({
    width: 1200,
    height: 630,
    bgColor: '#FFD60A',
    accentColor: '#FF3D81',
    tag: 'Portfolio 2026',
    title: 'KESAV KUMAR T',
    subtitle: 'Packaging Designer, Video Editor & Software Founder | Tamil Nadu, India',
    specText: 'POSTER WALL PORTFOLIO',
    iconShape: 'poster'
  });

  await sharp(Buffer.from(ogSvg))
    .png()
    .toFile(path.resolve('public', 'og-image.png'));

  console.log('Created: public/og-image.png');
  console.log('All image assets successfully generated!');
}

generateAll().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
