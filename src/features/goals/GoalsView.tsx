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
  Moon,
  Heart,
} from 'lucide-react';
import { UserScope, Affirmation } from '@/types';
import { motion, LayoutGroup } from 'framer-motion';
import { IOS_TAP_SPRING, IOS_LAYOUT_SPRING } from '@/lib/iosSprings';
import { AutoResizeTextarea } from '@/components/ui/AutoResizeTextarea';
import { VoiceAudioVisualizer } from '@/components/ui/VoiceAudioVisualizer';
import { ManifestationCard } from '@/components/goals/ManifestationCard';
import { PinnedAffirmationsList } from '@/components/goals/PinnedAffirmationsList';
import { RampageSetView } from '@/components/goals/RampageSetView';
import { LiquidEmptyState } from '@/components/ui/LiquidEmptyState';
import { PremiumToggleSelector } from '@/components/ui/PremiumToggleSelector';

export const GoalsView: React.FC = () => {
  const {
    activeScope,
    affirmations,
    saveAffirmation,
    reorderAffirmations,
    openAffirmationEditor,
    openRampageSetEditor,
    openRampageConfig,
    goalsViewMode,
    setGoalsViewMode,
    checkAndUnlockMilestones,
  } = useAppStore();

  const viewMode = goalsViewMode;
  const setViewMode = setGoalsViewMode;
  const [manifestationText, setManifestationText] = useState('');
  const [isDictating, setIsDictating] = useState(false);
  const [scope, setScope] = useState<UserScope>(activeScope);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);

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
    <LayoutGroup id="goals-layout-group">
      <div className="max-w-2xl mx-auto space-y-4 pt-1">
      {/* Header with iOS Segmented Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="hidden lg:block">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-manifest-ink flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-manifest-auraPurple" />
            <span>Decretos & Afirmaciones</span>
          </h2>
        </div>

        {/* Liquid Glass pill switcher + Action */}
        <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto justify-between sm:justify-end">
          <div className="inline-flex p-1 rounded-full bg-white/85 border border-purple-200/80 shadow-sm backdrop-blur-md">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-serif tracking-wide rounded-full transition-all flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none ${
                viewMode === 'list'
                  ? 'bg-white text-purple-950 font-bold shadow-xs border border-purple-300/80'
                  : 'text-slate-600 font-medium hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <Pin className="w-3 h-3 text-purple-600" />
              <span>Mis Fijadas ({pinnedAffirmations.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('rampage')}
              className={`px-3 py-1.5 text-xs font-serif tracking-wide rounded-full transition-all flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none ${
                viewMode === 'rampage'
                  ? 'bg-white text-purple-950 font-bold shadow-xs border border-purple-300/80'
                  : 'text-slate-600 font-medium hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>Rampage</span>
            </button>
          </div>

          {viewMode === 'rampage' ? (
            <motion.button
              type="button"
              whileTap={IOS_TAP_SPRING}
              onClick={() => openRampageConfig()}
              data-testid="open-rampage-modal-btn"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full primary-gradient-btn text-xs font-serif tracking-wide shadow-sm shrink-0 cursor-pointer"
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
              className="flex items-center gap-1 px-3 py-1.5 rounded-full primary-gradient-btn text-xs font-serif tracking-wide shadow-sm shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Decreto</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Nota sutil única debajo del encabezado de la lista */}
      <div className="px-1.5 py-0.5 flex items-center gap-1.5 text-[11px] text-slate-500 font-sans">
        <span className="text-manifest-auraPurple text-xs">✦</span>
        <span>Toca en cualquier parte de una tarjeta para sumar repetición</span>
      </div>

      {/* VIEW MODE 1: LISTA Y FIJADOS */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {/* SECTION: PINNED (DRAG & DROP RESTRICTED) */}
          {pinnedAffirmations.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-manifest-ink flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5 text-manifest-auraPurple fill-manifest-auraPurple" />
                  <span>Decretos Fijados ({pinnedAffirmations.length})</span>
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
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-manifest-ink">
                {pinnedAffirmations.length > 0
                  ? `Otros Decretos (${unpinnedAffirmations.length})`
                  : `Todos los Decretos (${affirmations.length})`}
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
              <p className="text-xs text-manifest-inkLight text-center py-2">
                Todos tus decretos están fijados en el altar superior.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
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
              className="p-3.5 sm:p-4 rounded-2xl tarot-card-border glass-card border border-purple-400/15 shadow-sm space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-semibold text-manifest-ink flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-manifest-auraPurple" />
                  <span>Consagrar Nuevo Decreto</span>
                </label>
                <PremiumToggleSelector
                  value={scope}
                  onChange={(val) => setScope(val as UserScope)}
                  dropDirection="down"
                  layoutIdPrefix="goals-writer-scope"
                  options={[
                    { key: 'facu', label: 'Facu', icon: Moon },
                    { key: 'maia', label: 'Maia', icon: Heart },
                    { key: 'shared', label: 'Juntos', icon: Sparkles },
                  ]}
                />
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
                    placeholder="Escribe en tiempo presente tu deseo o afirmación... (Pulsa Enviar para consagrar)"
                    className="w-full p-3 pr-10 rounded-xl bg-white border border-purple-200/80 shadow-xs text-xs text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-400/20 outline-none"
                    required
                  />
                  <div className="absolute right-2 bottom-2">
                    <button
                      type="button"
                      data-testid="goals-mic-btn"
                      onClick={() => setIsDictating(true)}
                      title="Dictar afirmación con micrófono"
                      aria-label="Dictar afirmación con micrófono"
                      className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500/20 to-cyan-400/20 hover:from-purple-500 hover:to-cyan-400 text-purple-700 hover:text-white border border-purple-300/40 shadow-xs flex items-center justify-center transition-all cursor-pointer active:scale-95"
                    >
                      <Mic className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-0.5">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl primary-gradient-btn text-xs font-semibold shadow-sm cursor-pointer active:scale-95 transition-transform"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Consagrar</span>
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
  </LayoutGroup>
);
};
