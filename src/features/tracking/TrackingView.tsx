'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store';
import {
  Sparkles,
  Flame,
  Award,
  Feather,
  CheckCircle2,
  Calendar,
  Heart,
  TrendingUp,
  Smile,
  Plus,
  X,
  Target,
  Sun,
  Compass,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DailyReflection, MoodType } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

export const TrackingView: React.FC = () => {
  const {
    settings,
    activeScope,
    journalEntries,
    goals,
    goalSteps,
    dailyReflections,
    saveDailyReflection,
    getAvailableMilestones,
    openOracle,
    etherFragments,
  } = useAppStore();

  const [isReflectionModalOpen, setIsReflectionModalOpen] = useState(false);
  const [reflectionMood, setReflectionMood] = useState<MoodType>('peaceful');
  const [highlights, setHighlights] = useState('');
  const [challenges, setChallenges] = useState('');
  const [learnings, setLearnings] = useState('');
  const [gratitude, setGratitude] = useState('');

  const completedStepsCount = goalSteps.filter((s) => s.completed).length;
  const milestones = getAvailableMilestones();
  const unlockedCount = milestones.filter((m) => m.unlocked).length;

  const handleSaveReflection = () => {
    if (!highlights.trim() && !learnings.trim() && !gratitude.trim()) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const reflection: DailyReflection = {
      id: `reflection-${todayStr}`,
      userId: activeScope,
      date: todayStr,
      mood: reflectionMood,
      highlights: highlights.trim(),
      challenges: challenges.trim(),
      learnings: learnings.trim(),
      gratitude: gratitude.trim(),
      createdAt: new Date().toISOString(),
    };

    saveDailyReflection(reflection);
    setIsReflectionModalOpen(false);
    setHighlights('');
    setChallenges('');
    setLearnings('');
    setGratitude('');
  };

  return (
    <div className="space-y-6">
      {/* Cosmic Oracle Banner & Ether Balance */}
      <div className="p-4 sm:p-5 rounded-3xl glass-card border border-white/95 shadow-glass flex flex-col sm:flex-row items-center justify-between gap-3.5 relative overflow-hidden">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-manifest-pink via-manifest-lavender to-manifest-celeste flex items-center justify-center shrink-0 shadow-xs">
            <Compass className="w-5 h-5 text-manifest-auraPurple" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-sm sm:text-base font-bold text-manifest-ink">
                Oráculo de Sincronías Cósmicas
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-manifest-lavender/60 text-manifest-auraPurple border border-manifest-auraPurple/30">
                ✨ {etherFragments} Éter
              </span>
            </div>
            <p className="text-xs text-manifest-inkMuted">
              Gira la ruleta de recompensas a 60 FPS para anclar sincronías y dones del camino.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openOracle}
          data-testid="open-oracle-from-tracking"
          className="w-full sm:w-auto px-5 py-2.5 rounded-2xl primary-gradient-btn text-xs font-bold shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Girar Oráculo</span>
        </button>
      </div>

      {/* Overview Metric Cards (Bento Style, Anti-Slop, Non-Generic) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-3xl glass-card border border-white/95 shadow-glass space-y-1">
          <div className="w-8 h-8 rounded-xl bg-manifest-pink/50 flex items-center justify-center">
            <Flame className="w-4 h-4 text-manifest-ink" />
          </div>
          <span className="text-2xl sm:text-3xl font-serif font-bold text-manifest-ink block pt-1">
            {settings.dailyStreak} {settings.dailyStreak === 1 ? 'Día' : 'Días'}
          </span>
          <p className="text-[11px] text-manifest-inkMuted">
            Racha de presencia serena
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl glass-card border border-white/95 shadow-glass space-y-1">
          <div className="w-8 h-8 rounded-xl bg-manifest-lavender/50 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-manifest-ink" />
          </div>
          <span className="text-2xl sm:text-3xl font-serif font-bold text-manifest-ink block pt-1">
            {completedStepsCount}
          </span>
          <p className="text-[11px] text-manifest-inkMuted">
            Acciones tangibles logradas
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl glass-card border border-white/95 shadow-glass space-y-1">
          <div className="w-8 h-8 rounded-xl bg-manifest-celeste/50 flex items-center justify-center">
            <Feather className="w-4 h-4 text-manifest-ink" />
          </div>
          <span className="text-2xl sm:text-3xl font-serif font-bold text-manifest-ink block pt-1">
            {journalEntries.length}
          </span>
          <p className="text-[11px] text-manifest-inkMuted">
            Entradas en tu diario
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl glass-card border border-white/95 shadow-glass space-y-1">
          <div className="w-8 h-8 rounded-xl bg-manifest-butter/50 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-manifest-ink" />
          </div>
          <span className="text-2xl sm:text-3xl font-serif font-bold text-manifest-ink block pt-1">
            {settings.totalReleases}
          </span>
          <p className="text-[11px] text-manifest-inkMuted">
            Cargas y miedos liberados
          </p>
        </div>
      </div>

      {/* Gentle Milestones & Badges */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-manifest-inkMuted flex items-center gap-1.5">
            <Award className="w-4 h-4 text-manifest-ink" />
            Hitos de Conexión Personal ({unlockedCount}/{milestones.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className={`p-3.5 sm:p-4 rounded-2xl glass-card border flex items-center gap-3 transition-opacity ${
                milestone.unlocked
                  ? 'border-white/95 shadow-glass'
                  : 'border-white/50 opacity-50 bg-white/30'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                  milestone.unlocked
                    ? 'bg-gradient-to-tr from-manifest-pink via-manifest-lavender to-manifest-celeste text-manifest-ink shadow-sm'
                    : 'bg-white/50 text-manifest-inkMuted'
                }`}
              >
                {milestone.category === 'writing' ? (
                  <Feather className="w-4 h-4" />
                ) : milestone.category === 'action' ? (
                  <Target className="w-4 h-4" />
                ) : milestone.category === 'streak' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-manifest-ink">
                    {milestone.title}
                  </h4>
                  {milestone.unlocked && (
                    <span className="text-[9px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      Conseguido
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-manifest-inkMuted mt-0.5 leading-relaxed">
                  {milestone.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Reflections Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-manifest-inkMuted flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-manifest-ink" />
            Reflexiones al Caer el Día
          </h3>
          <button
            onClick={() => setIsReflectionModalOpen(true)}
            className="text-xs font-semibold text-manifest-auraPurple flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Añadir reflexión
          </button>
        </div>

        {dailyReflections.length === 0 ? (
          <div className="p-6 rounded-3xl glass-card text-center space-y-2 border border-white/80">
            <p className="text-xs text-manifest-inkMuted">
              Cierra cada jornada preguntándote qué aprendiste y qué agradeces.
            </p>
            <button
              onClick={() => setIsReflectionModalOpen(true)}
              className="text-xs font-semibold text-manifest-auraPurple underline underline-offset-4"
            >
              Completar reflexión de hoy
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {dailyReflections.map((ref) => (
              <div
                key={ref.id}
                className="p-4 rounded-2xl glass-card border border-white/90 shadow-glass space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-manifest-ink">
                    {ref.date}
                  </span>
                  <span className="text-[11px] text-manifest-inkMuted capitalize">
                    {ref.mood}
                  </span>
                </div>
                {ref.highlights && (
                  <p className="text-xs text-manifest-ink">
                    <strong className="text-manifest-inkMuted">Momento luminoso:</strong> {ref.highlights}
                  </p>
                )}
                {ref.learnings && (
                  <p className="text-xs text-manifest-ink">
                    <strong className="text-manifest-inkMuted">Aprendizaje:</strong> {ref.learnings}
                  </p>
                )}
                {ref.gratitude && (
                  <p className="text-xs text-manifest-ink">
                    <strong className="text-manifest-inkMuted">Gratitud:</strong> {ref.gratitude}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reflection Modal */}
      <AnimatePresence>
        {isReflectionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-manifest-ink/35 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl glass-card p-5 border border-white shadow-liquid space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/70">
                <h3 className="font-serif text-sm font-bold text-manifest-ink">
                  Reflexión del Día
                </h3>
                <button
                  onClick={() => setIsReflectionModalOpen(false)}
                  className="p-1.5 rounded-full glass-pill text-manifest-inkMuted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-manifest-inkMuted block mb-1">
                    ¿Qué fue lo más luminoso de tu día?
                  </label>
                  <textarea
                    rows={2}
                    value={highlights}
                    onChange={(e) => setHighlights(e.target.value)}
                    placeholder="Un encuentro, un avance, una sonrisa..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-manifest-inkMuted block mb-1">
                    ¿Qué aprendiste o soltaste hoy?
                  </label>
                  <textarea
                    rows={2}
                    value={learnings}
                    onChange={(e) => setLearnings(e.target.value)}
                    placeholder="Una nueva perspectiva sobre ti..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-manifest-inkMuted block mb-1">
                    ¿Qué agradeces en este instante?
                  </label>
                  <textarea
                    rows={2}
                    value={gratitude}
                    onChange={(e) => setGratitude(e.target.value)}
                    placeholder="Tres razones sencillas para agradecer..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-white/70 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReflectionModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-manifest-inkMuted"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveReflection}
                  disabled={!highlights.trim() && !learnings.trim() && !gratitude.trim()}
                  className="px-4 py-1.5 rounded-xl primary-gradient-btn text-xs font-semibold disabled:opacity-50"
                >
                  Guardar Reflexión
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
