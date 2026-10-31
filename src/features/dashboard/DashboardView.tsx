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
  BookOpen,
  Plus,
  Flame,
  X,
  Check,
  Tag,
} from 'lucide-react';
import { UserScopeSwitcher } from '@/components/layout/UserScopeSwitcher';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MoodType, UserScope } from '@/types';
import {
  Sparkles as SparklesIcon,
  Wind as WindIcon,
  Lightbulb as LightbulbIcon,
  Flower2 as Flower2Icon,
  Moon as MoonIcon,
} from 'lucide-react';

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

const AFFIRMATION_CATEGORIES = [
  'Abundancia',
  'Certeza & Fe',
  'Amor & Vínculo',
  'Paz & Claridad',
  'Éxito & Proyectos',
  'Salud & Energía',
];

export const DashboardView: React.FC = () => {
  const {
    settings,
    activeScope,
    setActiveTab,
    openJournalEditor,
    goals,
    getGoalProgress,
    agendaEvents,
    toggleAgendaEvent,
    journalEntries,
    manifestationSigns,
    successStories,
    affirmations,
    incrementAffirmationRepeat,
    saveAffirmation,
  } = useAppStore();

  const [selectedMood, setSelectedMood] = useState<MoodType>('radiant');

  // Affirmations interaction & creation state
  const [pulsingAffirmationId, setPulsingAffirmationId] = useState<string | null>(null);
  const [isNewAffirmationModalOpen, setIsNewAffirmationModalOpen] = useState(false);
  const [newAffirmationText, setNewAffirmationText] = useState('');
  const [newAffirmationCategory, setNewAffirmationCategory] = useState('Abundancia');
  const [newAffirmationScope, setNewAffirmationScope] = useState<UserScope>(activeScope);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayEvents = agendaEvents.filter((e) => e.date === todayStr);
  const activeGoals = goals.filter((g) => g.status === 'active');
  const recentEntries = journalEntries.slice(0, 3);
  const topAffirmations = affirmations.slice(0, 3);

  const formattedDate = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });
  const hour = new Date().getHours();

  const handleRepeatAffirmation = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    incrementAffirmationRepeat(id);
    setPulsingAffirmationId(id);
    setTimeout(() => {
      setPulsingAffirmationId(null);
    }, 500);
  };

  const handleCreateAffirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAffirmationText.trim()) return;

    const author =
      newAffirmationScope === 'facu' ? 'Facu' : newAffirmationScope === 'maia' ? 'Maia' : 'Facu & Maia';

    saveAffirmation({
      id: `aff-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: newAffirmationScope,
      author,
      text: newAffirmationText.trim(),
      repeatCount: 1,
      category: newAffirmationCategory,
      createdAt: new Date().toISOString(),
      lastRepeatedAt: new Date().toISOString(),
    });

    setNewAffirmationText('');
    setIsNewAffirmationModalOpen(false);
  };

  const currentMoodConfig = MOODS.find((m) => m.type === selectedMood);
  const SelectedMoodIcon = currentMoodConfig?.icon || SparklesIcon;

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-8 pb-16 sm:pb-20 pt-1">
      {/* Left Column (Primary Focus: Affirmations, Journal Entries, Intentions) */}
      <div className="lg:col-span-7 space-y-4 sm:space-y-6">
        {/* Date & Welcoming Context */}
        <div className="flex items-center justify-between px-1">
          <div>
            <p className="text-[11px] sm:text-xs font-medium text-manifest-inkMuted capitalize">
              {formattedDate}
            </p>
            <h2 className="text-lg sm:text-2xl font-serif font-bold text-manifest-ink flex items-center gap-2 mt-0.5">
              {hour < 12 ? (
                <CloudSun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 inline" />
              ) : hour < 20 ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 inline" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-manifest-lavender inline" />
              )}
              <span>
                {hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'},{' '}
                {activeScope === 'facu' ? 'Facu' : activeScope === 'maia' ? 'Maia' : 'Facu & Maia'}
              </span>
            </h2>
          </div>

          {/* Energy mood capsule button */}
          <button
            onClick={() => {
              const idx = MOODS.findIndex((m) => m.type === selectedMood);
              const next = MOODS[(idx + 1) % MOODS.length];
              setSelectedMood(next.type);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-2xl glass-pill text-xs font-medium text-manifest-ink shadow-sm active:scale-95 transition-all"
            title="Pulsar para cambiar estado de presencia"
          >
            <SelectedMoodIcon className="w-3.5 h-3.5 text-manifest-auraPurple" />
            <span className="hidden xs:inline">{currentMoodConfig?.label || 'Serena'}</span>
          </button>
        </div>

        {/* SECCIÓN 1: Afirmaciones Conscientes (Primeras 3 con Contador Táctil de Repetición) */}
        <div className="space-y-2.5 sm:space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-manifest-ink flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-manifest-auraPurple" />
                Afirmaciones de Poder
              </h3>
              <p className="text-[10px] sm:text-[11px] text-manifest-inkMuted">
                Toca para sumar repeticiones a tu mantra vivo (+1)
              </p>
            </div>
            <button
              onClick={() => {
                setNewAffirmationScope(activeScope);
                setIsNewAffirmationModalOpen(true);
              }}
              className="flex items-center gap-1 px-3 py-1 rounded-xl primary-gradient-btn text-xs font-semibold shadow-sm shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva</span>
            </button>
          </div>

          {topAffirmations.length === 0 ? (
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl glass-card text-center space-y-2 border border-white/80">
              <p className="text-xs text-manifest-inkMuted">
                Aún no tienes afirmaciones registradas en este espacio.
              </p>
              <button
                onClick={() => {
                  setNewAffirmationScope(activeScope);
                  setIsNewAffirmationModalOpen(true);
                }}
                className="text-xs font-medium text-manifest-auraPurple underline underline-offset-4"
              >
                + Crear primera afirmación
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
              {topAffirmations.map((aff) => {
                const isPulsing = pulsingAffirmationId === aff.id;
                return (
                  <motion.div
                    key={aff.id}
                    layout
                    whileTap={{ scale: 0.985 }}
                    onClick={() => handleRepeatAffirmation(aff.id)}
                    className={`relative overflow-hidden p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl glass-card-interactive cursor-pointer border border-white/95 shadow-liquid space-y-2.5 sm:space-y-3 transition-all ${
                      isPulsing ? 'ring-2 ring-manifest-auraPurple/70 bg-white/95 scale-[1.01]' : ''
                    }`}
                  >
                    {/* Background subtle glowing aura */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-manifest-pink/30 via-manifest-lavender/30 to-transparent blur-xl pointer-events-none" />

                    <div className="relative z-10 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {aff.category && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-manifest-lavender/50 text-manifest-ink">
                            {aff.category}
                          </span>
                        )}
                        {aff.userId === 'shared' ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-manifest-pink/60 to-manifest-celeste/60 text-manifest-ink border border-white">
                            ✨ Juntos
                          </span>
                        ) : (
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-white/70 text-manifest-inkMuted">
                            {aff.author || (aff.userId === 'facu' ? 'Facu' : 'Maia')}
                          </span>
                        )}
                      </div>

                      {/* Repetition Button / Counter Pill */}
                      <button
                        type="button"
                        onClick={(e) => handleRepeatAffirmation(aff.id, e)}
                        className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-2xl transition-all shadow-sm ${
                          isPulsing
                            ? 'bg-manifest-lavender text-manifest-ink scale-105 shadow-md ring-2 ring-manifest-auraPurple'
                            : 'bg-white/90 hover:bg-white text-manifest-ink border border-white'
                        }`}
                        title="Pulsar para sumar una repetición"
                      >
                        <Flame
                          className={`w-3.5 h-3.5 transition-colors ${
                            aff.repeatCount > 0 ? 'text-amber-500 fill-amber-400' : 'text-manifest-inkMuted'
                          }`}
                        />
                        <span className="text-xs font-bold font-mono text-manifest-ink">
                          {aff.repeatCount}
                        </span>
                        <span className="text-[10px] font-semibold text-manifest-inkMuted hidden min-[360px]:inline">
                          {aff.repeatCount === 1 ? 'vez' : 'veces'}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-manifest-lavender/50 text-manifest-auraPurple">
                          +1
                        </span>
                      </button>
                    </div>

                    <p className="relative z-10 font-serif text-sm sm:text-base font-medium text-manifest-ink leading-relaxed italic">
                      «{aff.text}»
                    </p>

                    <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/60 text-[10px] sm:text-[11px] text-manifest-inkMuted">
                      <span>Toca la tarjeta al repetir tu mantra</span>
                      <span className="text-manifest-auraPurple font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        +1 Repetir
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Action: Start Journal Entry */}
        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl glass-card flex items-center justify-between gap-3 sm:gap-4 border border-white/90 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-manifest-peach via-manifest-pink to-manifest-lavender flex items-center justify-center shrink-0 shadow-sm">
              <PenLine className="w-4 h-4 sm:w-5 sm:h-5 text-manifest-ink" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-manifest-ink">
                Registrar en el Diario
              </h4>
              <p className="text-[10px] sm:text-xs text-manifest-inkMuted line-clamp-1">
                Avances de manifestación, señales 11:11, gratitud o sincronías
              </p>
            </div>
          </div>
          <button
            onClick={() => openJournalEditor('progress')}
            className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl primary-gradient-btn text-xs font-semibold shrink-0"
          >
            Escribir
          </button>
        </div>

        {/* SECCIÓN 2: Entradas Recientes del Diario (3 primeras más recientes) */}
        <div className="space-y-2.5 sm:space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-manifest-ink flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-manifest-ink" />
                Diario Reciente
              </h3>
              <p className="text-[10px] sm:text-[11px] text-manifest-inkMuted">
                Últimos avances, señales y vivencias plasmadas
              </p>
            </div>
            <button
              onClick={() => setActiveTab('diario')}
              className="text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink transition-colors flex items-center gap-1"
            >
              <span>Ver todas ({journalEntries.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {recentEntries.length === 0 ? (
            <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl glass-card text-center space-y-2 border border-white/80">
              <p className="text-xs text-manifest-inkMuted">
                Aún no tienes entradas en este diario. Tómate un momento para volcar tus primeras palabras.
              </p>
              <button
                onClick={() => openJournalEditor('progress')}
                className="text-xs font-medium text-manifest-auraPurple underline underline-offset-4"
              >
                + Escribir primera entrada
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              {recentEntries.map((entry) => {
                const formattedEntryDate = format(new Date(entry.createdAt), "d 'de' MMMM", { locale: es });
                const typeLabels: Record<string, { label: string; color: string }> = {
                  progress: { label: 'Avance', color: 'bg-manifest-mint/50' },
                  manifestation: { label: 'Manifestación', color: 'bg-manifest-lavender/50' },
                  sign: { label: 'Señal', color: 'bg-manifest-sky/50' },
                  gratitude: { label: 'Gratitud', color: 'bg-manifest-pink/50' },
                  reflection: { label: 'Reflexión', color: 'bg-manifest-celeste/50' },
                  free: { label: 'Libre', color: 'bg-manifest-butter/50' },
                };
                const config = typeLabels[entry.entryType] || { label: 'Diario', color: 'bg-white/80' };

                return (
                  <div
                    key={entry.id}
                    onClick={() => setActiveTab('diario')}
                    className="p-3 sm:p-4 rounded-2xl glass-card-interactive cursor-pointer border border-white/90 space-y-1.5 flex flex-col justify-between hover:scale-[1.01] transition-transform"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${config.color} text-manifest-ink`}>
                          {config.label}
                        </span>
                        <span className="text-[10px] text-manifest-inkMuted">
                          {formattedEntryDate}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-serif font-bold text-manifest-ink line-clamp-1">
                        {entry.title}
                      </h4>

                      <p className="text-[11px] text-manifest-inkMuted line-clamp-1 sm:line-clamp-2 leading-relaxed">
                        {entry.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-white/50 text-[10px] text-manifest-inkMuted">
                      <span>
                        {entry.userId === 'shared' ? '✨ Juntos' : entry.author || (entry.userId === 'facu' ? 'Facu' : 'Maia')}
                      </span>
                      <span className="text-manifest-auraPurple font-medium">Leer →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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

      {/* MODAL: Nueva Afirmación Consciente */}
      <AnimatePresence>
        {isNewAffirmationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-manifest-ink/35 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="w-full max-w-lg rounded-3xl glass-card p-4 sm:p-6 border border-white shadow-liquid space-y-3 sm:space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/70">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-manifest-butter to-manifest-pink flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-manifest-ink" />
                  </div>
                  <div>
                    <h3 className="font-serif text-sm font-bold text-manifest-ink">
                      Nueva Afirmación Consciente
                    </h3>
                    <p className="text-[10px] text-manifest-inkMuted">
                      Un mantra de poder para repetir e interiorizar en tu realidad
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNewAffirmationModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/80 text-manifest-inkMuted hover:text-manifest-ink transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateAffirmation} className="space-y-4">
                {/* Scope selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-manifest-ink block">
                    ¿Para quién es esta afirmación?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewAffirmationScope('facu')}
                      className={`py-2 px-3 rounded-2xl text-xs font-medium transition-all ${
                        newAffirmationScope === 'facu'
                          ? 'bg-manifest-lavender text-manifest-ink font-semibold shadow-sm'
                          : 'bg-white/60 text-manifest-inkMuted hover:bg-white/80'
                      }`}
                    >
                      🌙 Facu
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewAffirmationScope('maia')}
                      className={`py-2 px-3 rounded-2xl text-xs font-medium transition-all ${
                        newAffirmationScope === 'maia'
                          ? 'bg-manifest-pink text-manifest-ink font-semibold shadow-sm'
                          : 'bg-white/60 text-manifest-inkMuted hover:bg-white/80'
                      }`}
                    >
                      🌸 Maia
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewAffirmationScope('shared')}
                      className={`py-2 px-3 rounded-2xl text-xs font-medium transition-all ${
                        newAffirmationScope === 'shared'
                          ? 'bg-gradient-to-r from-manifest-pink/70 to-manifest-celeste/70 text-manifest-ink font-semibold shadow-sm'
                          : 'bg-white/60 text-manifest-inkMuted hover:bg-white/80'
                      }`}
                    >
                      ✨ Juntos
                    </button>
                  </div>
                </div>

                {/* Category selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-manifest-ink block">
                    Categoría
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {AFFIRMATION_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewAffirmationCategory(cat)}
                        className={`text-[11px] px-3 py-1 rounded-full transition-all ${
                          newAffirmationCategory === cat
                            ? 'bg-manifest-ink text-white font-medium'
                            : 'bg-white/70 text-manifest-inkMuted hover:bg-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Affirmation Text */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-manifest-ink block">
                    Frase de Afirmación (en tiempo presente)
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newAffirmationText}
                    onChange={(e) => setNewAffirmationText(e.target.value)}
                    placeholder="Ej: «Merezco recibir con los brazos abiertos la abundancia que el universo tiene para mí»"
                    className="w-full p-3 rounded-2xl glass-input text-xs font-serif italic text-manifest-ink placeholder:text-manifest-inkLight resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/60">
                  <button
                    type="button"
                    onClick={() => setIsNewAffirmationModalOpen(false)}
                    className="px-4 py-2 rounded-2xl glass-pill text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-2xl primary-gradient-btn text-xs font-semibold shadow-sm flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Guardar Afirmación</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
