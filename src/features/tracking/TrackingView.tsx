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
    affirmations,
    dailyReflections,
    saveDailyReflection,
    getAvailableMilestones,
  } = useAppStore();

  const [isReflectionModalOpen, setIsReflectionModalOpen] = useState(false);
  const [reflectionMood, setReflectionMood] = useState<MoodType>('peaceful');
  const [highlights, setHighlights] = useState('');
  const [challenges, setChallenges] = useState('');
  const [learnings, setLearnings] = useState('');
  const [gratitude, setGratitude] = useState('');

  const affirmationsCount = affirmations.length;
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
      {/* Overview Metric Cards (Bento Style, Anti-Slop, Witchy Refined) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="p-2 sm:p-4 rounded-xl sm:rounded-2xl tarot-card-border glass-card border border-purple-400/15 shadow-sm space-y-0.5 sm:space-y-1">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-purple-100/80 border border-purple-300/60 flex items-center justify-center shadow-neu-sm">
            <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-700" />
          </div>
          <span className="text-base sm:text-2xl font-serif font-bold text-manifest-ink block pt-0.5 sm:pt-1">
            {affirmationsCount}
          </span>
          <p className="text-[9.5px] sm:text-[11px] text-slate-600 font-medium leading-tight line-clamp-2">
            Decretos consagrados
          </p>
        </div>

        <div className="p-2 sm:p-4 rounded-xl sm:rounded-2xl tarot-card-border glass-card border border-purple-400/15 shadow-sm space-y-0.5 sm:space-y-1">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-emerald-100/80 border border-emerald-300/60 flex items-center justify-center shadow-neu-sm">
            <Feather className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-700" />
          </div>
          <span className="text-base sm:text-2xl font-serif font-bold text-manifest-ink block pt-0.5 sm:pt-1">
            {journalEntries.length}
          </span>
          <p className="text-[9.5px] sm:text-[11px] text-slate-600 font-medium leading-tight line-clamp-2">
            Entradas grimorio
          </p>
        </div>

        <div className="p-2 sm:p-4 rounded-xl sm:rounded-2xl tarot-card-border glass-card border border-manifest-glassBorder shadow-sm space-y-0.5 sm:space-y-1">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-manifest-glassControl border border-manifest-glassBorder flex items-center justify-center">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-manifest-auraPurple" />
          </div>
          <span className="text-base sm:text-2xl font-serif font-bold text-manifest-ink block pt-0.5 sm:pt-1">
            {settings.totalReleases}
          </span>
          <p className="text-[9.5px] sm:text-[11px] text-slate-600 font-medium leading-tight line-clamp-2">
            Transmutadas
          </p>
        </div>
      </div>

      {/* Gentle Milestones & Badges */}
      <div className="space-y-2.5 sm:space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-manifest-ink flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-manifest-auraPurple" />
            Hitos de Conexión Sagrada ({unlockedCount}/{milestones.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border flex items-center gap-2.5 sm:gap-3 transition-colors ${
                milestone.unlocked
                  ? 'glass-card border-manifest-glassBorder shadow-sm'
                  : 'bg-manifest-glassControl/50 border-manifest-glassBorder'
              }`}
            >
              <div
                className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${
                  milestone.unlocked
                    ? 'bg-manifest-glassControl border border-manifest-glassBorderFocus text-manifest-auraPurple shadow-xs'
                    : 'bg-manifest-glassControl text-manifest-inkMuted border border-manifest-glassBorder'
                }`}
              >
                {milestone.category === 'writing' ? (
                  <Feather className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : milestone.category === 'action' ? (
                  <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : milestone.category === 'streak' ? (
                  <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-manifest-ink truncate">
                      {milestone.title}
                    </h4>
                    {milestone.unlocked ? (
                      <span className="text-[8.5px] sm:text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100/80 border border-emerald-300/60 text-emerald-800 shadow-neu-sm">
                        Conseguido
                      </span>
                    ) : milestone.progress ? (
                      <span className="text-[8.5px] sm:text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-100/80 text-purple-800 border border-purple-300/60 shadow-neu-sm">
                        {milestone.progress.current}/{milestone.progress.target}
                      </span>
                    ) : (
                      <span className="text-[8.5px] sm:text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-manifest-glassControl text-manifest-inkMuted border border-manifest-glassBorder">
                        Por desbloquear
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100/80 text-purple-800 border border-purple-300/60 shadow-neu-sm">
                    +{milestone.rewardFragments} Éter
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-600 mt-0.5 leading-snug font-normal line-clamp-2">
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
