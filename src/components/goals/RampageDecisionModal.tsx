'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trash2, Flame, Layers, CheckCircle2, X } from 'lucide-react';
import { IOS_TAP_SPRING, LIQUID_GLASS_SPECULAR } from '@/lib/iosSprings';

interface RampageDecisionModalProps {
  isOpen: boolean;
  title: string;
  totalAffirmations: number;
  totalRepeats: number;
  onSave: () => void;
  onDiscard: () => void;
  onClose: () => void;
}

export const RampageDecisionModal: React.FC<RampageDecisionModalProps> = ({
  isOpen,
  title,
  totalAffirmations,
  totalRepeats,
  onSave,
  onDiscard,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          data-testid="rampage-decision-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/35 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="relative z-10 w-full max-w-md rounded-[2rem] liquid-glass-surface bg-manifest-surfaceElevated p-6 sm:p-7 shadow-lens border border-manifest-glassBorder space-y-5 text-center"
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-manifest-inkMuted hover:text-manifest-ink hover:bg-manifest-glassControlHover transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Glowing Icon */}
            <div className="mx-auto w-14 h-14 rounded-2xl bg-manifest-glassControl border border-manifest-glassBorder flex items-center justify-center shadow-sm">
              <Sparkles className="w-7 h-7 text-manifest-auraPurple" />
            </div>

            {/* Titles */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-manifest-auraPurple block">
                Sesión de Rampage Finalizada
              </span>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-manifest-ink">
                “{title}”
              </h3>
              <p className="text-xs text-manifest-inkMuted">
                ¿Deseas guardar este set generado por IA en tu santuario personal?
              </p>
            </div>

            {/* Metrics Pill Grid */}
            <div className="grid grid-cols-2 gap-2.5 py-1">
              <div className="p-3 rounded-2xl bg-manifest-glassControl border border-manifest-glassBorder shadow-xs flex flex-col items-center justify-center">
                <div className="flex items-center gap-1 text-manifest-auraPurple mb-0.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold text-manifest-ink">
                    {totalAffirmations}
                  </span>
                </div>
                <span className="text-[10px] text-manifest-inkMuted">
                  Afirmaciones creadas
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-manifest-glassControl border border-manifest-glassBorder shadow-xs flex flex-col items-center justify-center">
                <div className="flex items-center gap-1 text-amber-500 mb-0.5">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="text-xs font-bold text-manifest-ink">
                    {totalRepeats}
                  </span>
                </div>
                <span className="text-[10px] text-manifest-inkMuted">
                  Repeticiones totales
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              {/* Botón Principal: Guardar */}
              <motion.button
                type="button"
                whileTap={IOS_TAP_SPRING}
                onClick={onSave}
                data-testid="save-rampage-set-btn"
                className="w-full py-3 px-4 rounded-2xl primary-gradient-btn text-xs sm:text-sm font-semibold shadow-glass cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Guardar Set en mi Santuario ✨</span>
              </motion.button>

              {/* Botón Secundario Destructivo: Descartar */}
              <motion.button
                type="button"
                whileTap={IOS_TAP_SPRING}
                onClick={onDiscard}
                data-testid="discard-rampage-set-btn"
                className="w-full py-2.5 px-4 rounded-2xl bg-rose-100/70 hover:bg-rose-100 text-rose-700 border border-rose-300/60 text-xs font-semibold cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-neu-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Descartar este Rampage 🗑️</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
