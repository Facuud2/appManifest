'use client';

import React, { useEffect, useState } from 'react';
import { Drawer } from 'vaul';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppStore } from '@/store';
import { Sparkles, X, Plus, Trash2, Mic, Check, AlertCircle, Moon, Heart } from 'lucide-react';
import { RampageSet, UserScope } from '@/types';
import { UserScopeEnum } from '@/schemas';
import { motion, AnimatePresence } from 'framer-motion';
import { IOS_TAP_SPRING, LIQUID_GLASS_SPECULAR } from '@/lib/iosSprings';
import { AutoResizeTextarea } from '@/components/ui/AutoResizeTextarea';
import { VoiceAudioVisualizer } from '@/components/ui/VoiceAudioVisualizer';
import { useIsDesktop } from '@/hooks/useIsDesktop';

const rampageFormSchema = z
  .object({
    title: z.string().trim().min(3, 'El título debe tener al menos 3 caracteres'),
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
    const nonEmpties = data.affirmations.filter((a) => a.text.trim().length > 0);
    if (nonEmpties.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Escribe al menos una afirmación (mínimo 4 caracteres)',
        path: ['affirmations', 0, 'text'],
      });
    } else {
      data.affirmations.forEach((a, idx) => {
        const trimmed = a.text.trim();
        if (trimmed.length > 0 && trimmed.length < 4) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'La afirmación debe tener al menos 4 caracteres',
            path: ['affirmations', idx, 'text'],
          });
        }
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
  const isDesktop = useIsDesktop();
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
  const [autoFilledIndices, setAutoFilledIndices] = useState<number[]>([]);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const textareaRefs = React.useRef<{ [key: number]: HTMLTextAreaElement | null }>({});
  const titleInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleAutoFillAI = () => {
    setIsAutoFilling(true);
    setAutoFilledIndices([]);
    const AI_PRESETS = [
      'Mi mente descansa en una certeza absoluta y radiante.',
      'Merezco recibir bendiciones y abundancia infinita.',
      'Todo lo que anhelo ya está en camino manifestándose en perfecta sincronía.',
      'Soy paz, soy poder creador y soy amor incondicional.',
    ];

    if (!watch('title')?.trim()) {
      setValue('title', 'Sintonía Cósmica y Poder', { shouldValidate: true, shouldDirty: true });
    }

    const currentCount = fields.length;
    for (let i = currentCount; i < AI_PRESETS.length; i++) {
      append({
        id: `aff-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        text: '',
        repeatCount: 0,
      });
    }

    AI_PRESETS.forEach((presetText, idx) => {
      setTimeout(() => {
        setValue(`affirmations.${idx}.text`, presetText, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setAutoFilledIndices((prev) => [...prev, idx]);
        if (idx === AI_PRESETS.length - 1) {
          setIsAutoFilling(false);
        }
      }, idx * 110);
    });
  };

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
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handlePreSubmit(e);
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const currentVal = watchedAffirmations?.[index]?.text || '';
      if (index === fields.length - 1) {
        if (currentVal.trim().length >= 3) {
          handleAddAffirmation();
        } else if (fields.length > 1 && currentVal.trim().length === 0) {
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

      // En PC: auto-enfocar título al abrir
      if (isDesktop) {
        const timer = setTimeout(() => {
          titleInputRef.current?.focus();
        }, 60);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, setOrNull, activeScope, reset, isDesktop]);

  // Tecla Escape para cerrar en PC
  useEffect(() => {
    if (!isOpen || !isDesktop) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, isDesktop, onClose]);

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

    if (isEditing) {
      showToast('Set de Rampage actualizado', 'gentle');
    } else {
      const unlocked = checkAndUnlockMilestones();
      if (unlocked.length === 0) {
        showToast('Set de Rampage guardado', 'gentle');
      }
    }
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentAffs = watch('affirmations') || [];
    const lastIdx = currentAffs.length - 1;
    if (lastIdx > 0 && (!currentAffs[lastIdx]?.text || currentAffs[lastIdx].text.trim() === '')) {
      remove(lastIdx);
    }
    handleSubmit(onSubmit)(e);
  };

  // ==========================================
  // VISTA PC: Pop-up centrado estilo macOS
  // ==========================================
  if (isDesktop) {
    return (
      <AnimatePresence>
        {isOpen && (
          <div
            data-testid="rampage-desktop-backdrop"
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-md"
          >
            <motion.div
              data-testid="rampage-desktop-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30, mass: 0.8 }}
              className="w-full max-w-xl rounded-3xl liquid-glass-surface bg-manifest-surfaceElevated border border-manifest-glassBorder shadow-lens flex flex-col max-h-[86vh] h-[86vh] sm:h-[680px] overflow-hidden"
            >
              {/* Modal Header (shrink-0) */}
              <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-manifest-glassBorder bg-manifest-surfaceNav/80 backdrop-blur-md select-none">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-manifest-glassControl border border-manifest-glassBorder flex items-center justify-center shadow-xs">
                    <Sparkles className="w-4 h-4 text-manifest-auraPurple" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-manifest-ink tracking-tight">
                      {setOrNull ? 'Editar Set de Rampage' : 'Nuevo Set de Rampage'}
                    </h3>
                    <p className="text-[11px] text-manifest-inkMuted">
                      Secuencia rítmica de afirmaciones
                    </p>
                  </div>
                </div>

                {/* Right: Counter pill & close */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-manifest-ink px-2.5 py-0.5 rounded-full bg-manifest-glassControl border border-manifest-glassBorder shadow-2xs">
                    {fields.length} {fields.length === 1 ? 'afirmación' : 'afirmaciones'}
                  </span>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 rounded-xl text-manifest-inkMuted hover:text-manifest-ink hover:bg-manifest-glassControlHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus transition-colors cursor-pointer"
                    title="Cerrar (Esc)"
                    aria-label="Cerrar ventana"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Form Content: Flex container with dedicated scroll for affirmations */}
              <form
                onSubmit={handlePreSubmit}
                className="flex-1 min-h-0 flex flex-col p-5 sm:p-6 overflow-hidden space-y-3.5"
              >
                {/* Espacio Selector (shrink-0) */}
                <div className="shrink-0 space-y-1">
                  <label className="text-xs font-semibold text-manifest-ink block tracking-tight">
                    Espacio
                  </label>
                  <div className="p-1 rounded-xl bg-manifest-glassControl border border-manifest-glassBorder grid grid-cols-3 gap-1 shadow-inner">
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
                          className={`py-1 px-3 rounded-lg text-xs transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'bg-manifest-glassControlActive text-manifest-ink shadow-sm font-semibold border border-manifest-glassBorderFocus'
                              : 'text-manifest-inkMuted hover:text-manifest-ink hover:bg-manifest-glassControlHover font-medium'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-purple-600' : 'text-manifest-inkLight'}`} />
                          <span>{sc.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Título del Set with Auto-Focus (shrink-0) */}
                <div className="shrink-0 space-y-1">
                  <label className="text-xs font-semibold text-manifest-ink block tracking-tight">
                    Título del Set
                  </label>
                  <div className="relative">
                    <input
                      {...register('title')}
                      ref={(el) => {
                        register('title').ref(el);
                        titleInputRef.current = el;
                      }}
                      type="text"
                      autoFocus
                      placeholder="Ej: Abundancia, Paz Serena, Éxito"
                      className={`w-full p-2.5 sm:p-3 pr-10 rounded-xl glass-input text-xs sm:text-sm placeholder:text-manifest-inkMuted/40 transition-all focus:outline-none ${
                        errors.title
                          ? 'border-rose-400 ring-2 ring-rose-400/50'
                          : watch('title')?.trim().length > 0
                          ? 'border-emerald-400 ring-2 ring-emerald-400/40'
                          : 'border-manifest-auraPurple/80 ring-2 ring-manifest-auraPurple/30 shadow-[0_0_16px_rgba(184,163,248,0.25)]'
                      }`}
                    />
                    {watch('title')?.trim().length > 0 && !errors.title && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-100/80 text-emerald-700 border border-emerald-300/60 flex items-center justify-center shadow-neu-sm pointer-events-none">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  {errors.title && (
                    <p className="text-[11px] text-rose-500 font-medium pt-0.5 pl-1">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* Secuencia de Afirmaciones: Header shrink-0 + Lista scrolleable min-h-0 flex-1 */}
                <div className="flex-1 min-h-0 flex flex-col space-y-2 pt-0.5 overflow-hidden">
                  <div className="shrink-0 flex items-center justify-between px-0.5">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-manifest-ink block tracking-tight">
                        Secuencia de Afirmaciones ({fields.length})
                      </label>
                      <motion.button
                        type="button"
                        data-testid="autofill-ai-btn"
                        whileTap={{ scale: 0.94 }}
                        onClick={handleAutoFillAI}
                        disabled={isAutoFilling}
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-xs inline-flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Sparkles className="w-3 h-3 text-amber-200" />
                        <span>Auto-completar con IA</span>
                      </motion.button>
                    </div>
                    <span className="text-[11px] text-manifest-inkMuted">
                      Pulsa Enter para crear la siguiente
                    </span>
                  </div>

                  {/* CONTENEDOR EXCLUSIVO DE SCROLL CON LAS AFIRMACIONES */}
                  <div
                    data-testid="rampage-affirmations-scroll"
                    className="flex-1 min-h-0 overflow-y-auto pr-1.5 space-y-2.5 overscroll-contain focus:outline-none"
                    tabIndex={0}
                  >
                    {fields.map((field, idx) => {
                      const currentVal = watchedAffirmations?.[idx]?.text || '';
                      const isAutoFilled = autoFilledIndices.includes(idx);
                      return (
                        <motion.div
                          key={field.id}
                          data-rampage-card={idx}
                          data-testid={`rampage-card-${idx}`}
                          animate={
                            isAutoFilled
                              ? { scale: [1, 1.04, 1] }
                              : { scale: 1 }
                          }
                          transition={{ duration: 0.28, ease: 'easeOut' }}
                          className={`p-3 sm:p-3.5 rounded-2xl transition-all space-y-2 ${
                            isAutoFilled
                              ? 'border-2 border-purple-500 bg-purple-50/40 shadow-[0_4px_20px_rgba(139,92,246,0.18)]'
                              : 'bg-manifest-surfaceElevated border border-manifest-glassBorder shadow-sm hover:border-manifest-glassBorderHover'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-manifest-ink bg-manifest-glassControl border border-manifest-glassBorder px-2 py-0.5 rounded-md">
                                Afirmación #{idx + 1}
                              </span>
                              {isAutoFilled && (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs"
                                >
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </motion.span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setVoiceActiveIdx(voiceActiveIdx === idx ? null : idx)}
                                title="Dictar con micrófono"
                                aria-label="Dictar con micrófono"
                                className="w-6 h-6 rounded-lg glass-pill text-manifest-inkMuted hover:text-manifest-ink border border-manifest-glassBorder shadow-xs flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus"
                              >
                                <Mic className="w-3 h-3" />
                              </button>
                              {fields.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => remove(idx)}
                                  title="Eliminar afirmación"
                                  className="w-6 h-6 rounded-lg glass-pill text-manifest-inkMuted hover:text-rose-400 border border-manifest-glassBorder shadow-xs flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>

                          {voiceActiveIdx === idx ? (
                            <VoiceAudioVisualizer
                              initialText={currentVal}
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
                                render={({ field: subField }) => (
                                  <AutoResizeTextarea
                                    {...subField}
                                    ref={(el) => {
                                      subField.ref(el);
                                      textareaRefs.current[idx] = el;
                                    }}
                                    enterKeyHint={idx === fields.length - 1 ? 'send' : 'next'}
                                    onFocus={(e) => {
                                      ensureCardVisible(idx);
                                      const el = e.currentTarget;
                                      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 150);
                                    }}
                                    onKeyDown={(e) => handleKeyDown(e, idx)}
                                    minRows={2}
                                    maxHeight={160}
                                    placeholder="Escribe la afirmación para esta secuencia..."
                                    className={`w-full p-2.5 pr-9 rounded-xl glass-input text-xs sm:text-sm placeholder:text-manifest-inkLight transition-all focus:outline-none focus:ring-1 focus:ring-manifest-auraPurple/50 ${
                                      errors.affirmations?.[idx]?.text
                                        ? 'border-rose-400 ring-1 ring-rose-400/50'
                                        : currentVal.trim().length > 0
                                        ? 'border-emerald-400 ring-1 ring-emerald-400/40'
                                        : ''
                                    }`}
                                  />
                                )}
                              />

                              <div className="absolute right-2.5 top-2.5 pointer-events-none">
                                {currentVal.trim().length > 0 && !errors.affirmations?.[idx]?.text && (
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
                            </div>
                          )}

                          {errors.affirmations?.[idx]?.text && (
                            <p className="text-[11px] text-rose-500 font-medium pt-0.5 pl-1">
                              {errors.affirmations[idx]?.text?.message}
                            </p>
                          )}
                        </motion.div>
                      );
                    })}

                    {/* Botón Añadir afirmación al final del scroll */}
                    <button
                      type="button"
                      onClick={handleAddAffirmation}
                      data-testid="rampage-add-affirmation-btn"
                      className="w-full py-2.5 px-3 rounded-2xl border-2 border-dashed border-manifest-glassBorder hover:border-manifest-glassBorderHover bg-manifest-glassControl/40 hover:bg-manifest-glassControl flex items-center justify-center gap-1.5 text-xs font-semibold text-manifest-ink transition-colors cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>Añadir afirmación</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Mac Dialog Footer (shrink-0) */}
              <div className="shrink-0 flex items-center justify-between px-6 py-3.5 bg-manifest-surfaceElevated border-t border-manifest-glassBorder">
                <div className="flex items-center gap-2 text-[11px] text-manifest-inkMuted">
                  <span><strong>Enter</strong> para encadenar</span>
                  <span>•</span>
                  <span><strong>⌘↵</strong> guardar</span>
                  <span>•</span>
                  <span><strong>Esc</strong> salir</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink glass-pill border border-manifest-glassBorder shadow-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    data-testid="rampage-submit-flow-btn"
                    onClick={handlePreSubmit}
                    className="px-5 py-2 rounded-xl text-xs font-semibold text-white primary-gradient-btn shadow-glass active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{setOrNull ? 'Guardar Cambios' : 'Crear Set de Rampage'}</span>
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
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      handleOnly
      repositionInputs={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-md" />
        <Drawer.Content
          data-testid="rampage-vaul-drawer"
          className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-lg max-h-[92dvh] flex flex-col rounded-t-[2.25rem] bg-manifest-surfaceNav/95 border-t border-manifest-glassBorder shadow-lens backdrop-blur-2xl outline-none overflow-hidden"
        >
          {/* iOS Native Grabber Handle */}
          <div className="pt-3 pb-1 bg-manifest-surfaceNav/95 shrink-0">
            <Drawer.Handle
              data-testid="ios-sheet-grabber"
              className="mx-auto w-12 h-1.5 rounded-full bg-manifest-inkMuted/30 cursor-grab active:cursor-grabbing"
            />
          </div>

          <Drawer.Title className="sr-only">
            {setOrNull ? 'Editar Set de Rampage' : 'Nuevo Set de Rampage'}
          </Drawer.Title>
          <Drawer.Description className="sr-only">
            Configuración de secuencia de afirmaciones para Rampage
          </Drawer.Description>

          {/* iOS Compact Navigation Bar (h-14 px-4) */}
          <div className="shrink-0 h-14 px-4 flex items-center justify-between border-b border-manifest-glassBorder bg-manifest-surfaceNav/95 z-10">
            <button
              type="button"
              onClick={onClose}
              className="text-manifest-inkMuted hover:text-manifest-ink font-medium text-sm transition-colors cursor-pointer px-1 py-1"
            >
              Cancelar
            </button>

            <div className="text-center truncate px-2">
              <h3 className="font-serif text-sm sm:text-base font-bold text-manifest-ink truncate">
                {setOrNull ? 'Editar Set' : 'Nuevo Set'}
              </h3>
              <p className="text-[10px] text-manifest-inkMuted truncate">
                {fields.length} {fields.length === 1 ? 'afirmación' : 'afirmaciones'}
              </p>
            </div>

            <motion.button
              type="button"
              whileTap={IOS_TAP_SPRING}
              onClick={handlePreSubmit}
              data-testid="rampage-submit-nav-btn"
              className="primary-gradient-btn text-white px-4 py-1.5 rounded-full font-semibold text-xs sm:text-sm shadow-glass hover:opacity-95 active:scale-95 transition-all cursor-pointer"
            >
              {setOrNull ? 'Guardar' : 'Crear'}
            </motion.button>
          </div>

          <form
            onSubmit={handlePreSubmit}
            className="flex flex-col flex-1 min-h-0 overflow-hidden"
          >
            {/* Scrollable Body (flex-1 min-h-0 overflow-y-auto) */}
            <div
              data-vaul-no-drag=""
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y px-4 sm:px-5 py-4 space-y-4 pb-12"
            >
              {/* Espacio / Perfil */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-manifest-ink">
                  Espacio
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'facu' as UserScope, label: 'Facu', icon: Moon },
                    { key: 'maia' as UserScope, label: 'Maia', icon: Heart },
                    { key: 'shared' as UserScope, label: 'Juntos', icon: Sparkles },
                  ].map((sc) => {
                    const Icon = sc.icon;
                    const isSelected = selectedUserId === sc.key;
                    return (
                      <motion.button
                        key={sc.key}
                        type="button"
                        whileTap={IOS_TAP_SPRING}
                        onClick={() => setValue('userId', sc.key, { shouldDirty: true })}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-colors border cursor-pointer flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-manifest-glassControlActive text-manifest-ink border-manifest-glassBorderFocus shadow-sm'
                            : 'bg-manifest-glassControl hover:bg-manifest-glassControlHover text-manifest-inkMuted border-manifest-glassBorder'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-purple-600' : 'text-manifest-inkLight'}`} />
                        <span>{sc.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Título del Set */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-manifest-ink block">
                  Título del Set
                </label>
                <div className="relative">
                  <input
                    {...register('title')}
                    type="text"
                    placeholder="Ej: Abundancia, Paz Serena, Éxito"
                    className={`w-full p-3.5 pr-10 rounded-2xl glass-input text-base sm:text-xs placeholder:text-manifest-inkMuted/40 transition-colors ${
                      errors.title
                        ? 'border-rose-400 ring-1 ring-rose-400/50'
                        : watch('title')?.trim().length > 0
                        ? 'border-emerald-400 ring-1 ring-emerald-400/40'
                        : ''
                    }`}
                  />
                  {watch('title')?.trim().length > 0 && !errors.title && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-100/80 text-emerald-700 border border-emerald-300/60 flex items-center justify-center shadow-neu-sm">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
                {errors.title && (
                  <p className="text-[11px] text-rose-500 font-medium pt-0.5 pl-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Secuencia de Afirmaciones */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-manifest-ink block">
                      Secuencia de Afirmaciones
                    </label>
                    <motion.button
                      type="button"
                      data-testid="autofill-ai-btn-mobile"
                      whileTap={{ scale: 0.94 }}
                      onClick={handleAutoFillAI}
                      disabled={isAutoFilling}
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-xs inline-flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Sparkles className="w-3 h-3 text-amber-200" />
                      <span>Auto-completar</span>
                    </motion.button>
                  </div>
                  <span className="text-[11px] text-manifest-inkMuted">
                    Mínimo 1 para activar
                  </span>
                </div>

                <div className="space-y-2.5">
                  {fields.map((field, idx) => {
                    const currentVal = watchedAffirmations?.[idx]?.text || '';
                    const isAutoFilled = autoFilledIndices.includes(idx);
                    return (
                      <motion.div
                        key={field.id}
                        data-rampage-card={idx}
                        data-testid={`rampage-card-${idx}`}
                        animate={
                          isAutoFilled
                            ? { scale: [1, 1.04, 1] }
                            : { scale: 1 }
                        }
                        transition={{ duration: 0.28, ease: 'easeOut' }}
                        className={`p-3 sm:p-3.5 rounded-2xl transition-all space-y-2 ${
                          isAutoFilled
                            ? 'border-2 border-purple-500 bg-purple-50/40 shadow-[0_4px_20px_rgba(139,92,246,0.18)]'
                            : 'bg-manifest-surfaceElevated border border-manifest-glassBorder shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-manifest-ink bg-manifest-glassControl border border-manifest-glassBorder px-2 py-0.5 rounded-md">
                              #{idx + 1}
                            </span>
                            {isAutoFilled && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs"
                              >
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </motion.span>
                            )}
                          </div>
                          {fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(idx)}
                              title="Eliminar afirmación"
                              className="p-1 rounded-lg text-manifest-inkMuted hover:text-rose-400 hover:bg-manifest-glassControlHover transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {voiceActiveIdx === idx ? (
                          <VoiceAudioVisualizer
                            initialText={currentVal}
                            placeholder="Habla tu afirmación..."
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
                          <div className="space-y-1">
                            <div className="relative">
                              <Controller
                                name={`affirmations.${idx}.text`}
                                control={control}
                                render={({ field: subField }) => (
                                  <AutoResizeTextarea
                                    {...subField}
                                    ref={(el) => {
                                      subField.ref(el);
                                      textareaRefs.current[idx] = el;
                                    }}
                                    enterKeyHint={idx === fields.length - 1 ? 'send' : 'next'}
                                    onFocus={(e) => {
                                      ensureCardVisible(idx);
                                      const el = e.currentTarget;
                                      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 150);
                                    }}
                                    onKeyDown={(e) => handleKeyDown(e, idx)}
                                    minRows={2}
                                    maxHeight={200}
                                    placeholder="Escribe la afirmación para esta secuencia..."
                                    className={`w-full p-2.5 pr-8 rounded-xl glass-input text-base sm:text-xs placeholder:text-manifest-inkMuted/40 transition-colors ${
                                      errors.affirmations?.[idx]?.text
                                        ? 'border-rose-400 ring-1 ring-rose-400/50'
                                        : currentVal.trim().length > 0
                                        ? 'border-emerald-400 ring-1 ring-emerald-400/40'
                                        : ''
                                    }`}
                                  />
                                )}
                              />
                              <div className="absolute right-2.5 top-2.5 pointer-events-none">
                                {currentVal.trim().length > 0 && !errors.affirmations?.[idx]?.text && (
                                  <div className="w-4 h-4 rounded-full bg-emerald-100/80 text-emerald-700 border border-emerald-300/60 flex items-center justify-center shadow-neu-sm">
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  </div>
                                )}
                                {errors.affirmations?.[idx]?.text && (
                                  <div className="w-4 h-4 rounded-full bg-rose-100/80 text-rose-700 border border-rose-300/60 flex items-center justify-center shadow-neu-sm">
                                    <AlertCircle className="w-2.5 h-2.5 stroke-[2.5]" />
                                  </div>
                                )}
                              </div>
                            </div>
                            {errors.affirmations?.[idx]?.text && (
                              <p className="text-[11px] text-rose-500 font-medium pt-1 pl-1">
                                {errors.affirmations[idx]?.text?.message}
                              </p>
                            )}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Botón Trello: Añadir afirmación debajo de la última */}
                <motion.button
                  type="button"
                  whileTap={IOS_TAP_SPRING}
                  onClick={handleAddAffirmation}
                  data-testid="rampage-add-affirmation-btn"
                  className="w-full py-2.5 px-3 rounded-2xl border-2 border-dashed border-manifest-glassBorder hover:border-manifest-glassBorderHover bg-manifest-glassControl/40 hover:bg-manifest-glassControl flex items-center justify-center gap-1.5 text-xs font-semibold text-manifest-ink transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Añadir afirmación</span>
                </motion.button>

                {/* Botón principal dentro del flujo final del scroll */}
                <div className="pt-4 pb-4">
                  <motion.button
                    type="submit"
                    whileTap={IOS_TAP_SPRING}
                    data-testid="rampage-submit-flow-btn"
                    className="w-full py-3 px-4 rounded-2xl primary-gradient-btn text-xs sm:text-sm font-semibold shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>{setOrNull ? 'Guardar Cambios del Set' : 'Crear Set de Rampage'}</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </form>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
