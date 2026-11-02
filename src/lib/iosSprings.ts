import type { Transition, TargetAndTransition } from 'framer-motion';

/**
 * Central Apple Cupertino Spring Physics & Liquid Glass Tokens
 * Used across Framer Motion & @use-gesture/react interactions.
 */

export const IOS_VIEW_SPRING: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 34,
  mass: 0.8,
};

export const IOS_TAP_SPRING: TargetAndTransition = {
  scale: 0.96,
  transition: {
    type: 'spring',
    stiffness: 500,
    damping: 30,
  },
};

export const IOS_CARD_TAP_SPRING: TargetAndTransition = {
  scale: 0.985,
  transition: {
    type: 'spring',
    stiffness: 500,
    damping: 30,
  },
};

export const IOS_SHEET_SPRING: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 36,
  mass: 0.85,
};

export const LIQUID_GLASS_SPECULAR =
  'border border-manifest-glassBorder shadow-glass backdrop-blur-2xl bg-manifest-cardBg text-manifest-ink';
