'use client';

import React, { useState } from 'react';
import { JournalEntry } from '@/types';
import {
  X,
  Target,
  Sparkles,
  Trophy,
  Calendar,
  Edit3,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

interface JournalEntryDetailModalProps {
  entry: JournalEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

export const JournalEntryDetailModal: React.FC<JournalEntryDetailModalProps> = ({
  entry,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isManifestation = entry?.entryType === 'manifestation';
  const isProgress = entry?.entryType === 'progress';

  const formattedDate = entry
    ? format(new Date(entry.createdAt), "d 'de' MMMM, yyyy", { locale: es })
    : '';

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (!entry) return;
    onDelete(entry.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleEditClick = () => {
    if (!entry) return;
    onEdit(entry);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && entry && (
        <div
          onClick={onClose}
          data-testid="journal-detail-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-manifest-ink/35 backdrop-blur-sm"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            data-testid="journal-detail-modal"
            className="w-full max-w-lg relative p-6 sm:p-7 rounded-3xl sm:rounded-[2rem] bg-white border border-white/95 shadow-liquid space-y-4 max-h-[88dvh] overflow-y-auto select-none"
          >
          {/* Rampage-style decorative corner quotation marks */}
          <span
            aria-hidden="true"
            className="absolute top-2 left-4 font-serif text-5xl sm:text-6xl text-manifest-ink/[0.07] select-none pointer-events-none leading-none"
          >
            “
          </span>
          <span
            aria-hidden="true"
            className="absolute bottom-2 right-5 font-serif text-5xl sm:text-6xl text-manifest-ink/[0.07] select-none pointer-events-none leading-none"
          >
            ”
          </span>

          {/* Top Header: Badge with Outline Design & Respective Colored Icon + Close Button */}
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Type Badge in Outline Design */}
              {isManifestation ? (
                <span
                  data-testid="entry-type-manifestation"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide border border-manifest-auraPurple/50 bg-gradient-to-r from-manifest-pink/30 to-manifest-lavender/40 text-manifest-auraPurple shadow-sm"
                >
                  <Target className="w-3.5 h-3.5 text-manifest-auraPurple" />
                  <span>Manifestación</span>
                </span>
              ) : isProgress ? (
                <span
                  data-testid="entry-type-progress"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide border border-emerald-400/60 bg-manifest-mint/50 text-emerald-800 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Avance de manifestación</span>
                </span>
              ) : (
                <span
                  data-testid="entry-type-reflection"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide border border-amber-400/60 bg-amber-50 text-amber-800 shadow-sm"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-600" />
                  <span>Success Story</span>
                </span>
              )}

              {/* Author / Space Outline Badge */}
              <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-white/90 bg-white/75 text-manifest-inkMuted shadow-xs">
                {entry.userId === 'shared'
                  ? '✨ Juntos'
                  : entry.author || (entry.userId === 'facu' ? 'Facu' : 'Maia')}
              </span>

              {/* Formatted Date */}
              <span className="inline-flex items-center gap-1 text-[11px] text-manifest-inkMuted/80 font-medium">
                <Calendar className="w-3 h-3 text-manifest-inkMuted/60" />
                {formattedDate}
              </span>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              data-testid="close-detail-modal-btn"
              title="Cerrar vista de entrada"
              aria-label="Cerrar vista de entrada"
              className="p-1.5 -mr-1 -mt-1 rounded-full bg-white/70 hover:bg-white text-manifest-inkMuted hover:text-manifest-ink border border-white shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main Content Body */}
          <div className="space-y-3 relative z-10 pt-1 select-text">
            {entry.title &&
              entry.title !== 'Entrada de diario' &&
              !entry.content.trim().startsWith(entry.title.replace(/\.\.\.$/, '')) && (
                <h3 className="font-serif text-lg sm:text-xl font-bold text-manifest-ink leading-snug tracking-tight">
                  {entry.title}
                </h3>
              )}

            <div className="p-4 sm:p-5 rounded-2xl bg-white/60 border border-white/80 shadow-xs">
              <p className="text-xs sm:text-sm text-manifest-ink/90 leading-relaxed font-sans whitespace-pre-wrap select-text">
                {entry.content}
              </p>
            </div>

            {/* Tags (if present) */}
            {entry.tags && entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {entry.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-lg border border-manifest-lavender/50 bg-white/50 text-manifest-inkMuted"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Delete Inline Confirmation vs Normal Action Bar */}
          {showDeleteConfirm ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200/90 space-y-2.5 text-center relative z-10"
            >
              <div className="flex items-center justify-center gap-1.5 text-rose-700 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4" />
                <span>¿Deseas eliminar esta entrada definitivamente?</span>
              </div>
              <p className="text-[11px] text-rose-600/80">
                Esta acción no se puede deshacer.
              </p>
              <div className="flex items-center justify-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-white text-manifest-inkMuted hover:text-manifest-ink border border-rose-200 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  data-testid="confirm-delete-entry-btn"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  Sí, eliminar
                </button>
              </div>
            </motion.div>
          ) : (
            /* Bottom Action Bar: Eliminar & Editar buttons */
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/70 relative z-10">
              {/* Eliminar Button */}
              <button
                type="button"
                onClick={handleDeleteClick}
                data-testid="detail-delete-btn"
                title="Eliminar entrada de diario"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-rose-200/80 bg-rose-50/70 hover:bg-rose-100 text-rose-600 hover:text-rose-700 text-xs font-semibold active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar</span>
              </button>

              {/* Editar Button */}
              <button
                type="button"
                onClick={handleEditClick}
                data-testid="detail-edit-btn"
                title="Editar entrada de diario"
                className="flex items-center gap-1.5 px-4.5 py-2 rounded-2xl border border-manifest-auraPurple/40 bg-white/95 hover:bg-white text-manifest-ink text-xs font-semibold shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-manifest-auraPurple" />
                <span>Editar entrada</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
};
