import React from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, Volume2 } from 'lucide-react';
import { portfolioContent } from '../data/content';

export default function VideoSection({ isDark, onOpenVideoModal }) {
  const { video } = portfolioContent;

  return (
    <section
      id="video"
      className="relative section-video halftone-overlay pt-24 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-14 sm:mb-20">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="sticker-badge bg-yellow text-[#111111] text-xs font-bold -rotate-2">
              {video.tag}
            </span>
            <span className={`font-mono text-xs font-bold uppercase tracking-widest ${
              isDark ? 'text-[#C9BFAE]' : 'text-white/90'
            }`}>
              SOCIAL REELS &bull; COMMERCIAL ADS &bull; SOUND DESIGN
            </span>
          </div>

          {/* Headline carries lightened blue #6F8CFF for WCAG AA contrast */}
          <h2 className={`headline-section tracking-tight font-black transition-colors ${
            isDark ? 'text-[#6F8CFF] drop-shadow-[0_0_20px_rgba(111,140,255,0.3)]' : 'text-white'
          }`}>
            {video.headline}
          </h2>

          <p className={`mt-4 text-lg sm:text-xl font-body font-semibold max-w-2xl leading-relaxed ${
            isDark ? 'text-[#FFF8EC]' : 'text-white/95'
          }`}>
            {video.description}
          </p>
        </div>

        {/* 3 Reel Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
          {video.reels.map((reel, idx) => (
            <motion.article
              key={reel.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: idx * 0.12 }}
              onClick={() => onOpenVideoModal(reel)}
              className={`group relative rounded-xl overflow-hidden cursor-pointer focus-within:ring-4 transition-all duration-200 ${
                isDark
                  ? 'bg-[#1A1815] text-[#FFF8EC] border border-[#2E2A24] hover:border-[#6F8CFF] hover:-translate-y-1.5 focus-within:ring-[#6F8CFF]'
                  : 'bg-[#11162B] text-white border-3.5 border-ink shadow-[6px_6px_0px_#111111] hover:shadow-[10px_10px_0px_#111111] hover:-translate-y-1.5 focus-within:ring-yellow'
              }`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpenVideoModal(reel);
                }
              }}
              role="button"
              aria-label={`Watch reel: ${reel.title}`}
            >
              {/* Duration Sticker Badge (rotated) - keeps bright pop fill */}
              <div className="absolute top-4 right-4 z-20">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow text-[#111111] font-mono text-xs font-black border-2 border-[#111111] rounded rotate-3 shadow-[2px_2px_0px_#111111] group-hover:rotate-0 transition-transform">
                  <Clock className="w-3.5 h-3.5 text-[#111111]" />
                  <span>{reel.duration}</span>
                </div>
              </div>

              {/* Category Pill Tag - keeps bright pop fill */}
              <div className="absolute top-4 left-4 z-20">
                <span className="inline-block px-3 py-1 bg-pink text-[#111111] font-mono text-[11px] font-bold uppercase tracking-wider border-2 border-[#111111] rounded shadow-[2px_2px_0px_#111111]">
                  {reel.tag}
                </span>
              </div>

              {/* Vertical Video Thumbnail Container */}
              <div className="relative aspect-[9/14] w-full overflow-hidden bg-black/40">
                <img
                  src={reel.thumbnail}
                  alt={reel.title}
                  width={reel.width}
                  height={reel.height}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                />

                {/* Big Round Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-yellow text-[#111111] border-3.5 border-[#111111] flex items-center justify-center shadow-[4px_4px_0px_#111111] group-hover:scale-115 group-hover:bg-mint transition-all duration-200">
                    <Play className="w-9 h-9 sm:w-10 sm:h-10 fill-[#111111] text-[#111111] ml-1.5" />
                  </div>
                </div>

                {/* Sound bar indicator bottom overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between font-mono text-xs text-yellow">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Volume2 className="w-4 h-4 text-mint animate-pulse" />
                    <span>AUDIO SYNCED</span>
                  </span>
                  <span className="text-white/80">{reel.stats}</span>
                </div>
              </div>

              {/* Bottom Card Copy */}
              <div className={`p-5 border-t ${
                isDark ? 'bg-[#1A1815] border-[#2E2A24]' : 'bg-[#141A33] border-t-2.5 border-ink'
              }`}>
                <div className="text-xs font-mono font-bold text-[#6F8CFF] uppercase tracking-wider mb-1">
                  {reel.category}
                </div>
                <h3 className={`font-headline text-2xl uppercase leading-tight transition-colors ${
                  isDark
                    ? 'text-[#FFF8EC] group-hover:text-[#6F8CFF]'
                    : 'text-white group-hover:text-yellow'
                }`}>
                  {reel.title}
                </h3>
                <p className={`mt-2 text-xs sm:text-sm font-body font-medium line-clamp-2 ${
                  isDark ? 'text-[#C9BFAE]' : 'text-white/80'
                }`}>
                  {reel.description}
                </p>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono font-bold text-yellow uppercase">
                  <span>Click to play reel</span>
                  <span>▶</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
