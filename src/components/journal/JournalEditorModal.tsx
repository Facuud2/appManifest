'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppStore } from '@/store';
import { BookOpen, X, Target, Sparkles, Check } from 'lucide-react';
import { EntryType, JournalEntry, UserScope } from '@/types';
import { UserScopeEnum } from '@/schemas';
import { motion, AnimatePresence } from 'framer-motion';
import { AutoResizeTextarea } from '@/components/ui/AutoResizeTextarea';
import { VoiceDictationButton } from '@/components/ui/VoiceDictationButton';

const journalFormSchema = z.object({
  title: z.string().min(1, 'El título o intención es requerido'),
  content: z.string().min(1, 'El contenido no puede estar vacío'),
  userId: UserScopeEnum,
  entryType: z.enum(['manifestation', 'reflection', 'progress']),
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
  } = useAppStore();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<JournalFormData>({
    resolver: zodResolver(journalFormSchema),
    defaultValues: {
      title: '',
      content: '',
      userId: activeScope,
      entryType: 'manifestation',
    },
  });

  const selectedUserId = watch('userId');
  const selectedEntryType = watch('entryType');
  const currentContent = watch('content') || '';
  const currentTitle = watch('title') || '';

  // Hydrate form whenever modal opens or editing entry changes
  useEffect(() => {
    if (isJournalEditorOpen) {
      if (editingJournalEntry) {
        const type: 'manifestation' | 'reflection' | 'progress' =
          editingJournalEntry.entryType === 'progress'
            ? 'progress'
            : editingJournalEntry.entryType === 'reflection'
            ? 'reflection'
            : 'manifestation';

        reset({
          title: editingJournalEntry.title,
          content: editingJournalEntry.content,
          userId: editingJournalEntry.userId || activeScope,
          entryType: type,
        });
      } else {
        const initialType: 'manifestation' | 'reflection' | 'progress' =
          journalEditorInitialMode === 'progress'
            ? 'progress'
            : journalEditorInitialMode === 'reflection'
            ? 'reflection'
            : 'manifestation';

        reset({
          title: '',
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

    const entryToSave: JournalEntry = {
      id: editingJournalEntry?.id || `journal-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      userId: data.userId,
      author,
      title: data.title.trim(),
      content: data.content.trim(),
      entryType: data.entryType as EntryType,
      tags,
      createdAt: editingJournalEntry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveJournalEntry(entryToSave);
    closeJournalEditor();
  };

  const handleVoiceTranscriptTitle = (transcript: string) => {
    const updated = currentTitle ? `${currentTitle} ${transcript}` : transcript;
    setValue('title', updated, { shouldValidate: true, shouldDirty: true });
  };

  const handleVoiceTranscriptContent = (transcript: string) => {
    const updated = currentContent ? `${currentContent} ${transcript}` : transcript;
    setValue('content', updated, { shouldValidate: true, shouldDirty: true });
  };

  const getModalTitle = () => {
    if (editingJournalEntry) {
      if (selectedEntryType === 'manifestation') return 'Editar Manifestación';
      if (selectedEntryType === 'progress') return 'Editar Avance o Logro';
      return 'Editar Nota de Cuaderno';
    }
    if (selectedEntryType === 'manifestation') return 'Nueva Manifestación Concreta';
    if (selectedEntryType === 'progress') return 'Nuevo Avance / Logro';
    return 'Nueva Nota de Cuaderno';
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
                    : 'bg-white/90 text-manifest-ink'
                }`}
              >
                {selectedEntryType === 'manifestation' ? (
                  <Target className="w-4 h-4" />
                ) : selectedEntryType === 'progress' ? (
                  <Sparkles className="w-4 h-4" />
                ) : (
                  <BookOpen className="w-4 h-4" />
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

            {/* Tipo de Entrada: Manifestación vs Nota vs Avance */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-manifest-ink">
                Tipo de entrada
              </label>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {/* 1. Manifestación */}
                <button
                  type="button"
                  onClick={() => setValue('entryType', 'manifestation', { shouldDirty: true })}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                    selectedEntryType === 'manifestation'
                      ? 'bg-gradient-to-tr from-manifest-pink/40 to-manifest-lavender text-manifest-auraPurple border-manifest-auraPurple/50 shadow-sm'
                      : 'bg-white/70 hover:bg-white text-manifest-inkMuted border-white/80'
                  }`}
                >
                  <Target className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Manifestación</span>
                </button>

                {/* 2. Nota de Cuaderno */}
                <button
                  type="button"
                  onClick={() => setValue('entryType', 'reflection', { shouldDirty: true })}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                    selectedEntryType === 'reflection'
                      ? 'bg-manifest-lavender text-manifest-ink border-manifest-auraPurple/50 shadow-sm'
                      : 'bg-white/70 hover:bg-white text-manifest-inkMuted border-white/80'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Nota de Cuaderno</span>
                </button>

                {/* 3. Avance / Logro */}
                <button
                  type="button"
                  onClick={() => setValue('entryType', 'progress', { shouldDirty: true })}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                    selectedEntryType === 'progress'
                      ? 'bg-manifest-mint text-manifest-ink border-emerald-400/50 shadow-sm'
                      : 'bg-white/70 hover:bg-white text-manifest-inkMuted border-white/80'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  <span className="truncate">Avance / Logro</span>
                </button>
              </div>
            </div>

            {/* Título */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-manifest-ink">
                  {selectedEntryType === 'manifestation'
                    ? 'Título de la Manifestación'
                    : selectedEntryType === 'progress'
                    ? 'Título del Avance o Hecho'
                    : 'Título o Intención'}
                </label>
                <VoiceDictationButton
                  onTranscript={handleVoiceTranscriptTitle}
                  size="sm"
                  title="Dictar título"
                />
              </div>
              <input
                type="text"
                {...register('title')}
                placeholder={
                  selectedEntryType === 'manifestation'
                    ? 'Ej: Mi nuevo auto deportivo / Mi aumento de sueldo...'
                    : selectedEntryType === 'progress'
                    ? 'Ej: Primer indicio de mi nuevo proyecto...'
                    : 'Ej: Mi visión viviendo en el campo...'
                }
                className={`w-full px-3.5 py-2.5 rounded-2xl glass-input text-base sm:text-xs placeholder:text-manifest-inkLight ${
                  errors.title ? 'border-rose-400 ring-1 ring-rose-400' : ''
                }`}
              />
              {errors.title && (
                <p className="text-[11px] text-rose-500 font-medium">{errors.title.message}</p>
              )}
            </div>

            {/* Contenido con AutoResizeTextarea y Micrófono */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-manifest-ink">
                  {selectedEntryType === 'manifestation'
                    ? 'Describe la manifestación en tiempo presente'
                    : selectedEntryType === 'progress'
                    ? 'Describe el avance o evidencia vivida'
                    : 'Describe tu sentir o reflexión'}
                </label>
                <VoiceDictationButton
                  onTranscript={handleVoiceTranscriptContent}
                  size="sm"
                  title="Dictar contenido"
                />
              </div>
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
                        ? 'Describe qué sucedió, qué sincronía percibiste o qué paso diste...'
                        : 'Escribe tus pensamientos libres o vivencias del día...'
                    }
                    className={`w-full p-3.5 rounded-2xl glass-input text-base sm:text-xs placeholder:text-manifest-inkLight leading-relaxed ${
                      errors.content ? 'border-rose-400 ring-1 ring-rose-400' : ''
                    }`}
                  />
                )}
              />
              {errors.content && (
                <p className="text-[11px] text-rose-500 font-medium">{errors.content.message}</p>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeJournalEditor}
                className="px-4 py-2 rounded-xl text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink hover:bg-white/60 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl primary-gradient-btn text-xs font-semibold shadow-sm cursor-pointer"
              >
                {editingJournalEntry
                  ? 'Guardar Cambios'
                  : selectedEntryType === 'manifestation'
                  ? 'Guardar Manifestación'
                  : selectedEntryType === 'progress'
                  ? 'Registrar Avance'
                  : 'Guardar en Cuaderno'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
