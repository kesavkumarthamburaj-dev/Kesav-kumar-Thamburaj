import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { portfolioContent } from '../data/content';
import MaskedHeadline from './MaskedHeadline';
import Reveal from './Reveal';

export default function SoftwareSection({ isDark, onOpenProductModal }) {
  const shouldReduceMotion = useReducedMotion();
  const { software } = portfolioContent;
  const [hoveredIdx, setHoveredIdx] = useState(null);

  return (
    <section
      id="software"
      className="relative section-software halftone-overlay pt-24 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header wrapped in Reveal */}
        <Reveal amount={0.25} className="mb-14 sm:mb-20">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="sticker-badge bg-yellow text-[#111111] text-xs font-bold rotate-1 tracking-[var(--track-label)]">
              {software.tag}
            </span>
            <span className={`font-mono text-xs font-bold uppercase tracking-[var(--track-label)] ${
              isDark ? 'text-[#C9BFAE]' : 'text-ink/80'
            }`}>
              CODE &bull; SAAS &bull; CLIENT ENGINES
            </span>
          </div>

          {/* Masked Headline: Slides up from mask, 600ms ease-out */}
          <MaskedHeadline
            lines={[software.headline]}
            className={`headline-section font-black transition-colors ${
              isDark ? 'text-tangerine drop-shadow-[0_0_20px_rgba(255,122,26,0.3)]' : 'text-ink'
            }`}
          />

          <p
            className={`mt-4 text-lg sm:text-xl font-body font-semibold max-w-2xl leading-relaxed tracking-[var(--track-lead)] text-pretty ${
              isDark ? 'text-[#FFF8EC]' : 'text-ink/90'
            }`}
          >
            {software.description}
          </p>
        </Reveal>

        {/* 2x2 Grid of Poster Cards with Slap-In Entrance & Reveal */}
        <Reveal amount={0.2} className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 lg:gap-12">
          {software.products.map((product, idx) => {
            const slapRotation = idx % 2 === 0 ? 6 : -6;
            const isHovered = hoveredIdx === idx;
            const spinRotation = idx % 2 === 0 ? 8 : -8;

            return (
              <motion.article
                key={product.id}
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
                    delay: shouldReduceMotion ? 0 : idx * 0.07,
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
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                data-cursor="view"
                className={`group relative rounded-xl overflow-hidden flex flex-col justify-between cursor-pointer ${
                  isDark
                    ? 'bg-[#1A1815] border border-[#2E2A24] hover:border-tangerine hover:shadow-[0_0_28px_rgba(255,122,26,0.2)]'
                    : 'bg-paper border-3.5 border-ink shadow-[6px_6px_0px_#111111] hover:shadow-[10px_10px_0px_#111111]'
                }`}
              >
                {/* Card Header Strip */}
                <div className={`px-5 py-3 flex items-center justify-between border-b ${
                  isDark ? 'bg-[#1A1815] border-[#2E2A24]' : 'bg-paper border-b-2.5 border-ink'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-pink border border-[#111111]" />
                    <span className="w-3 h-3 rounded-full bg-yellow border border-[#111111]" />
                    <span className="w-3 h-3 rounded-full bg-mint border border-[#111111]" />
                    <span className={`ml-2 font-mono text-xs font-bold uppercase tracking-[var(--track-label)] ${
                      isDark ? 'text-[#C9BFAE]' : 'text-ink/70'
                    }`}>
                      APP {idx + 1}
                    </span>
                  </div>

                  {/* Rotated Status Sticker: spins +/-8deg on hover */}
                  <div
                    className="px-3 py-1 font-mono text-xs font-black uppercase tracking-[var(--track-label)] rounded border-2 border-[#111111] shadow-[2px_2px_0px_#111111] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{
                      backgroundColor: product.stickerBg,
                      color: '#111111',
                      transform: isHovered
                        ? `rotate(${spinRotation}deg) scale(1.05)`
                        : idx % 2 === 0
                          ? 'rotate(-2.5deg)'
                          : 'rotate(2.5deg)',
                    }}
                  >
                    {product.sticker}
                  </div>
                </div>

                {/* App Image Preview / UI Mockup */}
                <div className="p-2.5 sm:p-3">
                  <div className={`relative aspect-[16/10] w-full overflow-hidden border ${
                    isDark
                      ? 'mockup-frame bg-[#FFF8EC] border-[#2E2A24] rounded-lg p-2'
                      : 'bg-ink/5 border-b-2.5 border-ink rounded'
                  }`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      width={product.width}
                      height={product.height}
                      loading="lazy"
                      decoding="async"
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-104 ${
                        isDark ? 'framed-mockup' : ''
                      }`}
                    />

                    <div className="absolute bottom-3 left-3">
                      <span className="px-2.5 py-1 bg-yellow text-[#111111] font-mono text-[11px] font-bold uppercase rounded border border-[#111111] shadow-[1px_1px_0px_#111111] tabular-nums tracking-[0.02em]">
                        {product.metrics}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className={`font-headline text-3xl sm:text-4xl leading-tight uppercase tracking-[var(--track-heading)] transition-colors text-balance ${
                      isDark ? 'text-[#FFF8EC] group-hover:text-tangerine' : 'text-ink'
                    }`}>
                      {product.name}
                    </h3>

                    <p className={`mt-1 font-body text-sm sm:text-base font-bold leading-snug tracking-[var(--track-lead)] ${
                      isDark ? 'text-tangerine' : 'text-ink'
                    }`}>
                      {product.tagline}
                    </p>

                    <p className={`mt-3 font-body text-xs sm:text-sm leading-relaxed text-pretty ${
                      isDark ? 'text-[#C9BFAE]' : 'text-ink/80'
                    }`}>
                      {product.description}
                    </p>

                    {/* Tech Stack Pills */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {product.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className={`px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[var(--track-label)] rounded border ${
                            isDark
                              ? 'bg-[#14120F] text-[#FFF8EC] border-[#2E2A24]'
                              : 'bg-paper text-ink border-1.5 border-ink shadow-[1px_1px_0px_#111111]'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Action: View Button with Arrow sliding 6px right on hover */}
                  <div className={`mt-6 pt-4 border-t flex items-center justify-between ${
                    isDark ? 'border-[#2E2A24]' : 'border-ink/20'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      {product.url && (
                        <a
                          href={product.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="btn-slide-fill inline-flex items-center gap-1.5 px-4 py-2 bg-mint text-[#111111] font-mono text-xs sm:text-sm font-bold uppercase tracking-[var(--track-button)] whitespace-nowrap rounded border-2.5 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-yellow hover:scale-105 transition-all cursor-pointer"
                        >
                          <span>Live App</span>
                          <ArrowUpRight className="w-4 h-4 text-[#111111]" />
                        </a>
                      )}

                      <motion.button
                        whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                        onClick={() => onOpenProductModal(product)}
                        className="btn-slide-fill group/btn px-4 py-2 bg-yellow text-[#111111] font-mono text-xs sm:text-sm font-bold uppercase tracking-[var(--track-button)] whitespace-nowrap rounded border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-mint transition-colors duration-150 inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Details</span>
                      </motion.button>
                    </div>

                    <span className={`font-mono text-xs font-bold uppercase tracking-[var(--track-label)] ${
                      isDark ? 'text-[#C9BFAE]' : 'text-ink/70'
                    }`}>
                      INDIE LAB
                    </span>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
