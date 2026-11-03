'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Check, Sparkles } from 'lucide-react';

interface SynchronicityOtpInputProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

const PRESETS = ['11:11', '22:22', '333', '444', '777', '888'];

export const SynchronicityOtpInput: React.FC<SynchronicityOtpInputProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const [activeDigits, setActiveDigits] = useState<string[]>([]);
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [lastAutoFilledPreset, setLastAutoFilledPreset] = useState<string>('');

  // Synchronize initial value if present
  useEffect(() => {
    if (value && activeDigits.length === 0) {
      setActiveDigits(value.split(''));
    }
  }, [value, activeDigits.length]);

  const handleCascadeAutoFill = (preset: string) => {
    const chars = preset.split('');
    setActiveDigits(new Array(chars.length).fill(''));
    setIsCompleted(false);
    setLastAutoFilledPreset(preset);

    chars.forEach((char, idx) => {
      setTimeout(() => {
        setAnimatingIndex(idx);
        setActiveDigits((prev) => {
          const next = [...prev];
          next[idx] = char;
          return next;
        });

        // Last character completed
        if (idx === chars.length - 1) {
          setTimeout(() => {
            setAnimatingIndex(null);
            setIsCompleted(true);
            onChange(preset);
          }, 110);
        }
      }, idx * 110);
    });
  };

  const displaySlots = activeDigits.length > 0 ? activeDigits : ['', '', '', ''];

  return (
    <div
      data-testid="synchronicity-otp-container"
      className={`p-3.5 rounded-2xl bg-gradient-to-br from-purple-50/60 via-white/80 to-cyan-50/40 border border-purple-200/80 shadow-[0_4px_20px_rgba(139,92,246,0.08)] space-y-3 ${className}`}
    >
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Sincronicidad Numérica</span>
        </label>
        {isCompleted && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[11px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full inline-flex items-center gap-1"
          >
            <Check className="w-3 h-3 stroke-[2.5]" />
            <span>Sintonizado</span>
          </motion.span>
        )}
      </div>

      {/* Row of OTP Digit Boxes */}
      <div className="flex items-center justify-center gap-2 py-1">
        {displaySlots.map((digit, idx) => {
          const isColon = digit === ':';
          const isCurrentAnimating = animatingIndex === idx;

          if (isColon) {
            return (
              <span
                key={`colon-${idx}`}
                className="text-lg font-bold text-purple-600 px-0.5 select-none"
              >
                :
              </span>
            );
          }

          return (
            <motion.div
              key={idx}
              data-testid={`otp-digit-${idx}`}
              animate={
                isCurrentAnimating
                  ? { scale: [1, 1.15, 1.06] }
                  : digit
                  ? { scale: 1 }
                  : { scale: 1 }
              }
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className={`w-11 h-12 rounded-xl flex items-center justify-center text-lg font-mono font-bold select-none transition-all ${
                digit
                  ? 'bg-white text-purple-900 border-2 border-purple-500 shadow-[0_4px_16px_rgba(139,92,246,0.25)]'
                  : 'bg-white/60 text-slate-400 border border-purple-200/60 shadow-xs'
              }`}
            >
              {digit || '·'}
            </motion.div>
          );
        })}
      </div>

      {/* Quick Pills for Cascade Auto-Fill */}
      <div className="space-y-1.5 pt-0.5">
        <span className="text-[11px] text-slate-500 block">
          Píldoras rápidas de auto-llenado:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((preset) => {
            const isSelected = lastAutoFilledPreset === preset && isCompleted;
            return (
              <motion.button
                key={preset}
                type="button"
                data-testid={`autofill-pill-${preset.replace(':', '-')}`}
                whileTap={{ scale: 0.94 }}
                onClick={() => handleCascadeAutoFill(preset)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all inline-flex items-center gap-1 ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-[0_2px_10px_rgba(147,51,234,0.35)]'
                    : 'bg-white/80 hover:bg-purple-100/70 text-purple-800 border border-purple-200/70 shadow-xs'
                }`}
              >
                <Zap className="w-3 h-3 text-amber-500" />
                <span>⚡ Auto-llenar {preset}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
