import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { portfolioContent } from '../data/content';
import MaskedHeadline from './MaskedHeadline';
import Reveal from './Reveal';

/**
 * 40x40px rounded-square logo tile:
 * - 40x40px, border-radius 10px, background #FFF8EC (paper) with 6px padding.
 * - In dark mode: keep paper tile and add 1px border #2E2A24.
 * - Rendered with <img> (width/height set, loading="lazy", decoding="async", alt="<Tool> logo").
 * - Fallback tile: if logo fails or is missing, show first letter of tool name, bold, on column strip color.
 */
function LogoTile({ tool, stripColor, stripTextColor, isDark }) {
  const [imgError, setImgError] = useState(false);

  // Fallback tile: first letter of tool name, bold, on the column's strip colour
  if (imgError || !tool.logo) {
    return (
      <div
        className="w-10 h-10 min-w-[40px] min-h-[40px] max-w-[40px] max-h-[40px] rounded-[10px] flex items-center justify-center font-headline font-black text-lg transition-transform duration-200 group-hover:scale-110 shrink-0 select-none border border-black/15 shadow-sm"
        style={{
          backgroundColor: stripColor,
          color: stripTextColor || '#111111',
        }}
        aria-label={`${tool.name} initial`}
      >
        {tool.name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div
      className={`w-10 h-10 min-w-[40px] min-h-[40px] max-w-[40px] max-h-[40px] rounded-[10px] p-[6px] bg-[#FFF8EC] flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shrink-0 select-none overflow-hidden ${
        isDark ? 'border border-[#2E2A24]' : 'border border-black/10 shadow-sm'
      }`}
    >
      <img
        src={tool.logo}
        alt={`${tool.name} logo`}
        width={40}
        height={40}
        loading="lazy"
        decoding="async"
        onError={() => setImgError(true)}
        className="w-full h-full object-contain"
      />
    </div>
  );
}

/**
 * Chunky Chip Component:
 * - 40px rounded-square logo tile on left
 * - Tool name on right (uppercase, label tracking)
 * - 44px min touch height on mobile
 * - Hover: wiggle (rotate -3deg, +3deg, 0 over 400ms), logo tile scales 1.1, background fills with strip color
 * - Stagger-pop in on scroll
 */
function ToolChip({ tool, col, isDark, shouldReduceMotion, index }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { scale: 0.75, opacity: 0 }}
      whileInView={shouldReduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: shouldReduceMotion ? 0.01 : 0.35,
        delay: shouldReduceMotion ? 0 : index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              rotate: [-3, 3, -1, 1, 0],
              scale: 1.02,
              transition: { duration: 0.4, ease: 'easeInOut' },
            }
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={
        isHovered
          ? {
              backgroundColor: col.stripColor,
              color: col.textColor || '#111111',
              borderColor: '#111111',
            }
          : {}
      }
      className={`group min-h-[44px] sm:min-h-[48px] px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl flex items-center gap-2.5 cursor-default select-none border transition-colors duration-200 ${
        isDark
          ? 'bg-[#1A1815] text-[#FFF8EC] border-[#2E2A24]'
          : 'bg-[#FFF8EC] text-ink border-2.5 border-ink shadow-[2.5px_2.5px_0px_#111111]'
      }`}
    >
      <LogoTile
        tool={tool}
        stripColor={col.stripColor}
        stripTextColor={col.textColor}
        isDark={isDark}
      />
      <span className="font-mono text-xs sm:text-[13px] font-bold uppercase tracking-[var(--track-label)] leading-tight truncate">
        {tool.name}
      </span>
    </motion.div>
  );
}

