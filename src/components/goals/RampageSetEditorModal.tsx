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

const rampageFormSchema = z
  .object({
    title: z.string().trim().min(1, 'El título del set es requerido'),
    userId: UserScopeEnum,
    affirmations: z
      .array(
        z.object({
          id: z.string().min(1),
          text: z.string(),
          repeatCount: z.number().default(0),
        })
      )
      .min(1, 'El set debe contener al menos una afirmación'),
  })
  .superRefine((data, ctx) => {
    const hasAtLeastOneValid = data.affirmations.some((a) => a.text.trim().length > 0);
    if (!hasAtLeastOneValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Escribe al menos una afirmación para guardar el set',
        path: ['affirmations', 0, 'text'],
      });
    }
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
    showToast,
    checkAndUnlockMilestones,
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

  const ensureCardVisible = (idx: number) => {
    const el = textareaRefs.current[idx];
    if (!el) return;
    const cardEl = el.closest('[data-rampage-card]') as HTMLElement | null;
    const scrollParent = el.closest('.overflow-y-auto') as HTMLElement | null;
    if (!cardEl || !scrollParent) return;

    const cardRect = cardEl.getBoundingClientRect();
    const parentRect = scrollParent.getBoundingClientRect();

    if (cardRect.bottom > parentRect.bottom - 12) {
      scrollParent.scrollTop += cardRect.bottom - parentRect.bottom + 16;
    } else if (cardRect.top < parentRect.top + 12) {
      scrollParent.scrollTop -= parentRect.top - cardRect.top + 16;
    }
  };

  useEffect(() => {
    if (focusIndex !== null) {
      const targetIdx = focusIndex;
      const el = textareaRefs.current[targetIdx];
      if (el) {
        el.focus();
        ensureCardVisible(targetIdx);
        requestAnimationFrame(() => ensureCardVisible(targetIdx));
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
        } else if (fields.length > 1) {
          // Estilo Trello: si la última tarjeta está vacía y se pulsa Enter, se elimina la tarjeta vacía
          remove(index);
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

    // QoL Estilo Trello: eliminar automáticamente cuadros de afirmación vacíos al guardar
    const validAffirmations = data.affirmations
      .filter((a) => a.text.trim().length > 0)
      .map((a) => ({
        id: a.id || `aff-item-${Math.random().toString(36).substring(2, 7)}`,
        text: a.text.trim(),
        repeatCount: a.repeatCount || 0,
      }));

    if (validAffirmations.length === 0) return;

    const isEditing = Boolean(setOrNull);

    // Detección activa de cambios al editar: si no hubo modificaciones, cerrar silenciosamente
    if (setOrNull) {
      const origTitle = (setOrNull.title || '').trim();
      const origUserId = setOrNull.userId || activeScope;
      const origTexts = setOrNull.affirmations
        .map((a) => (a.text || '').trim())
        .filter((t) => t.length > 0);
      const nextTexts = validAffirmations.map((a) => a.text);

      const hasTitleChanged = data.title.trim() !== origTitle;
      const hasScopeChanged = data.userId !== origUserId;
      const hasAffirmationsChanged =
        origTexts.length !== nextTexts.length ||
        origTexts.some((t, idx) => t !== nextTexts[idx]);

      if (!hasTitleChanged && !hasScopeChanged && !hasAffirmationsChanged) {
        onClose();
        return;
      }
    }

    const newSet: RampageSet = {
      id: setOrNull?.id || `rampage-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: data.userId,
      author,
      title: data.title.trim(),
      affirmations: validAffirmations,
      createdAt: setOrNull?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveRampageSet(newSet);
    onClose();

    const unlocked = checkAndUnlockMilestones();
    if (unlocked.length === 0) {
      showToast(
        isEditing ? 'Set de Rampage actualizado' : 'Set de Rampage guardado',
        'gentle'
      );
    }
  };

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-manifest-ink/40 backdrop-blur-sm overflow-hidden"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32, mass: 0.8 }}
          style={{ backgroundColor: 'rgba(248, 246, 252, 0.98)' }}
          className="w-full max-w-lg max-h-[85dvh] sm:max-h-[88dvh] flex flex-col rounded-3xl backdrop-blur-2xl border border-white shadow-liquid overflow-hidden my-auto"
        >
          {/* Fixed Header (shrink-0) */}
          <div className="shrink-0 flex items-center justify-between px-5 pt-4 pb-3 border-b border-manifest-lavender/40 bg-white/95 backdrop-blur-md z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-manifest-pink via-manifest-lavender to-manifest-celeste flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-manifest-auraPurple" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-bold text-manifest-ink">
                  {setOrNull ? 'Editar Set de Rampage' : 'Nuevo Set de Rampage'}
                </h3>
                <p className="text-[10px] text-manifest-inkMuted">
                  {fields.length} {fields.length === 1 ? 'afirmación en secuencia' : 'afirmaciones en secuencia'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/80 text-manifest-inkMuted hover:text-manifest-ink transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col flex-1 min-h-0 overflow-hidden"
          >
            {/* Scrollable Body (flex-1 min-h-0 overflow-y-auto) */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-5 py-4 space-y-4">
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
              <div className="space-y-2.5 pb-1">
                <div className="flex items-center justify-between px-0.5">
                  <label className="text-xs font-semibold text-manifest-ink">
                    Afirmaciones del Set ({fields.length})
                  </label>
                  <span className="text-[10px] text-manifest-inkLight font-normal">
                    Pulsa Enter para crear la siguiente
                  </span>
                </div>

                <div className="flex flex-col gap-2.5">
                  {fields.map((fieldItem, idx) => {
                    const currentText = watchedAffirmations?.[idx]?.text || '';
                    return (
                      <div
                        key={fieldItem.id}
                        data-rampage-card={idx}
                        className="p-3.5 rounded-2xl bg-white border border-manifest-lavender/45 shadow-sm space-y-2"
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
                              className="w-7 h-7 rounded-xl bg-white/90 hover:bg-white text-manifest-inkMuted hover:text-manifest-ink border border-white shadow-xs flex items-center justify-center transition-all cursor-pointer"
                            >
                              <Mic className="w-3.5 h-3.5" />
                            </button>
                            {fields.length > 1 && (
                              <button
                                type="button"
                                onClick={() => remove(idx)}
                                className="w-7 h-7 rounded-xl bg-white/90 hover:bg-rose-50 text-manifest-inkMuted hover:text-rose-500 border border-white shadow-xs flex items-center justify-center transition-all cursor-pointer"
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
                                  onFocus={() => ensureCardVisible(idx)}
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
                              {errors.affirmations?.[idx]?.text && (
                                <div className="w-4 h-4 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center shadow-xs">
                                  <AlertCircle className="w-2.5 h-2.5 stroke-[2.5]" />
                                </div>
                              )}
                            </div>
                            {errors.affirmations?.[idx]?.text && (
                              <p className="text-[11px] text-rose-500 font-medium pt-1 pl-1">
                                {errors.affirmations[idx]?.text?.message}
                              </p>
                            )}
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
                  <span>Añadir afirmación</span>
                </button>
              </div>
            </div>

            {/* Fixed Footer Buttons (shrink-0) */}
            <div className="shrink-0 flex items-center justify-end gap-2 px-5 py-3.5 border-t border-white/80 bg-white/90 backdrop-blur-md z-10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink hover:bg-white/60 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl primary-gradient-btn text-xs font-semibold shadow-sm cursor-pointer active:scale-95 transition-transform"
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
