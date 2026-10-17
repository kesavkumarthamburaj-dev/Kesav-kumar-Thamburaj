// src/data/content.js
// Central source of truth for all portfolio content.
// Edit this file to update projects, reel links, copy, tools, and URLs without touching React components.

import { motionConfig, TOOL_LOGOS } from './motion.config.js';

// Single source of truth for portfolio site URL (no trailing slash).
// When your custom domain is live, change only this constant.
export const SITE_URL = "https://kesav-kumar-thamburaj.vercel.app";

const socialLinks = {
  instagram: "https://www.instagram.com/kesavkumarthamburaj/",
  linkedin: "https://www.linkedin.com/in/kesavkumart/",
};

/**
 * Checks whether a URL is a real public link rather than a template placeholder or empty string.
 */
export function isRealUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return trimmed.length > 0 && !trimmed.includes('YOUR-PROFILE') && trimmed !== '#';
}

/**
 * Client testimonials array:
 * Format: { quote, name, role, company, project }
 * Per instructions: Shipped as an empty array.
 * When empty, the entire Testimonials section AND its nav link are automatically hidden.
 * Real client entries can be added here when received.
 * For local dev preview only, set VITE_SHOW_PLACEHOLDERS=true in .env to view sample cards.
 */
const placeholderTestimonials = [
  {
    quote: "Kesav delivered high-impact dieline packaging that instantly dominated our retail shelf presence. Remarkable turnaround and precision.",
    name: "Karthik Raja",
    role: "Founder",
    company: "Aura Organics",
    project: "Packaging",
  },
  {
    quote: "Engineered our custom quotation software with lightning-fast GST math and rock-solid offline reliability. Exceptional product builder.",
    name: "Suresh Kumar",
    role: "Managing Director",
    company: "Krishna Engineering",
    project: "App",
  },
  {
    quote: "His visual sense for rhythmic social reels and campaign banners drove our strongest seasonal conversion spike to date.",
    name: "Priya Mohan",
    role: "Marketing Head",
    company: "Vanam Co-op",
    project: "Video",
  },
];

const realTestimonials = [
  {
    quote: "The custom quotation application has streamlined our engineering quotation workflow. Managing raw-material prices, calculating multi-component BOM costs, and generating quotations has become more organized and efficient. The automated GST calculations and export features make our estimation process much easier.",
    name: "Anand Kumar",
    role: "Owner",
    company: "Krishna Engineering",
    project: "Custom Engineering Quotation Software",
  },
  {
    quote: "The quotation application has made it easier for our field sales team to prepare quotations directly from the factory floor. The offline functionality is especially useful when internet connectivity is limited, while automatic synchronization keeps our data updated.",
    name: "Anand Kumar",
    role: "Owner",
    company: "Vishakha Industries, Coimbatore",
    project: "Mobile-First Quotation Application",
  },
];

const showPlaceholders =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SHOW_PLACEHOLDERS === 'true') ||
  (typeof process !== 'undefined' && process.env && process.env.VITE_SHOW_PLACEHOLDERS === 'true');

export const testimonialsList = showPlaceholders ? placeholderTestimonials : realTestimonials;
export const testimonials = testimonialsList;

