'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, Info, Heart, CheckCircle2 } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAppStore();

  return (
    <div
      className="fixed top-3 left-0 right-0 z-50 flex flex-col items-center pointer-events-none px-4 space-y-2 select-none"
      data-testid="toast-container"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          let icon = <Sparkles className="w-4 h-4 text-manifest-auraPurple" />;
          let iconBg = 'bg-manifest-lavender/60 text-manifest-auraPurple';

          if (toast.type === 'success') {
            icon = <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />;
            iconBg = 'bg-emerald-100 text-emerald-600';
          } else if (toast.type === 'celebrate') {
            icon = <Sparkles className="w-3.5 h-3.5 text-amber-600" />;
            iconBg = 'bg-amber-100 text-amber-600';
          } else if (toast.type === 'info') {
            icon = <Info className="w-3.5 h-3.5 text-manifest-inkMuted" />;
            iconBg = 'bg-white/80 text-manifest-inkMuted';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 450, damping: 28 }}
              onClick={() => removeToast(toast.id)}
              className="pointer-events-auto cursor-pointer max-w-sm flex items-center gap-2.5 px-4 py-2 rounded-full glass-card border border-white/95 shadow-liquid text-xs sm:text-[13px] font-semibold text-manifest-ink backdrop-blur-xl bg-white/90 hover:bg-white active:scale-95 transition-all"
              data-testid="liquid-toast-capsule"
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-xs ${iconBg}`}>
                {icon}
              </div>
              <span className="truncate">{toast.text}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
