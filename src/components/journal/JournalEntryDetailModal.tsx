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
  Moon,
  Heart,
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
  const isReflection = !isManifestation && !isProgress;

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

  // Determine if title is distinct from content
  const hasDistinctTitle =
    entry?.title &&
    entry.title !== 'Entrada de diario' &&
    !entry.content.trim().startsWith(entry.title.replace(/\.\.\.$/, ''));

  const wordCount = entry?.content ? entry.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const isShortQuote = (entry?.content?.length || 0) < 180;

  return (
    <AnimatePresence>
      {isOpen && entry && (
        <div
          onClick={onClose}
          data-testid="journal-detail-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-5 bg-manifest-ink/40 backdrop-blur-md"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            data-testid="journal-detail-modal"
            className="w-full max-w-lg relative rounded-3xl sm:rounded-[2.25rem] bg-white/90 backdrop-blur-2xl border border-white/95 shadow-[0_24px_60px_-12px_rgba(73,62,85,0.22),0_0_0_1px_rgba(255,255,255,0.9)] p-5 sm:p-7 space-y-4 max-h-[88dvh] overflow-y-auto select-none overflow-hidden"
          >
            {/* Atmospheric Aura Glow according to entry type */}
            <div
              aria-hidden="true"
              className={`absolute -top-24 -right-24 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-50 ${
                isManifestation
                  ? 'bg-gradient-to-br from-manifest-pink/40 via-manifest-lavender/50 to-manifest-celeste/30'
                  : isProgress
                  ? 'bg-gradient-to-br from-manifest-mint/50 via-emerald-200/40 to-teal-100/30'
                  : 'bg-gradient-to-br from-amber-200/60 via-yellow-100/50 to-orange-100/30'
              }`}
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-35 bg-gradient-to-tr from-manifest-lavender/40 to-transparent"
            />

            {/* Top Header: Badge, Author & Close Button */}
            <div className="relative z-10 flex items-start justify-between gap-3">
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Type Badge with Outline Design */}
                  {isManifestation ? (
                    <span
                      data-testid="entry-type-manifestation"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide border border-manifest-auraPurple/50 bg-gradient-to-r from-manifest-pink/30 to-manifest-lavender/40 text-manifest-auraPurple shadow-sm"
                    >
                      <Target className="w-3.5 h-3.5 text-manifest-auraPurple shrink-0" />
                      <span>Manifestación</span>
                    </span>
                  ) : isProgress ? (
                    <span
                      data-testid="entry-type-progress"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide border border-emerald-400/60 bg-manifest-mint/50 text-emerald-800 shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Avance de manifestación</span>
                    </span>
                  ) : (
                    <span
                      data-testid="entry-type-reflection"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide border border-amber-400/70 bg-gradient-to-r from-amber-100/80 to-yellow-50/80 text-amber-900 shadow-sm"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Success Story</span>
                    </span>
                  )}

                  {/* Author / Space Outline Badge */}
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-white/90 bg-white/80 text-manifest-ink shadow-xs">
                    {entry.userId === 'shared' ? (
                      <>
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Juntos</span>
                      </>
                    ) : entry.userId === 'maia' ? (
                      <>
                        <Heart className="w-3 h-3 text-rose-400" />
                        <span>{entry.author || 'Maia'}</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-3 h-3 text-manifest-auraPurple" />
                        <span>{entry.author || 'Facu'}</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Date & Info metadata */}
                <div className="flex items-center gap-3 text-[11px] text-manifest-inkMuted px-0.5">
                  <span className="inline-flex items-center gap-1 font-medium">
                    <Calendar className="w-3 h-3 text-manifest-inkMuted/70" />
                    {formattedDate}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-manifest-inkMuted/40" />
                  <span className="font-medium text-manifest-inkMuted/80">
                    {wordCount} {wordCount === 1 ? 'palabra' : 'palabras'}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                data-testid="close-detail-modal-btn"
                title="Cerrar vista de entrada"
                aria-label="Cerrar vista de entrada"
                className="p-1.5 rounded-full bg-white/80 hover:bg-white text-manifest-inkMuted hover:text-manifest-ink border border-white shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Rampage Protagonist Card: Sacred Aesthetic with 4 Corner Quotation Marks */}
            <div
              className={`relative z-10 w-full rounded-2xl sm:rounded-3xl p-6 sm:p-8 border shadow-[0_8px_30px_rgba(73,62,85,0.05),inset_0_1px_3px_rgba(255,255,255,0.9)] backdrop-blur-md transition-all ${
                isManifestation
                  ? 'border-manifest-auraPurple/25 bg-gradient-to-b from-white/95 via-white/85 to-manifest-lavender/25'
                  : isProgress
                  ? 'border-emerald-400/30 bg-gradient-to-b from-white/95 via-white/85 to-manifest-mint/25'
                  : 'border-amber-400/35 bg-gradient-to-b from-white/95 via-white/85 to-amber-100/30'
              }`}
            >
              {/* Corner Decorative Quotation Marks (4 corners) */}
              <span
                aria-hidden="true"
                className="absolute top-3.5 left-4 font-serif text-3xl sm:text-4xl text-manifest-ink/20 select-none pointer-events-none leading-none"
              >
                “
              </span>
              <span
                aria-hidden="true"
                className="absolute top-3.5 right-4 font-serif text-3xl sm:text-4xl text-manifest-ink/20 select-none pointer-events-none leading-none rotate-180"
              >
                “
              </span>
              <span
                aria-hidden="true"
                className="absolute bottom-3.5 left-4 font-serif text-3xl sm:text-4xl text-manifest-ink/20 select-none pointer-events-none leading-none rotate-180"
              >
                ”
              </span>
              <span
                aria-hidden="true"
                className="absolute bottom-3.5 right-4 font-serif text-3xl sm:text-4xl text-manifest-ink/20 select-none pointer-events-none leading-none"
              >
                ”
              </span>

              {/* Main Content Body */}
              <div className="relative z-10 py-1 sm:py-2 px-2 sm:px-5 space-y-3">
                {hasDistinctTitle && (
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-manifest-ink tracking-tight text-center leading-snug">
                    {entry.title}
                  </h3>
                )}

                <p
                  className={`font-serif text-manifest-ink leading-relaxed tracking-tight select-text whitespace-pre-wrap ${
                    isShortQuote
                      ? 'text-base sm:text-lg md:text-xl font-bold text-center'
                      : 'text-sm sm:text-base font-semibold text-center sm:text-left'
                  }`}
                >
                  {entry.content}
                </p>
              </div>

              {/* Tags inside card if present */}
              {entry.tags && entry.tags.length > 0 && (
                <div className="relative z-10 flex flex-wrap items-center justify-center gap-1.5 pt-3 border-t border-manifest-ink/[0.06] mt-3">
                  {entry.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-white/80 border border-white text-manifest-inkMuted shadow-2xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions or Delete Confirmation Bar */}
            {showDeleteConfirm ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200/90 space-y-2.5 text-center relative z-10"
              >
                <div className="flex items-center justify-center gap-1.5 text-rose-700 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>¿Deseas eliminar esta entrada definitivamente?</span>
                </div>
                <p className="text-[11px] text-rose-600/80">
                  Esta acción no se puede deshacer.
                </p>
                <div className="flex items-center justify-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium bg-white text-manifest-inkMuted hover:text-manifest-ink border border-rose-200 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    data-testid="confirm-delete-entry-btn"
                    className="px-4.5 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 shadow-sm active:scale-95 transition-all cursor-pointer"
                  >
                    Sí, eliminar
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-manifest-ink/[0.06] relative z-10">
                {/* Eliminar Button */}
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  data-testid="detail-delete-btn"
                  title="Eliminar entrada de diario"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-rose-200/80 bg-rose-50/70 hover:bg-rose-100 text-rose-600 hover:text-rose-700 text-xs font-semibold active:scale-95 transition-all cursor-pointer shadow-xs"
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
                  className="flex items-center gap-1.5 px-5 py-2 rounded-2xl primary-gradient-btn text-manifest-ink text-xs font-semibold shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-manifest-ink" />
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
