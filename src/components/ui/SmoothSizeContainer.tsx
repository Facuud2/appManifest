'use client';

import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { motion, Transition } from 'framer-motion';
import { IOS_LAYOUT_SPRING } from '@/lib/iosSprings';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface SmoothSizeContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  outerChildren?: React.ReactNode;
  className?: string;
  innerClassName?: string;
  transition?: Transition;
  layout?: boolean | 'position' | 'size';
  overflowHidden?: boolean;
}

/**
 * Universal Native iOS Spring Smooth Sizing Container
 * Uses a native ResizeObserver on an unconstrained inner content wrapper
 * while the outer motion.div animates height changes using Apple's 60 FPS spring physics.
 */
export const SmoothSizeContainer: React.FC<SmoothSizeContainerProps> = ({
  children,
  outerChildren,
  className = '',
  innerClassName = '',
  transition = IOS_LAYOUT_SPRING,
  layout,
  overflowHidden = true,
  style,
  onClick,
  ...props
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | 'auto'>('auto');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    // Initial measurement
    const initialHeight = Math.round(el.offsetHeight || el.getBoundingClientRect().height);
    if (initialHeight > 0) {
      setHeight(initialHeight);
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const target = entry.target as HTMLElement;
        const newHeight = Math.round(
          entry.borderBoxSize?.[0]?.blockSize ??
          target.offsetHeight ??
          target.getBoundingClientRect().height
        );

        if (newHeight >= 0) {
          setHeight((prev) => {
            if (prev !== 'auto' && prev !== newHeight) {
              setIsTransitioning(true);
            }
            return newHeight;
          });
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      initial={false}
      animate={{ height: height === 'auto' ? 'auto' : height }}
      transition={transition}
      layout={layout}
      onClick={onClick}
      onAnimationStart={() => setIsTransitioning(true)}
      onAnimationComplete={() => setIsTransitioning(false)}
      style={{
        ...style,
        willChange: isTransitioning ? 'height, transform' : 'auto',
      }}
      className={`relative ${overflowHidden ? 'overflow-hidden' : ''} ${className}`}
      {...(props as any)}
    >
      {outerChildren}
      <div ref={contentRef} className={`relative w-full ${innerClassName}`}>
        {children}
      </div>
    </motion.div>
  );
};
