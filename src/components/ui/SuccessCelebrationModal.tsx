'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, ArrowRight, Compass, X } from 'lucide-react';
import { useAppStore } from '@/store';

export const SuccessCelebrationModal: React.FC = () => {
  const { celebrationData, closeCelebration, openOracle } = useAppStore();

  if (!celebrationData) return null;

  const handleNextStep = () => {
    const callback = celebrationData.onNextStep;
    closeCelebration();
    if (callback) {
      callback();
    } else {
      // Default primary next step: open the Oracle roulette!
      openOracle();
    }
  };

  const handleSecondary = () => {
    const callback = celebrationData.onSecondary;
    closeCelebration();
    if (callback) callback();
  };

  return (
    <AnimatePresence>
      <div
        onClick={closeCelebration}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-manifest-ink/35 backdrop-blur-sm"
        data-testid="success-celebration-modal"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.88, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 16 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          style={{ backgroundColor: 'rgba(252, 250, 255, 0.97)' }}
          className="w-full max-w-sm rounded-[2.5rem] glass-card p-6 sm:p-7 border border-white shadow-liquid text-center space-y-4 relative overflow-hidden"
        >
          {/* Luminous micro-particles background */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <motion.div
              className="w-48 h-48 rounded-full bg-gradient-to-tr from-manifest-pink/30 via-manifest-lavender/40 to-manifest-celeste/30 blur-2xl"
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.6, 0.9, 0.6],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={closeCelebration}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/80 text-manifest-inkMuted hover:text-manifest-ink transition-colors cursor-pointer z-20"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Animated Glowing Check Badge */}
          <div className="relative z-10 w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-100 via-white to-manifest-lavender border border-white shadow-glass flex items-center justify-center">
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 450, damping: 22, delay: 0.1 }}
            >
              <Check className="w-8 h-8 text-emerald-600 stroke-[2.8]" />
            </motion.div>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-300 animate-ping" />
          </div>

          {/* Title & Micro-reward text */}
          <div className="relative z-10 space-y-1.5">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100/80 border border-amber-300/60 text-[10px] font-bold uppercase tracking-wider text-amber-800">
              <span>🏆 Hito de Conexión Desbloqueado</span>
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-manifest-ink">
              {celebrationData.title}
            </h3>
            <p className="text-xs text-manifest-inkMuted leading-relaxed max-w-xs mx-auto">
              {celebrationData.message}
            </p>

            {celebrationData.fragments && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-manifest-lavender/60 border border-manifest-auraPurple/30 text-[11px] font-bold text-manifest-auraPurple mt-1 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>+{celebrationData.fragments} Fragmentos de Éter anclados</span>
              </div>
            )}
          </div>

          {/* Two Clear Next-Step Actions */}
          <div className="relative z-10 pt-2 space-y-2">
            <button
              type="button"
              onClick={handleNextStep}
              data-testid="celebration-primary-cta"
              className="w-full py-3 px-4 rounded-2xl primary-gradient-btn text-xs font-bold shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>{celebrationData.nextStepLabel || 'Girar el Oráculo Cósmico'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleSecondary}
              data-testid="celebration-secondary-cta"
              className="w-full py-2.5 px-4 rounded-2xl text-xs font-semibold text-manifest-inkMuted hover:text-manifest-ink hover:bg-white/60 transition-colors cursor-pointer"
            >
              {celebrationData.secondaryLabel || 'Seguir en el Santuario'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
