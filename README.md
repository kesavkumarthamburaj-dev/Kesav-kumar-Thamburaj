# Kesav Kumar T — "Poster Wall" Portfolio

A production-ready, high-voltage portfolio website for **Kesav Kumar T** (freelance packaging designer, video editor, and software founder from Tamil Nadu, India).

Concept: **"Poster Wall"** — an authentic physical wall of screen-printed, risograph-styled posters featuring full-bleed pop colors, misregistered overprints, halftone dot textures, rotated sticker badges, and organic torn-paper edges.

---

## ⚡ Tech Stack & Architecture

- **Core**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 + Design Tokens (CSS Variables)
- **Animations**: Framer Motion (respects `prefers-reduced-motion`)
- **Icons**: Lucide React
- **Typography**: Anton (Headlines via Google Fonts) & DM Sans (Body via Google Fonts)
- **Deployment Target**: Vercel (SPA rewrites configured in `vercel.json`, output directory `dist`)
- **Backend API**: Vercel Serverless Function at `/api/contact.js` using the Resend API with honeypot spam protection and rate limiting

---

## 🎨 Design Tokens & Palette

Each section is designed as a full-bleed pop color with crisp ink text (white text exclusively on blue):

| Section | Color Token | Hex Code | Text Color |
| :--- | :--- | :--- | :--- |
| **1. Hero** | Yellow | `#FFD60A` | Ink (`#111111`) with animated hot pink overprint (`#FF3D81`) |
| **2. Packaging** | Pink | `#FF3D81` | Ink (`#111111`) |
| **3. Posters & Creatives** | Mint | `#3DDC97` | Ink (`#111111`) |
| **4. Video Reels** | Blue | `#2F5BFF` | White (`#FFFFFF`) |
| **5. Software / Indie** | Tangerine | `#FF7A1A` | Ink (`#111111`) |
| **6. Arsenal** | Paper | `#FFF8EC` | Ink (`#111111`) with colored header strips |
| **7. Contact** | Ink | `#111111` | Yellow (`#FFD60A`) |

> Includes a **Light/Dark theme toggle** in the navigation that persists user preference in `localStorage` and defaults to system settings (`prefers-color-scheme`). Dark mode uses deeper, saturated tones while preserving WCAG AA contrast.

---

## 📁 Project Structure

```
kesav-portfolio/
├── api/
│   └── contact.js          # Vercel serverless function with Resend email delivery
├── public/
│   ├── favicon.svg         # Screen-printed 'K' favicon
│   ├── og-image.png        # Open Graph preview card (1200x630)
│   ├── robots.txt          # SEO crawler rules
│   ├── sitemap.xml         # XML sitemap with all anchors
│   └── work/               # Clearly marked WebP assets (800x1000, 800x1200, etc.)
├── scripts/
│   └── generate-assets.js  # Automated WebP graphic generator using Sharp
├── src/
│   ├── components/
│   │   ├── ArsenalSection.jsx     # Arsenal tools with chunky pills & hover wiggle
│   │   ├── ContactSection.jsx     # Ink & yellow contact form with Resend wiring
│   │   ├── CreativesSection.jsx   # Mint masonry gallery with number tags
│   │   ├── Footer.jsx             # Screenprint colophon & back-to-top
│   │   ├── HeroSection.jsx        # Stacked headline & misregistered overprint
│   │   ├── LightboxModal.jsx      # High-res image modal with keyboard controls
│   │   ├── Navbar.jsx             # Sticky desktop nav & mobile bottom bar
│   │   ├── PackagingSection.jsx   # 6 tilted pack posters with hover slide-in
│   │   ├── ProductModal.jsx       # Software product detail view
│   │   ├── SoftwareSection.jsx    # 2x2 grid of SaaS & indie product cards
│   │   ├── TornEdge.jsx           # Organic SVG torn paper section dividers
│   │   ├── VideoModal.jsx         # Responsive video player modal
│   │   └── VideoSection.jsx       # 3 reel cards with play buttons & duration badges
│   ├── data/
│   │   └── content.js      # SINGLE SOURCE OF TRUTH FOR ALL PORTFOLIO DATA
│   ├── App.jsx             # Main layout & section orchestration
│   ├── index.css           # Tailwind v4, design tokens, and print textures
│   └── main.jsx            # React root mount
├── .env.example            # Environment variables template
├── package.json            # Scripts & dependencies
├── vercel.json             # Vercel SPA rewrite & header configurations
└── vite.config.js          # Vite + Tailwind v4 plugin config
```

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build & Preview
```bash
npm run build
npm run preview
```

