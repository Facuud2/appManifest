'use client';

import React, { useState, useEffect } from 'react';
import { Drawer } from 'vaul';
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
import { IOS_TAP_SPRING, LIQUID_GLASS_SPECULAR } from '@/lib/iosSprings';
import { useIsDesktop } from '@/hooks/useIsDesktop';

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
  const isDesktop = useIsDesktop();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDeleteConfirm(false);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  const hasDistinctTitle =
    entry?.title &&
    entry.title !== 'Entrada de diario' &&
    !entry.content.trim().startsWith(entry.title.replace(/\.\.\.$/, ''));

  const wordCount = entry?.content ? entry.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const isShortQuote = (entry?.content?.length || 0) < 180;

  // ==========================================
  // VISTA PC: Pop-up centrado estilo macOS
  // ==========================================
  if (isDesktop) {
    return (
      <AnimatePresence>
        {isOpen && entry && (
          <div
            data-testid="journal-detail-backdrop"
            onClick={() => {
              setShowDeleteConfirm(false);
              onClose();
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-manifest-ink/35 backdrop-blur-md"
          >
            <motion.div
              data-testid="journal-detail-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30, mass: 0.8 }}
              className="w-full max-w-xl rounded-3xl bg-[#FCFAF8]/95 backdrop-blur-2xl border border-white/90 shadow-[0_24px_70px_rgba(40,30,60,0.22),0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.95)] flex flex-col max-h-[88vh] overflow-hidden relative"
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

              {/* Modal Header */}
              <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-manifest-ink/[0.07] bg-white/60 backdrop-blur-md select-none z-10">
                <div className="flex items-center gap-2">
                  {isManifestation ? (
                    <span
                      data-testid="entry-type-manifestation"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide border border-manifest-auraPurple/50 bg-gradient-to-r from-manifest-pink/30 to-manifest-lavender/40 text-manifest-auraPurple shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>Manifestación</span>
                    </span>
                  ) : isProgress ? (
                    <span
                      data-testid="entry-type-progress"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide border border-emerald-400/60 bg-gradient-to-r from-manifest-mint/40 to-emerald-100/50 text-emerald-800 shadow-xs"
                    >
                      <Target className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                      <span>Avance de manifestación</span>
                    </span>
                  ) : (
                    <span
                      data-testid="entry-type-reflection"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide border border-amber-400/70 bg-gradient-to-r from-amber-100/80 to-yellow-50/80 text-amber-900 shadow-xs"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Success Story</span>
                    </span>
                  )}
                </div>

                {/* Right Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    onClose();
                  }}
                  data-testid="close-detail-modal-btn"
                  className="p-1.5 rounded-xl text-manifest-inkMuted hover:text-manifest-ink hover:bg-manifest-ink/5 transition-colors cursor-pointer"
                  title="Cerrar (Esc)"
                  aria-label="Cerrar ventana"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Entry Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-4 relative z-10">
                {/* Author & Date metadata */}
                <div className="flex items-center justify-between pb-2 border-b border-manifest-ink/[0.06]">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border border-white/90 bg-white/80 text-manifest-ink shadow-xs">
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

                  <div className="flex items-center gap-3 text-xs text-manifest-inkMuted">
                    <span className="inline-flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-manifest-inkMuted/70" />
                      {formattedDate}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-manifest-inkMuted/40" />
                    <span>{wordCount} {wordCount === 1 ? 'palabra' : 'palabras'}</span>
                  </div>
                </div>

                {/* Entry Title if distinct */}
                {hasDistinctTitle && (
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-manifest-ink leading-snug">
                    {entry.title}
                  </h2>
                )}

                {/* Content Box */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white/70 border border-white/90 shadow-sm">
                  <p
                    className={`selectable-text whitespace-pre-wrap leading-relaxed text-manifest-ink select-text font-serif ${
                      isShortQuote ? 'text-base sm:text-lg italic font-medium' : 'text-sm sm:text-base font-normal'
                    }`}
                  >
                    {entry.content}
                  </p>
                </div>
              </div>

              {/* Mac Dialog Footer / Actions */}
              <div className="shrink-0 px-6 py-4 bg-manifest-ink/[0.02] border-t border-manifest-ink/[0.07] relative z-10">
                {showDeleteConfirm ? (
                  <div className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200/90 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-rose-700 text-xs font-semibold">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>¿Eliminar esta entrada definitivamente? Esta acción no se puede deshacer.</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
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
                        className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 shadow-sm transition-colors cursor-pointer"
                      >
                        Sí, eliminar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleDeleteClick}
                      data-testid="detail-delete-btn"
                      title="Eliminar entrada de diario"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200/80 bg-rose-50/70 hover:bg-rose-100 text-rose-600 hover:text-rose-700 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleEditClick}
                      data-testid="detail-edit-btn"
                      title="Editar entrada de diario"
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl primary-gradient-btn text-manifest-ink text-xs font-semibold shadow-sm cursor-pointer hover:opacity-95 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-manifest-ink" />
                      <span>Editar entrada</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  // ==========================================
  // VISTA MÓVIL: Drawer nativo iOS (Vaul)
  // ESTRICTAMENTE INTACTO PARA DISPOSITIVOS MÓVILES
  // ==========================================
  return (
    <Drawer.Root
      open={isOpen && Boolean(entry)}
      onOpenChange={(open) => {
        if (!open) {
          setShowDeleteConfirm(false);
          onClose();
        }
      }}
      handleOnly
      repositionInputs={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay
          data-testid="journal-detail-backdrop"
          className="fixed inset-0 z-50 bg-manifest-ink/40 backdrop-blur-md"
        />
        <Drawer.Content
          data-testid="journal-detail-modal"
          className={`fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-lg rounded-t-[2.25rem] ${LIQUID_GLASS_SPECULAR} bg-white/90 p-5 sm:p-7 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-12px_48px_rgba(73,62,85,0.2)] outline-none flex flex-col max-h-[90dvh] overflow-y-auto overscroll-contain touch-pan-y select-none overflow-hidden`}
          data-vaul-no-drag=""
        >
          {/* iOS Native Grabber Handle */}
          <Drawer.Handle
            data-testid="ios-sheet-grabber"
            className="mx-auto w-12 h-1.5 shrink-0 rounded-full bg-manifest-ink/20 mb-4 cursor-grab active:cursor-grabbing relative z-10"
          />

          <Drawer.Title className="sr-only">
            {entry?.title || 'Detalle de entrada de diario'}
          </Drawer.Title>
          <Drawer.Description className="sr-only">
            Vista inmersiva de lectura de tu entrada de diario
          </Drawer.Description>

          {entry && (
            <div className="space-y-4 relative z-10">
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

              {/* Top Header: Badge, Author & Close Button */}
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {isManifestation ? (
                      <span
                        data-testid="entry-type-manifestation"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide border border-manifest-auraPurple/50 bg-gradient-to-r from-manifest-pink/30 to-manifest-lavender/40 text-manifest-auraPurple shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span>Manifestación</span>
                      </span>
                    ) : isProgress ? (
                      <span
                        data-testid="entry-type-progress"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide border border-emerald-400/60 bg-gradient-to-r from-manifest-mint/40 to-emerald-100/50 text-emerald-800 shadow-sm"
                      >
                        <Target className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
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

                <motion.button
                  type="button"
                  whileTap={IOS_TAP_SPRING}
                  onClick={onClose}
                  data-testid="close-detail-modal-btn"
                  title="Cerrar vista de entrada"
                  aria-label="Cerrar vista de entrada"
                  className="p-2 rounded-full bg-white/80 hover:bg-white text-manifest-inkMuted hover:text-manifest-ink border border-white/90 shadow-sm transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Title if distinct */}
              {hasDistinctTitle && (
                <div className="relative z-10 pt-1">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-manifest-ink leading-snug">
                    {entry.title}
                  </h2>
                </div>
              )}

              {/* Main Text Content Box */}
              <div className="relative z-10 my-2 p-4 sm:p-5 rounded-2xl bg-white/80 border border-white/90 shadow-inner max-h-[46dvh] overflow-y-auto overscroll-contain touch-pan-y">
                <p
                  className={`selectable-text whitespace-pre-wrap leading-relaxed text-manifest-ink select-text font-serif ${
                    isShortQuote ? 'text-base sm:text-lg italic font-medium' : 'text-sm font-normal'
                  }`}
                >
                  {entry.content}
                </p>
              </div>

              {/* Bottom Actions or Delete Confirmation Bar */}
              {showDeleteConfirm ? (
                <div className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200/90 space-y-2.5 text-center relative z-10">
                  <div className="flex items-center justify-center gap-1.5 text-rose-700 text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>¿Deseas eliminar esta entrada definitivamente?</span>
                  </div>
                  <p className="text-[11px] text-rose-600/80">
                    Esta acción no se puede deshacer.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-0.5">
                    <motion.button
                      type="button"
                      whileTap={IOS_TAP_SPRING}
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 rounded-xl text-xs font-medium bg-white text-manifest-inkMuted hover:text-manifest-ink border border-rose-200 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      type="button"
                      whileTap={IOS_TAP_SPRING}
                      onClick={handleConfirmDelete}
                      data-testid="confirm-delete-entry-btn"
                      className="px-4.5 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 shadow-sm transition-colors cursor-pointer"
                    >
                      Sí, eliminar
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-manifest-ink/[0.06] relative z-10">
                  <motion.button
                    type="button"
                    whileTap={IOS_TAP_SPRING}
                    onClick={handleDeleteClick}
                    data-testid="detail-delete-btn"
                    title="Eliminar entrada de diario"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-rose-200/80 bg-rose-50/70 hover:bg-rose-100 text-rose-600 hover:text-rose-700 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </motion.button>

                  <motion.button
                    type="button"
                    whileTap={IOS_TAP_SPRING}
                    onClick={handleEditClick}
                    data-testid="detail-edit-btn"
                    title="Editar entrada de diario"
                    className="flex items-center gap-1.5 px-5 py-2 rounded-2xl primary-gradient-btn text-manifest-ink text-xs font-semibold shadow-sm cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-manifest-ink" />
                    <span>Editar entrada</span>
                  </motion.button>
                </div>
              )}
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
