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
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { IOS_TAP_SPRING, IOS_LAYOUT_SPRING } from '@/lib/iosSprings';
import { JournalEntryDetailModal } from '@/components/journal/JournalEntryDetailModal';
import { LiquidEmptyState } from '@/components/ui/LiquidEmptyState';

export const JournalView: React.FC = () => {
  const {
    journalEntries,
    deleteJournalEntry,
    setPendingDeleteJournalEntry,
    openJournalEditor,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'manifestation' | 'reflection' | 'progress'>('all');
  const [selectedEntryForView, setSelectedEntryForView] = useState<JournalEntry | null>(null);

  const handleOpenNew = (type: 'manifestation' | 'progress' | 'reflection' = 'manifestation') => {
    openJournalEditor(type);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    openJournalEditor(entry.entryType, entry);
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
    <LayoutGroup id="journal-layout-group">
      <div className="max-w-2xl mx-auto space-y-4 pt-1">
      {/* Header: Visible with title on Desktop; on mobile actions only to prevent duplicate Large Title */}
      <div className="flex items-center justify-between px-1">
        <div className="hidden lg:flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-manifest-auraPurple" />
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-manifest-ink">
            Grimorio & Diario
          </h2>
        </div>

        <motion.button
          whileTap={IOS_TAP_SPRING}
          onClick={() => handleOpenNew('manifestation')}
          className="ml-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl primary-gradient-btn text-xs font-semibold shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Escribir</span>
        </motion.button>
      </div>

      {/* Filter Tabs: Edge-to-edge full bleed horizontal scroll without clipping */}
      <div className="-mx-3 px-3 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-1">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none ${
            selectedFilter === 'all'
              ? 'bg-manifest-glassControlActive text-manifest-ink border border-manifest-glassBorderFocus shadow-xs'
              : 'bg-manifest-glassControl border border-manifest-glassBorder text-manifest-inkMuted hover:text-manifest-ink'
          }`}
        >
          Todas ({journalEntries.length})
        </button>
        <button
          onClick={() => setSelectedFilter('manifestation')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none ${
            selectedFilter === 'manifestation'
              ? 'bg-manifest-glassControlActive text-manifest-ink border border-manifest-glassBorderFocus shadow-xs'
              : 'bg-manifest-glassControl border border-manifest-glassBorder text-manifest-inkMuted hover:text-manifest-ink'
          }`}
        >
          <Target className="w-3.5 h-3.5 text-manifest-auraPurple" />
          <span>Manifestaciones ({manifestationsCount})</span>
        </button>
        <button
          onClick={() => setSelectedFilter('progress')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none ${
            selectedFilter === 'progress'
              ? 'bg-manifest-glassControlActive text-manifest-ink border border-manifest-glassBorderFocus shadow-xs'
              : 'bg-manifest-glassControl border border-manifest-glassBorder text-manifest-inkMuted hover:text-manifest-ink'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Avances ({progressCount})</span>
        </button>
        <button
          onClick={() => setSelectedFilter('reflection')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none ${
            selectedFilter === 'reflection'
              ? 'bg-manifest-glassControlActive text-manifest-ink border border-manifest-glassBorderFocus shadow-xs'
              : 'bg-manifest-glassControl border border-manifest-glassBorder text-manifest-inkMuted hover:text-manifest-ink'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          <span>Success Stories ({reflectionsCount})</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar notas o revelaciones en tu grimorio..."
          className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white border border-purple-200/80 shadow-xs text-xs text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-400/20 outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-manifest-inkLight hover:text-manifest-ink"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Entries List */}
      {filteredEntries.length === 0 ? (
        <LiquidEmptyState
          icon={BookOpen}
          badge={searchQuery ? 'Búsqueda' : 'Grimorio'}
          title={searchQuery ? 'Sin coincidencias' : 'Tu grimorio está en blanco'}
          description={
            searchQuery
              ? 'No encontramos notas con esa búsqueda. Prueba con otras palabras o limpia el filtro.'
              : 'Escribe avances de manifestación, notas reflexivas o historias de sincronía para consagrar tu camino.'
          }
          actionLabel={searchQuery ? 'Limpiar búsqueda' : 'Escribir primera entrada'}
          onAction={searchQuery ? () => setSearchQuery('') : () => handleOpenNew('manifestation')}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3">
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
                layout="position"
                transition={IOS_LAYOUT_SPRING}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedEntryForView(entry)}
                className={`p-3.5 sm:p-4 rounded-2xl tarot-card-border glass-card-interactive cursor-pointer space-y-2.5 select-none ${
                  isProgress
                    ? 'border-l-[3.5px] border-l-emerald-500/70'
                    : isManifestation
                    ? 'border-l-[3.5px] border-l-manifest-auraPurple/70'
                    : 'border-l-[3.5px] border-l-amber-500/70'
                }`}
              >
                {/* Card Meta Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0 shadow-neu-sm ${
                        isProgress
                          ? 'bg-emerald-100/80 text-emerald-800 border border-emerald-300/60'
                          : isManifestation
                          ? 'bg-purple-100/80 text-purple-800 border border-purple-300/60'
                          : 'bg-amber-100/80 text-amber-800 border border-amber-300/60'
                      }`}
                    >
                      {isProgress ? (
                        <>
                          <Sparkles className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                          <span>Avance</span>
                        </>
                      ) : isManifestation ? (
                        <>
                          <Target className="w-2.5 h-2.5 text-purple-600 shrink-0" />
                          <span>Manifestación</span>
                        </>
                      ) : (
                        <>
                          <Trophy className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                          <span>Success Story</span>
                        </>
                      )}
                    </span>
                    <span className="text-[11px] text-slate-600 font-medium flex items-center gap-1 whitespace-nowrap shrink-0">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {formattedEntryDate}
                    </span>
                  </div>

                  <div
                    className="flex items-center gap-0.5 shrink-0 -mr-1 -mt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleEditEntry(entry)}
                      className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 active:scale-95 transition-all cursor-pointer"
                      title="Editar entrada"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setPendingDeleteJournalEntry(entry)}
                      className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-500 hover:text-rose-600 active:scale-95 transition-all cursor-pointer"
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
                            ? 'text-emerald-600/70'
                            : isManifestation
                            ? 'text-manifest-auraPurple/70'
                            : 'text-amber-600/70'
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
        onDelete={(id) => {
          const target = journalEntries.find((e) => e.id === id);
          if (target) {
            setPendingDeleteJournalEntry(target);
            setSelectedEntryForView(null);
          }
        }}
      />
    </div>
  </LayoutGroup>
);
};
