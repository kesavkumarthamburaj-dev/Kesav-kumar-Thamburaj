import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motionConfig, TOOL_LOGOS } from '../data/motion.config';

/**
 * HeroOrbit: Enlarged 3D planetary orbit wrapping around Kesav's head and shoulders.
 * Features:
 * - 2x resolution WebP cutout (/kesav.webp) with 2px paper sticker edge silhouette
 * - Bottom anchored (bottom: 0) with 12% soft linear gradient fade mask
 * - Screenprint poster backdrop: 70% flat pop circle with halftone dots + 10px misregistered pink circle
 * - Dark mode subtle radial ground glow (25% opacity)
 * - Tilted ~65deg orbit ring wrapping head & shoulders: far tiles behind neck (z-10, 36px),
 *   near tiles in front of chest (z-30, 60px)
 * - Single rAF loop, IntersectionObserver pause, prefers-reduced-motion static fallback
 */
export default function HeroOrbit({ isDark, shouldReduceMotion }) {
  const containerRef = useRef(null);
  const tilesRef = useRef([]);
  const animFrameRef = useRef(null);
  const isPausedRef = useRef(false);
  const hoveredIndexRef = useRef(null);

  const [activeTooltip, setActiveTooltip] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [pointerTilt, setPointerTilt] = useState({ x: 0, y: 0 });

  // Responsive device check (< 1024px is mobile / tablet)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter tools: 14 tools on desktop, 5 tools on mobile
  const activeTools = useMemo(() => {
    if (isMobile) {
      // 5 representative tools on mobile
      return [
        TOOL_LOGOS[0], // Affinity
        TOOL_LOGOS[1], // Photoshop
        TOOL_LOGOS[2], // Figma
        TOOL_LOGOS[6], // Premiere Pro
        TOOL_LOGOS[10], // Claude
      ];
    }
    return TOOL_LOGOS;
  }, [isMobile]);

  // Pointer movement parallax (desktop only, max 8deg)
  const handlePointerMove = (e) => {
    if (isMobile || shouldReduceMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    const maxTilt = motionConfig.orbit.maxTiltParallaxDeg || 8;
    setPointerTilt({
      x: -ny * maxTilt,
      y: nx * maxTilt,
    });
  };

  const handlePointerLeave = () => {
    setPointerTilt({ x: 0, y: 0 });
    isPausedRef.current = false;
    hoveredIndexRef.current = null;
    setActiveTooltip(null);
  };

  // Main 3D Orbit rAF Loop
  useEffect(() => {
    if (shouldReduceMotion) {
      // Static display for prefers-reduced-motion
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const W = rect.width || 500;
        const rx = W * ((isMobile ? motionConfig.orbit.rxPercentMobile : motionConfig.orbit.rxPercentDesktop) / 100);
        const ry = W * (motionConfig.orbit.ryPercent / 100);
        const planeRad = (motionConfig.orbit.planeRotateDeg * Math.PI) / 180;
        const cosP = Math.cos(planeRad);
        const sinP = Math.sin(planeRad);
        const count = activeTools.length;

        activeTools.forEach((_, i) => {
          const el = tilesRef.current[i];
          if (!el) return;
          const a = (i * 2 * Math.PI) / count;
          const ex = Math.cos(a) * rx;
          const ey = Math.sin(a) * ry;
          const px = ex * cosP - ey * sinP;
          const py = ex * sinP + ey * cosP;
          const depth = Math.sin(a);
          const isNear = depth >= 0;

          const nearScaleToUse = isMobile ? motionConfig.orbit.mobileNearScale : 1.25;
          const farScaleToUse = isMobile ? motionConfig.orbit.mobileFarScale : 0.75;
          el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0px) scale(${isNear ? nearScaleToUse : farScaleToUse})`;
          el.style.zIndex = isNear ? '30' : '10';
          el.style.opacity = isNear ? '1.0' : '0.65';
          el.style.filter = 'none';
        });
      }
      return;
    }

    let isVisible = true;
    let observer = null;

    // Pause when tab hidden or hero not intersecting
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (containerRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            isVisible = e.isIntersecting && !document.hidden;
          });
        },
        { threshold: 0.05 }
      );
      observer.observe(containerRef.current);
    }

    const {
      durationSec,
      planeRotateDeg,
      rxPercentDesktop,
      rxPercentMobile,
      ryPercent,
      farScale,
      nearScale,
      farOpacity,
      nearOpacity,
      farBlurPx,
      entranceStaggerMs,
    } = motionConfig.orbit;

    const maxBlur = isMobile ? motionConfig.blur.maxBlurMobile : motionConfig.blur.maxBlurDesktop;
    const speedMult = motionConfig.blur.speedMultiplier;
    const planeRad = (planeRotateDeg * Math.PI) / 180;
    const cosP = Math.cos(planeRad);
    const sinP = Math.sin(planeRad);

    const orbitDurationMs = durationSec * 1000;
    const radPerMs = (2 * Math.PI) / orbitDurationMs; // Constant clockwise speed

    let startTime = performance.now();
    let currentAngle = 0;
    let lastTime = performance.now();

    const renderFrame = (now) => {
      if (isVisible) {
        const dt = now - lastTime;
        lastTime = now;

        if (!isPausedRef.current) {
          currentAngle += dt * radPerMs;
        }

        const elapsed = now - startTime;
        const W = containerRef.current?.offsetWidth || 500;
        const rx = W * ((isMobile ? rxPercentMobile : rxPercentDesktop) / 100);
        const ry = W * (ryPercent / 100);

        // Linear speed for velocity-based motion blur
        const angularSpeed = isPausedRef.current ? 0 : radPerMs * 1000;
        const avgR = (rx + ry) / 2;
        const linearSpeed = angularSpeed * avgR;
        const baseSpeedBlur = Math.min(maxBlur, Math.max(0, linearSpeed * speedMult));

        const count = activeTools.length;
        const effectiveNearScale = isMobile ? motionConfig.orbit.mobileNearScale : nearScale;
        const effectiveFarScale = isMobile ? motionConfig.orbit.mobileFarScale : farScale;

        for (let i = 0; i < count; i++) {
          const el = tilesRef.current[i];
          if (!el) continue;

          // Entrance animation: fly in from orbit center with 60ms stagger
          const tileStartTime = i * entranceStaggerMs;
          const entranceProgress = Math.min(1, Math.max(0, (elapsed - tileStartTime) / 450));
          const radiusFactor = 1 - Math.pow(1 - entranceProgress, 3);

          const a = currentAngle + (i * 2 * Math.PI) / count;
          const ex = Math.cos(a) * (rx * radiusFactor);
          const ey = Math.sin(a) * (ry * radiusFactor);

          // Rotate into tilted orbital plane
          const px = ex * cosP - ey * sinP;
          const py = ex * sinP + ey * cosP;

          // True depth: sin(a) is +1 at closest point, -1 at furthest point
          const depth = Math.sin(a);
          const isNear = depth >= 0;
          const isHovered = hoveredIndexRef.current === i;

          let scale;
          let opacity;
          let zIndex;
          let blur;

          if (isHovered) {
            scale = 1.45;
            opacity = 1.0;
            zIndex = 50;
            blur = 0;
          } else if (isNear) {
            // Near half: passes IN FRONT of chest and fog (z-index 30, sharp)
            scale = effectiveNearScale - (effectiveNearScale - 1.0) * (1 - depth);
            opacity = nearOpacity;
            zIndex = 30; // Strictly in front of fog (z-22, z-24) and photo (z-20)
            blur = baseSpeedBlur * (1 - depth * 0.4); // Sharpest at peak foreground
          } else {
            // Far half: passes BEHIND neck & head (z-index 10, scale 0.75 / 0.73, blurred)
            const normalizedFar = (depth + 1); // 0 to 1
            scale = effectiveFarScale + (1.0 - effectiveFarScale) * normalizedFar;
            opacity = farOpacity + (nearOpacity - farOpacity) * normalizedFar * 0.7;
            zIndex = 10; // Strictly behind photo (z-20)
            blur = Math.min(maxBlur, baseSpeedBlur + farBlurPx * (1 - normalizedFar));
          }

          el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0px) scale(${scale.toFixed(3)})`;
          el.style.opacity = `${opacity.toFixed(2)}`;
          el.style.zIndex = `${zIndex}`;
          el.style.filter = blur > 0.35 ? `blur(${blur.toFixed(2)}px)` : 'none';
        }
      }

      animFrameRef.current = requestAnimationFrame(renderFrame);
    };

    animFrameRef.current = requestAnimationFrame(renderFrame);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (observer) observer.disconnect();
    };
  }, [activeTools, isMobile, shouldReduceMotion]);

  const handleTileEnter = (idx, toolName) => {
    isPausedRef.current = true;
    hoveredIndexRef.current = idx;
    setActiveTooltip({ index: idx, name: toolName });
  };

  const handleTileLeave = () => {
    isPausedRef.current = false;
    hoveredIndexRef.current = null;
    setActiveTooltip(null);
  };

  const baseRgb = isDark
    ? motionConfig.mobileHero.baseColorDarkRgb
    : motionConfig.mobileHero.baseColorLightRgb;

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative w-full h-full aspect-square select-none flex items-end justify-center"
      style={{
        perspective: '1200px',
      }}
    >
      {/* 1. Subtle Dark Mode Ground Glow under Photo (25% opacity) */}
      {isDark && (
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[45%] pointer-events-none z-[3]"
          style={{
            background: 'radial-gradient(ellipse at bottom, rgba(255, 214, 10, 0.25) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />
      )}

      {/* 2. Poster Backdrop: Misregistered Pink Circle (offset 10px in pink at 60% opacity) */}
      <div
        className="absolute rounded-full pointer-events-none transition-transform duration-300 z-[4]"
        style={{
          width: '70%',
          height: '70%',
          top: `${motionConfig.orbit.centerYPercent}%`,
          left: '50%',
          transform: 'translate(calc(-50% + 10px), calc(-50% + 10px))',
          backgroundColor: '#FF3D81',
          opacity: 0.60,
        }}
        aria-hidden="true"
      />

      {/* 3. Poster Backdrop: Large Flat Circle (70% height, pop yellow in light, #2A2500 in dark, with halftone dot overlay) */}
      <div
        className="absolute rounded-full pointer-events-none transition-colors duration-300 z-[5] overflow-hidden"
        style={{
          width: '70%',
          height: '70%',
          top: `${motionConfig.orbit.centerYPercent}%`,
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: isDark ? '#2A2500' : '#FFD60A',
          border: isDark ? '2px solid rgba(255, 214, 10, 0.35)' : '3px solid #111111',
          boxShadow: isDark
            ? '0 0 48px rgba(255, 214, 10, 0.16)'
            : '4px 4px 0px #111111',
        }}
        aria-hidden="true"
      >
        {/* Halftone dot pattern overlay inside backdrop circle */}
        <div
          className="absolute inset-0 opacity-35 pointer-events-none"
          style={{
            backgroundImage: isDark
              ? 'radial-gradient(rgba(255, 214, 10, 0.4) 1.5px, transparent 1.5px)'
              : 'radial-gradient(rgba(17, 17, 17, 0.32) 1.5px, transparent 1.5px)',
            backgroundSize: '12px 12px',
          }}
          aria-hidden="true"
        />
      </div>

      {/* 4. Planetary Orbit Elliptical Ring Visual Guide (Tilted ~65deg dashed trace wrapping head & shoulders) */}
      <div
        className="absolute rounded-[50%] pointer-events-none transition-transform duration-300 z-[12]"
        style={{
          width: '84%',
          height: '32%',
          top: `${motionConfig.orbit.centerYPercent}%`,
          left: '50%',
          transform: `translate(-50%, -50%) rotate(${motionConfig.orbit.planeRotateDeg}deg) rotateY(${pointerTilt.y * 0.7}deg) rotateX(${pointerTilt.x * 0.7}deg)`,
          border: isDark
            ? '1.5px dashed rgba(255, 214, 10, 0.40)'
            : '2px dashed rgba(17, 17, 17, 0.28)',
          boxShadow: isDark
            ? '0 0 24px rgba(255, 214, 10, 0.15), inset 0 0 20px rgba(255, 214, 10, 0.08)'
            : 'none',
        }}
        aria-hidden="true"
      />

      {/* 5. Central Portrait Cutout: Kesav Kumar T (z-index 20, 2x WebP, bottom-anchored, 2px sticker edge, bottom fade mask) */}
      <div
        className="absolute inset-0 flex items-end justify-center pointer-events-none z-[20]"
        style={{
          transform: !shouldReduceMotion && !isMobile
            ? `rotateX(${pointerTilt.x * 0.4}deg) rotateY(${pointerTilt.y * 0.4}deg)`
            : 'none',
          transition: 'transform 0.15s ease-out',
          maskImage: isMobile
            ? `linear-gradient(to bottom, #000 ${motionConfig.mobileHero.maskFadeStartPercent}%, transparent 100%)`
            : 'linear-gradient(to bottom, #000 88%, transparent 100%)',
          WebkitMaskImage: isMobile
            ? `linear-gradient(to bottom, #000 ${motionConfig.mobileHero.maskFadeStartPercent}%, transparent 100%)`
            : 'linear-gradient(to bottom, #000 88%, transparent 100%)',
        }}
      >
        <img
          src="/kesav.webp"
          alt="Kesav Kumar T — Packaging Designer &amp; Software Founder"
          width={1600}
          height={1600}
          fetchPriority="high"
          decoding="async"
          loading="eager"
          className="w-auto h-full max-w-full object-contain object-bottom pointer-events-none select-none"
          style={{
            aspectRatio: '1 / 1',
            filter: 'drop-shadow(2px 0 0 #FFF8EC) drop-shadow(-2px 0 0 #FFF8EC) drop-shadow(0 2px 0 #FFF8EC) drop-shadow(0 -2px 0 #FFF8EC) drop-shadow(0 16px 32px rgba(0,0,0,0.45))',
          }}
        />
      </div>

      {/* 5b. Layer 2: Mobile Fog Bank (z-index 22, height 30%, 3 stacked radial gradients, blur 14px) */}
      {isMobile && (
        <div
          className="absolute bottom-0 left-0 right-0 w-full pointer-events-none z-[22]"
          style={{
            height: `${motionConfig.mobileHero.fogBankHeightPercent}%`,
            background: `
              radial-gradient(ellipse 70% 85% at 50% 100%, rgba(${baseRgb}, 0.95) 0%, transparent 80%),
              radial-gradient(ellipse 60% 75% at 20% 90%, rgba(${baseRgb}, 0.70) 0%, transparent 75%),
              radial-gradient(ellipse 65% 80% at 80% 95%, rgba(${baseRgb}, 0.50) 0%, transparent 75%)
            `,
            filter: `blur(${motionConfig.mobileHero.fogBankBlurPx}px)`,
          }}
          aria-hidden="true"
        />
      )}

      {/* 5c. Layer 3: Mobile Drifting Mist (z-index 24, two blobs drifting translateX +/-6%, blur 24px) */}
      {isMobile && (
        <>
          <div
            className={`absolute bottom-0 left-[-10%] w-[120%] pointer-events-none z-[24] ${
              shouldReduceMotion ? '' : 'animate-mist-drift-1'
            }`}
            style={{
              height: '38%',
              background: `radial-gradient(ellipse 80% 70% at 35% 85%, rgba(${baseRgb}, ${motionConfig.mobileHero.driftMistOpacity}) 0%, transparent 70%)`,
              filter: `blur(${motionConfig.mobileHero.driftMistBlurPx}px)`,
              '--drift-dur-1': `${motionConfig.mobileHero.driftDuration1Sec}s`,
            }}
            aria-hidden="true"
          />
          <div
            className={`absolute bottom-0 left-[-10%] w-[120%] pointer-events-none z-[24] ${
              shouldReduceMotion ? '' : 'animate-mist-drift-2'
            }`}
            style={{
              height: '34%',
              background: `radial-gradient(ellipse 75% 65% at 65% 80%, rgba(${baseRgb}, ${motionConfig.mobileHero.driftMistOpacity}) 0%, transparent 70%)`,
              filter: `blur(${motionConfig.mobileHero.driftMistBlurPx}px)`,
              '--drift-dur-2': `${motionConfig.mobileHero.driftDuration2Sec}s`,
            }}
            aria-hidden="true"
          />
        </>
      )}

      {/* 
        6. Orbiting Logo Tiles: Direct children of containerRef centered at (50%, centerYPercent).
        Far tiles: z-10 (behind neck & head z-20, scale 0.75 = ~36px)
        Near tiles: z-30 (in front of chest z-20, scale 1.25 = ~60px)
        Hovered tile: z-50 (scale 1.45 = ~70px)
      */}
      {activeTools.map((tool, idx) => (
        <div
          key={tool.id}
          ref={(el) => (tilesRef.current[idx] = el)}
          onPointerEnter={() => handleTileEnter(idx, tool.name)}
          onPointerLeave={handleTileLeave}
          onMouseEnter={() => handleTileEnter(idx, tool.name)}
          onMouseLeave={handleTileLeave}
          onTouchStart={() => handleTileEnter(idx, tool.name)}
          onTouchEnd={handleTileLeave}
          className={`absolute rounded-xl flex items-center justify-center cursor-pointer pointer-events-auto select-none transition-shadow duration-200 ${
            isDark
              ? 'bg-[#FFF8EC] border border-[#2E2A24] shadow-[0_0_18px_rgba(255,214,10,0.35)]'
              : 'bg-paper border-2 border-[#111111] shadow-[2.5px_2.5px_0px_#111111]'
          }`}
          style={{
            width: '48px',
            height: '48px',
            top: `calc(${motionConfig.orbit.centerYPercent}% - 24px)`,
            left: 'calc(50% - 24px)',
            willChange: 'transform, opacity, filter',
          }}
          title={tool.name}
        >
          <img
            src={tool.logo}
            alt={`${tool.name} logo`}
            width={26}
            height={26}
            decoding="async"
            className="w-6.5 h-6.5 object-contain pointer-events-none"
          />

          {/* Hover / Tap Tooltip */}
          {activeTooltip?.index === idx && (
            <span
              className="absolute -top-9 px-2.5 py-1 bg-yellow text-[#111111] font-mono text-[11px] font-black uppercase tracking-[var(--track-label)] rounded border-2 border-[#111111] shadow-[2px_2px_0px_#111111] whitespace-nowrap pointer-events-none z-[60]"
            >
              {tool.name}
            </span>
          )}
        </div>
      ))}

      {/* Mobile touch hint */}
      {isMobile && !activeTooltip && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider text-ink/70 dark:text-yellow/80 bg-paper/90 dark:bg-[#14120F]/90 border border-ink/20 dark:border-[#2E2A24] pointer-events-none z-[35]">
          Tap icon to pause
        </div>
      )}
    </div>
  );
}
