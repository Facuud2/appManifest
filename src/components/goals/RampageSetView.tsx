'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  Plus,
  Edit3,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RampageSetEditorModal } from '@/components/goals/RampageSetEditorModal';
import { RampageSet } from '@/types';

export const RampageSetView: React.FC = () => {
  const {
    rampageSets,
    incrementRampageAffirmationRepeat,
  } = useAppStore();

  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const [affirmationIndex, setAffirmationIndex] = useState(0);
  const [direction, setDirection] = useState<number>(1);

  // Modal create/edit set
  const [isSetEditorOpen, setIsSetEditorOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<RampageSet | null>(null);

  const totalSets = rampageSets.length;
  // Ensure valid set index
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

  const handleCardTap = () => {
    if (!currentSet || totalAffirmationsInSet === 0 || !currentAffirmation) return;

    // 1. Increment independent affirmation counter (+1)
    incrementRampageAffirmationRepeat(currentSet.id, currentAffirmation.id);

    // 2. Set direction forward
    setDirection(1);

    // 3. Advance to next affirmation in continuous infinite loop
    setAffirmationIndex((prev) => (prev + 1) % totalAffirmationsInSet);
  };

  const handleOpenEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentSet) return;
    setEditingSet(currentSet);
    setIsSetEditorOpen(true);
  };

  const handleOpenNew = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSet(null);
    setIsSetEditorOpen(true);
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 50 : -50,
      opacity: 0,
      scale: 0.97,
      filter: 'blur(3px)',
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        type: 'spring' as const,
        stiffness: 380,
        damping: 32,
        mass: 0.8,
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -50 : 50,
      opacity: 0,
      scale: 0.97,
      filter: 'blur(3px)',
      transition: {
        type: 'spring' as const,
        stiffness: 380,
        damping: 32,
        mass: 0.8,
      },
    }),
  };

  if (!currentSet || totalSets === 0) {
    return (
      <div className="p-8 rounded-3xl glass-card text-center space-y-3 border border-white/90">
        <Sparkles className="w-8 h-8 text-manifest-auraPurple mx-auto" />
        <h4 className="font-serif text-base font-bold text-manifest-ink">
          Crea tu primer Set de Rampage
        </h4>
        <p className="text-xs text-manifest-inkMuted max-w-sm mx-auto">
          Un set de rampage es una secuencia rítmica de afirmaciones para repetir en bucle continuo y elevar tu frecuencia.
        </p>
        <button
          onClick={handleOpenNew}
          className="px-4 py-2 rounded-xl primary-gradient-btn text-xs font-semibold"
        >
          + Crear Set
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Set Navigation Bar */}
      <div className="p-3 sm:p-4 rounded-3xl glass-card border border-white/90 shadow-sm flex items-center justify-between gap-3">
        {/* Set Prev Arrow */}
        <button
          type="button"
          onClick={handlePrevSet}
          disabled={totalSets <= 1}
          title="Set anterior"
          className="w-8 h-8 rounded-full flex items-center justify-center bg-white/80 hover:bg-white text-manifest-ink disabled:opacity-35 transition-all shadow-sm active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Set Title & Dynamic 1/X Indicator */}
        <div className="flex-1 text-center min-w-0 px-2">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-sm sm:text-base font-serif font-bold text-manifest-ink truncate">
              {currentSet.title}
            </h3>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-manifest-lavender/60 text-manifest-auraPurple shrink-0">
              {safeSetIndex + 1}/{totalSets}
            </span>
          </div>
          <p className="text-[11px] text-manifest-inkMuted mt-0.5">
            {totalAffirmationsInSet} afirmaciones en secuencia infinita
          </p>
        </div>

        {/* Set Next Arrow */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleNextSet}
            disabled={totalSets <= 1}
            title="Set siguiente"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/80 hover:bg-white text-manifest-ink disabled:opacity-35 transition-all shadow-sm active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action shortcuts: Edit Set / New Set */}
      <div className="flex items-center justify-between px-2">
        <div className="text-[11px] font-semibold text-manifest-inkMuted flex items-center gap-1">
          <span>Afirmación {safeAffirmationIndex + 1} de {totalAffirmationsInSet}</span>
          <span className="text-manifest-auraPurple">• Bucle continuo</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenEdit}
            className="flex items-center gap-1 text-[11px] font-semibold text-manifest-inkMuted hover:text-manifest-ink transition-colors"
          >
            <Edit3 className="w-3 h-3" />
            <span>Editar Set</span>
          </button>
          <button
            type="button"
            onClick={handleOpenNew}
            className="flex items-center gap-1 text-[11px] font-semibold text-manifest-auraPurple hover:underline"
          >
            <Plus className="w-3 h-3" />
            <span>Nuevo Set</span>
          </button>
        </div>
      </div>

      {/* Protagonist Affirmation Card with Corner Quotation Marks & Apple Physics */}
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
              onClick={handleCardTap}
              className="w-full relative p-6 sm:p-9 rounded-3xl sm:rounded-[2rem] glass-card border border-white shadow-liquid cursor-pointer select-none transition-shadow hover:shadow-xl active:scale-[0.985] flex flex-col justify-between min-h-[220px] sm:min-h-[250px]"
            >
              {/* Corner Decorative Quotation Marks (4 corners) */}
              {/* Top-Left */}
              <span
                aria-hidden="true"
                className="absolute top-3.5 left-4 font-serif text-3xl sm:text-4xl text-manifest-ink/20 select-none pointer-events-none leading-none"
              >
                “
              </span>
              {/* Top-Right */}
              <span
                aria-hidden="true"
                className="absolute top-3.5 right-4 font-serif text-3xl sm:text-4xl text-manifest-ink/20 select-none pointer-events-none leading-none rotate-180"
              >
                “
              </span>
              {/* Bottom-Left */}
              <span
                aria-hidden="true"
                className="absolute bottom-3.5 left-4 font-serif text-3xl sm:text-4xl text-manifest-ink/20 select-none pointer-events-none leading-none rotate-180"
              >
                ”
              </span>
              {/* Bottom-Right */}
              <span
                aria-hidden="true"
                className="absolute bottom-3.5 right-4 font-serif text-3xl sm:text-4xl text-manifest-ink/20 select-none pointer-events-none leading-none"
              >
                ”
              </span>

              {/* Sub-header inside card: Category & Independent Affirmation Counter */}
              <div className="relative z-10 flex items-center justify-between pb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-manifest-lavender/50 text-manifest-auraPurple border border-white">
                  Rampage #{safeAffirmationIndex + 1}
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
                  <span className="text-xs font-bold font-mono text-manifest-ink">
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rampage Set Create/Edit Modal */}
      <RampageSetEditorModal
        isOpen={isSetEditorOpen}
        onClose={() => setIsSetEditorOpen(false)}
        setOrNull={editingSet}
      />
    </div>
  );
};
