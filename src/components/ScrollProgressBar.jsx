import React from 'react';
import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion';

export default function ScrollProgressBar({ isDark }) {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const smoothScaleX = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 35,
    restDelta: 0.001,
  });

  const scaleX = shouldReduceMotion ? scrollYProgress : smoothScaleX;

  return (
    <motion.div
      style={{ scaleX }}
      className={`fixed top-0 left-0 right-0 h-[4px] origin-left z-50 pointer-events-none transition-colors duration-200 ${
        isDark ? 'bg-pink shadow-[0_0_12px_#FF3D81]' : 'bg-yellow shadow-[0_0_10px_#FFD60A]'
      }`}
      aria-hidden="true"
    />
  );
}
