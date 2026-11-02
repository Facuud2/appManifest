'use client';

import { useEffect } from 'react';

/**
 * PwaScrollBoundary
 * Bloquea el efecto elástico (overscroll bounce / rubber-band) en PWAs móviles
 * cuando no hay más elementos a los cuales scrollear hacia arriba o hacia abajo,
 * manteniendo el marco de la aplicación firme sin desfasarse.
 */
export const PwaScrollBoundary: React.FC = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let touchStartY = 0;
    let touchStartX = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (!e.touches || e.touches.length === 0) return;
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    };

    const isScrollable = (el: Element): boolean => {
      const style = window.getComputedStyle(el);
      const overflowY = style.overflowY;
      const hasScrollableOverflow = overflowY === 'auto' || overflowY === 'scroll';
      return hasScrollableOverflow && el.scrollHeight > el.clientHeight;
    };

    const findScrollableAncestor = (target: EventTarget | null): HTMLElement | null => {
      let current = target as HTMLElement | null;
      while (current && current !== document.body && current !== document.documentElement) {
        if (isScrollable(current)) {
          return current;
        }
        current = current.parentElement;
      }
      return null;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!e.touches || e.touches.length === 0) return;

      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const deltaY = currentY - touchStartY;
      const deltaX = currentX - touchStartX;

      // Movimiento mínimo para evaluar
      if (Math.abs(deltaY) < 1) return;

      // Si el movimiento predominante es horizontal (swipes, sliders), permitirlo
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        return;
      }

      const target = e.target as HTMLElement;
      if (target && (['SELECT'].includes(target.tagName) || target.closest('[data-vaul-handle]'))) {
        return;
      }

      const scrollable = findScrollableAncestor(target);

      if (scrollable) {
        // Caso A: Dentro de un contenedor con scroll propio (modales, etc.)
        const { scrollTop, scrollHeight, clientHeight } = scrollable;
        const isAtTop = scrollTop <= 0;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

        if (deltaY > 0 && isAtTop) {
          if (e.cancelable) e.preventDefault();
        } else if (deltaY < 0 && isAtBottom) {
          if (e.cancelable) e.preventDefault();
        }
      } else {
        // Caso B: Scroll de la página o ventana
        const doc = document.documentElement;
        const body = document.body;
        const scrollTop = window.scrollY || doc.scrollTop || (body ? body.scrollTop : 0) || 0;
        const scrollHeight = Math.max(doc.scrollHeight, body ? body.scrollHeight : 0);
        const clientHeight = window.innerHeight || doc.clientHeight;
        const canScroll = scrollHeight > clientHeight + 2;

        if (!canScroll) {
          // No hay elementos hacia los cuales scrollear ni arriba ni abajo
          if (e.cancelable) e.preventDefault();
        } else {
          const isAtTop = scrollTop <= 0;
          const isAtBottom = scrollTop + clientHeight >= scrollHeight - 2;

          // Intento de scroll hacia arriba cuando ya no hay más elementos arriba
          if (deltaY > 0 && isAtTop) {
            if (e.cancelable) e.preventDefault();
          }
          // Intento de scroll hacia abajo cuando ya no hay más elementos abajo
          else if (deltaY < 0 && isAtBottom) {
            if (e.cancelable) e.preventDefault();
          }
        }
      }
    };

    // Escuchar a nivel de document y window para capturar en fase de burbuja y captura
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  return null;
};
