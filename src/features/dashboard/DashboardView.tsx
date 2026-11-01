'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store';
import {
  Sparkles,
  PenLine,
  ArrowRight,
  Sun,
  Moon,
  CloudSun,
  BookOpen,
  Plus,
  Flame,
  Pin,
  Edit3,
  Trash2,
  RotateCcw,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Affirmation, JournalEntry } from '@/types';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { ManifestationCard } from '@/components/goals/ManifestationCard';
import { RampageSetView } from '@/components/goals/RampageSetView';
import { JournalEntryDetailModal } from '@/components/journal/JournalEntryDetailModal';

export const DashboardView: React.FC = () => {
  const {
    activeScope,
    setActiveTab,
    navigateToGoals,
    openJournalEditor,
    openAffirmationEditor,
    openRampageSetEditor,
    journalEntries,
    deleteJournalEntry,
    affirmations,
    reorderAffirmations,
    deleteAffirmation,
    saveAffirmation,
  } = useAppStore();

  const [viewMode, setViewMode] = useState<'list' | 'rampage'>('list');
  const [selectedJournalEntryForView, setSelectedJournalEntryForView] = useState<JournalEntry | null>(null);
  const [journalEntryToDelete, setJournalEntryToDelete] = useState<JournalEntry | null>(null);
  const [affirmationToDelete, setAffirmationToDelete] = useState<Affirmation | null>(null);
  const [recentlyDeletedAffirmation, setRecentlyDeletedAffirmation] = useState<Affirmation | null>(null);

  const pinnedContainerRef = useRef<HTMLDivElement>(null);

  // Auto-clear recently deleted undo after 7 seconds
  useEffect(() => {
    if (recentlyDeletedAffirmation) {
      const timer = setTimeout(() => {
        setRecentlyDeletedAffirmation(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [recentlyDeletedAffirmation]);

  // Helper to accurately extract timestamp from createdAt, ID, or fallback
  const getAffirmationTime = (aff: Affirmation): number => {
    if (aff.createdAt) {
      const parsed = new Date(aff.createdAt).getTime();
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    if (aff.id) {
      const match = aff.id.match(/^aff-(\d+)/);
      if (match && match[1]) {
        const idTime = parseInt(match[1], 10);
        if (!isNaN(idTime) && idTime > 0) return idTime;
      }
    }
    if (typeof aff.order === 'number') {
      return aff.order;
    }
    return 0;
  };

  // Separate pinned and unpinned affirmations
  // En la pantalla de inicio: de arriba hacia abajo siendo la primera la más reciente
  const pinnedAffirmations = affirmations.filter((a) => a.pinned);
  const unpinnedAffirmations = affirmations
    .filter((a) => !a.pinned)
    .sort((a, b) => {
      const timeA = getAffirmationTime(a);
      const timeB = getAffirmationTime(b);
      if (timeA !== timeB) {
        return timeB - timeA; // Más reciente primero (al principio de forma predeterminada)
      }
      return (b.id || '').localeCompare(a.id || '');
    });

  const recentEntries = journalEntries.slice(0, 3);

  const rawDate = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });
  const formattedDate = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);
  const hour = new Date().getHours();

  const handleReorderPinned = (reordered: Affirmation[]) => {
    reorderAffirmations([...reordered, ...unpinnedAffirmations]);
  };

  const getScopeGreetingName = () => {
    switch (activeScope) {
      case 'facu':
        return 'Facu';
      case 'maia':
        return 'Maia';
      case 'shared':
        return 'Facu & Maia';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-5 pt-0.5">
      {/* 1. Date & Warm Greeting */}
      <div className="px-1 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-manifest-inkMuted">
            {formattedDate}
          </p>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-manifest-ink flex items-center gap-2 mt-0.5">
            {hour < 12 ? (
              <CloudSun className="w-5 h-5 text-amber-500 inline shrink-0" />
            ) : hour < 20 ? (
              <Sun className="w-5 h-5 text-amber-500 inline shrink-0" />
            ) : (
              <Moon className="w-5 h-5 text-manifest-lavender inline shrink-0" />
            )}
            <span>
              {hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'},{' '}
              {getScopeGreetingName()}
            </span>
          </h2>
        </div>
      </div>

      {/* 2. SECCIÓN: Afirmaciones & Sets de Rampage */}
      <section className="space-y-3">
        {/* Switch Bar */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex p-1 rounded-2xl bg-white/75 border border-white shadow-sm backdrop-blur-md">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`relative px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors duration-200 cursor-pointer ${
                viewMode === 'list'
                  ? 'text-manifest-ink'
                  : 'text-manifest-inkMuted hover:text-manifest-ink'
              }`}
            >
              {viewMode === 'list' && (
                <motion.div
                  layoutId="dashboardViewMode"
                  className="absolute inset-0 rounded-xl bg-white shadow-sm border border-white -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-manifest-auraPurple" />
                Afirmaciones ({affirmations.length})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('rampage')}
              className={`relative px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors duration-200 cursor-pointer ${
                viewMode === 'rampage'
                  ? 'text-manifest-ink'
                  : 'text-manifest-inkMuted hover:text-manifest-ink'
              }`}
            >
              {viewMode === 'rampage' && (
                <motion.div
                  layoutId="dashboardViewMode"
                  className="absolute inset-0 rounded-xl bg-white shadow-sm border border-white -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                Sets de Rampage
              </span>
            </button>
          </div>
        </div>

        {/* Section Header Row with Section Title on Left and Actions on Right */}
        <div className="flex items-center justify-between px-1 pt-0.5">
          <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-manifest-ink flex items-center gap-1.5">
            {viewMode === 'rampage' ? (
              <>
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>Sets de Rampage</span>
              </>
            ) : (
              <>
                <Pin className="w-3.5 h-3.5 text-manifest-auraPurple fill-manifest-auraPurple" />
                <span>{pinnedAffirmations.length > 0 ? 'Afirmaciones Fijadas' : 'Afirmaciones'}</span>
              </>
            )}
          </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateToGoals(viewMode)}
              className="text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink transition-colors flex items-center gap-0.5 cursor-pointer"
            >
              <span>{viewMode === 'rampage' ? 'Ver todos' : 'Ver todas'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            {viewMode === 'rampage' ? (
              <button
                onClick={() => openRampageSetEditor(null)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl primary-gradient-btn text-xs font-semibold shadow-sm shrink-0 cursor-pointer active:scale-95 transition-transform"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Set</span>
              </button>
            ) : (
              <button
                onClick={() => openAffirmationEditor(null)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl primary-gradient-btn text-xs font-semibold shadow-sm shrink-0 cursor-pointer active:scale-95 transition-transform"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva</span>
              </button>
            )}
          </div>
        </div>

        {viewMode === 'rampage' ? (
          <RampageSetView />
        ) : affirmations.length === 0 ? (
          <div className="p-6 rounded-3xl glass-card text-center space-y-2 border border-white/80">
            <p className="text-xs text-manifest-inkMuted">
              Aún no tienes afirmaciones registradas en este espacio.
            </p>
            <button
              onClick={() => openAffirmationEditor(null)}
              className="text-xs font-semibold text-manifest-auraPurple underline underline-offset-4 cursor-pointer"
            >
              + Escribir tu primera afirmación
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Pinned Affirmations with Drag & Drop */}
            {pinnedAffirmations.length > 0 && (
              <div
                ref={pinnedContainerRef}
                style={{ contain: 'layout' }}
                className="relative overflow-hidden w-full rounded-3xl space-y-2.5"
              >
                <Reorder.Group
                  axis="y"
                  values={pinnedAffirmations}
                  onReorder={handleReorderPinned}
                  className="space-y-2.5 list-none m-0 p-0"
                >
                  <AnimatePresence initial={false} mode="popLayout">
                    {pinnedAffirmations.map((aff) => (
                      <ManifestationCard
                        key={aff.id}
                        affirmation={aff}
                        isPinnedMode={true}
                        containerRef={pinnedContainerRef}
                        onDeleteRequest={(targetAff) => setAffirmationToDelete(targetAff)}
                      />
                    ))}
                  </AnimatePresence>
                </Reorder.Group>
              </div>
            )}

            {/* Unpinned Affirmations - NEVER hidden when others are pinned */}
            {unpinnedAffirmations.length > 0 && (
              <div className="grid grid-cols-1 gap-2.5">
                <AnimatePresence initial={false} mode="popLayout">
                  {unpinnedAffirmations.slice(0, 6).map((aff) => (
                    <ManifestationCard
                      key={aff.id}
                      affirmation={aff}
                      isPinnedMode={false}
                      onDeleteRequest={(targetAff) => setAffirmationToDelete(targetAff)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Pop-up de Confirmación de Eliminación con physics Apple / Liquid Glass */}
      <AnimatePresence>
        {affirmationToDelete && (
          <div
            onClick={() => setAffirmationToDelete(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-manifest-ink/35 backdrop-blur-sm"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 6,
                transition: { duration: 0.15, ease: [0.22, 1, 0.36, 1] },
              }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-sm rounded-3xl glass-card p-5 sm:p-6 border border-white shadow-liquid space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100/80 border border-rose-200/80 text-rose-500 flex items-center justify-center shrink-0 shadow-sm">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold text-manifest-ink">
                    ¿Retirar esta afirmación?
                  </h3>
                  <p className="text-[11px] text-manifest-inkMuted">
                    Confirmación de retiro
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/70 border border-white/90">
                <p className="text-xs font-medium text-manifest-ink line-clamp-3 italic">
                  “{affirmationToDelete.text}”
                </p>
              </div>

              <p className="text-[11.5px] text-manifest-inkMuted leading-relaxed">
                Esta acción retirará la afirmación de tu tablero de inicio. <span className="font-semibold text-manifest-auraPurple">Podrás deshacer la acción de inmediato</span> si lo deseas.
              </p>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setAffirmationToDelete(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-manifest-inkMuted hover:text-manifest-ink hover:bg-white/70 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const deleted = affirmationToDelete;
                    deleteAffirmation(deleted.id);
                    setRecentlyDeletedAffirmation(deleted);
                    setAffirmationToDelete(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  Retirar afirmación
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Undo Pill (Deshacer) */}
      <AnimatePresence>
        {recentlyDeletedAffirmation && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95, transition: { duration: 0.15 } }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-20 lg:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl glass-card border border-white/95 shadow-liquid bg-white/95 backdrop-blur-xl"
          >
            <span className="text-xs font-medium text-manifest-ink">
              Afirmación retirada
            </span>
            <button
              type="button"
              onClick={() => {
                saveAffirmation(recentlyDeletedAffirmation);
                setRecentlyDeletedAffirmation(null);
              }}
              className="text-xs font-bold text-manifest-auraPurple px-2.5 py-1 rounded-xl bg-manifest-lavender/70 hover:bg-manifest-lavender border border-manifest-auraPurple/30 transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Deshacer</span>
            </button>
            <button
              type="button"
              onClick={() => setRecentlyDeletedAffirmation(null)}
              className="text-manifest-inkMuted hover:text-manifest-ink p-1 rounded-full cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. SECCIÓN: Diario & Cuaderno */}
      <section className="space-y-3 pt-1">
        {/* Quick Action: Start Notebook Entry */}
        <div className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl glass-card flex items-center justify-between gap-3 border border-white/90 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-manifest-peach via-manifest-pink to-manifest-lavender flex items-center justify-center shrink-0 shadow-sm">
              <PenLine className="w-5 h-5 text-manifest-ink" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-manifest-ink">
                Escribir en el Cuaderno
              </h4>
              <p className="text-[11px] text-manifest-inkMuted">
                Notas y reflexiones personales
              </p>
            </div>
          </div>
          <button
            onClick={() => openJournalEditor('manifestation', null)}
            className="px-4 py-2 rounded-2xl primary-gradient-btn text-xs font-semibold shrink-0 cursor-pointer"
          >
            Escribir
          </button>
        </div>

        {/* Recent Notebook Entries */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-manifest-ink flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-manifest-ink" />
              Diario Reciente
            </h3>
            {journalEntries.length > 0 && (
              <button
                onClick={() => setActiveTab('diario')}
                className="text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink transition-colors flex items-center gap-0.5 cursor-pointer"
              >
                <span>Ver todas ({journalEntries.length})</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {recentEntries.length === 0 ? (
            <div className="p-6 rounded-3xl glass-card text-center space-y-2 border border-white/80">
              <p className="text-xs text-manifest-inkMuted">
                Aún no tienes notas en tu cuaderno.
              </p>
              <button
                onClick={() => openJournalEditor('manifestation', null)}
                className="text-xs font-semibold text-manifest-auraPurple underline underline-offset-4 cursor-pointer"
              >
                + Escribir tu primera nota
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
              {recentEntries.map((entry) => {
                const formattedEntryDate = format(new Date(entry.createdAt), "d 'de' MMMM", { locale: es });
                const isProgress = entry.entryType === 'progress';
                const isManifestation = entry.entryType === 'manifestation';

                return (
                  <div
                    key={entry.id}
                    onClick={() => setSelectedJournalEntryForView(entry)}
                    data-testid={`journal-card-${entry.id}`}
                    className="p-3.5 sm:p-4 rounded-2xl glass-card-interactive cursor-pointer border border-white/90 space-y-2 hover:scale-[1.005] transition-transform select-none"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                        <span
                          className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                            isProgress
                              ? 'bg-manifest-mint/70 text-emerald-800'
                              : isManifestation
                              ? 'bg-gradient-to-r from-manifest-pink/40 to-manifest-lavender/60 text-manifest-auraPurple border border-manifest-auraPurple/30'
                              : 'bg-amber-100/80 text-amber-800 border border-amber-300/40'
                          }`}
                        >
                          {isProgress ? 'Avance de manifestación' : isManifestation ? 'Manifestación' : 'Success Story'}
                        </span>
                        <span className="text-[10px] text-manifest-inkMuted whitespace-nowrap shrink-0">
                          {formattedEntryDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-[10px] text-manifest-inkMuted">
                          {entry.userId === 'shared' ? '✨ Juntos' : entry.author || (entry.userId === 'facu' ? 'Facu' : 'Maia')}
                        </span>

                        {/* Action Buttons: Edit and Delete */}
                        <div
                          className="flex items-center gap-1 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openJournalEditor(entry.entryType, entry);
                            }}
                            title="Editar entrada"
                            data-testid={`edit-journal-card-${entry.id}`}
                            className="w-7 h-7 rounded-xl flex items-center justify-center bg-white/70 hover:bg-white text-manifest-inkMuted hover:text-manifest-ink border border-white/80 shadow-xs active:scale-95 transition-all cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setJournalEntryToDelete(entry);
                            }}
                            title="Eliminar entrada"
                            data-testid={`delete-journal-card-${entry.id}`}
                            className="w-7 h-7 rounded-xl flex items-center justify-center bg-white/70 hover:bg-rose-50 text-manifest-inkMuted hover:text-rose-600 border border-white/80 shadow-xs active:scale-95 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      {entry.title &&
                        entry.title !== 'Entrada de diario' &&
                        !entry.content.startsWith(entry.title.replace(/\.\.\.$/, '')) && (
                          <h4 className="text-xs sm:text-sm font-serif font-bold text-manifest-ink line-clamp-1 mb-0.5">
                            {entry.title}
                          </h4>
                        )}
                      <p className="text-[11px] text-manifest-inkMuted line-clamp-2 leading-relaxed">
                        {entry.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Detail Modal for viewing full Journal Entry from Inicio (without changing sections) */}
      <JournalEntryDetailModal
        isOpen={!!selectedJournalEntryForView}
        entry={selectedJournalEntryForView}
        onClose={() => setSelectedJournalEntryForView(null)}
        onEdit={(entry) => openJournalEditor(entry.entryType, entry)}
        onDelete={(id) => deleteJournalEntry(id)}
      />

      {/* Confirmation Dialog for deleting a journal entry directly from the card in Inicio */}
      <AnimatePresence>
        {journalEntryToDelete && (
          <div
            onClick={() => setJournalEntryToDelete(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-manifest-ink/35 backdrop-blur-sm"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 6 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm rounded-3xl bg-white p-5 sm:p-6 border border-white shadow-liquid space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100/80 border border-rose-200/80 text-rose-500 flex items-center justify-center shrink-0 shadow-sm">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold text-manifest-ink">
                    ¿Eliminar esta entrada?
                  </h3>
                  <p className="text-[11px] text-manifest-inkMuted">
                    Confirmación de eliminación
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-manifest-lavender/30 border border-white/90">
                <p className="text-xs font-semibold text-manifest-ink line-clamp-1">
                  {journalEntryToDelete.title}
                </p>
                <p className="text-[11px] text-manifest-inkMuted line-clamp-2 mt-0.5">
                  {journalEntryToDelete.content}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setJournalEntryToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteJournalEntry(journalEntryToDelete.id);
                    setJournalEntryToDelete(null);
                  }}
                  data-testid="confirm-delete-journal-card-btn"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
