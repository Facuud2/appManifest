'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import {
  Sparkles,
  PenLine,
  ArrowRight,
  BookOpen,
  Plus,
  Flame,
  Pin,
  Edit3,
  Trash2,
  RotateCcw,
  X,
  Target,
  Trophy,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Moon,
  Zap,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Affirmation, JournalEntry } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { IOS_TAP_SPRING } from '@/lib/iosSprings';
import { PinnedAffirmationsList } from '@/components/goals/PinnedAffirmationsList';
import { RampageSetView } from '@/components/goals/RampageSetView';
import { JournalEntryDetailModal } from '@/components/journal/JournalEntryDetailModal';
import { LiquidEmptyState } from '@/components/ui/LiquidEmptyState';

export const DashboardView: React.FC = () => {
  const {
    activeScope,
    setActiveTab,
    navigateToGoals,
    openJournalEditor,
    openAffirmationEditor,
    openRampageConfig,
    journalEntries,
    deleteJournalEntry,
    affirmations,
    reorderAffirmations,
    deleteAffirmation,
    saveAffirmation,
    incrementAffirmationRepeat,
    settings,
    etherFragments,
    openOracle,
  } = useAppStore();

  const [viewMode, setViewMode] = useState<'list' | 'rampage'>('list');
  const [showAllPinnedInDashboard, setShowAllPinnedInDashboard] = useState(false);
  const [selectedJournalEntryForView, setSelectedJournalEntryForView] = useState<JournalEntry | null>(null);
  const [journalEntryToDelete, setJournalEntryToDelete] = useState<JournalEntry | null>(null);
  const [affirmationToDelete, setAffirmationToDelete] = useState<Affirmation | null>(null);
  const [recentlyDeletedAffirmation, setRecentlyDeletedAffirmation] = useState<Affirmation | null>(null);
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [spotlightPulse, setSpotlightPulse] = useState(false);

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
  const unpinnedAffirmations = affirmations
    .filter((a) => !a.pinned)
    .sort((a, b) => {
      const timeA = getAffirmationTime(a);
      const timeB = getAffirmationTime(b);
      if (timeA !== timeB) {
        return timeB - timeA;
      }
      return (b.id || '').localeCompare(a.id || '');
    });

  const recentEntries = journalEntries.slice(0, 3);

  const rawDate = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });
  const formattedDate = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);
  const hour = new Date().getHours();

  const handleReorderPinned = (reordered: Affirmation[]) => {
    reorderAffirmations([...reordered, ...unpinnedAffirmations]);
  };

  const getScopeGreetingName = () => {
    switch (activeScope) {
      case 'facu':
        return 'Facu';
      case 'maia':
        return 'Maia';
      case 'shared':
        return 'Facu & Maia';
      default:
        return '';
    }
  };

  // Bento Spotlight Affirmation (Hero Focus)
  const spotlightAffirmation =
    pinnedAffirmations.length > 0
      ? pinnedAffirmations[spotlightIndex % pinnedAffirmations.length]
      : affirmations[0] || null;

  const totalRepeats = affirmations.reduce((sum, a) => sum + (a.repeatCount || 0), 0);
  const dailyStreak = settings.dailyStreak || 1;

  const handleRepeatSpotlight = (affId: string) => {
    setSpotlightPulse(true);
    setTimeout(() => setSpotlightPulse(false), 500);
    incrementAffirmationRepeat(affId);
  };

  const handleNextSpotlight = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pinnedAffirmations.length > 1) {
      setSpotlightIndex((prev) => (prev + 1) % pinnedAffirmations.length);
    }
  };

  const handlePrevSpotlight = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pinnedAffirmations.length > 1) {
      setSpotlightIndex((prev) => (prev - 1 + pinnedAffirmations.length) % pinnedAffirmations.length);
    }
  };

  return (
    <div className="w-full space-y-6 pt-1">
      {/* 1. Header: Saludo Sagrado & Fecha */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-manifest-ink flex items-center gap-2">
            <span className="text-manifest-brass text-base">✦</span>
            <span>
              {hour < 12 ? 'Alba consciente' : hour < 20 ? 'Tarde sagrada' : 'Noche mística'},{' '}
              {getScopeGreetingName()}
            </span>
          </h2>
          <p className="text-xs font-serif italic text-manifest-brass/80 mt-0.5 flex items-center gap-1.5">
            <span>✧</span>
            <span>{formattedDate}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => navigateToGoals(viewMode)}
            className="text-xs font-serif italic text-manifest-inkMuted hover:text-manifest-brass transition-colors flex items-center gap-1 cursor-pointer py-1 px-2.5 rounded-full hover:bg-manifest-glassControlHover focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none"
          >
            <span>{viewMode === 'rampage' ? 'Explorar sets' : 'Todas las afirmaciones'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 2. Responsive Bento Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ============================================================== */}
        {/* COLUMNA PRINCIPAL (8 columnas en desktop, orden central) */}
        {/* ============================================================== */}
        <div className="lg:col-span-8 space-y-6">
          {/* A. HERO SPOTLIGHT CARD (Inspirado en Hero de Harry Potter / Bento wireframe) */}
          {spotlightAffirmation && (
            <motion.div
              layout
              className="relative overflow-hidden rounded-3xl glass-card border border-manifest-glassBorder p-5 sm:p-7 shadow-liquid"
            >
              {/* Corner tarot stars */}
              <span className="absolute top-3.5 left-4 text-manifest-brass/45 text-xs select-none">✦</span>
              <span className="absolute top-3.5 right-4 text-manifest-brass/45 text-xs select-none">✦</span>
              <span className="absolute bottom-3.5 left-4 text-manifest-brass/45 text-xs select-none">✦</span>
              <span className="absolute bottom-3.5 right-4 text-manifest-brass/45 text-xs select-none">✦</span>

              {/* Ambient radial glow */}
              <div
                aria-hidden="true"
                className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-gradient-to-br from-manifest-brass/15 via-manifest-auraPurple/15 to-transparent blur-3xl pointer-events-none"
              />

              {/* Card Header: Badge + Pagination */}
              <div className="flex items-center justify-between gap-2 mb-3.5 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="vintage-label-tape-dark text-[10px] px-2.5 py-1 rounded flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-manifest-brass" />
                    <span>ENFOQUE SAGRADO</span>
                  </span>
                  <span className="vintage-label-tape text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-wider">
                    {spotlightAffirmation.userId === 'shared'
                      ? '✦ JUNTOS'
                      : (spotlightAffirmation.author || (spotlightAffirmation.userId === 'facu' ? '☾ FACU' : '✧ MAIA')).toUpperCase()}
                  </span>
                </div>

                {pinnedAffirmations.length > 1 && (
                  <div className="flex items-center gap-1 bg-manifest-glassControl px-2 py-0.5 rounded-full border border-manifest-glassBorder">
                    <button
                      onClick={handlePrevSpotlight}
                      title="Decreto anterior"
                      className="p-1 text-manifest-inkMuted hover:text-manifest-ink transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-sans font-bold text-manifest-brass px-1 tabular-nums">
                      {(spotlightIndex % pinnedAffirmations.length) + 1} / {pinnedAffirmations.length}
                    </span>
                    <button
                      onClick={handleNextSpotlight}
                      title="Decreto siguiente"
                      className="p-1 text-manifest-inkMuted hover:text-manifest-ink transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Affirmation Text: Crystal-clear Lora font */}
              <div className="my-3 sm:my-4 relative z-10">
                <p className="font-serif text-lg sm:text-xl lg:text-[22px] text-manifest-ink font-normal leading-relaxed select-text">
                  “{spotlightAffirmation.text}”
                </p>
              </div>

              {/* Action Bar: High impact repeat CTA + Repeat counter */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-manifest-glassBorder relative z-10">
                <div className="flex items-center gap-2 text-xs font-sans text-manifest-inkMuted">
                  <span className="flex items-center gap-1.5 text-amber-900 font-bold bg-amber-100/80 px-2.5 py-1 rounded-full border border-amber-300/60 shadow-neu-sm">
                    <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                    <span className="tabular-nums">{spotlightAffirmation.repeatCount} consagradas</span>
                  </span>
                  <span className="hidden sm:inline text-[11px] text-manifest-inkMuted">
                    Toca para elevar su vibración
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    whileTap={IOS_TAP_SPRING}
                    onClick={() => handleRepeatSpotlight(spotlightAffirmation.id)}
                    className="relative px-5 py-2.5 rounded-full primary-gradient-btn text-manifest-ink font-sans font-bold text-xs tracking-wider uppercase shadow-md flex items-center gap-1.5 cursor-pointer hover:brightness-110 active:scale-95 transition-all overflow-hidden focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none"
                  >
                    {spotlightPulse && (
                      <motion.span
                        initial={{ scale: 0.5, opacity: 0.8 }}
                        animate={{ scale: 2.2, opacity: 0 }}
                        transition={{ duration: 0.45 }}
                        className="absolute inset-0 bg-white rounded-full pointer-events-none"
                      />
                    )}
                    <Flame className="w-4 h-4 fill-current" />
                    <span>Repetir (+1)</span>
                  </motion.button>
                  <button
                    onClick={() => openAffirmationEditor(spotlightAffirmation)}
                    title="Editar decreto"
                    className="p-2.5 rounded-full bg-manifest-glassControl hover:bg-manifest-glassControlHover text-manifest-inkMuted hover:text-manifest-ink border border-manifest-glassBorder transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* B. BENTO STATS GRID (Esoteric Rainbow Pastel Neumorphism) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Box 1: Racha Sagrada (Soft Peach #FDE4D0 & Solar Butter #FDF2C7) */}
            <div className="p-3.5 sm:p-4 rounded-2xl glass-card border border-manifest-peach/40 hover:border-manifest-peach/70 transition-all space-y-1 relative overflow-hidden group">
              <div className="flex items-center justify-between text-amber-700">
                <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-amber-700">
                  Racha
                </span>
                <Flame className="w-4 h-4 fill-current text-amber-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-sans font-bold tabular-nums text-manifest-ink leading-none pt-1">
                {dailyStreak}d
              </div>
              <p className="text-[11px] font-sans text-manifest-inkMuted truncate">
                Conexión viva
              </p>
            </div>

            {/* Box 2: Decretos Activos (Soft Lavender #E3DBF8 & Amethyst) */}
            <div className="p-3.5 sm:p-4 rounded-2xl glass-card border border-manifest-lavender/50 hover:border-manifest-lavender/80 transition-all space-y-1 relative overflow-hidden group">
              <div className="flex items-center justify-between text-purple-700">
                <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-purple-700">
                  Decretos
                </span>
                <Sparkles className="w-4 h-4 text-purple-700" />
              </div>
              <div className="text-2xl sm:text-3xl font-sans font-bold tabular-nums text-manifest-ink leading-none pt-1">
                {affirmations.length}
              </div>
              <p className="text-[11px] font-sans text-manifest-inkMuted truncate">
                {pinnedAffirmations.length} en el altar
              </p>
            </div>

            {/* Box 3: Fragmentos de Éter (Soft Blue #C8E0F4 & Celestial Moon) */}
            <div
              onClick={() => openOracle()}
              className="p-3.5 sm:p-4 rounded-2xl glass-card border border-manifest-celeste/50 hover:border-manifest-celeste/80 transition-all space-y-1 relative overflow-hidden group cursor-pointer"
            >
              <div className="flex items-center justify-between text-sky-700">
                <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-sky-700">
                  Éter
                </span>
                <Moon className="w-4 h-4 text-sky-700" />
              </div>
              <div className="text-2xl sm:text-3xl font-sans font-bold tabular-nums text-manifest-ink leading-none pt-1 flex items-baseline gap-1">
                <span>{etherFragments}</span>
                <span className="text-xs font-sans text-sky-600 font-bold">✧</span>
              </div>
              <p className="text-[11px] font-sans font-medium text-sky-700 truncate group-hover:underline">
                Girar Oráculo →
              </p>
            </div>

            {/* Box 4: Vibración / Repeticiones (Soft Mint #D2F4E2 & Healing Jade) */}
            <div className="p-3.5 sm:p-4 rounded-2xl glass-card border border-manifest-mint/50 hover:border-manifest-mint/80 transition-all space-y-1 relative overflow-hidden group">
              <div className="flex items-center justify-between text-emerald-700">
                <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-emerald-700">
                  Energía
                </span>
                <Zap className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="text-2xl sm:text-3xl font-sans font-bold tabular-nums text-manifest-ink leading-none pt-1">
                {totalRepeats}
              </div>
              <p className="text-[11px] font-sans text-manifest-inkMuted truncate">
                Repeticiones totales
              </p>
            </div>
          </div>

          {/* C. DECRETOS & AFIRMACIONES DECK */}
          <section className="space-y-3 pt-2">
            <div className="flex items-center justify-between gap-2 px-0.5">
              <div className="inline-flex p-0.5 rounded-full bg-manifest-glassControl border border-manifest-glassBorder backdrop-blur-md">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 text-xs font-serif tracking-wide rounded-full transition-all flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none ${
                    viewMode === 'list'
                      ? 'bg-manifest-glassControlActive text-manifest-ink shadow-xs border border-manifest-glassBorderFocus'
                      : 'text-manifest-inkMuted hover:text-manifest-ink'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-manifest-brass" />
                  <span>Fijadas ({pinnedAffirmations.length})</span>
                </button>

                <button
                  onClick={() => setViewMode('rampage')}
                  className={`px-3 py-1.5 text-xs font-serif tracking-wide rounded-full transition-all flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none ${
                    viewMode === 'rampage'
                      ? 'bg-manifest-glassControlActive text-manifest-ink shadow-xs border border-manifest-glassBorderFocus'
                      : 'text-manifest-inkMuted hover:text-manifest-ink'
                  }`}
                >
                  <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>Rampage</span>
                </button>
              </div>

              {viewMode === 'rampage' ? (
                <motion.button
                  whileTap={IOS_TAP_SPRING}
                  onClick={() => openRampageConfig()}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full primary-gradient-btn text-xs font-serif tracking-wide shadow-sm shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuevo Set</span>
                </motion.button>
              ) : (
                <motion.button
                  whileTap={IOS_TAP_SPRING}
                  onClick={() => openAffirmationEditor(null)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full primary-gradient-btn text-xs font-serif tracking-wide shadow-sm shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuevo Decreto</span>
                </motion.button>
              )}
            </div>

            {viewMode === 'rampage' ? (
              <RampageSetView />
            ) : pinnedAffirmations.length === 0 ? (
              <LiquidEmptyState
                title="Sin decretos fijados"
                description="Consagra y fija tus afirmaciones prioritarias con el icono de chincheta para tenerlas presentes en tu santuario diario."
                actionLabel="Explorar mis afirmaciones"
                onAction={() => navigateToGoals('list')}
              />
            ) : (
              <div className="space-y-2.5">
                <PinnedAffirmationsList
                  pinnedAffirmations={
                    showAllPinnedInDashboard
                      ? pinnedAffirmations
                      : pinnedAffirmations.slice(0, 4)
                  }
                  onReorder={handleReorderPinned}
                  onDeleteRequest={(targetAff) => setAffirmationToDelete(targetAff)}
                />

                {pinnedAffirmations.length > 4 && (
                  <motion.button
                    type="button"
                    whileTap={IOS_TAP_SPRING}
                    onClick={() => setShowAllPinnedInDashboard((prev) => !prev)}
                    className="w-full py-2 px-3 rounded-full glass-pill text-xs font-serif text-manifest-brass flex items-center justify-center gap-1.5 transition-colors cursor-pointer hover:bg-manifest-glassControlHover focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none"
                  >
                    <span>
                      {showAllPinnedInDashboard
                        ? 'Mostrar menos decretos'
                        : `Ver las ${pinnedAffirmations.length} afirmaciones fijadas`}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        showAllPinnedInDashboard ? 'rotate-180' : ''
                      }`}
                    />
                  </motion.button>
                )}
              </div>
            )}
          </section>
        </div>

        {/* ============================================================== */}
        {/* COLUMNA DERECHA / PANEL MÍSTICO (4 columnas en desktop) */}
        {/* ============================================================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. Bento Card: Oráculo Cósmico (Liquid Glass Capsule) */}
          <div className="p-5 rounded-3xl glass-card border border-manifest-glassBorder space-y-3.5 shadow-liquid relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-manifest-brass flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-manifest-brass" />
                <span>Oráculo Cósmico</span>
              </span>
              <span className="text-[11px] font-sans font-bold px-2.5 py-0.5 rounded-full bg-manifest-glassControl text-manifest-brass border border-manifest-glassBorder tabular-nums">
                {etherFragments} ✧
              </span>
            </div>

            <p className="text-xs font-serif text-manifest-ink leading-relaxed">
              Sintoniza tu revelación mística y sincronicidades alineadas para hoy.
            </p>

            <motion.button
              whileTap={IOS_TAP_SPRING}
              onClick={() => openOracle()}
              className="w-full py-2.5 px-4 rounded-full primary-gradient-btn text-manifest-ink font-sans font-bold text-xs tracking-wide shadow-md flex items-center justify-center gap-2 cursor-pointer hover:brightness-105 active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none"
            >
              <Sparkles className="w-3.5 h-3.5 text-manifest-brass" />
              <span>Girar Oráculo</span>
            </motion.button>
          </div>

          {/* 2. Bento Card: Grimorio & Diario Reciente (Inspirado en Activity Feed de la inspo) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-manifest-ink flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-manifest-brass" />
                <span>Grimorio & Diario</span>
              </h3>

              <div className="flex items-center gap-2">
                {journalEntries.length > 0 && (
                  <button
                    onClick={() => setActiveTab('diario')}
                    className="text-xs font-sans text-manifest-inkMuted hover:text-manifest-brass transition-colors flex items-center gap-0.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none rounded"
                  >
                    <span>Ver todas</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
                <motion.button
                  whileTap={IOS_TAP_SPRING}
                  data-testid="dashboard-write-journal-btn"
                  onClick={() => openJournalEditor('manifestation', null)}
                  className="flex items-center gap-1 px-3 py-1 rounded-full primary-gradient-btn text-xs font-sans font-semibold tracking-wide shadow-sm shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none"
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
              <div className="space-y-2.5">
                {recentEntries.map((entry) => {
                  const formattedEntryDate = format(new Date(entry.createdAt), "d 'de' MMMM", { locale: es });
                  const isProgress = entry.entryType === 'progress';
                  const isManifestation = entry.entryType === 'manifestation';
                  const hasCustomTitle =
                    entry.title &&
                    entry.title !== 'Entrada de diario' &&
                    !entry.content.startsWith(entry.title.replace(/\.\.\.$/, ''));

                  return (
                    <div
                      key={entry.id}
                      onClick={() => setSelectedJournalEntryForView(entry)}
                      data-testid={`journal-card-${entry.id}`}
                      className={`p-3.5 rounded-2xl tarot-card-border glass-card-interactive cursor-pointer space-y-2 select-none ${
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
                            className={`inline-flex items-center gap-1 text-[9.5px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 shadow-neu-sm ${
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
                          <span className="text-[10px] font-sans text-manifest-inkMuted whitespace-nowrap shrink-0">
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
                            className="w-6.5 h-6.5 rounded-lg flex items-center justify-center bg-manifest-glassControl hover:bg-manifest-glassControlHover text-manifest-inkMuted hover:text-manifest-ink border border-manifest-glassBorder active:scale-95 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none"
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
                            className="w-6.5 h-6.5 rounded-lg flex items-center justify-center bg-manifest-glassControl hover:bg-rose-100/80 text-manifest-inkMuted hover:text-rose-600 border border-manifest-glassBorder active:scale-95 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
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
                          <p className="text-xs sm:text-[13px] font-serif text-manifest-ink leading-snug line-clamp-2">
                            “{entry.content}”
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* 3. Bento Card: Sabiduría Mística / Ley de Asunción */}
          <div className="p-4 rounded-2xl glass-card border border-manifest-glassBorder space-y-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 text-manifest-brass text-[11px] font-sans font-bold uppercase tracking-wider">
              <span>✦</span>
              <span>Sabiduría Diaria</span>
            </div>
            <p className="font-serif text-xs text-manifest-ink leading-relaxed">
              “El mundo físico no es más que el eco tardío de tu estado interior consagrado. Habita hoy en el agradecimiento de lo ya cumplido.”
            </p>
          </div>
        </div>
      </div>

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
