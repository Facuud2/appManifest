'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import {
  Sparkles,
  PenLine,
  ArrowRight,
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  RotateCcw,
  X,
  Target,
  Trophy,
  Flame,
  Play,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Affirmation, JournalEntry, RampageSet } from '@/types';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { IOS_TAP_SPRING, IOS_LAYOUT_SPRING } from '@/lib/iosSprings';
import { JournalEntryDetailModal } from '@/components/journal/JournalEntryDetailModal';
import { LiquidEmptyState } from '@/components/ui/LiquidEmptyState';
import { SmoothSizeContainer } from '@/components/ui/SmoothSizeContainer';

export const DashboardView: React.FC = () => {
  const {
    activeScope,
    setActiveTab,
    openJournalEditor,
    openAffirmationEditor,
    journalEntries,
    deleteJournalEntry,
    affirmations,
    deleteAffirmation,
    saveAffirmation,
    rampageSets,
    openRampageSetEditor,
    openRampageConfig,
    incrementRampageAffirmationRepeat,
    navigateToGoals,
    setGoalsViewMode,
  } = useAppStore();

  const [selectedJournalEntryForView, setSelectedJournalEntryForView] = useState<JournalEntry | null>(null);
  const [journalEntryToDelete, setJournalEntryToDelete] = useState<JournalEntry | null>(null);
  const [affirmationToDelete, setAffirmationToDelete] = useState<Affirmation | null>(null);
  const [recentlyDeletedAffirmation, setRecentlyDeletedAffirmation] = useState<Affirmation | null>(null);
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  // Dynamic Focus Mode: 'robotic' (conventional affirmations) vs 'rampage' (active sets)
  const [focusMode, setFocusMode] = useState<'robotic' | 'rampage'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('manifest_dashboard_focus_mode');
      if (saved === 'rampage' || saved === 'robotic') return saved;
    }
    return 'robotic';
  });

  const handleSetFocusMode = (mode: 'robotic' | 'rampage') => {
    setFocusMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('manifest_dashboard_focus_mode', mode);
    }
  };

  // Rampage active state
  const [activeRampageSetIndex, setActiveRampageSetIndex] = useState(0);
  const [rampageAffirmationIndex, setRampageAffirmationIndex] = useState(0);

  // Time-based greeting with iOS spring animation
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Buenos días' : currentHour < 20 ? 'Buenas tardes' : 'Buenas noches';
  const displayName = activeScope === 'facu' ? 'Facu' : activeScope === 'maia' ? 'Maia' : 'Chicos';

  // Auto-clear recently deleted undo after 7 seconds
  useEffect(() => {
    if (recentlyDeletedAffirmation) {
      const timer = setTimeout(() => {
        setRecentlyDeletedAffirmation(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [recentlyDeletedAffirmation]);

  // Helper to accurately extract timestamp from createdAt, ID, or fallback
  const getAffirmationTime = (aff: Affirmation): number => {
    if (aff.createdAt) {
      const parsed = new Date(aff.createdAt).getTime();
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    if (aff.id) {
      const match = aff.id.match(/^aff-(\d+)/);
      if (match && match[1]) {
        const idTime = parseInt(match[1], 10);
        if (!isNaN(idTime) && idTime > 0) return idTime;
      }
    }
    if (typeof aff.order === 'number') {
      return aff.order;
    }
    return 0;
  };

  const pinnedAffirmations = affirmations.filter((a) => a.pinned);
  const displayAffirmations = affirmations.length > 0 ? (pinnedAffirmations.length > 0 ? pinnedAffirmations : affirmations) : [];
  const spotlightAffirmation = displayAffirmations.length > 0 ? displayAffirmations[spotlightIndex % displayAffirmations.length] : null;

  const latestTwoAffirmations = [...affirmations]
    .sort((a, b) => getAffirmationTime(b) - getAffirmationTime(a))
    .slice(0, 2);

  const recentEntries = journalEntries.slice(0, 4);

  const handleAdvanceSpotlight = () => {
    if (displayAffirmations.length > 1) {
      setDirection(1);
      setSpotlightIndex((prev) => (prev + 1) % displayAffirmations.length);
    }
  };

  // Rampage Set computations for Active Mode
  const totalRampageSets = rampageSets.length;
  const safeRampageSetIndex =
    totalRampageSets > 0
      ? ((activeRampageSetIndex % totalRampageSets) + totalRampageSets) % totalRampageSets
      : 0;
  const currentRampageSet = rampageSets[safeRampageSetIndex];
  const rampageAffirmations = currentRampageSet?.affirmations || [];
  const totalRampageAffs = rampageAffirmations.length;
  const safeRampageAffIndex =
    totalRampageAffs > 0
      ? ((rampageAffirmationIndex % totalRampageAffs) + totalRampageAffs) % totalRampageAffs
      : 0;
  const currentRampageAff = rampageAffirmations[safeRampageAffIndex];

  const handleAdvanceRampage = () => {
    if (!currentRampageSet || totalRampageAffs === 0 || !currentRampageAff) return;
    incrementRampageAffirmationRepeat(currentRampageSet.id, currentRampageAff.id);
    setDirection(1);
    setRampageAffirmationIndex((prev) => (prev + 1) % totalRampageAffs);
  };

  const handlePrevRampageSet = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (totalRampageSets <= 1) return;
    setActiveRampageSetIndex((prev) => (prev - 1 + totalRampageSets) % totalRampageSets);
    setRampageAffirmationIndex(0);
  };

  const handleNextRampageSet = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (totalRampageSets <= 1) return;
    setActiveRampageSetIndex((prev) => (prev + 1) % totalRampageSets);
    setRampageAffirmationIndex(0);
  };

  const spotlightTextVariants = {
    initial: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 40 : -40,
      scale: 0.96,
      filter: 'blur(4px)',
    }),
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: IOS_LAYOUT_SPRING,
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -40 : 40,
      scale: 0.96,
      filter: 'blur(4px)',
      transition: {
        duration: 0.2,
        ease: [0.32, 0.72, 0, 1] as const,
      },
    }),
  };

  return (
    <div className="w-full space-y-4 pt-0.5">
      {/* Header Bar: Saludo + Switcher dinámico (Robótico vs Rampage) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <motion.div
          key={`${greeting}-${displayName}`}
          initial={{ opacity: 0, y: -8, filter: 'blur(5px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ type: 'spring', damping: 25, stiffness: 240, mass: 0.8 }}
          className="hidden lg:block pt-0.5 pb-0.5"
        >
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            {greeting},{' '}
            <span className="bg-gradient-to-r from-purple-700 via-pink-600 to-amber-600 bg-clip-text text-transparent">
              {displayName}
            </span>
          </h1>
        </motion.div>

        {/* Dynamic Mode Switcher (Afirmaciones Robóticas vs Rampage Activo) */}
        <div
          data-testid="dashboard-mode-switcher"
          className="inline-flex p-1 rounded-full bg-white/90 border border-purple-200/80 shadow-neu-sm backdrop-blur-md self-start sm:self-auto"
        >
          <button
            type="button"
            onClick={() => handleSetFocusMode('robotic')}
            data-testid="dashboard-mode-robotic-btn"
            className={`px-3 py-1.5 text-xs font-serif tracking-wide rounded-full transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none ${
              focusMode === 'robotic'
                ? 'bg-white text-purple-950 font-bold shadow-xs border border-purple-300/80'
                : 'text-slate-600 font-medium hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
            <span>Afirmaciones</span>
            <span className="text-[10px] font-sans font-normal opacity-70 hidden sm:inline">(Robóticas)</span>
          </button>

          <button
            type="button"
            onClick={() => handleSetFocusMode('rampage')}
            data-testid="dashboard-mode-rampage-btn"
            className={`px-3 py-1.5 text-xs font-serif tracking-wide rounded-full transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none ${
              focusMode === 'rampage'
                ? 'bg-white text-amber-950 font-bold shadow-xs border border-amber-300/80'
                : 'text-slate-600 font-medium hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Rampage</span>
            <span className="text-[10px] font-sans font-normal opacity-70 hidden sm:inline">(Activo)</span>
          </button>
        </div>
      </div>

      {/* Undo Banner if recently deleted */}
      {recentlyDeletedAffirmation && (
        <div className="p-3 rounded-2xl bg-manifest-surfaceElevated border border-manifest-glassBorder flex items-center justify-between gap-3 shadow-neu-sm">
          <p className="text-xs text-manifest-ink">
            Afirmación retirada:{' '}
            <span className="font-semibold italic">“{recentlyDeletedAffirmation.text}”</span>
          </p>
          <button
            type="button"
            onClick={() => {
              saveAffirmation(recentlyDeletedAffirmation);
              setRecentlyDeletedAffirmation(null);
            }}
            className="px-3 py-1 rounded-xl text-xs font-semibold primary-gradient-btn text-manifest-ink flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Deshacer</span>
          </button>
        </div>
      )}

      {/* Main Grid Container with Coordinated iOS Reactive Reflow */}
      <LayoutGroup id="dashboard-layout-group">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ============================================================== */}
          {/* COLUMNA PRINCIPAL (8 columnas en desktop, orden central) */}
          {/* ============================================================== */}
          <motion.div
            layout="position"
            transition={IOS_LAYOUT_SPRING}
            className="lg:col-span-8 space-y-6"
          >
            {/* A. HERO SPOTLIGHT CARD: DINÁMICO ENTRE ROBÓTICO Y RAMPAGE ACTIVO */}
            {focusMode === 'robotic' ? (
              /* MODO ROBÓTICO (Afirmaciones Convencionales) */
              spotlightAffirmation ? (
                <motion.div
                  layout="position"
                  transition={IOS_LAYOUT_SPRING}
                  onClick={handleAdvanceSpotlight}
                  data-testid="home-spotlight-card"
                  className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#FAF3F8] via-[#F6EEFA] to-[#F0E8F9] border border-purple-200/80 shadow-[6px_6px_18px_rgba(215,200,240,0.45),-6px_-6px_18px_rgba(255,255,255,0.95)] cursor-pointer select-none group min-h-[175px] sm:min-h-[220px] max-h-[220px] sm:max-h-[260px] h-[185px] sm:h-[240px] flex flex-col justify-between p-4 sm:p-6 overflow-hidden"
                >
                  {/* Corner decorative quotation marks */}
                  <span className="absolute top-1.5 left-3 sm:top-2 sm:left-4 font-serif text-2xl sm:text-4xl text-purple-400/40 select-none pointer-events-none leading-none z-0">
                    “
                  </span>
                  <span className="absolute bottom-1.5 right-3 sm:bottom-2 sm:right-4 font-serif text-2xl sm:text-4xl text-pink-400/40 select-none pointer-events-none leading-none z-0">
                    ”
                  </span>

                  {/* Ambient pastel radial aura */}
                  <div
                    aria-hidden="true"
                    className="absolute -top-16 -right-16 w-60 h-60 rounded-full bg-gradient-to-br from-pink-300/25 via-purple-300/20 to-transparent blur-3xl pointer-events-none"
                  />

                  {/* Card Header: Pastel pill counter + Edit button */}
                  <div className="flex items-center justify-between gap-2 relative z-10">
                    <div className="flex items-center gap-1.5 pl-1 sm:pl-2">
                      {displayAffirmations.length > 1 && (
                        <span className="text-[10px] sm:text-[11px] font-sans font-bold text-purple-900 bg-purple-100/90 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-purple-300/70 tabular-nums shadow-neu-sm">
                          {(spotlightIndex % displayAffirmations.length) + 1} / {displayAffirmations.length}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openAffirmationEditor(spotlightAffirmation);
                      }}
                      title="Editar decreto"
                      className="p-1.5 sm:p-2 rounded-full bg-white/80 hover:bg-white text-purple-700 hover:text-purple-900 border border-purple-200/70 shadow-neu-sm transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none"
                    >
                      <Edit3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>

                  {/* Affirmation Text: Tipografía Adaptativa y Transición Suave mode="wait" */}
                  <div className="relative z-10 flex-1 flex items-center justify-center my-auto px-2 overflow-hidden">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={spotlightAffirmation.id}
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full flex items-center justify-center text-center"
                      >
                        <p
                          className={`text-slate-800 font-medium tracking-wide drop-shadow-[0_1px_1px_rgba(255,255,255,0.85)] ${
                            spotlightAffirmation.text.length < 60
                              ? 'text-base sm:text-2xl font-serif leading-snug text-center my-auto'
                              : spotlightAffirmation.text.length <= 160
                              ? 'text-[14px] sm:text-lg leading-relaxed text-center my-auto'
                              : 'text-[12.5px] sm:text-[15px] leading-relaxed text-center my-auto overflow-y-auto no-scrollbar max-h-[105px] sm:max-h-[140px]'
                          }`}
                        >
                          “{spotlightAffirmation.text}”
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Subtle indicator footer */}
                  <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-purple-600/70 font-sans relative z-10 px-1">
                    <span>✧</span>z
                  </div>
                </motion.div>
              ) : (
                <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#FAF3F8] via-[#F6EEFA] to-[#F0E8F9] border border-purple-200/80 p-6 text-center space-y-2.5 min-h-[175px] sm:min-h-[220px] flex flex-col justify-center items-center shadow-neu-sm">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  <p className="font-serif text-sm sm:text-base text-slate-800 font-semibold">
                    Sin afirmaciones consagradas para repetir
                  </p>
                  <p className="text-xs text-slate-600 max-w-sm">
                    Crea tu primer decreto para comenzar tu repetición robótica continua.
                  </p>
                  <button
                    type="button"
                    onClick={() => openAffirmationEditor(null)}
                    className="mt-1 px-4 py-1.5 rounded-full primary-gradient-btn text-xs font-serif font-semibold shadow-sm cursor-pointer"
                  >
                    + Crear primer decreto
                  </button>
                </div>
              )
            ) : (
              /* MODO RAMPAGE (Sets Activos de Alta Intensidad) */
              currentRampageSet && currentRampageAff ? (
                <motion.div
                  layout="position"
                  transition={IOS_LAYOUT_SPRING}
                  onClick={handleAdvanceRampage}
                  data-testid="home-rampage-spotlight-card"
                  className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#FFF9F3] via-[#FEF4EB] to-[#FDF0F4] border border-amber-200/80 shadow-[6px_6px_18px_rgba(245,215,190,0.45),-6px_-6px_18px_rgba(255,255,255,0.95)] cursor-pointer select-none group min-h-[175px] sm:min-h-[220px] max-h-[220px] sm:max-h-[260px] h-[185px] sm:h-[240px] flex flex-col justify-between p-4 sm:p-6 overflow-hidden"
                >
                  {/* Corner decorative quotation marks */}
                  <span className="absolute top-1.5 left-3 sm:top-2 sm:left-4 font-serif text-2xl sm:text-4xl text-amber-400/40 select-none pointer-events-none leading-none z-0">
                    “
                  </span>
                  <span className="absolute bottom-1.5 right-3 sm:bottom-2 sm:right-4 font-serif text-2xl sm:text-4xl text-rose-400/40 select-none pointer-events-none leading-none z-0">
                    ”
                  </span>

                  {/* Ambient warm radial aura */}
                  <div
                    aria-hidden="true"
                    className="absolute -top-16 -right-16 w-60 h-60 rounded-full bg-gradient-to-br from-amber-300/25 via-rose-300/20 to-transparent blur-3xl pointer-events-none"
                  />

                  {/* Card Header: Set Name + Controls */}
                  <div className="flex items-center justify-between gap-2 relative z-10">
                    <div className="flex items-center gap-1.5 pl-1 sm:pl-2 min-w-0">
                      {totalRampageSets > 1 && (
                        <div
                          className="flex items-center gap-0.5 mr-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={handlePrevRampageSet}
                            title="Set anterior"
                            className="w-5 h-5 rounded-full flex items-center justify-center bg-white/80 hover:bg-white text-amber-800 border border-amber-200/70 shadow-xs cursor-pointer transition-colors"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={handleNextRampageSet}
                            title="Set siguiente"
                            className="w-5 h-5 rounded-full flex items-center justify-center bg-white/80 hover:bg-white text-amber-800 border border-amber-200/70 shadow-xs cursor-pointer transition-colors"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      <span className="text-[10px] sm:text-[11px] font-sans font-bold text-amber-950 bg-amber-100/90 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-amber-300/70 truncate max-w-[140px] sm:max-w-[200px] shadow-neu-sm flex items-center gap-1">
                        <Flame className="w-2.5 h-2.5 text-amber-600 fill-amber-600 shrink-0" />
                        <span className="truncate">{currentRampageSet.title}</span>
                      </span>

                      <span className="text-[10px] sm:text-[11px] font-sans font-bold text-amber-900 bg-white/90 px-2 py-0.5 sm:py-1 rounded-full border border-amber-200/70 tabular-nums shadow-xs shrink-0">
                        {safeRampageAffIndex + 1}/{totalRampageAffs}
                      </span>
                    </div>

                    {/* Right controls: Repeat Count Badge + Play session + Edit Set */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        title="Repeticiones acumuladas de esta afirmación"
                        className="text-[10px] sm:text-[11px] font-sans font-bold text-amber-900 bg-amber-100/90 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-amber-300/70 tabular-nums shadow-neu-sm flex items-center gap-1"
                      >
                        <span>x{currentRampageAff.repeatCount || 0}</span>
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToGoals('rampage');
                        }}
                        title="Iniciar sesión completa de Rampage"
                        className="p-1.5 sm:p-2 rounded-full bg-white/80 hover:bg-white text-amber-700 hover:text-amber-900 border border-amber-200/70 shadow-neu-sm transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                      >
                        <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-600 text-amber-600" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openRampageSetEditor(currentRampageSet);
                        }}
                        title="Editar set de Rampage"
                        className="p-1.5 sm:p-2 rounded-full bg-white/80 hover:bg-white text-amber-700 hover:text-amber-900 border border-amber-200/70 shadow-neu-sm transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                      >
                        <Edit3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Affirmation Text */}
                  <div className="relative z-10 flex-1 flex items-center justify-center my-auto px-2 overflow-hidden">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={`${currentRampageSet.id}-${currentRampageAff.id}-${safeRampageAffIndex}`}
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full flex items-center justify-center text-center"
                      >
                        <p
                          className={`text-slate-800 font-medium tracking-wide drop-shadow-[0_1px_1px_rgba(255,255,255,0.85)] ${
                            currentRampageAff.text.length < 60
                              ? 'text-base sm:text-2xl font-serif leading-snug text-center my-auto'
                              : currentRampageAff.text.length <= 160
                              ? 'text-[14px] sm:text-lg leading-relaxed text-center my-auto'
                              : 'text-[12.5px] sm:text-[15px] leading-relaxed text-center my-auto overflow-y-auto no-scrollbar max-h-[105px] sm:max-h-[140px]'
                          }`}
                        >
                          “{currentRampageAff.text}”
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Active Rampage Footer indicator */}
                  <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-amber-700/80 font-sans relative z-10 px-1">
                    <span>Toca para avanzar y sumar repetición (x{(currentRampageAff.repeatCount || 0) + 1}) ⚡</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Flame className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                      <span>Rampage Activo</span>
                    </span>
                  </div>
                </motion.div>
              ) : (
                /* Empty state for Rampage Hero Card */
                <motion.div
                  layout="position"
                  transition={IOS_LAYOUT_SPRING}
                  data-testid="home-rampage-empty-hero-card"
                  className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#FFF9F3] via-[#FEF4EB] to-[#FDF0F4] border border-amber-200/80 shadow-[6px_6px_18px_rgba(245,215,190,0.45),-6px_-6px_18px_rgba(255,255,255,0.95)] p-5 sm:p-7 flex flex-col justify-between min-h-[175px] sm:min-h-[220px]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] sm:text-[11px] font-sans font-bold text-amber-950 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-300/70 flex items-center gap-1 shadow-neu-sm">
                      <Flame className="w-2.5 h-2.5 text-amber-600 fill-amber-600" />
                      <span>Santuario Rampage</span>
                    </span>
                  </div>

                  <div className="text-center py-2 space-y-1">
                    <h3 className="font-serif text-base sm:text-xl font-bold text-slate-800">
                      Despierta tus Afirmaciones de Alta Energía
                    </h3>
                    <p className="text-xs sm:text-[13px] text-slate-600 max-w-md mx-auto">
                      A diferencia de la repetición pasiva, el Rampage sincroniza emoción y ritmo para reprogramar tu convicción activa.
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => openRampageSetEditor(null)}
                      className="px-3.5 py-1.5 rounded-full primary-gradient-btn text-xs font-serif font-semibold shadow-sm cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Crear Set Manual</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigateToGoals('rampage');
                        openRampageConfig();
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-amber-800 border border-amber-200/80 text-xs font-serif font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>Rampage con IA</span>
                    </button>
                  </div>
                </motion.div>
              )
            )}

            {/* B. SECCIÓN INFERIOR: ÚLTIMAS AFIRMACIONES (ROBÓTICAS) vs SETS DE RAMPAGE (ACTIVOS) */}
            {focusMode === 'robotic' ? (
              <motion.section
                layout="position"
                transition={IOS_LAYOUT_SPRING}
                className="space-y-2.5 pt-0.5"
              >
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-[11px] sm:text-xs font-sans font-bold uppercase tracking-wider text-manifest-ink flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-manifest-brass" />
                    <span>Últimas Afirmaciones</span>
                  </h3>

                  <motion.button
                    whileTap={IOS_TAP_SPRING}
                    onClick={() => openAffirmationEditor(null)}
                    className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full primary-gradient-btn text-[11px] sm:text-xs font-serif tracking-wide shadow-sm shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none"
                  >
                    <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>Nuevo Decreto</span>
                  </motion.button>
                </div>

                {latestTwoAffirmations.length === 0 ? (
                  <LiquidEmptyState
                    title="Sin afirmaciones consagradas"
                    description="Crea tu primer decreto para sintonizar tu realidad y habitar tu manifestación."
                    actionLabel="Crear mi primer decreto"
                    onAction={() => openAffirmationEditor(null)}
                  />
                ) : (
                  <div className="space-y-2">
                    {latestTwoAffirmations.map((aff) => (
                      <motion.div
                        key={aff.id}
                        layout="position"
                        transition={IOS_LAYOUT_SPRING}
                        onClick={() => openAffirmationEditor(aff)}
                        className="p-3 sm:p-4 rounded-xl sm:rounded-2xl glass-card border border-manifest-glassBorder hover:border-manifest-glassBorderFocus transition-colors cursor-pointer shadow-neu-sm flex items-start justify-between gap-2.5 group"
                      >
                        <p className="font-serif text-[13px] sm:text-base text-manifest-ink leading-relaxed group-hover:text-manifest-brass transition-colors flex-1 select-text line-clamp-2">
                          “{aff.text}”
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openAffirmationEditor(aff);
                          }}
                          title="Editar afirmación"
                          className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200/90 shadow-xs shrink-0 transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}

                    <motion.button
                      type="button"
                      layout="position"
                      transition={IOS_LAYOUT_SPRING}
                      whileTap={IOS_TAP_SPRING}
                      onClick={() => navigateToGoals('list')}
                      className="w-full py-2.5 px-3 rounded-xl sm:rounded-2xl glass-card border border-manifest-glassBorder text-xs sm:text-sm font-serif text-manifest-ink flex items-center justify-center gap-1.5 hover:bg-manifest-glassControlHover active:scale-98 transition-colors cursor-pointer shadow-neu-sm"
                    >
                      <span>Ver todas las afirmaciones</span>
                      <ArrowRight className="w-3.5 h-3.5 text-manifest-brass" />
                    </motion.button>
                  </div>
                )}
              </motion.section>
            ) : (
              <motion.section
                layout="position"
                transition={IOS_LAYOUT_SPRING}
                className="space-y-2.5 pt-0.5"
              >
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-[11px] sm:text-xs font-sans font-bold uppercase tracking-wider text-manifest-ink flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Sets de Rampage Activos</span>
                  </h3>

                  <div className="flex items-center gap-1.5">
                    <motion.button
                      whileTap={IOS_TAP_SPRING}
                      onClick={() => openRampageSetEditor(null)}
                      className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full primary-gradient-btn text-[11px] sm:text-xs font-serif tracking-wide shadow-sm shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                    >
                      <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>Nuevo Set</span>
                    </motion.button>
                  </div>
                </div>

                {rampageSets.length === 0 ? (
                  <LiquidEmptyState
                    icon={Flame}
                    badge="Rampage Activo"
                    title="Sin sets de rampage consagrados"
                    description="Crea tu primer set rítmico de alta vibración para encender tu convicción activa."
                    actionLabel="Crear mi primer set de rampage"
                    onAction={() => openRampageSetEditor(null)}
                  />
                ) : (
                  <div className="space-y-2">
                    {rampageSets.slice(0, 3).map((set, idx) => {
                      const isCurrentSpotlight = safeRampageSetIndex === idx;
                      const totalRepeats = set.affirmations.reduce(
                        (acc, a) => acc + (a.repeatCount || 0),
                        0
                      );
                      return (
                        <motion.div
                          key={set.id}
                          layout="position"
                          transition={IOS_LAYOUT_SPRING}
                          onClick={() => {
                            setActiveRampageSetIndex(idx);
                            setRampageAffirmationIndex(0);
                          }}
                          className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl glass-card border transition-colors cursor-pointer shadow-neu-sm flex items-center justify-between gap-3 group ${
                            isCurrentSpotlight
                              ? 'border-amber-400/80 bg-amber-50/40 ring-1 ring-amber-300/50'
                              : 'border-manifest-glassBorder hover:border-amber-300/60'
                          }`}
                        >
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-serif font-bold text-sm sm:text-base text-manifest-ink group-hover:text-amber-800 transition-colors truncate">
                                {set.title}
                              </span>
                              {isCurrentSpotlight && (
                                <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-amber-700 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-300/70 shrink-0">
                                  En Foco
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-manifest-inkMuted">
                              <span>{set.affirmations.length} afirmaciones</span>
                              <span>•</span>
                              <span className="flex items-center gap-1 font-semibold text-amber-700">
                                <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                                {totalRepeats} repeticiones
                              </span>
                              {set.category && (
                                <>
                                  <span>•</span>
                                  <span className="capitalize">{set.category}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openRampageSetEditor(set);
                              }}
                              title="Editar set"
                              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200/90 shadow-xs transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigateToGoals('rampage');
                              }}
                              title="Practicar sesión"
                              className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/90 shadow-xs transition-colors cursor-pointer"
                            >
                              <Play className="w-3 h-3 fill-amber-600 text-amber-600" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}

                    <motion.button
                      type="button"
                      layout="position"
                      transition={IOS_LAYOUT_SPRING}
                      whileTap={IOS_TAP_SPRING}
                      onClick={() => navigateToGoals('rampage')}
                      className="w-full py-2.5 px-3 rounded-xl sm:rounded-2xl glass-card border border-manifest-glassBorder text-xs sm:text-sm font-serif text-manifest-ink flex items-center justify-center gap-1.5 hover:bg-manifest-glassControlHover active:scale-98 transition-colors cursor-pointer shadow-neu-sm"
                    >
                      <span>Ir al santuario de Rampage completo</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                    </motion.button>
                  </div>
                )}
              </motion.section>
            )}
          </motion.div>

        {/* ============================================================== */}
        {/* COLUMNA DERECHA / PANEL MÍSTICO (4 columnas en desktop) */}
        {/* ============================================================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* Grimorio & Diario Reciente (Inspirado en Activity Feed) */}
          <motion.section
            layout="position"
            transition={IOS_LAYOUT_SPRING}
            className="space-y-2.5"
          >
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[11px] sm:text-xs font-sans font-bold uppercase tracking-wider text-manifest-ink flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-manifest-brass" />
                <span>Grimorio & Diario</span>
              </h3>

              <div className="flex items-center gap-2">
                {journalEntries.length > 0 && (
                  <button
                    onClick={() => setActiveTab('diario')}
                    className="text-[11px] sm:text-xs font-sans text-manifest-inkMuted hover:text-manifest-brass transition-colors flex items-center gap-0.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none rounded"
                  >
                    <span>Ver todas</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
                <motion.button
                  whileTap={IOS_TAP_SPRING}
                  data-testid="dashboard-write-journal-btn"
                  onClick={() => openJournalEditor('manifestation', null)}
                  className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full primary-gradient-btn text-[11px] sm:text-xs font-sans font-semibold tracking-wide shadow-sm shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none"
                >
                  <PenLine className="w-3 h-3" />
                  <span>Escribir</span>
                </motion.button>
              </div>
            </div>

            {recentEntries.length === 0 ? (
              <LiquidEmptyState
                icon={BookOpen}
                badge="Grimorio Íntimo"
                title="Tu grimorio aguarda tus palabras"
                description="Aquí vivirán tus reflexiones personales, avances de manifestación y sincronías conscientes."
                actionLabel="Escribir en el Grimorio"
                onAction={() => openJournalEditor('manifestation', null)}
              />
            ) : (
              <div className="space-y-2">
                {recentEntries.map((entry) => {
                  const formattedEntryDate = format(new Date(entry.createdAt), "d 'de' MMMM", { locale: es });
                  const isProgress = entry.entryType === 'progress';
                  const isManifestation = entry.entryType === 'manifestation';
                  const hasCustomTitle =
                    entry.title &&
                    entry.title !== 'Entrada de diario' &&
                    !entry.content.startsWith(entry.title.replace(/\.\.\.$/, ''));

                  return (
                    <motion.div
                      key={entry.id}
                      layout="position"
                      transition={IOS_LAYOUT_SPRING}
                      onClick={() => setSelectedJournalEntryForView(entry)}
                      data-testid={`journal-card-${entry.id}`}
                      className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl tarot-card-border glass-card-interactive cursor-pointer space-y-1.5 sm:space-y-2 select-none ${
                        isProgress
                          ? 'border-l-[3.5px] border-l-emerald-500/70'
                          : isManifestation
                          ? 'border-l-[3.5px] border-l-manifest-auraPurple/70'
                          : 'border-l-[3.5px] border-l-amber-500/70'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={`inline-flex items-center gap-1 text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 shadow-neu-sm ${
                              isProgress
                                ? 'bg-emerald-100/80 text-emerald-800 border border-emerald-300/60'
                                : isManifestation
                                ? 'bg-purple-100/80 text-purple-800 border border-purple-300/60'
                                : 'bg-amber-100/80 text-amber-800 border border-amber-300/60'
                            }`}
                          >
                            {isProgress ? (
                              <>
                                <Sparkles className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                                <span>Avance</span>
                              </>
                            ) : isManifestation ? (
                              <>
                                <Target className="w-2.5 h-2.5 text-purple-600 shrink-0" />
                                <span>Manifestación</span>
                              </>
                            ) : (
                              <>
                                <Trophy className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                                <span>Success Story</span>
                              </>
                            )}
                          </span>
                          <span className="text-[9.5px] sm:text-[10px] font-sans text-manifest-inkMuted whitespace-nowrap shrink-0">
                            {formattedEntryDate}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openJournalEditor(entry.entryType, entry);
                            }}
                            title="Editar entrada"
                            data-testid={`edit-journal-card-${entry.id}`}
                            className="w-6 h-6 rounded-md flex items-center justify-center bg-manifest-glassControl hover:bg-manifest-glassControlHover text-manifest-inkMuted hover:text-manifest-ink border border-manifest-glassBorder active:scale-95 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setJournalEntryToDelete(entry);
                            }}
                            title="Eliminar entrada"
                            data-testid={`delete-journal-card-${entry.id}`}
                            className="w-6 h-6 rounded-md flex items-center justify-center bg-manifest-glassControl hover:bg-rose-100/80 text-manifest-inkMuted hover:text-rose-600 border border-manifest-glassBorder active:scale-95 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="pt-0.5">
                        {hasCustomTitle ? (
                          <div>
                            <h4 className="text-xs font-serif font-bold text-manifest-ink line-clamp-1 leading-snug">
                              {entry.title}
                            </h4>
                            <p className="text-[11px] font-serif text-manifest-inkMuted line-clamp-2 leading-relaxed mt-0.5">
                              {entry.content}
                            </p>
                          </div>
                        ) : (
                          <p className="text-[11.5px] sm:text-[13px] font-serif text-manifest-ink leading-snug line-clamp-2">
                            “{entry.content}”
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.section>
        </div>
      </div>
    </LayoutGroup>

      {/* Pop-up de Confirmación de Eliminación de Afirmación */}
      <AnimatePresence>
        {affirmationToDelete && (
          <div
            onClick={() => setAffirmationToDelete(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-md"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 6,
                transition: { duration: 0.15, ease: [0.22, 1, 0.36, 1] },
              }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-sm rounded-3xl glass-card border border-manifest-glassBorder shadow-liquid space-y-4 p-5 sm:p-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100/80 border border-rose-300/60 text-rose-700 flex items-center justify-center shrink-0 shadow-neu-sm">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold text-manifest-ink">
                    ¿Retirar este decreto?
                  </h3>
                  <p className="text-[11px] text-manifest-inkMuted">
                    Confirmación de retiro
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-manifest-glassControl border border-manifest-glassBorder">
                <p className="text-xs font-serif italic text-manifest-ink line-clamp-3">
                  “{affirmationToDelete.text}”
                </p>
              </div>

              <p className="text-[11.5px] text-manifest-inkMuted leading-relaxed">
                Esta acción retirará la afirmación de tu altar de inicio.{' '}
                <span className="font-semibold text-manifest-brass">Podrás deshacer la acción de inmediato</span> si lo deseas.
              </p>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setAffirmationToDelete(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-serif text-manifest-inkMuted hover:text-manifest-ink hover:bg-manifest-glassControlHover transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const deleted = affirmationToDelete;
                    deleteAffirmation(deleted.id);
                    setRecentlyDeletedAffirmation(deleted);
                    setAffirmationToDelete(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-800 to-rose-900 hover:from-rose-700 hover:to-rose-800 border border-rose-500/30 text-white text-xs font-serif font-semibold shadow-sm transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
                >
                  Retirar decreto
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Undo Pill (Deshacer) */}
      <AnimatePresence>
        {recentlyDeletedAffirmation && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95, transition: { duration: 0.15 } }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-20 lg:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl glass-card border border-manifest-glassBorder shadow-liquid backdrop-blur-xl"
          >
            <span className="text-xs font-serif text-manifest-ink">
              Decreto retirado
            </span>
            <button
              type="button"
              onClick={() => {
                saveAffirmation(recentlyDeletedAffirmation);
                setRecentlyDeletedAffirmation(null);
              }}
              className="text-xs font-serif font-bold text-manifest-brass px-2.5 py-1 rounded-xl bg-manifest-glassControl hover:bg-manifest-glassControlHover border border-manifest-brass/40 transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95 focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Deshacer</span>
            </button>
            <button
              type="button"
              onClick={() => setRecentlyDeletedAffirmation(null)}
              className="text-manifest-inkMuted hover:text-manifest-ink p-1 rounded-full cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal for viewing full Journal Entry from Inicio */}
      <JournalEntryDetailModal
        isOpen={!!selectedJournalEntryForView}
        entry={selectedJournalEntryForView}
        onClose={() => setSelectedJournalEntryForView(null)}
        onEdit={(entry) => openJournalEditor(entry.entryType, entry)}
        onDelete={(id) => deleteJournalEntry(id)}
      />

      {/* Confirmation Dialog for deleting a journal entry */}
      <AnimatePresence>
        {journalEntryToDelete && (
          <div
            onClick={() => setJournalEntryToDelete(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-md"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 6 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm rounded-3xl glass-card border border-manifest-glassBorder shadow-liquid space-y-4 p-5 sm:p-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100/80 border border-rose-300/60 text-rose-700 flex items-center justify-center shrink-0 shadow-neu-sm">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold text-manifest-ink">
                    ¿Eliminar esta entrada?
                  </h3>
                  <p className="text-[11px] text-manifest-inkMuted">
                    Confirmación de eliminación
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-manifest-glassControl border border-manifest-glassBorder">
                <p className="text-xs font-serif font-semibold text-manifest-ink line-clamp-1">
                  {journalEntryToDelete.title}
                </p>
                <p className="text-[11px] font-serif italic text-manifest-inkMuted line-clamp-2 mt-0.5">
                  {journalEntryToDelete.content}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setJournalEntryToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-serif text-manifest-inkMuted hover:text-manifest-ink hover:bg-manifest-glassControlHover transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteJournalEntry(journalEntryToDelete.id);
                    setJournalEntryToDelete(null);
                  }}
                  data-testid="confirm-delete-journal-card-btn"
                  className="px-4 py-2 rounded-xl text-xs font-serif font-semibold bg-rose-800 hover:bg-rose-700 text-white shadow-sm active:scale-95 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
