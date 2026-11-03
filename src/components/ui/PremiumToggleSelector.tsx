'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export interface ToggleSelectorOption {
  key: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  emoji?: string;
  accentColor?: string;
}

interface PremiumToggleSelectorProps {
  options: ToggleSelectorOption[];
  value: string;
  onChange: (val: any) => void;
  dropDirection?: 'up' | 'down';
  layoutIdPrefix?: string;
  className?: string;
  buttonClassName?: string;
  title?: string;
}

export const PremiumToggleSelector: React.FC<PremiumToggleSelectorProps> = ({
  options,
  value,
  onChange,
  dropDirection = 'down',
  layoutIdPrefix = 'toggle-selector',
  className = '',
  buttonClassName = '',
  title = 'Seleccionar contexto',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('pointerdown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
    };
  }, [isOpen]);

  const activeOption = options.find((opt) => opt.key === value) || options[0];
  const ActiveIcon = activeOption?.icon;

  const handleSelectOption = (key: string) => {
    onChange(key);
    // Smooth auto-collapse after pill slides
    setTimeout(() => {
      setIsOpen(false);
    }, 220);
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${className}`}
      data-testid="premium-toggle-selector"
    >
      {/* Botón Disparador Píldora Cápsula */}
      <motion.button
        type="button"
        data-testid="toggle-selector-trigger"
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        title={title}
        aria-expanded={isOpen}
        className={`px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-xl border border-purple-200/80 shadow-[0_2px_10px_rgba(139,92,246,0.08),inset_0_1px_1px_rgba(255,255,255,0.8)] hover:bg-white text-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${buttonClassName}`}
      >
        {ActiveIcon ? (
          <ActiveIcon className="w-3.5 h-3.5 text-purple-600 shrink-0" />
        ) : activeOption?.emoji ? (
          <span className="text-xs select-none">{activeOption.emoji}</span>
        ) : null}
        <span className="tracking-tight select-none">{activeOption?.label}</span>
        <ChevronDown
          className="w-3.5 h-3.5 text-slate-500 transition-transform duration-350 shrink-0"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </motion.button>

      {/* Cápsula Flotante Desplegable */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            data-testid="toggle-selector-dropdown"
            initial={{ opacity: 0, scale: 0.85, y: dropDirection === 'up' ? 6 : -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: dropDirection === 'up' ? 4 : -4 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute z-50 rounded-full p-1.5 bg-white/95 backdrop-blur-xl shadow-[0_14px_32px_rgba(0,0,0,0.12),0_4px_16px_rgba(139,92,246,0.15)] border border-purple-100 flex items-center gap-1 whitespace-nowrap ${
              dropDirection === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
            } right-0 sm:right-auto sm:left-0`}
          >
            {options.map((opt) => {
              const isSelected = opt.key === value;
              const OptIcon = opt.icon;

              return (
                <button
                  key={opt.key}
                  type="button"
                  data-testid={`toggle-option-${opt.key}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelectOption(opt.key);
                  }}
                  className={`relative z-10 px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors inline-flex items-center gap-1.5 select-none ${
                    isSelected
                      ? 'text-purple-900 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {/* Slider Interno Deslizante (layoutId con cubic-bezier) */}
                  {isSelected && (
                    <motion.div
                      layoutId={`${layoutIdPrefix}-active-slider`}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-100 via-pink-50 to-cyan-50 border border-purple-300/70 shadow-xs -z-10"
                    />
                  )}

                  {OptIcon ? (
                    <OptIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-purple-600' : 'text-slate-500'}`} />
                  ) : opt.emoji ? (
                    <span className="text-xs">{opt.emoji}</span>
                  ) : null}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
