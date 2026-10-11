import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motionConfig, TOOL_LOGOS } from '../data/motion.config';

/**
 * FloatingToolsLayer: Fixed full-viewport layer of subtle floating tool icons
 * positioned strictly near outer viewport edges with 3D parallax, drift, and motion blur.
 * Hides gracefully when contact form is focused or prefers-reduced-motion is enabled.
 */
export default function FloatingToolsLayer({ isDark, shouldReduceMotion }) {
  const containerRef = useRef(null);
  const iconsRef = useRef([]);
  const animFrameRef = useRef(null);

  const [isMobile, setIsMobile] = useState(false);
  const [isFormFocused, setIsFormFocused] = useState(false);
  const [lowPerfMode, setLowPerfMode] = useState(false);

  // Responsive check
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Form focus detection: hide floating layer while user is typing in form
  useEffect(() => {
    const handleFocusIn = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        setIsFormFocused(true);
      }
    };

    const handleFocusOut = () => {
      setTimeout(() => {
        const activeTag = document.activeElement?.tagName?.toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'textarea' && activeTag !== 'select') {
          setIsFormFocused(false);
        }
      }, 100);
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  // Icon pool: 8 on desktop (36-64px), 5 on mobile (34-40px), positioned strictly on outer safe edges
  const floatingIconsData = useMemo(() => {
    const totalCount = isMobile
      ? (lowPerfMode ? 4 : motionConfig.floating.mobileCount)
      : (lowPerfMode ? 6 : motionConfig.floating.desktopCount);

    const selectedTools = [
      TOOL_LOGOS[2],  // Figma
      TOOL_LOGOS[1],  // Photoshop
      TOOL_LOGOS[6],  // Premiere Pro
      TOOL_LOGOS[10], // Claude
      TOOL_LOGOS[12], // Antigravity
      TOOL_LOGOS[4],  // Pacdora
      TOOL_LOGOS[9],  // DaVinci Resolve
      TOOL_LOGOS[11], // ChatGPT
    ].slice(0, totalCount);

    // Desktop safe edge anchors (left: 3-10%, right: 88-94%)
    const desktopAnchors = [
      { xPct: 3,  yPct: 15, depth: 0.95, size: 56, rot: -8,  freqX: 0.0008, freqY: 0.0006 },
      { xPct: 93, yPct: 18, depth: 0.75, size: 48, rot: 10,  freqX: 0.0007, freqY: 0.0009 },
      { xPct: 4,  yPct: 46, depth: 0.55, size: 40, rot: -12, freqX: 0.0009, freqY: 0.0005 },
      { xPct: 92, yPct: 52, depth: 0.90, size: 60, rot: 6,   freqX: 0.0006, freqY: 0.0008 },
      { xPct: 5,  yPct: 78, depth: 0.65, size: 46, rot: 11,  freqX: 0.0008, freqY: 0.0007 },
      { xPct: 94, yPct: 76, depth: 0.85, size: 52, rot: -9,  freqX: 0.0007, freqY: 0.0006 },
      { xPct: 9,  yPct: 32, depth: 0.45, size: 36, rot: 5,   freqX: 0.0005, freqY: 0.0008 },
      { xPct: 88, yPct: 66, depth: 0.50, size: 42, rot: -6,  freqX: 0.0008, freqY: 0.0005 },
    ];

    // Mobile safe edge anchors (strictly away from headline, badges, and bottom nav)
    const mobileAnchors = [
      { xPct: 90, yPct: 12, depth: 0.85, size: 36, rot: 8,   freqX: 0.0007, freqY: 0.0008 },
      { xPct: 3,  yPct: 48, depth: 0.60, size: 34, rot: -10, freqX: 0.0008, freqY: 0.0006 },
      { xPct: 93, yPct: 58, depth: 0.90, size: 38, rot: 6,   freqX: 0.0006, freqY: 0.0007 },
      { xPct: 4,  yPct: 78, depth: 0.70, size: 34, rot: 9,   freqX: 0.0007, freqY: 0.0005 },
      { xPct: 91, yPct: 84, depth: 0.80, size: 36, rot: -8,  freqX: 0.0005, freqY: 0.0008 },
    ];

    const activeAnchors = isMobile ? mobileAnchors : desktopAnchors;

    return selectedTools.map((tool, idx) => ({
      ...tool,
      ...activeAnchors[idx],
    }));
  }, [isMobile, lowPerfMode]);

  // Main floating loop with Scroll Velocity & Motion Blur
  useEffect(() => {
    if (shouldReduceMotion) return;

    let isVisible = true;
    const handleVis = () => { isVisible = !document.hidden; };
    document.addEventListener('visibilitychange', handleVis);

    let lastScrollY = window.scrollY;
    let smoothScrollVelocity = 0;
    let lastTime = performance.now();
    let frameTimes = [];

    const maxBlur = isMobile ? motionConfig.blur.maxBlurMobile : motionConfig.blur.maxBlurDesktop;
    const speedMult = motionConfig.blur.speedMultiplier;
    const scrollBlurFactor = motionConfig.blur.scrollBlurFactor;

    const render = (now) => {
      if (isVisible) {
        const dt = Math.max(1, now - lastTime);
        lastTime = now;

        // Dynamic FPS performance monitor (auto-degrade if < 50 FPS)
        frameTimes.push(now);
        if (frameTimes.length > 60) {
          frameTimes.shift();
          const duration = frameTimes[frameTimes.length - 1] - frameTimes[0];
          const fps = (frameTimes.length * 1000) / duration;
          if (fps < motionConfig.performance.fpsDropThreshold && !lowPerfMode) {
            setLowPerfMode(true);
          }
        }

        // Scroll velocity tracking
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY;
        lastScrollY = currentScrollY;

        const rawScrollVel = (scrollDelta / dt) * 1000; // px/sec
        smoothScrollVelocity = smoothScrollVelocity * 0.82 + rawScrollVel * 0.18;

        const scrollBlur = Math.min(3, Math.abs(smoothScrollVelocity) * scrollBlurFactor);

        const W = window.innerWidth;
        const H = window.innerHeight;

        floatingIconsData.forEach((item, idx) => {
          const el = iconsRef.current[idx];
          if (!el) return;

          // Natural sine-wave drift path
          const driftX = Math.sin(now * item.freqX + idx) * (isMobile ? 12 : 24);
          const driftY = Math.cos(now * item.freqY + idx * 1.5) * (isMobile ? 16 : 32);

          // Scroll parallax vertical shift (far slower, near faster)
          const scrollShift = -smoothScrollVelocity * item.depth * (motionConfig.floating.scrollParallaxFactor || 0.045);
          const clampedScrollShift = Math.max(-50, Math.min(50, scrollShift));

          const baseX = (item.xPct / 100) * W;
          const baseY = (item.yPct / 100) * H;

          const finalX = baseX + driftX;
          const finalY = baseY + driftY + clampedScrollShift;

          // Rotation sway (+/- 12deg)
          const currentRot = item.rot + Math.sin(now * 0.001 + idx) * (motionConfig.floating.rotationVariationDeg || 12);

          // Speed & Motion Blur calculation
          const velX = Math.cos(now * item.freqX + idx) * item.freqX * 24 * 1000;
          const velY = -Math.sin(now * item.freqY + idx * 1.5) * item.freqY * 32 * 1000;
          const driftSpeed = Math.hypot(velX, velY);
          const totalSpeed = driftSpeed + Math.abs(smoothScrollVelocity) * 0.25;

          let blur = 0;
          if (!lowPerfMode) {
            blur = Math.min(maxBlur, Math.max(0, totalSpeed * speedMult + scrollBlur));
          }

          el.style.transform = `translate3d(${finalX.toFixed(1)}px, ${finalY.toFixed(1)}px, 0px) rotate(${currentRot.toFixed(1)}deg)`;
          el.style.filter = blur > 0.35 ? `blur(${blur.toFixed(2)}px)` : 'none';
        });
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      document.removeEventListener('visibilitychange', handleVis);
    };
  }, [floatingIconsData, isMobile, lowPerfMode, shouldReduceMotion]);

  if (shouldReduceMotion) return null;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none overflow-hidden z-[18] transition-opacity duration-300 ${
        isFormFocused ? 'opacity-0' : 'opacity-90'
      }`}
      aria-hidden="true"
    >
      {floatingIconsData.map((item, idx) => (
        <div
          key={`${item.id}-${idx}`}
          ref={(el) => (iconsRef.current[idx] = el)}
          className={`absolute top-0 left-0 rounded-xl flex items-center justify-center pointer-events-none select-none transition-shadow ${
            isDark
              ? 'bg-[#FFF8EC] border border-[#2E2A24] shadow-[0_4px_16px_rgba(255,214,10,0.22)]'
              : 'bg-paper border-2 border-[#111111] shadow-[2px_2px_0px_#111111]'
          }`}
          style={{
            width: `${item.size}px`,
            height: `${item.size}px`,
            opacity: motionConfig.floating.baseOpacity || 0.9,
            willChange: 'transform, filter',
          }}
        >
          <img
            src={item.logo}
            alt=""
            width={Math.round(item.size * 0.58)}
            height={Math.round(item.size * 0.58)}
            decoding="async"
            className="object-contain pointer-events-none select-none"
            style={{
              width: `${Math.round(item.size * 0.58)}px`,
              height: `${Math.round(item.size * 0.58)}px`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
