import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * TornEdge renders an authentic screen-printed torn paper divider between sections.
 * Draws in left-to-right (via clip-path mask) when entering viewport.
 * @param {string} color - The fill color of the torn paper teeth (matching the section below)
 * @param {string} bgColor - The background color behind the tear (matching the section above)
 * @param {boolean} flip - Whether to invert the jagged edge
 * @param {string} className - Additional CSS classes
 */
export default function TornEdge({
  color = '#FF3D81',
  bgColor = '#FFD60A',
  flip = false,
  className = '',
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className={`relative w-full overflow-hidden leading-none select-none pointer-events-none z-10 transition-colors duration-200 ${className}`}
      style={{ backgroundColor: bgColor }}
      aria-hidden="true"
    >
      <motion.div
        initial={shouldReduceMotion ? { opacity: 0 } : { clipPath: 'inset(0 100% 0 0)' }}
        whileInView={shouldReduceMotion ? { opacity: 1 } : { clipPath: 'inset(0 0% 0 0)' }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="w-full"
      >
        <svg
          className={`w-full block h-8 sm:h-12 md:h-16 ${flip ? 'rotate-180' : ''}`}
          viewBox="0 0 1440 64"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle drop silhouette of torn edge */}
          <path
            d="M0,0 L0,22 Q35,38 72,18 T144,28 Q180,42 220,16 T310,34 Q365,12 420,38 T510,18 Q570,44 630,22 T740,36 Q810,14 880,40 T970,20 Q1040,46 1110,24 T1220,38 Q1290,12 1360,34 T1440,20 L1440,64 L0,64 Z"
            fill="#000000"
            opacity="0.25"
            transform="translate(0, 3)"
          />
          {/* Main jagged torn paper path taking exact color of section below */}
          <path
            d="M0,0 L0,22 Q35,38 72,18 T144,28 Q180,42 220,16 T310,34 Q365,12 420,38 T510,18 Q570,44 630,22 T740,36 Q810,14 880,40 T970,20 Q1040,46 1110,24 T1220,38 Q1290,12 1360,34 T1440,20 L1440,64 L0,64 Z"
            fill={color}
          />
          {/* Subtle fibrous paper tear tooth marks */}
          <path
            d="M72,18 L76,14 L80,19 M310,34 L315,30 L320,35 M630,22 L635,18 L640,23 M970,20 L975,16 L980,21 M1220,38 L1225,33 L1230,39"
            stroke="#000000"
            strokeWidth="1.5"
            opacity="0.2"
            fill="none"
          />
        </svg>
      </motion.div>
    </div>
  );
}
