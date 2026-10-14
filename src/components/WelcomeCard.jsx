import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Sparkles } from 'lucide-react';

const PURPOSES = [
  'Hiring a designer',
  'Packaging project',
  'Need an app or SaaS',
  'Just looking around',
];

const BOT_USER_AGENT_REGEX = /bot|spider|crawler|crawling|googlebot|bingbot|yandex|duckduckbot|slurp|baiduspider|facebookexternalhit|whatsapp|linkedinbot|twitterbot/i;

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function WelcomeCard({ isDark }) {
  const [isVisible, setIsVisible] = useState(false);
  const [name, setName] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'dismissed'
  const [visitorId, setVisitorId] = useState('');
  const [nameTouched, setNameTouched] = useState(false);

  const cardRef = useRef(null);
  const nameInputRef = useRef(null);

  // Initialize visitor ID and determine if card should be scheduled
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Skip bots
    if (navigator.webdriver) return;
    const ua = navigator.userAgent || '';
    if (BOT_USER_AGENT_REGEX.test(ua)) return;

    // 2. Check storage
    let currentId = null;
    let alreadyAnswered = false;

    try {
      currentId = localStorage.getItem('kesav_visitor_id');
      alreadyAnswered = localStorage.getItem('kesav_welcome_answered') === 'true';
    } catch {
      try {
        currentId = sessionStorage.getItem('kesav_visitor_id');
        alreadyAnswered = sessionStorage.getItem('kesav_welcome_answered') === 'true';
      } catch {
        alreadyAnswered = Boolean(window.__kesav_welcome_session_shown);
      }
    }

    if (!currentId) {
      currentId = generateUUID();
      try {
        localStorage.setItem('kesav_visitor_id', currentId);
      } catch {
        try {
          sessionStorage.setItem('kesav_visitor_id', currentId);
        } catch {
          window.__kesav_visitor_id = currentId;
        }
      }
    }
    setVisitorId(currentId);

    if (alreadyAnswered) return;

    // 3. Appears 4 seconds after hero image loaded (never delays LCP)
    const triggerCardAppearance = () => {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const heroImg =
      document.querySelector('img[src*="kesav.webp"]') ||
      document.querySelector('img[alt*="Kesav"]');

    if (heroImg && heroImg.complete) {
      return triggerCardAppearance();
    } else if (heroImg) {
      let cancelTimer = null;
      const onHeroLoad = () => {
        cancelTimer = triggerCardAppearance();
      };
      heroImg.addEventListener('load', onHeroLoad, { once: true });
      return () => {
        heroImg.removeEventListener('load', onHeroLoad);
        if (cancelTimer) cancelTimer();
      };
    } else {
      if (document.readyState === 'complete') {
        return triggerCardAppearance();
      } else {
        let cancelTimer = null;
        const onWindowLoad = () => {
          cancelTimer = triggerCardAppearance();
        };
        window.addEventListener('load', onWindowLoad, { once: true });
        return () => {
          window.removeEventListener('load', onWindowLoad);
          if (cancelTimer) cancelTimer();
        };
      }
    }
  }, []);

  // Save dismissal state in storage
  const markAnswered = () => {
    try {
      localStorage.setItem('kesav_welcome_answered', 'true');
    } catch {
      try {
        sessionStorage.setItem('kesav_welcome_answered', 'true');
      } catch {
        window.__kesav_welcome_session_shown = true;
      }
    }
  };

  // Esc key closes card
  useEffect(() => {
    if (!isVisible || status !== 'idle') return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, status, visitorId]);

  const handleSkip = async () => {
    markAnswered();
    setIsVisible(false);
    setStatus('dismissed');

    // Count anonymous visit quietly
    try {
      await fetch('/api/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId,
          consent: false,
          _hp: '',
        }),
      });
    } catch {
      // Silently continue, never block the visitor
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const trimmed = name.trim();

    // If name is typed, check validation & consent
    if (trimmed.length > 0) {
      if (trimmed.length < 2 || trimmed.length > 40 || !consent) {
        return;
      }
    }

    setStatus('submitting');

    try {
      const response = await fetch('/api/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId,
          name: trimmed || undefined,
          purpose: selectedPurpose || undefined,
          consent: Boolean(consent && trimmed.length > 0),
          _hp: '',
        }),
      });

      if (!response.ok) {
        // Silently continue, never block the visitor
        markAnswered();
        setIsVisible(false);
        setStatus('dismissed');
        return;
      }

      markAnswered();
      setStatus('success');
      setTimeout(() => {
        setIsVisible(false);
        setStatus('dismissed');
      }, 2000);
    } catch {
      // Silently continue, never block visitor
      markAnswered();
      setIsVisible(false);
      setStatus('dismissed');
    }
  };

  if (!isVisible || status === 'dismissed') {
    return null;
  }

  const trimmedName = name.trim();
  const hasName = trimmedName.length > 0;
  const isNameInvalid = hasName && (trimmedName.length < 2 || trimmedName.length > 40);
  const isEnterDisabled =
    status === 'submitting' || (hasName && (!consent || isNameInvalid));

  return (
    <aside
      ref={cardRef}
      role="region"
      aria-label="Welcome greeting"
      className={`fixed z-50 transition-all duration-300 ease-out 
        bottom-[80px] sm:bottom-6 sm:right-6 left-3 right-3 sm:left-auto sm:max-w-[390px]
        motion-reduce:transition-none
        border-3 rounded-xl p-5 md:p-6
        ${
          isDark
            ? 'bg-[#181715] text-[#FFF8EC] border-[#FFD60A] shadow-[5px_5px_0px_#FFD60A]'
            : 'bg-[#FFF8EC] text-[#111111] border-[#111111] shadow-[5px_5px_0px_#111111]'
        }`}
    >
      {/* Top Banner / Close button */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded font-mono text-[10px] font-black uppercase tracking-wider border ${
              isDark
                ? 'bg-[#FFD60A] text-[#111111] border-[#FFD60A]'
                : 'bg-[#FF3D81] text-[#111111] border-[#111111]'
            }`}
          >
            WELCOME
          </span>
          <span className="font-mono text-xs font-bold opacity-75">10-sec Hello</span>
        </div>
        <button
          onClick={handleSkip}
          type="button"
          aria-label="Close welcome card (skip)"
          className={`p-1 rounded-md border-2 transition-transform hover:scale-105 active:scale-95 cursor-pointer ${
            isDark
              ? 'border-[#3E3A33] hover:border-[#FFD60A] text-[#C9BFAE] hover:text-[#FFD60A]'
              : 'border-[#111111] hover:bg-neutral-200 text-[#111111]'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {status === 'success' ? (
        <div className="py-6 text-center space-y-2 animate-fade-in">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-mint text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
          <h3 className="font-headline text-2xl uppercase tracking-tight">
            Thanks, {trimmedName || 'friend'}!
          </h3>
          <p className="font-mono text-xs opacity-80">
            Enjoy browsing Kesav's work.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Question 1: Name */}
          <div>
            <label
              htmlFor="visitor-name-input"
              className="block font-headline text-xl sm:text-2xl uppercase tracking-tight leading-tight mb-1"
            >
              Hi! What should I call you?
            </label>
            <p className="font-mono text-xs opacity-75 mb-2">
              (Optional &bull; 2 to 40 characters)
            </p>
            <input
              id="visitor-name-input"
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameTouched(true);
              }}
              placeholder="e.g. Maya or Alex"
              maxLength={40}
              className={`w-full px-3.5 py-2.5 rounded-lg font-mono text-sm border-2 transition-colors focus:outline-none ${
                isDark
                  ? 'bg-[#0E0D0C] text-[#FFF8EC] border-[#3E3A33] focus:border-[#FFD60A] placeholder-neutral-500'
                  : 'bg-white text-[#111111] border-[#111111] focus:border-[#2F5BFF] placeholder-neutral-400'
              }`}
            />
            {nameTouched && isNameInvalid && (
              <p className="font-mono text-[11px] text-pink font-bold mt-1">
                Name must be between 2 and 40 characters.
              </p>
            )}
          </div>

          {/* Question 2: Tap chips */}
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink" />
              What brings you here?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {PURPOSES.map((purpose) => {
                const isSelected = selectedPurpose === purpose;
                return (
                  <button
                    key={purpose}
                    type="button"
                    onClick={() =>
                      setSelectedPurpose(isSelected ? '' : purpose)
                    }
                    className={`px-2.5 py-2 rounded-lg font-mono text-xs font-bold text-left border-2 transition-all cursor-pointer ${
                      isSelected
                        ? isDark
                          ? 'bg-[#FFD60A] text-[#111111] border-[#FFD60A] shadow-[2px_2px_0px_#FFD60A]'
                          : 'bg-[#FFD60A] text-[#111111] border-[#111111] shadow-[2px_2px_0px_#111111]'
                        : isDark
                        ? 'bg-[#22201D] text-[#C9BFAE] border-[#3E3A33] hover:border-[#FFD60A]'
                        : 'bg-white text-[#111111] border-[#CCCCCC] hover:border-[#111111]'
                    }`}
                  >
                    {purpose}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Consent line */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-2 border-current accent-pink cursor-pointer"
              />
              <span className="font-mono text-[11px] leading-snug opacity-85">
                I agree to share my name so Kesav can see who visited. No email, no phone, no tracking cookies.
              </span>
            </label>
          </div>

          {/* Actions: Enter & Skip */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleSkip}
              className={`px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                isDark
                  ? 'text-[#C9BFAE] hover:text-[#FFF8EC] hover:bg-white/5'
                  : 'text-neutral-600 hover:text-[#111111] hover:bg-black/5'
              }`}
            >
              Skip
            </button>

            <button
              type="submit"
              disabled={isEnterDisabled}
              className={`px-5 py-2.5 rounded-lg font-mono text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                isEnterDisabled
                  ? 'opacity-40 cursor-not-allowed border-current bg-neutral-300 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-500'
                  : isDark
                  ? 'bg-[#2F5BFF] text-white border-white hover:bg-blue-600 shadow-[2px_2px_0px_#FFFFFF] active:translate-y-0.5'
                  : 'bg-[#2F5BFF] text-white border-[#111111] hover:bg-blue-600 shadow-[2px_2px_0px_#111111] active:translate-y-0.5'
              }`}
            >
              {status === 'submitting' ? 'Entering...' : 'Enter'}
            </button>
          </div>
        </form>
      )}
    </aside>
  );
}
