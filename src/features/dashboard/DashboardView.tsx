'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store';
import {
  Sparkles,
  Calendar,
  PenLine,
  Target,
  ArrowRight,
  Sun,
  Moon,
  CloudSun,
  Smile,
  Heart,
  Compass,
  CheckCircle2,
  Circle,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MoodType } from '@/types';
import {
  Sparkles as SparklesIcon,
  Wind as WindIcon,
  Lightbulb as LightbulbIcon,
  Flower2 as Flower2Icon,
  Moon as MoonIcon,
} from 'lucide-react';

const DAILY_AFFIRMATIONS = [
  'Todo lo que busco ya habita en mi interior esperando ser despertado.',
  'Hoy elijo actuar desde la certeza y soltar la necesidad de controlar todo.',
  'Mi energía es sagrada y elijo sembrarla en lo que expande mi corazón.',
  'Doy gracias por cada oportunidad de comenzar de nuevo con serenidad.',
  'La claridad llega cuando avanzo con pasos pequeños y constantes.',
  'Merezco recibir la abundancia y la paz que con tanto amor ofrezco.',
  'Confío en el tiempo perfecto de mi vida y abrazo mi presente.',
];

interface MoodConfig {
  type: MoodType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MOODS: MoodConfig[] = [
  { type: 'radiant', label: 'Radiante', icon: SparklesIcon },
  { type: 'peaceful', label: 'Serena', icon: WindIcon },
  { type: 'inspired', label: 'Inspirada', icon: LightbulbIcon },
  { type: 'grateful', label: 'Agradecida', icon: Flower2Icon },
  { type: 'contemplative', label: 'Reflexiva', icon: MoonIcon },
];

export const DashboardView: React.FC = () => {
  const {
    settings,
    activeScope,
    setActiveTab,
    goals,
    getGoalProgress,
    agendaEvents,
    toggleAgendaEvent,
    journalEntries,
    manifestationSigns,
    successStories,
  } = useAppStore();

  const [currentAffirmationIndex, setCurrentAffirmationIndex] = useState(0);
  const [selectedMood, setSelectedMood] = useState<MoodType>('radiant');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayEvents = agendaEvents.filter((e) => e.date === todayStr);
  const activeGoals = goals.filter((g) => g.status === 'active');
  const recentEntries = journalEntries.slice(0, 2);

  const formattedDate = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });
  const hour = new Date().getHours();

  const handleNextAffirmation = () => {
    setCurrentAffirmationIndex((prev) => (prev + 1) % DAILY_AFFIRMATIONS.length);
  };

  return (
    <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-8 pb-20 pt-1 sm:pt-2">
      {/* Left Column (Primary Focus: Affirmation, Intentions & Journal CTA) */}
      <div className="lg:col-span-7 space-y-6">
        {/* Date & Welcoming Context */}
        <div className="flex items-center justify-between px-1">
          <div>
            <p className="text-xs font-medium text-manifest-inkMuted capitalize">
              {formattedDate}
            </p>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-manifest-ink flex items-center gap-2 mt-0.5">
              {hour < 12 ? (
                <CloudSun className="w-5 h-5 text-amber-500 inline" />
              ) : hour < 20 ? (
                <Sun className="w-5 h-5 text-amber-500 inline" />
              ) : (
                <Moon className="w-5 h-5 text-manifest-lavender inline" />
              )}
              {activeScope === 'facu'
                ? 'Santuario de Facu'
                : activeScope === 'maia'
                ? 'Santuario de Maia'
                : 'Espacio de Facu & Maia'}
            </h2>
          </div>

          {/* Energy mood picker button */}
          <div className="flex items-center gap-1 p-1 rounded-2xl glass-pill">
            {MOODS.map((m) => {
              const Icon = m.icon;
              const isSelected = selectedMood === m.type;
              return (
                <button
                  key={m.type}
                  onClick={() => setSelectedMood(m.type)}
                  title={m.label}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-transform ${
                    isSelected
                      ? 'scale-110 bg-white text-manifest-ink shadow-sm'
                      : 'opacity-60 hover:opacity-100 text-manifest-inkMuted'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Luminous Daily Affirmation Card (Liquid Glass Aura) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-3xl p-6 sm:p-7 glass-card border border-white/95 shadow-liquid"
        >
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-gradient-to-br from-manifest-pink/40 via-manifest-lavender/40 to-transparent blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-gradient-to-tr from-manifest-celeste/40 via-manifest-mint/30 to-transparent blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-manifest-inkMuted/90 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-manifest-auraPurple" />
                Afirmación Consciente
              </span>
              <button
                onClick={handleNextAffirmation}
                className="p-1.5 rounded-full hover:bg-white/80 text-manifest-inkMuted hover:text-manifest-ink transition-colors"
                title="Inspirar otra afirmación"
                aria-label="Cambiar afirmación"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="font-serif text-lg sm:text-2xl font-medium text-manifest-ink leading-relaxed italic">
              «{DAILY_AFFIRMATIONS[currentAffirmationIndex]}»
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-white/60 text-xs">
              <span className="text-manifest-inkMuted font-medium">
                {hour < 12 ? 'Intención matutina' : hour < 20 ? 'Presencia en la tarde' : 'Gratitud nocturna'}
              </span>
              <button
                onClick={() => setActiveTab('diario')}
                className="font-medium text-manifest-ink hover:text-manifest-auraPurple flex items-center gap-1.5 transition-colors"
              >
                <span>Escribir en el diario</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick Action: Start Journal Entry */}
        <div className="p-4 sm:p-5 rounded-3xl glass-card flex items-center justify-between gap-4 border border-white/90">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-manifest-peach via-manifest-pink to-manifest-lavender flex items-center justify-center shrink-0 shadow-sm">
              <PenLine className="w-5 h-5 text-manifest-ink" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-manifest-ink">
                Registrar pensamientos
              </h4>
              <p className="text-xs text-manifest-inkMuted">
                Gratitud, manifestación, sincronías o escritura libre
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('diario')}
            className="px-4 py-2 rounded-2xl primary-gradient-btn text-xs font-semibold shrink-0"
          >
            Escribir
          </button>
        </div>

        {/* Active Intentions / Goals Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-manifest-inkMuted flex items-center gap-1.5">
              <Target className="w-4 h-4 text-manifest-ink" />
              Intenciones en Movimiento
            </h3>
            <button
              onClick={() => setActiveTab('objetivos')}
              className="text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink transition-colors"
            >
              Ver todas ({activeGoals.length})
            </button>
          </div>

          {activeGoals.length === 0 ? (
            <div className="p-5 rounded-3xl glass-card text-center space-y-2 border border-white/80">
              <p className="text-xs text-manifest-inkMuted">
                Aún no tienes intenciones activas. Define tu primera meta con acciones tangibles.
              </p>
              <button
                onClick={() => setActiveTab('objetivos')}
                className="text-xs font-medium text-manifest-auraPurple underline underline-offset-4"
              >
                + Plantar una nueva intención
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeGoals.slice(0, 2).map((goal) => {
                const progress = getGoalProgress(goal.id);
                return (
                  <div
                    key={goal.id}
                    onClick={() => setActiveTab('objetivos')}
                    className="p-4 rounded-2xl glass-card-interactive cursor-pointer border border-white/90 space-y-2.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-manifest-lavender/50 text-manifest-ink">
                          {goal.category}
                        </span>
                        <span className="text-xs font-semibold text-manifest-ink">
                          {progress}%
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-manifest-ink mt-2">
                        {goal.title}
                      </h4>
                      <p className="text-xs text-manifest-inkMuted line-clamp-1 mt-0.5">
                        {goal.motivation}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-manifest-lavender/30 rounded-full overflow-hidden mt-2">
                      <motion.div
                        className="h-full bg-gradient-to-r from-manifest-pink via-manifest-lavender to-manifest-celeste rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Column (Secondary Bento: Agenda, Sincronías & Sanctuary Guidance) */}
      <div className="lg:col-span-5 space-y-5">
        {/* Today's Agenda Commitments */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-manifest-inkMuted flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-manifest-ink" />
              Compromisos de Hoy
            </h3>
            <button
              onClick={() => setActiveTab('agenda')}
              className="text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink transition-colors"
            >
              Ver agenda ({todayEvents.length})
            </button>
          </div>

          {todayEvents.length === 0 ? (
            <div className="p-5 rounded-3xl glass-card text-center space-y-2 border border-white/80">
              <p className="text-xs text-manifest-inkMuted">
                No tienes actividades programadas para hoy. Un momento perfecto para estar en calma.
              </p>
              <button
                onClick={() => setActiveTab('agenda')}
                className="text-xs font-medium text-manifest-auraPurple underline underline-offset-4"
              >
                + Añadir un compromiso consciente
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {todayEvents.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => toggleAgendaEvent(evt.id)}
                  className="p-3.5 rounded-2xl glass-card-interactive flex items-center justify-between cursor-pointer border border-white/90"
                >
                  <div className="flex items-center gap-3">
                    <button className="text-manifest-inkMuted hover:text-manifest-ink shrink-0">
                      {evt.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Circle className="w-5 h-5 text-manifest-lavender" />
                      )}
                    </button>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          evt.completed ? 'line-through text-manifest-inkLight' : 'text-manifest-ink'
                        }`}
                      >
                        {evt.title}
                      </p>
                      {evt.time && (
                        <span className="text-[11px] text-manifest-inkMuted">
                          Hora: {evt.time}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Synchronicity Sign Breadcrumb */}
        {manifestationSigns.length > 0 && (
          <div
            onClick={() => setActiveTab('espacio')}
            className="p-4 rounded-3xl glass-card-interactive cursor-pointer border border-white/90 flex items-center justify-between gap-3 shadow-glass"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-manifest-sky/50 flex items-center justify-center shrink-0">
                <Compass className="w-4 h-4 text-manifest-auraPurple" />
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-manifest-inkMuted/80 block">
                  Última señal en el camino
                </span>
                <p className="text-xs font-semibold text-manifest-ink line-clamp-1">
                  {manifestationSigns[0].title}
                </p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-manifest-inkMuted shrink-0" />
          </div>
        )}

        {/* Sanctuary Guidance Pill */}
        <div className="p-5 rounded-3xl glass-pill border border-white/80 flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-2xl bg-manifest-butter/70 flex items-center justify-center shrink-0 mt-0.5">
            <Heart className="w-4 h-4 text-manifest-ink" />
          </div>
          <p className="text-xs text-manifest-ink leading-relaxed">
            Recuerda: la constancia no requiere perfección, sino el amor de regresar a tu centro cada día.
          </p>
        </div>
      </div>
    </div>
  );
};
