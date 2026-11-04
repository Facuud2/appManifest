'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Drawer } from 'vaul';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppStore } from '@/store';
import { Sparkles, X, Mic, Check, AlertCircle, Trash2, Moon, Heart } from 'lucide-react';
import { Affirmation, UserScope } from '@/types';
import { UserScopeEnum } from '@/schemas';
import { motion, AnimatePresence } from 'framer-motion';
import { IOS_TAP_SPRING, IOS_LAYOUT_SPRING, LIQUID_GLASS_SPECULAR } from '@/lib/iosSprings';
import { AutoResizeTextarea } from '@/components/ui/AutoResizeTextarea';
import { SmoothSizeContainer } from '@/components/ui/SmoothSizeContainer';
import { VoiceAudioVisualizer } from '@/components/ui/VoiceAudioVisualizer';
import { saveAffirmationVoiceAudio } from '@/lib/voiceStorage';
import { useIsDesktop } from '@/hooks/useIsDesktop';

const affirmationFormSchema = z.object({
  text: z
    .string()
    .refine((val) => val.trim().length >= 5, {
      message: 'Escribe al menos 5 caracteres con sentido',
    }),
  userId: UserScopeEnum,
});

type AffirmationFormData = z.infer<typeof affirmationFormSchema>;

export const AffirmationEditorModal: React.FC = () => {
  const isDesktop = useIsDesktop();
  const {
    isAffirmationEditorOpen,
    editingAffirmation,
    activeScope,
    saveAffirmation,
    closeAffirmationEditor,
    setPendingDeleteAffirmation,
    showToast,
    checkAndUnlockMilestones,
  } = useAppStore();

  const handleDeleteAffirmation = () => {
    if (!editingAffirmation) return;
    const toDelete = editingAffirmation;
    closeAffirmationEditor();
    setPendingDeleteAffirmation(toDelete);
  };

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
  const pendingVoiceBlobRef = useRef<Blob | null>(null);

  const trimmedLength = currentText.trim().length;
  const isTextValid = trimmedLength >= 5;
  const isFinishingEmptySession = !editingAffirmation && sessionAddedCount > 0 && trimmedLength === 0;
  const isSubmitDisabled = !isFinishingEmptySession && !isTextValid;

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

      // En PC: auto-enfocar y resaltar automáticamente el campo para comenzar a escribir de inmediato
      if (isDesktop) {
        const timer = setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            const len = textareaRef.current.value.length;
            textareaRef.current.setSelectionRange(len, len);
          }
        }, 60);
        return () => clearTimeout(timer);
      }
    }
  }, [isAffirmationEditorOpen, editingAffirmation, activeScope, reset, isDesktop]);

  // Tecla Escape para cerrar en PC
  useEffect(() => {
    if (!isAffirmationEditorOpen || !isDesktop) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeAffirmationEditor();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAffirmationEditorOpen, isDesktop, closeAffirmationEditor]);

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

    if (trimmed.length < 5) {
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

    if (pendingVoiceBlobRef.current) {
      saveAffirmationVoiceAudio(itemToSave.id, pendingVoiceBlobRef.current);
      pendingVoiceBlobRef.current = null;
    }

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
    // ⌘+Enter o Ctrl+Enter: guardar y cerrar directamente
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(onSubmit)();
      return;
    }

    // Enter sin Shift: encadenar múltiples o guardar si edita
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editingAffirmation) {
        handleSubmit(onSubmit)();
      } else {
        submitSingleAffirmation(currentText, true);
      }
    }
  };

  // ==========================================
  // VISTA PC: Pop-up centrado estilo macOS
  // ==========================================
  if (isDesktop) {
    return (
      <AnimatePresence>
        {isAffirmationEditorOpen && (
          <div
            data-testid="affirmation-desktop-backdrop"
            onClick={closeAffirmationEditor}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-md"
          >
            <motion.div
              data-testid="affirmation-desktop-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30, mass: 0.8 }}
              className="w-full max-w-lg rounded-3xl glass-card border border-manifest-glassBorder shadow-lens flex flex-col max-h-[88vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-manifest-glassBorder bg-manifest-surfaceElevated select-none">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-manifest-glassControl border border-manifest-glassBorder flex items-center justify-center shadow-xs">
                    <Sparkles className="w-4 h-4 text-manifest-auraPurple" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-manifest-ink tracking-tight">
                      {editingAffirmation ? 'Editar Decreto' : 'Nuevo Decreto'}
                    </h3>
                    <p className="text-[11px] text-manifest-inkLight">
                      {sessionAddedCount > 0
                        ? `${sessionAddedCount} decreto${sessionAddedCount > 1 ? 's' : ''} consagrado${sessionAddedCount > 1 ? 's' : ''}`
                        : 'Decretos conscientes en tiempo presente'}
                    </p>
                  </div>
                </div>

                {/* Right: Counter badge or quick close */}
                <div className="flex items-center gap-2">
                  {sessionAddedCount > 0 && (
                    <span className="text-[11px] font-semibold text-purple-800 px-2.5 py-0.5 rounded-full bg-purple-100/80 border border-purple-300/60 shadow-neu-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-700" />
                      <span>{sessionAddedCount} {sessionAddedCount === 1 ? 'añadido' : 'añadidos'}</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={closeAffirmationEditor}
                    className="p-1.5 rounded-xl text-manifest-inkLight hover:text-manifest-ink hover:bg-white/5 transition-colors cursor-pointer"
                    title="Cerrar (Esc)"
                    aria-label="Cerrar ventana"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4"
              >
                {/* Espacio Selector (Mac-style Segmented Control) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-manifest-ink block tracking-tight">
                    Espacio
                  </label>
                  <div className="p-1 rounded-xl bg-manifest-ink/[0.05] border border-manifest-ink/[0.06] grid grid-cols-3 gap-1 shadow-inner">
                    {[
                      { key: 'facu' as UserScope, label: 'Facu', icon: Moon },
                      { key: 'maia' as UserScope, label: 'Maia', icon: Heart },
                      { key: 'shared' as UserScope, label: 'Juntos', icon: Sparkles },
                    ].map((sc) => {
                      const Icon = sc.icon;
                      const isSelected = selectedUserId === sc.key;
                      return (
                        <button
                          key={sc.key}
                          type="button"
                          onClick={() => setValue('userId', sc.key, { shouldDirty: true })}
                          className={`py-1.5 px-3 rounded-lg text-xs transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'bg-white text-manifest-ink shadow-sm font-semibold border border-white/80'
                              : 'text-manifest-inkMuted hover:text-manifest-ink hover:bg-white/40 font-medium'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-purple-600' : 'text-manifest-inkLight'}`} />
                          <span>{sc.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Textarea Field with Auto-Focus and Resaltado Mac */}
                <div ref={validationRef} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-manifest-ink block tracking-tight">
                      Decreto o Afirmación
                    </label>
                    <span className="text-[11px] text-manifest-inkMuted">
                      {currentText.length > 0 ? `${currentText.length} caracteres` : 'Escribe tu decreto'}
                    </span>
                  </div>

                  {isVoiceActive ? (
                    <VoiceAudioVisualizer
                      initialText={currentText}
                      placeholder="Habla ahora para tu afirmación..."
                      onCommit={(fullText, extra) => {
                        setValue('text', fullText, { shouldValidate: true, shouldDirty: true });
                        if (extra?.audioBlob) {
                          pendingVoiceBlobRef.current = extra.audioBlob;
                          if (editingAffirmation?.id) {
                            saveAffirmationVoiceAudio(editingAffirmation.id, extra.audioBlob);
                          }
                        }
                        setIsVoiceActive(false);
                      }}
                      onSend={(fullText) => {
                        setValue('text', fullText, { shouldValidate: true, shouldDirty: true });
                        setIsVoiceActive(false);
                      }}
                      onCancel={() => setIsVoiceActive(false)}
                    />
                  ) : (
                    <div className="relative group">
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
                            autoFocus
                            enterKeyHint="send"
                            onKeyDown={handleKeyDown}
                            minRows={3}
                            maxHeight={220}
                            placeholder={
                              sessionAddedCount > 0
                                ? 'Escribe otra afirmación y pulsa Enter para añadirla...'
                                : 'Escribe en tiempo presente... (Ej: Atraigo abundancia, tranquilidad y felicidad cada día)'
                            }
                            className={`w-full p-4 pr-12 rounded-2xl glass-input text-xs sm:text-sm placeholder:text-manifest-inkLight leading-relaxed transition-all focus:outline-none ${
                              errors.text
                                ? 'border-rose-400 ring-2 ring-rose-400/50'
                                : currentText.trim().length > 0
                                ? 'border-emerald-400 ring-2 ring-emerald-400/40'
                                : 'border-manifest-auraPurple/80 ring-2 ring-manifest-auraPurple/30 shadow-[0_0_16px_rgba(184,163,248,0.25)]'
                            }`}
                          />
                        )}
                      />

                      {/* Status Icon */}
                      <div className="absolute right-3.5 top-3.5 pointer-events-none">
                        {isTextValid && !errors.text && (
                          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                        {(errors.text || (trimmedLength > 0 && !isTextValid)) && (
                          <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center shadow-xs">
                            <AlertCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                        )}
                      </div>

                      {/* Mic Button */}
                      <div className="absolute right-3 bottom-3">
                        <button
                          type="button"
                          onClick={() => setIsVoiceActive(true)}
                          title="Dictar manifestación con micrófono"
                          aria-label="Dictar manifestación con micrófono"
                          className="w-8 h-8 rounded-xl glass-pill text-purple-700 border border-purple-300/50 hover:bg-purple-100/70 shadow-neu-sm flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Mic className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Inline Error with Spring Smooth Sizing */}
                  <SmoothSizeContainer>
                    {(errors.text || (trimmedLength > 0 && !isTextValid)) && (
                      <div
                        data-testid="affirmation-text-error"
                        className="flex items-center gap-1.5 text-[11px] text-rose-500 font-medium pt-1 pl-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                        <span>{errors.text?.message || 'Escribe al menos 5 caracteres con sentido'}</span>
                      </div>
                    )}
                  </SmoothSizeContainer>
                </div>
              </form>

              {/* Mac Dialog Footer */}
              <div className="shrink-0 flex items-center justify-between px-6 py-4 bg-manifest-ink/[0.02] border-t border-manifest-ink/[0.07]">
                <div className="flex items-center gap-2 text-[11px] text-manifest-inkLight">
                  {!editingAffirmation ? (
                    <>
                      <span><strong>Enter</strong> para encadenar</span>
                      <span>•</span>
                      <span><strong>⌘↵</strong> para finalizar</span>
                    </>
                  ) : (
                    <span><strong>⌘↵</strong> o botón para guardar</span>
                  )}
                </div>
                <div className="flex items-center gap-2.5">
                  {editingAffirmation && (
                    <button
                      type="button"
                      onClick={handleDeleteAffirmation}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-100/80 hover:bg-rose-100 border border-rose-300/60 shadow-neu-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={closeAffirmationEditor}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink glass-pill border border-purple-500/20 shadow-xs transition-colors cursor-pointer"
                  >
                    {sessionAddedCount > 0 ? 'Listo' : 'Cancelar'}
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitDisabled}
                    data-testid="submit-affirmation-btn"
                    onClick={() => {
                      if (!currentText.trim() && sessionAddedCount > 0) {
                        closeAffirmationEditor();
                      } else if (isTextValid) {
                        handleSubmit(onSubmit)();
                      }
                    }}
                    className={`px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-manifest-auraPurple via-purple-600 to-indigo-600 shadow-[0_2px_8px_rgba(184,163,248,0.35)] transition-all flex items-center gap-1.5 ${
                      isSubmitDisabled
                        ? 'opacity-40 pointer-events-none cursor-not-allowed'
                        : 'hover:opacity-95 active:scale-[0.98] cursor-pointer'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {editingAffirmation
                        ? 'Guardar Cambios'
                        : sessionAddedCount > 0 && !currentText.trim()
                        ? 'Finalizar Sesión'
                        : 'Guardar Afirmación'}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  // ==========================================
  // VISTA MÓVIL: Drawer nativo iOS (Vaul)
  // ESTRICTAMENTE INTACTO PARA DISPOSITIVOS MÓVILES
  // ==========================================
  return (
    <Drawer.Root
      open={isAffirmationEditorOpen}
      onOpenChange={(open) => {
        if (!open) closeAffirmationEditor();
      }}
      handleOnly
      repositionInputs={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-sm" />
        <Drawer.Content
          data-testid="affirmation-vaul-drawer"
          className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-lg rounded-t-[2rem] border-t border-purple-200/80 bg-white/98 backdrop-blur-2xl p-5 sm:p-6 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] shadow-[0_-12px_40px_rgba(30,20,50,0.14)] outline-none flex flex-col max-h-[90dvh]"
        >
          {/* iOS Native Grabber Handle */}
          <Drawer.Handle
            data-testid="ios-sheet-grabber"
            className="mx-auto w-12 h-1.5 shrink-0 rounded-full bg-slate-300 mb-2 cursor-grab active:cursor-grabbing touch-none"
          />

          <Drawer.Title className="sr-only">
            {editingAffirmation ? 'Editar Afirmación' : 'Nueva Afirmación'}
          </Drawer.Title>
          <Drawer.Description className="sr-only">
            Decretos conscientes y afirmaciones en tiempo presente
          </Drawer.Description>

          {/* iOS Compact Navigation Bar (h-14 px-4) */}
          <div className="shrink-0 h-14 -mx-5 sm:-mx-6 -mt-2 px-4 sm:px-6 flex items-center justify-between border-b border-purple-100/80 bg-white/90 backdrop-blur-md z-10">
            <button
              type="button"
              onClick={closeAffirmationEditor}
              className="text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors cursor-pointer px-1 py-1"
            >
              {sessionAddedCount > 0 ? 'Listo' : 'Cancelar'}
            </button>

            <div className="text-center truncate px-2">
              <h3 className="font-serif text-sm sm:text-base font-bold text-slate-900 truncate">
                {editingAffirmation ? 'Editar Decreto' : 'Nuevo Decreto'}
              </h3>
            </div>

            <motion.button
              type="button"
              whileTap={IOS_TAP_SPRING}
              disabled={isSubmitDisabled}
              data-testid="submit-affirmation-nav-btn"
              onClick={() => {
                if (!currentText.trim() && sessionAddedCount > 0) {
                  closeAffirmationEditor();
                } else if (isTextValid) {
                  handleSubmit(onSubmit)();
                }
              }}
              className={`primary-gradient-btn text-white px-4 py-1.5 rounded-full font-semibold text-xs sm:text-sm shadow-xs transition-all ${
                isSubmitDisabled
                  ? 'opacity-40 pointer-events-none cursor-not-allowed'
                  : 'hover:opacity-95 active:scale-95 cursor-pointer'
              }`}
            >
              {editingAffirmation
                ? 'Guardar'
                : sessionAddedCount > 0 && !currentText.trim()
                ? 'Finalizar'
                : 'Guardar'}
            </motion.button>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            data-vaul-no-drag=""
            className="space-y-4 pt-3 overflow-y-auto overscroll-contain touch-pan-y flex-1 min-h-0 pr-0.5 pb-8"
          >
            {/* Espacio / Perfil */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800">
                Espacio
              </label>
              <div className="relative p-1 rounded-2xl bg-purple-50/70 border border-purple-100 grid grid-cols-3 gap-1 shadow-inner">
                {[
                  { key: 'facu' as UserScope, label: 'Facu', icon: Moon, activeText: 'text-indigo-950', activeIcon: 'text-indigo-600' },
                  { key: 'maia' as UserScope, label: 'Maia', icon: Heart, activeText: 'text-pink-950', activeIcon: 'text-pink-600' },
                  { key: 'shared' as UserScope, label: 'Juntos', icon: Sparkles, activeText: 'text-purple-950', activeIcon: 'text-purple-600' },
                ].map((sc) => {
                  const Icon = sc.icon;
                  const isSelected = selectedUserId === sc.key;
                  return (
                    <button
                      key={sc.key}
                      type="button"
                      onClick={() => setValue('userId', sc.key, { shouldDirty: true })}
                      className={`relative z-10 py-2 px-2 rounded-xl text-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? `${sc.activeText} font-bold shadow-xs`
                          : 'text-slate-600 hover:text-slate-900 font-medium'
                      }`}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="affirmation-drawer-scope-pill"
                          className="absolute inset-0 rounded-xl bg-white border border-purple-200/90 shadow-[0_2px_8px_rgba(99,102,241,0.12)] -z-10"
                          transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                        />
                      )}
                      <Icon className={`w-3.5 h-3.5 shrink-0 transition-transform ${isSelected ? `scale-105 ${sc.activeIcon}` : 'text-slate-500'}`} />
                      <span>{sc.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Texto de Manifestación con AutoResize y Voz */}
            <div ref={validationRef} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-800 block">
                  Decreto o Afirmación
                </label>
                {sessionAddedCount > 0 && (
                  <span className="text-[11px] font-semibold text-purple-800 px-2.5 py-0.5 rounded-full bg-purple-100/80 border border-purple-300/60 shadow-neu-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-700 inline" />
                    <span>{sessionAddedCount} {sessionAddedCount === 1 ? 'añadida' : 'añadidas'}</span>
                  </span>
                )}
              </div>
              {isVoiceActive ? (
                <VoiceAudioVisualizer
                  initialText={currentText}
                  placeholder="Habla ahora para tu afirmación..."
                  onCommit={(fullText, extra) => {
                    setValue('text', fullText, { shouldValidate: true, shouldDirty: true });
                    if (extra?.audioBlob) {
                      pendingVoiceBlobRef.current = extra.audioBlob;
                      if (editingAffirmation?.id) {
                        saveAffirmationVoiceAudio(editingAffirmation.id, extra.audioBlob);
                      }
                    }
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
                        onKeyDown={handleKeyDown}
                        minRows={3}
                        maxHeight={240}
                        onFocus={(e) => {
                          const el = e.currentTarget;
                          setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 150);
                        }}
                        placeholder={
                          sessionAddedCount > 0
                            ? 'Escribe otra afirmación y pulsa Enter para añadirla...'
                            : 'Escribe en tiempo presente... (Ej: Atraigo abundancia, tranquilidad y felicidad cada día)'
                        }
                        className={`w-full p-3.5 pr-12 rounded-2xl bg-white border border-purple-200/90 text-slate-900 text-base sm:text-xs placeholder:text-slate-400 leading-relaxed transition-all shadow-xs focus:border-purple-500 focus:ring-2 focus:ring-purple-400/25 outline-none ${
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
                    {isTextValid && !errors.text && (
                      <div className="w-5 h-5 rounded-full bg-emerald-100/80 text-emerald-700 border border-emerald-300/60 flex items-center justify-center shadow-neu-sm">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    {(errors.text || (trimmedLength > 0 && !isTextValid)) && (
                      <div className="w-5 h-5 rounded-full bg-rose-100/80 text-rose-700 border border-rose-300/60 flex items-center justify-center shadow-neu-sm">
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
                      className="w-8 h-8 rounded-xl glass-pill text-purple-700 border border-purple-300/50 hover:bg-purple-100/70 shadow-neu-sm flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Auto-animated Inline Error Message with SmoothSizeContainer */}
              <SmoothSizeContainer>
                {(errors.text || (trimmedLength > 0 && !isTextValid)) && (
                  <div
                    data-testid="affirmation-text-error"
                    className="flex items-center gap-1.5 text-[11px] text-rose-500 font-medium pt-1 pl-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span>{errors.text?.message || 'Escribe al menos 5 caracteres con sentido'}</span>
                  </div>
                )}
              </SmoothSizeContainer>
            </div>

            {/* Flow Action Buttons: sin botón duplicado abajo */}
            <motion.div
              layout="position"
              transition={IOS_LAYOUT_SPRING}
              className="pt-2 pb-4 space-y-2"
            >
              {!editingAffirmation && (
                <p className="text-[11px] text-manifest-inkLight text-center py-1">
                  Pulsa Enter para añadir varias afirmaciones seguidas
                </p>
              )}

              {editingAffirmation && (
                <motion.button
                  type="button"
                  layout="position"
                  transition={IOS_LAYOUT_SPRING}
                  whileTap={IOS_TAP_SPRING}
                  onClick={handleDeleteAffirmation}
                  className="w-full py-2.5 px-4 rounded-2xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/90 font-semibold text-xs sm:text-sm shadow-xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar Decreto</span>
                </motion.button>
              )}
            </motion.div>
          </form>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
