'use client';

import React, {
  useEffect,
  useCallback,
  useRef,
  useImperativeHandle,
  forwardRef,
  TextareaHTMLAttributes,
} from 'react';

export interface AutoResizeTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number;
  maxHeight?: number;
}

export const AutoResizeTextarea = forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(
  (
    {
      minRows = 2,
      maxHeight = 240,
      onChange,
      onInput,
      onFocus,
      value,
      defaultValue,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);
    const isMountedRef = useRef(false);

    useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);

    const resize = useCallback(() => {
      const el = innerRef.current;
      if (!el) return;

      const scrollParent = el.closest('.overflow-y-auto') as HTMLElement | null;
      const prevScrollTop = scrollParent ? scrollParent.scrollTop : null;
      const effectiveMaxHeight = maxHeight ?? 240;

      if (!isMountedRef.current) {
        el.style.transition = 'none';
        el.style.height = '0px';
        const rawScrollHeight = el.scrollHeight;
        const nextHeight = Math.min(
          Math.max(rawScrollHeight + 2, minRows * 24),
          effectiveMaxHeight
        );
        el.style.height = `${nextHeight}px`;
        el.style.overflowY = rawScrollHeight > effectiveMaxHeight ? 'auto' : 'hidden';
        isMountedRef.current = true;
        return;
      }

      const prevHeight = el.style.height;

      // Accurately measure content height without snapping
      el.style.transition = 'none';
      el.style.height = '0px';
      const rawScrollHeight = el.scrollHeight;

      if (prevHeight && prevHeight !== '0px') {
        el.style.height = prevHeight;
        void el.offsetHeight; // Force reflow to establish starting height for transition
      }

      const nextHeight = Math.min(
        Math.max(rawScrollHeight + 2, minRows * 24),
        effectiveMaxHeight
      );

      el.style.transition = 'height 160ms cubic-bezier(0.22, 1, 0.36, 1)';
      el.style.height = `${nextHeight}px`;
      el.style.overflowY = rawScrollHeight > effectiveMaxHeight ? 'auto' : 'hidden';

      if (scrollParent && prevScrollTop !== null) {
        scrollParent.scrollTop = prevScrollTop;

        // Si este textarea está enfocado, asegurar que permanezca visible dentro del scroll container
        if (typeof document !== 'undefined' && document.activeElement === el) {
          const cardEl = (el.closest('[data-rampage-card]') as HTMLElement) || el;
          const cardRect = cardEl.getBoundingClientRect();
          const parentRect = scrollParent.getBoundingClientRect();

          if (cardRect.bottom > parentRect.bottom - 12) {
            scrollParent.scrollTop += cardRect.bottom - parentRect.bottom + 16;
          } else if (cardRect.top < parentRect.top + 12) {
            scrollParent.scrollTop -= parentRect.top - cardRect.top + 16;
          }
        }
      }
    }, [minRows, maxHeight]);

    useEffect(() => {
      resize();
      const raf = requestAnimationFrame(() => resize());
      return () => cancelAnimationFrame(raf);
    }, [value, defaultValue, resize]);

    useEffect(() => {
      resize();
      const timer = setTimeout(resize, 60);
      const handleWindowResize = () => resize();
      window.addEventListener('resize', handleWindowResize);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', handleWindowResize);
      };
    }, [resize]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      resize();
      if (onChange) onChange(e);
    };

    const handleInput: React.FormEventHandler<HTMLTextAreaElement> = (e) => {
      resize();
      if (onInput) (onInput as any)(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      const target = e.target;
      setTimeout(() => {
        if (target && typeof target.scrollIntoView === 'function') {
          target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 150);
      if (onFocus) onFocus(e);
    };

    return (
      <textarea
        ref={innerRef}
        rows={minRows}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        onInput={handleInput}
        onFocus={handleFocus}
        data-vaul-no-drag=""
        style={{
          resize: 'none',
          boxSizing: 'border-box',
          ...style,
        }}
        className={`resize-none leading-relaxed overscroll-contain touch-pan-y ${className}`}
        {...props}
      />
    );
  }
);

AutoResizeTextarea.displayName = 'AutoResizeTextarea';
