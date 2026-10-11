import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Moon, Sun, ArrowUpRight, Menu, X, Sparkles } from 'lucide-react';
import { portfolioContent } from '../data/content';

export default function Navbar({ isDark, onToggleDark }) {
  const shouldReduceMotion = useReducedMotion();
  const [activeSection, setActiveSection] = useState('hero');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileBottom, setShowMobileBottom] = useState(true);
  const lastScrollY = useRef(0);

  // Track active section, scroll state, and scroll direction for mobile bottom bar auto-hide
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 40);

      // Auto-hide mobile bottom bar on scroll down, show on scroll up
      if (currentScrollY > lastScrollY.current && currentScrollY > 70) {
        setShowMobileBottom(false);
      } else if (currentScrollY < lastScrollY.current) {
        setShowMobileBottom(true);
      }
      lastScrollY.current = currentScrollY;

      const sectionIds = ['hero', 'packaging', 'creatives', 'software', 'arsenal', 'contact'];
      const scrollPosition = currentScrollY + 220;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sectionIds[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* DESKTOP TOP STICKY NAV */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
          isScrolled
            ? isDark
              ? 'bg-[#0F0E0C]/95 border-b border-[#2E2A24] shadow-md py-2.5 backdrop-blur-none'
              : 'bg-paper/95 border-b-3 border-ink shadow-sm py-2.5 backdrop-blur-none'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo / Screen-print Tag */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              scrollTo('hero');
            }}
            className="group flex items-center gap-2.5 focus:outline-none"
            aria-label="Kesav Kumar T — Go to top"
          >
            <span className="w-10 h-10 flex items-center justify-center bg-yellow text-[#111111] font-headline text-2xl font-black border-2.5 border-[#111111] rounded shadow-[2px_2px_0px_#111111] transition-transform duration-150 group-hover:-rotate-3 group-hover:scale-105 active:scale-95">
              K
            </span>
            <div className="flex flex-col">
              <span className={`font-headline tracking-[var(--track-heading)] text-xl sm:text-2xl leading-none uppercase transition-colors ${
                isDark ? 'text-[#FFF8EC]' : 'text-ink'
              }`}>
                KESAV KUMAR T
              </span>
              <span className={`font-mono text-[10px] tracking-[var(--track-label)] font-bold uppercase transition-colors ${
                isDark ? 'text-[#C9BFAE]' : 'text-ink/75'
              }`}>
                TAMIL NADU, INDIA
              </span>
            </div>
          </a>

          {/* Desktop Nav Items with Sliding Shared layoutId Highlight & Hover Underline */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 p-1 rounded-lg">
            {portfolioContent.nav.map((item) => {
              const targetId = item.href.replace('#', '');
              const isActive = activeSection === targetId;

              return (
                <button
                  key={item.label}
                  onClick={() => scrollTo(targetId)}
                  className={`relative px-3 py-1.5 text-xs lg:text-sm font-mono font-bold uppercase tracking-[var(--track-button)] whitespace-nowrap rounded transition-colors duration-150 cursor-pointer nav-underline-link ${
                    isActive
                      ? isDark
                        ? 'text-yellow'
                        : 'text-ink'
                      : isDark
                        ? 'text-[#FFF8EC]/80 hover:text-yellow'
                        : 'text-ink/80 hover:text-ink'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Sliding active pill indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavHighlight"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className={`absolute inset-0 rounded border-2 z-0 ${
                        isDark
                          ? 'bg-[#1A1815] border-yellow shadow-[0_0_12px_rgba(255,214,10,0.3)]'
                          : 'bg-yellow/30 border-ink shadow-[2px_2px_0px_#111111]'
                      }`}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Availability, Theme Toggle & Say Hello CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Availability Pill (Desktop) */}
            <div className={`hidden xl:inline-flex items-center gap-2 px-2.5 py-1 rounded border-2 font-mono text-[11px] font-bold uppercase tracking-[var(--track-label)] ${
              isDark
                ? 'bg-[#0B1D15] border-[#2E2A24] text-[#3DDC97]'
                : 'bg-mint/30 border-ink text-ink'
            }`}>
              <span className="w-2 h-2 rounded-full bg-mint border border-ink animate-pulse" />
              <span>OPEN FOR WORK</span>
            </div>

            {/* Dark/Light Mode Toggle with 180deg icon rotation */}
            <motion.button
              onClick={onToggleDark}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
              className={`min-w-[44px] min-h-[44px] p-2 flex items-center justify-center rounded border-2 transition-colors duration-150 cursor-pointer ${
                isDark
                  ? 'border-[#2E2A24] bg-[#1A1815] text-[#FFD60A] hover:border-yellow hover:shadow-[0_0_14px_rgba(255,214,10,0.3)]'
                  : 'border-ink bg-paper text-ink shadow-[2px_2px_0px_#111111] hover:translate-x-[1px] hover:translate-y-[1px]'
              }`}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-pressed={isDark}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <motion.div
                key={isDark ? 'dark-sun' : 'light-moon'}
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 180, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-yellow fill-yellow" />
                ) : (
                  <Moon className="w-5 h-5 text-ink fill-ink/20" />
                )}
              </motion.div>
            </motion.button>

            {/* Say Hello Button (Desktop) - Primary Button with slide-fill */}
            <motion.button
              onClick={() => scrollTo('contact')}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
              className="btn-slide-fill hidden sm:inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 font-mono text-xs font-bold uppercase tracking-[var(--track-button)] whitespace-nowrap rounded border-2.5 border-[#111111] bg-yellow text-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-mint hover:translate-x-[1px] hover:translate-y-[1px] transition-colors duration-150 cursor-pointer"
            >
              <span>Say Hello</span>
              <ArrowUpRight className="w-4 h-4 text-[#111111]" />
            </motion.button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden min-w-[44px] min-h-[44px] p-2 flex items-center justify-center rounded border-2 transition-colors cursor-pointer active:scale-95 ${
                isDark
                  ? 'border-[#2E2A24] bg-[#1A1815] text-[#FFF8EC]'
                  : 'border-ink bg-paper text-ink shadow-[2px_2px_0px_#111111]'
              }`}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className={`md:hidden px-4 py-4 space-y-2 shadow-lg border-b ${
                isDark
                  ? 'bg-[#1A1815] border-[#2E2A24] text-[#FFF8EC]'
                  : 'bg-paper border-b-3 border-ink text-ink'
              }`}
            >
              {portfolioContent.nav.map((item) => {
                const targetId = item.href.replace('#', '');
                const isActive = activeSection === targetId;

                return (
                  <button
                    key={item.label}
                    onClick={() => scrollTo(targetId)}
                    className={`w-full text-left px-4 py-3 rounded font-mono text-sm font-bold uppercase tracking-[var(--track-button)] whitespace-nowrap border-2 active:scale-98 transition-transform ${
                      isActive
                        ? 'bg-yellow text-[#111111] border-yellow'
                        : isDark
                          ? 'bg-[#14120F] text-[#FFF8EC] border-[#2E2A24] hover:border-yellow'
                          : 'bg-paper text-ink border-ink/30 hover:border-ink'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
              <div className={`pt-2 flex items-center justify-between border-t text-xs font-mono font-bold ${
                isDark ? 'border-[#2E2A24] text-[#C9BFAE]' : 'border-ink/20 text-ink/80'
              }`}>
                <span>Kesav Kumar T &bull; Tamil Nadu</span>
                <span className="text-pink">Available for freelance</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* MOBILE STICKY BOTTOM BAR: Auto-hides on scroll down, shows on scroll up */}
      <motion.div
        initial={{ y: 0, opacity: 1 }}
        animate={{
          y: showMobileBottom ? 0 : 80,
          opacity: showMobileBottom ? 1 : 0,
        }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="md:hidden fixed bottom-3 left-3 right-3 z-40 pointer-events-auto"
      >
        <div className={`rounded-lg p-2 flex items-center justify-between gap-2 border transition-all ${
          isDark
            ? 'bg-[#1A1815] border-[#2E2A24] shadow-[0_4px_24px_rgba(0,0,0,0.8)]'
            : 'bg-paper border-3 border-ink shadow-[3px_3px_0px_#111111]'
        }`}>
          {/* Work Button - Primary bright yellow fill */}
          <button
            onClick={() => scrollTo('packaging')}
            className={`flex-1 min-h-[44px] px-3 py-2 flex items-center justify-center gap-1.5 rounded font-mono text-xs font-bold uppercase tracking-[var(--track-button)] whitespace-nowrap border-2 active:scale-95 transition-transform ${
              ['packaging', 'creatives', 'software'].includes(activeSection)
                ? 'bg-yellow text-[#111111] border-[#111111]'
                : isDark
                  ? 'bg-yellow text-[#111111] border-[#111111]'
                  : 'bg-yellow text-ink border-ink'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#111111]" />
            <span>Work</span>
          </button>

          {/* Sun/Moon Toggle on mobile bottom bar */}
          <button
            onClick={onToggleDark}
            className={`min-w-[44px] min-h-[44px] p-2 flex items-center justify-center rounded border-2 transition-colors cursor-pointer active:scale-95 ${
              isDark
                ? 'border-[#2E2A24] bg-[#14120F] text-yellow'
                : 'border-ink bg-paper text-ink'
            }`}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={isDark}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <motion.div
              key={isDark ? 'm-dark-sun' : 'm-light-moon'}
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {isDark ? <Sun className="w-4 h-4 text-yellow fill-yellow" /> : <Moon className="w-4 h-4 text-ink" />}
            </motion.div>
          </button>

          {/* Contact Button */}
          <button
            onClick={() => scrollTo('contact')}
            className={`flex-1 min-h-[44px] px-3 py-2 flex items-center justify-center gap-1.5 rounded font-mono text-xs font-bold uppercase tracking-[var(--track-button)] whitespace-nowrap border-2 active:scale-95 transition-transform ${
              activeSection === 'contact'
                ? 'bg-yellow text-[#111111] border-[#111111]'
                : 'bg-pink text-[#111111] border-[#111111]'
            }`}
          >
            <span>Contact</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#111111]" />
          </button>
        </div>
      </motion.div>
    </>
  );
}
