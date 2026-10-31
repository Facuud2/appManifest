'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppStore } from '@/store';
import { Sparkles, X } from 'lucide-react';
import { Affirmation, UserScope } from '@/types';
import { UserScopeEnum } from '@/schemas';
import { motion, AnimatePresence } from 'framer-motion';
import { AutoResizeTextarea } from '@/components/ui/AutoResizeTextarea';
import { VoiceDictationButton } from '@/components/ui/VoiceDictationButton';

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
    defaultValues: {
      text: '',
      userId: activeScope,
    },
  });

  const selectedUserId = watch('userId');
  const currentText = watch('text') || '';

  useEffect(() => {
    if (isAffirmationEditorOpen) {
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

  if (!isAffirmationEditorOpen) return null;

  const onSubmit = (data: AffirmationFormData) => {
    const author =
      data.userId === 'facu' ? 'Facu' : data.userId === 'maia' ? 'Maia' : 'Facu & Maia';

    const itemToSave: Affirmation = {
      id: editingAffirmation?.id || `aff-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: data.userId,
      author,
      text: data.text.trim(),
      repeatCount: editingAffirmation?.repeatCount ?? 1,
      pinned: editingAffirmation?.pinned ?? false,
      order: editingAffirmation?.order,
      createdAt: editingAffirmation?.createdAt || new Date().toISOString(),
      lastRepeatedAt: editingAffirmation?.lastRepeatedAt || new Date().toISOString(),
    };

    saveAffirmation(itemToSave);
    closeAffirmationEditor();
  };

  const handleVoiceTranscript = (transcript: string) => {
    const updated = currentText ? `${currentText} ${transcript}` : transcript;
    setValue('text', updated, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <AnimatePresence>
      <div
        onClick={closeAffirmationEditor}
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
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-manifest-lavender to-manifest-celeste flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-manifest-auraPurple" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-bold text-manifest-ink">
                  {editingAffirmation ? 'Editar Manifestación' : 'Nueva Manifestación'}
                </h3>
                <p className="text-[11px] text-manifest-inkMuted">
                  Decretos conscientes y afirmaciones en tiempo presente
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeAffirmationEditor}
              className="p-1.5 rounded-full hover:bg-white/80 text-manifest-inkMuted hover:text-manifest-ink transition-colors"
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
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all border ${
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

            {/* Texto de Manifestación con AutoResize y Voz */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-manifest-ink">
                  Decreto o Afirmación
                </label>
                <VoiceDictationButton
                  onTranscript={handleVoiceTranscript}
                  size="sm"
                  title="Dictar manifestación"
                />
              </div>
              <Controller
                name="text"
                control={control}
                render={({ field }) => (
                  <AutoResizeTextarea
                    {...field}
                    minRows={3}
                    placeholder="Escribe en tiempo presente... (Ej: Atraigo abundancia, tranquilidad y felicidad cada día)"
                    className={`w-full p-3.5 rounded-2xl glass-input text-base sm:text-xs placeholder:text-manifest-inkLight leading-relaxed ${
                      errors.text ? 'border-rose-400 ring-1 ring-rose-400' : ''
                    }`}
                  />
                )}
              />
              {errors.text && (
                <p className="text-[11px] text-rose-500 font-medium">{errors.text.message}</p>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeAffirmationEditor}
                className="px-4 py-2 rounded-xl text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink hover:bg-white/60 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl primary-gradient-btn text-xs font-semibold shadow-sm cursor-pointer"
              >
                {editingAffirmation ? 'Guardar Cambios' : 'Guardar Manifestación'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
