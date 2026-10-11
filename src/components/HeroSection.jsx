import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Sparkles, MapPin } from 'lucide-react';
import { portfolioContent } from '../data/content';
import HeroOrbit from './HeroOrbit';

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
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window !== 'undefined') return window.innerWidth >= 1024;
    return true;
  });

  useEffect(() => {
    const checkWidth = () => setIsDesktop(window.innerWidth >= 1024);
    checkWidth();
    window.addEventListener('resize', checkWidth, { passive: true });
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Parallax on halftone overlay
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
      className="relative min-h-screen section-hero pt-20 sm:pt-24 pb-0 px-4 sm:px-6 lg:px-8 flex flex-col justify-between overflow-hidden"
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

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto w-full relative z-20 flex-1 flex flex-col justify-start lg:justify-center my-0 lg:my-auto pb-4 sm:pb-8 lg:pb-12">
        {/* Left Column (Desktop: leaves right 48% clear for the enlarged photo) */}
        <div className="w-full lg:max-w-[54%] xl:max-w-[50%] flex flex-col justify-center">
          
          {/* Top Badges Row */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-2 sm:mb-4">
            {/* Rotated Sticker Badge: "Open for projects" */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
              transition={{
                type: 'spring',
                stiffness: 350,
                damping: 18,
                delay: 0.75,
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

          {/* GIANT STACKED HEADLINE WITH MISREGISTERED OVERPRINT LAYERS */}
          <div
            onMouseEnter={() => setIsHeadlineHovered(true)}
            onMouseLeave={() => setIsHeadlineHovered(false)}
            style={{ paddingInline: '0.04em' }}
            className="relative grid [grid-template-columns:1fr] [grid-template-rows:1fr] font-headline uppercase leading-[0.92] tracking-[var(--track-display)] text-[clamp(2.75rem,11.5vw,7.6rem)] lg:text-[clamp(3.6rem,6.8vw,7.2rem)] xl:text-[clamp(4.2rem,7.2vw,8.2rem)] select-none my-1.5 sm:my-3 overflow-visible cursor-default z-15"
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
              <span className="block whitespace-nowrap">KESAV</span>
              <span className="block whitespace-nowrap">DESIGNS</span>
              <span className="block whitespace-nowrap">THE SHELF.</span>
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
              <span className="block whitespace-nowrap">KESAV</span>
              <span className="block whitespace-nowrap">DESIGNS</span>
              <span className="block whitespace-nowrap">THE SHELF.</span>
            </motion.div>

            {/* Layer 3 (Front): Main Text Layer */}
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
              <span className="block whitespace-nowrap">KESAV</span>
              <span className="block whitespace-nowrap">DESIGNS</span>
              <span className="block whitespace-nowrap">THE SHELF.</span>
            </h1>
          </div>

          {/* Hero Line: Intro line */}
          <motion.p
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={`mt-2 sm:mt-4 text-base sm:text-xl md:text-2xl font-body font-bold max-w-xl leading-snug tracking-[var(--track-lead)] text-balance transition-colors ${
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
            className="mt-3 sm:mt-6 flex flex-wrap items-center gap-3 sm:gap-5"
          >
            {/* CTA Primary */}
            <MagneticButton
              onClick={() => scrollTo('packaging')}
              className="btn-primary btn-slide-fill group whitespace-nowrap cursor-pointer text-xs sm:text-sm"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>{hero.ctaPrimary.label}</span>
                <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 group-hover:translate-y-1 text-[#111111]" />
              </span>
            </MagneticButton>

            {/* CTA Secondary */}
            <MagneticButton
              onClick={() => scrollTo('contact')}
              className="btn-secondary group whitespace-nowrap cursor-pointer text-xs sm:text-sm"
            >
              <span className="flex items-center gap-1.5">
                <span>{hero.ctaSecondary.label}</span>
                <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </MagneticButton>
          </motion.div>

          {/* Proof Stats row - strictly confined to left column (max-w-xl) so it never crosses behind Kesav */}
          <div className={`pt-3 sm:pt-6 mt-3 sm:mt-6 border-t-2 max-w-xl flex flex-wrap items-center gap-4 sm:gap-10 transition-colors ${
            isDark ? 'border-[#2E2A24]' : 'border-ink'
          }`}>
            {hero.stats.map((stat, idx) => (
              <div key={idx} className="flex items-baseline gap-1.5 sm:gap-2">
                <span className={`font-headline text-lg sm:text-2xl lg:text-3xl font-black tabular-nums tracking-[0.02em] ${
                  isDark ? 'text-yellow' : 'text-ink'
                }`}>
                  {stat.value}
                </span>
                <span className={`font-mono text-[10px] sm:text-xs uppercase font-bold tracking-[var(--track-label)] ${
                  isDark ? 'text-[#C9BFAE]' : 'text-ink/80'
                }`}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Orbit Container: Anchored strictly to bottom: 0 across all screens! */}
      <div
        className="absolute bottom-0 z-10 pointer-events-none flex items-end justify-center
          left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0
          lg:right-[-1%] xl:right-[1%] 2xl:right-[4%]"
        style={{
          height: isDesktop
            ? 'clamp(420px, 78vh, 820px)'
            : 'clamp(252px, 70vw, 380px)',
          width: isDesktop
            ? 'clamp(420px, 78vh, 820px)'
            : 'clamp(252px, 70vw, 380px)',
        }}
      >
        <div className="w-full h-full pointer-events-auto">
          <HeroOrbit isDark={isDark} shouldReduceMotion={shouldReduceMotion} />
        </div>
      </div>

      {/* Subtle Scroll prompt at bottom right (Desktop) */}
      <div className={`hidden lg:flex absolute bottom-4 right-8 items-center gap-2 font-mono text-xs font-bold uppercase tracking-[var(--track-label)] z-30 pointer-events-none transition-colors ${
        isDark ? 'text-[#FFF8EC]' : 'text-ink'
      }`}>
        <span>SCROLL FOR PACKAGING</span>
        <span className="animate-bounce">↓</span>
      </div>
    </section>
  );
}
