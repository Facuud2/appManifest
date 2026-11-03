'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store';
import {
  Flame,
  Wind,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  X,
  RotateCcw,
  ShieldCheck,
  Feather,
  Compass,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VoiceDictationButton } from '@/components/ui/VoiceDictationButton';

type RitualStage = 'write' | 'reflect' | 'burning' | 'released';

export const ReleaseRitual: React.FC = () => {
  const { destroyRelease, showToast, checkAndUnlockMilestones } = useAppStore();

  const [stage, setStage] = useState<RitualStage>('write');
  const [fearContent, setFearContent] = useState('');

  // Optional reflections
  const [whyAffects, setWhyAffects] = useState('');
  const [learned, setLearned] = useState('');
  const [remember, setRemember] = useState('');
  const [chooseNow, setChooseNow] = useState('');

  // Confirmation modal state before burning
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const startBurningRitual = () => {
    setShowConfirmModal(false);
    setStage('burning');

    // Simulate animated ceremonial dissolution
    setTimeout(() => {
      // Permanently destroy the content from memory/storage
      destroyRelease('ritual-current');
      const unlocked = checkAndUnlockMilestones({ suppressModal: true });
      if (unlocked.length === 0) {
        showToast('Carga transmutada en luz y paz', 'gentle');
      }
      setStage('released');
    }, 2800);
  };

  const resetRitual = () => {
    setFearContent('');
    setWhyAffects('');
    setLearned('');
    setRemember('');
    setChooseNow('');
    setStage('write');
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Intro Header */}
      <div className="text-center space-y-1.5 px-2">
        <div className="w-10 h-10 mx-auto rounded-2xl bg-gradient-to-tr from-amber-200 via-rose-200 to-manifest-lavender flex items-center justify-center shadow-glass">
          <Flame className="w-5 h-5 text-amber-700" />
        </div>
        <h2 className="text-xl font-serif font-bold text-manifest-ink">
          Ritual de Liberación
        </h2>
        <p className="text-xs text-manifest-inkMuted leading-relaxed max-w-xs mx-auto">
          Un espacio seguro y confidencial para volcar preocupaciones, miedos o pesos emocionales y soltarlos con amor.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* STAGE 1: WRITE ON DIGITAL PARCHMENT */}
        {stage === 'write' && (
          <motion.div
            key="stage-write"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            {/* Digital Ancient Parchment */}
            <div className="relative rounded-2xl p-5 sm:p-6 glass-card border border-amber-900/30 shadow-liquid text-manifest-ink overflow-hidden tarot-card-border">
              <div className="flex items-center justify-between pb-3 border-b border-amber-500/15">
                <span className="text-[11px] font-medium text-amber-200/80 flex items-center gap-1.5">
                  <Feather className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hoja de transmutación y desahogo</span>
                </span>
                <div className="flex items-center gap-2">
                  <VoiceDictationButton
                    onTranscript={(text) => setFearContent(text)}
                    initialText={fearContent}
                    size="sm"
                    title="Dictar desahogo por voz"
                  />
                  <span className="text-[10px] text-amber-300/60 uppercase tracking-widest">
                    Paso 1 de 3
                  </span>
                </div>
              </div>

              <textarea
                rows={6}
                value={fearContent}
                onChange={(e) => setFearContent(e.target.value)}
                placeholder="Escribe aquí ese pensamiento limitante, esa duda, ese miedo o esa sombra que sientes que pesa en tu pecho... Este pergamino arderá en el fuego sagrado."
                className="w-full mt-3 bg-transparent border-none focus:outline-none text-xs md:text-sm leading-relaxed text-manifest-ink placeholder:text-manifest-inkLight/40 resize-none font-sans"
              />

              <div className="pt-2 text-[10px] text-amber-300/60 text-right">
                {fearContent.length > 0 ? `${fearContent.length} caracteres volcados` : 'Escribe con total verdad interior'}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStage('reflect')}
                disabled={!fearContent.trim()}
                className="flex-1 py-3 px-4 rounded-xl primary-gradient-btn text-xs font-semibold disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Reconocer y Profundizar</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STAGE 2: RECOGNIZE & REFLECT */}
        {stage === 'reflect' && (
          <motion.div
            key="stage-reflect"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            <div className="p-5 rounded-2xl tarot-card-border glass-card border border-purple-400/20 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-purple-900/20">
                <span className="text-xs font-serif font-bold text-manifest-ink flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-manifest-auraPurple" />
                  Reconocer para transmutar (Opcional)
                </span>
                <span className="text-[10px] text-manifest-inkLight uppercase tracking-widest">
                  Paso 2 de 3
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-manifest-inkLight font-medium block mb-1">
                    1. ¿Por qué siento que esto me afecta tanto?
                  </label>
                  <input
                    type="text"
                    value={whyAffects}
                    onChange={(e) => setWhyAffects(e.target.value)}
                    placeholder="Respuesta breve o intuitiva..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="text-manifest-inkLight font-medium block mb-1">
                    2. ¿Qué aprendizaje puedo extraer de esta vivencia?
                  </label>
                  <input
                    type="text"
                    value={learned}
                    onChange={(e) => setLearned(e.target.value)}
                    placeholder="Lo que me enseña sobre mis límites o anhelos..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="text-manifest-inkLight font-medium block mb-1">
                    3. ¿Qué elijo creer y sentir a partir de este instante?
                  </label>
                  <input
                    type="text"
                    value={chooseNow}
                    onChange={(e) => setChooseNow(e.target.value)}
                    placeholder="Elijo la confianza, la liviandad, el poder personal..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStage('write')}
                className="py-3 px-4 rounded-xl glass-pill text-xs font-medium text-manifest-ink hover:bg-white/5 cursor-pointer"
              >
                Atrás
              </button>
              <button
                onClick={() => setShowConfirmModal(true)}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-800 via-rose-800 to-purple-900 border border-amber-500/30 text-white text-xs font-bold shadow-liquid flex items-center justify-center gap-2 cursor-pointer hover:brightness-110 active:scale-95 transition-all"
              >
                <Flame className="w-4 h-4 fill-amber-400 text-amber-300" />
                <span>Proceder al Fuego Sagrado</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* STAGE 3: BURNING ANIMATION & DISSOLUTION */}
        {stage === 'burning' && (
          <motion.div
            key="stage-burning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 px-6 rounded-2xl tarot-card-border glass-card border border-purple-400/20 text-center relative overflow-hidden"
          >
            {/* Luminous burning particles */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <motion.div
                className="w-48 h-48 rounded-full bg-gradient-to-tr from-amber-600/30 via-rose-600/30 to-purple-600/30 blur-3xl"
                animate={{
                  scale: [1, 1.4, 0.8, 1.6, 0],
                  opacity: [0.6, 1, 0.8, 1, 0],
                }}
                transition={{ duration: 2.7, ease: 'easeInOut' }}
              />
            </div>

            {/* Fading dissolving digital paper */}
            <motion.div
              animate={{
                opacity: [1, 0.8, 0.4, 0.1, 0],
                scale: [1, 0.98, 0.92, 0.85, 0.7],
                filter: [
                  'blur(0px)',
                  'blur(2px) contrast(1.2)',
                  'blur(6px) contrast(1.5)',
                  'blur(12px)',
                ],
                y: [0, -5, -15, -30],
              }}
              transition={{ duration: 2.7, ease: 'easeOut' }}
              className="p-6 rounded-xl glass-card border border-amber-500/30 shadow-inner max-w-xs mx-auto"
            >
              <p className="text-xs text-manifest-ink font-medium line-clamp-3">
                {fearContent}
              </p>
            </motion.div>

            {/* Sparkles rising */}
            <div className="mt-8 space-y-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 mx-auto text-amber-400"
              >
                <Sparkles className="w-8 h-8" />
              </motion.div>
              <p className="text-sm font-semibold text-manifest-ink">
                Transmutando la sombra en ceniza y espacio fértil...
              </p>
              <p className="text-[11px] text-manifest-inkLight">
                El peso se disuelve en tu templo interior.
              </p>
            </div>
          </motion.div>
        )}

        {/* STAGE 4: RELEASED & PEACEFUL CLOSING */}
        {stage === 'released' && (
          <motion.div
            key="stage-released"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="p-8 rounded-2xl tarot-card-border glass-card border border-purple-400/20 shadow-liquid text-center space-y-4"
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100/80 border border-emerald-300/60 text-emerald-700 flex items-center justify-center shadow-neu-sm">
              <Wind className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-manifest-ink">
                Liberado y devuelto a la paz
              </h3>
              <p className="text-xs text-manifest-inkLight max-w-xs mx-auto leading-relaxed">
                El contenido fue consumido por completo de este dispositivo. Ahora existe nuevo espacio en tu altar para lo que sí deseas consagrar.
              </p>
            </div>

            {chooseNow && (
              <div className="p-3.5 rounded-xl bg-purple-100/80 border border-purple-300/60 text-xs text-purple-900 font-semibold shadow-neu-sm">
                {chooseNow}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={resetRitual}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl primary-gradient-btn text-xs font-bold text-manifest-ink shadow-sm active:scale-95 transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Nuevo desahogo</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation & Consent Dialog before burning */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl glass-card p-6 border border-manifest-glassBorder shadow-liquid text-center space-y-3.5"
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100/80 border border-amber-300/60 text-amber-700 flex items-center justify-center shadow-neu-sm">
                <Flame className="w-6 h-6" />
              </div>

              <h4 className="font-serif text-base font-bold text-manifest-ink">
                ¿Deseas soltar y consumir este contenido?
              </h4>

              <p className="text-xs text-manifest-inkLight leading-relaxed">
                Al confirmar, el ritual transmutará en fuego esta nota y se borrará definitivamente de la memoria de tu dispositivo.
              </p>

              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 rounded-xl glass-pill text-xs font-medium text-manifest-inkLight hover:text-manifest-ink hover:bg-white/5 cursor-pointer"
                >
                  Regresar a revisar
                </button>
                <button
                  onClick={startBurningRitual}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-700 to-rose-700 text-white text-xs font-bold shadow-md hover:from-amber-600 hover:to-rose-600 border border-amber-500/30 cursor-pointer"
                >
                  Consumir y soltar ✧
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Gentle Disclaimer Notice */}
      <div className="p-3.5 rounded-2xl glass-card border border-manifest-glassBorder flex items-center gap-2.5 text-[11px] text-manifest-inkMuted">
        <ShieldCheck className="w-4 h-4 text-manifest-auraPurple shrink-0" />
        <span>
          Este ritual es un ejercicio sagrado y personal de introspección. Tus palabras no viajan a ningún servidor ni red externa.
        </span>
      </div>
    </div>
  );
};
