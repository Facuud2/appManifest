'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store';
import {
  BookOpen,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Edit3,
  X,
  Calendar,
  Target,
  Trophy,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { JournalEntry } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { IOS_TAP_SPRING } from '@/lib/iosSprings';
import { JournalEntryDetailModal } from '@/components/journal/JournalEntryDetailModal';
import { LiquidEmptyState } from '@/components/ui/LiquidEmptyState';

export const JournalView: React.FC = () => {
  const {
    journalEntries,
    deleteJournalEntry,
    openJournalEditor,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'manifestation' | 'reflection' | 'progress'>('all');
  const [selectedEntryForView, setSelectedEntryForView] = useState<JournalEntry | null>(null);

  // Delete Confirm Modal State
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [journalListRef] = useAutoAnimate<HTMLDivElement>({ duration: 240 });

  const handleOpenNew = (type: 'manifestation' | 'progress' | 'reflection' = 'manifestation') => {
    openJournalEditor(type);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    openJournalEditor(entry.entryType, entry);
  };

  const handleDeleteConfirm = () => {
    if (!entryToDelete) return;
    deleteJournalEntry(entryToDelete);
    setEntryToDelete(null);
  };

  // Filter entries
  const filteredEntries = journalEntries
    .filter((entry) => {
      // Exclude legacy mock seed entries
      if (entry.id.startsWith('seed-')) return false;

      // Filter by type
      if (selectedFilter !== 'all') {
        if (selectedFilter === 'reflection') {
          if (entry.entryType !== 'reflection' && entry.entryType !== 'free') return false;
        } else if (entry.entryType !== selectedFilter) {
          return false;
        }
      }

      // Filter by search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = entry.title.toLowerCase().includes(query);
        const matchesContent = entry.content.toLowerCase().includes(query);
        return matchesTitle || matchesContent;
      }

      return true;
    });

  const manifestationsCount = journalEntries.filter((e) => e.entryType === 'manifestation').length;
  const reflectionsCount = journalEntries.filter((e) => e.entryType === 'reflection' || e.entryType === 'free').length;
  const progressCount = journalEntries.filter((e) => e.entryType === 'progress').length;

  return (
    <div className="max-w-2xl mx-auto space-y-4 pt-1">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-manifest-ink flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-manifest-auraPurple" />
            Diario & Cuaderno
          </h2>
        </div>

        <motion.button
          whileTap={IOS_TAP_SPRING}
          onClick={() => handleOpenNew('manifestation')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl primary-gradient-btn text-xs font-semibold shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Escribir</span>
        </motion.button>
      </div>

      {/* Filter Tabs: Todas / Manifestaciones / Notas / Avances */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none pb-0.5">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            selectedFilter === 'all'
              ? 'bg-manifest-ink text-white shadow-sm'
              : 'glass-pill text-manifest-inkMuted hover:text-manifest-ink'
          }`}
        >
          Todas ({journalEntries.length})
        </button>
        <button
          onClick={() => setSelectedFilter('manifestation')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            selectedFilter === 'manifestation'
              ? 'bg-manifest-ink text-white shadow-sm'
              : 'glass-pill text-manifest-inkMuted hover:text-manifest-ink'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Manifestaciones ({manifestationsCount})</span>
        </button>
        <button
          onClick={() => setSelectedFilter('progress')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            selectedFilter === 'progress'
              ? 'bg-manifest-ink text-white shadow-sm'
              : 'glass-pill text-manifest-inkMuted hover:text-manifest-ink'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Avances de manifestación ({progressCount})</span>
        </button>
        <button
          onClick={() => setSelectedFilter('reflection')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            selectedFilter === 'reflection'
              ? 'bg-manifest-ink text-white shadow-sm'
              : 'glass-pill text-manifest-inkMuted hover:text-manifest-ink'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Success Stories ({reflectionsCount})</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-manifest-inkMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar notas o avances en tu diario..."
          className="w-full pl-10 pr-9 py-2.5 rounded-2xl glass-input text-xs placeholder:text-manifest-inkLight"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-manifest-inkMuted hover:text-manifest-ink"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Entries List */}
      {filteredEntries.length === 0 ? (
        <LiquidEmptyState
          icon={BookOpen}
          badge={searchQuery ? 'Búsqueda' : 'Cuaderno'}
          title={searchQuery ? 'Sin coincidencias' : 'Tu diario está en blanco'}
          description={
            searchQuery
              ? 'No encontramos notas con esa búsqueda. Prueba con otras palabras o limpia el filtro.'
              : 'Escribe avances de manifestación, notas reflexivas o historias de éxito para celebrar tu camino.'
          }
          actionLabel={searchQuery ? 'Limpiar búsqueda' : 'Escribir primera entrada'}
          onAction={searchQuery ? () => setSearchQuery('') : () => handleOpenNew('manifestation')}
        />
      ) : (
        <div ref={journalListRef} className="grid grid-cols-1 gap-3.5">
          {filteredEntries.map((entry) => {
            const formattedEntryDate = format(new Date(entry.createdAt), "d 'de' MMMM, yyyy", { locale: es });
            const isProgress = entry.entryType === 'progress';
            const isManifestation = entry.entryType === 'manifestation';
            const hasCustomTitle =
              entry.title &&
              entry.title !== 'Entrada de diario' &&
              !entry.content.startsWith(entry.title.replace(/\.\.\.$/, ''));

            return (
              <motion.article
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedEntryForView(entry)}
                className={`p-4 sm:p-5 rounded-3xl glass-card-interactive cursor-pointer border border-white/95 space-y-3 hover:scale-[1.005] transition-all select-none ${
                  isProgress
                    ? 'border-l-[3.5px] border-l-emerald-500/80 bg-gradient-to-r from-manifest-mint/20 via-white/80 to-white/70 shadow-xs'
                    : isManifestation
                    ? 'border-l-[3.5px] border-l-manifest-auraPurple/75 bg-gradient-to-r from-manifest-lavender/25 via-white/80 to-white/70 shadow-xs'
                    : 'border-l-[3.5px] border-l-amber-500/80 bg-gradient-to-r from-amber-100/30 via-white/80 to-white/70 shadow-xs'
                }`}
              >
                {/* Card Meta Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                        isProgress
                          ? 'bg-manifest-mint/80 text-emerald-800 border border-emerald-300/60'
                          : isManifestation
                          ? 'bg-gradient-to-r from-manifest-pink/50 to-manifest-lavender/70 text-manifest-auraPurple border border-manifest-auraPurple/30'
                          : 'bg-amber-100/90 text-amber-900 border border-amber-300/50'
                      }`}
                    >
                      {isProgress ? (
                        <>
                          <Sparkles className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                          <span>Avance</span>
                        </>
                      ) : isManifestation ? (
                        <>
                          <Target className="w-2.5 h-2.5 text-manifest-auraPurple shrink-0" />
                          <span>Manifestación</span>
                        </>
                      ) : (
                        <>
                          <Trophy className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                          <span>Success Story</span>
                        </>
                      )}
                    </span>
                    <span className="text-[11px] text-manifest-inkMuted flex items-center gap-1 whitespace-nowrap shrink-0">
                      <Calendar className="w-3 h-3 text-manifest-inkMuted/70" />
                      {formattedEntryDate}
                    </span>
                    {entry.userId === 'shared' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-manifest-pink/60 to-manifest-celeste/60 text-manifest-ink border border-white whitespace-nowrap shrink-0">
                        ✨ Juntos
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/80 text-manifest-inkMuted whitespace-nowrap shrink-0 border border-white/90">
                        {entry.author || (entry.userId === 'facu' ? 'Facu' : 'Maia')}
                      </span>
                    )}
                  </div>

                  <div
                    className="flex items-center gap-0.5 shrink-0 -mr-1 -mt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleEditEntry(entry)}
                      className="p-1.5 rounded-xl hover:bg-white text-manifest-inkMuted hover:text-manifest-ink active:scale-95 transition-all cursor-pointer"
                      title="Editar entrada"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEntryToDelete(entry.id)}
                      className="p-1.5 rounded-xl hover:bg-rose-50 text-manifest-inkMuted hover:text-rose-600 active:scale-95 transition-all cursor-pointer"
                      title="Eliminar entrada"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="pt-0.5">
                  {hasCustomTitle ? (
                    <div>
                      <h3 className="font-serif text-base font-bold text-manifest-ink leading-snug mb-1">
                        {entry.title}
                      </h3>
                      <p className="text-xs text-manifest-ink/80 leading-relaxed whitespace-pre-line">
                        {entry.content}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <span
                        aria-hidden="true"
                        className={`font-serif text-lg sm:text-xl leading-none font-bold select-none shrink-0 -mt-0.5 ${
                          isProgress
                            ? 'text-emerald-500/60'
                            : isManifestation
                            ? 'text-manifest-auraPurple/60'
                            : 'text-amber-500/70'
                        }`}
                      >
                        “
                      </span>
                      <p className="text-xs sm:text-[13.5px] font-serif font-semibold text-manifest-ink leading-relaxed whitespace-pre-line">
                        {entry.content}
                      </p>
                    </div>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {/* Detail View Modal for full journal entry presentation */}
      <JournalEntryDetailModal
        isOpen={!!selectedEntryForView}
        entry={selectedEntryForView}
        onClose={() => setSelectedEntryForView(null)}
        onEdit={(entry) => openJournalEditor(entry.entryType, entry)}
        onDelete={(id) => deleteJournalEntry(id)}
      />

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {entryToDelete && (
          <div
            onClick={() => setEntryToDelete(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-manifest-ink/30 backdrop-blur-sm"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl glass-card p-6 border border-white shadow-liquid space-y-4 text-center"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-rose-100/70 text-rose-600 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-base font-bold text-manifest-ink">
                  ¿Eliminar esta entrada?
                </h3>
                <p className="text-xs text-manifest-inkMuted">
                  Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setEntryToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink bg-white/70 hover:bg-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold shadow-sm hover:bg-rose-700 transition-colors"
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
