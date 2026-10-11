import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Sparkles, MapPin } from 'lucide-react';
import { portfolioContent } from '../data/content';

/**
 * MagneticButton: Wraps buttons so they follow the cursor within a 12px radius,
 * then spring back smoothly on leave. Disabled on touch and prefers-reduced-motion.
 */
function MagneticButton({ children, onClick, className, radius = 12 }) {
  const shouldReduceMotion = useReducedMotion();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    if (shouldReduceMotion) return;
    if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) return;
    if (!ref.current) return;

    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const deltaX = (clientX - centerX) * 0.35;
    const deltaY = (clientY - centerY) * 0.35;
    const distance = Math.hypot(deltaX, deltaY);

    if (distance < radius) {
      setPosition({ x: deltaX, y: deltaY });
    } else {
      const angle = Math.atan2(deltaY, deltaX);
      setPosition({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
    }
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      className="inline-block"
    >
      <motion.button
        onClick={onClick}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
        className={className}
      >
        {children}
      </motion.button>
    </motion.div>
  );
}

export default function HeroSection({ isDark }) {
  const shouldReduceMotion = useReducedMotion();
  const { hero, profile } = portfolioContent;
  const [isHeadlineHovered, setIsHeadlineHovered] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkWidth = () => setIsDesktop(window.innerWidth >= 768);
    checkWidth();
    window.addEventListener('resize', checkWidth, { passive: true });
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Parallax on halftone overlay (0.9x scroll shift, max 40px shift, disabled on mobile)
  const { scrollY } = useScroll();
  const parallaxHalftone = useTransform(
    scrollY,
    [0, 800],
    [0, shouldReduceMotion || !isDesktop ? 0 : 38]
  );

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Misregistered overprint animation:
  // Pink: translate(-3px, 2px), Blue: translate(3px, -2px).
  // Initial load: transform offset animates from 12px to 3px over 700ms.
  // On hover: offset widens slightly to 6px/4px, easing smoothly.
  const pinkTargetX = isHeadlineHovered ? -6 : -3;
  const pinkTargetY = isHeadlineHovered ? 4 : 2;
  const blueTargetX = isHeadlineHovered ? 6 : 3;
  const blueTargetY = isHeadlineHovered ? -4 : -2;

  const initialPinkX = shouldReduceMotion ? -3 : -12;
  const initialPinkY = shouldReduceMotion ? 2 : 8;
  const initialBlueX = shouldReduceMotion ? 3 : 12;
  const initialBlueY = shouldReduceMotion ? -2 : -8;

  return (
    <section
      id="hero"
      className="relative min-h-screen section-hero pt-28 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex flex-col justify-between overflow-hidden"
    >
      {/* Halftone Dot Background with Subtle Parallax */}
      <motion.div
        style={{ y: parallaxHalftone }}
        className="absolute inset-0 pointer-events-none halftone-overlay z-0"
        aria-hidden="true"
      />

      {/* Decorative Technical Registration Crossmarks (Screenprint guide) */}
      <div className={`absolute top-24 left-6 pointer-events-none opacity-40 hidden sm:block font-mono text-[11px] font-bold tracking-[var(--track-label)] uppercase z-10 ${
        isDark ? 'text-[#C9BFAE]' : 'text-ink'
      }`}>
        <span className={`inline-block border p-1 ${isDark ? 'border-[#2E2A24]' : 'border-ink'}`}>REG + 01</span>
      </div>
      <div className={`absolute top-24 right-6 pointer-events-none opacity-40 hidden sm:block font-mono text-[11px] font-bold tracking-[var(--track-label)] uppercase z-10 ${
        isDark ? 'text-[#C9BFAE]' : 'text-ink'
      }`}>
        <span className={`inline-block border p-1 ${isDark ? 'border-[#2E2A24]' : 'border-ink'}`}>CYMK: 0/100/100/0</span>
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10 my-auto">
        {/* Top Badges Row */}
        <div className="flex flex-wrap items-center gap-3 mb-6 sm:mb-8">
          {/* Rotated Sticker Badge: "Open for projects"
              Pops in last (scale 0 to 1 with spring overshoot), then 6s subtle rotate wobble loop */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 350,
              damping: 18,
              delay: 0.75, // pops in last
            }}
            className="sticker-badge bg-mint text-[#111111] text-xs sm:text-sm font-bold shadow-[3px_3px_0px_#111111] cursor-pointer animate-sticker-wobble"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 inline-block text-[#111111]" />
            <span>{hero.sticker}</span>
          </motion.div>

          {/* Location Badge */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 font-mono text-xs font-bold uppercase tracking-[var(--track-label)] rounded rotate-[1.5deg] border ${
            isDark
              ? 'bg-[#1A1815] text-[#FFF8EC] border-[#2E2A24] shadow-[2px_2px_0px_#0A0A09]'
              : 'bg-paper text-ink border-2 border-ink shadow-[2px_2px_0px_#111111]'
          }`}>
            <MapPin className="w-3.5 h-3.5 text-pink" />
            <span>{profile.location}</span>
          </div>

          {/* Screen-Print Edition Tag */}
          <div className={`hidden sm:inline-flex items-center px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-[var(--track-label)] rounded -rotate-1 ${
            isDark ? 'bg-[#1A1815] text-yellow border border-[#2E2A24]' : 'bg-ink text-yellow'
          }`}>
            <span>PRINT SERIES NO. 2026</span>
          </div>
        </div>

        {/* GIANT STACKED HEADLINE WITH MISREGISTERED OVERPRINT LAYERS
            1. Built as one stacked block: wrapper has position: relative; display: grid.
            2. Main text and two overprint copies all sit in the SAME grid cell (grid-area: 1 / 1).
            3. Overprint copies are decorative (aria-hidden="true", pointer-events: none, user-select: none).
            4. Layer order: Blue (back), Pink (middle), Main black text (front).
            5. Exact same typography: inherits font, line-height 0.92, letter-spacing, text-transform.
            6. Misregistration done ONLY with transform: translate: pink(-3px, 2px), blue(3px, -2px). */}
        <div
          onMouseEnter={() => setIsHeadlineHovered(true)}
          onMouseLeave={() => setIsHeadlineHovered(false)}
          style={{ paddingInline: '0.05em' }}
          className="relative grid [grid-template-columns:1fr] [grid-template-rows:1fr] headline-giant font-headline uppercase leading-[0.92] tracking-[var(--track-display)] select-none my-4 sm:my-6 overflow-visible cursor-default"
        >
          {/* Layer 1 (Back): Blue Overprint Layer */}
          <motion.div
            aria-hidden="true"
            initial={{ x: initialBlueX, y: initialBlueY, opacity: 1 }}
            animate={{
              x: blueTargetX,
              y: blueTargetY,
              opacity: 1,
            }}
            transition={{
              duration: shouldReduceMotion ? 0 : isHeadlineHovered ? 0.2 : 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              gridArea: '1 / 1',
              font: 'inherit',
              fontSize: 'inherit',
              lineHeight: 'inherit',
              letterSpacing: 'inherit',
              textTransform: 'inherit',
            }}
            className="overprint-blue pointer-events-none select-none z-0"
          >
            <span className="block">KESAV</span>
            <span className="block">DESIGNS</span>
            <span className="block">THE SHELF.</span>
          </motion.div>

          {/* Layer 2 (Middle): Pink Overprint Layer */}
          <motion.div
            aria-hidden="true"
            initial={{ x: initialPinkX, y: initialPinkY, opacity: 1 }}
            animate={{
              x: pinkTargetX,
              y: pinkTargetY,
              opacity: 1,
            }}
            transition={{
              duration: shouldReduceMotion ? 0 : isHeadlineHovered ? 0.2 : 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              gridArea: '1 / 1',
              font: 'inherit',
              fontSize: 'inherit',
              lineHeight: 'inherit',
              letterSpacing: 'inherit',
              textTransform: 'inherit',
            }}
            className="overprint-pink pointer-events-none select-none z-10"
          >
            <span className="block">KESAV</span>
            <span className="block">DESIGNS</span>
            <span className="block">THE SHELF.</span>
          </motion.div>

          {/* Layer 3 (Front): Main Text Layer (Accessible, SEO-indexed) */}
          <h1
            style={{
              gridArea: '1 / 1',
              font: 'inherit',
              fontSize: 'inherit',
              lineHeight: 'inherit',
              letterSpacing: 'inherit',
              textTransform: 'inherit',
            }}
            className={`relative z-20 transition-colors ${
              isDark
                ? 'text-yellow drop-shadow-[0_0_24px_rgba(255,214,10,0.35)]'
                : 'text-[#111111]'
            }`}
          >
            <span className="block">KESAV</span>
            <span className="block">DESIGNS</span>
            <span className="block">THE SHELF.</span>
          </h1>
        </div>

        {/* Hero Line: Intro line (20 to 28px), tracking var(--track-lead), max-width 65ch */}
        <motion.p
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={`mt-6 sm:mt-8 text-xl sm:text-2xl md:text-3xl font-body font-bold max-w-3xl leading-snug tracking-[var(--track-lead)] text-balance transition-colors ${
            isDark ? 'text-[#FFF8EC]' : 'text-ink'
          }`}
        >
          {hero.subtitle}
        </motion.p>

        {/* CTAs with Magnetic Effect on Desktop: follows cursor within 12px */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4 sm:gap-5"
        >
          {/* CTA Primary: Slide-fill pop color layer + arrow nudge */}
          <MagneticButton
            onClick={() => scrollTo('packaging')}
            className="btn-primary btn-slide-fill group whitespace-nowrap cursor-pointer"
          >
            <span className="relative z-10 flex items-center gap-2">
              <span>{hero.ctaPrimary.label}</span>
              <ArrowDown className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-1 text-[#111111]" />
            </span>
          </MagneticButton>

          {/* CTA Secondary: Outlined button with magnetic response */}
          <MagneticButton
            onClick={() => scrollTo('contact')}
            className="btn-secondary group whitespace-nowrap cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <span>{hero.ctaSecondary.label}</span>
              <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </MagneticButton>
        </motion.div>
      </div>

      {/* Bottom Proof Strip & Scroll Prompt */}
      <div className={`max-w-7xl mx-auto w-full pt-12 mt-6 border-t-2 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10 transition-colors ${
        isDark ? 'border-[#2E2A24]' : 'border-ink'
      }`}>
        <div className="flex flex-wrap items-center gap-6 sm:gap-10">
          {hero.stats.map((stat, idx) => (
            <div key={idx} className="flex items-baseline gap-2">
              <span className={`font-headline text-3xl sm:text-4xl font-black tabular-nums tracking-[0.02em] ${
                isDark ? 'text-yellow' : 'text-ink'
              }`}>
                {stat.value}
              </span>
              <span className={`font-mono text-xs uppercase font-bold tracking-[var(--track-label)] ${
                isDark ? 'text-[#C9BFAE]' : 'text-ink/80'
              }`}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        <div className={`flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[var(--track-label)] ${
          isDark ? 'text-[#FFF8EC]' : 'text-ink'
        }`}>
          <span>SCROLL FOR PACKAGING</span>
          <span className="animate-bounce">↓</span>
        </div>
      </div>
    </section>
  );
}
