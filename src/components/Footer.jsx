import React from 'react';
import { ArrowUp, Sparkles, MapPin } from 'lucide-react';
import { portfolioContent } from '../data/content';

export default function Footer({ isDark }) {
  const { profile } = portfolioContent;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={`relative border-t pt-16 pb-24 md:pb-16 px-4 sm:px-6 lg:px-8 transition-colors duration-200 ${
      isDark
        ? 'bg-[#0A0A09] text-[#FFF8EC] border-[#2E2A24]'
        : 'bg-ink text-paper border-t-3.5 border-ink'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Colophon */}
        <div className={`grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b ${
          isDark ? 'border-[#2E2A24]' : 'border-paper/15'
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

            <p className={`font-body text-base font-medium max-w-md leading-relaxed ${
              isDark ? 'text-[#C9BFAE]' : 'text-paper/80'
            }`}>
              Screen-printed packaging designer, video editor, and software founder based in Tamil Nadu, India.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded font-mono text-xs font-bold uppercase tracking-[var(--track-label)] border ${
                isDark
                  ? 'bg-[#1A1815] border-[#2E2A24] text-yellow'
                  : 'bg-[#1E1E24] border-paper/30 text-yellow'
              }`}>
                <MapPin className="w-3.5 h-3.5 text-pink" />
                <span>{profile.location}</span>
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded font-mono text-xs font-bold uppercase tracking-[var(--track-label)] border ${
                isDark
                  ? 'bg-[#1A1815] border-[#2E2A24] text-mint'
                  : 'bg-[#1E1E24] border-paper/30 text-mint'
              }`}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open for Projects</span>
              </span>
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
                    className={`transition-colors hover:translate-x-1 inline-block uppercase tracking-[var(--track-button)] whitespace-nowrap ${
                      isDark ? 'text-[#C9BFAE] hover:text-yellow' : 'text-paper/80 hover:text-yellow'
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
            <ul className={`space-y-2 font-mono text-xs font-bold ${
              isDark ? 'text-[#C9BFAE]' : 'text-paper/80'
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
                  href={`tel:${profile.phone.replace(/\s+/g, '')}`}
                  className="contact-phone hover:text-mint transition-colors block"
                >
                  {profile.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={profile.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mint hover:underline block uppercase tracking-[var(--track-button)] whitespace-nowrap"
                >
                  WhatsApp Instant &rarr;
                </a>
              </li>
              {profile.instagramUrl && (
                <li>
                  <a
                    href={profile.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink hover:underline block uppercase tracking-[var(--track-button)] whitespace-nowrap"
                  >
                    Instagram @kesavkumar.designs &rarr;
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className={`pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs ${
          isDark ? 'text-[#C9BFAE]' : 'text-paper/70'
        }`}>
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span>&copy; {profile.copyrightYear} {profile.name}. All rights reserved.</span>
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
