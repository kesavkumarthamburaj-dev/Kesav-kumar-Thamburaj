import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Reusable <Reveal> wrapper:
 * - initial: { opacity: 0, y: 40 }
 * - whileInView: { opacity: 1, y: 0 }
 * - viewport: { once: true, amount: 0.25 }
 * - transition: 0.6s ease [0.22, 1, 0.36, 1]
 * - Animates only transform (y) and opacity (GPU-friendly, no layout shift)
 * - Respects prefers-reduced-motion
 */
export default function Reveal({
  children,
  className = '',
  delay = 0,
  amount = 0.25,
  y = 40,
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.6,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
