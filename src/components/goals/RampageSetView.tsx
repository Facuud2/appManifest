'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  Edit3,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import { IOS_VIEW_SPRING, IOS_TAP_SPRING } from '@/lib/iosSprings';

export const RampageSetView: React.FC = () => {
  const {
    rampageSets,
    incrementRampageAffirmationRepeat,
    openRampageSetEditor,
    checkAndUnlockMilestones,
  } = useAppStore();

  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const [affirmationIndex, setAffirmationIndex] = useState(0);
  const [direction, setDirection] = useState<number>(1);
  const [dragOffsetX, setDragOffsetX] = useState<number>(0);

  const totalSets = rampageSets.length;
  const safeSetIndex = totalSets > 0 ? ((activeSetIndex % totalSets) + totalSets) % totalSets : 0;
  const currentSet = rampageSets[safeSetIndex];

  const totalAffirmationsInSet = currentSet?.affirmations?.length || 0;
  const safeAffirmationIndex =
    totalAffirmationsInSet > 0
      ? ((affirmationIndex % totalAffirmationsInSet) + totalAffirmationsInSet) % totalAffirmationsInSet
      : 0;
  const currentAffirmation = currentSet?.affirmations?.[safeAffirmationIndex];

  const handlePrevSet = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (totalSets <= 1) return;
    setDirection(-1);
    setActiveSetIndex((prev) => (prev - 1 + totalSets) % totalSets);
    setAffirmationIndex(0);
  };

  const handleNextSet = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (totalSets <= 1) return;
    setDirection(1);
    setActiveSetIndex((prev) => (prev + 1) % totalSets);
    setAffirmationIndex(0);
  };

  const advanceAffirmation = (dir = 1) => {
    if (!currentSet || totalAffirmationsInSet === 0 || !currentAffirmation) return;

    incrementRampageAffirmationRepeat(currentSet.id, currentAffirmation.id);
    checkAndUnlockMilestones({ suppressModal: true });

    setDirection(dir);
    setAffirmationIndex((prev) => (prev + dir + totalAffirmationsInSet) % totalAffirmationsInSet);
  };

  // @use-gesture/react: Rubber-banding horizontal drag + tap detection
  const bindCardGesture = useDrag(
    ({ down, movement: [mx], velocity: [vx], direction: [dx], tap }) => {
      if (tap) {
        setDragOffsetX(0);
        advanceAffirmation(1);
        return;
      }

      if (down) {
        // Elastic rubber-banding resistance
        setDragOffsetX(mx * 0.45);
      } else {
        setDragOffsetX(0);
        if (Math.abs(mx) > 48 || vx > 0.45) {
          const swipeDir = dx < 0 || mx < 0 ? 1 : -1;
          advanceAffirmation(swipeDir);
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

  if (!currentSet || totalSets === 0) {
    return (
      <div className="p-8 rounded-3xl liquid-glass-surface text-center space-y-3">
        <Sparkles className="w-8 h-8 text-manifest-auraPurple mx-auto" />
        <h4 className="font-serif text-base font-bold text-manifest-ink">
          Crea tu primer Set de Rampage
        </h4>
        <p className="text-xs text-manifest-inkMuted max-w-sm mx-auto">
          Un set de rampage es una secuencia rítmica de afirmaciones para repetir en bucle y elevar tu frecuencia.
        </p>
        <motion.button
          whileTap={IOS_TAP_SPRING}
          onClick={() => openRampageSetEditor(null)}
          className="px-4 py-2 rounded-xl primary-gradient-btn text-xs font-semibold cursor-pointer"
        >
          + Crear Set
        </motion.button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Set Navigation Bar */}
      <div className="p-3 sm:p-4 rounded-3xl liquid-glass-surface flex items-center justify-between gap-3">
        {/* Set Prev Arrow */}
        <motion.button
          type="button"
          whileTap={IOS_TAP_SPRING}
          onClick={handlePrevSet}
          disabled={totalSets <= 1}
          title="Set anterior"
          className="w-8 h-8 rounded-full flex items-center justify-center bg-white/80 hover:bg-white text-manifest-ink disabled:opacity-35 transition-colors shadow-sm cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </motion.button>

        {/* Set Title & Dynamic Set X de Y Indicator */}
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

        {/* Set Next Arrow */}
        <div className="flex items-center gap-1.5 shrink-0">
          <motion.button
            type="button"
            whileTap={IOS_TAP_SPRING}
            onClick={handleNextSet}
            disabled={totalSets <= 1}
            title="Set siguiente"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/80 hover:bg-white text-manifest-ink disabled:opacity-35 transition-colors shadow-sm cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Subheader: Progreso claro de Afirmaciones dentro del set */}
      <div className="flex items-center justify-between px-2 pt-0.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-manifest-ink">
            Afirmación {safeAffirmationIndex + 1} de {totalAffirmationsInSet}
          </span>
          {/* Dots de progreso dentro del set */}
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
        <motion.button
          type="button"
          whileTap={IOS_TAP_SPRING}
          onClick={() => openRampageSetEditor(currentSet)}
          className="flex items-center gap-1 text-[11px] font-semibold text-manifest-auraPurple hover:text-manifest-ink transition-colors cursor-pointer"
        >
          <Edit3 className="w-3 h-3" />
          <span>Editar Set</span>
        </motion.button>
      </div>

      {/* Protagonist Affirmation Card with Corner Quotation Marks & Apple Spring Physics */}
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

              {/* Sub-header inside card: Category & Independent Affirmation Counter */}
              <div className="relative z-10 flex items-center justify-between pb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-manifest-lavender/50 text-manifest-auraPurple border border-white">
                  AFIRMACIÓN #{safeAffirmationIndex + 1}
                </span>

                {/* Independent Affirmation Repeat Counter */}
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
    </div>
  );
};
