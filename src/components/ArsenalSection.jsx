import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { portfolioContent } from '../data/content';
import MaskedHeadline from './MaskedHeadline';
import Reveal from './Reveal';

/**
 * 40x40px rounded-square logo tile:
 * - 40x40px, border-radius 10px, background #FFF8EC (paper) with 6px padding (overridable via tool.tileBg).
 * - In dark mode: keep paper tile (or dark tile if tileBg set) and add 1px border #2E2A24.
 * - Rendered with <img> (width/height set, loading="lazy", decoding="async", alt="<Tool> logo").
 * - Fallback tile: if logo fails, is missing, or naturalWidth is 0, show first letter of tool name, bold, on column strip color.
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

  // Support per-tool tileBg option: { light, dark } or string override
  const customTileBg = typeof tool.tileBg === 'object' && tool.tileBg !== null
    ? (isDark ? tool.tileBg.dark : tool.tileBg.light)
    : tool.tileBg;
  const tileBackground = customTileBg || '#FFF8EC';

  const handleImageLoad = (e) => {
    const img = e.currentTarget;
    // Fallback if image loads with naturalWidth of 0 (empty or invalid image)
    if (!img.naturalWidth || img.naturalWidth === 0) {
      setImgError(true);
      return;
    }

    // Dev-only console warning for any logo that renders fully transparent or fully white on its tile
    if (import.meta.env.DEV) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 24;
        canvas.height = 24;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(img, 0, 0, 24, 24);
          const { data } = ctx.getImageData(0, 0, 24, 24);
          let nonTransparentCount = 0;
          let whiteOrLightCount = 0;
          for (let i = 0; i < data.length; i += 4) {
            const alpha = data[i + 3];
            if (alpha > 15) {
              nonTransparentCount++;
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              if (r > 240 && g > 240 && b > 240) {
                whiteOrLightCount++;
              }
            }
          }

          if (nonTransparentCount === 0) {
            console.warn(
              `[Arsenal] Logo for "${tool.name}" rendered fully transparent on its tile! (${tool.logo})`
            );
          } else {
            // If the tile is light (#FFF8EC / white) and pixels are overwhelmingly white/light
            const isTileLight = !customTileBg || tileBackground.toLowerCase() === '#fff8ec' || tileBackground.toLowerCase() === '#ffffff';
            if (isTileLight && whiteOrLightCount / nonTransparentCount > 0.9) {
              console.warn(
                `[Arsenal] Logo for "${tool.name}" rendered fully white/light on its light tile (${tileBackground}), making it invisible! Consider setting tileBg in content.js.`
              );
            }
          }
        }
      } catch {
        // Ignore canvas CORS or read issues
      }
    }
  };

  return (
    <div
      className={`w-10 h-10 min-w-[40px] min-h-[40px] max-w-[40px] max-h-[40px] rounded-[10px] p-[6px] flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shrink-0 select-none overflow-hidden ${
        customTileBg
          ? (isDark ? 'border border-[#2E2A24]' : 'border border-[#111111]/30 shadow-sm')
          : (isDark ? 'border border-[#2E2A24]' : 'border border-black/10 shadow-sm')
      }`}
      style={{
        backgroundColor: tileBackground,
      }}
    >
      <img
        src={tool.logo}
        alt={`${tool.name} logo`}
        width={40}
        height={40}
        loading="lazy"
        decoding="async"
        onLoad={handleImageLoad}
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

        {/* 4 Columns with Coloured Header Strips (Design, Video and motion, AI tools, Dev stack) */}
        <Reveal amount={0.2} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6 xl:gap-8">
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
                className="px-5 py-4 border-b-2.5 border-[#111111] flex items-center justify-between"
                style={{
                  backgroundColor: col.stripColor,
                  color: col.textColor,
                }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#111111] border-2 border-white/60" />
                  <h3 className="font-headline text-2xl xl:text-3xl font-black uppercase tracking-[var(--track-heading)] text-balance">
                    {col.title}
                  </h3>
                </div>

                <span
                  className="font-mono text-xs font-black uppercase px-2 py-0.5 rounded border-2 border-[#111111] tabular-nums tracking-[0.02em] shrink-0"
                  style={{
                    backgroundColor: col.stripColor === '#2F5BFF' ? '#FFD60A' : '#111111',
                    color: col.stripColor === '#2F5BFF' ? '#111111' : '#FFF8EC',
                  }}
                >
                  {col.tools.length} Tools
                </span>
              </div>

              {/* Chunky Chips: Wrap 2 per row on mobile/tablet, 1 per row in 4-col desktop */}
              <div
                className={`p-4 sm:p-5 flex-1 flex flex-col ${
                  isDark ? 'bg-[#1A1815]' : 'bg-paper'
                }`}
              >
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5 sm:gap-3">
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
