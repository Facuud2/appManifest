'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';

export interface PremiumDeleteModalProps {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
  pillNotice?: string;
  itemPreviewText?: string;
  itemPreviewTitle?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const PremiumDeleteModal: React.FC<PremiumDeleteModalProps> = ({
  isOpen,
  title = '¿Eliminar esta afirmación?',
  subtitle = 'Esta acción retirará de forma permanente este decreto de tu altar personal.',
  pillNotice = 'Esta acción liberará este decreto de tu santuario',
  itemPreviewText,
  itemPreviewTitle,
  confirmLabel = 'Sí, eliminar',
  cancelLabel = 'Conservar',
  onConfirm,
  onCancel,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          data-testid="premium-delete-modal-backdrop"
          onClick={onCancel}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
        >
          <motion.div
            data-testid="premium-delete-modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320, mass: 0.75 }}
            className="w-full max-w-sm rounded-3xl bg-white/95 backdrop-blur-2xl p-6 border border-rose-100/80 shadow-[0_20px_50px_rgba(30,20,50,0.22)] space-y-4 relative overflow-hidden"
          >
            {/* Top Specular Edge Glow */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF5E7E]/40 to-transparent pointer-events-none" />

            {/* Icono Superior Flotante: 58x58 rounded-2xl coral/rosa pastel con levitación continua */}
            <div className="flex flex-col items-center text-center pt-1">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-[58px] h-[58px] rounded-2xl bg-gradient-to-br from-[#FF5E7E] to-[#FF8A65] shadow-[0_10px_25px_rgba(255,94,126,0.35)] flex items-center justify-center text-white relative group"
              >
                <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Trash2 className="w-6 h-6 stroke-[2.2] drop-shadow-sm" />
                <Sparkles className="w-3.5 h-3.5 text-amber-200 absolute -top-1 -right-1 drop-shadow" />
              </motion.div>

              {/* Título y Subtítulo */}
              <div className="mt-3.5 space-y-1">
                <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed px-2">
                  {subtitle}
                </p>
              </div>

              {/* Píldora de Aviso Suave */}
              <div className="mt-2.5">
                <span className="bg-rose-50/90 border border-rose-200/70 text-rose-700 rounded-full px-3.5 py-1.5 text-xs font-medium inline-flex items-center gap-1.5 shadow-xs">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="tracking-tight">{pillNotice}</span>
                </span>
              </div>
            </div>

            {/* Quote Preview Card */}
            {(itemPreviewText || itemPreviewTitle) && (
              <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 shadow-inner">
                {itemPreviewTitle && (
                  <p className="text-xs font-semibold text-slate-900 line-clamp-1 mb-0.5">
                    {itemPreviewTitle}
                  </p>
                )}
                {itemPreviewText && (
                  <p className="text-xs font-serif italic text-slate-700 line-clamp-3 leading-relaxed">
                    “{itemPreviewText}”
                  </p>
                )}
              </div>
            )}

            {/* Botones de Acción Duales */}
            <div className="flex items-center justify-between gap-3 pt-2">
              {/* Botón Secundario: Conservar */}
              <button
                type="button"
                data-testid="delete-modal-cancel-btn"
                onClick={onCancel}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100/80 text-slate-600 font-medium text-xs hover:bg-slate-200/70 hover:text-slate-800 transition-all active:scale-95 cursor-pointer text-center"
              >
                {cancelLabel}
              </button>

              {/* Botón Principal: Sí, eliminar */}
              <motion.button
                type="button"
                data-testid="delete-modal-confirm-btn"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={onConfirm}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FF5E7E] to-[#FF416C] text-white font-medium text-xs shadow-[0_10px_22px_rgba(255,65,108,0.28)] hover:shadow-[0_12px_26px_rgba(255,65,108,0.36)] transition-shadow cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{confirmLabel}</span>
                <Trash2 className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
