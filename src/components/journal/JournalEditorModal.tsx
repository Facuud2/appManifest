'use client';

import React, { useEffect, useState } from 'react';
import { Drawer } from 'vaul';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppStore } from '@/store';
import { X, Target, Sparkles, Trophy, Mic, Check, AlertCircle } from 'lucide-react';
import { EntryType, JournalEntry, UserScope } from '@/types';
import { UserScopeEnum } from '@/schemas';
import { motion } from 'framer-motion';
import { IOS_TAP_SPRING, LIQUID_GLASS_SPECULAR } from '@/lib/iosSprings';
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
    showToast,
    checkAndUnlockMilestones,
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
  const [validationContainerRef] = useAutoAnimate<HTMLDivElement>({ duration: 180 });

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

  const onSubmit = (data: JournalFormData) => {
    const trimmedContent = data.content.trim();

    // Detección activa de cambios al editar: si no hubo modificaciones, cerrar silenciosamente
    if (editingJournalEntry) {
      const origContent = (editingJournalEntry.content || '').trim();
      const origUserId = editingJournalEntry.userId || activeScope;
      const origType: 'manifestation' | 'progress' | 'reflection' =
        editingJournalEntry.entryType === 'progress'
          ? 'progress'
          : editingJournalEntry.entryType === 'reflection'
          ? 'reflection'
          : 'manifestation';

      const hasChanges =
        trimmedContent !== origContent ||
        data.userId !== origUserId ||
        data.entryType !== origType;

      if (!hasChanges) {
        closeJournalEditor();
        return;
      }
    }

    const isEditing = Boolean(editingJournalEntry);

    const author =
      data.userId === 'facu' ? 'Facu' : data.userId === 'maia' ? 'Maia' : 'Facu & Maia';

    const tags = editingJournalEntry?.tags || [];

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
    closeJournalEditor();

    if (isEditing) {
      // Al editar: no re-evaluar ni disparar modales de recompensas / gambling
      showToast('Entrada actualizada', 'gentle');
    } else {
      const unlocked = checkAndUnlockMilestones();
      if (unlocked.length === 0) {
        showToast('Entrada guardada en tu diario', 'gentle');
      }
    }
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
    <Drawer.Root
      open={isJournalEditorOpen}
      onOpenChange={(open) => {
        if (!open) closeJournalEditor();
      }}
      handleOnly
      repositionInputs={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-manifest-ink/35 backdrop-blur-sm" />
        <Drawer.Content
          data-testid="journal-vaul-drawer"
          className={`fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-lg rounded-t-[2.25rem] ${LIQUID_GLASS_SPECULAR} bg-white/85 p-5 sm:p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-liquid outline-none flex flex-col max-h-[92dvh]`}
        >
          {/* iOS Native Grabber Handle */}
          <Drawer.Handle
            data-testid="ios-sheet-grabber"
            className="mx-auto w-12 h-1.5 shrink-0 rounded-full bg-manifest-ink/20 mb-3.5 cursor-grab active:cursor-grabbing"
          />

          <Drawer.Title className="sr-only">{getModalTitle()}</Drawer.Title>
          <Drawer.Description className="sr-only">
            Formulario para escribir o editar una entrada en tu diario manifestador
          </Drawer.Description>

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/70 shrink-0">
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

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 pt-3 overflow-y-auto flex-1 min-h-0 pr-0.5"
          >
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
                  <motion.button
                    key={sc.key}
                    type="button"
                    whileTap={IOS_TAP_SPRING}
                    onClick={() => setValue('userId', sc.key, { shouldDirty: true })}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-colors border cursor-pointer ${
                      selectedUserId === sc.key
                        ? 'bg-manifest-ink text-white border-manifest-ink shadow-sm'
                        : 'bg-white/70 hover:bg-white text-manifest-inkMuted border-white/80'
                    }`}
                  >
                    {sc.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Tipo de Entrada: Manifestación vs Avance de manifestación vs Success Story */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-manifest-ink">
                Tipo de entrada
              </label>
              <div className="grid grid-cols-3 gap-1 sm:gap-2 p-1 rounded-2xl bg-white/60 border border-white/80">
                <motion.button
                  type="button"
                  whileTap={IOS_TAP_SPRING}
                  onClick={() => setValue('entryType', 'manifestation', { shouldDirty: true })}
                  className={`flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-[10.5px] sm:text-xs font-semibold tracking-tight transition-colors cursor-pointer whitespace-nowrap ${
                    selectedEntryType === 'manifestation'
                      ? 'bg-gradient-to-tr from-manifest-pink/50 to-manifest-lavender text-manifest-auraPurple border border-manifest-auraPurple/40 shadow-sm'
                      : 'hover:bg-white/80 text-manifest-inkMuted'
                  }`}
                >
                  <Target className="w-3.5 h-3.5 shrink-0" />
                  <span>Manifestación</span>
                </motion.button>

                <motion.button
                  type="button"
                  whileTap={IOS_TAP_SPRING}
                  onClick={() => setValue('entryType', 'progress', { shouldDirty: true })}
                  className={`flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-[10.5px] sm:text-xs font-semibold tracking-tight transition-colors cursor-pointer whitespace-nowrap ${
                    selectedEntryType === 'progress'
                      ? 'bg-manifest-mint text-emerald-800 border border-emerald-400/50 shadow-sm'
                      : 'hover:bg-white/80 text-manifest-inkMuted'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  <span>Avance</span>
                </motion.button>

                <motion.button
                  type="button"
                  whileTap={IOS_TAP_SPRING}
                  onClick={() => setValue('entryType', 'reflection', { shouldDirty: true })}
                  className={`flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-[10.5px] sm:text-xs font-semibold tracking-tight transition-colors cursor-pointer whitespace-nowrap ${
                    selectedEntryType === 'reflection'
                      ? 'bg-amber-100/90 text-amber-900 border border-amber-300 shadow-sm'
                      : 'hover:bg-white/80 text-manifest-inkMuted'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                  <span>Success Story</span>
                </motion.button>
              </div>
            </div>

            {/* Contenido con AutoResizeTextarea y Micrófono */}
            <div ref={validationContainerRef} className="space-y-1.5">
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
                        data-testid="journal-content-input"
                        onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                        minRows={4}
                        placeholder={
                          selectedEntryType === 'manifestation'
                            ? 'Describe con total certeza y detalle sensorial lo que ya es tuyo en la realidad...'
                            : selectedEntryType === 'progress'
                            ? 'Describe qué avance viste, qué sincronía percibiste o qué paso diste...'
                            : 'Describe con gratitud el hecho consumado, cómo se materializó tu manifestación...'
                        }
                        className={`w-full p-3.5 pr-12 rounded-2xl glass-input text-base sm:text-xs placeholder:text-manifest-inkLight leading-relaxed transition-colors ${
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
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    {errors.content && (
                      <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center shadow-xs">
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
                      className="w-8 h-8 rounded-xl bg-white/80 hover:bg-white text-manifest-inkMuted hover:text-manifest-ink border border-white/90 shadow-sm flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Auto-animated Inline Error Message */}
              {errors.content && (
                <div
                  data-testid="journal-content-error"
                  className="flex items-center gap-1.5 text-[11px] text-rose-500 font-medium pt-1 pl-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span>{errors.content.message}</span>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <motion.button
                type="button"
                whileTap={IOS_TAP_SPRING}
                onClick={closeJournalEditor}
                className="px-4 py-2.5 rounded-2xl text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink hover:bg-white/70 transition-colors cursor-pointer"
              >
                Cancelar
              </motion.button>
              <motion.button
                type="submit"
                whileTap={IOS_TAP_SPRING}
                data-testid="submit-journal-btn"
                className="px-5 py-2.5 rounded-2xl primary-gradient-btn text-xs font-semibold shadow-sm cursor-pointer"
              >
                {editingJournalEntry
                  ? 'Guardar Cambios'
                  : selectedEntryType === 'manifestation'
                  ? 'Guardar Manifestación'
                  : selectedEntryType === 'progress'
                  ? 'Guardar Avance'
                  : 'Guardar Success Story'}
              </motion.button>
            </div>
          </form>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
