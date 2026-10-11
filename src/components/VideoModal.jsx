import React, { useEffect } from 'react';
import { X, Play } from 'lucide-react';

export default function VideoModal({ reel, isDark, onClose }) {
  useEffect(() => {
    if (!reel) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [reel, onClose]);

  if (!reel) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Video Player: ${reel.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative max-w-4xl w-full rounded-xl overflow-hidden flex flex-col transition-all ${
          isDark
            ? 'bg-[#1A1815] text-[#FFF8EC] border border-[#2E2A24] shadow-[0_0_32px_rgba(111,140,255,0.25)]'
            : 'bg-[#11162B] text-white border-3.5 border-ink shadow-[8px_8px_0px_#2F5BFF]'
        }`}
      >
        {/* Modal Top Bar */}
        <div className={`px-5 py-3.5 flex items-center justify-between border-b ${
          isDark
            ? 'bg-[#14120F] border-[#2E2A24]'
            : 'bg-[#171E3A] border-b-2.5 border-ink'
        }`}>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-pink" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-yellow">
              VIDEO REEL PLAYER
            </span>
            <span className={`font-mono text-xs ${isDark ? 'text-[#C9BFAE]' : 'text-white/70'}`}>
              &bull; {reel.duration}
            </span>
          </div>

          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] p-2 bg-yellow text-[#111111] border-2 border-[#111111] rounded-full shadow-[2px_2px_0px_#111111] hover:bg-mint transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Close video player"
          >
            <X className="w-5 h-5 text-[#111111]" />
          </button>
        </div>

        {/* Video Player Display Area */}
        <div className="relative bg-black flex items-center justify-center min-h-[380px] sm:min-h-[480px]">
          {reel.videoUrl ? (
            <video
              src={reel.videoUrl}
              poster={reel.thumbnail}
              controls
              autoPlay
              playsInline
              className="w-full max-h-[65vh] object-contain"
            >
              Your browser does not support HTML5 video.
            </video>
          ) : reel.embedUrl ? (
            <iframe
              src={reel.embedUrl}
              title={reel.title}
              className="w-full aspect-video max-h-[65vh] border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="p-8 text-center">
              <Play className="w-12 h-12 text-yellow mx-auto mb-3" />
              <p className="font-headline text-2xl uppercase">Reel Video Preview</p>
              <p className="text-sm font-mono text-[#C9BFAE] mt-1">Configure embedUrl in src/data/content.js</p>
            </div>
          )}
        </div>

        {/* Bottom Metadata & Story */}
        <div className={`p-5 sm:p-6 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isDark
            ? 'bg-[#14120F] border-[#2E2A24]'
            : 'bg-[#171E3A] border-t-2.5 border-ink'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-pink text-[#111111] font-mono text-[10px] font-bold uppercase rounded">
                {reel.category}
              </span>
              <span className="font-mono text-xs text-mint font-bold">{reel.stats}</span>
            </div>
            <h3 className="font-headline text-2xl text-[#FFF8EC] uppercase">{reel.title}</h3>
            <p className={`mt-1 text-xs sm:text-sm font-body max-w-xl ${
              isDark ? 'text-[#C9BFAE]' : 'text-white/80'
            }`}>{reel.description}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-yellow text-[#111111] font-mono text-xs font-bold uppercase rounded border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-mint transition-colors cursor-pointer"
            >
              Close Reel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
