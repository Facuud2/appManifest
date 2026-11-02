'use client';

import React, { useState, useRef } from 'react';
import { Drawer } from 'vaul';
import { Sparkles, X, Mic, Volume2, RotateCcw, Check, Radio } from 'lucide-react';
import { useAppStore } from '@/store';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { AutoResizeTextarea } from '@/components/ui/AutoResizeTextarea';
import { VoiceAudioVisualizer } from '@/components/ui/VoiceAudioVisualizer';
import { motion, AnimatePresence } from 'framer-motion';
import { IOS_TAP_SPRING, LIQUID_GLASS_SPECULAR } from '@/lib/iosSprings';
import { useVoiceProfile } from '@/hooks/useVoiceProfile';
import { audioEngine, AmbienceType } from '@/lib/audioEngine';

interface RampageConfigDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSession: (
    theme: string,
    specs: string,
    options?: { autoPlayVoice: boolean; ambience: AmbienceType }
  ) => void;
  onOpenManualEditor?: () => void;
}

export const RampageConfigDrawer: React.FC<RampageConfigDrawerProps> = ({
  isOpen,
  onClose,
  onStartSession,
  onOpenManualEditor,
}) => {
  const isDesktop = useIsDesktop();
  const { showToast } = useAppStore();
  const { hasVoice, profile, saveSample } = useVoiceProfile();

  const [theme, setTheme] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [themeError, setThemeError] = useState('');

  // Audio Playback Controls
  const [autoPlayVoice, setAutoPlayVoice] = useState(true);
  const [ambience, setAmbience] = useState<AmbienceType>('432hz');

  // Voice recording state ('theme' | 'specs' | 'calibrate' | null)
  const [recordingField, setRecordingField] = useState<'theme' | 'specs' | 'calibrate' | null>(
    null
  );

  const themeInputRef = useRef<HTMLInputElement>(null);
  const specTextareaRef = useRef<HTMLTextAreaElement>(null);

  const handleStart = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanTheme = theme.trim();
    if (!cleanTheme || cleanTheme.length < 3) {
      setThemeError('Por favor ingresa un tema central (mínimo 3 caracteres)');
      if (themeInputRef.current) themeInputRef.current.focus();
      return;
    }

    setThemeError('');

    // Unlock Web Audio API on this direct user gesture (crucial for iOS WebKit Safari)
    await audioEngine.unlock();

    onStartSession(cleanTheme, specifications.trim(), {
      autoPlayVoice,
      ambience,
    });
    onClose();

    // Reset state for next session
    setTheme('');
    setSpecifications('');
    setRecordingField(null);
  };

  const handleVoiceCommit = async (
    transcribed: string,
    extra?: { detectedTone?: string; audioBlob?: Blob; durationMs?: number }
  ) => {
    const currentTarget = recordingField;
    setRecordingField(null);

    // Save audio blob into IndexedDB if user doesn't have voice profile or is recalibrating
    if (extra?.audioBlob && (!hasVoice || currentTarget === 'calibrate')) {
      try {
        await saveSample(extra.audioBlob, {
          durationSeconds: Math.round((extra.durationMs || 6000) / 1000),
          detectedTone: extra.detectedTone || 'calma, firme, íntima',
        });
        showToast('✨ Huella vocal AYA calibrada con éxito', 'success');
      } catch (err) {
        console.warn('Error saving voice sample to IndexedDB:', err);
      }
    }

    if (currentTarget === 'theme') {
      setTheme(transcribed);
      if (themeError) setThemeError('');
    } else if (currentTarget === 'specs') {
      setSpecifications(transcribed);
      if (specTextareaRef.current) {
        specTextareaRef.current.value = transcribed;
        const event = new Event('input', { bubbles: true });
        specTextareaRef.current.dispatchEvent(event);
      }
    }
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    setTimeout(() => {
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 180);
  };

  const renderContent = (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* iOS Compact Header */}
      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-manifest-glassBorder flex items-center justify-between gap-3 bg-manifest-surfaceNav/95 z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-manifest-glassControl border border-manifest-glassBorder flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-manifest-auraPurple" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-serif font-bold text-manifest-ink leading-tight truncate">
              Nuevo Rampage Vocal AYA
            </h3>
            <p className="text-[10px] sm:text-[11px] text-manifest-inkMuted leading-tight truncate mt-0.5">
              Afirmaciones con tu propia voz en lotes de 3
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Header Start Button for Mobile */}
          <motion.button
            type="button"
            whileTap={IOS_TAP_SPRING}
            onClick={handleStart}
            data-testid="start-ai-rampage-header-btn"
            className="sm:hidden px-3.5 py-1.5 rounded-full primary-gradient-btn text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus"
          >
            <span>Iniciar</span>
            <Sparkles className="w-3 h-3" />
          </motion.button>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-manifest-inkMuted hover:text-manifest-ink hover:bg-manifest-glassControlHover transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Form Body with dedicated scroll container */}
      <form
        onSubmit={handleStart}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 sm:px-6 py-4 space-y-4 touch-pan-y"
      >
        {/* Píldora de Estado de Huella Vocal en Liquid Glass */}
        <div
          data-testid="voice-profile-status-pill"
          className="p-3 rounded-2xl liquid-glass-surface border border-manifest-glassBorder flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                hasVoice
                  ? 'bg-emerald-100/80 text-emerald-700 border border-emerald-300/60 shadow-neu-sm'
                  : 'bg-manifest-glassControl text-manifest-auraPurple border border-manifest-glassBorder animate-pulse'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-manifest-ink block leading-tight truncate">
                {hasVoice
                  ? '✨ Tu Voz AYA está activa y calibrada'
                  : 'Graba tu intención (6-15s) para activar tu Voz AYA'}
              </span>
              <p className="text-[10px] text-manifest-inkMuted leading-tight mt-0.5 truncate">
                {hasVoice
                  ? `Cadencia detectada: ${profile?.detectedTone || 'calma, firme, íntima'}`
                  : 'Se usará tu timbre exacto para hablar cada afirmación'}
              </p>
            </div>
          </div>

          {hasVoice && (
            <button
              type="button"
              onClick={() => setRecordingField('calibrate')}
              className="shrink-0 text-[10px] font-medium text-manifest-auraPurple hover:underline flex items-center gap-1 cursor-pointer px-2 py-1 rounded-lg hover:bg-manifest-glassControlHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus"
              title="Recalibrar huella vocal"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Recalibrar</span>
            </button>
          )}
        </div>

        {/* Recalibration Recording Overlay */}
        {recordingField === 'calibrate' && (
          <div className="p-3 rounded-2xl bg-manifest-glassControl border border-manifest-glassBorder shadow-sm space-y-2">
            <p className="text-[11px] text-manifest-ink font-semibold">
              Habla claro durante 6 a 15 segundos sobre cualquier intención para actualizar tu timbre maestro:
            </p>
            <VoiceAudioVisualizer
              onCommit={handleVoiceCommit}
              onCancel={() => setRecordingField(null)}
              placeholder="Habla con tu tono natural y pausado..."
            />
          </div>
        )}

        {/* Campo 1: Tema Central (Obligatorio) con Botón de Micrófono */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-manifest-ink flex items-center gap-1">
              <span>Tema Central del Rampage</span>
              <span className="text-manifest-auraPurple">*</span>
            </label>
            <span className="text-[10px] text-manifest-inkMuted">Intención o Título</span>
          </div>

          {recordingField === 'theme' ? (
            <div className="p-2 rounded-2xl bg-manifest-glassControl border border-manifest-glassBorder shadow-sm">
              <VoiceAudioVisualizer
                initialText={theme}
                onCommit={handleVoiceCommit}
                onCancel={() => setRecordingField(null)}
                placeholder="Dicta tu tema central con tu propia voz..."
              />
            </div>
          ) : (
            <div className="relative">
              <input
                ref={themeInputRef}
                type="text"
                data-testid="rampage-central-theme-input"
                value={theme}
                onFocus={handleInputFocus}
                onChange={(e) => {
                  setTheme(e.target.value);
                  if (themeError && e.target.value.trim().length >= 3) {
                    setThemeError('');
                  }
                }}
                placeholder="ej. Certeza económica y plenitud creativa"
                className="w-full px-3.5 py-2.5 pr-11 rounded-2xl glass-input text-xs sm:text-sm placeholder:text-manifest-inkMuted/40"
                autoFocus
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <button
                  type="button"
                  onClick={() => setRecordingField('theme')}
                  title="Dictar tema con micrófono"
                  aria-label="Dictar tema con micrófono"
                  data-testid="rampage-theme-mic-btn"
                  className="w-7 h-7 rounded-xl glass-pill text-manifest-inkMuted hover:text-manifest-ink border border-manifest-glassBorder hover:bg-manifest-glassControlHover shadow-xs flex items-center justify-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus"
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {themeError && (
            <p className="text-[11px] text-rose-500 font-medium pl-1">{themeError}</p>
          )}
        </div>

        {/* Campo 2: Especificaciones o Matices (Opcional con Micrófono) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-manifest-ink flex items-center gap-1">
              <span>Especificaciones o matices</span>
              <span className="text-[10px] font-normal text-manifest-inkMuted">(Opcional)</span>
            </label>
            <span className="text-[10px] text-manifest-inkMuted">Detalles y emociones</span>
          </div>

          {recordingField === 'specs' ? (
            <div className="p-2 rounded-2xl bg-manifest-glassControl border border-manifest-glassBorder shadow-sm">
              <VoiceAudioVisualizer
                initialText={specifications}
                onCommit={handleVoiceCommit}
                onCancel={() => setRecordingField(null)}
                placeholder="Describe tus matices o emociones clave..."
              />
            </div>
          ) : (
            <div className="relative">
              <AutoResizeTextarea
                ref={specTextareaRef}
                data-testid="rampage-specifications-input"
                value={specifications}
                onFocus={handleInputFocus}
                onChange={(e) => setSpecifications(e.target.value)}
                placeholder="ej. Enfatizar serenidad interior, disfrute compartido y soltar el control..."
                minRows={2}
                maxHeight={140}
                className="w-full p-3.5 pr-11 rounded-2xl glass-input text-xs sm:text-sm placeholder:text-manifest-inkMuted/40 leading-relaxed"
              />
              <div className="absolute right-2.5 bottom-2.5">
                <button
                  type="button"
                  onClick={() => setRecordingField('specs')}
                  title="Dictar matices con voz"
                  aria-label="Dictar matices con voz"
                  data-testid="rampage-specs-mic-btn"
                  className="w-8 h-8 rounded-xl glass-pill text-manifest-inkMuted hover:text-manifest-ink border border-manifest-glassBorder hover:bg-manifest-glassControlHover shadow-sm flex items-center justify-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Configuración de Reproducción de Voz y Sonido Ambiental */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-manifest-glassControl border border-manifest-glassBorder">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-manifest-auraPurple" />
              <div>
                <span className="text-xs font-semibold text-manifest-ink block leading-tight">
                  Reproducción de Voz AYA
                </span>
                <span className="text-[10px] text-manifest-inkMuted">
                  Auto-Play con tu voz clonada
                </span>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={autoPlayVoice}
              data-testid="toggle-autoplay-voice"
              onClick={() => setAutoPlayVoice((prev) => !prev)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus ${
                autoPlayVoice ? 'bg-manifest-auraPurple' : 'bg-manifest-ink/20'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white shadow-sm block absolute top-0.5 transition-transform ${
                  autoPlayVoice ? 'left-[22px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Sonido Ambiental Opcional */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-manifest-ink block">
              Atmósfera Sonora de Fondo
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'none', label: 'Silencio' },
                { id: '432hz', label: 'Frecuencia 432Hz' },
                { id: 'astral_rain', label: 'Lluvia Astral' },
              ].map((item) => {
                const isSelected = ambience === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAmbience(item.id as AmbienceType)}
                    className={`py-2 px-2.5 rounded-xl text-[11px] font-medium transition-all text-center border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus ${
                      isSelected
                        ? 'bg-manifest-glassControlActive text-manifest-ink border-manifest-glassBorderFocus shadow-xs'
                        : 'bg-manifest-glassControl/50 text-manifest-inkMuted border-manifest-glassBorder hover:bg-manifest-glassControl'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </form>

      {/* Action Footer */}
      <div className="shrink-0 px-5 sm:px-6 py-3.5 border-t border-manifest-glassBorder flex flex-col sm:flex-row items-center justify-between gap-3 z-10 bg-manifest-surfaceNav/95">
        {onOpenManualEditor ? (
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenManualEditor();
            }}
            className="text-[11px] font-medium text-manifest-auraPurple hover:underline cursor-pointer order-2 sm:order-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus rounded-lg px-1"
          >
            O crear set manualmente
          </button>
        ) : (
          <div className="order-2 sm:order-1" />
        )}

        <motion.button
          type="button"
          whileTap={IOS_TAP_SPRING}
          onClick={handleStart}
          data-testid="start-ai-rampage-btn"
          className="w-full sm:w-auto px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-white primary-gradient-btn shadow-glass active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 order-1 sm:order-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus"
        >
          <span>Siguiente: Iniciar Rampage ✨</span>
          <Sparkles className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );

  // Desktop Dialog / Modal
  if (isDesktop) {
    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-slate-900/35 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="relative z-10 w-full max-w-lg max-h-[85vh] rounded-3xl liquid-glass-surface bg-manifest-surfaceElevated shadow-lens overflow-hidden border border-manifest-glassBorder flex flex-col"
            >
              {renderContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  // Mobile Native Vaul Drawer
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
          data-testid="rampage-config-drawer"
          className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-lg max-h-[88vh] max-h-[88dvh] flex flex-col rounded-t-[2.25rem] bg-manifest-surfaceNav/95 border-t border-manifest-glassBorder shadow-lens outline-none overflow-hidden"
        >
          {/* iOS Grabber Handle */}
          <div className="pt-3 pb-1 bg-manifest-surfaceNav/95 shrink-0">
            <Drawer.Handle
              data-testid="ios-sheet-grabber"
              className="mx-auto w-12 h-1.5 rounded-full bg-manifest-inkMuted/30 cursor-grab active:cursor-grabbing"
            />
          </div>
          {renderContent}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
