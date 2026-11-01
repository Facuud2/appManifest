'use client';

import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FormFieldProps {
  label: string;
  error?: string;
  isValid?: boolean;
  required?: boolean;
  badge?: string;
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  isValid = false,
  required = false,
  badge,
  className = '',
  children,
}) => {
  const isError = Boolean(error);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label line */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-manifest-ink flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-manifest-auraRose font-bold">*</span>}
        </label>
        {badge && (
          <span className="text-[10px] font-semibold text-manifest-auraPurple px-2 py-0.5 rounded-full bg-manifest-lavender/50 border border-manifest-auraPurple/30">
            {badge}
          </span>
        )}
      </div>

      {/* Field Container with relative positioning for right icons */}
      <div className="relative">
        {children}

        {/* Right Status Indicator (Check or Alert) */}
        <div className="absolute right-3 top-3 pointer-events-none flex items-center gap-1">
          <AnimatePresence mode="wait">
            {isError ? (
              <motion.div
                key="error-icon"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-5 h-5 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center shadow-xs"
              >
                <AlertCircle className="w-3.5 h-3.5 stroke-[2.5]" />
              </motion.div>
            ) : isValid ? (
              <motion.div
                key="valid-icon"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Smooth Height Error Message with Framer Motion */}
      <AnimatePresence>
        {isError && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-1.5 text-[11px] text-rose-500 font-medium pt-0.5 pl-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