---

## ☁️ Vercel Deployment Guide

Deploying this portfolio to Vercel takes under 2 minutes:

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: initial Kesav Kumar T portfolio"
   git remote add origin https://github.com/your-username/kesav-portfolio.git
   git push -u origin main
   ```

2. **Import repository into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your GitHub repository `kesav-portfolio`.
   - Vercel will automatically detect the settings:
     - **Framework Preset**: `Vite`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`

3. **Configure Environment Variables**:
   In the Vercel project settings under **Environment Variables**, add:
   - `RESEND_API_KEY`: Your API key from [resend.com](https://resend.com) (e.g. `re_123456...`)
   - `CONTACT_TO_EMAIL`: `kesavkumarthamburaj@gmail.com`
   - `KV_REST_API_URL`: Vercel KV database REST URL (e.g. `https://...upstash.io` or auto-provided by Vercel KV integration)
   - `KV_REST_API_TOKEN`: Vercel KV database REST Token (Write-enabled token; do NOT use `KV_REST_API_READ_ONLY_TOKEN`)
   - *(Optional fallback)*: `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
   - `ADMIN_KEY`: Secret password string to view the private `/admin/visitors` dashboard

4. **Click Deploy**:
   Vercel will build the frontend, deploy the `/api/contact.js` serverless function, and assign a production URL (e.g., `kesav-portfolio.vercel.app`).

5. **Custom Domain**:
   In Vercel **Settings &rarr; Domains**, add your custom domain and follow the DNS records (CNAME / A records).

   > **Note**: When the custom domain is live: change SITE_URL, redeploy, and re-submit the sitemap in Google Search Console.

---

## ✏️ What You Must Replace (Checklist)

All website content lives in a single file: `src/data/content.js`. You do **not** need to touch any React components to customize your portfolio.

- [ ] **1. Packaging Images** (`/public/work/`):
  - Replace `packaging-aura-oil.webp` (800x1000px)
  - Replace `packaging-kaveri-spices.webp` (800x1000px)
  - Replace `packaging-botanica-luxe.webp` (800x1000px)
  - Replace `packaging-nilgiri-coffee.webp` (800x1000px)
  - Replace `packaging-vanam-honey.webp` (800x1000px)
  - Replace `packaging-podi-tin.webp` (800x1000px)
- [ ] **2. Poster & Creative Images** (`/public/work/`):
  - Replace `poster-filter-kaapi.webp` (800x1100px)
  - Replace `poster-tamil-noir.webp` (800x950px)
  - Replace `poster-mango-banner.webp` (800x1050px)
  - Replace `poster-coimbatore-gig.webp` (800x1150px)
  - Replace `poster-gathex-keynote.webp` (800x950px)
  - Replace `poster-rice-revival.webp` (800x1100px)
- [ ] **3. Video Reel Links & Thumbnails** (`src/data/content.js`):
  - Update `embedUrl` or `videoUrl` for Reel #1, #2, #3
  - Update duration badges (e.g., `"0:42"`, `"0:30"`, `"0:58"`)
  - Replace thumbnails `reel-packaging-shelf.webp`, `reel-commercial-ad.webp`, `reel-brand-story.webp` (800x1200px)
- [ ] **4. Software Project URLs & Screenshots** (`src/data/content.js`):
  - Update URLs for Gathex Invoice, Gathex Chat, Krishna Engineering, Vishakha
  - Update sticker status if needed (`Live`, `In build`, `Client work`)
  - Replace `software-gathex-invoice.webp`, etc. (1000x700px)
- [ ] **5. Social & Contact Links** (`src/data/content.js`):
  - Verify Instagram URL, LinkedIn, and email address
  - Set `RESEND_API_KEY` in your `.env` or Vercel dashboard to start receiving emails
#   K e s a v - k u m a r - T h a m b u r a j 
 
 #   K e s a v - k u m a r - T h a m b u r a j 
 
 