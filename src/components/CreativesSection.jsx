import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Maximize2 } from 'lucide-react';
import { portfolioContent } from '../data/content';
import MaskedHeadline from './MaskedHeadline';
import Reveal from './Reveal';

export default function CreativesSection({ isDark, onOpenLightbox }) {
  const shouldReduceMotion = useReducedMotion();
  const { creatives } = portfolioContent;
  const [filter, setFilter] = useState('ALL');

  const categories = ['ALL', 'TYPOGRAPHY', 'RETAIL FMCG', 'MUSIC & EVENTS', 'DIGITAL & SOCIAL'];

  const filteredItems = creatives.gallery.filter((item) => {
    if (filter === 'ALL') return true;
    if (filter === 'TYPOGRAPHY') return item.category.toLowerCase().includes('typographic') || item.category.toLowerCase().includes('poster');
    if (filter === 'RETAIL FMCG') return item.category.toLowerCase().includes('retail') || item.category.toLowerCase().includes('fmcg');
    if (filter === 'MUSIC & EVENTS') return item.category.toLowerCase().includes('gig') || item.category.toLowerCase().includes('film');
    if (filter === 'DIGITAL & SOCIAL') return item.category.toLowerCase().includes('digital') || item.category.toLowerCase().includes('web');
    return true;
  });

  return (
    <section
      id="creatives"
      className="relative section-creatives halftone-overlay pt-24 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header wrapped in Reveal */}
        <Reveal amount={0.25} className="mb-12 sm:mb-16">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="sticker-badge bg-pink text-[#111111] text-xs font-bold rotate-2 tracking-[var(--track-label)]">
              {creatives.tag}
            </span>
            <span className={`font-mono text-xs font-bold uppercase tracking-[var(--track-label)] ${
              isDark ? 'text-[#C9BFAE]' : 'text-ink/80'
            }`}>
              SCREEN-PRINTED EDITIONS &bull; HIGH-IMPACT BANNERS
            </span>
          </div>

          {/* Masked Headline: Slides up from mask, 600ms ease-out */}
          <MaskedHeadline
            lines={[creatives.headline]}
            className={`headline-section font-black transition-colors ${
              isDark ? 'text-mint drop-shadow-[0_0_20px_rgba(61,220,151,0.3)]' : 'text-ink'
            }`}
          />

          <p
            className={`mt-4 text-lg sm:text-xl font-body font-semibold max-w-2xl leading-relaxed tracking-[var(--track-lead)] text-pretty ${
              isDark ? 'text-[#FFF8EC]' : 'text-ink/90'
            }`}
          >
            {creatives.description}
          </p>

          {/* Filter Pills with slide-fill & active spring indicator */}
          <div className="mt-8 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                onClick={() => setFilter(cat)}
                className={`min-h-[44px] px-4 py-2 font-mono text-xs font-bold uppercase tracking-[var(--track-button)] whitespace-nowrap rounded border transition-colors duration-150 cursor-pointer ${
                  filter === cat
                    ? 'bg-yellow text-[#111111] border-[#111111] shadow-[2px_2px_0px_#111111] translate-x-[1px] translate-y-[1px]'
                    : isDark
                      ? 'bg-[#1A1815] text-[#FFF8EC] border-[#2E2A24] hover:border-mint hover:text-mint'
                      : 'bg-paper text-ink border-2 border-ink shadow-[3px_3px_0px_#111111] hover:bg-yellow'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </Reveal>

        {/* Masonry Gallery with Slap-In Entrance & Reveal Wrapper */}
        <Reveal amount={0.2} className="columns-1 sm:columns-2 lg:columns-3 gap-6 sm:gap-8 space-y-6 sm:space-y-8">
          {filteredItems.map((item, idx) => {
            const slapRotation = idx % 2 === 0 ? 6 : -6;

            return (
              <motion.div
                key={item.id}
                initial={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : { scale: 1.08, rotate: slapRotation, opacity: 0 }
                }
                whileInView={{
                  scale: 1,
                  rotate: 0,
                  opacity: 1,
                  transition: {
                    type: 'spring',
                    stiffness: 320,
                    damping: 22,
                    delay: shouldReduceMotion ? 0 : (idx % 6) * 0.07,
                  },
                }}
                viewport={{ once: true, amount: 0.1 }}
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : {
                        y: -8,
                        scale: 1.03,
                        rotate: 0,
                        transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
                      }
                }
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                onClick={() => onOpenLightbox({ ...item, type: 'creative', index: idx })}
                data-cursor="view"
                className={`break-inside-avoid group relative rounded-lg overflow-hidden cursor-pointer focus-within:ring-4 ${
                  isDark
                    ? 'bg-[#1A1815] border border-[#2E2A24] hover:border-mint focus-within:ring-mint'
                    : 'bg-paper border-3 border-ink shadow-[5px_5px_0px_#111111] hover:shadow-[9px_9px_0px_#111111] focus-within:ring-ink'
                }`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpenLightbox({ ...item, type: 'creative', index: idx });
                  }
                }}
                role="button"
                aria-label={`View poster: ${item.title}`}
              >
                {/* Giant Number Tag Badge: Tabular numbers, rotates 90deg on card hover */}
                <div className="absolute top-3 right-3 z-20">
                  <span className="inline-flex items-center justify-center min-w-[42px] h-[36px] px-2.5 bg-yellow text-[#111111] font-headline text-lg font-black tabular-nums tracking-[0.02em] border-2 border-[#111111] rounded shadow-[2px_2px_0px_#111111] group-hover:rotate-90 group-hover:scale-105 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] origin-center">
                    {item.numberTag}
                  </span>
                </div>

                {/* Category Pill Tag */}
                <div className="absolute top-3 left-3 z-20">
                  <span className="inline-block px-2.5 py-1 bg-yellow text-[#111111] font-mono text-[10px] font-bold uppercase tracking-[var(--track-label)] border-2 border-[#111111] rounded shadow-[2px_2px_0px_#111111]">
                    {item.category}
                  </span>
                </div>

                {/* Poster Image - scales 1.05 inside frame on hover */}
                <div className="p-2 sm:p-2.5">
                  <div className={`relative overflow-hidden rounded ${
                    isDark
                      ? 'mockup-frame bg-[#FFF8EC] rounded-md p-2'
                      : 'bg-ink/10 rounded'
                  }`}>
                    <img
                      src={item.image}
                      alt={item.title}
                      width={item.width}
                      height={item.height}
                      loading="lazy"
                      decoding="async"
                      className={`w-full h-auto object-cover transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 ${
                        isDark ? 'framed-mockup' : ''
                      }`}
                    />

                    {/* Hover overlay hint */}
                    <div className="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <span className="p-3 bg-yellow text-[#111111] rounded border-2 border-[#111111] shadow-[3px_3px_0px_#111111] flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[var(--track-button)] whitespace-nowrap">
                        <Maximize2 className="w-4 h-4 text-[#111111]" />
                        <span>Expand Poster</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Label */}
                <div className={`p-4 border-t ${
                  isDark
                    ? 'bg-[#1A1815] border-[#2E2A24]'
                    : 'bg-paper border-t-2.5 border-ink'
                }`}>
                  <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                    <span className={`uppercase tracking-[var(--track-label)] ${isDark ? 'text-mint' : 'text-ink/75'}`}>{item.format}</span>
                    <span className="text-pink tracking-[var(--track-label)] uppercase">INSPECT &bull;</span>
                  </div>
                  <h3 className={`font-headline text-xl sm:text-2xl leading-tight uppercase tracking-[var(--track-heading)] transition-colors text-balance ${
                    isDark ? 'text-[#FFF8EC] group-hover:text-mint' : 'text-ink'
                  }`}>
                    {item.title}
                  </h3>
                  <p className={`mt-1 text-xs font-body font-medium line-clamp-2 text-pretty ${
                    isDark ? 'text-[#C9BFAE]' : 'text-ink/80'
                  }`}>
                    {item.details}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
