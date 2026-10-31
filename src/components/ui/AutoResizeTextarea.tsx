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
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, minRows * 24)}px`;
  }, [minRows]);

  useEffect(() => {
    resize();
  }, [value, defaultValue, resize]);

  useEffect(() => {
    // Initial resize on mount
    resize();
    const handleWindowResize = () => resize();
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
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
      className={`resize-none overflow-hidden transition-[height] duration-75 ${className}`}
      {...props}
    />
  );
});

AutoResizeTextarea.displayName = 'AutoResizeTextarea';
