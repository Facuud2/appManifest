'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  Edit3,
  CheckCircle2,
  Loader2,
  Plus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import { IOS_VIEW_SPRING, IOS_TAP_SPRING, LIQUID_GLASS_SPECULAR } from '@/lib/iosSprings';
import { RampageAffirmation, RampageSet } from '@/types';
import { RampageConfigDrawer } from './RampageConfigDrawer';
import { RampageDecisionModal } from './RampageDecisionModal';
import { logAiTelemetry } from '@/lib/gemini';

export const RampageSetView: React.FC = () => {
  const {
    rampageSets,
    incrementRampageAffirmationRepeat,
    openRampageSetEditor,
    checkAndUnlockMilestones,
    activeScope,
    saveRampageSet,
    showToast,
    aiSandboxMode,
    isRampageConfigOpen,
    openRampageConfig,
    closeRampageConfig,
  } = useAppStore();

  // Manual Set State
  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const [affirmationIndex, setAffirmationIndex] = useState(0);
  const [direction, setDirection] = useState<number>(1);
  const [dragOffsetX, setDragOffsetX] = useState<number>(0);

  // Dynamic AI Rampage Session State
  const [isAiSession, setIsAiSession] = useState(false);
  const [aiTheme, setAiTheme] = useState('');
  const [aiSpecs, setAiSpecs] = useState('');
  const [aiAffirmations, setAiAffirmations] = useState<RampageAffirmation[]>([]);
  const [aiIndex, setAiIndex] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [batchCount, setBatchCount] = useState(1);
  const [isDecisionOpen, setIsDecisionOpen] = useState(false);

  const isFetchingBatchRef = useRef<boolean>(false);
  const batchCountRef = useRef<number>(1);
  const aiThemeRef = useRef<string>('');
  const aiSpecsRef = useRef<string>('');

  // Keep refs synchronized
  useEffect(() => {
    batchCountRef.current = batchCount;
  }, [batchCount]);

  useEffect(() => {
    aiThemeRef.current = aiTheme;
  }, [aiTheme]);

  useEffect(() => {
    aiSpecsRef.current = aiSpecs;
  }, [aiSpecs]);

  // Intercept navigation away if unconfirmed AI session is active
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isAiSession && aiAffirmations.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isAiSession, aiAffirmations.length]);

  // Request next batch of 3 affirmations in background
  const fetchNextBatch = useCallback(
    async (currentAffs: RampageAffirmation[]) => {
      if (isFetchingBatchRef.current) return;
      if (batchCountRef.current >= 10) return; // Safety limit: max 10 batches (30 affirmations)

      isFetchingBatchRef.current = true;

      try {
        const isSandbox =
          aiSandboxMode ||
          (typeof window !== 'undefined' && (window.navigator as any)?.webdriver === true);

        const lastTwoAffirmations = currentAffs.slice(-2).map((a) => a.text);

        const res = await fetch('/api/ai/rampage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(isSandbox ? { 'x-ai-sandbox': 'true' } : {}),
          },
          body: JSON.stringify({
            centralTheme: aiThemeRef.current,
            specifications: aiSpecsRef.current,
            previousAffirmations: lastTwoAffirmations,
            batchSize: 3,
            batchIndex: batchCountRef.current,
          }),
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        const incomingTexts: string[] = Array.isArray(data.affirmations)
          ? data.affirmations
          : [];

        if (incomingTexts.length > 0) {
          const newBatchItems: RampageAffirmation[] = incomingTexts.map((text, idx) => ({
            id: `ai-aff-${Date.now()}-${batchCountRef.current}-${idx}`,
            text,
            repeatCount: 0,
          }));

          setAiAffirmations((prev) => {
            const nextList = [...prev, ...newBatchItems];
            logAiTelemetry('/api/ai/rampage', data.source, data.totalTokens || 0, {
              batchNumber: batchCountRef.current + 1,
              addedCount: newBatchItems.length,
              totalNow: nextList.length,
            });
            return nextList;
          });

          setBatchCount((prev) => prev + 1);
        }
      } catch (err) {
        console.warn('[AI Rampage] Error prefetching next batch:', err);
      } finally {
        isFetchingBatchRef.current = false;
      }
    },
    [aiSandboxMode]
  );

  // Start a new AI Rampage Queue Session
  const handleStartAiSession = async (theme: string, specs: string) => {
    setIsAiSession(true);
    setAiTheme(theme);
    setAiSpecs(specs);
    setAiAffirmations([]);
    setAiIndex(0);
    setBatchCount(1);
    setIsInitialLoading(true);
    isFetchingBatchRef.current = false;
    batchCountRef.current = 1;

    try {
      const isSandbox =
        aiSandboxMode ||
        (typeof window !== 'undefined' && (window.navigator as any)?.webdriver === true);

      const res = await fetch('/api/ai/rampage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(isSandbox ? { 'x-ai-sandbox': 'true' } : {}),
        },
        body: JSON.stringify({
          centralTheme: theme,
          specifications: specs,
          previousAffirmations: [],
          batchSize: 3,
          batchIndex: 0,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      logAiTelemetry('/api/ai/rampage', data.source, data.totalTokens || 0, {
        batchNumber: 1,
        initialBatchSize: data.affirmations?.length || 0,
      });

      const initialAffs: RampageAffirmation[] = (data.affirmations || []).map(
        (text: string, idx: number) => ({
          id: `ai-aff-${Date.now()}-0-${idx}`,
          text,
          repeatCount: 0,
        })
      );

      setAiAffirmations(initialAffs);
    } catch (err) {
      console.error('[AI Rampage] Error starting session:', err);
      showToast('Error al conectar con IA. Usando modo de contingencia.', 'info');
      // Contingency affirmations
      setAiAffirmations([
        {
          id: `ai-aff-${Date.now()}-0`,
          text: `Mi mente y mi corazón vibran en perfecta armonía con ${theme}.`,
          repeatCount: 0,
        },
        {
          id: `ai-aff-${Date.now()}-1`,
          text: `Permito que la energía de ${theme} fluya libre y poderosamente en mi vida.`,
          repeatCount: 0,
        },
        {
          id: `ai-aff-${Date.now()}-2`,
          text: `Agradezco con certeza que ${theme} ya se manifiesta en mi realidad presente.`,
          repeatCount: 0,
        },
      ]);
    } finally {
      setIsInitialLoading(false);
    }
  };

  // Advance affirmation in AI Session
  const advanceAiAffirmation = (dir = 1) => {
    if (aiAffirmations.length === 0) return;

    // 1. Increment repeat count for current affirmation
    setAiAffirmations((prev) => {
      const copy = [...prev];
      if (copy[aiIndex]) {
        copy[aiIndex] = {
          ...copy[aiIndex],
          repeatCount: (copy[aiIndex].repeatCount || 0) + 1,
        };
      }
      return copy;
    });

    checkAndUnlockMilestones({ suppressModal: true });
    setDirection(dir);

    const totalNow = aiAffirmations.length;
    const nextIndex = (aiIndex + dir + totalNow) % totalNow;
    setAiIndex(nextIndex);

    // 2. Pre-fetching Rule: Penultimate affirmation trigger (e.g. index 1 of 3, index 4 of 6)
    if (nextIndex === totalNow - 2) {
      fetchNextBatch(aiAffirmations);
    }
  };

  // Manual Set Navigation
  const totalSets = rampageSets.length;
  const safeSetIndex = totalSets > 0 ? ((activeSetIndex % totalSets) + totalSets) % totalSets : 0;
  const currentSet = rampageSets[safeSetIndex];

  const totalAffirmationsInSet = currentSet?.affirmations?.length || 0;
  const safeAffirmationIndex =
    totalAffirmationsInSet > 0
      ? ((affirmationIndex % totalAffirmationsInSet) + totalAffirmationsInSet) % totalAffirmationsInSet
      : 0;
  const currentAffirmation = currentSet?.affirmations?.[safeAffirmationIndex];

  const advanceManualAffirmation = (dir = 1) => {
    if (!currentSet || totalAffirmationsInSet === 0 || !currentAffirmation) return;
    incrementRampageAffirmationRepeat(currentSet.id, currentAffirmation.id);
    checkAndUnlockMilestones({ suppressModal: true });
    setDirection(dir);
    setAffirmationIndex((prev) => (prev + dir + totalAffirmationsInSet) % totalAffirmationsInSet);
  };

  // Save AI Session
  const handleSaveAiSession = () => {
    if (!aiTheme.trim() || aiAffirmations.length === 0) return;

    const author =
      activeScope === 'facu' ? 'Facu' : activeScope === 'maia' ? 'Maia' : 'Juntos';

    const newSet: RampageSet = {
      id: `rampage-${Date.now()}`,
      title: aiTheme.trim(),
      userId: activeScope,
      author,
      affirmations: aiAffirmations,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveRampageSet(newSet);
    showToast('Set guardado en tu Santuario ✨', 'success');

    setIsAiSession(false);
    setIsDecisionOpen(false);
    setAiAffirmations([]);
    setActiveSetIndex(rampageSets.length); // point to new set
    setAffirmationIndex(0);
  };

  // Discard AI Session
  const handleDiscardAiSession = () => {
    setIsAiSession(false);
    setIsDecisionOpen(false);
    setAiAffirmations([]);
    setAiIndex(0);
    showToast('Rampage descartado limpiamente 🗑️', 'gentle');
  };

  // Gesture handling
  const bindCardGesture = useDrag(
    ({ down, movement: [mx], velocity: [vx], direction: [dx], tap }) => {
      if (tap) {
        setDragOffsetX(0);
        if (isAiSession) {
          advanceAiAffirmation(1);
        } else {
          advanceManualAffirmation(1);
        }
        return;
      }

      if (down) {
        setDragOffsetX(mx * 0.45);
      } else {
        setDragOffsetX(0);
        if (Math.abs(mx) > 48 || vx > 0.45) {
          const swipeDir = dx < 0 || mx < 0 ? 1 : -1;
          if (isAiSession) {
            advanceAiAffirmation(swipeDir);
          } else {
            advanceManualAffirmation(swipeDir);
          }
        }
      }
    },
    {
      axis: 'x',
      filterTaps: true,
      rubberband: true,
    }
  );

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 110 : -110,
      opacity: 0,
      scale: 0.94,
    }),
    center: {
      x: dragOffsetX,
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', stiffness: 380, damping: 32 },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -110 : 110,
      opacity: 0,
      scale: 0.94,
      transition: { type: 'spring', stiffness: 380, damping: 32 },
    }),
  };

  // ========================================================
  // RENDER CASE 1: AI RAMPAGE SLIDING QUEUE SESSION
  // ========================================================
  if (isAiSession) {
    const currentAiAff = aiAffirmations[aiIndex];
    const totalAiNow = aiAffirmations.length;
    const totalAiRepeats = aiAffirmations.reduce(
      (sum, a) => sum + (a.repeatCount || 0),
      0
    );

    return (
      <div className="space-y-4">
        {/* AI Session Header Banner */}
        <div className="p-3 sm:p-4 rounded-3xl liquid-glass-surface flex items-center justify-between gap-3 border border-manifest-auraPurple/30">
          <div className="flex-1 min-w-0 px-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5">
              <span className="w-2 h-2 rounded-full bg-manifest-auraPurple animate-pulse shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-manifest-auraPurple">
                Rampage con IA en vivo • Lote {batchCount}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-serif font-bold text-manifest-ink truncate mt-0.5">
              “{aiTheme}”
            </h3>
            <p className="text-[11px] text-manifest-inkMuted mt-0.5">
              Cola dinámica de {totalAiNow} afirmaciones generadas
            </p>
          </div>

          {/* Prominent "Finalizar Rampage" Button */}
          <motion.button
            type="button"
            whileTap={IOS_TAP_SPRING}
            onClick={() => setIsDecisionOpen(true)}
            data-testid="finish-rampage-btn"
            className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-2xl primary-gradient-btn text-xs font-semibold shadow-sm cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Finalizar Rampage</span>
          </motion.button>
        </div>

        {/* Subheader: Progreso en tiempo real */}
        <div className="flex items-center justify-between px-2 pt-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-manifest-ink">
              Afirmación {totalAiNow > 0 ? aiIndex + 1 : 0} de {totalAiNow}
            </span>
            {/* Dots */}
            <div className="flex items-center gap-1 max-w-[140px] overflow-hidden">
              {aiAffirmations.map((_, dotIdx) => (
                <span
                  key={dotIdx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    dotIdx === aiIndex
                      ? 'w-4 bg-manifest-auraPurple'
                      : 'w-1.5 bg-manifest-ink/20'
                  }`}
                />
              ))}
            </div>
          </div>

          {isFetchingBatchRef.current && (
            <div className="flex items-center gap-1 text-[11px] text-manifest-auraPurple animate-pulse font-medium">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Preparando lote siguiente...</span>
            </div>
          )}
        </div>

        {/* Protagonist Card / Liquid Skeleton */}
        <div className="relative overflow-hidden contain-layout w-full min-h-[220px] sm:min-h-[250px] flex items-center justify-center">
          {isInitialLoading ? (
            /* Liquid Glass Skeleton with Quotation Marks */
            <div className="w-full relative p-6 sm:p-9 rounded-3xl sm:rounded-[2rem] liquid-glass-surface shadow-liquid flex flex-col justify-between min-h-[220px] sm:min-h-[250px] animate-pulse">
              <span
                aria-hidden="true"
                className="absolute top-3.5 left-4 font-serif text-3xl sm:text-4xl text-manifest-ink/10 select-none"
              >
                “
              </span>
              <span
                aria-hidden="true"
                className="absolute bottom-3.5 right-4 font-serif text-3xl sm:text-4xl text-manifest-ink/10 select-none"
              >
                ”
              </span>
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 bg-manifest-lavender/60 rounded-full" />
                <div className="h-5 w-12 bg-manifest-lavender/60 rounded-full" />
              </div>
              <div className="my-auto py-5 space-y-2.5 text-center flex flex-col items-center">
                <div className="h-5 w-4/5 bg-manifest-lavender/80 rounded-lg" />
                <div className="h-5 w-3/5 bg-manifest-lavender/60 rounded-lg" />
                <span className="text-[11px] text-manifest-auraPurple font-medium pt-2 flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sintonizando frecuencias del Rampage...</span>
                </span>
              </div>
              <div className="h-3 w-40 bg-manifest-lavender/40 rounded-full mx-auto" />
            </div>
          ) : (
            <AnimatePresence mode="popLayout" custom={direction}>
              {currentAiAff && (
                <motion.div
                  key={`ai-card-${currentAiAff.id}-${aiIndex}`}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  whileTap={IOS_TAP_SPRING}
                  {...(bindCardGesture() as any)}
                  data-testid="rampage-next-btn"
                  className="w-full relative p-6 sm:p-9 rounded-3xl sm:rounded-[2rem] liquid-glass-surface shadow-liquid cursor-pointer select-none flex flex-col justify-between min-h-[220px] sm:min-h-[250px] touch-pan-y"
                >
                  {/* Corner Decorative Quotation Marks (4 corners) */}
                  <span
                    aria-hidden="true"
                    className="absolute top-3.5 left-4 font-serif text-3xl sm:text-4xl text-manifest-ink/20 select-none pointer-events-none leading-none"
                  >
                    “
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute top-3.5 right-4 font-serif text-3xl sm:text-4xl text-manifest-ink/20 select-none pointer-events-none leading-none rotate-180"
                  >
                    “
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute bottom-3.5 left-4 font-serif text-3xl sm:text-4xl text-manifest-ink/20 select-none pointer-events-none leading-none rotate-180"
                  >
                    ”
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute bottom-3.5 right-4 font-serif text-3xl sm:text-4xl text-manifest-ink/20 select-none pointer-events-none leading-none"
                  >
                    ”
                  </span>

                  {/* Sub-header inside card */}
                  <div className="relative z-10 flex items-center justify-between pb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-manifest-lavender/50 text-manifest-auraPurple border border-white">
                      AFIRMACIÓN #{aiIndex + 1}
                    </span>

                    <div
                      title="Contador independiente de repeticiones"
                      className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/85 border border-white shadow-sm"
                    >
                      <Flame
                        className={`w-3.5 h-3.5 ${
                          (currentAiAff.repeatCount || 0) > 0
                            ? 'text-amber-500 fill-amber-400'
                            : 'text-manifest-inkMuted'
                        }`}
                      />
                      <span
                        data-testid="rampage-repeat-counter"
                        className="text-xs font-bold text-manifest-ink"
                      >
                        {currentAiAff.repeatCount || 0}
                      </span>
                    </div>
                  </div>

                  {/* Protagonist Affirmation Text */}
                  <div className="relative z-10 my-auto py-5 text-center px-4 sm:px-6">
                    <p className="text-base sm:text-xl md:text-2xl font-serif font-bold text-manifest-ink leading-relaxed tracking-tight">
                      {currentAiAff.text}
                    </p>
                  </div>

                  {/* Bottom Tactile Affordance Hint */}
                  <div className="relative z-10 flex items-center justify-center pt-2">
                    <span className="text-[10px] font-medium text-manifest-inkMuted/70 flex items-center gap-1">
                      <span>Toca la tarjeta para repetir y avanzar</span>
                      <span>→</span>
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Rampage Decision Modal */}
        <RampageDecisionModal
          isOpen={isDecisionOpen}
          title={aiTheme}
          totalAffirmations={totalAiNow}
          totalRepeats={totalAiRepeats}
          onSave={handleSaveAiSession}
          onDiscard={handleDiscardAiSession}
          onClose={() => setIsDecisionOpen(false)}
        />
      </div>
    );
  }

  // ========================================================
  // RENDER CASE 2: EMPTY STATE (NO SETS YET)
  // ========================================================
  if (!currentSet || totalSets === 0) {
    return (
      <div className="p-8 rounded-3xl liquid-glass-surface text-center space-y-3">
        <Sparkles className="w-8 h-8 text-manifest-auraPurple mx-auto" />
        <h4 className="font-serif text-base font-bold text-manifest-ink">
          Crea tu primer Set de Rampage
        </h4>
        <p className="text-xs text-manifest-inkMuted max-w-sm mx-auto">
          Un set de rampage es una secuencia rítmica de afirmaciones para repetir en bucle y elevar tu frecuencia vibracional.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <motion.button
            whileTap={IOS_TAP_SPRING}
            onClick={openRampageConfig}
            data-testid="open-rampage-modal-btn"
            className="px-5 py-2.5 rounded-xl primary-gradient-btn text-xs font-semibold cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Iniciar Rampage con IA</span>
          </motion.button>
          <button
            type="button"
            onClick={() => openRampageSetEditor(null)}
            className="px-4 py-2 rounded-xl text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink hover:bg-white/80 transition-colors"
          >
            O crear manualmente
          </button>
        </div>

        {/* Rampage Config Drawer */}
        <RampageConfigDrawer
          isOpen={isRampageConfigOpen}
          onClose={closeRampageConfig}
          onStartSession={handleStartAiSession}
          onOpenManualEditor={() => openRampageSetEditor(null)}
        />
      </div>
    );
  }

  // ========================================================
  // RENDER CASE 3: STANDARD MANUAL RAMPAGE SETS VIEW
  // ========================================================
  return (
    <div className="space-y-4">
      {/* Set Navigation Bar */}
      <div className="p-3 sm:p-4 rounded-3xl liquid-glass-surface flex items-center justify-between gap-3">
        <motion.button
          type="button"
          whileTap={IOS_TAP_SPRING}
          onClick={(e) => {
            e.stopPropagation();
            if (totalSets <= 1) return;
            setDirection(-1);
            setActiveSetIndex((prev) => (prev - 1 + totalSets) % totalSets);
            setAffirmationIndex(0);
          }}
          disabled={totalSets <= 1}
          title="Set anterior"
          className="w-8 h-8 rounded-full flex items-center justify-center bg-white/80 hover:bg-white text-manifest-ink disabled:opacity-35 transition-colors shadow-sm cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </motion.button>

        <div className="flex-1 text-center min-w-0 px-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-manifest-auraPurple block">
            Set {safeSetIndex + 1} de {totalSets}
          </span>
          <h3 className="text-sm sm:text-base font-serif font-bold text-manifest-ink truncate mt-0.5">
            “{currentSet.title}”
          </h3>
          <p className="text-[11px] text-manifest-inkMuted mt-0.5">
            Secuencia de {totalAffirmationsInSet} afirmaciones
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <motion.button
            type="button"
            whileTap={IOS_TAP_SPRING}
            onClick={(e) => {
              e.stopPropagation();
              if (totalSets <= 1) return;
              setDirection(1);
              setActiveSetIndex((prev) => (prev + 1) % totalSets);
              setAffirmationIndex(0);
            }}
            disabled={totalSets <= 1}
            title="Set siguiente"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/80 hover:bg-white text-manifest-ink disabled:opacity-35 transition-colors shadow-sm cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Subheader */}
      <div className="flex items-center justify-between px-2 pt-0.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-manifest-ink">
            Afirmación {safeAffirmationIndex + 1} de {totalAffirmationsInSet}
          </span>
          <div className="flex items-center gap-1">
            {currentSet.affirmations.map((_, dotIdx) => (
              <span
                key={dotIdx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  dotIdx === safeAffirmationIndex
                    ? 'w-4 bg-manifest-auraPurple'
                    : 'w-1.5 bg-manifest-ink/20'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            whileTap={IOS_TAP_SPRING}
            onClick={openRampageConfig}
            className="flex items-center gap-1 text-[11px] font-semibold text-manifest-auraPurple hover:text-manifest-ink transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>Rampage IA</span>
          </motion.button>

          <span className="text-manifest-ink/20">•</span>

          <motion.button
            type="button"
            whileTap={IOS_TAP_SPRING}
            onClick={() => openRampageSetEditor(currentSet)}
            className="flex items-center gap-1 text-[11px] font-semibold text-manifest-inkMuted hover:text-manifest-ink transition-colors cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            <span>Editar</span>
          </motion.button>
        </div>
      </div>

      {/* Protagonist Affirmation Card */}
      <div className="relative overflow-hidden contain-layout w-full min-h-[220px] sm:min-h-[250px] flex items-center justify-center">
        <AnimatePresence mode="popLayout" custom={direction}>
          {currentAffirmation && (
            <motion.div
              key={`${currentSet.id}-${currentAffirmation.id}-${safeAffirmationIndex}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              whileTap={IOS_TAP_SPRING}
              {...(bindCardGesture() as any)}
              data-testid="rampage-next-btn"
              className="w-full relative p-6 sm:p-9 rounded-3xl sm:rounded-[2rem] liquid-glass-surface shadow-liquid cursor-pointer select-none flex flex-col justify-between min-h-[220px] sm:min-h-[250px] touch-pan-y"
            >
              {/* Corner Decorative Quotation Marks (4 corners) */}
              <span
                aria-hidden="true"
                className="absolute top-3.5 left-4 font-serif text-3xl sm:text-4xl text-manifest-ink/20 select-none pointer-events-none leading-none"
              >
                “
              </span>
              <span
                aria-hidden="true"
                className="absolute top-3.5 right-4 font-serif text-3xl sm:text-4xl text-manifest-ink/20 select-none pointer-events-none leading-none rotate-180"
              >
                “
              </span>
              <span
                aria-hidden="true"
                className="absolute bottom-3.5 left-4 font-serif text-3xl sm:text-4xl text-manifest-ink/20 select-none pointer-events-none leading-none rotate-180"
              >
                ”
              </span>
              <span
                aria-hidden="true"
                className="absolute bottom-3.5 right-4 font-serif text-3xl sm:text-4xl text-manifest-ink/20 select-none pointer-events-none leading-none"
              >
                ”
              </span>

              {/* Sub-header inside card */}
              <div className="relative z-10 flex items-center justify-between pb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-manifest-lavender/50 text-manifest-auraPurple border border-white">
                  AFIRMACIÓN #{safeAffirmationIndex + 1}
                </span>

                <div
                  title="Contador independiente de esta afirmación"
                  className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/85 border border-white shadow-sm"
                >
                  <Flame
                    className={`w-3.5 h-3.5 ${
                      (currentAffirmation.repeatCount || 0) > 0
                        ? 'text-amber-500 fill-amber-400'
                        : 'text-manifest-inkMuted'
                    }`}
                  />
                  <span
                    data-testid="rampage-repeat-counter"
                    className="text-xs font-bold text-manifest-ink"
                  >
                    {currentAffirmation.repeatCount || 0}
                  </span>
                </div>
              </div>

              {/* Affirmation Text Protagonist */}
              <div className="relative z-10 my-auto py-5 text-center px-4 sm:px-6">
                <p className="text-base sm:text-xl md:text-2xl font-serif font-bold text-manifest-ink leading-relaxed tracking-tight">
                  {currentAffirmation.text}
                </p>
              </div>

              {/* Bottom Tactile Affordance Hint */}
              <div className="relative z-10 flex items-center justify-center pt-2">
                <span className="text-[10px] font-medium text-manifest-inkMuted/70 flex items-center gap-1">
                  <span>Toca la tarjeta o desliza para avanzar</span>
                  <span>→</span>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rampage Config Drawer */}
      <RampageConfigDrawer
        isOpen={isRampageConfigOpen}
        onClose={closeRampageConfig}
        onStartSession={handleStartAiSession}
        onOpenManualEditor={() => openRampageSetEditor(null)}
      />
    </div>
  );
};
