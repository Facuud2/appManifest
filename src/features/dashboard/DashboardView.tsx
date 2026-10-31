'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store';
import {
  Sparkles,
  PenLine,
  ArrowRight,
  Sun,
  Moon,
  CloudSun,
  BookOpen,
  Plus,
  Flame,
  X,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { UserScope } from '@/types';

export const DashboardView: React.FC = () => {
  const {
    activeScope,
    setActiveTab,
    openJournalEditor,
    journalEntries,
    affirmations,
    incrementAffirmationRepeat,
    saveAffirmation,
    deleteAffirmation,
  } = useAppStore();

  // Affirmations interaction & creation state
  const [pulsingAffirmationId, setPulsingAffirmationId] = useState<string | null>(null);
  const [isNewAffirmationModalOpen, setIsNewAffirmationModalOpen] = useState(false);
  const [newAffirmationText, setNewAffirmationText] = useState('');
  const [newAffirmationScope, setNewAffirmationScope] = useState<UserScope>(activeScope);

  // Home displays the first 2 affirmations and the 3 most recent journal entries
  const topAffirmations = affirmations.slice(0, 2);
  const recentEntries = journalEntries.slice(0, 3);

  const formattedDate = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });
  const hour = new Date().getHours();

  const handleRepeatAffirmation = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    incrementAffirmationRepeat(id);
    setPulsingAffirmationId(id);
    setTimeout(() => {
      setPulsingAffirmationId(null);
    }, 450);
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
      createdAt: new Date().toISOString(),
      lastRepeatedAt: new Date().toISOString(),
    });

    setNewAffirmationText('');
    setIsNewAffirmationModalOpen(false);
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

  return (
    <div className="max-w-2xl mx-auto space-y-3.5 sm:space-y-5 pt-0.5">
      {/* 1. Date & Warm Greeting */}
      <div className="px-1 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-manifest-inkMuted capitalize">
            {formattedDate}
          </p>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-manifest-ink flex items-center gap-2 mt-0.5">
            {hour < 12 ? (
              <CloudSun className="w-5 h-5 text-amber-500 inline shrink-0" />
            ) : hour < 20 ? (
              <Sun className="w-5 h-5 text-amber-500 inline shrink-0" />
            ) : (
              <Moon className="w-5 h-5 text-manifest-lavender inline shrink-0" />
            )}
            <span>
              {hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'},{' '}
              {getScopeGreetingName()}
            </span>
          </h2>
        </div>
      </div>

      {/* 2. SECCIÓN: Afirmaciones (Primeras 2 del perfil actual) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-manifest-ink flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-manifest-auraPurple" />
              Afirmaciones
            </h3>
            <p className="text-[11px] text-manifest-inkMuted">
              Toca para sumar energía viva a tu decreto (+1)
            </p>
          </div>
          <div className="flex items-center gap-2">
            {affirmations.length > 2 && (
              <button
                onClick={() => setActiveTab('objetivos')}
                className="text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink transition-colors flex items-center gap-0.5"
              >
                <span>Ver todas ({affirmations.length})</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={() => {
                setNewAffirmationScope(activeScope);
                setIsNewAffirmationModalOpen(true);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl primary-gradient-btn text-xs font-semibold shadow-sm shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva</span>
            </button>
          </div>
        </div>

        {topAffirmations.length === 0 ? (
          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl glass-card text-center space-y-2 border border-white/80">
            <p className="text-xs text-manifest-inkMuted">
              Aún no tienes afirmaciones registradas en este espacio.
            </p>
            <button
              onClick={() => {
                setNewAffirmationScope(activeScope);
                setIsNewAffirmationModalOpen(true);
              }}
              className="text-xs font-semibold text-manifest-auraPurple underline underline-offset-4"
            >
              + Escribir tu primera afirmación
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {topAffirmations.map((aff) => {
              const isPulsing = pulsingAffirmationId === aff.id;
              return (
                <motion.div
                  key={aff.id}
                  layout
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleRepeatAffirmation(aff.id)}
                  className={`relative overflow-hidden p-4 sm:p-5 rounded-3xl glass-card-interactive cursor-pointer border border-white/95 shadow-sm space-y-2.5 transition-all ${
                    isPulsing ? 'ring-2 ring-manifest-auraPurple/70 bg-white/95 scale-[1.01]' : ''
                  }`}
                >
                  <div className="relative z-10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {aff.userId === 'shared' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-manifest-pink/60 to-manifest-celeste/60 text-manifest-ink border border-white">
                          ✨ Juntos
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/80 text-manifest-inkMuted">
                          {aff.author || (aff.userId === 'facu' ? 'Facu' : 'Maia')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Repetition Button / Counter Pill */}
                      <button
                        type="button"
                        onClick={(e) => handleRepeatAffirmation(aff.id, e)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-2xl transition-all shadow-sm ${
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
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-manifest-lavender/50 text-manifest-auraPurple">
                          +1
                        </span>
                      </button>

                      {/* Delete affirmation */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAffirmation(aff.id);
                        }}
                        className="p-1 rounded-full text-manifest-inkMuted hover:text-rose-500 transition-colors"
                        title="Eliminar afirmación"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="relative z-10 font-serif text-sm sm:text-base font-medium text-manifest-ink leading-relaxed italic">
                    «{aff.text}»
                  </p>

                  <div className="relative z-10 flex items-center justify-between pt-1.5 border-t border-white/60 text-[10px] text-manifest-inkMuted">
                    <span>Toca la tarjeta al repetir tu mantra</span>
                    <span className="text-manifest-auraPurple font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Repetir
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. SECCIÓN: Diario de Manifestación (Justo debajo de las afirmaciones) */}
      <section className="space-y-3">
        {/* Quick Action: Start Journal Entry */}
        <div className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl glass-card flex items-center justify-between gap-3 border border-white/90 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-manifest-peach via-manifest-pink to-manifest-lavender flex items-center justify-center shrink-0 shadow-sm">
              <PenLine className="w-5 h-5 text-manifest-ink" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-manifest-ink">
                Registrar en el Diario
              </h4>
              <p className="text-[11px] text-manifest-inkMuted">
                Notas de manifestación y avances en tu camino
              </p>
            </div>
          </div>
          <button
            onClick={() => openJournalEditor('manifestation')}
            className="px-4 py-2 rounded-2xl primary-gradient-btn text-xs font-semibold shrink-0"
          >
            Escribir
          </button>
        </div>

        {/* Recent Journal Entries */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-manifest-ink flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-manifest-ink" />
                Diario Reciente
              </h3>
              <p className="text-[11px] text-manifest-inkMuted">
                Notas y avances de manifestación
              </p>
            </div>
            {journalEntries.length > 0 && (
              <button
                onClick={() => setActiveTab('diario')}
                className="text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink transition-colors flex items-center gap-0.5"
              >
                <span>Ver todas ({journalEntries.length})</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {recentEntries.length === 0 ? (
            <div className="p-6 rounded-3xl glass-card text-center space-y-2.5 border border-white/80">
              <p className="text-xs text-manifest-inkMuted">
                Aún no tienes notas de manifestación o avances en tu diario.
              </p>
              <button
                onClick={() => openJournalEditor('manifestation')}
                className="text-xs font-semibold text-manifest-auraPurple underline underline-offset-4"
              >
                + Escribir tu primera nota de manifestación
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
              {recentEntries.map((entry) => {
                const formattedEntryDate = format(new Date(entry.createdAt), "d 'de' MMMM", { locale: es });
                const isProgress = entry.entryType === 'progress';

                return (
                  <div
                    key={entry.id}
                    onClick={() => setActiveTab('diario')}
                    className="p-3.5 sm:p-4 rounded-2xl glass-card-interactive cursor-pointer border border-white/90 space-y-2 hover:scale-[1.005] transition-transform"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isProgress ? 'bg-manifest-mint/50 text-manifest-ink' : 'bg-manifest-lavender/50 text-manifest-ink'
                          }`}
                        >
                          {isProgress ? 'Avance de Manifestación' : 'Nota de Manifestación'}
                        </span>
                        <span className="text-[10px] text-manifest-inkMuted">
                          {formattedEntryDate}
                        </span>
                      </div>
                      <span className="text-[10px] text-manifest-inkMuted">
                        {entry.userId === 'shared' ? '✨ Juntos' : entry.author || (entry.userId === 'facu' ? 'Facu' : 'Maia')}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs sm:text-sm font-serif font-bold text-manifest-ink line-clamp-1">
                        {entry.title}
                      </h4>
                      <p className="text-[11px] text-manifest-inkMuted line-clamp-2 leading-relaxed mt-0.5">
                        {entry.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-end text-[10px] text-manifest-auraPurple font-medium pt-1">
                      <span>Ver entrada en diario →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* MODAL: Nueva Afirmación Consciente */}
      <AnimatePresence>
        {isNewAffirmationModalOpen && (
          <div
            onClick={() => setIsNewAffirmationModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-manifest-ink/35 backdrop-blur-sm"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg rounded-3xl glass-card p-5 sm:p-6 border border-white shadow-liquid space-y-4 max-h-[85dvh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/70">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-manifest-butter to-manifest-pink flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-manifest-ink" />
                  </div>
                  <div>
                    <h3 className="font-serif text-sm font-bold text-manifest-ink">
                      Nueva Afirmación
                    </h3>
                    <p className="text-[11px] text-manifest-inkMuted">
                      Decreto consciente para tu espacio
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
                {/* Perfil / Destinatario */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-manifest-ink">
                    ¿Para quién es este decreto?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'facu' as UserScope, label: 'Facu' },
                      { key: 'maia' as UserScope, label: 'Maia' },
                      { key: 'shared' as UserScope, label: '✨ Juntos' },
                    ].map((sc) => (
                      <button
                        key={sc.key}
                        type="button"
                        onClick={() => setNewAffirmationScope(sc.key)}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all border ${
                          newAffirmationScope === sc.key
                            ? 'bg-manifest-ink text-white border-manifest-ink shadow-sm'
                            : 'bg-white/70 hover:bg-white text-manifest-inkMuted border-white/80'
                        }`}
                      >
                        {sc.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Texto de la Afirmación */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-manifest-ink">
                    Texto de la afirmación
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newAffirmationText}
                    onChange={(e) => setNewAffirmationText(e.target.value)}
                    placeholder="Ej: Merezco vivir con paz, abundancia y felicidad..."
                    className="w-full p-3 rounded-2xl glass-input text-base sm:text-xs resize-none placeholder:text-manifest-inkLight font-serif"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewAffirmationModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink hover:bg-white/60 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl primary-gradient-btn text-xs font-semibold shadow-sm"
                  >
                    Guardar Afirmación
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
