'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface WaveBarsProps {
  count?: number;
  active?: boolean;
  className?: string;
  minHeight?: number;
  maxHeight?: number;
}

export const WaveBars: React.FC<WaveBarsProps> = ({
  count = 14,
  active = true,
  className = '',
  minHeight = 6,
  maxHeight = 28,
}) => {
  // Animate fluid 60fps frequency loop with organic phase offsets
  return (
    <div
      data-testid="wave-bars-container"
      className={`inline-flex items-center gap-[3px] h-[30px] px-1 select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => {
        // Bell curve weight from center to edges
        const center = (count - 1) / 2;
        const distFromCenter = Math.abs(i - center);
        const weight = Math.cos((distFromCenter / center) * (Math.PI / 2.3));
        const effectiveMax = minHeight + (maxHeight - minHeight) * Math.max(0.35, weight);

        // Individual oscillation heights for fluid organic motion
        const midHeight = (minHeight + effectiveMax) / 2;
        const lowHeight = minHeight + 2;

        return (
          <motion.span
            key={i}
            className="w-[3px] rounded-full bg-gradient-to-t from-purple-500 to-cyan-400 block shrink-0"
            initial={{ height: minHeight }}
            animate={
              active
                ? {
                    height: [
                      minHeight,
                      effectiveMax,
                      lowHeight,
                      midHeight,
                      minHeight,
                    ],
                  }
                : { height: minHeight }
            }
            transition={
              active
                ? {
                    duration: 0.85 + (i % 5) * 0.12,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                    delay: (i * 0.055) % 0.4,
                  }
                : { duration: 0.2 }
            }
          />
        );
      })}
    </div>
  );
};
