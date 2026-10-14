import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Trash2, CheckCircle2 } from 'lucide-react';
import { portfolioContent } from '../data/content';

export default function PrivacyModal({ isOpen, onClose, isDark }) {
  const [deleteStatus, setDeleteStatus] = useState('idle'); // 'idle' | 'deleting' | 'deleted' | 'error'

  useEffect(() => {
    if (!isOpen) {
      setDeleteStatus('idle');
      return;
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDeleteMyData = async () => {
    setDeleteStatus('deleting');
    try {
      let visitorId = null;
      try {
        visitorId =
          localStorage.getItem('kesav_visitor_id') ||
          sessionStorage.getItem('kesav_visitor_id');
      } catch {
        // storage blocked
      }

      if (visitorId) {
        await fetch('/api/visit-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visitorId }),
        });
      }

      // Clear local records
      try {
        localStorage.removeItem('kesav_visitor_id');
        localStorage.removeItem('kesav_welcome_answered');
        sessionStorage.removeItem('kesav_visitor_id');
        sessionStorage.removeItem('kesav_welcome_answered');
      } catch {
        // ignore
      }

      setDeleteStatus('deleted');
    } catch {
      setDeleteStatus('error');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full max-w-lg rounded-xl border-3 p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto transition-all ${
          isDark
            ? 'bg-[#181715] text-[#FFF8EC] border-[#FFD60A] shadow-[6px_6px_0px_#FFD60A]'
            : 'bg-[#FFF8EC] text-[#111111] border-[#111111] shadow-[6px_6px_0px_#111111]'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b-2 border-dashed border-current/20">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-mint text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h2
                id="privacy-modal-title"
                className="font-headline text-2xl uppercase tracking-tight leading-none"
              >
                Privacy & Data
              </h2>
              <p className="font-mono text-xs opacity-75 mt-1">
                Zero trackers &bull; Transparent telemetry
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close privacy details"
            className={`p-1.5 rounded-lg border-2 transition-transform hover:scale-105 active:scale-95 cursor-pointer ${
              isDark
                ? 'border-[#3E3A33] hover:border-[#FFD60A] text-[#C9BFAE]'
                : 'border-[#111111] hover:bg-neutral-200 text-[#111111]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="py-5 space-y-4 font-body text-sm leading-relaxed">
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-pink mb-1">
              What we store
            </h3>
            <p className="opacity-90">
              Only information you explicitly provide via the welcome card: your preferred name (if consented), your visit purpose chip, coarse geographic country (from edge network header), and device category (desktop/mobile/tablet).
            </p>
          </div>

          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-yellow mb-1">
              What we NEVER store
            </h3>
            <p className="opacity-90">
              No IP addresses, no email addresses, no phone numbers, no tracking cookies, and no cross-site advertising identifiers.
            </p>
          </div>

          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-mint mb-1">
              Purpose & Retention
            </h3>
            <p className="opacity-90">
              Data is kept strictly to count anonymous visitor reach and understand project enquiries. All visitor records automatically expire and are purged from Redis storage after 12 months (TTL).
            </p>
          </div>

          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider opacity-75 mb-1">
              Manual Data Removal
            </h3>
            <p className="opacity-90">
              You can contact Kesav anytime at{' '}
              <a
                href={`mailto:${portfolioContent.profile.email}`}
                className="font-bold underline text-blue hover:text-pink"
              >
                {portfolioContent.profile.email}
              </a>{' '}
              to request deletion, or wipe your record instantly below.
            </p>
          </div>
        </div>

        {/* Footer / Self-service deletion */}
        <div className="pt-4 border-t-2 border-dashed border-current/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          {deleteStatus === 'deleted' ? (
            <div className="flex items-center gap-2 text-mint font-mono text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Your visitor record has been deleted.</span>
            </div>
          ) : (
            <button
              onClick={handleDeleteMyData}
              disabled={deleteStatus === 'deleting'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider text-pink border-2 border-pink hover:bg-pink/10 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>
                {deleteStatus === 'deleting' ? 'Deleting...' : 'Delete my data'}
              </span>
            </button>
          )}

          <button
            onClick={onClose}
            className={`w-full sm:w-auto px-5 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider border-2 transition-all cursor-pointer ${
              isDark
                ? 'bg-[#FFD60A] text-[#111111] border-[#FFD60A] shadow-[2px_2px_0px_#FFD60A]'
                : 'bg-[#111111] text-[#FFF8EC] border-[#111111] shadow-[2px_2px_0px_#111111]'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