export default function ArsenalSection({ isDark }) {
  const shouldReduceMotion = useReducedMotion();
  const { arsenal } = portfolioContent;

  return (
    <section
      id="arsenal"
      className="relative section-arsenal halftone-overlay pt-24 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header wrapped in Reveal */}
        <Reveal amount={0.25} className="mb-14 sm:mb-20 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-4">
            <span className="sticker-badge bg-mint text-[#111111] text-xs font-bold -rotate-1 tracking-[var(--track-label)]">
              {arsenal.tag}
            </span>
            <span
              className={`font-mono text-xs font-bold uppercase tracking-[var(--track-label)] ${
                isDark ? 'text-[#C9BFAE]' : 'text-ink/80'
              }`}
            >
              CRAFT &bull; PRECISION &bull; HIGH-THROUGHPUT
            </span>
          </div>

          {/* Masked Headline: Title "ARSENAL" in giant type */}
          <MaskedHeadline
            lines={[arsenal.headline]}
            className={`headline-giant font-black leading-none transition-colors ${
              isDark ? 'text-mint drop-shadow-[0_0_24px_rgba(61,220,151,0.3)]' : 'text-ink'
            }`}
          />
        </Reveal>

        {/* 3 Columns with Coloured Header Strips (Design = pink, Video = blue, AI tools = mint) */}
        <Reveal amount={0.2} className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {arsenal.columns.map((col, colIdx) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.45,
                delay: colIdx * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`rounded-xl overflow-hidden flex flex-col transition-all duration-200 ${
                isDark
                  ? 'bg-[#1A1815] border border-[#2E2A24] hover:shadow-[0_0_24px_rgba(61,220,151,0.2)]'
                  : 'bg-paper border-3.5 border-ink shadow-[6px_6px_0px_#111111]'
              }`}
            >
              {/* Coloured Header Strip */}
              <div
                className="px-6 py-4 border-b-2.5 border-[#111111] flex items-center justify-between"
                style={{
                  backgroundColor: col.stripColor,
                  color: col.textColor,
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#111111] border-2 border-white/60" />
                  <h3 className="font-headline text-3xl font-black uppercase tracking-[var(--track-heading)] text-balance">
                    {col.title}
                  </h3>
                </div>

                <span
                  className="font-mono text-xs font-black uppercase px-2.5 py-1 rounded border-2 border-[#111111] tabular-nums tracking-[0.02em]"
                  style={{
                    backgroundColor: col.stripColor === '#2F5BFF' ? '#FFD60A' : '#111111',
                    color: col.stripColor === '#2F5BFF' ? '#111111' : '#FFF8EC',
                  }}
                >
                  {col.tools.length} Tools
                </span>
              </div>

              {/* Chunky Chips: Wrap 2 per row, 44px min touch height on mobile */}
              <div
                className={`p-5 sm:p-6 flex-1 flex flex-col justify-between ${
                  isDark ? 'bg-[#1A1815]' : 'bg-paper'
                }`}
              >
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  {col.tools.map((tool, tIdx) => (
                    <ToolChip
                      key={tool.name}
                      tool={tool}
                      col={col}
                      isDark={isDark}
                      shouldReduceMotion={shouldReduceMotion}
                      index={tIdx}
                    />
                  ))}
                </div>

                <div
                  className={`mt-8 pt-4 border-t flex items-center justify-between font-mono text-[11px] font-bold uppercase tracking-[var(--track-label)] ${
                    isDark ? 'border-[#2E2A24] text-[#C9BFAE]' : 'border-ink/15 text-ink/70'
                  }`}
                >
                  <span>OFFICIAL BRAND KIT</span>
                  <span>100% PROFICIENT</span>
                </div>
              </div>
            </motion.div>
          ))}
        </Reveal>

        {/* Philosophy Line Banner Below the Columns */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className={`mt-14 sm:mt-18 p-6 sm:p-8 rounded-xl text-center border-2 transition-all ${
            isDark
              ? 'bg-[#1A1815] border-yellow shadow-[0_0_24px_rgba(255,214,10,0.25)]'
              : 'bg-yellow border-3.5 border-ink shadow-[6px_6px_0px_#111111]'
          }`}
        >
          <p
            className={`font-headline text-2xl sm:text-3xl md:text-4xl uppercase tracking-[var(--track-heading)] leading-snug text-balance ${
              isDark ? 'text-yellow' : 'text-ink'
            }`}
          >
            "{arsenal.lineBelow}"
          </p>
          <p
            className={`mt-2 font-mono text-xs font-bold uppercase tracking-[var(--track-label)] ${
              isDark ? 'text-[#C9BFAE]' : 'text-ink/80'
            }`}
          >
            KESAV KUMAR T &bull; DESIGN PHILOSOPHY
          </p>
        </motion.div>
      </div>
    </section>
  );
}
