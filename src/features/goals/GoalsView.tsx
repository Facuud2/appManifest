'use client';

import React, { useState, useRef } from 'react';
import { useAppStore } from '@/store';
import {
  Sparkles,
  Plus,
  Pin,
  ListOrdered,
  Flame,
} from 'lucide-react';
import { UserScope, Affirmation } from '@/types';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { AutoResizeTextarea } from '@/components/ui/AutoResizeTextarea';
import { VoiceDictationButton } from '@/components/ui/VoiceDictationButton';
import { ManifestationCard } from '@/components/goals/ManifestationCard';
import { RampageSetView } from '@/components/goals/RampageSetView';

export const GoalsView: React.FC = () => {
  const {
    activeScope,
    affirmations,
    saveAffirmation,
    reorderAffirmations,
    openRampageSetEditor,
  } = useAppStore();

  const [viewMode, setViewMode] = useState<'list' | 'rampage'>('list');
  const [manifestationText, setManifestationText] = useState('');
  const [scope, setScope] = useState<UserScope>(activeScope);

  const pinnedContainerRef = useRef<HTMLDivElement>(null);

  // Split pinned and unpinned manifestations
  const pinnedAffirmations = affirmations.filter((a) => a.pinned);
  const unpinnedAffirmations = affirmations.filter((a) => !a.pinned);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manifestationText.trim()) return;

    const author =
      scope === 'facu' ? 'Facu' : scope === 'maia' ? 'Maia' : 'Facu & Maia';

    saveAffirmation({
      id: `aff-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: scope,
      author,
      text: manifestationText.trim(),
      repeatCount: 1,
      pinned: false,
      createdAt: new Date().toISOString(),
      lastRepeatedAt: new Date().toISOString(),
    });

    setManifestationText('');
  };

  const handleReorderPinned = (reordered: Affirmation[]) => {
    // Preserve unpinned items, only update order for pinned items
    reorderAffirmations([...reordered, ...unpinnedAffirmations]);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pt-1">
      {/* Header with iOS Segmented Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-manifest-ink flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-manifest-auraPurple" />
            Afirmaciones
          </h2>
        </div>

        {/* iOS Segmented Control / Switch + Action */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
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
                  layoutId="manifestationViewMode"
                  className="absolute inset-0 rounded-xl bg-white shadow-sm border border-white -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="flex items-center gap-1.5">
                <Pin className="w-3.5 h-3.5 text-manifest-auraPurple" />
                Lista y Fijados
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
                  layoutId="manifestationViewMode"
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

          {viewMode === 'rampage' && (
            <button
              type="button"
              onClick={() => openRampageSetEditor(null)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl primary-gradient-btn text-xs font-semibold shadow-sm shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Set</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW MODE 1: LISTA Y FIJADOS */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {/* Quick Manifestation Writer */}
          <form
            onSubmit={handleSave}
            className="p-4 sm:p-5 rounded-3xl glass-card border border-white/95 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-semibold text-manifest-ink">
                Nueva Afirmación
              </label>
              <div className="flex items-center gap-1">
                {[
                  { key: 'facu' as UserScope, label: 'Facu' },
                  { key: 'maia' as UserScope, label: 'Maia' },
                  { key: 'shared' as UserScope, label: '✨ Juntos' },
                ].map((sc) => (
                  <button
                    key={sc.key}
                    type="button"
                    onClick={() => setScope(sc.key)}
                    className={`py-1 px-2.5 rounded-xl text-[11px] font-semibold transition-all border ${
                      scope === sc.key
                        ? 'bg-manifest-ink text-white border-manifest-ink shadow-sm'
                        : 'bg-white/70 hover:bg-white text-manifest-inkMuted border-white/80'
                    }`}
                  >
                    {sc.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <AutoResizeTextarea
                minRows={2}
                value={manifestationText}
                onChange={(e) => setManifestationText(e.target.value)}
                placeholder="Escribe en tiempo presente tu deseo o afirmación... (Ej: Atraigo abundancia, tranquilidad y felicidad cada día)"
                className="w-full p-3.5 pr-11 rounded-2xl glass-input text-base sm:text-xs placeholder:text-manifest-inkLight"
                required
              />
              <div className="absolute right-2.5 bottom-2.5">
                <VoiceDictationButton
                  size="sm"
                  onTranscript={(trans) =>
                    setManifestationText((prev) => (prev ? `${prev} ${trans}` : trans))
                  }
                />
              </div>
            </div>

            <div className="flex justify-end pt-0.5">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl primary-gradient-btn text-xs font-semibold shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Guardar Afirmación</span>
              </button>
            </div>
          </form>

          {/* SECTION: PINNED (DRAG & DROP RESTRICTED) */}
          {pinnedAffirmations.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-manifest-ink flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5 text-manifest-auraPurple fill-manifest-auraPurple" />
                  Afirmaciones Fijadas ({pinnedAffirmations.length})
                </h3>
              </div>

              {/* CRITICAL CONTAINER RESTRICTION: overflow-hidden & contain-layout */}
              <div
                ref={pinnedContainerRef}
                style={{ contain: 'layout' }}
                className="relative overflow-hidden w-full rounded-3xl"
              >
                <Reorder.Group
                  axis="y"
                  values={pinnedAffirmations}
                  onReorder={handleReorderPinned}
                  className="space-y-2.5 list-none m-0 p-0"
                >
                  {pinnedAffirmations.map((item) => (
                    <ManifestationCard
                      key={item.id}
                      affirmation={item}
                      isPinnedMode={true}
                      containerRef={pinnedContainerRef}
                    />
                  ))}
                </Reorder.Group>
              </div>
            </div>
          )}

          {/* SECTION: ALL / UNPINNED AFIRMACIONES */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-manifest-ink">
                {pinnedAffirmations.length > 0
                  ? `Otras Afirmaciones (${unpinnedAffirmations.length})`
                  : `Todas las Afirmaciones (${affirmations.length})`}
              </h3>
            </div>

            {affirmations.length === 0 ? (
              <div className="p-8 rounded-3xl glass-card text-center space-y-2.5 border border-white/80">
                <div className="w-12 h-12 mx-auto rounded-full bg-manifest-lavender/40 flex items-center justify-center text-manifest-ink">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-base font-bold text-manifest-ink">
                  Sin afirmaciones aún
                </h4>
                <p className="text-xs text-manifest-inkMuted max-w-xs mx-auto">
                  Escribe arriba tu primera afirmación para comenzar a proyectar tu realidad.
                </p>
              </div>
            ) : unpinnedAffirmations.length === 0 && pinnedAffirmations.length > 0 ? (
              <p className="text-xs text-manifest-inkMuted text-center py-2">
                Todas tus afirmaciones están fijadas como prioritarias arriba.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {unpinnedAffirmations.map((item) => (
                  <ManifestationCard
                    key={item.id}
                    affirmation={item}
                    isPinnedMode={false}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: SETS DE RAMPAGE */}
      {viewMode === 'rampage' && <RampageSetView />}
    </div>
  );
};
