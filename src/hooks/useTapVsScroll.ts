'use client';

import { useRef, useCallback, useEffect } from 'react';

interface UseTapVsScrollOptions {
  /** Callback to execute when a genuine tap is detected */
  onTap: (e: React.MouseEvent | React.PointerEvent) => void;
  /** Movement threshold in pixels to consider the action a scroll/drag rather than a tap. Default: 8 */
  threshold?: number;
  /** Maximum duration in milliseconds to be considered a tap (to reject long press / touch-hold scroll stops). Default: 400 */
  maxDuration?: number;
}

export function useTapVsScroll({
  onTap,
  threshold = 8,
  maxDuration = 400,
}: UseTapVsScrollOptions) {
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const startScrollY = useRef<number>(0);
  const startTime = useRef<number>(0);
  const isScrollOrDrag = useRef<boolean>(false);

  // Clean up global scroll listener if component unmounts mid-gesture
  const removeScrollListenerRef = useRef<(() => void) | null>(null);

  const cleanupScrollListener = useCallback(() => {
    if (removeScrollListenerRef.current) {
      removeScrollListenerRef.current();
      removeScrollListenerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanupScrollListener();
    };
  }, [cleanupScrollListener]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only handle primary button / touches
      if (e.button !== 0) return;

      startPos.current = { x: e.clientX, y: e.clientY };
      startScrollY.current = typeof window !== 'undefined' ? window.scrollY : 0;
      startTime.current = Date.now();
      isScrollOrDrag.current = false;

      cleanupScrollListener();

      // Listen for window scroll during the touch to immediately flag scrolling
      const handleWindowScroll = () => {
        isScrollOrDrag.current = true;
      };

      if (typeof window !== 'undefined') {
        window.addEventListener('scroll', handleWindowScroll, { passive: true });
        removeScrollListenerRef.current = () => {
          window.removeEventListener('scroll', handleWindowScroll);
        };
      }
    },
    [cleanupScrollListener]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isScrollOrDrag.current || !startPos.current) return;

      const deltaX = Math.abs(e.clientX - startPos.current.x);
      const deltaY = Math.abs(e.clientY - startPos.current.y);

      // If user moved finger/mouse past threshold, it's a drag or scroll attempt
      if (deltaX > threshold || deltaY > threshold) {
        isScrollOrDrag.current = true;
      }
    },
    [threshold]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      cleanupScrollListener();

      if (!startPos.current) return;

      const duration = Date.now() - startTime.current;
      const currentScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
      const scrollDelta = Math.abs(currentScrollY - startScrollY.current);

      // If held too long or page scrolled, it's not an intentional click/tap
      if (duration > maxDuration || scrollDelta > 4) {
        isScrollOrDrag.current = true;
      }
    },
    [cleanupScrollListener, maxDuration]
  );

  const onPointerCancel = useCallback(() => {
    cleanupScrollListener();
    isScrollOrDrag.current = true;
  }, [cleanupScrollListener]);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      cleanupScrollListener();

      // Check if it's a keyboard accessibility trigger (Enter or Space)
      const isKeyboardClick = e.detail === 0 && e.clientX === 0 && e.clientY === 0;

      if (isKeyboardClick) {
        onTap(e);
        return;
      }

      // If flagged as scroll or drag, prevent tap action
      if (isScrollOrDrag.current) {
        e.preventDefault();
        e.stopPropagation();
        isScrollOrDrag.current = false;
        startPos.current = null;
        return;
      }

      // Double check scroll position difference
      if (typeof window !== 'undefined') {
        const scrollDelta = Math.abs(window.scrollY - startScrollY.current);
        if (scrollDelta > 4) {
          e.preventDefault();
          e.stopPropagation();
          isScrollOrDrag.current = false;
          startPos.current = null;
          return;
        }
      }

      startPos.current = null;
      onTap(e);
    },
    [cleanupScrollListener, onTap]
  );

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onClick,
  };
}
