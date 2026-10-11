import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motionConfig, TOOL_LOGOS } from '../data/motion.config';

/**
 * HeroOrbit: 3D planetary orbit around Kesav's photo cutout.
 * Calculates true depth per frame in a single requestAnimationFrame loop.
 * Tiles on far half (depth < 0) render BEHIND photo (z-index 10, scale 0.7, opacity 0.6, blur).
 * Photo renders at z-index 20.
 * Tiles on near half (depth >= 0) render IN FRONT of photo (z-index 30, scale 1.15, opacity 1.0, sharp).
 * Hover / touch scales tile to 1.35 at z-index 50 and pauses orbit.
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

  // Responsive device check (< 768px is mobile)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter tools: 14 tools on desktop, 8 tools on mobile
  const activeTools = useMemo(() => {
    if (isMobile) {
      // Pick 8 representative tools across packaging, design, video, and AI
      return [
        TOOL_LOGOS[0], // Affinity
        TOOL_LOGOS[1], // Photoshop
        TOOL_LOGOS[2], // Figma
        TOOL_LOGOS[4], // Pacdora
        TOOL_LOGOS[6], // Premiere Pro
        TOOL_LOGOS[9], // DaVinci Resolve
        TOOL_LOGOS[10], // Claude
        TOOL_LOGOS[12], // Antigravity
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
        const W = rect.width || 420;
        const rx = W * (isMobile ? 0.44 : 0.46);
        const ry = W * 0.18;
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

          el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0px) scale(${isNear ? 1.05 : 0.75})`;
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
        const W = containerRef.current?.offsetWidth || 420;
        const rx = W * ((isMobile ? rxPercentMobile : rxPercentDesktop) / 100);
        const ry = W * (ryPercent / 100);

        // Linear speed for velocity-based motion blur
        const angularSpeed = isPausedRef.current ? 0 : radPerMs * 1000;
        const avgR = (rx + ry) / 2;
        const linearSpeed = angularSpeed * avgR;
        const baseSpeedBlur = Math.min(maxBlur, Math.max(0, linearSpeed * speedMult));

        const count = activeTools.length;

        for (let i = 0; i < count; i++) {
          const el = tilesRef.current[i];
          if (!el) continue;

          // Entrance animation: fly in from center (0,0) with 60ms stagger
          const tileStartTime = i * entranceStaggerMs;
          const entranceProgress = Math.min(1, Math.max(0, (elapsed - tileStartTime) / 450));
          // Cubic ease-out
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
            scale = 1.35;
            opacity = 1.0;
            zIndex = 50;
            blur = 0;
          } else if (isNear) {
            // Near half: passes IN FRONT of photo (z-index 30, scale 1.15, full opacity, sharp)
            scale = nearScale - (nearScale - 1.0) * (1 - depth);
            opacity = nearOpacity;
            zIndex = 30; // Strictly in front of photo (z-20)
            blur = baseSpeedBlur * (1 - depth * 0.4); // Sharpest at peak foreground
          } else {
            // Far half: passes BEHIND photo (z-index 10, scale 0.7, opacity 0.6, blurred)
            const normalizedFar = (depth + 1); // 0 to 1
            scale = farScale + (1.0 - farScale) * normalizedFar;
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

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative w-full max-w-[420px] sm:max-w-[460px] lg:max-w-[490px] xl:max-w-[520px] aspect-[4/5] mx-auto select-none"
      style={{
        perspective: '1200px',
      }}
    >
      {/* Planetary Orbit Elliptical Ring Visual Guide (Tilted ~65deg screen-print dashed trace) */}
      <div
        className="absolute top-1/2 left-1/2 w-[92%] h-[36%] rounded-[50%] pointer-events-none transition-transform duration-300 z-[12]"
        style={{
          transform: `translate(-50%, -50%) rotate(${motionConfig.orbit.planeRotateDeg}deg) rotateY(${pointerTilt.y * 0.7}deg) rotateX(${pointerTilt.x * 0.7}deg)`,
          border: isDark
            ? '1.5px dashed rgba(255, 214, 10, 0.32)'
            : '2px dashed rgba(17, 17, 17, 0.22)',
          boxShadow: isDark
            ? '0 0 24px rgba(255, 214, 10, 0.12), inset 0 0 20px rgba(255, 214, 10, 0.06)'
            : 'none',
        }}
        aria-hidden="true"
      />

      {/* Decorative Radial Backdrop Aura behind Kesav */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 rounded-full pointer-events-none blur-3xl z-[5] transition-opacity ${
          isDark ? 'bg-yellow/15 opacity-80' : 'bg-yellow/30 opacity-70'
        }`}
        aria-hidden="true"
      />

      {/* Central Portrait Cutout: Kesav Kumar T (z-index 20) */}
      <div
        className="absolute inset-0 flex items-end justify-center pointer-events-none z-[20]"
        style={{
          transform: !shouldReduceMotion && !isMobile
            ? `rotateX(${pointerTilt.x * 0.4}deg) rotateY(${pointerTilt.y * 0.4}deg)`
            : 'none',
          transition: 'transform 0.15s ease-out',
        }}
      >
        <img
          src="/kesav.png"
          alt="Kesav Kumar T — Packaging Designer &amp; Software Founder"
          width={512}
          height={512}
          decoding="async"
          loading="eager"
          className="w-auto h-[88%] sm:h-[92%] lg:h-[96%] max-w-full object-contain object-bottom pointer-events-none select-none drop-shadow-[0_18px_36px_rgba(0,0,0,0.48)]"
        />
      </div>

      {/* 
        Orbiting Logo Tiles: Direct children of containerRef so z-index sorting is true & direct!
        Far tiles: z-10 (behind photo z-20)
        Near tiles: z-30 (in front of photo z-20)
        Hovered tile: z-50
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
            top: 'calc(50% - 24px)',
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

          {/* Tooltip on hover or touch */}
          {activeTooltip?.index === idx && (
            <span
              className="absolute -top-9 px-2 py-1 bg-yellow text-[#111111] font-mono text-[11px] font-black uppercase tracking-[var(--track-label)] rounded border-1.5 border-[#111111] shadow-[2px_2px_0px_#111111] whitespace-nowrap pointer-events-none z-[60]"
            >
              {tool.name}
            </span>
          )}
        </div>
      ))}

      {/* Mobile touch hint */}
      {isMobile && !activeTooltip && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider text-ink/70 dark:text-yellow/80 bg-paper/90 dark:bg-[#14120F]/90 border border-ink/20 dark:border-[#2E2A24] pointer-events-none z-[35]">
          Tap icon to pause
        </div>
      )}
    </div>
  );
}
