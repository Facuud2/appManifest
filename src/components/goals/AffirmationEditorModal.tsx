'use client';

import React, { useEffect, useState } from 'react';
import { Drawer } from 'vaul';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppStore } from '@/store';
import { Sparkles, X, Mic, Check, AlertCircle } from 'lucide-react';
import { Affirmation, UserScope } from '@/types';
import { UserScopeEnum } from '@/schemas';
import { motion } from 'framer-motion';
import { IOS_TAP_SPRING, LIQUID_GLASS_SPECULAR } from '@/lib/iosSprings';
import { AutoResizeTextarea } from '@/components/ui/AutoResizeTextarea';
import { VoiceAudioVisualizer } from '@/components/ui/VoiceAudioVisualizer';

const affirmationFormSchema = z.object({
  text: z.string().min(1, 'Escribe tu manifestación o afirmación consciente'),
  userId: UserScopeEnum,
});

type AffirmationFormData = z.infer<typeof affirmationFormSchema>;

export const AffirmationEditorModal: React.FC = () => {
  const {
    isAffirmationEditorOpen,
    editingAffirmation,
    activeScope,
    saveAffirmation,
    closeAffirmationEditor,
    showToast,
    checkAndUnlockMilestones,
  } = useAppStore();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AffirmationFormData>({
    resolver: zodResolver(affirmationFormSchema),
    mode: 'onChange',
    defaultValues: {
      text: '',
      userId: activeScope,
    },
  });

  const selectedUserId = watch('userId');
  const currentText = watch('text') || '';
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [sessionAddedCount, setSessionAddedCount] = useState(0);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [validationRef] = useAutoAnimate<HTMLDivElement>({ duration: 180 });

  useEffect(() => {
    if (isAffirmationEditorOpen) {
      setSessionAddedCount(0);
      if (editingAffirmation) {
        reset({
          text: editingAffirmation.text,
          userId: editingAffirmation.userId || activeScope,
        });
      } else {
        reset({
          text: '',
          userId: activeScope,
        });
      }
    }
  }, [isAffirmationEditorOpen, editingAffirmation, activeScope, reset]);

  const submitSingleAffirmation = (textToSave: string, chainNext = false) => {
    const trimmed = textToSave.trim();
    if (!trimmed) {
      if (chainNext) return false;
      if (sessionAddedCount > 0) {
        closeAffirmationEditor();
        return true;
      }
      return false;
    }

    // Detección activa de cambios al editar: si no hubo modificaciones, cerrar silenciosamente
    if (editingAffirmation) {
      const origText = (editingAffirmation.text || '').trim();
      const origUserId = editingAffirmation.userId || activeScope;
      const hasChanges = trimmed !== origText || selectedUserId !== origUserId;
      if (!hasChanges) {
        closeAffirmationEditor();
        return true;
      }
    }

    const isEditing = Boolean(editingAffirmation);

    const author =
      selectedUserId === 'facu' ? 'Facu' : selectedUserId === 'maia' ? 'Maia' : 'Facu & Maia';

    const itemToSave: Affirmation = {
      id: editingAffirmation?.id || `aff-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: selectedUserId,
      author,
      text: trimmed,
      repeatCount: editingAffirmation?.repeatCount ?? 1,
      pinned: editingAffirmation?.pinned ?? false,
      order: editingAffirmation?.order,
      createdAt: editingAffirmation?.createdAt || new Date().toISOString(),
      lastRepeatedAt: editingAffirmation?.lastRepeatedAt || new Date().toISOString(),
    };

    saveAffirmation(itemToSave);

    if (editingAffirmation || !chainNext) {
      closeAffirmationEditor();
      if (isEditing) {
        // Al editar: no re-evaluar ni disparar modales de recompensas / gambling
        showToast('Afirmación actualizada', 'gentle');
      } else {
        const unlocked = checkAndUnlockMilestones();
        if (unlocked.length === 0) {
          showToast('Afirmación guardada', 'gentle');
        }
      }
    } else {
      // Trello functionality: clear and keep focus ready for next affirmation
      const unlocked = checkAndUnlockMilestones({ suppressModal: true });
      if (unlocked.length === 0) {
        showToast('Afirmación añadida', 'gentle');
      }
      setValue('text', '', { shouldValidate: false, shouldDirty: false });
      setSessionAddedCount((prev) => prev + 1);
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    }
    return true;
  };

  const onSubmit = (data: AffirmationFormData) => {
    submitSingleAffirmation(data.text, false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editingAffirmation) {
        handleSubmit(onSubmit)();
      } else {
        submitSingleAffirmation(currentText, true);
      }
    }
  };

  return (
    <Drawer.Root
      open={isAffirmationEditorOpen}
      onOpenChange={(open) => {
        if (!open) closeAffirmationEditor();
      }}
      shouldScaleBackground
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-manifest-ink/35 backdrop-blur-sm" />
        <Drawer.Content
          data-testid="affirmation-vaul-drawer"
          className={`fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-lg rounded-t-[2.25rem] ${LIQUID_GLASS_SPECULAR} bg-white/85 p-5 sm:p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-liquid outline-none flex flex-col max-h-[90dvh]`}
        >
          {/* iOS Native Grabber Handle */}
          <div
            data-testid="ios-sheet-grabber"
            className="mx-auto w-12 h-1.5 shrink-0 rounded-full bg-manifest-ink/20 mb-3.5 cursor-grab active:cursor-grabbing"
          />

          <Drawer.Title className="sr-only">
            {editingAffirmation ? 'Editar Afirmación' : 'Nueva Afirmación'}
          </Drawer.Title>
          <Drawer.Description className="sr-only">
            Decretos conscientes y afirmaciones en tiempo presente
          </Drawer.Description>

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/70 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-manifest-lavender to-manifest-celeste flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-manifest-auraPurple" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-bold text-manifest-ink">
                  {editingAffirmation ? 'Editar Afirmación' : 'Nueva Afirmación'}
                </h3>
                <p className="text-[11px] text-manifest-inkMuted">
                  Decretos conscientes y afirmaciones en tiempo presente
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeAffirmationEditor}
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

            {/* Texto de Manifestación con AutoResize y Voz */}
            <div ref={validationRef} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-manifest-ink block">
                  Decreto o Afirmación
                </label>
                {sessionAddedCount > 0 && (
                  <span className="text-[11px] font-semibold text-manifest-auraPurple px-2.5 py-0.5 rounded-full bg-manifest-lavender/50 border border-manifest-auraPurple/30">
                    ✨ {sessionAddedCount} {sessionAddedCount === 1 ? 'añadida' : 'añadidas'}
                  </span>
                )}
              </div>
              {isVoiceActive ? (
                <VoiceAudioVisualizer
                  initialText={currentText}
                  placeholder="Habla ahora para tu afirmación..."
                  onCommit={(fullText) => {
                    setValue('text', fullText, { shouldValidate: true, shouldDirty: true });
                    setIsVoiceActive(false);
                  }}
                  onSend={(fullText) => {
                    setValue('text', fullText, { shouldValidate: true, shouldDirty: true });
                    setIsVoiceActive(false);
                  }}
                  onCancel={() => setIsVoiceActive(false)}
                />
              ) : (
                <div className="relative">
                  <Controller
                    name="text"
                    control={control}
                    render={({ field }) => (
                      <AutoResizeTextarea
                        {...field}
                        ref={(el) => {
                          field.ref(el);
                          textareaRef.current = el;
                        }}
                        enterKeyHint="send"
                        onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                        onKeyDown={handleKeyDown}
                        minRows={3}
                        placeholder={
                          sessionAddedCount > 0
                            ? 'Escribe otra afirmación y pulsa Enter para añadirla...'
                            : 'Escribe en tiempo presente... (Ej: Atraigo abundancia, tranquilidad y felicidad cada día)'
                        }
                        className={`w-full p-3.5 pr-12 rounded-2xl glass-input text-base sm:text-xs placeholder:text-manifest-inkLight leading-relaxed transition-colors ${
                          errors.text
                            ? 'border-rose-400 ring-1 ring-rose-400/50'
                            : currentText.trim().length > 0
                            ? 'border-emerald-400 ring-1 ring-emerald-400/40'
                            : ''
                        }`}
                      />
                    )}
                  />

                  {/* Inline Status Icon: Check or Alert */}
                  <div className="absolute right-3 top-3 pointer-events-none">
                    {currentText.trim().length > 0 && !errors.text && (
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    {errors.text && (
                      <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center shadow-xs">
                        <AlertCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    )}
                  </div>

                  <div className="absolute right-2.5 bottom-2.5">
                    <button
                      type="button"
                      onClick={() => setIsVoiceActive(true)}
                      title="Dictar manifestación con micrófono"
                      aria-label="Dictar manifestación con micrófono"
                      className="w-8 h-8 rounded-xl bg-white/80 hover:bg-white text-manifest-inkMuted hover:text-manifest-ink border border-white/90 shadow-sm flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Auto-animated Inline Error Message */}
              {errors.text && (
                <div
                  data-testid="affirmation-text-error"
                  className="flex items-center gap-1.5 text-[11px] text-rose-500 font-medium pt-1 pl-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span>{errors.text.message}</span>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <span className="text-[11px] text-manifest-inkLight hidden sm:inline">
                {!editingAffirmation && 'Pulsa Enter para añadir varias seguidas'}
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <motion.button
                  type="button"
                  whileTap={IOS_TAP_SPRING}
                  onClick={closeAffirmationEditor}
                  className="px-4 py-2.5 rounded-2xl text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink hover:bg-white/70 transition-colors cursor-pointer"
                >
                  {sessionAddedCount > 0 ? 'Listo' : 'Cancelar'}
                </motion.button>
                <motion.button
                  type="button"
                  whileTap={IOS_TAP_SPRING}
                  data-testid="submit-affirmation-btn"
                  onClick={() => {
                    if (!currentText.trim() && sessionAddedCount > 0) {
                      closeAffirmationEditor();
                    } else {
                      handleSubmit(onSubmit)();
                    }
                  }}
                  className="px-5 py-2.5 rounded-2xl primary-gradient-btn text-xs font-semibold shadow-sm cursor-pointer"
                >
                  {editingAffirmation
                    ? 'Guardar Cambios'
                    : sessionAddedCount > 0 && !currentText.trim()
                    ? 'Finalizar'
                    : 'Guardar Afirmación'}
                </motion.button>
              </div>
            </div>
          </form>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
