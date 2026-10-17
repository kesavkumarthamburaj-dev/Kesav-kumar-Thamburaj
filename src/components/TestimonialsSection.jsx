import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Quote } from 'lucide-react';
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
      className={`group relative flex flex-col justify-between p-6 sm:p-8 rounded-xl border-3 select-none transition-shadow shrink-0 w-[85vw] sm:w-[380px] md:w-auto snap-center ${
        isDark
          ? 'bg-[#181715] text-[#FFF8EC] border-[#3DDC97] shadow-[5px_5px_0px_#3DDC97]'
          : 'bg-[#FFF8EC] text-[#111111] border-[#111111] shadow-[5px_5px_0px_#111111]'
      }`}
    >
      {/* 1. Large decorative quote mark */}
      <div className="mb-4" aria-hidden="true">
        <Quote
          className={`w-11 h-11 sm:w-12 sm:h-12 fill-current rotate-180 ${
            isDark ? 'text-[#3DDC97]' : 'text-[#111111]'
          }`}
        />
      </div>

      {/* 2. Quote in DM Sans 17px, line-height 1.6, text-wrap: pretty */}
      <blockquote className="flex-1 font-body text-[17px] leading-[1.6] [text-wrap:pretty] font-medium mb-6">
        {displayQuote}
      </blockquote>

      {/* Meta: Name (bold) + "role, company" below it + project sticker tag */}
      <div className="pt-4 border-t-2 border-dashed border-current/20 flex flex-col gap-3">
        {/* 3. Name (bold) and "role, company" below it (skip any empty field and any stray comma) */}
        <div>
          <p className="font-body font-bold text-base sm:text-lg text-[#111111] dark:text-[#FFF8EC] leading-snug">
            {item.name}
          </p>
          {roleCompany ? (
            <p className="font-body text-sm text-[#55514B] dark:text-[#C9BFAE] leading-normal mt-0.5">
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
        {/* Mobile: Horizontal swipe carousel with snap */}
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
