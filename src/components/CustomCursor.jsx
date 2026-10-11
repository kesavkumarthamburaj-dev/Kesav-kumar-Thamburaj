import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

export default function CustomCursor({ isDark }) {
  const shouldReduceMotion = useReducedMotion();
  const [cursorType, setCursorType] = useState('default'); // 'default' | 'view' | 'pointer'
  const [isVisible, setIsVisible] = useState(false);
  const [isPointerFine, setIsPointerFine] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  });

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Snappy spring tracking
  const springX = useSpring(mouseX, { stiffness: 600, damping: 40 });
  const springY = useSpring(mouseY, { stiffness: 600, damping: 40 });

  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    const handleMediaChange = (e) => setIsPointerFine(e.matches);
    media.addEventListener('change', handleMediaChange);

    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      // Check hovered target
      const target = e.target;
      if (!target) return;

      const cardEl = target.closest('[data-cursor="view"]');
      if (cardEl) {
        setCursorType('view');
        return;
      }

      const interactiveEl = target.closest('a, button, input, textarea, select, [role="button"], label');
      if (interactiveEl) {
        setCursorType('pointer');
        return;
      }

      setCursorType('default');
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      media.removeEventListener('change', handleMediaChange);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible, mouseX, mouseY]);

  if (shouldReduceMotion || !isPointerFine || !isVisible) {
    return null;
  }

  const isView = cursorType === 'view';
  const isPointer = cursorType === 'pointer';

  return (
    <motion.div
      className="custom-cursor-layer fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{
        x: springX,
        y: springY,
        translateX: '-50%',
        translateY: '-50%',
      }}
    >
      <motion.div
        animate={{
          width: isView ? 58 : isPointer ? 26 : 14,
          height: isView ? 58 : isPointer ? 26 : 14,
          scale: 1,
        }}
        transition={{ type: 'spring', stiffness: 450, damping: 28 }}
        className={`rounded-full flex items-center justify-center font-mono text-[11px] font-black uppercase transition-colors duration-150 select-none shadow-sm ${
          isView
            ? 'bg-yellow text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111]'
            : isPointer
              ? isDark
                ? 'bg-pink/80 border-2 border-[#FFF8EC]'
                : 'bg-yellow/90 border-2 border-ink'
              : isDark
                ? 'bg-[#FFF8EC] border border-[#111111]'
                : 'bg-[#111111]'
        }`}
      >
        {isView && (
          <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="tracking-[0.06em] text-[#111111]"
          >
            VIEW
          </motion.span>
        )}
      </motion.div>
    </motion.div>
  );
}
