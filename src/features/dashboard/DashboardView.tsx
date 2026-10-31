'use client';

import React, { useRef } from 'react';
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
  Pin,
  Edit3,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Affirmation } from '@/types';
import { Reorder } from 'framer-motion';
import { ManifestationCard } from '@/components/goals/ManifestationCard';

export const DashboardView: React.FC = () => {
  const {
    activeScope,
    setActiveTab,
    openJournalEditor,
    openAffirmationEditor,
    journalEntries,
    affirmations,
    reorderAffirmations,
  } = useAppStore();

  const pinnedContainerRef = useRef<HTMLDivElement>(null);

  // Separate pinned and unpinned manifestations
  const pinnedAffirmations = affirmations.filter((a) => a.pinned);
  const unpinnedAffirmations = affirmations.filter((a) => !a.pinned);

  // If there are pinned manifestations, show ALL pinned manifestations.
  // If none are pinned yet, show the first 2-3 unpinned manifestations as quick suggestions with Pin button.
  const displayAffirmations =
    pinnedAffirmations.length > 0 ? pinnedAffirmations : unpinnedAffirmations.slice(0, 3);

  const recentEntries = journalEntries.slice(0, 3);

  const formattedDate = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });
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
          <p className="text-xs font-medium text-manifest-inkMuted capitalize">
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

      {/* 2. SECCIÓN: Manifestaciones / Afirmaciones (Fijadas con Drag & Drop o Recientes) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-manifest-ink flex items-center gap-1.5">
              {pinnedAffirmations.length > 0 ? (
                <>
                  <Pin className="w-3.5 h-3.5 text-manifest-auraPurple fill-manifest-auraPurple" />
                  <span>Manifestaciones Fijadas ({pinnedAffirmations.length})</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-manifest-auraPurple" />
                  <span>Manifestaciones Clave</span>
                </>
              )}
            </h3>
            <p className="text-[11px] text-manifest-inkMuted">
              {pinnedAffirmations.length > 0
                ? 'Arrastra desde (=) para reordenar tu prioridad diaria'
                : 'Fija tus intenciones con el icono de chincheta 📌'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('objetivos')}
              className="text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink transition-colors flex items-center gap-0.5"
            >
              <span>Ver todas ({affirmations.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => openAffirmationEditor(null)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl primary-gradient-btn text-xs font-semibold shadow-sm shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva</span>
            </button>
          </div>
        </div>

        {displayAffirmations.length === 0 ? (
          <div className="p-5 rounded-3xl glass-card text-center space-y-2 border border-white/80">
            <p className="text-xs text-manifest-inkMuted">
              Aún no tienes manifestaciones registradas en este espacio.
            </p>
            <button
              onClick={() => openAffirmationEditor(null)}
              className="text-xs font-semibold text-manifest-auraPurple underline underline-offset-4 cursor-pointer"
            >
              + Escribir tu primera manifestación
            </button>
          </div>
        ) : pinnedAffirmations.length > 0 ? (
          /* Pinned Manifestations Container with Reorder and Layout Containment */
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
              {pinnedAffirmations.map((aff) => (
                <ManifestationCard
                  key={aff.id}
                  affirmation={aff}
                  isPinnedMode={true}
                  containerRef={pinnedContainerRef}
                />
              ))}
            </Reorder.Group>
          </div>
        ) : (
          /* Unpinned Quick Suggestions */
          <div className="grid grid-cols-1 gap-2.5">
            {displayAffirmations.map((aff) => (
              <ManifestationCard
                key={aff.id}
                affirmation={aff}
                isPinnedMode={false}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. SECCIÓN: Diario de Manifestación */}
      <section className="space-y-3">
        {/* Quick Action: Start Journal Entry */}
        <div className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl glass-card flex items-center justify-between gap-3 border border-white/90 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-manifest-peach via-manifest-pink to-manifest-lavender flex items-center justify-center shrink-0 shadow-sm">
              <PenLine className="w-5 h-5 text-manifest-ink" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-manifest-ink">
                Registrar en el Diario
              </h4>
              <p className="text-[11px] text-manifest-inkMuted">
                Notas de manifestación y avances en tu camino
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

        {/* Recent Journal Entries */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-manifest-ink flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-manifest-ink" />
                Diario Reciente
              </h3>
              <p className="text-[11px] text-manifest-inkMuted">
                Notas y avances de manifestación
              </p>
            </div>
            {journalEntries.length > 0 && (
              <button
                onClick={() => setActiveTab('diario')}
                className="text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink transition-colors flex items-center gap-0.5"
              >
                <span>Ver todas ({journalEntries.length})</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {recentEntries.length === 0 ? (
            <div className="p-6 rounded-3xl glass-card text-center space-y-2.5 border border-white/80">
              <p className="text-xs text-manifest-inkMuted">
                Aún no tienes notas de manifestación o avances en tu diario.
              </p>
              <button
                onClick={() => openJournalEditor('manifestation', null)}
                className="text-xs font-semibold text-manifest-auraPurple underline underline-offset-4 cursor-pointer"
              >
                + Escribir tu primera nota de manifestación
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
              {recentEntries.map((entry) => {
                const formattedEntryDate = format(new Date(entry.createdAt), "d 'de' MMMM", { locale: es });
                const isProgress = entry.entryType === 'progress';

                return (
                  <div
                    key={entry.id}
                    onClick={() => openJournalEditor(entry.entryType, entry)}
                    className="p-3.5 sm:p-4 rounded-2xl glass-card-interactive cursor-pointer border border-white/90 space-y-2 hover:scale-[1.005] transition-transform"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isProgress ? 'bg-manifest-mint/50 text-manifest-ink' : 'bg-manifest-lavender/50 text-manifest-ink'
                          }`}
                        >
                          {isProgress ? 'Avance de Manifestación' : 'Nota de Manifestación'}
                        </span>
                        <span className="text-[10px] text-manifest-inkMuted">
                          {formattedEntryDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-manifest-inkMuted">
                          {entry.userId === 'shared' ? '✨ Juntos' : entry.author || (entry.userId === 'facu' ? 'Facu' : 'Maia')}
                        </span>
                        {/* Direct Edit Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openJournalEditor(entry.entryType, entry);
                          }}
                          title="Editar entrada"
                          className="p-1 rounded-full hover:bg-white text-manifest-inkMuted hover:text-manifest-ink transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs sm:text-sm font-serif font-bold text-manifest-ink line-clamp-1">
                        {entry.title}
                      </h4>
                      <p className="text-[11px] text-manifest-inkMuted line-clamp-2 leading-relaxed mt-0.5">
                        {entry.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/50">
                      <span className="text-manifest-inkMuted">Toca para editar</span>
                      <span className="text-manifest-auraPurple font-medium flex items-center gap-0.5">
                        Editar entrada →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
