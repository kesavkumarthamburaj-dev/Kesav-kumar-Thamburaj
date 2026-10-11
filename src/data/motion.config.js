// src/data/motion.config.js
// Central motion configuration for 3D Hero Orbit and Global Floating Tool Icons.
// All speeds, counts, blur factors, and dimensions can be tuned here.

export const TOOL_LOGOS = [
  { id: 'affinity', name: 'Affinity', logo: '/logos/affinity.svg' },
  { id: 'photoshop', name: 'Photoshop', logo: '/logos/photoshop.svg' },
  { id: 'figma', name: 'Figma', logo: '/logos/figma.svg' },
  { id: 'canva', name: 'Canva', logo: '/logos/canva.svg' },
  { id: 'pacdora', name: 'Pacdora', logo: '/logos/pacdora.svg' },
  { id: 'coreldraw', name: 'CorelDRAW', logo: '/logos/coreldraw.svg' },
  { id: 'premiere-pro', name: 'Premiere Pro', logo: '/logos/premiere-pro.svg' },
  { id: 'final-cut-pro', name: 'Final Cut Pro', logo: '/logos/final-cut-pro.svg' },
  { id: 'capcut', name: 'CapCut', logo: '/logos/capcut.svg' },
  { id: 'davinci-resolve', name: 'DaVinci Resolve', logo: '/logos/davinci-resolve.svg' },
  { id: 'claude', name: 'Claude', logo: '/logos/claude.svg' },
  { id: 'chatgpt', name: 'ChatGPT', logo: '/logos/chatgpt.svg' },
  { id: 'antigravity', name: 'Antigravity', logo: '/logos/antigravity.svg' },
  { id: 'codex', name: 'Codex', logo: '/logos/codex.svg' },
];

export const motionConfig = {
  // 1. Hero 3D Orbit Settings
  orbit: {
    durationSec: 24, // 360deg every 24s
    ringTiltDeg: 65, // Ring tilted ~65deg
    planeRotateDeg: -16, // Visual 2D slant of orbit plane
    rxPercentDesktop: 46, // rx = 46% of container width
    rxPercentMobile: 44, // rx = 44% on mobile
    ryPercent: 18, // ry = 18% of container height
    tileCountDesktop: 14,
    tileCountMobile: 8,
    tileSizePx: 48,
    farScale: 0.7, // Depth < 0 (behind photo)
    nearScale: 1.15, // Depth > 0 (in front of photo)
    farOpacity: 0.6,
    nearOpacity: 1.0,
    farBlurPx: 1.2,
    maxTiltParallaxDeg: 8, // Pointer tilt parallax (desktop)
    entranceStaggerMs: 60, // Fly-in stagger from ring center
  },

  // 2. Global Floating Icons Layer Settings
  floating: {
    desktopCount: 8,
    mobileCount: 5,
    minSizePx: 36,
    maxSizePx: 64,
    rotationVariationDeg: 12,
    baseOpacity: 0.9,
    driftSpeedFactor: 0.85,
    scrollParallaxFactor: 0.045, // Scroll velocity shift
  },

  // 3. Motion Blur Settings
  blur: {
    speedMultiplier: 0.06, // blur = clamp(speed * 0.06, 0, maxBlur)
    maxBlurDesktop: 6, // Capped at 6px
    maxBlurMobile: 3, // Capped at 3px on mobile
    scrollBlurFactor: 0.015,
  },

  // 4. Performance & Safety Guards
  performance: {
    fpsDropThreshold: 50, // Auto-reduce if FPS < 50
    fpsCheckWindowMs: 2000,
  },
};
