'use client';

import React, { useState, useRef } from 'react';
import { Drawer } from 'vaul';
import { Sparkles, X, Mic } from 'lucide-react';
import { useAppStore } from '@/store';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { AutoResizeTextarea } from '@/components/ui/AutoResizeTextarea';
import { VoiceAudioVisualizer } from '@/components/ui/VoiceAudioVisualizer';
import { motion, AnimatePresence } from 'framer-motion';
import { IOS_TAP_SPRING, LIQUID_GLASS_SPECULAR } from '@/lib/iosSprings';

interface RampageConfigDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSession: (theme: string, specs: string) => void;
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

  const [theme, setTheme] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [themeError, setThemeError] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  const themeInputRef = useRef<HTMLInputElement>(null);
  const specTextareaRef = useRef<HTMLTextAreaElement>(null);

  const handleStart = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanTheme = theme.trim();
    if (!cleanTheme || cleanTheme.length < 3) {
      setThemeError('Por favor ingresa un tema central (mínimo 3 caracteres)');
      if (themeInputRef.current) themeInputRef.current.focus();
      return;
    }
    setThemeError('');
    onStartSession(cleanTheme, specifications.trim());
    onClose();
    // Reset state for next session
    setTheme('');
    setSpecifications('');
    setIsVoiceActive(false);
  };

  const handleVoiceCommit = (transcribed: string) => {
    setIsVoiceActive(false);
    setSpecifications(transcribed);
    if (specTextareaRef.current) {
      specTextareaRef.current.value = transcribed;
      const event = new Event('input', { bubbles: true });
      specTextareaRef.current.dispatchEvent(event);
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
      {/* iOS Compact Header Anti-Colisión de Teclado */}
      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-manifest-ink/[0.07] flex items-center justify-between gap-3 bg-white/95 z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-manifest-auraPurple/30 to-purple-400/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-manifest-auraPurple" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-serif font-bold text-manifest-ink leading-tight truncate">
              Nuevo Rampage con IA
            </h3>
            <p className="text-[10px] sm:text-[11px] text-manifest-inkMuted leading-tight truncate mt-0.5">
              Secuencia viva en lotes de 3 en 3
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Header Start Button for Mobile (accessible when virtual keyboard is open) */}
          <motion.button
            type="button"
            whileTap={IOS_TAP_SPRING}
            onClick={handleStart}
            data-testid="start-ai-rampage-header-btn"
            className="sm:hidden px-3.5 py-1.5 rounded-full primary-gradient-btn text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Iniciar</span>
            <Sparkles className="w-3 h-3" />
          </motion.button>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-manifest-inkMuted hover:text-manifest-ink hover:bg-black/5 transition-colors cursor-pointer"
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
        {/* Campo 1: Tema Central (Obligatorio) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-manifest-ink flex items-center gap-1">
              <span>Tema Central del Rampage</span>
              <span className="text-manifest-auraPurple">*</span>
            </label>
            <span className="text-[10px] text-manifest-inkLight">Título del Set</span>
          </div>
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
            placeholder="ej. Estabilidad financiera y abundancia creativa"
            className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-xs sm:text-sm placeholder:text-manifest-inkLight"
            autoFocus
          />
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
            <span className="text-[10px] text-manifest-inkLight">Detalles y emociones</span>
          </div>

          {isVoiceActive ? (
            <div className="p-2 rounded-2xl bg-white/70 border border-manifest-auraPurple/30 shadow-sm">
              <VoiceAudioVisualizer
                initialText={specifications}
                onCommit={handleVoiceCommit}
                onCancel={() => setIsVoiceActive(false)}
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
                placeholder="ej. Enfatizar seguridad interior, disfrute compartido con mi pareja y fluidez sin prisa..."
                minRows={3}
                maxHeight={160}
                className="w-full p-3.5 pr-11 rounded-2xl glass-input text-xs sm:text-sm placeholder:text-manifest-inkLight leading-relaxed"
              />
              <div className="absolute right-2.5 bottom-2.5">
                <button
                  type="button"
                  onClick={() => setIsVoiceActive(true)}
                  title="Dictar matices con voz"
                  aria-label="Dictar matices con voz"
                  className="w-8 h-8 rounded-xl bg-white/80 hover:bg-white text-manifest-inkMuted hover:text-manifest-ink border border-white/90 shadow-sm flex items-center justify-center transition-all cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          <p className="text-[10px] text-manifest-inkMuted pl-1">
            Gemini generará afirmaciones rítmicas conectadas con este contexto en lotes dinámicos de 3 en 3.
          </p>
        </div>
      </form>

      {/* Action Footer (Always pinned at bottom with shrink-0) */}
      <div className="shrink-0 px-5 sm:px-6 py-3.5 bg-manifest-ink/[0.02] border-t border-manifest-ink/[0.07] flex flex-col sm:flex-row items-center justify-between gap-3 z-10 bg-white/95">
        {onOpenManualEditor ? (
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenManualEditor();
            }}
            className="text-[11px] font-medium text-manifest-auraPurple hover:underline cursor-pointer order-2 sm:order-1"
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
          className="w-full sm:w-auto px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-manifest-auraPurple via-purple-600 to-indigo-600 hover:opacity-95 shadow-[0_2px_12px_rgba(184,163,248,0.45)] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 order-1 sm:order-2"
        >
          <span>Siguiente: Iniciar Rampage</span>
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
              className="absolute inset-0 bg-manifest-ink/35 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className={`relative z-10 w-full max-w-lg max-h-[85vh] rounded-3xl ${LIQUID_GLASS_SPECULAR} bg-white/95 shadow-liquid overflow-hidden border border-white/80 flex flex-col`}
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
        <Drawer.Overlay className="fixed inset-0 z-50 bg-manifest-ink/40 backdrop-blur-sm" />
        <Drawer.Content
          data-testid="rampage-config-drawer"
          className={`fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-lg max-h-[88vh] max-h-[88dvh] flex flex-col rounded-t-[2.25rem] ${LIQUID_GLASS_SPECULAR} bg-white/95 shadow-liquid outline-none overflow-hidden`}
        >
          {/* iOS Grabber Handle */}
          <div className="pt-3 pb-1 bg-white/95 shrink-0">
            <Drawer.Handle
              data-testid="ios-sheet-grabber"
              className="mx-auto w-12 h-1.5 rounded-full bg-manifest-ink/20 cursor-grab active:cursor-grabbing"
            />
          </div>
          {renderContent}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
