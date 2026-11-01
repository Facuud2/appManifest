'use client';

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppStore } from '@/store';
import { Sparkles, X, Plus, Trash2, Mic } from 'lucide-react';
import { RampageSet, UserScope } from '@/types';
import { UserScopeEnum } from '@/schemas';
import { motion, AnimatePresence } from 'framer-motion';
import { AutoResizeTextarea } from '@/components/ui/AutoResizeTextarea';
import { VoiceAudioVisualizer } from '@/components/ui/VoiceAudioVisualizer';

const rampageFormSchema = z.object({
  title: z.string().min(1, 'El título del set es requerido'),
  userId: UserScopeEnum,
  affirmations: z
    .array(
      z.object({
        id: z.string().min(1),
        text: z.string().min(1, 'La afirmación no puede estar vacía'),
        repeatCount: z.number().default(0),
      })
    )
    .min(1, 'El set debe contener al menos una afirmación'),
});

type RampageFormData = z.infer<typeof rampageFormSchema>;

interface RampageSetEditorModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  setOrNull?: RampageSet | null;
}

export const RampageSetEditorModal: React.FC<RampageSetEditorModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  setOrNull: propSetOrNull,
}) => {
  const {
    activeScope,
    saveRampageSet,
    isRampageSetEditorOpen,
    editingRampageSet,
    closeRampageSetEditor,
  } = useAppStore();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isRampageSetEditorOpen;
  const onClose = propOnClose || closeRampageSetEditor;
  const setOrNull = propSetOrNull !== undefined ? propSetOrNull : editingRampageSet;

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RampageFormData>({
    resolver: zodResolver(rampageFormSchema),
    defaultValues: {
      title: '',
      userId: activeScope,
      affirmations: [
        { id: `aff-${Date.now()}-1`, text: '', repeatCount: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'affirmations',
  });

  const [voiceActiveIdx, setVoiceActiveIdx] = useState<number | null>(null);

  const selectedUserId = watch('userId');
  const watchedAffirmations = watch('affirmations');

  useEffect(() => {
    if (isOpen) {
      if (setOrNull) {
        reset({
          title: setOrNull.title,
          userId: setOrNull.userId || activeScope,
          affirmations: setOrNull.affirmations.map((a) => ({
            id: a.id,
            text: a.text,
            repeatCount: a.repeatCount || 0,
          })),
        });
      } else {
        reset({
          title: '',
          userId: activeScope,
          affirmations: [
            { id: `aff-${Date.now()}-1`, text: '', repeatCount: 0 },
          ],
        });
      }
    }
  }, [isOpen, setOrNull, activeScope, reset]);

  if (!isOpen) return null;

  const onSubmit = (data: RampageFormData) => {
    const author =
      data.userId === 'facu' ? 'Facu' : data.userId === 'maia' ? 'Maia' : 'Facu & Maia';

    const newSet: RampageSet = {
      id: setOrNull?.id || `rampage-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: data.userId,
      author,
      title: data.title.trim(),
      affirmations: data.affirmations.map((a) => ({
        id: a.id || `aff-item-${Math.random().toString(36).substring(2, 7)}`,
        text: a.text.trim(),
        repeatCount: a.repeatCount || 0,
      })),
      createdAt: setOrNull?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveRampageSet(newSet);
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
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
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-manifest-pink via-manifest-lavender to-manifest-celeste flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-manifest-auraPurple" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-bold text-manifest-ink">
                  {setOrNull ? 'Editar Set de Rampage' : 'Nuevo Set de Rampage'}
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
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

            {/* Título del Set */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-manifest-ink">
                Título del Set
              </label>
              <input
                type="text"
                {...register('title')}
                placeholder="Ej: Abundancia Ilimitada, Paz Serena, Éxito..."
                className={`w-full px-3.5 py-2.5 rounded-2xl glass-input text-base sm:text-xs placeholder:text-manifest-inkLight ${
                  errors.title ? 'border-rose-400 ring-1 ring-rose-400' : ''
                }`}
              />
              {errors.title && (
                <p className="text-[11px] text-rose-500 font-medium">{errors.title.message}</p>
              )}
            </div>

            {/* Lista de Afirmaciones del Set */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-manifest-ink">
                  Afirmaciones del Set ({fields.length})
                </label>
                <button
                  type="button"
                  onClick={() =>
                    append({
                      id: `aff-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                      text: '',
                      repeatCount: 0,
                    })
                  }
                  className="flex items-center gap-1 text-[11px] font-semibold text-manifest-auraPurple hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir afirmación</span>
                </button>
              </div>

              <div className="space-y-2">
                {fields.map((fieldItem, idx) => {
                  const currentText = watchedAffirmations?.[idx]?.text || '';
                  return (
                    <div
                      key={fieldItem.id}
                      className="p-3 rounded-2xl bg-white/75 border border-white/90 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-manifest-inkMuted">
                          Afirmación #{idx + 1}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setVoiceActiveIdx(voiceActiveIdx === idx ? null : idx)
                            }
                            title="Dictar con micrófono"
                            aria-label="Dictar con micrófono"
                            className="w-7 h-7 rounded-xl bg-white/80 hover:bg-white text-manifest-inkMuted hover:text-manifest-ink border border-white/90 shadow-sm flex items-center justify-center transition-all cursor-pointer"
                          >
                            <Mic className="w-3.5 h-3.5" />
                          </button>
                          {fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(idx)}
                              className="p-1 rounded-lg text-manifest-inkMuted hover:text-rose-500 hover:bg-rose-50 transition-colors"
                              title="Eliminar afirmación"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {voiceActiveIdx === idx ? (
                        <VoiceAudioVisualizer
                          initialText={currentText}
                          placeholder={`Habla ahora para la afirmación #${idx + 1}...`}
                          onCommit={(fullText) => {
                            setValue(`affirmations.${idx}.text`, fullText, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                            setVoiceActiveIdx(null);
                          }}
                          onSend={(fullText) => {
                            setValue(`affirmations.${idx}.text`, fullText, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                            setVoiceActiveIdx(null);
                          }}
                          onCancel={() => setVoiceActiveIdx(null)}
                        />
                      ) : (
                        <Controller
                          name={`affirmations.${idx}.text`}
                          control={control}
                          render={({ field }) => (
                            <AutoResizeTextarea
                              {...field}
                              minRows={2}
                              placeholder="Escribe la afirmación para esta secuencia..."
                              className="w-full p-2.5 rounded-xl glass-input text-base sm:text-xs placeholder:text-manifest-inkLight"
                            />
                          )}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink hover:bg-white/60 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl primary-gradient-btn text-xs font-semibold shadow-sm cursor-pointer"
              >
                {setOrNull ? 'Guardar Cambios' : 'Crear Set de Rampage'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
