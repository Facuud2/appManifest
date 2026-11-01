'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppStore } from '@/store';
import { X, Target, Sparkles, Trophy, Mic, Check, AlertCircle } from 'lucide-react';
import { EntryType, JournalEntry, UserScope } from '@/types';
import { UserScopeEnum } from '@/schemas';
import { motion, AnimatePresence } from 'framer-motion';
import { AutoResizeTextarea } from '@/components/ui/AutoResizeTextarea';
import { VoiceAudioVisualizer } from '@/components/ui/VoiceAudioVisualizer';

const journalFormSchema = z.object({
  content: z.string().min(1, 'Describe tu entrada antes de guardar'),
  userId: UserScopeEnum,
  entryType: z.enum(['manifestation', 'progress', 'reflection']),
});

type JournalFormData = z.infer<typeof journalFormSchema>;

export const JournalEditorModal: React.FC = () => {
  const {
    isJournalEditorOpen,
    journalEditorInitialMode,
    editingJournalEntry,
    activeScope,
    saveJournalEntry,
    closeJournalEditor,
    addEtherFragments,
    showToast,
    triggerCelebration,
    openOracle,
  } = useAppStore();

  const {
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<JournalFormData>({
    resolver: zodResolver(journalFormSchema),
    mode: 'onChange',
    defaultValues: {
      content: '',
      userId: activeScope,
      entryType: 'manifestation',
    },
  });

  const selectedUserId = watch('userId');
  const selectedEntryType = watch('entryType');
  const currentContent = watch('content') || '';

  const [isVoiceActiveContent, setIsVoiceActiveContent] = useState(false);

  // Hydrate form whenever modal opens or editing entry changes
  useEffect(() => {
    if (isJournalEditorOpen) {
      if (editingJournalEntry) {
        const type: 'manifestation' | 'progress' | 'reflection' =
          editingJournalEntry.entryType === 'progress'
            ? 'progress'
            : editingJournalEntry.entryType === 'reflection'
            ? 'reflection'
            : 'manifestation';

        reset({
          content: editingJournalEntry.content,
          userId: editingJournalEntry.userId || activeScope,
          entryType: type,
        });
      } else {
        const initialType: 'manifestation' | 'progress' | 'reflection' =
          journalEditorInitialMode === 'progress'
            ? 'progress'
            : journalEditorInitialMode === 'reflection'
            ? 'reflection'
            : 'manifestation';

        reset({
          content: '',
          userId: activeScope,
          entryType: initialType,
        });
      }
    }
  }, [isJournalEditorOpen, editingJournalEntry, journalEditorInitialMode, activeScope, reset]);

  if (!isJournalEditorOpen) return null;

  const onSubmit = (data: JournalFormData) => {
    const author =
      data.userId === 'facu' ? 'Facu' : data.userId === 'maia' ? 'Maia' : 'Facu & Maia';

    const tags = editingJournalEntry?.tags || [];

    // Auto-derive clean title from content for DB storage and backwards compatibility
    const trimmedContent = data.content.trim();
    const firstLine = trimmedContent.split('\n')[0].trim();
    const autoTitle = firstLine.length > 55 ? `${firstLine.slice(0, 52)}...` : firstLine;

    const entryToSave: JournalEntry = {
      id: editingJournalEntry?.id || `journal-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      userId: data.userId,
      author,
      title: editingJournalEntry?.title || autoTitle || 'Entrada de diario',
      content: trimmedContent,
      entryType: data.entryType as EntryType,
      tags,
      createdAt: editingJournalEntry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveJournalEntry(entryToSave);
    addEtherFragments(20);
    showToast('¡Nota guardada en tu santuario! +20 Fragmentos de Éter', 'celebrate');
    closeJournalEditor();

    triggerCelebration({
      title: 'Registro anclado en tu realidad',
      message: `"${trimmedContent.slice(0, 80)}${trimmedContent.length > 80 ? '...' : ''}"`,
      fragments: 20,
      nextStepLabel: 'Girar el Oráculo',
      onNextStep: () => openOracle(),
      secondaryLabel: 'Seguir en el Santuario',
    });
  };

  const getModalTitle = () => {
    if (editingJournalEntry) {
      if (selectedEntryType === 'manifestation') return 'Editar Manifestación';
      if (selectedEntryType === 'progress') return 'Editar Avance de Manifestación';
      return 'Editar Success Story';
    }
    if (selectedEntryType === 'manifestation') return 'Nueva Manifestación Concreta';
    if (selectedEntryType === 'progress') return 'Nuevo Avance de Manifestación';
    return 'Nueva Success Story';
  };

  return (
    <AnimatePresence>
      <div
        onClick={closeJournalEditor}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-manifest-ink/35 backdrop-blur-sm"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32, mass: 0.8 }}
          className="w-full max-w-lg rounded-3xl glass-card p-5 sm:p-6 border border-white shadow-liquid space-y-4 max-h-[88dvh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/70">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-sm ${
                  selectedEntryType === 'manifestation'
                    ? 'bg-gradient-to-tr from-manifest-pink to-manifest-lavender text-manifest-auraPurple'
                    : selectedEntryType === 'progress'
                    ? 'bg-manifest-mint text-emerald-700'
                    : 'bg-amber-100 text-amber-700 border border-amber-200'
                }`}
              >
                {selectedEntryType === 'manifestation' ? (
                  <Target className="w-4 h-4" />
                ) : selectedEntryType === 'progress' ? (
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Trophy className="w-4 h-4 text-amber-600" />
                )}
              </div>
              <div>
                <h3 className="font-serif text-sm font-bold text-manifest-ink">
                  {getModalTitle()}
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={closeJournalEditor}
              className="p-1.5 rounded-full hover:bg-white/80 text-manifest-inkMuted hover:text-manifest-ink transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Espacio / Perfil */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-manifest-ink">
                Espacio
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'facu' as UserScope, label: 'Facu' },
                  { key: 'maia' as UserScope, label: 'Maia' },
                  { key: 'shared' as UserScope, label: '✨ Juntos' },
                ].map((sc) => (
                  <button
                    key={sc.key}
                    type="button"
                    onClick={() => setValue('userId', sc.key, { shouldDirty: true })}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                      selectedUserId === sc.key
                        ? 'bg-manifest-ink text-white border-manifest-ink shadow-sm'
                        : 'bg-white/70 hover:bg-white text-manifest-inkMuted border-white/80'
                    }`}
                  >
                    {sc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tipo de Entrada: Manifestación vs Avance de manifestación vs Success Story */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-manifest-ink">
                Tipo de entrada
              </label>
              <div className="grid grid-cols-3 gap-1 sm:gap-2 p-1 rounded-2xl bg-white/60 border border-white/80">
                {/* 1. Manifestación */}
                <button
                  type="button"
                  onClick={() => setValue('entryType', 'manifestation', { shouldDirty: true })}
                  className={`flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-[10.5px] sm:text-xs font-semibold tracking-tight transition-all cursor-pointer whitespace-nowrap ${
                    selectedEntryType === 'manifestation'
                      ? 'bg-gradient-to-tr from-manifest-pink/50 to-manifest-lavender text-manifest-auraPurple border border-manifest-auraPurple/40 shadow-sm'
                      : 'hover:bg-white/80 text-manifest-inkMuted'
                  }`}
                >
                  <Target className="w-3.5 h-3.5 shrink-0" />
                  <span>Manifestación</span>
                </button>

                {/* 2. Avance de manifestación (reemplaza Nota de Cuaderno) */}
                <button
                  type="button"
                  onClick={() => setValue('entryType', 'progress', { shouldDirty: true })}
                  className={`flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-[10.5px] sm:text-xs font-semibold tracking-tight transition-all cursor-pointer whitespace-nowrap ${
                    selectedEntryType === 'progress'
                      ? 'bg-manifest-mint text-emerald-800 border border-emerald-400/50 shadow-sm'
                      : 'hover:bg-white/80 text-manifest-inkMuted'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  <span>Avance</span>
                </button>

                {/* 3. Success Story (tercer botón) */}
                <button
                  type="button"
                  onClick={() => setValue('entryType', 'reflection', { shouldDirty: true })}
                  className={`flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-[10.5px] sm:text-xs font-semibold tracking-tight transition-all cursor-pointer whitespace-nowrap ${
                    selectedEntryType === 'reflection'
                      ? 'bg-amber-100/90 text-amber-900 border border-amber-300 shadow-sm'
                      : 'hover:bg-white/80 text-manifest-inkMuted'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                  <span>Success Story</span>
                </button>
              </div>
            </div>

            {/* Contenido con AutoResizeTextarea y Micrófono (Describe adaptado dinámicamente) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-manifest-ink block">
                {selectedEntryType === 'manifestation'
                  ? 'Describe tu manifestación'
                  : selectedEntryType === 'progress'
                  ? 'Describe el avance de manifestación'
                  : 'Describe tu Success Story'}
              </label>
              {isVoiceActiveContent ? (
                <VoiceAudioVisualizer
                  initialText={currentContent}
                  placeholder={
                    selectedEntryType === 'manifestation'
                      ? 'Describe tu manifestación en tiempo presente...'
                      : selectedEntryType === 'progress'
                      ? 'Describe el avance de manifestación...'
                      : 'Describe tu Success Story...'
                  }
                  onCommit={(fullText) => {
                    setValue('content', fullText, { shouldValidate: true, shouldDirty: true });
                    setIsVoiceActiveContent(false);
                  }}
                  onSend={(fullText) => {
                    setValue('content', fullText, { shouldValidate: true, shouldDirty: true });
                    setIsVoiceActiveContent(false);
                  }}
                  onCancel={() => setIsVoiceActiveContent(false)}
                />
              ) : (
                <div className="relative">
                  <Controller
                    name="content"
                    control={control}
                    render={({ field }) => (
                      <AutoResizeTextarea
                        {...field}
                        minRows={4}
                        placeholder={
                          selectedEntryType === 'manifestation'
                            ? 'Describe con total certeza y detalle sensorial lo que ya es tuyo en la realidad...'
                            : selectedEntryType === 'progress'
                            ? 'Describe qué avance viste, qué sincronía percibiste o qué paso diste...'
                            : 'Describe con gratitud el hecho consumado, cómo se materializó tu manifestación...'
                        }
                        className={`w-full p-3.5 pr-12 rounded-2xl glass-input text-base sm:text-xs placeholder:text-manifest-inkLight leading-relaxed transition-all ${
                          errors.content
                            ? 'border-rose-400 ring-1 ring-rose-400/50'
                            : currentContent.trim().length > 0
                            ? 'border-emerald-400 ring-1 ring-emerald-400/40'
                            : ''
                        }`}
                      />
                    )}
                  />

                  {/* Inline Status Icon: Check or Alert */}
                  <div className="absolute right-3 top-3 pointer-events-none">
                    {currentContent.trim().length > 0 && !errors.content && (
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs animate-in zoom-in duration-200">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    {errors.content && (
                      <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center shadow-xs animate-in zoom-in duration-200">
                        <AlertCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    )}
                  </div>

                  <div className="absolute right-2.5 bottom-2.5">
                    <button
                      type="button"
                      onClick={() => setIsVoiceActiveContent(true)}
                      title="Dictar contenido con micrófono"
                      aria-label="Dictar contenido con micrófono"
                      className="w-8 h-8 rounded-xl bg-white/80 hover:bg-white text-manifest-inkMuted hover:text-manifest-ink border border-white/90 shadow-sm flex items-center justify-center transition-all cursor-pointer"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Animated Inline Error Message */}
              <AnimatePresence>
                {errors.content && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -4 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-1.5 text-[11px] text-rose-500 font-medium pt-1 pl-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                      <span>{errors.content.message}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeJournalEditor}
                className="px-4 py-2.5 rounded-2xl text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink hover:bg-white/70 active:scale-95 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-2xl primary-gradient-btn text-xs font-semibold shadow-sm active:scale-95 transition-transform cursor-pointer"
              >
                {editingJournalEntry
                  ? 'Guardar Cambios'
                  : selectedEntryType === 'manifestation'
                  ? 'Guardar Manifestación'
                  : selectedEntryType === 'progress'
                  ? 'Guardar Avance'
                  : 'Guardar Success Story'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
