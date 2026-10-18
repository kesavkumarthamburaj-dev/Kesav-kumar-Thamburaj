import React, { useRef, useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Quote, ArrowLeft, ArrowRight } from 'lucide-react';
import { portfolioContent } from '../data/content';
import MaskedHeadline from './MaskedHeadline';

// Project badge styling map
const PROJECT_TAG_STYLES = {
  Packaging: 'bg-[#FFD60A] text-[#111111] border-[#111111]',
  App: 'bg-[#FF3D81] text-[#111111] border-[#111111]',
  Video: 'bg-[#2F5BFF] text-white border-[#111111]',
  Software: 'bg-[#FF3D81] text-[#111111] border-[#111111]',
};

function getProjectTagStyle(project, isDark) {
  if (!project) return '';
  if (PROJECT_TAG_STYLES[project]) return PROJECT_TAG_STYLES[project];
  if (/software|quotation|application|app/i.test(project)) {
    return 'bg-[#FF3D81] text-[#111111] border-[#111111]';
  }
  if (/packaging/i.test(project)) {
    return 'bg-[#FFD60A] text-[#111111] border-[#111111]';
  }
  if (/video/i.test(project)) {
    return 'bg-[#2F5BFF] text-white border-[#111111]';
  }
  return isDark
    ? 'bg-[#3DDC97] text-[#111111] border-[#111111]'
    : 'bg-[#FFD60A] text-[#111111] border-[#111111]';
}

function formatRoleCompany(role, company) {
  const parts = [role, company]
    .map((s) => (typeof s === 'string' ? s.trim() : ''))
    .filter(Boolean);
  return parts.join(', ');
}

function TestimonialCard({ item, index, isDark, shouldReduceMotion }) {
  // Alternating card rotation (-2deg / +2deg), straightens on hover
  const initialRotation = shouldReduceMotion ? 0 : (index % 2 === 0 ? -2 : 2);
  const tagStyle = getProjectTagStyle(item.project, isDark);
  const roleCompany = formatRoleCompany(item.role, item.company);

  // Quote limit raised to 320 characters
  const MAX_QUOTE_LENGTH = 320;
  const displayQuote = item.quote && item.quote.length > MAX_QUOTE_LENGTH
    ? `${item.quote.slice(0, MAX_QUOTE_LENGTH - 3).trim()}...`
    : item.quote;

  return (
    <motion.article
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.88, y: 30, rotate: initialRotation }}
      whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0, rotate: initialRotation }}
      viewport={{ once: true, amount: 0.15 }}
      whileHover={shouldReduceMotion ? undefined : { rotate: 0, scale: 1.02, transition: { duration: 0.25, ease: 'easeOut' } }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: shouldReduceMotion ? 0 : index * 0.1 }}
      className={`group relative flex flex-col justify-between p-6 sm:p-8 rounded-xl border-3 select-none transition-shadow shrink-0 w-full bg-[#FFF8EC] text-[#111111] border-[#111111] ${
        isDark
          ? 'shadow-[5px_5px_0px_#3DDC97]'
          : 'shadow-[5px_5px_0px_#111111]'
      }`}
    >
      {/* 1. Large decorative quote mark */}
      <div className="mb-4" aria-hidden="true">
        <Quote className="w-11 h-11 sm:w-12 sm:h-12 fill-[#111111] text-[#111111] rotate-180" />
      </div>

      {/* 2. Quote in DM Sans 17px, line-height 1.6, text-wrap: pretty */}
      <blockquote className="flex-1 font-body text-[17px] leading-[1.6] [text-wrap:pretty] font-medium text-[#111111] mb-6">
        {displayQuote}
      </blockquote>

      {/* Meta: Name (bold ink #111111) + "role, company" below it + project sticker tag */}
      <div className="pt-4 border-t-2 border-dashed border-[#111111]/25 flex flex-col gap-3">
        {/* 3. Name (bold ink #111111) and "role, company" below it */}
        <div>
          <p className="font-body font-black text-base sm:text-lg text-[#111111] leading-snug">
            {item.name}
          </p>
          {roleCompany ? (
            <p className="font-body text-sm font-semibold text-[#111111]/80 leading-normal mt-0.5">
              {roleCompany}
            </p>
          ) : null}
        </div>

        {/* 4. Project as a small sticker tag */}
        {item.project && (
          <div className="pt-0.5">
            <span
              className={`inline-block px-2.5 py-0.5 rounded font-mono text-[11px] font-black uppercase tracking-wider border-2 shadow-[2px_2px_0px_#111111] ${tagStyle}`}
            >
              {item.project}
            </span>
          </div>
        )}
      </div>
    </motion.article>
  );
}

