'use client';

import { useState, useEffect } from 'react';

/**
 * useVirtualKeyboard
 * Detecta de forma reactiva la apertura del teclado virtual en iOS y Android
 * mediante la API window.visualViewport, evitando el salto hacia arriba del modal
 * y permitiendo añadir padding inferior dinámico para que los inputs no queden tapados.
 */
export function useVirtualKeyboard(isModalOpen: boolean = true) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!isModalOpen || typeof window === 'undefined') {
      setKeyboardHeight(0);
      return;
    }

    const updateKeyboard = () => {
      if (!window.visualViewport) return;
      const heightDiff = window.innerHeight - window.visualViewport.height;
      // Los teclados virtuales móviles ocupan al menos 120px. Diferencias menores a 80px suelen ser barras de navegación.
      if (heightDiff > 80) {
        setKeyboardHeight(Math.round(heightDiff));
      } else {
        setKeyboardHeight(0);
      }
    };

    // Prevenir que Safari mueva bruscamente window.scrollY al enfocar un input dentro del modal
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        // Bloquear desplazamiento del layout viewport hacia arriba
        window.scrollTo(0, 0);

        // Alinear suavemente el campo enfocado dentro del contenedor con scroll del modal
        setTimeout(() => {
          if (target && typeof target.scrollIntoView === 'function') {
            target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 120);
      }
    };

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', updateKeyboard);
      vv.addEventListener('scroll', updateKeyboard);
    }
    window.addEventListener('focusin', handleFocusIn);

    // Verificación inicial
    updateKeyboard();

    return () => {
      if (vv) {
        vv.removeEventListener('resize', updateKeyboard);
        vv.removeEventListener('scroll', updateKeyboard);
      }
      window.removeEventListener('focusin', handleFocusIn);
    };
  }, [isModalOpen]);

  return {
    keyboardHeight,
    isKeyboardOpen: keyboardHeight > 0,
  };
}
