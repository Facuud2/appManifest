'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to determine whether the viewport is on a desktop/PC screen (>= 1024px by default, aligning with Tailwind 'lg').
 * Safely handles SSR and dynamically updates on window resize or media query changes.
 */
export function useIsDesktop(breakpoint = 1024): boolean {
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= breakpoint;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mql = window.matchMedia(`(min-width: ${breakpoint}px)`);
    const update = () => {
      setIsDesktop(window.innerWidth >= breakpoint);
    };

    update();

    if (mql.addEventListener) {
      mql.addEventListener('change', update);
    } else {
      mql.addListener(update);
    }
    window.addEventListener('resize', update);

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', update);
      } else {
        mql.removeListener(update);
      }
      window.removeEventListener('resize', update);
    };
  }, [breakpoint]);

  return isDesktop;
}
