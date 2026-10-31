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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type RitualStage = 'write' | 'reflect' | 'burning' | 'released';

export const ReleaseRitual: React.FC = () => {
  const { destroyRelease, settings } = useAppStore();

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
            {/* Digital Parchment */}
            <div className="relative rounded-3xl p-6 bg-gradient-to-b from-[#FFFDF9] via-[#FAF4EA] to-[#F7EDE0] border border-amber-100/80 shadow-liquid text-manifest-ink overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-amber-900/10">
                <span className="text-[11px] font-serif italic text-amber-900/70 flex items-center gap-1.5">
                  <Feather className="w-3.5 h-3.5 text-amber-700" />
                  Hoja de desahogo y verdad
                </span>
                <span className="text-[10px] text-amber-800/60 uppercase tracking-widest">
                  Paso 1 de 3
                </span>
              </div>

              <textarea
                rows={6}
                value={fearContent}
                onChange={(e) => setFearContent(e.target.value)}
                placeholder="Escribe aquí ese pensamiento limitante, esa duda, ese miedo o esa situación que sientes que pesa en tu pecho... Nadie más leerá esto."
                className="w-full mt-3 bg-transparent border-none focus:outline-none text-xs md:text-sm leading-relaxed text-amber-950 placeholder:text-amber-900/40 resize-none font-serif"
              />

              <div className="pt-2 text-[10px] text-amber-800/60 text-right italic">
                {fearContent.length > 0 ? `${fearContent.length} caracteres volcados` : 'Escribe con total sinceridad'}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStage('reflect')}
                disabled={!fearContent.trim()}
                className="flex-1 py-3 px-4 rounded-2xl primary-gradient-btn text-xs font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
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
            <div className="p-5 rounded-3xl glass-card border border-white/95 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/70">
                <span className="text-xs font-serif font-bold text-manifest-ink flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-manifest-auraPurple" />
                  Reconocer para soltar (Opcional)
                </span>
                <span className="text-[10px] text-manifest-inkMuted uppercase tracking-widest">
                  Paso 2 de 3
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-manifest-inkMuted font-medium block mb-1">
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
                  <label className="text-manifest-inkMuted font-medium block mb-1">
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
                  <label className="text-manifest-inkMuted font-medium block mb-1">
                    3. ¿Qué elijo creer y sentir a partir de este instante?
                  </label>
                  <input
                    type="text"
                    value={chooseNow}
                    onChange={(e) => setChooseNow(e.target.value)}
                    placeholder="Elijo la confianza, la liviandad, el amor..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStage('write')}
                className="py-3 px-4 rounded-2xl glass-pill text-xs font-medium text-manifest-ink"
              >
                Atrás
              </button>
              <button
                onClick={() => setShowConfirmModal(true)}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-300 via-amber-300 to-manifest-lavender text-manifest-ink text-xs font-bold shadow-liquid flex items-center justify-center gap-2"
              >
                <Flame className="w-4 h-4 fill-amber-600 text-amber-700" />
                <span>Proceder al Ritual de Liberación</span>
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
            className="py-12 px-6 rounded-3xl glass-card border border-white/90 text-center relative overflow-hidden"
          >
            {/* Luminous burning particles */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <motion.div
                className="w-48 h-48 rounded-full bg-gradient-to-tr from-amber-300/40 via-rose-300/40 to-manifest-lavender/40 blur-3xl"
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
              className="p-6 rounded-2xl bg-[#FAF4EA] border border-amber-200/50 shadow-inner max-w-xs mx-auto"
            >
              <p className="font-serif italic text-xs text-amber-950 line-clamp-3">
                «{fearContent}»
              </p>
            </motion.div>

            {/* Sparkles rising */}
            <div className="mt-8 space-y-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 mx-auto text-amber-500"
              >
                <Sparkles className="w-8 h-8" />
              </motion.div>
              <p className="font-serif text-sm font-semibold text-manifest-ink">
                Transformando la carga en luz y espacio fértil...
              </p>
              <p className="text-[11px] text-manifest-inkMuted italic">
                El peso se desvanece de tu templo interior.
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
            className="p-8 rounded-3xl glass-card border border-white/95 shadow-liquid text-center space-y-4"
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
              <Wind className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-manifest-ink">
                Liberado y devuelto a la paz
              </h3>
              <p className="text-xs text-manifest-inkMuted max-w-xs mx-auto leading-relaxed">
                El contenido fue destruido por completo de este dispositivo. Ahora existe nuevo espacio en tu corazón para lo que sí deseas cosechar.
              </p>
            </div>

            {chooseNow && (
              <div className="p-3.5 rounded-2xl bg-manifest-mint/40 border border-white text-xs text-manifest-ink font-medium italic">
                «{chooseNow}»
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={resetRitual}
                className="px-6 py-2.5 rounded-2xl primary-gradient-btn text-xs font-semibold inline-flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Cerrar y volver ligero
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation & Consent Dialog before burning */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-manifest-ink/35 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl glass-card p-6 border border-white/95 text-center space-y-3.5"
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Flame className="w-6 h-6" />
              </div>

              <h4 className="font-serif text-base font-bold text-manifest-ink">
                ¿Deseas soltar y destruir este contenido?
              </h4>

              <p className="text-xs text-manifest-inkMuted leading-relaxed">
                Al confirmar, el ritual quemará simbólicamente esta nota y se borrará definitivamente de la memoria de tu dispositivo.
              </p>

              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 rounded-xl glass-pill text-xs font-medium text-manifest-ink"
                >
                  Regresar a revisar
                </button>
                <button
                  onClick={startBurningRitual}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-bold shadow-md hover:from-amber-600 hover:to-rose-600"
                >
                  Liberar y dejar ir ✨
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Gentle Disclaimer Notice */}
      <div className="p-3.5 rounded-2xl bg-white/40 border border-white/60 flex items-center gap-2.5 text-[11px] text-manifest-inkMuted">
        <ShieldCheck className="w-4 h-4 text-manifest-auraPurple shrink-0" />
        <span>
          Este ritual es un ejercicio simbólico y personal de introspección. Tus palabras no viajan a ningún servidor ni red externa.
        </span>
      </div>
    </div>
  );
};
