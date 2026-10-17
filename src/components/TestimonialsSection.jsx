import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { MessageSquareQuote, Quote } from 'lucide-react';
import { portfolioContent } from '../data/content';
import MaskedHeadline from './MaskedHeadline';

// Project badge styling map
const PROJECT_TAG_STYLES = {
  Packaging: 'bg-[#FFD60A] text-[#111111] border-[#111111]',
  App: 'bg-[#FF3D81] text-[#111111] border-[#111111]',
  Video: 'bg-[#2F5BFF] text-white border-[#111111]',
  Software: 'bg-[#FF3D81] text-[#111111] border-[#111111]',
};

// Rotations applied to alternating cards for poster-wall rhythm (-2deg, +2deg, -1.5deg)
const CARD_ROTATIONS = [-2, 2, -1.5, 1.8, -2.2, 1.5];

function TestimonialCard({ item, index, isDark, shouldReduceMotion }) {
  const initialRotation = shouldReduceMotion ? 0 : CARD_ROTATIONS[index % CARD_ROTATIONS.length];
  const tagStyle = PROJECT_TAG_STYLES[item.project] || 'bg-[#FFF8EC] text-[#111111] border-[#111111]';
  const initialLetter = item.name ? item.name.trim().charAt(0).toUpperCase() : 'C';

  // Truncate to maximum 220 characters as required
  const displayQuote = item.quote && item.quote.length > 220
    ? `${item.quote.slice(0, 217).trim()}...`
    : item.quote;

  return (
    <motion.article
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.88, y: 25, rotate: initialRotation }}
      whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0, rotate: initialRotation }}
      viewport={{ once: true, amount: 0.15 }}
      whileHover={shouldReduceMotion ? undefined : { rotate: 0, scale: 1.02, transition: { duration: 0.25, ease: 'easeOut' } }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: shouldReduceMotion ? 0 : index * 0.08 }}
      className={`group relative flex flex-col justify-between p-6 sm:p-7 rounded-xl border-3 select-none transition-shadow shrink-0 w-[85vw] sm:w-[360px] md:w-auto snap-start ${
        isDark
          ? 'bg-[#181715] text-[#FFF8EC] border-[#3DDC97] shadow-[5px_5px_0px_#3DDC97]'
          : 'bg-[#FFF8EC] text-[#111111] border-[#111111] shadow-[5px_5px_0px_#111111]'
      }`}
    >
      {/* Top row: Quote glyph + Project tag */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <span
          className={`w-9 h-9 rounded-lg flex items-center justify-center border-2 ${
            isDark ? 'bg-[#3DDC97]/20 border-[#3DDC97] text-[#3DDC97]' : 'bg-[#3DDC97] border-[#111111] text-[#111111]'
          }`}
          aria-hidden="true"
        >
          <Quote className="w-5 h-5 fill-current rotate-180" />
        </span>

        {item.project && (
          <span
            className={`px-2.5 py-0.5 rounded font-mono text-[11px] font-black uppercase tracking-wider border-2 shadow-[2px_2px_0px_#111111] ${tagStyle}`}
          >
            {item.project}
          </span>
        )}
      </div>

      {/* Quote text body (Max 220 chars) */}
      <blockquote className="flex-1 font-body text-base sm:text-lg font-medium leading-relaxed mb-6">
        &ldquo;{displayQuote}&rdquo;
      </blockquote>

      {/* Author / Client meta row */}
      <div className="pt-4 border-t-2 border-dashed border-current/20 flex items-center gap-3">
        {/* Initial / Logo Tile */}
        <div
          className={`w-10 h-10 min-w-[40px] min-h-[40px] rounded-lg border-2 flex items-center justify-center font-headline font-black text-lg select-none transition-transform group-hover:scale-105 ${
            isDark
              ? 'bg-[#3DDC97] text-[#111111] border-[#3DDC97]'
              : 'bg-[#FFD60A] text-[#111111] border-[#111111] shadow-[2px_2px_0px_#111111]'
          }`}
          aria-hidden="true"
        >
          {initialLetter}
        </div>

        <div className="flex flex-col min-w-0">
          <cite className="not-italic font-headline text-lg leading-tight uppercase tracking-wide truncate">
            {item.name}
          </cite>
          <span className="font-mono text-xs opacity-75 truncate">
            {item.role ? `${item.role}, ` : ''}{item.company}
          </span>
        </div>
      </div>
    </motion.article>
  );
}

export default function TestimonialsSection({ isDark }) {
  const shouldReduceMotion = useReducedMotion();
  const items = portfolioContent.testimonials?.items || [];

  // CRITICAL REQUIREMENT: If the array is empty, hide the entire section so no empty block shows
  if (!items || items.length === 0) {
    return null;
  }

  const { sectionId, tag, headline } = portfolioContent.testimonials;

  return (
    <section
      id={sectionId || 'testimonials'}
      aria-label="Client Testimonials"
      className={`relative py-20 sm:py-28 overflow-hidden transition-colors ${
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
        {/* Mobile: Horizontal swipe carousel with snap, 1.1 cards visible */}
        {/* Desktop: 3-column responsive grid */}
        <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory pb-6 gap-4 -mx-4 px-4 scrollbar-none">
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

        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 items-stretch">
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
