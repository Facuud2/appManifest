'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store';
import {
  Target,
  Plus,
  CheckCircle2,
  Circle,
  Play,
  Pause,
  Trash2,
  Edit3,
  X,
  Sparkles,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Award,
  Clock,
  Compass,
  Lock,
  Feather,
  Heart,
  Eye,
} from 'lucide-react';
import {
  Goal,
  GoalCategory,
  GoalStatus,
  GoalStep,
  SuccessStory,
  FutureManifestation,
  FutureHorizon,
  UserScope,
} from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const CATEGORIES: { key: GoalCategory; label: string; color: string }[] = [
  { key: 'crecimiento', label: 'Crecimiento', color: 'bg-manifest-lavender/50' },
  { key: 'carrera', label: 'Carrera & Proyecto', color: 'bg-manifest-celeste/50' },
  { key: 'bienestar', label: 'Salud & Bienestar', color: 'bg-manifest-mint/50' },
  { key: 'relaciones', label: 'Amor & Relaciones', color: 'bg-manifest-pink/50' },
  { key: 'abundancia', label: 'Abundancia & Dinero', color: 'bg-manifest-butter/50' },
  { key: 'creatividad', label: 'Creatividad & Arte', color: 'bg-manifest-peach/50' },
];

const HORIZONS: { key: FutureHorizon; label: string }[] = [
  { key: '3_months', label: 'En 3 meses' },
  { key: '6_months', label: 'En 6 meses' },
  { key: '1_year', label: 'En 1 año' },
  { key: '3_years', label: 'En 3 años' },
  { key: 'exact_date', label: 'Fecha exacta' },
];

type MainGoalsSection = 'active_goals' | 'success_stories' | 'future_visions';

