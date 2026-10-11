import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import PackagingSection from './components/PackagingSection';
import CreativesSection from './components/CreativesSection';
import SoftwareSection from './components/SoftwareSection';
import ArsenalSection from './components/ArsenalSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import TornEdge from './components/TornEdge';
import LightboxModal from './components/LightboxModal';
import ProductModal from './components/ProductModal';
import ScrollProgressBar from './components/ScrollProgressBar';
import CustomCursor from './components/CustomCursor';
import FloatingToolsLayer from './components/FloatingToolsLayer';
import { portfolioContent } from './data/content';

export default function App() {
  // Theme state: dark / light
  // Defaults to system setting on first visit, then remembered in localStorage
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('kesav_portfolio_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Modal states
  const [activeLightbox, setActiveLightbox] = useState(null); // { ...item, type, index }
  const [activeProduct, setActiveProduct] = useState(null);

  // Apply theme attribute to html element, persist choice, and update meta theme-color
  useEffect(() => {
    const theme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('kesav_portfolio_theme', theme);
    } catch {}

    // Update <meta name="theme-color"> dynamically
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', isDark ? '#0F0E0C' : '#FFD60A');
    }
  }, [isDark]);

  // Listen to system theme changes if user hasn't explicitly set localStorage
  useEffect(() => {
    if (!window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e) => {
      const saved = localStorage.getItem('kesav_portfolio_theme');
      if (!saved) {
        setIsDark(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, []);

  // Check OS reduce motion setting, log to dev console, and track for debug badge
  const [_reduceMotionActive, setReduceMotionActive] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const matches = mediaQuery.matches;
    console.log("window.matchMedia('(prefers-reduced-motion: reduce)').matches:", matches);
    if (matches) {
      console.info(
        "%c[MOTION SYSTEM] Note: OS 'Reduce Motion' setting is active (prefers-reduced-motion: reduce). Framer Motion animations and CSS transitions are running in accessible reduced mode.",
        "color: #FF3D81; font-weight: bold; font-size: 13px;"
      );
    }
    const handleChange = (e) => setReduceMotionActive(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') return window.innerWidth < 1024;
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Lightbox navigation helper
  const handleLightboxNav = (direction) => {
    if (!activeLightbox) return;
    const { type, index } = activeLightbox;

    const list =
      type === 'packaging'
        ? portfolioContent.packaging.projects
        : portfolioContent.creatives.gallery;

    const newIndex = (index + direction + list.length) % list.length;
    setActiveLightbox({
      ...list[newIndex],
      type,
      index: newIndex,
    });
  };

  return (
    <div className="min-h-screen flex flex-col font-body selection:bg-pink selection:text-ink relative">
      {/* Scroll Progress Bar: 4px fixed at top, yellow in light mode, pink in dark mode */}
      <ScrollProgressBar isDark={isDark} />

      {/* Floating Tools Layer: fixed full-viewport (z-[18], pointer-events: none) */}
      <FloatingToolsLayer isDark={isDark} shouldReduceMotion={_reduceMotionActive} />

      {/* Custom Cursor: 14px ink dot that grows to 56px with "VIEW" label over cards */}
      <CustomCursor isDark={isDark} />

      {/* Top Sticky Navigation */}
      <Navbar isDark={isDark} onToggleDark={toggleTheme} />

      {/* MAIN SECTIONS IN SPECIFIED ORDER */}
      <main className="flex-1">
        {/* 1. HERO (Yellow: #FFD60A light, #1A1700 dark) */}
        <HeroSection isDark={isDark} />

        {/* Torn Edge Transition: Hero -> Packaging */}
        {/* On mobile, seamlessly matches Hero's solid base band */}
        <TornEdge
          color={isDark ? '#1F0E15' : '#FF3D81'}
          bgColor={
            isDark
              ? (isMobile ? '#0F0E0C' : '#1A1700')
              : (isMobile ? '#ECC000' : '#FFD60A')
          }
          className="-mt-6 sm:-mt-8 md:-mt-12 relative z-20"
        />

        {/* 2. PACKAGING (Pink: #FF3D81 light, #1F0E15 dark) */}
        <PackagingSection
          isDark={isDark}
          onOpenLightbox={(item) => setActiveLightbox(item)}
        />

        {/* Torn Edge Transition: Packaging -> Gallery/Creatives */}
        {/* Dark tints: packaging #1F0E15 -> gallery #0B1D15 */}
        <TornEdge
          color={isDark ? '#0B1D15' : '#3DDC97'}
          bgColor={isDark ? '#1F0E15' : '#FF3D81'}
        />

        {/* 3. POSTERS, BANNERS AND WEB CREATIVES (Mint: #3DDC97 light, #0B1D15 dark) */}
        <CreativesSection
          isDark={isDark}
          onOpenLightbox={(item) => setActiveLightbox(item)}
        />

        {/* Torn Edge Transition: Gallery/Creatives -> Software directly */}
        {/* Dark tints: gallery #0B1D15 -> software #22120A */}
        <TornEdge
          color={isDark ? '#22120A' : '#FF7A1A'}
          bgColor={isDark ? '#0B1D15' : '#3DDC97'}
        />

        {/* 4. SOFTWARE / INDIE PRODUCTS (Tangerine: #FF7A1A light, #22120A dark) */}
        <SoftwareSection
          isDark={isDark}
          onOpenProductModal={(product) => setActiveProduct(product)}
        />

        {/* Torn Edge Transition: Software -> Arsenal */}
        {/* Dark tints: software #22120A -> arsenal #14120F */}
        <TornEdge
          color={isDark ? '#14120F' : '#FFF8EC'}
          bgColor={isDark ? '#22120A' : '#FF7A1A'}
        />

        {/* 5. ARSENAL (#FFF8EC light, #14120F dark) */}
        <ArsenalSection isDark={isDark} />

        {/* Torn Edge Transition: Arsenal -> Contact */}
        {/* Dark tints: arsenal #14120F -> contact #0A0A09 */}
        <TornEdge
          color={isDark ? '#0A0A09' : '#111111'}
          bgColor={isDark ? '#14120F' : '#FFF8EC'}
        />

        {/* 6. CONTACT (#111111 light, #0A0A09 dark) */}
        <ContactSection isDark={isDark} />
      </main>

      {/* Footer (#111111 light, #0A0A09 dark) */}
      <Footer isDark={isDark} />

      {/* MODALS */}
      {/* Lightbox for Packaging and Posters */}
      {activeLightbox && (
        <LightboxModal
          item={activeLightbox}
          isDark={isDark}
          onClose={() => setActiveLightbox(null)}
          onPrev={() => handleLightboxNav(-1)}
          onNext={() => handleLightboxNav(1)}
        />
      )}

      {/* Product Details Modal */}
      {activeProduct && (
        <ProductModal
          product={activeProduct}
          isDark={isDark}
          onClose={() => setActiveProduct(null)}
        />
      )}
    </div>
  );
}
