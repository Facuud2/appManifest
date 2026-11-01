'use client';

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppStore } from '@/store';
import { Sparkles, X, Plus, Trash2, Mic, Check, AlertCircle } from 'lucide-react';
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
    addEtherFragments,
    showToast,
    triggerCelebration,
    openOracle,
    navigateToGoals,
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
    mode: 'onChange',
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
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const textareaRefs = React.useRef<{ [key: number]: HTMLTextAreaElement | null }>({});

  const selectedUserId = watch('userId');
  const watchedAffirmations = watch('affirmations');

  useEffect(() => {
    if (focusIndex !== null) {
      const el = textareaRefs.current[focusIndex];
      if (el) {
        el.focus();
        setFocusIndex(null);
      }
    }
  }, [focusIndex, fields.length]);

  const handleAddAffirmation = () => {
    append({
      id: `aff-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text: '',
      repeatCount: 0,
    });
    setFocusIndex(fields.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, index: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const currentVal = watchedAffirmations?.[index]?.text || '';
      if (index === fields.length - 1) {
        if (currentVal.trim()) {
          handleAddAffirmation();
        }
      } else {
        const nextEl = textareaRefs.current[index + 1];
        if (nextEl) {
          nextEl.focus();
        }
      }
    }
  };

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
    addEtherFragments(30);
    showToast('¡Set de Rampage creado! +30 Fragmentos de Éter', 'celebrate');
    onClose();

    triggerCelebration({
      title: 'Secuencia de Rampage Creada',
      message: `Set "${data.title.trim()}" con ${data.affirmations.length} afirmaciones rítmicas.`,
      fragments: 30,
      nextStepLabel: 'Girar el Oráculo',
      onNextStep: () => openOracle(),
      secondaryLabel: 'Ir a Sets de Rampage',
      onSecondary: () => navigateToGoals('rampage'),
    });
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
              <div className="relative">
                <input
                  type="text"
                  {...register('title')}
                  placeholder="Ej: Abundancia Ilimitada, Paz Serena, Éxito..."
                  className={`w-full px-3.5 py-2.5 pr-10 rounded-2xl glass-input text-base sm:text-xs placeholder:text-manifest-inkLight transition-all ${
                    errors.title
                      ? 'border-rose-400 ring-1 ring-rose-400/50'
                      : watch('title')?.trim()
                      ? 'border-emerald-400 ring-1 ring-emerald-400/40'
                      : ''
                  }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {watch('title')?.trim() && !errors.title && (
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs animate-in zoom-in duration-200">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                  {errors.title && (
                    <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center shadow-xs animate-in zoom-in duration-200">
                      <AlertCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  )}
                </div>
              </div>
              <AnimatePresence>
                {errors.title && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -4 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-1.5 text-[11px] text-rose-500 font-medium pt-0.5 pl-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                      <span>{errors.title.message}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Lista de Afirmaciones del Set */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-manifest-ink">
                  Afirmaciones del Set ({fields.length})
                </label>
                <span className="text-[10px] text-manifest-inkLight font-normal">
                  Pulsa Enter para crear la siguiente
                </span>
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
                        <div className="relative">
                          <Controller
                            name={`affirmations.${idx}.text`}
                            control={control}
                            render={({ field }) => (
                              <AutoResizeTextarea
                                {...field}
                                ref={(el) => {
                                  field.ref(el);
                                  textareaRefs.current[idx] = el;
                                }}
                                enterKeyHint={idx === fields.length - 1 ? 'send' : 'next'}
                                onKeyDown={(e) => handleKeyDown(e, idx)}
                                minRows={2}
                                placeholder="Escribe la afirmación para esta secuencia..."
                                className={`w-full p-2.5 pr-8 rounded-xl glass-input text-base sm:text-xs placeholder:text-manifest-inkLight transition-all ${
                                  errors.affirmations?.[idx]?.text
                                    ? 'border-rose-400 ring-1 ring-rose-400/50'
                                    : currentText.trim().length > 0
                                    ? 'border-emerald-400 ring-1 ring-emerald-400/40'
                                    : ''
                                }`}
                              />
                            )}
                          />
                          <div className="absolute right-2.5 top-2.5 pointer-events-none">
                            {currentText.trim().length > 0 && !errors.affirmations?.[idx]?.text && (
                              <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Botón Trello: Añadir afirmación debajo de la última */}
              <button
                type="button"
                onClick={handleAddAffirmation}
                data-testid="rampage-add-affirmation-btn"
                className="w-full py-2.5 px-3 rounded-2xl border-2 border-dashed border-manifest-lavender hover:border-manifest-auraPurple/50 bg-white/50 hover:bg-white/80 active:scale-[0.99] flex items-center justify-center gap-1.5 text-xs font-semibold text-manifest-auraPurple transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ Añadir afirmación</span>
              </button>
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
