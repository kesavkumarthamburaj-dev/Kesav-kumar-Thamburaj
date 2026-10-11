import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * MaskedHeadline: Slides lines up from a mask (translateY 100% to 0, inside overflow: hidden)
 * Staggered 80ms per line, 600ms duration, ease-out cubic-bezier(0.22, 1, 0.36, 1).
 * Triggers once when 25% in view.
 */
export default function MaskedHeadline({
  lines,
  className = '',
  as = 'h2',
}) {
  const shouldReduceMotion = useReducedMotion();

  // Ensure lines is an array of strings
  const lineList = Array.isArray(lines)
    ? lines
    : typeof lines === 'string'
      ? lines.split('\n')
      : [String(lines)];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
      },
    },
  };

  const lineVariants = {
    hidden: shouldReduceMotion
      ? { opacity: 0 }
      : { y: '100%', opacity: 0 },
    visible: {
      y: '0%',
      opacity: 1,
      transition: {
        duration: shouldReduceMotion ? 0.15 : 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const Component = motion[as] || motion.h2;

  return (
    <Component
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      className={className}
    >
      {lineList.map((line, idx) => (
        <span key={idx} className="block overflow-hidden py-0.5">
          <motion.span variants={lineVariants} className="block">
            {line}
          </motion.span>
        </span>
      ))}
    </Component>
  );
}
