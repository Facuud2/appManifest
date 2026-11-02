'use client';

import React, { useState, useRef } from 'react';
import { useAppStore } from '@/store';
import {
  Sparkles,
  Plus,
  Pin,
  ListOrdered,
  Flame,
  Send,
  Mic,
} from 'lucide-react';
import { UserScope, Affirmation } from '@/types';
import { motion } from 'framer-motion';
import { Segmented, SegmentedButton } from 'konsta/react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { IOS_TAP_SPRING, LIQUID_GLASS_SPECULAR } from '@/lib/iosSprings';
import { AutoResizeTextarea } from '@/components/ui/AutoResizeTextarea';
import { VoiceAudioVisualizer } from '@/components/ui/VoiceAudioVisualizer';
import { ManifestationCard } from '@/components/goals/ManifestationCard';
import { PinnedAffirmationsList } from '@/components/goals/PinnedAffirmationsList';
import { RampageSetView } from '@/components/goals/RampageSetView';
import { LiquidEmptyState } from '@/components/ui/LiquidEmptyState';

export const GoalsView: React.FC = () => {
  const {
    activeScope,
    affirmations,
    saveAffirmation,
    reorderAffirmations,
    openAffirmationEditor,
    openRampageSetEditor,
    goalsViewMode,
    setGoalsViewMode,
    checkAndUnlockMilestones,
  } = useAppStore();

  const viewMode = goalsViewMode;
  const setViewMode = setGoalsViewMode;
  const [manifestationText, setManifestationText] = useState('');
  const [isDictating, setIsDictating] = useState(false);
  const [scope, setScope] = useState<UserScope>(activeScope);

  const pinnedContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  const [unpinnedListRef] = useAutoAnimate<HTMLDivElement>({ duration: 240 });

  // Split pinned and unpinned manifestations
  const pinnedAffirmations = affirmations.filter((a) => a.pinned);
  // Unpinned manifestations ordered chronologically/sequentially so newly added append at the bottom
  const unpinnedAffirmations = affirmations
    .filter((a) => !a.pinned)
    .sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  const submitManifestation = (textToSave: string) => {
    const trimmed = textToSave.trim();
    if (!trimmed) return;

    const author =
      scope === 'facu' ? 'Facu' : scope === 'maia' ? 'Maia' : 'Facu & Maia';

    const maxOrder = affirmations.reduce(
      (max, a) => Math.max(max, a.order ?? 0),
      0
    );

    saveAffirmation({
      id: `aff-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: scope,
      author,
      text: trimmed,
      repeatCount: 1,
      pinned: false,
      order: maxOrder + 1,
      createdAt: new Date().toISOString(),
      lastRepeatedAt: new Date().toISOString(),
    });

    checkAndUnlockMilestones({ suppressModal: true });

    setManifestationText('');

    // Trello-style: Keep focus and smoothly scroll to keep creator comfortably visible
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      bottomAnchorRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    });
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    submitManifestation(manifestationText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Intercept Enter (or mobile virtual keyboard Send action) to add and chain creation
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
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

        {/* iOS Konsta Segmented Control / Switch + Action */}
        <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto justify-between sm:justify-end">
          <Segmented
            strong
            rounded
            colors={{
              strongBgIos: `${LIQUID_GLASS_SPECULAR}`,
            }}
            className="flex-1 sm:flex-initial sm:min-w-[290px] p-1"
          >
            <SegmentedButton
              strong
              rounded
              active={viewMode === 'list'}
              onClick={() => setViewMode('list')}
              className="text-xs font-semibold py-1.5 px-3 !normal-case text-manifest-ink cursor-pointer"
            >
              <span className="flex items-center justify-center gap-1.5">
                <Pin className="w-3.5 h-3.5 text-manifest-auraPurple shrink-0" />
                <span>Mis Fijadas</span>
              </span>
            </SegmentedButton>

            <SegmentedButton
              strong
              rounded
              active={viewMode === 'rampage'}
              onClick={() => setViewMode('rampage')}
              className="text-xs font-semibold py-1.5 px-3 !normal-case text-manifest-ink cursor-pointer"
            >
              <span className="flex items-center justify-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
                <span>Sets de Rampage</span>
              </span>
            </SegmentedButton>
          </Segmented>

          {viewMode === 'rampage' ? (
            <motion.button
              type="button"
              whileTap={IOS_TAP_SPRING}
              onClick={() => openRampageSetEditor(null)}
              data-testid="open-rampage-modal-btn"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl primary-gradient-btn text-xs font-semibold shadow-sm shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Set</span>
            </motion.button>
          ) : (
            <motion.button
              type="button"
              whileTap={IOS_TAP_SPRING}
              onClick={() => openAffirmationEditor(null)}
              data-testid="add-affirmation-top-btn"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl primary-gradient-btn text-xs font-semibold shadow-sm shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* VIEW MODE 1: LISTA Y FIJADOS */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {/* SECTION: PINNED (DRAG & DROP RESTRICTED) */}
          {pinnedAffirmations.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-manifest-ink flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5 text-manifest-auraPurple fill-manifest-auraPurple" />
                  Afirmaciones Fijadas ({pinnedAffirmations.length})
                </h3>
              </div>

              {/* Container for Pinned Drag & Drop */}
              <PinnedAffirmationsList
                pinnedAffirmations={pinnedAffirmations}
                onReorder={handleReorderPinned}
              />
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
              <LiquidEmptyState
                title="Espacio listo para tus decretos"
                description="Aún no tienes afirmaciones en esta lista. Escribe tu primera afirmación para comenzar a proyectar tu realidad."
                actionLabel="Añadir Afirmación"
                onAction={() => openAffirmationEditor(null)}
              />
            ) : unpinnedAffirmations.length === 0 && pinnedAffirmations.length > 0 ? (
              <p className="text-xs text-manifest-inkMuted text-center py-2">
                Todas tus afirmaciones están fijadas como prioritarias arriba.
              </p>
            ) : (
              <div ref={unpinnedListRef} className="flex flex-col gap-2.5">
                {unpinnedAffirmations.map((item) => (
                  <ManifestationCard
                    key={item.id}
                    affirmation={item}
                    isPinnedMode={false}
                  />
                ))}
              </div>
            )}

            {/* Quick Manifestation Writer: dynamically positioned below the last card */}
            <form
              onSubmit={handleSave}
              className="p-4 sm:p-5 rounded-3xl glass-card border border-white/95 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-semibold text-manifest-ink">
                  Añadir Afirmación
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

              {isDictating ? (
                <VoiceAudioVisualizer
                  initialText={manifestationText}
                  placeholder="Habla ahora para tu afirmación..."
                  onCommit={(fullText) => {
                    setManifestationText(fullText);
                    setIsDictating(false);
                  }}
                  onSend={(fullText) => {
                    setIsDictating(false);
                    submitManifestation(fullText);
                  }}
                  onCancel={() => setIsDictating(false)}
                />
              ) : (
                <div className="relative">
                  <AutoResizeTextarea
                    ref={textareaRef}
                    minRows={2}
                    value={manifestationText}
                    onChange={(e) => setManifestationText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    enterKeyHint="send"
                    placeholder="Escribe en tiempo presente tu deseo o afirmación... (Pulsa Enviar para añadir otra)"
                    className="w-full p-3.5 pr-11 rounded-2xl glass-input text-base sm:text-xs placeholder:text-manifest-inkLight"
                    required
                  />
                  <div className="absolute right-2.5 bottom-2.5">
                    <button
                      type="button"
                      onClick={() => setIsDictating(true)}
                      title="Dictar afirmación con micrófono"
                      aria-label="Dictar afirmación con micrófono"
                      className="w-8 h-8 rounded-xl bg-white/80 hover:bg-white text-manifest-inkMuted hover:text-manifest-ink border border-white/90 shadow-sm flex items-center justify-center transition-all cursor-pointer"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-0.5">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl primary-gradient-btn text-xs font-semibold shadow-sm cursor-pointer active:scale-95 transition-transform"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Añadir afirmación</span>
                </button>
              </div>
            </form>
            <div ref={bottomAnchorRef} />
          </div>
        </div>
      )}

      {/* VIEW MODE 2: SETS DE RAMPAGE */}
      {viewMode === 'rampage' && <RampageSetView />}
    </div>
  );
};