export const portfolioContent = {
  motion: motionConfig,
  toolLogos: TOOL_LOGOS,
  social: socialLinks,
  profile: {
    name: "Kesav Kumar T",
    shortName: "KESAV",
    title: "Packaging Designer, Video Editor & Software Founder",
    location: "Tamil Nadu, India",
    email: "kesavkumarthamburaj@gmail.com",
    siteUrl: SITE_URL,
    url: `${SITE_URL}/`,
    instagramUrl: socialLinks.instagram,
    linkedinUrl: socialLinks.linkedin,
    githubUrl: "https://github.com",
    copyrightYear: 2026,
  },

  get nav() {
    return [
      { label: "Packaging", href: "#packaging" },
      { label: "Posters & Creatives", href: "#creatives" },
      { label: "Software", href: "#software" },
      ...(testimonialsList.length > 0 ? [{ label: "Kind Words", href: "#testimonials" }] : []),
      { label: "Arsenal", href: "#arsenal" },
      { label: "Contact", href: "#contact" },
    ];
  },

  hero: {
    headlineParts: ["KESAV", "DESIGNS", "THE SHELF."],
    sticker: "Open for projects",
    subtitle: "Packaging designer, video editor and software founder from Tamil Nadu.",
    ctaPrimary: {
      label: "See my work",
      href: "#packaging",
    },
    ctaSecondary: {
      label: "Say hello",
      href: "#contact",
    },
    stats: [
      { value: "40+", label: "Packs Engineered" },
      { value: "100+", label: "Commercial Edits" },
      { value: "4", label: "SaaS & Apps Built" },
    ],
  },

  packaging: {
    sectionId: "packaging",
    tag: "FMCG PACKAGING",
    headline: "THE SHELF SPEAKS FIRST.",
    description: "Screen-printed aesthetic meets industrial dieline precision. Pack mockups engineered to conquer consumer attention at point of sale.",
    projects: [
      {
        id: "pack-1",
        title: "Aura Organics Cold-Pressed Oils",
        clientType: "FMCG Organic Food Brand",
        pack: "500ml Glass Bottle & Outer Rigid Carton",
        deliverables: "Dieline CAD, Label Artwork, 3D Render, Pacdora Mockup",
        image: "/work/packaging-aura-oil.webp",
        width: 768,
        height: 1024,
        rotation: -2.4, // Rotated between -3 and 3 degrees
        accentColor: "#FFD60A",
        details: "Cold-pressed virgin sesame and groundnut oil packaging. Dual-layer dieline structure designed for humidity-resistant kraft substrate with opaque ink screenprint finish.",
        tags: ["Bottle Label", "Outer Box", "FMCG", "CMYK + Spot Gold"],
      },
      {
        id: "pack-2",
        title: "Kaveri Heritage Masalas",
        clientType: "Regional Spice Manufacturer (Madurai)",
        pack: "250g Stand-up Zipper Pouch with Aroma Valve",
        deliverables: "Print-ready Flexo Plates, Typography Grid, Barcode Specs",
        image: "/work/packaging-kaveri-spices.webp",
        width: 768,
        height: 1024,
        rotation: 1.8,
        accentColor: "#3DDC97",
        details: "Authentic spice blend series for retail distribution. High-barrier multi-layer laminated pouch ensuring aroma longevity with high-contrast riso-inspired packaging artwork.",
        tags: ["Zipper Pouch", "Flexo Print", "FMCG Food", "Retail"],
      },
      {
        id: "pack-3",
        title: "Botanica Luxe Herbal Care",
        clientType: "D2C Ayurvedic Wellness Brand (Chennai)",
        pack: "200ml Amber Pump Bottle & Corrugated Mailer",
        deliverables: "Silk Screen Vector Art, Metallic Foil Layer, Product 3D",
        image: "/work/packaging-botanica-luxe.webp",
        width: 768,
        height: 1024,
        rotation: -1.6,
        accentColor: "#FF3D81",
        details: "Screen-printed apothecary aesthetic for organic hair rejuvenation line. 360-degree cylindrical label wrap with tactile varnish and tactile foil accents.",
        tags: ["Cosmetic Pump", "Direct Silk Screen", "D2C", "Eco Mailer"],
      },
      {
        id: "pack-4",
        title: "Nilgiri Mountain Brew Specialty Coffee",
        clientType: "Estate Coffee Roasters (Ooty)",
        pack: "250g Matte Tin Canister & Kraft Valve Pouch",
        deliverables: "Dielline Artwork, Spot UV Layer, Retail Display Shipper",
        image: "/work/packaging-nilgiri-coffee.webp",
        width: 768,
        height: 1024,
        rotation: 2.7,
        accentColor: "#FFD60A",
        details: "Single-origin Arabica roast packaging. High-gauge tinplate canister with airtight rubber gasket seal and screen-printed metallic ink graphics.",
        tags: ["Coffee Canister", "Valve Bag", "Tinplate", "Spot UV"],
      },
      {
        id: "pack-5",
        title: "Vanam Raw Forest Honey",
        clientType: "Sustainable Agro Cooperative (Erode)",
        pack: "350g Hexagonal Glass Jar with Tamper Tag",
        deliverables: "Jar Label, Tamper Ribbon, Batch Neck Tag, 3D Render",
        image: "/work/packaging-vanam-honey.webp",
        width: 768,
        height: 1024,
        rotation: -2.8,
        accentColor: "#FF7A1A",
        details: "Wild harvested forest honey jar. Textured handmade cotton paper label with die-cut hexagonal viewing window and security tear-strip.",
        tags: ["Glass Jar", "Tamper Seal", "Die-Cut", "Textured Paper"],
      },
      {
        id: "pack-6",
        title: "Podi & Co. Traditional Condiments",
        clientType: "Heritage Ready-to-Eat Food Co. (Salem)",
        pack: "200g Cylindrical Tin Canister with Food-Grade Seal",
        deliverables: "Dielline Wrap, Offset Printing Separations, Packshots",
        image: "/work/packaging-podi-tin.webp",
        width: 768,
        height: 1024,
        rotation: 1.2,
        accentColor: "#FF3D81",
        details: "South Indian traditional spice powder line. Nostalgic typography set against bold punchy color blocks engineered for instant retail eye-tracking.",
        tags: ["Composite Can", "Food Grade", "Shelf Display", "Offset Print"],
      },
    ],
  },

  creatives: {
    sectionId: "creatives",
    tag: "POSTERS & BANNERS",
    headline: "INK ON PAPER. NOISE ON THE FEED.",
    description: "Screen-printed posters, retail campaign banners, and high-voltage digital creatives. Numbered prints crafted with halftone rigor.",
    gallery: [
      {
        id: "creative-1",
        numberTag: "#01",
        title: "Filter Kaapi Club",
        category: "Typographic Poster",
        format: "Screenprint 3-Color Riso",
        image: "/work/poster-filter-kaapi.webp",
        width: 768,
        height: 1024,
        details: "A typographic love letter to South Indian coffee culture. Printed with pure sunflower yellow, warm ink, and hot fluorescent pink separations.",
      },
      {
        id: "creative-2",
        numberTag: "#02",
        title: "Summer Mango Meltdown",
        category: "Retail FMCG Banner",
        format: "Large Format Retail POS",
        image: "/work/poster-mango-banner.webp",
        width: 768,
        height: 1024,
        details: "Vibrant point-of-sale store banner engineered to jump out in crowded retail supermarket aisles during peak seasonal fruit nectar launch.",
      },
      {
        id: "creative-3",
        numberTag: "#03",
        title: "Tamil Cinema Noir",
        category: "Film Festival Poster",
        format: "Monochrome & Ink Punch",
        image: "/work/poster-tamil-noir.webp",
        width: 683,
        height: 1024,
        details: "High-contrast minimalist film festival poster celebrating classic cinematic storytelling with deep shadows and razor-sharp type hierarchy.",
      },
      {
        id: "creative-4",
        numberTag: "#04",
        title: "Coimbatore Indie Music Weekend",
        category: "Gig Poster",
        format: "Halftone Screen Overlay",
        image: "/work/poster-coimbatore-gig.webp",
        width: 683,
        height: 1024,
        details: "Screen-printed underground concert poster featuring kinetic distorted typography, ink bleeds, and rough halftone texture overlays.",
      },
      {
        id: "creative-5",
        numberTag: "#05",
        title: "SaaS Launch Keynote Visuals",
        category: "Web Creatives & Social Kit",
        format: "Multi-Platform Digital Kit",
        image: "/work/poster-gathex-keynote.webp",
        width: 768,
        height: 1024,
        details: "Geometric, punchy banner system and digital ad kit built for a high-converting software product announcement.",
      },
      {
        id: "creative-6",
        numberTag: "#06",
        title: "Traditional Rice Revival Series",
        category: "Awareness Poster Series",
        format: "Dual Script Tamil & English",
        image: "/work/poster-rice-revival.webp",
        width: 768,
        height: 1024,
        details: "Advocacy poster documenting indigenous heirloom paddy varieties. Blends heritage Tamil typography with modular Swiss modernist layout.",
      },
    ],
  },

  software: {
    sectionId: "software",
    tag: "FOUNDER & CODE",
    headline: "SOFTWARE / INDIE PRODUCTS",
    description: "I don't just design labels — I build real software that powers businesses. From GST compliance engines to encrypted messaging systems.",
    products: [
      {
        id: "soft-1",
        name: "Gathex Invoice",
        tagline: "GST-compliant invoicing SaaS for Indian businesses",
        sticker: "Live",
        stickerBg: "#3DDC97",
        stickerText: "#111111",
        description: "Built for Indian SMBs, manufacturers, and freelancers: automated GST split calculations (CGST/SGST/IGST), multi-currency invoices, beautiful printable PDFs, and instant client dispatch.",
        tags: ["React 19", "Vite", "Tailwind CSS", "PDF Engine", "GST Engine"],
        image: "/work/software-gathex-invoice.webp",
        width: 1000,
        height: 700,
        metrics: "GST Ready",
        url: "https://gathex-invoice.vercel.app",
        viewLabel: "View Product",
      },
      {
        id: "soft-2",
        name: "Gathex Chat",
        tagline: "End-to-end encrypted messaging app",
        sticker: "In Progress",
        stickerBg: "#FFD60A",
        stickerText: "#111111",
        description: "Zero-compromise privacy communicator currently under active development. Peer-to-peer encrypted channels, ephemeral media shredding, decentralized signaling, and minimal footprint design.",
        tags: ["WebRTC", "Cryptography", "WebSocket", "React", "Signal Protocol"],
        image: "/work/software-gathex-chat.webp",
        width: 1000,
        height: 700,
        metrics: "In Progress",
        url: "#",
        viewLabel: "In Progress",
      },
      {
        id: "soft-3",
        name: "Krishna Engineering quotation",
        tagline: "Custom quotation app built for a client",
        sticker: "Client work",
        stickerBg: "#FF3D81",
        stickerText: "#111111",
        description: "Heavy manufacturing estimation software: dynamic raw-material pricing matrices, multi-component BOM calculations, automated engineering quotations, and GST export.",
        tags: ["React", "IndexedDB", "Tax Engine", "Industrial PWA"],
        image: "/work/software-krishna-eng.webp",
        width: 1000,
        height: 700,
        metrics: "Client Deployed",
        url: "https://invoice.krishanaengineeringdev.workers.dev/dashboard",
        viewLabel: "Launch Live App",
      },
      {
        id: "soft-4",
        name: "Vishakha quotation",
        tagline: "Mobile-first quotation app for Vishakha Industries, Coimbatore",
        sticker: "Client work",
        stickerBg: "#FF3D81",
        stickerText: "#111111",
        description: "Field sales PWA designed for factory representatives in Coimbatore. Offline-first local database, rapid quotation generation, material catalog, and live Supabase synchronization.",
        tags: ["PWA", "Supabase", "Offline Cache", "Coimbatore"],
        image: "/work/software-vishakha.webp",
        width: 1000,
        height: 700,
        metrics: "Active in Production",
        url: "https://vishakha-quotation.krishanaengineeringdev.workers.dev/",
        viewLabel: "Launch Live App",
      },
    ],
  },

  testimonials: Object.assign([...testimonialsList], {
    sectionId: "testimonials",
    tag: "CLIENT VOICES",
    headline: "KIND WORDS",
    items: testimonialsList,
  }),

  arsenal: {
    sectionId: "arsenal",
    tag: "STACK & WORKFLOW",
    headline: "ARSENAL",
    lineBelow: "AI speeds up my workflow. The design decisions stay mine.",
    columns: [
      {
        id: "arsenal-design",
        title: "Design",
        stripColor: "#FF3D81", // pink
        textColor: "#111111",
        tools: [
          { name: "Affinity", logo: "/logos/affinity.svg" },
          { name: "Photoshop", logo: "/logos/photoshop.svg" },
          { name: "Figma", logo: "/logos/figma.svg" },
          { name: "Canva", logo: "/logos/canva.svg" },
          { name: "Pacdora", logo: "/logos/pacdora.svg" },
          { name: "CorelDRAW", logo: "/logos/coreldraw.svg" },
        ],
      },
      {
        id: "arsenal-video",
        title: "Video",
        stripColor: "#2F5BFF", // blue
        textColor: "#FFFFFF",
        tools: [
          { name: "Premiere Pro", logo: "/logos/premiere-pro.svg" },
          { name: "Final Cut Pro", logo: "/logos/final-cut-pro.svg" },
          { name: "CapCut", logo: "/logos/capcut.svg" },
          { name: "DaVinci Resolve", logo: "/logos/davinci-resolve.svg" },
        ],
      },
      {
        id: "arsenal-ai",
        title: "AI tools",
        stripColor: "#3DDC97", // mint
        textColor: "#111111",
        tools: [
          { name: "Claude", logo: "/logos/claude.svg" },
          { name: "ChatGPT", logo: "/logos/chatgpt.svg" },
          { name: "Antigravity", logo: "/logos/antigravity.svg" },
          { name: "Codex", logo: "/logos/codex.svg" },
        ],
      },
    ],
  },

  contact: {
    sectionId: "contact",
    headline: "LET'S MAKE SOMETHING LOUD.",
    subline: "Have a packaging project, video campaign, or software vision? Let's get to work.",
    email: "kesavkumarthamburaj@gmail.com",
    location: "Tamil Nadu, India",
    instagram: socialLinks.instagram,
    linkedin: socialLinks.linkedin,
    projectTypes: [
      "Packaging",
      "Posters/Banners",
      "Video editing",
      "Software",
      "Other",
    ],
    formCopy: {
      nameLabel: "Your Name",
      emailLabel: "Email Address",
      projectTypeLabel: "Project Type",
      messageLabel: "Tell me about the project",
      submitButton: "Send enquiry",
      submittingButton: "Sending enquiry...",
      successMessage: "Sent. I'll reply soon.",
      errorMessage: "Something went wrong. Please try again or email directly.",
    },
  },
};