export default function TestimonialsSection({ isDark }) {
  const shouldReduceMotion = useReducedMotion();
  const carouselRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);

  const items = portfolioContent.testimonials?.items || [];

  // Track active slide on native swipe / scroll
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (el.scrollLeft > 2) {
        setHasScrolled(true);
      }
      const children = Array.from(el.children);
      if (!children.length) return;
      const scrollCenter = el.scrollLeft + el.clientWidth / 2;
      let closestIdx = 0;
      let minDistance = Infinity;

      children.forEach((child, idx) => {
        const childCenter = child.offsetLeft + child.offsetWidth / 2;
        const dist = Math.abs(scrollCenter - childCenter);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = idx;
        }
      });

      setActiveIndex(closestIdx);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [items.length]);

  const scrollToCard = (index) => {
    setHasScrolled(true);
    const el = carouselRef.current;
    if (!el) return;
    const children = Array.from(el.children);
    const target = children[index];
    if (!target) return;
    const scrollLeft = target.offsetLeft - (el.clientWidth - target.offsetWidth) / 2;
    el.scrollTo({
      left: scrollLeft,
      behavior: shouldReduceMotion ? 'instant' : 'smooth',
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (activeIndex > 0) scrollToCard(activeIndex - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (activeIndex < items.length - 1) scrollToCard(activeIndex + 1);
    }
  };

  const isPrevDisabled = activeIndex === 0;
  const isNextDisabled = activeIndex === items.length - 1;

  // If the array is empty, hide the entire section so no empty block shows
  if (!items || items.length === 0) {
    return null;
  }

  const { sectionId, tag, headline } = portfolioContent.testimonials;

  return (
    <section
      id={sectionId || 'testimonials'}
      aria-label="Client Testimonials"
      className={`relative scroll-mt-16 sm:scroll-mt-20 py-20 sm:py-28 overflow-hidden transition-colors ${
        isDark ? 'bg-[#0B1D15] text-[#FFF8EC]' : 'bg-[#3DDC97] text-[#111111]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-start gap-3 mb-12 sm:mb-16">
          {/* Sticker Tag */}
          <span
            className={`inline-block px-3 py-1 rounded font-mono text-xs font-black uppercase tracking-[var(--track-label)] border-2.5 ${
              isDark
                ? 'bg-[#181715] text-[#3DDC97] border-[#3DDC97] shadow-[3px_3px_0px_#3DDC97]'
                : 'bg-[#FFF8EC] text-[#111111] border-[#111111] shadow-[3px_3px_0px_#111111]'
            }`}
          >
            {tag || 'CLIENT VOICES'}
          </span>

          {/* Giant Anton Section Headline */}
          <div className="w-full">
            <h2 className="sr-only">{headline || 'KIND WORDS'}</h2>
            <MaskedHeadline
              as="div"
              className="font-headline text-6xl sm:text-7xl md:text-8xl lg:text-9xl uppercase tracking-[var(--track-heading)] leading-none select-none text-stroke"
            >
              {headline || 'KIND WORDS'}
            </MaskedHeadline>
          </div>
          <p
            className={`font-mono text-xs sm:text-sm font-bold uppercase tracking-wider ${
              isDark ? 'text-[#C9BFAE]' : 'text-[#111111]/80'
            }`}
          >
            Unfiltered feedback from brands, startups, and founders I collaborate with.
          </p>
        </div>

        {/* Testimonials Container */}
        {/* Mobile: Horizontal swipe carousel with snap, dots, swipe hint, prev/next buttons */}
        <div className="md:hidden flex flex-col items-center">
          <div
            ref={carouselRef}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            aria-label="Client testimonials carousel. Use left and right arrow keys to navigate."
            role="region"
            className="w-full flex overflow-x-auto snap-x snap-mandatory scrollbar-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD60A]"
            style={{
              scrollSnapType: 'x mandatory',
              overscrollBehaviorX: 'contain',
              touchAction: 'pan-x pan-y',
              WebkitOverflowScrolling: 'touch',
              gap: '14px',
              paddingInline: 'calc((100vw - min(86vw, 360px)) / 2)',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {items.map((item, idx) => (
              <div
                key={`${item.name}-${idx}`}
                style={{
                  width: 'min(86vw, 360px)',
                  scrollSnapAlign: 'center',
                  flexShrink: 0,
                }}
              >
                <TestimonialCard
                  item={item}
                  index={idx}
                  isDark={isDark}
                  shouldReduceMotion={shouldReduceMotion}
                />
              </div>
            ))}
          </div>

          {/* Carousel Controls: Swipe Hint, Prev/Next Arrows, Pagination Dots */}
          <div className="mt-6 flex flex-col items-center gap-3 w-full max-w-[360px] px-2">
            {/* Small Swipe hint with arrow that disappears after first scroll */}
            {!hasScrolled && (
              <div
                className={`flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-pink ${
                  shouldReduceMotion ? '' : 'animate-pulse'
                }`}
                aria-hidden="true"
              >
                <span>Swipe</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            )}

            <div className="flex items-center justify-between w-full">
              {/* Prev button (44px) */}
              <button
                type="button"
                onClick={() => {
                  setHasScrolled(true);
                  scrollToCard(Math.max(0, activeIndex - 1));
                }}
                disabled={isPrevDisabled}
                aria-disabled={isPrevDisabled ? 'true' : undefined}
                aria-label="Previous testimonial"
                className={`w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border-2 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD60A] focus-visible:ring-offset-2 ${
                  isDark
                    ? 'bg-[#3DDC97] text-[#111111] border-[#FFF8EC] shadow-[2px_2px_0px_#FFF8EC] focus-visible:ring-offset-[#0B1D15]'
                    : 'bg-[#111111] text-[#FFF8EC] border-[#111111] shadow-[2px_2px_0px_rgba(0,0,0,0.3)] focus-visible:ring-offset-[#3DDC97]'
                } ${
                  isPrevDisabled
                    ? 'opacity-40 cursor-not-allowed transform-none'
                    : 'cursor-pointer active:scale-[0.94]'
                }`}
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
              </button>

              {/* Pagination dots (8px inactive, 24x8px active, 44px tap area) */}
              <div className="flex items-center gap-1" role="tablist" aria-label="Testimonial slides">
                {items.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={activeIndex === i}
                    aria-label={`Go to testimonial ${i + 1}`}
                    onClick={() => {
                      setHasScrolled(true);
                      scrollToCard(i);
                    }}
                    className={`group w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center p-0 m-0 rounded-full cursor-pointer transition-transform active:scale-[0.94] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD60A] focus-visible:ring-offset-2 ${
                      isDark ? 'focus-visible:ring-offset-[#0B1D15]' : 'focus-visible:ring-offset-[#3DDC97]'
                    }`}
                  >
                    <span
                      className={`rounded-full transition-all duration-200 ${
                        activeIndex === i
                          ? 'w-[24px] h-[8px] bg-[#FF3D81] shadow-[1px_1px_0px_#111111]'
                          : isDark
                            ? 'w-[8px] h-[8px] bg-[#FFF8EC] opacity-60 group-hover:opacity-100'
                            : 'w-[8px] h-[8px] bg-[#111111] opacity-40 group-hover:opacity-70'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Next button (44px) */}
              <button
                type="button"
                onClick={() => {
                  setHasScrolled(true);
                  scrollToCard(Math.min(items.length - 1, activeIndex + 1));
                }}
                disabled={isNextDisabled}
                aria-disabled={isNextDisabled ? 'true' : undefined}
                aria-label="Next testimonial"
                className={`w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border-2 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD60A] focus-visible:ring-offset-2 ${
                  isDark
                    ? 'bg-[#3DDC97] text-[#111111] border-[#FFF8EC] shadow-[2px_2px_0px_#FFF8EC] focus-visible:ring-offset-[#0B1D15]'
                    : 'bg-[#111111] text-[#FFF8EC] border-[#111111] shadow-[2px_2px_0px_rgba(0,0,0,0.3)] focus-visible:ring-offset-[#3DDC97]'
                } ${
                  isNextDisabled
                    ? 'opacity-40 cursor-not-allowed transform-none'
                    : 'cursor-pointer active:scale-[0.94]'
                }`}
              >
                <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop: 2 columns centred (max-width 960px) */}
        <div className="hidden md:grid md:grid-cols-2 gap-6 lg:gap-8 max-w-[960px] mx-auto items-stretch">
          {items.map((item, idx) => (
            <TestimonialCard
              key={`${item.name}-${idx}`}
              item={item}
              index={idx}
              isDark={isDark}
              shouldReduceMotion={shouldReduceMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