export const GoalsView: React.FC = () => {
  const {
    goals,
    goalSteps,
    saveGoal,
    deleteGoal,
    saveGoalStep,
    toggleGoalStep,
    deleteGoalStep,
    getGoalProgress,
    successStories,
    saveSuccessStory,
    deleteSuccessStory,
    futureManifestations,
    saveFutureManifestation,
    deleteFutureManifestation,
    activeScope,
  } = useAppStore();

  const [mainSection, setMainSection] = useState<MainGoalsSection>('active_goals');
  const [activeTabStatus, setActiveTabStatus] = useState<GoalStatus>('active');
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  // Goal Modal State
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [goalScope, setGoalScope] = useState<UserScope>(activeScope);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalCategory, setGoalCategory] = useState<GoalCategory>('bienestar');
  const [goalMotivation, setGoalMotivation] = useState('');
  const [goalTargetDate, setGoalTargetDate] = useState('');

  // Step Input State per goal
  const [newStepTitles, setNewStepTitles] = useState<Record<string, string>>({});

  // Success Story Modal State
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [editingSuccessId, setEditingSuccessId] = useState<string | null>(null);
  const [successScope, setSuccessScope] = useState<UserScope>(activeScope);
  const [successTitle, setSuccessTitle] = useState('');
  const [successStory, setSuccessStory] = useState('');
  const [successSignsInput, setSuccessSignsInput] = useState('');
  const [successSigns, setSuccessSigns] = useState<string[]>([]);
  const [successShift, setSuccessShift] = useState('');
  const [successGratitude, setSuccessGratitude] = useState('');
  const [successDate, setSuccessDate] = useState(new Date().toISOString().split('T')[0]);

  // Future Manifestation Modal State
  const [isFutureModalOpen, setIsFutureModalOpen] = useState(false);
  const [editingFutureId, setEditingFutureId] = useState<string | null>(null);
  const [futureScope, setFutureScope] = useState<UserScope>(activeScope);
  const [futureTitle, setFutureTitle] = useState('');
  const [futureHorizon, setFutureHorizon] = useState<FutureHorizon>('6_months');
  const [futureExactDate, setFutureExactDate] = useState('');
  const [futureVisionText, setFutureVisionText] = useState('');
  const [futureLetter, setFutureLetter] = useState('');
  const [futureIsSealed, setFutureIsSealed] = useState(false);

  // Handlers for Goals
  const handleOpenNewGoal = () => {
    setEditingGoalId(null);
    setGoalScope(activeScope);
    setGoalTitle('');
    setGoalDescription('');
    setGoalCategory('bienestar');
    setGoalMotivation('');
    setGoalTargetDate('');
    setIsGoalModalOpen(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setGoalScope(goal.userId || activeScope);
    setGoalTitle(goal.title);
    setGoalDescription(goal.description);
    setGoalCategory(goal.category);
    setGoalMotivation(goal.motivation);
    setGoalTargetDate(goal.targetDate || '');
    setIsGoalModalOpen(true);
  };

  const handleSaveGoal = () => {
    if (!goalTitle.trim() || !goalMotivation.trim()) return;

    const author =
      goalScope === 'facu' ? 'Facu' : goalScope === 'maia' ? 'Maia' : 'Facu & Maia';

    const goal: Goal = {
      id: editingGoalId || `goal-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId: goalScope,
      author,
      title: goalTitle.trim(),
      description: goalDescription.trim(),
      category: goalCategory,
      motivation: goalMotivation.trim(),
      status: editingGoalId ? goals.find((g) => g.id === editingGoalId)?.status || 'active' : 'active',
      targetDate: goalTargetDate || undefined,
      createdAt: editingGoalId
        ? goals.find((g) => g.id === editingGoalId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
    };

    saveGoal(goal);
    setIsGoalModalOpen(false);
  };

  const handleStatusChange = (goal: Goal, newStatus: GoalStatus) => {
    const updated: Goal = {
      ...goal,
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
    };
    saveGoal(updated);
    if (newStatus === 'completed') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F6C9D9', '#DCCFFF', '#CBE9F8', '#F8EDB9'],
      });
    }
  };

  const handleAddStep = (goalId: string) => {
    const title = newStepTitles[goalId]?.trim();
    if (!title) return;

    const parentGoal = goals.find((g) => g.id === goalId);
    const step: GoalStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      goalId,
      userId: parentGoal?.userId || activeScope,
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    saveGoalStep(step);
    setNewStepTitles({ ...newStepTitles, [goalId]: '' });
  };

  const handleToggleStepWithCelebration = (stepId: string, currentGoalId: string) => {
    toggleGoalStep(stepId);
    setTimeout(() => {
      const steps = goalSteps.filter((s) => s.goalId === currentGoalId);
      const isComplete = steps.length > 0 && steps.every((s) => s.completed || s.id === stepId);
      if (isComplete) {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F6C9D9', '#DCCFFF', '#CBE9F8', '#F8EDB9'],
        });
      }
    }, 100);
  };

  // Handlers for Success Stories
  const handleOpenNewSuccess = (goalSeed?: Goal) => {
    setEditingSuccessId(null);
    setSuccessScope(goalSeed?.userId || activeScope);
    setSuccessTitle(goalSeed ? `Manifesté: ${goalSeed.title}` : '');
    setSuccessStory('');
    setSuccessSigns([]);
    setSuccessSignsInput('');
    setSuccessShift('');
    setSuccessGratitude('');
    setSuccessDate(new Date().toISOString().split('T')[0]);
    setIsSuccessModalOpen(true);
  };

  const handleAddSuccessSign = () => {
    if (!successSignsInput.trim()) return;
    const clean = successSignsInput.trim();
    if (!successSigns.includes(clean)) {
      setSuccessSigns([...successSigns, clean]);
    }
    setSuccessSignsInput('');
  };

  const handleRemoveSuccessSign = (sign: string) => {
    setSuccessSigns(successSigns.filter((s) => s !== sign));
  };

  const handleSaveSuccessStory = () => {
    if (!successTitle.trim() || !successStory.trim()) return;

    const author =
      successScope === 'facu' ? 'Facu' : successScope === 'maia' ? 'Maia' : 'Facu & Maia';

    const story: SuccessStory = {
      id: editingSuccessId || `success-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId: successScope,
      author,
      title: successTitle.trim(),
      manifestedDate: successDate,
      story: successStory.trim(),
      signsEncountered: successSigns,
      mindsetShift: successShift.trim(),
      gratitudeNote: successGratitude.trim(),
      createdAt: new Date().toISOString(),
    };

    saveSuccessStory(story);
    setIsSuccessModalOpen(false);
    confetti({
      particleCount: 80,
      spread: 75,
      origin: { y: 0.5 },
      colors: ['#F6C9D9', '#DCCFFF', '#F8EDB9', '#CBE9F8'],
    });
  };

  // Handlers for Future Manifestations
  const handleOpenNewFuture = () => {
    setEditingFutureId(null);
    setFutureScope(activeScope);
    setFutureTitle('');
    setFutureHorizon('6_months');
    setFutureExactDate('');
    setFutureVisionText('');
    setFutureLetter('');
    setFutureIsSealed(false);
    setIsFutureModalOpen(true);
  };

  const handleSaveFutureManifestation = () => {
    if (!futureTitle.trim() || !futureVisionText.trim()) return;

    const author =
      futureScope === 'facu' ? 'Facu' : futureScope === 'maia' ? 'Maia' : 'Facu & Maia';

    const future: FutureManifestation = {
      id: editingFutureId || `future-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId: futureScope,
      author,
      title: futureTitle.trim(),
      horizon: futureHorizon,
      targetDate: futureHorizon === 'exact_date' ? futureExactDate : undefined,
      visionText: futureVisionText.trim(),
      letterToFutureSelf: futureLetter.trim() || undefined,
      isSealed: futureIsSealed,
      createdAt: new Date().toISOString(),
    };

    saveFutureManifestation(future);
    setIsFutureModalOpen(false);
  };

  const filteredGoals = goals.filter((g) => g.status === activeTabStatus);

  return (
    <div className="space-y-6 pb-28 pt-2">
      {/* Top Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-serif font-bold text-manifest-ink flex items-center gap-2">
            <Target className="w-5 h-5 text-manifest-auraPurple" />
            Portal de Manifestación
          </h2>
          <p className="text-xs text-manifest-inkMuted">
            Acción tangible, victorias cumplidas y visiones de futuro
          </p>
        </div>

        {mainSection === 'active_goals' && (
          <button
            onClick={handleOpenNewGoal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl primary-gradient-btn text-xs font-semibold shadow-glass"
          >
            <Plus className="w-4 h-4" />
            Intención
          </button>
        )}

        {mainSection === 'success_stories' && (
          <button
            onClick={() => handleOpenNewSuccess()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl primary-gradient-btn text-xs font-semibold shadow-glass"
          >
            <Plus className="w-4 h-4" />
            Logro
          </button>
        )}

        {mainSection === 'future_visions' && (
          <button
            onClick={handleOpenNewFuture}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl primary-gradient-btn text-xs font-semibold shadow-glass"
          >
            <Plus className="w-4 h-4" />
            Visión
          </button>
        )}
      </div>

      {/* 3 Main Sections Segmented Bar */}
      <div className="flex p-1 rounded-2xl glass-card border border-white/90 shadow-glass">
        <button
          onClick={() => setMainSection('active_goals')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            mainSection === 'active_goals'
              ? 'bg-manifest-ink text-white shadow-sm'
              : 'text-manifest-inkMuted hover:text-manifest-ink'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>En Curso</span>
        </button>

        <button
          onClick={() => setMainSection('success_stories')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            mainSection === 'success_stories'
              ? 'bg-manifest-ink text-white shadow-sm'
              : 'text-manifest-inkMuted hover:text-manifest-ink'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Historias de Éxito ({successStories.length})</span>
        </button>

        <button
          onClick={() => setMainSection('future_visions')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            mainSection === 'future_visions'
              ? 'bg-manifest-ink text-white shadow-sm'
              : 'text-manifest-inkMuted hover:text-manifest-ink'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Futuras ({futureManifestations.length})</span>
        </button>
      </div>

      {/* SECTION 1: ACTIVE GOALS & TANGIBLE STEPS */}
      {mainSection === 'active_goals' && (
        <div className="space-y-4">
          {/* Status filter: Activas, Pausadas, Completadas */}
          <div className="flex p-1 rounded-2xl glass-card border border-white/80">
            {(['active', 'paused', 'completed'] as GoalStatus[]).map((st) => {
              const isSel = activeTabStatus === st;
              const label = st === 'active' ? 'Activas' : st === 'paused' ? 'En pausa' : 'Completadas';
              const count = goals.filter((g) => g.status === st).length;

              return (
                <button
                  key={st}
                  onClick={() => setActiveTabStatus(st)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-xl transition-all ${
                    isSel
                      ? 'bg-manifest-ink text-white shadow-sm'
                      : 'text-manifest-inkMuted hover:text-manifest-ink'
                  }`}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>

          {filteredGoals.length === 0 ? (
            <div className="p-8 rounded-3xl glass-card text-center space-y-3 border border-white/80">
              <div className="w-12 h-12 mx-auto rounded-full bg-manifest-celeste/40 flex items-center justify-center text-manifest-ink">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-base font-bold text-manifest-ink">
                {activeTabStatus === 'active'
                  ? 'Siembra tu primera intención'
                  : `No hay intenciones ${activeTabStatus === 'paused' ? 'en pausa' : 'completadas'}.`}
              </h3>
              <p className="text-xs text-manifest-inkMuted max-w-xs mx-auto leading-relaxed">
                {activeTabStatus === 'active'
                  ? 'Conectar un deseo con acciones tangibles es el verdadero puente hacia su manifestación.'
                  : 'Las metas que alcances o pauses se organizarán en este espacio.'}
              </p>
              {activeTabStatus === 'active' && (
                <button
                  onClick={handleOpenNewGoal}
                  className="px-4 py-2 rounded-2xl primary-gradient-btn text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Definir nueva intención
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGoals.map((goal) => {
                const progress = getGoalProgress(goal.id);
                const steps = goalSteps.filter((s) => s.goalId === goal.id);
                const isExpanded = expandedGoalId === goal.id;
                const catConfig = CATEGORIES.find((c) => c.key === goal.category);

                return (
                  <motion.div
                    key={goal.id}
                    layout
                    className="rounded-3xl glass-card border border-white/95 shadow-glass overflow-hidden"
                  >
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                              catConfig?.color || 'bg-white/80'
                            } text-manifest-ink`}
                          >
                            {catConfig?.label || goal.category}
                          </span>
                          {goal.userId === 'shared' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-manifest-pink/60 to-manifest-celeste/60 text-manifest-ink border border-white">
                              ✨ Juntos
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/70 text-manifest-inkMuted">
                              {goal.author || (goal.userId === 'facu' ? 'Facu' : 'Maia')}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {goal.status === 'active' ? (
                            <button
                              onClick={() => handleStatusChange(goal, 'paused')}
                              className="p-1.5 rounded-full hover:bg-white text-manifest-inkMuted hover:text-manifest-ink"
                              title="Pausar intención"
                            >
                              <Pause className="w-3.5 h-3.5" />
                            </button>
                          ) : goal.status === 'paused' ? (
                            <button
                              onClick={() => handleStatusChange(goal, 'active')}
                              className="p-1.5 rounded-full hover:bg-white text-manifest-inkMuted hover:text-manifest-ink"
                              title="Reactivar intención"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          ) : null}

                          {goal.status !== 'completed' ? (
                            <button
                              onClick={() => handleStatusChange(goal, 'completed')}
                              className="p-1.5 rounded-full hover:bg-white text-manifest-inkMuted hover:text-emerald-600"
                              title="Marcar como cumplida"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenNewSuccess(goal)}
                              className="px-2 py-0.5 rounded-full bg-manifest-butter/70 text-manifest-ink text-[10px] font-semibold flex items-center gap-1"
                              title="Convertir a Historia de Éxito"
                            >
                              <Award className="w-3 h-3 text-amber-600" />
                              <span>Crear Historia</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleEditGoal(goal)}
                            className="p-1.5 rounded-full hover:bg-white text-manifest-inkMuted hover:text-manifest-ink"
                            title="Editar"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => deleteGoal(goal.id)}
                            className="p-1.5 rounded-full hover:bg-white text-manifest-inkMuted hover:text-rose-600"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-serif text-base font-bold text-manifest-ink leading-snug">
                          {goal.title}
                        </h3>
                        <p className="text-xs text-manifest-ink/80 italic mt-1 leading-relaxed">
                          «{goal.motivation}»
                        </p>
                        {goal.description && (
                          <p className="text-xs text-manifest-inkMuted mt-1 leading-relaxed">
                            {goal.description}
                          </p>
                        )}
                      </div>

                      {/* Progress Bar & Percentage */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-manifest-inkMuted font-medium">
                            {steps.filter((s) => s.completed).length} de {steps.length} acciones tangibles
                          </span>
                          <span className="font-bold text-manifest-ink">{progress}%</span>
                        </div>

                        <div className="w-full h-2 bg-manifest-lavender/30 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-manifest-auraPurple/70 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                          />
                        </div>
                      </div>

                      {/* Toggle Steps Accordion Button */}
                      <button
                        onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}
                        className="w-full pt-2 flex items-center justify-center gap-1 text-xs font-semibold text-manifest-inkMuted hover:text-manifest-ink transition-colors border-t border-white/60"
                      >
                        <span>{isExpanded ? 'Ocultar acciones' : 'Ver y añadir acciones'} ({steps.length})</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Steps Accordion Drawer */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="bg-white/40 border-t border-white/70 p-5 space-y-3"
                        >
                          <h4 className="text-xs font-bold text-manifest-ink flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-manifest-auraPurple" />
                            Acciones tangibles para esta meta
                          </h4>

                          <div className="space-y-2">
                            {steps.length === 0 ? (
                              <p className="text-xs text-manifest-inkMuted italic">
                                Aún no has añadido acciones. Añade pequeños pasos fáciles de lograr.
                              </p>
                            ) : (
                              steps.map((st) => (
                                <div
                                  key={st.id}
                                  className="p-2.5 rounded-xl bg-white/70 border border-white flex items-center justify-between gap-2"
                                >
                                  <div
                                    onClick={() => handleToggleStepWithCelebration(st.id, goal.id)}
                                    className="flex items-center gap-2.5 cursor-pointer flex-1"
                                  >
                                    <button className="shrink-0 text-manifest-inkMuted">
                                      {st.completed ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                                      ) : (
                                        <Circle className="w-4 h-4 text-manifest-lavender" />
                                      )}
                                    </button>
                                    <span
                                      className={`text-xs ${
                                        st.completed
                                          ? 'line-through text-manifest-inkLight'
                                          : 'text-manifest-ink font-medium'
                                      }`}
                                    >
                                      {st.title}
                                    </span>
                                  </div>

                                  <button
                                    onClick={() => deleteGoalStep(st.id)}
                                    className="text-manifest-inkMuted hover:text-rose-500 p-1"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>

                          <div className="flex gap-1.5 pt-1">
                            <input
                              type="text"
                              value={newStepTitles[goal.id] || ''}
                              onChange={(e) =>
                                setNewStepTitles({ ...newStepTitles, [goal.id]: e.target.value })
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddStep(goal.id);
                                }
                              }}
                              placeholder="Añadir paso concreto (ej: Enviar portafolio)..."
                              className="flex-1 px-3 py-1.5 rounded-xl glass-input text-xs"
                            />
                            <button
                              onClick={() => handleAddStep(goal.id)}
                              className="px-3 py-1.5 rounded-xl primary-gradient-btn text-xs font-semibold"
                            >
                              Añadir
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: SUCCESS STORIES (HISTORIAS DE ÉXITO) */}
      {mainSection === 'success_stories' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl glass-card border border-white/95 space-y-2">
            <div className="flex items-center gap-2 text-manifest-ink">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="font-serif text-sm font-bold">
                Muro de Evidencias & Manifestaciones Cumplidas
              </h3>
            </div>
            <p className="text-xs text-manifest-inkMuted leading-relaxed">
              Registrar lo que ya se materializó refuerza tu certeza interna. Documenta los detalles que pasaban, las señales previas y el agradecimiento sincero.
            </p>
          </div>

          {successStories.length === 0 ? (
            <div className="p-8 rounded-3xl glass-card text-center space-y-3 border border-white/80">
              <div className="w-12 h-12 mx-auto rounded-full bg-manifest-butter/50 flex items-center justify-center text-manifest-ink">
                <Award className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-serif text-base font-bold text-manifest-ink">
                Aún no has registrado una Historia de Éxito
              </h3>
              <p className="text-xs text-manifest-inkMuted max-w-xs mx-auto leading-relaxed">
                Cuando una intención o un anhelo se cumpla en tu vida, documenta aquí la magia de cómo se desenvolvió.
              </p>
              <button
                onClick={() => handleOpenNewSuccess()}
                className="px-4 py-2 rounded-2xl primary-gradient-btn text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Registrar primer logro
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {successStories.map((story) => (
                <motion.article
                  key={story.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-3xl glass-card border border-white/95 shadow-glass space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-manifest-butter/60 text-amber-900 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      Manifestación Cumplida
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-manifest-inkMuted">
                        {story.manifestedDate}
                      </span>
                      <button
                        onClick={() => deleteSuccessStory(story.id)}
                        className="p-1 rounded-full hover:bg-white text-manifest-inkMuted hover:text-rose-600"
                        title="Eliminar historia"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-serif text-base font-bold text-manifest-ink">
                      {story.title}
                    </h3>
                    <p className="text-xs text-manifest-ink/80 leading-relaxed mt-1 whitespace-pre-line">
                      {story.story}
                    </p>
                  </div>

                  {/* Señales que pasaban en el camino */}
                  {story.signsEncountered && story.signsEncountered.length > 0 && (
                    <div className="p-3 rounded-2xl bg-white/60 border border-white/80 space-y-1.5">
                      <span className="text-[11px] font-semibold text-manifest-ink flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-manifest-auraPurple" />
                        Señales y detalles que aparecían en el camino:
                      </span>
                      <ul className="space-y-1 text-xs text-manifest-inkMuted pl-2">
                        {story.signsEncountered.map((sign, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-manifest-auraPurple font-bold">•</span>
                            <span>{sign}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Giro de mentalidad */}
                  {story.mindsetShift && (
                    <div className="text-xs text-manifest-ink">
                      <strong className="text-manifest-inkMuted">Lo que cambió en mí:</strong>{' '}
                      <span className="italic">{story.mindsetShift}</span>
                    </div>
                  )}

                  {/* Gratitud */}
                  {story.gratitudeNote && (
                    <div className="p-3 rounded-2xl bg-manifest-pink/30 border border-white text-xs text-manifest-ink flex items-start gap-2">
                      <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>{story.gratitudeNote}</span>
                    </div>
                  )}
                </motion.article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: MANIFESTACIONES FUTURAS (FUTURE SCRIPTING) */}
      {mainSection === 'future_visions' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl glass-card border border-white/95 space-y-2">
            <div className="flex items-center gap-2 text-manifest-ink">
              <Sparkles className="w-5 h-5 text-manifest-auraPurple" />
              <h3 className="font-serif text-sm font-bold">
                Scripting de Futuro & Cápsulas de Visión
              </h3>
            </div>
            <p className="text-xs text-manifest-inkMuted leading-relaxed">
              Escribe en tiempo presente cómo se experimenta tu realidad deseada en horizontes futuros. Puedes sellar visiones como cápsulas del tiempo.
            </p>
          </div>

          {futureManifestations.length === 0 ? (
            <div className="p-8 rounded-3xl glass-card text-center space-y-3 border border-white/80">
              <div className="w-12 h-12 mx-auto rounded-full bg-manifest-lavender/50 flex items-center justify-center text-manifest-ink">
                <Feather className="w-6 h-6 text-manifest-ink" />
              </div>
              <h3 className="font-serif text-base font-bold text-manifest-ink">
                Siembra una visión futura
              </h3>
              <p className="text-xs text-manifest-inkMuted max-w-xs mx-auto leading-relaxed">
                Describe un día perfecto dentro de 6 meses o 1 año como si lo estuvieras viviendo hoy mismo.
              </p>
              <button
                onClick={handleOpenNewFuture}
                className="px-4 py-2 rounded-2xl primary-gradient-btn text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Crear visión futura
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {futureManifestations.map((future) => {
                const horizonLabel = HORIZONS.find((h) => h.key === future.horizon)?.label || 'Futuro';

                return (
                  <motion.article
                    key={future.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-3xl glass-card border border-white/95 shadow-glass space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-manifest-lavender/60 text-manifest-ink">
                          {horizonLabel}
                        </span>
                        {future.isSealed && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Cápsula sellada
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => deleteFutureManifestation(future.id)}
                        className="p-1 rounded-full hover:bg-white text-manifest-inkMuted hover:text-rose-600"
                        title="Eliminar visión"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <h3 className="font-serif text-base font-bold text-manifest-ink">
                        {future.title}
                      </h3>
                      <p className="text-xs text-manifest-ink/80 leading-relaxed mt-1 italic font-serif whitespace-pre-line">
                        «{future.visionText}»
                      </p>
                    </div>

                    {future.letterToFutureSelf && (
                      <div className="p-3 rounded-2xl bg-white/60 border border-white/80 space-y-1 text-xs">
                        <span className="font-semibold text-manifest-ink flex items-center gap-1">
                          <Feather className="w-3 h-3 text-manifest-auraPurple" />
                          Carta para mi Yo del futuro:
                        </span>
                        <p className="text-manifest-inkMuted leading-relaxed">
                          {future.letterToFutureSelf}
                        </p>
                      </div>
                    )}
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD / EDIT GOAL */}
      <AnimatePresence>
        {isGoalModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-manifest-ink/35 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-sm rounded-3xl glass-card p-5 border border-white shadow-liquid space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/70">
                <h3 className="font-serif text-sm font-bold text-manifest-ink">
                  {editingGoalId ? 'Editar Intención' : 'Nueva Intención Consciente'}
                </h3>
                <button
                  onClick={() => setIsGoalModalOpen(false)}
                  className="p-1.5 rounded-full glass-pill hover:bg-white text-manifest-inkMuted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-manifest-inkMuted block mb-1">
                    Espacio de la intención
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-white/60 border border-white/80">
                    <button
                      type="button"
                      onClick={() => setGoalScope(activeScope === 'maia' ? 'maia' : 'facu')}
                      className={`py-1 px-2 rounded-lg text-[11px] font-medium transition-all text-center ${
                        goalScope !== 'shared'
                          ? 'bg-white shadow-sm text-manifest-ink font-semibold'
                          : 'text-manifest-inkMuted hover:bg-white/40'
                      }`}
                    >
                      {activeScope === 'maia' ? '🌸 Intención de Maia' : '🌙 Intención de Facu'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setGoalScope('shared')}
                      className={`py-1 px-2 rounded-lg text-[11px] font-medium transition-all text-center ${
                        goalScope === 'shared'
                          ? 'bg-gradient-to-r from-manifest-pink/70 via-manifest-lavender/70 to-manifest-celeste/70 shadow-sm text-manifest-ink font-semibold'
                          : 'text-manifest-inkMuted hover:bg-white/40'
                      }`}
                    >
                      ✨ Juntos (Facu & Maia)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-manifest-inkMuted block mb-1">
                    Nombre de la intención *
                  </label>
                  <input
                    type="text"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    placeholder="Ej: Cultivar mi nuevo proyecto profesional..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-serif font-bold text-manifest-ink"
                  />
                </div>

                <div>
                  <label className="font-semibold text-manifest-inkMuted block mb-1">
                    Área / Categoría *
                  </label>
                  <select
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value as GoalCategory)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-manifest-inkMuted block mb-1">
                    Tu «Por qué» / Motivación íntima *
                  </label>
                  <textarea
                    rows={2}
                    value={goalMotivation}
                    onChange={(e) => setGoalMotivation(e.target.value)}
                    placeholder="¿Por qué es importante para ti? ¿Cómo transformará tu vida?"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-manifest-inkMuted block mb-1">
                    Descripción o visión ampliada (opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={goalDescription}
                    onChange={(e) => setGoalDescription(e.target.value)}
                    placeholder="Describe los detalles del escenario deseado..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-manifest-inkMuted block mb-1">
                    Fecha objetivo (opcional)
                  </label>
                  <input
                    type="date"
                    value={goalTargetDate}
                    onChange={(e) => setGoalTargetDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-white/70 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-manifest-inkMuted hover:text-manifest-ink"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveGoal}
                  disabled={!goalTitle.trim() || !goalMotivation.trim()}
                  className="px-4 py-1.5 rounded-xl primary-gradient-btn text-xs font-semibold disabled:opacity-50"
                >
                  {editingGoalId ? 'Guardar Cambios' : 'Anclar Intención'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD / EDIT SUCCESS STORY */}
      <AnimatePresence>
        {isSuccessModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-manifest-ink/35 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-sm rounded-3xl glass-card p-5 border border-white shadow-liquid space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/70">
                <h3 className="font-serif text-sm font-bold text-manifest-ink flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  Nueva Historia de Éxito
                </h3>
                <button
                  onClick={() => setIsSuccessModalOpen(false)}
                  className="p-1.5 rounded-full glass-pill text-manifest-inkMuted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-manifest-inkMuted block mb-1">
                    Espacio de la manifestación
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-white/60 border border-white/80">
                    <button
                      type="button"
                      onClick={() => setSuccessScope(activeScope === 'maia' ? 'maia' : 'facu')}
                      className={`py-1 px-2 rounded-lg text-[11px] font-medium transition-all text-center ${
                        successScope !== 'shared'
                          ? 'bg-white shadow-sm text-manifest-ink font-semibold'
                          : 'text-manifest-inkMuted hover:bg-white/40'
                      }`}
                    >
                      {activeScope === 'maia' ? '🌸 Éxito de Maia' : '🌙 Éxito de Facu'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSuccessScope('shared')}
                      className={`py-1 px-2 rounded-lg text-[11px] font-medium transition-all text-center ${
                        successScope === 'shared'
                          ? 'bg-gradient-to-r from-manifest-pink/70 via-manifest-lavender/70 to-manifest-celeste/70 shadow-sm text-manifest-ink font-semibold'
                          : 'text-manifest-inkMuted hover:bg-white/40'
                      }`}
                    >
                      ✨ Juntos (Facu & Maia)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-manifest-inkMuted block mb-1">
                    ¿Qué se materializó? *
                  </label>
                  <input
                    type="text"
                    value={successTitle}
                    onChange={(e) => setSuccessTitle(e.target.value)}
                    placeholder="Ej: El contrato de trabajo con horario flexible..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-bold text-manifest-ink"
                  />
                </div>

                <div>
                  <label className="font-semibold text-manifest-inkMuted block mb-1">
                    Fecha en que se cumplió *
                  </label>
                  <input
                    type="date"
                    value={successDate}
                    onChange={(e) => setSuccessDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-manifest-inkMuted block mb-1">
                    ¿Cómo sucedió? La historia real *
                  </label>
                  <textarea
                    rows={3}
                    value={successStory}
                    onChange={(e) => setSuccessStory(e.target.value)}
                    placeholder="Detalles de los giros inesperados y de cómo el universo organizó el camino..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-manifest-inkMuted block mb-1">
                    Detalles y señales previas que pasaban
                  </label>
                  <div className="flex gap-1.5 mb-2 flex-wrap">
                    {successSigns.map((s, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-manifest-lavender/50 text-manifest-ink flex items-center gap-1"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() => handleRemoveSuccessSign(s)}
                          className="hover:text-rose-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={successSignsInput}
                      onChange={(e) => setSuccessSignsInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSuccessSign();
                        }
                      }}
                      placeholder="Ej: Vi el número 777, soñé con esa llamada..."
                      className="flex-1 px-3 py-1.5 rounded-xl glass-input text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddSuccessSign}
                      className="px-3 py-1.5 rounded-xl glass-pill font-semibold text-xs text-manifest-ink"
                    >
                      Añadir
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-manifest-inkMuted block mb-1">
                    ¿Qué cambió en tu energía antes de recibirlo?
                  </label>
                  <input
                    type="text"
                    value={successShift}
                    onChange={(e) => setSuccessShift(e.target.value)}
                    placeholder="Ej: Solté la ansiedad de controlar las fechas..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-manifest-inkMuted block mb-1">
                    Nota íntima de gratitud
                  </label>
                  <input
                    type="text"
                    value={successGratitude}
                    onChange={(e) => setSuccessGratitude(e.target.value)}
                    placeholder="Gracias por recordarme que merezco cosas hermosas..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-white/70 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSuccessModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-manifest-inkMuted"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveSuccessStory}
                  disabled={!successTitle.trim() || !successStory.trim()}
                  className="px-4 py-1.5 rounded-xl primary-gradient-btn text-xs font-semibold disabled:opacity-50"
                >
                  Anclar Historia
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD / EDIT FUTURE MANIFESTATION */}
      <AnimatePresence>
        {isFutureModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-manifest-ink/35 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-sm rounded-3xl glass-card p-5 border border-white shadow-liquid space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/70">
                <h3 className="font-serif text-sm font-bold text-manifest-ink flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-manifest-auraPurple" />
                  Nueva Manifestación Futura
                </h3>
                <button
                  onClick={() => setIsFutureModalOpen(false)}
                  className="p-1.5 rounded-full glass-pill text-manifest-inkMuted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-manifest-inkMuted block mb-1">
                    Espacio de la visión futura
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-white/60 border border-white/80">
                    <button
                      type="button"
                      onClick={() => setFutureScope(activeScope === 'maia' ? 'maia' : 'facu')}
                      className={`py-1 px-2 rounded-lg text-[11px] font-medium transition-all text-center ${
                        futureScope !== 'shared'
                          ? 'bg-white shadow-sm text-manifest-ink font-semibold'
                          : 'text-manifest-inkMuted hover:bg-white/40'
                      }`}
                    >
                      {activeScope === 'maia' ? '🌸 Visión de Maia' : '🌙 Visión de Facu'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFutureScope('shared')}
                      className={`py-1 px-2 rounded-lg text-[11px] font-medium transition-all text-center ${
                        futureScope === 'shared'
                          ? 'bg-gradient-to-r from-manifest-pink/70 via-manifest-lavender/70 to-manifest-celeste/70 shadow-sm text-manifest-ink font-semibold'
                          : 'text-manifest-inkMuted hover:bg-white/40'
                      }`}
                    >
                      ✨ Juntos (Facu & Maia)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-manifest-inkMuted block mb-1">
                    Título de la visión futura *
                  </label>
                  <input
                    type="text"
                    value={futureTitle}
                    onChange={(e) => setFutureTitle(e.target.value)}
                    placeholder="Ej: Mi estudio luminoso junto al jardín..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-bold text-manifest-ink"
                  />
                </div>

                <div>
                  <label className="font-semibold text-manifest-inkMuted block mb-1">
                    Horizonte temporal
                  </label>
                  <select
                    value={futureHorizon}
                    onChange={(e) => setFutureHorizon(e.target.value as FutureHorizon)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  >
                    {HORIZONS.map((h) => (
                      <option key={h.key} value={h.key}>
                        {h.label}
                      </option>
                    ))}
                  </select>
                </div>

                {futureHorizon === 'exact_date' && (
                  <div>
                    <label className="font-semibold text-manifest-inkMuted block mb-1">
                      Fecha de destino
                    </label>
                    <input
                      type="date"
                      value={futureExactDate}
                      onChange={(e) => setFutureExactDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl glass-input text-xs"
                    />
                  </div>
                )}

                <div>
                  <label className="font-semibold text-manifest-inkMuted block mb-1">
                    Visión sensorial en tiempo presente *
                  </label>
                  <textarea
                    rows={4}
                    value={futureVisionText}
                    onChange={(e) => setFutureVisionText(e.target.value)}
                    placeholder="Escribe como si ya estuviera sucediendo: qué ves, qué sientes en tu cuerpo, qué aroma hay en el ambiente..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none font-serif leading-relaxed"
                  />
                </div>

                <div>
                  <label className="font-semibold text-manifest-inkMuted block mb-1">
                    Carta breve a tu Yo del futuro (opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={futureLetter}
                    onChange={(e) => setFutureLetter(e.target.value)}
                    placeholder="Un recordatorio o abrazo de amor para cuando leas esto..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="sealCheck"
                    checked={futureIsSealed}
                    onChange={(e) => setFutureIsSealed(e.target.checked)}
                    className="w-4 h-4 rounded text-manifest-auraPurple"
                  />
                  <label htmlFor="sealCheck" className="text-xs text-manifest-ink cursor-pointer">
                    Sellar como cápsula del tiempo simbólica
                  </label>
                </div>
              </div>

              <div className="pt-2 border-t border-white/70 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFutureModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-manifest-inkMuted"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveFutureManifestation}
                  disabled={!futureTitle.trim() || !futureVisionText.trim()}
                  className="px-4 py-1.5 rounded-xl primary-gradient-btn text-xs font-semibold disabled:opacity-50"
                >
                  Plantar Semilla
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
