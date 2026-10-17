import React, { useState } from 'react';
import { ArrowUp, Sparkles, MapPin } from 'lucide-react';
import { portfolioContent, isRealUrl } from '../data/content.js';

export default function Footer({ isDark, onOpenPrivacy }) {
  const { profile } = portfolioContent;
  const [igLogoError, setIgLogoError] = useState(false);
  const [liLogoError, setLiLogoError] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={`relative border-t pt-16 pb-24 md:pb-16 px-4 sm:px-6 lg:px-8 transition-colors duration-200 ${isDark
        ? 'bg-[#0A0A09] text-[#FFF8EC] border-[#2E2A24]'
        : 'bg-ink text-paper border-t-3.5 border-ink'
      }`}>
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Colophon */}
        <div className={`grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b ${isDark ? 'border-[#2E2A24]' : 'border-paper/15'
          }`}>
          {/* Brand Info (6 cols) */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 flex items-center justify-center bg-yellow text-[#111111] font-headline text-2xl font-black border-2 border-[#111111] rounded shadow-[2px_2px_0px_#111111]">
                K
              </span>
              <span className="font-headline text-3xl sm:text-4xl text-[#FFF8EC] uppercase tracking-[var(--track-heading)]">
                {profile.name}
              </span>
            </div>

            <p className={`font-body text-base font-medium max-w-md leading-relaxed ${isDark ? 'text-[#C9BFAE]' : 'text-paper/80'
              }`}>
              Screen-printed packaging designer, video editor, and software founder based in Tamil Nadu, India.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded font-mono text-xs font-bold uppercase tracking-[var(--track-label)] border ${isDark
                  ? 'bg-[#1A1815] border-[#2E2A24] text-yellow'
                  : 'bg-[#1E1E24] border-paper/30 text-yellow'
                }`}>
                <MapPin className="w-3.5 h-3.5 text-pink" />
                <span>{profile.location}</span>
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded font-mono text-xs font-bold uppercase tracking-[var(--track-label)] border ${isDark
                  ? 'bg-[#1A1815] border-[#2E2A24] text-mint'
                  : 'bg-[#1E1E24] border-paper/30 text-mint'
                }`}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open for Projects</span>
              </span>
            </div>

            {/* Social Icons Row */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={portfolioContent.social?.instagram || profile.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open Kesav's Instagram"
                className="w-11 h-11 rounded-lg bg-[#FF3D81] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                title="Follow on Instagram"
              >
                <span className="w-8 h-8 rounded-md bg-[#111111] flex items-center justify-center">
                  {!igLogoError ? (
                    <img src="/logos/instagram.svg" width={20} height={20} alt="Instagram logo" className="w-5 h-5 pointer-events-none" onError={() => setIgLogoError(true)} />
                  ) : (
                    <span className="font-headline font-black text-white text-base leading-none select-none">I</span>
                  )}
                </span>
              </a>

              {/* LinkedIn Button (Shown only when URL is real) */}
              {isRealUrl(portfolioContent.social?.linkedin || profile.linkedinUrl) && (
                <a
                  href={portfolioContent.social?.linkedin || profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open Kesav's LinkedIn"
                  className="w-11 h-11 rounded-lg bg-[#2F5BFF] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                  title="Connect on LinkedIn"
                >
                  <span className="w-8 h-8 rounded-md bg-[#111111] flex items-center justify-center">
                    {!liLogoError ? (
                      <img src="/logos/linkedin.svg" width={20} height={20} alt="LinkedIn logo" className="w-5 h-5 pointer-events-none" onError={() => setLiLogoError(true)} />
                    ) : (
                      <span className="font-headline font-black text-white text-base leading-none select-none">L</span>
                    )}
                  </span>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-[var(--track-label)] text-yellow">
              NAVIGATION
            </h4>
            <ul className="space-y-2 font-mono text-sm font-bold">
              {portfolioContent.nav.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className={`transition-colors hover:translate-x-1 inline-block uppercase tracking-[var(--track-button)] whitespace-nowrap ${isDark ? 'text-[#C9BFAE] hover:text-yellow' : 'text-paper/80 hover:text-yellow'
                      }`}
                  >
                    &rarr; {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Direct Links (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-[var(--track-label)] text-mint">
              DIRECT REACH
            </h4>
            <ul className={`space-y-2 font-mono text-xs font-bold ${isDark ? 'text-[#C9BFAE]' : 'text-paper/80'
              }`}>
              <li>
                <a
                  href={`mailto:${profile.email}`}
                  className="contact-email hover:text-yellow transition-colors block leading-tight"
                >
                  {profile.email}
                </a>
              </li>
              <li>
                <a
                  href={portfolioContent.social?.instagram || profile.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open Kesav's Instagram"
                  className="text-pink hover:underline inline-flex items-center gap-1.5 uppercase tracking-[var(--track-button)] whitespace-nowrap"
                >
                  <img src="/logos/instagram.svg" width={14} height={14} alt="Instagram logo" className="w-3.5 h-3.5 inline-block" />
                  <span>Instagram &rarr;</span>
                </a>
              </li>
              {isRealUrl(portfolioContent.social?.linkedin || profile.linkedinUrl) && (
                <li>
                  <a
                    href={portfolioContent.social?.linkedin || profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open Kesav's LinkedIn"
                    className="text-[#2F5BFF] hover:underline inline-flex items-center gap-1.5 uppercase tracking-[var(--track-button)] whitespace-nowrap"
                  >
                    <img src="/logos/linkedin.svg" width={14} height={14} alt="LinkedIn logo" className="w-3.5 h-3.5 inline-block" />
                    <span>LinkedIn &rarr;</span>
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Privacy & Back to Top */}
        <div className={`pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs ${isDark ? 'text-[#C9BFAE]' : 'text-paper/70'
          }`}>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-center sm:text-left">
            <span>&copy; {profile.copyrightYear} {profile.name}. All rights reserved.</span>
            <span className="hidden sm:inline">&bull;</span>
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="hover:underline hover:text-yellow text-current transition-colors cursor-pointer font-bold"
            >
              Privacy &amp; Data
            </button>
            <span className="hidden sm:inline">&bull; Screen-Print Wall Concept</span>
          </div>

          <button
            onClick={scrollToTop}
            className="group min-h-[44px] px-4 py-2 bg-yellow text-[#111111] border-2 border-[#111111] rounded font-mono text-xs font-bold uppercase tracking-[var(--track-button)] whitespace-nowrap flex items-center gap-2 shadow-[2px_2px_0px_#111111] hover:bg-mint hover:translate-y-[-2px] transition-all cursor-pointer"
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <ArrowUp className="w-4 h-4 text-[#111111] transition-transform group-hover:-translate-y-1" />
          </button>
        </div>
      </div>
    </footer>
  );
}
