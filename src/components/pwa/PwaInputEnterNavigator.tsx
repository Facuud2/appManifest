'use client';

import { useEffect } from 'react';

const EXCLUDED_INPUT_TYPES = new Set([
  'hidden',
  'checkbox',
  'radio',
  'file',
  'button',
  'submit',
  'reset',
  'image',
  'color',
  'range',
]);

const FOCUSABLE_SELECTOR = [
  'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]):not([disabled]):not([readonly])',
  'textarea:not([disabled]):not([readonly])',
  'select:not([disabled]):not([readonly])',
].join(', ');

function isExcludedInput(input: HTMLInputElement): boolean {
  const type = (input.type || 'text').toLowerCase();
  return EXCLUDED_INPUT_TYPES.has(type) || input.disabled || input.readOnly;
}

function isVisible(el: HTMLElement): boolean {
  if (el.hidden || el.getAttribute('aria-hidden') === 'true') return false;
  const rects = el.getClientRects();
  if (rects.length === 0) return false;
  const style = window.getComputedStyle(el);
  return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
}

function getVisibleFocusables(container: HTMLElement): HTMLElement[] {
  const all = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  return all.filter((el) => isVisible(el) && !el.hasAttribute('disabled') && !el.hasAttribute('readonly'));
}

function getContainer(input: HTMLInputElement): HTMLElement {
  if (input.form) return input.form;
  const dialog = input.closest<HTMLElement>('[role="dialog"], [aria-modal="true"], [data-modal]');
  if (dialog) return dialog;
  const card = input.closest<HTMLElement>('.glass-card, [data-form-container]');
  if (card) {
    const focusables = getVisibleFocusables(card);
    if (focusables.length > 1) return card;
  }
  return input.closest<HTMLElement>('main') || document.body;
}

function syncEnterKeyHint(input: HTMLInputElement) {
  if (isExcludedInput(input)) return;
  // If author explicitly configured enterKeyHint (e.g. enterKeyHint="send" or dataset.keepEnterKeyHint), don't override
  if (input.dataset.keepEnterKeyHint || input.hasAttribute('data-custom-enter-hint')) {
    return;
  }

  const container = getContainer(input);
  const focusables = getVisibleFocusables(container);
  const idx = focusables.indexOf(input);

  if (idx !== -1 && idx < focusables.length - 1) {
    if (input.getAttribute('enterKeyHint') !== 'next') {
      input.setAttribute('enterKeyHint', 'next');
    }
  } else if (idx !== -1 && idx === focusables.length - 1) {
    if (!input.hasAttribute('enterKeyHint') || input.getAttribute('enterKeyHint') === 'next') {
      input.setAttribute('enterKeyHint', 'done');
    }
  }
}

/**
 * PwaInputEnterNavigator
 * En móviles y tablets (y formularios en general):
 * - Transforma el botón de salto de línea / Enter de los inputs en una acción tipo TAB hacia el siguiente input.
 * - Asigna dinámicamente enterKeyHint="next" al teclado virtual (o "done" en el último campo).
 * - Soporta Shift+Enter para retroceder al input anterior.
 */
export const PwaInputEnterNavigator: React.FC = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onFocusIn = (e: FocusEvent) => {
      const target = e.target;
      if (target instanceof HTMLInputElement) {
        syncEnterKeyHint(target);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.isComposing) return;
      if (e.defaultPrevented) return;

      const target = e.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (isExcludedInput(target)) return;
      if (target.dataset.preventEnterNext === 'true') return;

      const container = getContainer(target);
      const focusables = getVisibleFocusables(container);
      const currentIndex = focusables.indexOf(target);

      if (currentIndex === -1) return;

      // Shift+Enter -> Navegar hacia atrás (como Shift+Tab)
      if (e.shiftKey) {
        if (currentIndex > 0) {
          e.preventDefault();
          e.stopPropagation();
          const prev = focusables[currentIndex - 1];
          prev.focus();
          if (
            prev instanceof HTMLInputElement &&
            ['text', 'search', 'url', 'tel', 'email', 'number'].includes(prev.type)
          ) {
            try {
              prev.select();
            } catch {}
          }
          prev.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        return;
      }

      // Enter normal -> Acción TAB: saltar al siguiente input / campo
      if (currentIndex < focusables.length - 1) {
        e.preventDefault();
        e.stopPropagation();
        const next = focusables[currentIndex + 1];
        next.focus();
        if (
          next instanceof HTMLInputElement &&
          ['text', 'search', 'url', 'tel', 'email', 'number'].includes(next.type)
        ) {
          try {
            next.select();
          } catch {}
        }
        next.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        // Último input en el contenedor / formulario
        const submitBtn = container.querySelector<HTMLButtonElement>(
          'button[type="submit"], input[type="submit"]'
        );
        const isMobileOrTablet =
          window.innerWidth <= 1024 ||
          'ontouchstart' in window ||
          (navigator && navigator.maxTouchPoints > 0);

        if (isMobileOrTablet) {
          if (submitBtn && !submitBtn.disabled) {
            e.preventDefault();
            e.stopPropagation();
            submitBtn.click();
          } else {
            target.blur();
          }
        }
      }
    };

    // Escuchar focusin y keydown a nivel global
    document.addEventListener('focusin', onFocusIn, true);
    document.addEventListener('keydown', onKeyDown, false);

    // Observer para asignar enterKeyHint a inputs que se agreguen dinámicamente al DOM
    const observer = new MutationObserver(() => {
      const activeEl = document.activeElement;
      if (activeEl instanceof HTMLInputElement) {
        syncEnterKeyHint(activeEl);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('focusin', onFocusIn, true);
      document.removeEventListener('keydown', onKeyDown, false);
      observer.disconnect();
    };
  }, []);

  return null;
};
