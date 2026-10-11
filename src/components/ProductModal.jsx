import React, { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { X, Code2, ArrowUpRight, ExternalLink } from 'lucide-react';

export default function ProductModal({ product, isDark, onClose }) {
  const shouldReduceMotion = useReducedMotion();
  useEffect(() => {
    if (!product) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [product, onClose]);

  if (!product) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Product Details: ${product.name}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative max-w-4xl w-full rounded-xl overflow-hidden flex flex-col max-h-[92vh] transition-all ${
          isDark
            ? 'bg-[#1A1815] text-[#FFF8EC] border border-[#2E2A24] shadow-[0_0_32px_rgba(255,122,26,0.25)]'
            : 'bg-paper text-ink border-3.5 border-ink shadow-[8px_8px_0px_#FF7A1A]'
        }`}
      >
        {/* Top Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDark
            ? 'bg-[#14120F] text-[#FFF8EC] border-[#2E2A24]'
            : 'bg-tangerine text-ink border-3 border-ink'
        }`}>
          <div className="flex items-center gap-3">
            <span
              className="px-3 py-1 font-mono text-xs font-black uppercase tracking-[var(--track-label)] rounded border-2 border-[#111111] shadow-[2px_2px_0px_#111111]"
              style={{ backgroundColor: product.stickerBg, color: '#111111' }}
            >
              {product.sticker}
            </span>
            <span className={`font-mono text-xs font-bold uppercase tabular-nums tracking-[0.02em] ${
              isDark ? 'text-tangerine' : 'text-ink/80'
            }`}>
              {product.metrics}
            </span>
          </div>

          <motion.button
            onClick={onClose}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
            className="min-w-[44px] min-h-[44px] p-2 bg-yellow text-[#111111] border-2 border-[#111111] rounded-full shadow-[2px_2px_0px_#111111] hover:bg-mint transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Close product modal"
          >
            <X className="w-5 h-5 text-[#111111]" />
          </motion.button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          <div>
            <h3 className={`font-headline text-3xl sm:text-5xl leading-tight uppercase tracking-[var(--track-heading)] ${
              isDark ? 'text-[#FFF8EC]' : 'text-ink'
            }`}>
              {product.name}
            </h3>
            <p className={`mt-1 font-body text-base sm:text-lg font-bold tracking-[var(--track-lead)] ${
              isDark ? 'text-tangerine' : 'text-ink/90'
            }`}>
              {product.tagline}
            </p>
            {product.url && (
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-mint/15 text-mint border border-mint/40 rounded font-mono text-xs font-bold hover:bg-mint hover:text-[#111111] transition-all group/link"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{product.url.replace(/^https?:\/\//, '')}</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
              </a>
            )}
          </div>

          {/* Screenshot container with paper frame in dark mode */}
          <div className={`overflow-hidden ${
            isDark
              ? 'bg-[#FFF8EC] p-2 rounded-lg border border-[#2E2A24]'
              : 'border-2.5 border-ink rounded-lg shadow-[4px_4px_0px_#111111] bg-ink/5'
          }`}>
            <img
              src={product.image}
              alt={product.name}
              width={product.width}
              height={product.height}
              className={`w-full h-auto object-cover max-h-[380px] rounded ${
                isDark ? 'brightness-95' : ''
              }`}
            />
          </div>

          {/* Description & Engineering Details */}
          <div className={`p-5 rounded-lg border ${
            isDark
              ? 'bg-[#14120F] border-[#2E2A24]'
              : 'bg-yellow/20 border-2.5 border-ink'
          }`}>
            <h4 className={`font-mono text-xs font-bold uppercase tracking-[var(--track-label)] mb-2 flex items-center gap-2 ${
              isDark ? 'text-yellow' : 'text-ink'
            }`}>
              <Code2 className="w-4 h-4 text-pink" />
              <span>Architecture &amp; Engineering</span>
            </h4>
            <p className={`font-body text-sm sm:text-base leading-relaxed font-medium ${
              isDark ? 'text-[#C9BFAE]' : 'text-ink'
            }`}>
              {product.description}
            </p>
          </div>

          {/* Tech Stack Pills */}
          <div>
            <h5 className={`font-mono text-xs font-bold uppercase tracking-[var(--track-label)] mb-2.5 ${
              isDark ? 'text-[#C9BFAE]' : 'text-ink/75'
            }`}>
              Technologies &amp; Protocols Used
            </h5>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className={`px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-[var(--track-label)] rounded border ${
                    isDark
                      ? 'bg-[#14120F] text-[#FFF8EC] border-[#2E2A24]'
                      : 'bg-paper text-ink border-2 border-ink shadow-[2px_2px_0px_#111111]'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className={`px-6 py-4 border-t flex items-center justify-between ${
          isDark
            ? 'bg-[#14120F] border-[#2E2A24]'
            : 'bg-paper border-t-2.5 border-ink'
        }`}>
          <span className={`font-mono text-xs font-bold ${
            isDark ? 'text-[#C9BFAE]' : 'text-ink/70'
          }`}>
            Founder &bull; Software Architecture
          </span>
          <div className="flex items-center gap-3">
            {product.url && (
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-slide-fill inline-flex items-center gap-2 px-5 py-2.5 bg-mint text-[#111111] font-mono text-xs sm:text-sm font-black uppercase tracking-[var(--track-button)] whitespace-nowrap rounded border-2.5 border-[#111111] shadow-[3px_3px_0px_#111111] hover:bg-yellow hover:scale-105 active:scale-95 transition-all"
              >
                <span>Launch Live App</span>
                <ArrowUpRight className="w-4 h-4 text-[#111111]" />
              </a>
            )}
            <motion.button
              onClick={onClose}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
              className="px-5 py-2.5 bg-yellow text-[#111111] font-mono text-xs font-bold uppercase tracking-[var(--track-button)] whitespace-nowrap rounded border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-mint transition-colors cursor-pointer"
            >
              Close
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
