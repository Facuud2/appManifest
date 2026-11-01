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
}

export const AutoResizeTextarea = forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(({ minRows = 2, onChange, onInput, value, defaultValue, className = '', style, ...props }, ref) => {
  const innerRef = useRef<HTMLTextAreaElement | null>(null);

  useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);

  const resize = useCallback(() => {
    const el = innerRef.current;
    if (!el) return;

    const scrollParent = el.closest('.overflow-y-auto') as HTMLElement | null;
    const prevScrollTop = scrollParent ? scrollParent.scrollTop : null;

    el.style.height = 'auto';
    const nextHeight = Math.max(el.scrollHeight + 2, minRows * 24);
    el.style.height = `${nextHeight}px`;

    if (scrollParent && prevScrollTop !== null) {
      scrollParent.scrollTop = prevScrollTop;

      // If this textarea is currently focused, ensure its card stays fully visible inside the scroll container
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
  }, [minRows]);

  useEffect(() => {
    resize();
    // Secondary frame measurement in case modal animation or font layout finishes right after mount
    const raf = requestAnimationFrame(() => resize());
    return () => cancelAnimationFrame(raf);
  }, [value, defaultValue, resize]);

  useEffect(() => {
    // Initial resize on mount
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

  return (
    <textarea
      ref={innerRef}
      rows={minRows}
      value={value}
      defaultValue={defaultValue}
      onChange={handleChange}
      onInput={handleInput}
      style={{
        resize: 'none',
        overflow: 'hidden',
        boxSizing: 'border-box',
        ...style,
      }}
      className={`resize-none overflow-hidden leading-relaxed ${className}`}
      {...props}
    />
  );
});

AutoResizeTextarea.displayName = 'AutoResizeTextarea';
