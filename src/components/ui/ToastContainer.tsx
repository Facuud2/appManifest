'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, Info, Heart } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAppStore();

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex flex-col items-center pointer-events-none px-4 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => {
          let icon = <Sparkles className="w-4 h-4 text-manifest-auraPurple" />;
          if (toast.type === 'success') {
            icon = <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
          } else if (toast.type === 'celebrate') {
            icon = <Heart className="w-4 h-4 text-manifest-auraRose fill-manifest-auraRose" />;
          } else if (toast.type === 'info') {
            icon = <Info className="w-4 h-4 text-manifest-inkMuted" />;
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => removeToast(toast.id)}
              className="pointer-events-auto cursor-pointer max-w-sm flex items-center gap-2.5 px-4 py-2.5 rounded-2xl glass-card border border-white/90 shadow-glass text-xs md:text-sm font-medium text-manifest-ink"
            >
              <div className="p-1 rounded-full bg-white/80 shrink-0">{icon}</div>
              <span>{toast.text}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
