import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Mail, Send, CheckCircle2, AlertCircle, Copy, Check, ArrowUpRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { portfolioContent } from '../data/content';
import MaskedHeadline from './MaskedHeadline';
import Reveal from './Reveal';

export default function ContactSection({ isDark }) {
  const shouldReduceMotion = useReducedMotion();
  const { contact, profile } = portfolioContent;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: '',
    message: '',
    honeypot: '',
  });

  const [focusedField, setFocusedField] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorType, setErrorType] = useState(null); // 'validation' | 'config' | 'send_failed' | 'rate_limit' | 'network'
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [igLogoError, setIgLogoError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contact.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Client-Side Validation against shared rules
    const errors = {};
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedProjectType = formData.projectType.trim();
    const trimmedMessage = formData.message.trim();

    if (!trimmedName || trimmedName.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (trimmedName.length > 100) {
      errors.name = 'Name must be 100 characters or fewer';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      errors.email = 'Enter a valid email address';
    }

    const validProjectTypes = ['Packaging', 'Posters/Banners', 'Video editing', 'Software', 'Other'];
    if (!trimmedProjectType || !validProjectTypes.includes(trimmedProjectType)) {
      errors.projectType = 'Select a valid project type';
    }

    if (!trimmedMessage || trimmedMessage.length < 10) {
      errors.message = 'Message must be at least 10 characters';
    } else if (trimmedMessage.length > 3000) {
      errors.message = 'Message must be 3000 characters or fewer';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setStatus('error');
      setErrorType('validation');
      setErrorMessage('Please fill in the required fields with valid details.');
      return;
    }

    setStatus('loading');
    setErrorType(null);
    setErrorMessage('');
    setFieldErrors({});

    const payload = {
      name: trimmedName,
      email: trimmedEmail,
      projectType: trimmedProjectType,
      message: trimmedMessage,
      honeypot: formData.honeypot,
    };

    if (import.meta.env.DEV) {
      console.log('[Contact Form] Sending payload:', payload);
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (parseErr) {
        data = { error: 'network', message: parseErr.message };
      }

      if (import.meta.env.DEV) {
        console.log('[Contact Form] Response status:', response.status, data);
      }

      if (response.status === 200 && data.ok) {
        setStatus('success');
        setErrorType(null);
        setFieldErrors({});
        setFormData({
          name: '',
          email: '',
          projectType: '',
          message: '',
          honeypot: '',
        });

        // Trigger confetti burst of 12 small pop-colour squares over 800ms
        try {
          confetti({
            particleCount: 12,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#FFD60A', '#FF3D81', '#3DDC97', '#2F5BFF', '#FF7A1A'],
            shapes: ['square'],
            ticks: 80, // ~800ms
          });
        } catch {
          // Confetti optional
        }
        return;
      }

      setStatus('error');

      if (response.status === 400 && data.error === 'validation') {
        setErrorType('validation');
        setFieldErrors(data.fields || {});
        setErrorMessage('Please fill in the required fields with valid details.');
      } else if (response.status === 429 || data.error === 'rate_limit') {
        setErrorType('rate_limit');
        setErrorMessage(data.message || 'Too many requests. Please wait a few minutes before trying again.');
      } else if (response.status === 500 && data.error === 'config') {
        setErrorType('config');
        setErrorMessage("Couldn't send right now. Email me directly.");
      } else if (response.status === 502 && data.error === 'send_failed') {
        setErrorType('send_failed');
        setErrorMessage("Couldn't send right now. Email me directly.");
      } else {
        setErrorType('network');
        setErrorMessage("Couldn't send right now. Email me directly.");
      }
    } catch (err) {
      console.error('[Contact Form Network Error]:', err);
      setStatus('error');
      setErrorType('network');
      setErrorMessage("Couldn't send right now. Email me directly.");
    }
  };

  return (
    <section
      id="contact"
      className="relative section-contact halftone-overlay pt-24 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="sticker-badge bg-pink text-[#111111] text-xs font-bold -rotate-2">
            PROJECT ENQUIRIES
          </span>
          <span className={`font-mono text-xs font-bold uppercase tracking-[var(--track-label)] ${isDark ? 'text-[#C9BFAE]' : 'text-yellow/80'
            }`}>
            TAMIL NADU &bull; WORLDWIDE COLLABORATIONS
          </span>
        </div>

        {/* Huge Masked Headline: "LET'S MAKE SOMETHING LOUD." - full pop yellow */}
        <Reveal amount={0.25} className="mb-14 sm:mb-20">
          <MaskedHeadline
            lines={[contact.headline]}
            className="headline-giant text-yellow font-black drop-shadow-[0_0_24px_rgba(255,214,10,0.3)]"
          />
          <p className="mt-4 text-xl sm:text-2xl font-body font-bold text-[#FFF8EC] max-w-3xl leading-snug tracking-[var(--track-lead)]">
            {contact.subline}
          </p>
        </Reveal>

        {/* 2-Column Layout: Direct Details & Enquiry Form */}
        <Reveal amount={0.2} className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Column 1: Direct Contact Info & Fast Action Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Email Card */}
            <div className={`p-6 rounded-xl transition-all duration-200 ${isDark
                ? 'bg-[#1A1815] border border-[#2E2A24] hover:border-yellow hover:shadow-[0_0_24px_rgba(255,214,10,0.25)]'
                : 'bg-[#1A1A1E] border-3 border-yellow/60 shadow-[5px_5px_0px_#FFD60A]'
              }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold uppercase tracking-[var(--track-label)] text-yellow flex items-center gap-2">
                  <Mail className="w-4 h-4 text-pink" />
                  <span>DIRECT EMAIL</span>
                </span>
                <button
                  onClick={handleCopyEmail}
                  className={`p-1.5 text-xs font-mono font-bold uppercase tracking-[var(--track-button)] whitespace-nowrap rounded flex items-center gap-1 cursor-pointer transition-colors active:scale-95 ${isDark
                      ? 'text-yellow border border-[#2E2A24] bg-[#14120F] hover:bg-yellow hover:text-[#111111]'
                      : 'text-yellow border border-yellow/40 hover:bg-yellow hover:text-ink'
                    }`}
                  title="Copy email to clipboard"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-mint" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEmail ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>

              <a
                href={`mailto:${contact.email}`}
                className="contact-email font-headline text-xl sm:text-2xl text-[#FFF8EC] hover:text-yellow transition-colors leading-tight block"
              >
                {contact.email}
              </a>
              <p className="mt-2 text-xs font-mono text-[#C9BFAE]">
                Inbox monitored daily. Expect response within 24 hours.
              </p>
            </div>

            {/* Social Direct Action (Instagram - Public) */}
            <div className="w-full">
              <motion.a
                href={portfolioContent.social?.instagram || profile.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open Kesav's Instagram"
                whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                style={{ '--slide-fill': '#FFD60A' }}
                className="btn-slide-fill group/ig w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border-2.5 border-[#111111] bg-[#FF3D81] text-[#111111] shadow-[3px_3px_0px_#111111] flex items-center justify-between gap-3 cursor-pointer select-none font-mono text-xs sm:text-sm font-bold uppercase tracking-[var(--track-button)] transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <motion.span
                    whileHover={shouldReduceMotion ? undefined : { rotate: [-4, 4, -4, 4, 0], transition: { duration: 0.35 } }}
                    className="w-[44px] h-[44px] min-w-[44px] min-h-[44px] rounded-lg bg-[#111111] border border-black/20 flex items-center justify-center shrink-0 shadow-inner group-hover/ig:scale-105 transition-transform"
                  >
                    {!igLogoError ? (
                      <img
                        src="/logos/instagram.svg"
                        width={24}
                        height={24}
                        alt="Instagram logo"
                        className="w-6 h-6 object-contain pointer-events-none"
                        onError={() => setIgLogoError(true)}
                      />
                    ) : (
                      <span className="font-headline font-black text-white text-lg leading-none select-none">
                        I
                      </span>
                    )}
                  </motion.span>
                  <span className="text-[#111111] leading-tight">Follow on Instagram</span>
                </div>
                <ArrowUpRight
                  className={`w-4 h-4 text-[#111111] shrink-0 ${shouldReduceMotion ? '' : 'transition-transform duration-150 group-hover/ig:translate-x-1 group-hover/ig:-translate-y-1'
                    }`}
                />
              </motion.a>
            </div>

            {/* Studio Note Card */}
            <div className={`p-5 rounded-xl font-mono text-xs transition-colors ${isDark
                ? 'bg-[#1A1815] border border-[#2E2A24] text-[#C9BFAE]'
                : 'bg-paper border-3 border-ink text-ink shadow-[5px_5px_0px_#FF3D81]'
              }`}>
              <div className={`font-bold uppercase tracking-[var(--track-label)] mb-1 ${isDark ? 'text-pink' : 'text-ink'}`}>
                LOCATION &amp; SCOPE
              </div>
              <p className="leading-relaxed font-medium">
                Based in Tamil Nadu, India. Collaborating with FMCG manufacturers, D2C disruptors, creators, and engineering ventures worldwide.
              </p>
            </div>
          </div>

          {/* Column 2: Interactive Contact Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className={`rounded-xl p-6 sm:p-8 transition-all ${isDark
                ? 'bg-[#1A1815] border border-[#2E2A24] shadow-[0_0_32px_rgba(255,214,10,0.15)] text-[#FFF8EC]'
                : 'bg-paper text-ink border-3.5 border-ink shadow-[8px_8px_0px_#FFD60A]'
              }`}>
              <div className={`flex items-center justify-between pb-4 mb-6 border-b ${isDark ? 'border-[#2E2A24]' : 'border-ink'
                }`}>
                <div>
                  <h3 className={`font-headline text-2xl sm:text-3xl uppercase tracking-[var(--track-heading)] ${isDark ? 'text-[#FFF8EC]' : 'text-ink'
                    }`}>
                    START A CONVERSATION
                  </h3>
                  <p className={`font-mono text-xs font-bold uppercase tracking-[var(--track-label)] mt-0.5 ${isDark ? 'text-[#C9BFAE]' : 'text-ink/75'
                    }`}>
                    Wired to /api/contact &bull; Resend Verified
                  </p>
                </div>
                <span className="sticker-badge bg-yellow text-[#111111] text-xs font-bold">
                  STEP 01
                </span>
              </div>

              {/* Success Notification Banner */}
              {status === 'success' && (
                <div className="mb-6 p-4 bg-mint text-[#111111] border-2 border-[#111111] rounded-lg shadow-[3px_3px_0px_#111111] flex items-start gap-3 animate-in fade-in">
                  <CheckCircle2 className="w-6 h-6 text-[#111111] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-headline text-xl uppercase text-[#111111] leading-none">
                      ENQUIRY DELIVERED!
                    </h4>
                    <p className="mt-1 font-body text-sm font-bold text-[#111111]">
                      {contact.formCopy.successMessage}
                    </p>
                    <p className="mt-1 font-mono text-xs text-[#111111]/80">
                      Check your inbox soon for confirmation.
                    </p>
                  </div>
                </div>
              )}

              {/* Error Notification Banner */}
              {status === 'error' && (
                <div
                  role="alert"
                  className="mb-6 p-4 bg-pink text-[#111111] border-2 border-[#111111] rounded-lg shadow-[3px_3px_0px_#111111] flex items-start gap-3 animate-in fade-in"
                >
                  <AlertCircle className="w-6 h-6 text-[#111111] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-headline text-xl uppercase text-[#111111] leading-none">
                      {errorType === 'validation' ? 'SUBMISSION ISSUE' : 'DELIVERY ISSUE'}
                    </h4>
                    <p className="mt-1 font-body text-sm font-bold text-[#111111]">
                      {errorMessage || (errorType === 'validation' ? 'Please fill in the required fields with valid details.' : "Couldn't send right now. Email me directly.")}
                    </p>
                    {errorType !== 'validation' && (
                      <a
                        href={`mailto:${contact.email}?subject=Project Enquiry (${encodeURIComponent(formData.projectType || 'Design')})`}
                        className="mt-2 inline-block font-mono text-xs font-black underline text-[#111111] hover:text-black transition-colors"
                      >
                        Click here to email {contact.email} directly &rarr;
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Form Element */}
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Honeypot Field (hidden with CSS, not display:none only) */}
                <div
                  style={{
                    position: 'absolute',
                    opacity: 0,
                    pointerEvents: 'none',
                    width: 0,
                    height: 0,
                    overflow: 'hidden',
                    zIndex: -1,
                  }}
                  aria-hidden="true"
                >
                  <label htmlFor="honeypot">Leave this empty</label>
                  <input
                    type="text"
                    id="honeypot"
                    name="honeypot"
                    value={formData.honeypot}
                    onChange={handleChange}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {/* Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name Field with Floating Label & Pink Border on Focus */}
                  <div className={`relative ${fieldErrors.name ? 'animate-error-shake' : ''}`}>
                    <label
                      htmlFor="name"
                      className={`block font-mono text-xs font-bold uppercase tracking-[var(--track-label)] mb-1.5 transition-all duration-200 ${focusedField === 'name' || formData.name
                          ? 'text-pink scale-95 origin-left'
                          : isDark
                            ? 'text-[#FFF8EC]'
                            : 'text-ink'
                        }`}
                    >
                      {contact.formCopy.nameLabel} <span className="text-pink">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      minLength={2}
                      maxLength={100}
                      aria-invalid={fieldErrors.name ? 'true' : 'false'}
                      aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                      value={formData.name}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      onChange={handleChange}
                      placeholder="e.g. Arun Kumar"
                      className={`w-full px-4 py-3 font-body font-bold text-sm rounded-lg border-2 transition-all duration-200 ${fieldErrors.name ? 'border-pink ring-2 ring-pink' : ''
                        } ${isDark
                          ? 'bg-[#14120F] text-[#FFF8EC] border-[#2E2A24] placeholder-[#C9BFAE]/40 focus:border-pink focus:outline-none focus:ring-2 focus:ring-pink focus:ring-offset-2 focus:ring-offset-[#1A1815]'
                          : 'bg-white text-ink border-2.5 border-ink shadow-[2px_2px_0px_#111111] focus:border-pink focus:bg-pink/5 focus:outline-none'
                        }`}
                    />
                    {fieldErrors.name && (
                      <p id="name-error" className="mt-1.5 font-mono text-xs font-bold text-pink flex items-center gap-1">
                        <span>&bull;</span> {fieldErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Email Field with Floating Label & Pink Border on Focus */}
                  <div className={`relative ${fieldErrors.email ? 'animate-error-shake' : ''}`}>
                    <label
                      htmlFor="email"
                      className={`block font-mono text-xs font-bold uppercase tracking-[var(--track-label)] mb-1.5 transition-all duration-200 ${focusedField === 'email' || formData.email
                          ? 'text-pink scale-95 origin-left'
                          : isDark
                            ? 'text-[#FFF8EC]'
                            : 'text-ink'
                        }`}
                    >
                      {contact.formCopy.emailLabel} <span className="text-pink">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      aria-invalid={fieldErrors.email ? 'true' : 'false'}
                      aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                      value={formData.email}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      onChange={handleChange}
                      placeholder="arun@brand.com"
                      className={`w-full px-4 py-3 font-body font-bold text-sm rounded-lg border-2 transition-all duration-200 ${fieldErrors.email ? 'border-pink ring-2 ring-pink' : ''
                        } ${isDark
                          ? 'bg-[#14120F] text-[#FFF8EC] border-[#2E2A24] placeholder-[#C9BFAE]/40 focus:border-pink focus:outline-none focus:ring-2 focus:ring-pink focus:ring-offset-2 focus:ring-offset-[#1A1815]'
                          : 'bg-white text-ink border-2.5 border-ink shadow-[2px_2px_0px_#111111] focus:border-pink focus:bg-pink/5 focus:outline-none'
                        }`}
                    />
                    {fieldErrors.email && (
                      <p id="email-error" className="mt-1.5 font-mono text-xs font-bold text-pink flex items-center gap-1">
                        <span>&bull;</span> {fieldErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Project Type Dropdown */}
                <div className={`relative ${fieldErrors.projectType ? 'animate-error-shake' : ''}`}>
                  <label
                    htmlFor="projectType"
                    className={`block font-mono text-xs font-bold uppercase tracking-[var(--track-label)] mb-1.5 ${isDark ? 'text-[#FFF8EC]' : 'text-ink'
                      }`}
                  >
                    {contact.formCopy.projectTypeLabel} <span className="text-pink">*</span>
                  </label>
                  <select
                    id="projectType"
                    name="projectType"
                    required
                    aria-invalid={fieldErrors.projectType ? 'true' : 'false'}
                    aria-describedby={fieldErrors.projectType ? 'projectType-error' : undefined}
                    value={formData.projectType}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 font-body font-bold text-sm rounded-lg border-2 cursor-pointer transition-all duration-200 ${fieldErrors.projectType ? 'border-pink ring-2 ring-pink' : ''
                      } ${isDark
                        ? 'bg-[#14120F] text-[#FFF8EC] border-[#2E2A24] focus:border-pink focus:outline-none focus:ring-2 focus:ring-pink focus:ring-offset-2 focus:ring-offset-[#1A1815]'
                        : 'bg-white text-ink border-2.5 border-ink shadow-[2px_2px_0px_#111111] focus:border-pink focus:outline-none'
                      }`}
                  >
                    <option value="" disabled className={isDark ? 'bg-[#1A1815] text-[#C9BFAE]' : 'bg-white text-gray-500'}>
                      Select project type...
                    </option>
                    {contact.projectTypes.map((type) => (
                      <option key={type} value={type} className={isDark ? 'bg-[#1A1815] text-[#FFF8EC]' : 'bg-white text-ink'}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.projectType && (
                    <p id="projectType-error" className="mt-1.5 font-mono text-xs font-bold text-pink flex items-center gap-1">
                      <span>&bull;</span> {fieldErrors.projectType}
                    </p>
                  )}
                </div>

                {/* Message Field with Floating Label & Live Counter */}
                <div className={`relative ${fieldErrors.message ? 'animate-error-shake' : ''}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="message"
                      className={`block font-mono text-xs font-bold uppercase tracking-[var(--track-label)] transition-all duration-200 ${focusedField === 'message' || formData.message
                          ? 'text-pink scale-95 origin-left'
                          : isDark
                            ? 'text-[#FFF8EC]'
                            : 'text-ink'
                        }`}
                    >
                      {contact.formCopy.messageLabel} <span className="text-pink">*</span>
                    </label>
                    {/* Live character counter ("7/10 minimum" or "15 characters") */}
                    <span
                      className={`font-mono text-xs font-bold tabular-nums tracking-wide ${formData.message.trim().length === 0
                          ? isDark ? 'text-[#C9BFAE]/60' : 'text-ink/60'
                          : formData.message.trim().length < 10
                            ? 'text-pink font-black'
                            : isDark ? 'text-mint' : 'text-[#111111]'
                        }`}
                    >
                      {formData.message.trim().length < 10
                        ? `${formData.message.trim().length}/10 minimum`
                        : `${formData.message.trim().length} characters`}
                    </span>
                  </div>
                  <textarea
                    id="message"
                    name="message"
                    required
                    minLength={10}
                    maxLength={3000}
                    rows={4}
                    aria-invalid={fieldErrors.message ? 'true' : 'false'}
                    aria-describedby={fieldErrors.message ? 'message-error' : undefined}
                    value={formData.message}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                    onChange={handleChange}
                    placeholder="Briefly describe your product, pack count, timeline, or goal (min 10 characters)..."
                    className={`w-full px-4 py-3 font-body font-bold text-sm rounded-lg border-2 transition-all duration-200 resize-y min-h-[110px] ${fieldErrors.message ? 'border-pink ring-2 ring-pink' : ''
                      } ${isDark
                        ? 'bg-[#14120F] text-[#FFF8EC] border-[#2E2A24] placeholder-[#C9BFAE]/40 focus:border-pink focus:outline-none focus:ring-2 focus:ring-pink focus:ring-offset-2 focus:ring-offset-[#1A1815]'
                        : 'bg-white text-ink border-2.5 border-ink shadow-[2px_2px_0px_#111111] focus:border-pink focus:bg-pink/5 focus:outline-none'
                      }`}
                  />
                  {fieldErrors.message && (
                    <p id="message-error" className="mt-1.5 font-mono text-xs font-bold text-pink flex items-center gap-1">
                      <span>&bull;</span> {fieldErrors.message}
                    </p>
                  )}
                </div>

                {/* "Send Enquiry" Button:
                    States: idle (slide-fill), loading (3 bouncing dots), success (mint + checkmark draw), error (shake translateX +/-6px x3) */}
                <motion.button
                  type="submit"
                  disabled={status === 'loading'}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                  className={`btn-slide-fill w-full min-h-[54px] px-8 py-3.5 font-headline text-xl sm:text-2xl font-black uppercase tracking-[var(--track-button)] whitespace-nowrap rounded-lg border-2.5 border-[#111111] shadow-[4px_4px_0px_#111111] transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${status === 'success'
                      ? 'bg-mint text-[#111111]'
                      : status === 'error'
                        ? 'bg-pink text-[#111111] animate-error-shake'
                        : 'bg-yellow text-[#111111] hover:bg-mint hover:translate-x-[1px] hover:translate-y-[1px]'
                    }`}
                >
                  {status === 'loading' ? (
                    /* 3 Bouncing Dots Loading State */
                    <div className="flex items-center gap-2 py-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#111111] animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#111111] animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#111111] animate-bounce" />
                    </div>
                  ) : status === 'success' ? (
                    /* Success state: button turns mint, checkmark draws with stroke-dashoffset */
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-6 h-6 text-[#111111]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path className="animate-checkmark-draw" d="M20 6L9 17L4 12" />
                      </svg>
                      <span>ENQUIRY SENT!</span>
                    </div>
                  ) : (
                    /* Idle State: Slide-fill + Arrow */
                    <>
                      <span>{contact.formCopy.submitButton}</span>
                      <Send className="w-5 h-5 ml-1 text-[#111111] transition-transform duration-200 group-hover:translate-x-1" />
                    </>
                  )}
                </motion.button>

                <p className={`text-center font-mono text-[11px] font-semibold ${isDark ? 'text-[#C9BFAE]' : 'text-ink/75'
                  }`}>
                  Spam protected with honeypot &amp; rate limiting &bull; No marketing spam ever
                </p>
              </form>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
