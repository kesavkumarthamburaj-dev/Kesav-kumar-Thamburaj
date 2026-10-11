import React, { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Layers, CheckCircle2 } from 'lucide-react';

export default function LightboxModal({ item, isDark, onClose, onPrev, onNext }) {
  const shouldReduceMotion = useReducedMotion();
  useEffect(() => {
    if (!item) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    // Lock body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [item, onClose, onPrev, onNext]);

  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title || 'Portfolio Item Lightbox'}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Lightbox Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative max-w-5xl w-full max-h-[92vh] rounded-xl overflow-hidden flex flex-col md:flex-row transition-all ${
          isDark
            ? 'bg-[#1A1815] text-[#FFF8EC] border border-[#2E2A24] shadow-[0_0_32px_rgba(255,214,10,0.2)]'
            : 'bg-paper text-ink border-3.5 border-ink shadow-[8px_8px_0px_#FFD60A]'
        }`}
      >
        {/* Top Floating Close Button */}
        <motion.button
          onClick={onClose}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
          className="absolute top-3 right-3 z-30 min-w-[44px] min-h-[44px] p-2 bg-yellow text-[#111111] border-2 border-[#111111] rounded-full shadow-[2px_2px_0px_#111111] hover:bg-mint hover:scale-105 transition-all flex items-center justify-center cursor-pointer"
          aria-label="Close lightbox"
        >
          <X className="w-5 h-5 text-[#111111]" />
        </motion.button>

        {/* Left Side: Visual Image Preview Container */}
        <div className={`relative md:w-3/5 flex items-center justify-center p-4 sm:p-8 overflow-hidden min-h-[300px] md:min-h-[500px] ${
          isDark ? 'bg-[#0F0E0C]' : 'bg-ink/10'
        }`}>
          {/* Framed image in dark mode to prevent glare from white mockups */}
          <div className={isDark ? 'bg-[#FFF8EC] p-2 rounded-lg shadow-2xl' : ''}>
            <img
              src={item.image}
              alt={item.title}
              width={item.width || 800}
              height={item.height || 1000}
              className={`max-h-[60vh] md:max-h-[75vh] w-auto max-w-full object-contain rounded ${
                isDark ? 'brightness-95' : 'border-2 border-ink shadow-lg'
              }`}
            />
          </div>

          {/* Navigation Arrows */}
          {onPrev && (
            <motion.button
              onClick={onPrev}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
              className={`absolute left-3 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] p-2 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${
                isDark
                  ? 'bg-[#1A1815] text-yellow border-[#2E2A24] hover:bg-yellow hover:text-[#111111]'
                  : 'bg-paper text-ink border-2 border-ink shadow-[2px_2px_0px_#111111] hover:bg-yellow'
              }`}
              aria-label="Previous work"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
          )}

          {onNext && (
            <motion.button
              onClick={onNext}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
              className={`absolute right-3 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] p-2 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${
                isDark
                  ? 'bg-[#1A1815] text-yellow border-[#2E2A24] hover:bg-yellow hover:text-[#111111]'
                  : 'bg-paper text-ink border-2 border-ink shadow-[2px_2px_0px_#111111] hover:bg-yellow'
              }`}
              aria-label="Next work"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          )}
        </div>

        {/* Right Side: Detailed Poster Spec Sheet */}
        <div className={`md:w-2/5 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto ${
          isDark ? 'bg-[#1A1815]' : 'bg-paper'
        }`}>
          <div>
            {/* Header Tag */}
            <div className="flex items-center gap-2 mb-3">
              <span className="sticker-badge bg-mint text-[#111111] text-[11px] font-bold">
                {item.numberTag || (item.type === 'packaging' ? 'PACKAGING MOCKUP' : 'POSTER EDITION')}
              </span>
              <span className={`font-mono text-xs font-bold uppercase tracking-[var(--track-label)] ${
                isDark ? 'text-[#C9BFAE]' : 'text-ink/70'
              }`}>
                {item.category || item.clientType}
              </span>
            </div>

            {/* Title */}
            <h3 className={`font-headline text-3xl sm:text-4xl leading-tight uppercase tracking-[var(--track-heading)] ${
              isDark ? 'text-[#FFF8EC]' : 'text-ink'
            }`}>
              {item.title}
            </h3>

            {/* Packaging Specific Specs */}
            {item.pack && (
              <div className={`mt-4 p-4 rounded-lg space-y-2 border ${
                isDark
                  ? 'bg-[#14120F] border-[#2E2A24]'
                  : 'bg-yellow/20 border-2 border-ink'
              }`}>
                <div className="flex items-start gap-2 text-xs font-mono">
                  <Layers className="w-4 h-4 text-pink shrink-0 mt-0.5" />
                  <div>
                    <span className={`font-bold uppercase tracking-[var(--track-label)] block ${isDark ? 'text-pink' : 'text-ink'}`}>Pack Specification</span>
                    <span className={isDark ? 'text-[#FFF8EC]' : 'text-ink/90'}>{item.pack}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-xs font-mono pt-2 border-t border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-mint shrink-0 mt-0.5" />
                  <div>
                    <span className={`font-bold uppercase tracking-[var(--track-label)] block ${isDark ? 'text-mint' : 'text-ink'}`}>Deliverables Delivered</span>
                    <span className={isDark ? 'text-[#FFF8EC]' : 'text-ink/90'}>{item.deliverables}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Description / Story */}
            <p className={`mt-4 font-body text-sm leading-relaxed font-medium ${
              isDark ? 'text-[#C9BFAE]' : 'text-ink/85'
            }`}>
              {item.details || item.description}
            </p>

            {/* Tags */}
            {item.tags && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {item.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-2.5 py-1 bg-yellow text-[#111111] font-mono text-[10px] font-bold uppercase tracking-[var(--track-label)] rounded border border-[#111111]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Action */}
          <div className={`mt-6 pt-4 border-t flex items-center justify-between ${
            isDark ? 'border-[#2E2A24]' : 'border-ink/20'
          }`}>
            <span className={`font-mono text-xs font-bold ${
              isDark ? 'text-[#C9BFAE]' : 'text-ink/75'
            }`}>
              Press Esc or click outside to close
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-yellow text-[#111111] font-mono text-xs font-bold uppercase tracking-[var(--track-button)] whitespace-nowrap rounded border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-mint transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
