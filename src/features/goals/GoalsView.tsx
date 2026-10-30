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
  Archive,
  Trash2,
  Edit3,
  X,
  Sparkles,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Goal, GoalCategory, GoalStatus, GoalStep } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const CATEGORIES: { key: GoalCategory; label: string; color: string }[] = [
  { key: 'crecimiento', label: 'Crecimiento', color: 'bg-manifest-lavender/50' },
  { key: 'carrera', label: 'Carrera & Proyecto', color: 'bg-manifest-celeste/50' },
  { key: 'bienestar', label: 'Salud & Bienestar', color: 'bg-manifest-mint/50' },
  { key: 'relaciones', label: 'Amor & Relaciones', color: 'bg-manifest-pink/50' },
  { key: 'abundancia', label: 'Abundancia & Dinero', color: 'bg-manifest-butter/50' },
  { key: 'creatividad', label: 'Creatividad & Arte', color: 'bg-manifest-peach/50' },
];

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
  } = useAppStore();

  const [activeTabStatus, setActiveTabStatus] = useState<GoalStatus>('active');
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  // Goal Modal
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalCategory, setGoalCategory] = useState<GoalCategory>('bienestar');
  const [goalMotivation, setGoalMotivation] = useState('');
  const [goalTargetDate, setGoalTargetDate] = useState('');

  // Step Input State per goal
  const [newStepTitles, setNewStepTitles] = useState<Record<string, string>>({});

  const handleOpenNewGoal = () => {
    setEditingGoalId(null);
    setGoalTitle('');
    setGoalDescription('');
    setGoalCategory('bienestar');
    setGoalMotivation('');
    setGoalTargetDate('');
    setIsGoalModalOpen(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setGoalTitle(goal.title);
    setGoalDescription(goal.description);
    setGoalCategory(goal.category);
    setGoalMotivation(goal.motivation);
    setGoalTargetDate(goal.targetDate || '');
    setIsGoalModalOpen(true);
  };

  const handleSaveGoal = () => {
    if (!goalTitle.trim() || !goalMotivation.trim()) return;

    const goal: Goal = {
      id: editingGoalId || `goal-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
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

  // Add Step to Goal
  const handleAddStep = (goalId: string) => {
    const title = newStepTitles[goalId]?.trim();
    if (!title) return;

    const step: GoalStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      goalId,
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    saveGoalStep(step);
    setNewStepTitles({ ...newStepTitles, [goalId]: '' });
  };

  const handleToggleStepWithCelebration = (stepId: string, currentGoalId: string) => {
    toggleGoalStep(stepId);
    // Check if after this step, all steps are completed
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

  const filteredGoals = goals.filter((g) => g.status === activeTabStatus);

  return (
    <div className="space-y-6 pb-28 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-serif font-bold text-manifest-ink flex items-center gap-2">
            <Target className="w-5 h-5 text-manifest-auraPurple" />
            Intenciones & Acciones
          </h2>
          <p className="text-xs text-manifest-inkMuted">
            Transforma anhelos profundos en pasos reales
          </p>
        </div>

        <button
          onClick={handleOpenNewGoal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl primary-gradient-btn text-xs font-semibold shadow-glass"
        >
          <Plus className="w-4 h-4" />
          Intención
        </button>
      </div>

      {/* Status Segmented Tabs */}
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

      {/* Goals List */}
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
          <p className="text-xs text-manifest-inkMuted max-w-xs mx-auto">
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
        <div className="space-y-4">
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
                {/* Goal Summary Card Header */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${catConfig?.color || 'bg-white/80'} text-manifest-ink`}>
                      {catConfig?.label || goal.category}
                    </span>

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

                      {goal.status !== 'completed' && (
                        <button
                          onClick={() => handleStatusChange(goal, 'completed')}
                          className="p-1.5 rounded-full hover:bg-white text-manifest-inkMuted hover:text-emerald-600"
                          title="Completar intención"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
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
                        className="h-full bg-gradient-to-r from-manifest-pink via-manifest-lavender to-manifest-celeste rounded-full"
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
                      <h4 className="text-xs font-semibold text-manifest-ink uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-manifest-auraPurple" />
                        Acciones tangibles para esta meta
                      </h4>

                      {/* Step items */}
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

                      {/* Add new step input */}
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
                          placeholder="Añadir paso concreto (ej: Leer 5 páginas)..."
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

      {/* Goal Modal */}
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
    </div>
  );
};
