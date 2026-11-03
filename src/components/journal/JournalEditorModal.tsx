'use client';

import React, { useEffect, useState } from 'react';
import { Drawer } from 'vaul';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppStore } from '@/store';
import { X, Target, Sparkles, Trophy, Mic, Check, AlertCircle, Trash2, Moon, Heart } from 'lucide-react';
import { EntryType, JournalEntry, UserScope } from '@/types';
import { UserScopeEnum } from '@/schemas';
import { motion, AnimatePresence } from 'framer-motion';
import { IOS_TAP_SPRING, IOS_LAYOUT_SPRING, LIQUID_GLASS_SPECULAR } from '@/lib/iosSprings';
import { AutoResizeTextarea } from '@/components/ui/AutoResizeTextarea';
import { SmoothSizeContainer } from '@/components/ui/SmoothSizeContainer';
import { VoiceAudioVisualizer } from '@/components/ui/VoiceAudioVisualizer';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { PremiumToggleSelector } from '@/components/ui/PremiumToggleSelector';

const journalFormSchema = z.object({
  content: z.string().min(1, 'Describe tu entrada antes de guardar'),
  userId: UserScopeEnum,
  entryType: z.enum(['manifestation', 'progress', 'reflection']),
});

type JournalFormData = z.infer<typeof journalFormSchema>;

