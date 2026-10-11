import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Maximize2, Tag, Layers, CheckCircle2 } from 'lucide-react';
import { portfolioContent } from '../data/content';
import MaskedHeadline from './MaskedHeadline';
import Reveal from './Reveal';

export default function PackagingSection({ isDark, onOpenLightbox }) {
  const shouldReduceMotion = useReducedMotion();
  const { packaging } = portfolioContent;
  const [hoveredId, setHoveredId] = useState(null);

  // Stagger grid container variants (70ms stagger)
  const gridContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.07,
      },
    },
  };

  return (
    <section
      id="packaging"
      className="relative section-packaging halftone-overlay pt-24 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header wrapped in Reveal */}
        <Reveal amount={0.25} className="mb-14 sm:mb-20">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="sticker-badge bg-yellow text-[#111111] text-xs font-bold -rotate-2 tracking-[var(--track-label)]">
              {packaging.tag}
            </span>
            <span className={`font-mono text-xs font-bold uppercase tracking-[var(--track-label)] ${
              isDark ? 'text-[#C9BFAE]' : 'text-ink/80'
            }`}>
              PHYSICAL PACK &bull; 6 SELECTED WORKS
            </span>
          </div>

          {/* Masked Headline: Slides up from mask, 600ms ease-out */}
          <MaskedHeadline
            lines={[packaging.headline]}
            className={`headline-section font-black transition-colors ${
              isDark ? 'text-pink drop-shadow-[0_0_20px_rgba(255,61,129,0.3)]' : 'text-ink'
            }`}
          />

          <p
            className={`mt-4 text-lg sm:text-xl font-body font-semibold max-w-2xl leading-relaxed tracking-[var(--track-lead)] text-pretty ${
              isDark ? 'text-[#FFF8EC]' : 'text-ink/90'
            }`}
          >
            {packaging.description}
          </p>
        </Reveal>

        {/* 6 Pack Mockups as Pasted Posters Grid with Slap-In Entrance */}
        <motion.div
          variants={gridContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12"
        >
          {packaging.projects.map((project, idx) => {
            const isHovered = hoveredId === project.id;
            const isOtherHovered = hoveredId !== null && !isHovered;
            const baseRotation = shouldReduceMotion ? 0 : project.rotation;
            const slapRotation = idx % 2 === 0 ? 6 : -6;

            const cardVariants = {
              hidden: shouldReduceMotion
                ? { opacity: 0 }
                : { scale: 1.08, rotate: slapRotation, opacity: 0 },
              visible: {
                scale: 1,
                rotate: baseRotation,
                opacity: 1,
                transition: {
                  type: 'spring',
                  stiffness: 320,
                  damping: 22,
                },
              },
            };

            return (
              <motion.article
                key={project.id}
                variants={cardVariants}
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
                onMouseEnter={() => setHoveredId(project.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onOpenLightbox({ ...project, type: 'packaging', index: idx })}
                data-cursor="view"
                style={{
                  opacity: isOtherHovered ? 0.7 : 1,
                }}
                className={`group relative rounded-lg overflow-hidden cursor-pointer focus-within:ring-4 select-none ${
                  isDark
                    ? 'bg-[#1A1815] border border-[#2E2A24] focus-within:ring-pink'
                    : 'bg-paper border-3.5 border-ink shadow-[6px_6px_0px_#111111] hover:shadow-[10px_10px_0px_#111111] focus-within:ring-ink'
                }`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpenLightbox({ ...project, type: 'packaging', index: idx });
                  }
                }}
                role="button"
                aria-label={`View packaging project: ${project.title}`}
              >
                {/* Poster Corner Pin Illusion */}
                <div className="absolute top-3 right-3 z-20 pointer-events-none">
                  <span className={`w-4 h-4 rounded-full border-2 block ${
                    isDark ? 'bg-[#0F0E0C] border-[#2E2A24]' : 'bg-ink/20 border-ink shadow-inner'
                  }`} />
                </div>

                {/* Top Poster Meta Strip */}
                <div className={`px-4 py-2.5 flex items-center justify-between font-mono text-[11px] font-bold border-b ${
                  isDark
                    ? 'bg-[#1A1815] border-[#2E2A24] text-[#C9BFAE]'
                    : 'bg-paper border-b-2.5 border-ink text-ink'
                }`}>
                  <span className="uppercase tracking-[var(--track-label)] truncate mr-2">
                    {project.clientType}
                  </span>
                  <span className="px-1.5 py-0.5 bg-yellow text-[#111111] border border-[#111111] rounded text-[10px] tabular-nums tracking-[0.02em]">
                    0{idx + 1}
                  </span>
                </div>

                {/* Poster Image Container */}
                <div className="p-2 sm:p-2.5">
                  <div className={`relative aspect-[4/5] w-full overflow-hidden ${
                    isDark
                      ? 'mockup-frame bg-[#FFF8EC] rounded-md p-2'
                      : 'bg-ink/5 rounded'
                  }`}>
                    <img
                      src={project.image}
                      alt={project.title}
                      width={project.width}
                      height={project.height}
                      loading="lazy"
                      decoding="async"
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                        isDark ? 'framed-mockup' : ''
                      }`}
                    />

                    {/* Quick Expand Icon Badge */}
                    <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span className="p-2 bg-yellow text-[#111111] rounded border-2 border-[#111111] flex items-center justify-center shadow-[2px_2px_0px_#111111]">
                        <Maximize2 className="w-4 h-4 text-[#111111]" />
                      </span>
                    </div>

                    {/* SLIDE-IN CAPTION OVERLAY ON HOVER: translateY 100% to 0, 300ms ease-out */}
                    <div
                      style={{
                        transform: isHovered ? 'translateY(0%)' : 'translateY(100%)',
                        transition: 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1)',
                      }}
                      className={`absolute inset-x-0 bottom-0 z-20 p-5 border-t ${
                        isDark
                          ? 'bg-[#14120F]/95 text-[#FFF8EC] border-[#2E2A24]'
                          : 'bg-ink text-paper border-t-3 border-ink'
                      }`}
                    >
                      <div className="space-y-2.5">
                        {/* Client Type */}
                        <div className="flex items-start gap-2">
                          <Tag className="w-4 h-4 text-yellow shrink-0 mt-0.5" />
                          <div>
                            <span className="font-mono text-[10px] uppercase tracking-[var(--track-label)] text-pink block font-bold">
                              Client / Industry
                            </span>
                            <span className="font-body text-xs sm:text-sm font-bold text-[#FFF8EC]">
                              {project.clientType}
                            </span>
                          </div>
                        </div>

                        {/* Pack Specs */}
                        <div className="flex items-start gap-2">
                          <Layers className="w-4 h-4 text-mint shrink-0 mt-0.5" />
                          <div>
                            <span className="font-mono text-[10px] uppercase tracking-[var(--track-label)] text-mint block font-bold">
                              Pack Format
                            </span>
                            <span className="font-body text-xs sm:text-sm font-bold text-[#FFF8EC]">
                              {project.pack}
                            </span>
                          </div>
                        </div>

                        {/* Deliverables */}
                        <div className="flex items-start gap-2 pt-1 border-t border-white/15">
                          <CheckCircle2 className="w-4 h-4 text-pink shrink-0 mt-0.5" />
                          <div>
                            <span className="font-mono text-[10px] uppercase tracking-[var(--track-label)] text-[#C9BFAE] block font-bold">
                              Deliverables
                            </span>
                            <span className="font-mono text-xs font-semibold text-[#FFF8EC]">
                              {project.deliverables}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 flex items-center justify-between text-[11px] font-mono text-yellow font-bold uppercase tracking-[var(--track-button)] whitespace-nowrap">
                        <span>Click for Full Lightbox</span>
                        <span>+</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Permanent Bottom Title Bar */}
                <div className={`p-4 border-t ${
                  isDark
                    ? 'bg-[#1A1815] border-[#2E2A24]'
                    : 'bg-paper border-t-2.5 border-ink'
                }`}>
                  <h3 className={`font-headline text-xl sm:text-2xl leading-tight uppercase tracking-[var(--track-heading)] truncate text-balance ${
                    isDark ? 'text-[#FFF8EC] group-hover:text-pink transition-colors' : 'text-ink'
                  }`}>
                    {project.title}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {project.tags.slice(0, 3).map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className={`px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[var(--track-label)] rounded border ${
                          isDark
                            ? 'bg-[#1F0E15] text-pink border-[#2E2A24]'
                            : 'bg-yellow/30 text-ink border-ink/40'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