export const JournalEditorModal: React.FC = () => {
  const isDesktop = useIsDesktop();
  const {
    isJournalEditorOpen,
    journalEditorInitialMode,
    editingJournalEntry,
    activeScope,
    saveJournalEntry,
    closeJournalEditor,
    setPendingDeleteJournalEntry,
    showToast,
    checkAndUnlockMilestones,
  } = useAppStore();

  const handleDeleteJournalEntry = () => {
    if (!editingJournalEntry) return;
    const toDelete = editingJournalEntry;
    closeJournalEditor();
    setPendingDeleteJournalEntry(toDelete);
  };

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
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

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
  }, [isJournalEditorOpen, editingJournalEntry, journalEditorInitialMode, activeScope, reset, isDesktop]);

  // Tecla Escape para cerrar en PC
  useEffect(() => {
    if (!isJournalEditorOpen || !isDesktop) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeJournalEditor();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isJournalEditorOpen, isDesktop, closeJournalEditor]);

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

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  // ==========================================
  // VISTA PC: Pop-up centrado estilo macOS
  // ==========================================
  if (isDesktop) {
    return (
      <AnimatePresence>
        {isJournalEditorOpen && (
          <div
            data-testid="journal-desktop-backdrop"
            onClick={closeJournalEditor}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-md"
          >
            <motion.div
              data-testid="journal-desktop-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30, mass: 0.8 }}
              className="w-full max-w-xl rounded-3xl glass-card border border-manifest-glassBorder shadow-lens flex flex-col max-h-[88vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-manifest-glassBorder bg-manifest-surfaceElevated select-none">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-manifest-glassControl border border-manifest-glassBorder flex items-center justify-center shadow-xs">
                    {selectedEntryType === 'manifestation' ? (
                      <Sparkles className="w-4 h-4 text-manifest-auraPurple" />
                    ) : selectedEntryType === 'progress' ? (
                      <Target className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Trophy className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-manifest-ink tracking-tight">
                      {getModalTitle()}
                    </h3>
                    <p className="text-[11px] text-manifest-inkLight">
                      Grimorio de manifestación y sincronía
                    </p>
                  </div>
                </div>

                {/* Right: Quick close */}
                <button
                  type="button"
                  onClick={closeJournalEditor}
                  className="p-1.5 rounded-xl text-manifest-inkLight hover:text-manifest-ink hover:bg-white/5 transition-colors cursor-pointer"
                  title="Cerrar (Esc)"
                  aria-label="Cerrar ventana"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4"
              >
                {/* Espacio Selector (Premium Toggle Selector) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-manifest-ink block tracking-tight">
                    Espacio
                  </label>
                  <div>
                    <PremiumToggleSelector
                      value={selectedUserId}
                      onChange={(val) => setValue('userId', val as UserScope, { shouldDirty: true })}
                      dropDirection="down"
                      layoutIdPrefix="journal-modal-scope-desktop"
                      options={[
                        { key: 'facu', label: 'Facu', icon: Moon },
                        { key: 'maia', label: 'Maia', icon: Heart },
                        { key: 'shared', label: 'Juntos', icon: Sparkles },
                      ]}
                    />
                  </div>
                </div>

                {/* Tipo de Entrada (Mac-style Segmented Control) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-manifest-ink block tracking-tight">
                    Tipo de Registro
                  </label>
                  <div className="p-1 rounded-xl bg-manifest-ink/[0.05] border border-manifest-ink/[0.06] grid grid-cols-3 gap-1 shadow-inner">
                    {[
                      {
                        key: 'manifestation' as const,
                        label: 'Manifestación',
                        icon: Sparkles,
                      },
                      {
                        key: 'progress' as const,
                        label: 'Avance',
                        icon: Target,
                      },
                      {
                        key: 'reflection' as const,
                        label: 'Success Story',
                        icon: Trophy,
                      },
                    ].map((t) => {
                      const Icon = t.icon;
                      const isSel = selectedEntryType === t.key;
                      return (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => setValue('entryType', t.key, { shouldDirty: true })}
                          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs transition-all duration-150 cursor-pointer ${
                            isSel
                              ? 'bg-white text-manifest-ink shadow-sm font-semibold border border-white/80'
                              : 'text-manifest-inkMuted hover:text-manifest-ink hover:bg-white/40 font-medium'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${isSel ? 'text-manifest-auraPurple' : 'text-manifest-inkMuted'}`} />
                          <span className="truncate">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Textarea Field with Auto-Focus and Resaltado Mac */}
                <div ref={validationContainerRef} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-manifest-ink block tracking-tight">
                      Contenido de la Entrada
                    </label>
                    <span className="text-[11px] text-manifest-inkMuted">
                      {currentContent.length > 0 ? `${currentContent.length} caracteres` : 'Escribe tu entrada'}
                    </span>
                  </div>

                  {isVoiceActiveContent ? (
                    <VoiceAudioVisualizer
                      initialText={currentContent}
                      placeholder={
                        selectedEntryType === 'manifestation'
                          ? 'Describe tu manifestación...'
                          : selectedEntryType === 'progress'
                          ? 'Describe tu avance o sincronía...'
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
                    <div className="relative group">
                      <Controller
                        name="content"
                        control={control}
                        render={({ field }) => (
                          <AutoResizeTextarea
                            {...field}
                            ref={(el) => {
                              field.ref(el);
                              textareaRef.current = el;
                            }}
                            autoFocus
                            data-testid="journal-content-input"
                            onKeyDown={handleTextareaKeyDown}
                            minRows={4}
                            maxHeight={260}
                            placeholder={
                              selectedEntryType === 'manifestation'
                                ? 'Describe con total certeza y detalle sensorial lo que ya es tuyo en la realidad...'
                                : selectedEntryType === 'progress'
                                ? 'Describe qué avance viste, qué sincronía percibiste o qué paso diste...'
                                : 'Describe con gratitud el hecho consumado, cómo se materializó tu manifestación...'
                            }
                            className={`w-full p-4 pr-12 rounded-2xl glass-input text-xs sm:text-sm placeholder:text-manifest-inkLight leading-relaxed transition-all focus:outline-none ${
                              errors.content
                                ? 'border-rose-400 ring-2 ring-rose-400/50'
                                : currentContent.trim().length > 0
                                ? 'border-emerald-400 ring-2 ring-emerald-400/40'
                                : 'border-manifest-auraPurple/80 ring-2 ring-manifest-auraPurple/30 shadow-[0_0_16px_rgba(184,163,248,0.25)]'
                            }`}
                          />
                        )}
                      />

                      {/* Status Icon */}
                      <div className="absolute right-3.5 top-3.5 pointer-events-none">
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

                      {/* Mic Button */}
                      <div className="absolute right-3 bottom-3">
                        <button
                          type="button"
                          onClick={() => setIsVoiceActiveContent(true)}
                          title="Dictar contenido con micrófono"
                          aria-label="Dictar contenido con micrófono"
                          className="w-8 h-8 rounded-xl glass-pill text-purple-700 border border-purple-300/50 hover:bg-purple-100/70 shadow-neu-sm flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Mic className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Inline Error with SmoothSizeContainer */}
                  <SmoothSizeContainer>
                    {errors.content && (
                      <div
                        data-testid="journal-content-error"
                        className="flex items-center gap-1.5 text-[11px] text-rose-500 font-medium pt-1 pl-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                        <span>{errors.content.message}</span>
                      </div>
                    )}
                  </SmoothSizeContainer>
                </div>
              </form>

              {/* Mac Dialog Footer */}
              <div className="shrink-0 flex items-center justify-between px-6 py-4 bg-manifest-ink/[0.02] border-t border-manifest-ink/[0.07]">
                <div className="flex items-center gap-2 text-[11px] text-manifest-inkLight">
                  <span><strong>⌘↵</strong> o <strong>Ctrl+Enter</strong> para guardar</span>
                  <span>•</span>
                  <span><strong>Esc</strong> para salir</span>
                </div>
                <div className="flex items-center gap-2.5">
                  {editingJournalEntry && (
                    <button
                      type="button"
                      onClick={handleDeleteJournalEntry}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-100/80 hover:bg-rose-100 border border-rose-300/60 shadow-neu-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={closeJournalEditor}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink glass-pill border border-purple-500/20 shadow-xs transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    data-testid="submit-journal-btn"
                    onClick={handleSubmit(onSubmit)}
                    className="px-5 py-2 rounded-xl text-xs font-semibold text-white primary-gradient-btn shadow-glass active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {editingJournalEntry
                        ? 'Guardar Cambios'
                        : selectedEntryType === 'manifestation'
                        ? 'Guardar Manifestación'
                        : selectedEntryType === 'progress'
                        ? 'Guardar Avance'
                        : 'Guardar Success Story'}
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
      open={isJournalEditorOpen}
      onOpenChange={(open) => {
        if (!open) closeJournalEditor();
      }}
      handleOnly
      repositionInputs={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-sm" />
        <Drawer.Content
          data-testid="journal-vaul-drawer"
          className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-lg rounded-t-[2rem] border-t border-purple-200/80 bg-white/98 backdrop-blur-2xl p-5 sm:p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(30,20,50,0.14)] outline-none flex flex-col max-h-[92dvh]"
        >
          {/* iOS Native Grabber Handle */}
          <Drawer.Handle
            data-testid="ios-sheet-grabber"
            className="mx-auto w-12 h-1.5 shrink-0 rounded-full bg-slate-300 mb-2 cursor-grab active:cursor-grabbing"
          />

          <Drawer.Title className="sr-only">{getModalTitle()}</Drawer.Title>
          <Drawer.Description className="sr-only">
            Formulario para escribir o editar una entrada en tu grimorio manifestador
          </Drawer.Description>

          {/* iOS Compact Navigation Bar (h-14 px-4) */}
          <div className="shrink-0 h-14 -mx-5 sm:-mx-6 -mt-2 px-4 sm:px-6 flex items-center justify-between border-b border-purple-100/80 bg-white/90 backdrop-blur-md z-10">
            <button
              type="button"
              onClick={closeJournalEditor}
              className="text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors cursor-pointer px-1 py-1"
            >
              Cancelar
            </button>

            <div className="text-center truncate px-2">
              <h3 className="font-serif text-sm sm:text-base font-bold text-slate-900 truncate">
                {getModalTitle()}
              </h3>
            </div>

            <motion.button
              type="button"
              whileTap={IOS_TAP_SPRING}
              data-testid="submit-journal-nav-btn"
              onClick={handleSubmit(onSubmit)}
              className="primary-gradient-btn text-white px-4 py-1.5 rounded-full font-semibold text-xs sm:text-sm shadow-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer"
            >
              Guardar
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
              <div>
                <PremiumToggleSelector
                  value={selectedUserId}
                  onChange={(val) => setValue('userId', val as UserScope, { shouldDirty: true })}
                  dropDirection="down"
                  layoutIdPrefix="journal-modal-scope-mobile"
                  options={[
                    { key: 'facu', label: 'Facu', icon: Moon },
                    { key: 'maia', label: 'Maia', icon: Heart },
                    { key: 'shared', label: 'Juntos', icon: Sparkles },
                  ]}
                />
              </div>
            </div>

            {/* Tipo de entrada */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800">
                Tipo de Entrada
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    key: 'manifestation' as const,
                    label: 'Manifestación',
                    icon: Sparkles,
                  },
                  {
                    key: 'progress' as const,
                    label: 'Avance',
                    icon: Target,
                  },
                  {
                    key: 'reflection' as const,
                    label: 'Success Story',
                    icon: Trophy,
                  },
                ].map((t) => {
                  const Icon = t.icon;
                  const isSelected = selectedEntryType === t.key;
                  return (
                    <motion.button
                      key={t.key}
                      type="button"
                      whileTap={IOS_TAP_SPRING}
                      onClick={() => setValue('entryType', t.key, { shouldDirty: true })}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-colors border cursor-pointer ${
                        isSelected
                          ? 'bg-purple-100 text-purple-900 border-purple-300 font-bold shadow-xs'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 shadow-xs'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-purple-700' : 'text-slate-500'}`} />
                      <span className="truncate">{t.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Contenido con AutoResizeTextarea y Micrófono */}
            <div ref={validationContainerRef} className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 block">
                Contenido de tu entrada
              </label>
              {isVoiceActiveContent ? (
                <VoiceAudioVisualizer
                  initialText={currentContent}
                  placeholder={
                    selectedEntryType === 'manifestation'
                      ? 'Describe tu manifestación...'
                      : selectedEntryType === 'progress'
                      ? 'Describe tu avance o sincronía...'
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
                        minRows={4}
                        maxHeight={240}
                        onFocus={(e) => {
                          const el = e.currentTarget;
                          setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 150);
                        }}
                        placeholder={
                          selectedEntryType === 'manifestation'
                            ? 'Describe con total certeza y detalle sensorial lo que ya es tuyo en la realidad...'
                            : selectedEntryType === 'progress'
                            ? 'Describe qué avance viste, qué sincronía percibiste o qué paso diste...'
                            : 'Describe con gratitud el hecho consumado, cómo se materializó tu manifestación...'
                        }
                        className={`w-full p-3.5 pr-12 rounded-2xl bg-white border border-purple-200/90 text-slate-900 text-base sm:text-xs placeholder:text-slate-400 leading-relaxed transition-all shadow-xs focus:border-purple-500 focus:ring-2 focus:ring-purple-400/25 outline-none ${
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
                      <div className="w-5 h-5 rounded-full bg-emerald-100/80 text-emerald-700 border border-emerald-300/60 flex items-center justify-center shadow-neu-sm">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    {errors.content && (
                      <div className="w-5 h-5 rounded-full bg-rose-100/80 text-rose-700 border border-rose-300/60 flex items-center justify-center shadow-neu-sm">
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
                      className="w-8 h-8 rounded-xl glass-pill text-purple-700 border border-purple-300/50 hover:bg-purple-100/70 shadow-neu-sm flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Auto-animated Inline Error Message with SmoothSizeContainer */}
              <SmoothSizeContainer>
                {errors.content && (
                  <div
                    data-testid="journal-content-error"
                    className="flex items-center gap-1.5 text-[11px] text-rose-500 font-medium pt-1 pl-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span>{errors.content.message}</span>
                  </div>
                )}
              </SmoothSizeContainer>
            </div>

            {/* Flow Submit Button */}
            {/* Flow Action Buttons with Coordinated Reactive Reflow */}
            <motion.div
              layout="position"
              transition={IOS_LAYOUT_SPRING}
              className="pt-3 pb-4 space-y-2"
            >
              {!editingJournalEntry && (
                <motion.button
                  type="submit"
                  layout="position"
                  transition={IOS_LAYOUT_SPRING}
                  whileTap={IOS_TAP_SPRING}
                  data-testid="submit-journal-btn"
                  className="w-full py-3 px-4 rounded-2xl primary-gradient-btn text-xs sm:text-sm font-semibold shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {selectedEntryType === 'manifestation'
                      ? 'Guardar Manifestación'
                      : selectedEntryType === 'progress'
                      ? 'Guardar Avance'
                      : 'Guardar Success Story'}
                  </span>
                </motion.button>
              )}

              {editingJournalEntry && (
                <motion.button
                  type="button"
                  layout="position"
                  transition={IOS_LAYOUT_SPRING}
                  whileTap={IOS_TAP_SPRING}
                  onClick={handleDeleteJournalEntry}
                  className="w-full py-2.5 px-4 rounded-2xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/90 font-semibold text-xs sm:text-sm shadow-xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar Entrada</span>
                </motion.button>
              )}
            </motion.div>
          </form>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
