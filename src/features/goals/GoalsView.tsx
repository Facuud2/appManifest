'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store';
import {
  Sparkles,
  Plus,
  Flame,
  Trash2,
  Calendar,
} from 'lucide-react';
import { UserScope } from '@/types';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const GoalsView: React.FC = () => {
  const {
    activeScope,
    affirmations,
    saveAffirmation,
    incrementAffirmationRepeat,
    deleteAffirmation,
  } = useAppStore();

  const [manifestationText, setManifestationText] = useState('');
  const [scope, setScope] = useState<UserScope>(activeScope);
  const [pulsingId, setPulsingId] = useState<string | null>(null);

  const handleRepeat = (id: string) => {
    incrementAffirmationRepeat(id);
    setPulsingId(id);
    setTimeout(() => setPulsingId(null), 450);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manifestationText.trim()) return;

    const author =
      scope === 'facu' ? 'Facu' : scope === 'maia' ? 'Maia' : 'Facu & Maia';

    saveAffirmation({
      id: `aff-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: scope,
      author,
      text: manifestationText.trim(),
      repeatCount: 1,
      createdAt: new Date().toISOString(),
      lastRepeatedAt: new Date().toISOString(),
    });

    setManifestationText('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pt-1">
      {/* Header */}
      <div className="px-1">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-manifest-ink flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-manifest-auraPurple" />
          Manifestaciones
        </h2>
        <p className="text-xs text-manifest-inkMuted mt-0.5">
          Todas tus afirmaciones y decretos conscientes en un solo lugar
        </p>
      </div>

      {/* Quick Manifestation Writer */}
      <form
        onSubmit={handleSave}
        className="p-4 sm:p-5 rounded-3xl glass-card border border-white/95 shadow-sm space-y-3.5"
      >
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-semibold text-manifest-ink">
            Escribe tu manifestación
          </label>
          <div className="flex items-center gap-1">
            {[
              { key: 'facu' as UserScope, label: 'Facu' },
              { key: 'maia' as UserScope, label: 'Maia' },
              { key: 'shared' as UserScope, label: '✨ Juntos' },
            ].map((sc) => (
              <button
                key={sc.key}
                type="button"
                onClick={() => setScope(sc.key)}
                className={`py-1 px-2.5 rounded-xl text-[11px] font-semibold transition-all border ${
                  scope === sc.key
                    ? 'bg-manifest-ink text-white border-manifest-ink shadow-sm'
                    : 'bg-white/70 hover:bg-white text-manifest-inkMuted border-white/80'
                }`}
              >
                {sc.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={3}
          value={manifestationText}
          onChange={(e) => setManifestationText(e.target.value)}
          placeholder="Escribe en tiempo presente tu deseo o afirmación... (Ej: Atraigo abundancia, tranquilidad y felicidad cada día)"
          className="w-full p-3 rounded-2xl glass-input text-base sm:text-xs resize-none placeholder:text-manifest-inkLight font-serif"
          required
        />

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl primary-gradient-btn text-xs font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Guardar Manifestación</span>
          </button>
        </div>
      </form>

      {/* Manifestations List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-manifest-ink">
            Todas tus manifestaciones ({affirmations.length})
          </h3>
        </div>

        {affirmations.length === 0 ? (
          <div className="p-8 rounded-3xl glass-card text-center space-y-2.5 border border-white/80">
            <div className="w-12 h-12 mx-auto rounded-full bg-manifest-lavender/40 flex items-center justify-center text-manifest-ink">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-base font-bold text-manifest-ink">
              Sin manifestaciones aún
            </h4>
            <p className="text-xs text-manifest-inkMuted max-w-xs mx-auto">
              Escribe arriba tu primera manifestación o afirmación para comenzar a proyectar tu realidad.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {affirmations.map((item) => {
              const formattedDate = format(new Date(item.createdAt), "d 'de' MMMM", { locale: es });
              const isPulsing = pulsingId === item.id;

              return (
                <motion.div
                  key={item.id}
                  layout
                  className={`p-4 sm:p-5 rounded-3xl glass-card border border-white/95 shadow-sm space-y-2.5 transition-all ${
                    isPulsing ? 'ring-2 ring-manifest-auraPurple/70 bg-white/95 scale-[1.01]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {item.userId === 'shared' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-manifest-pink/60 to-manifest-celeste/60 text-manifest-ink border border-white">
                          ✨ Juntos
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/80 text-manifest-inkMuted">
                          {item.author || (item.userId === 'facu' ? 'Facu' : 'Maia')}
                        </span>
                      )}
                      <span className="text-[10px] text-manifest-inkMuted flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formattedDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRepeat(item.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-2xl transition-all shadow-sm ${
                          isPulsing
                            ? 'bg-manifest-lavender text-manifest-ink scale-105 shadow-md ring-2 ring-manifest-auraPurple'
                            : 'bg-white/90 hover:bg-white text-manifest-ink border border-white'
                        }`}
                        title="Pulsar para sumar una repetición"
                      >
                        <Flame
                          className={`w-3.5 h-3.5 transition-colors ${
                            item.repeatCount > 0 ? 'text-amber-500 fill-amber-400' : 'text-manifest-inkMuted'
                          }`}
                        />
                        <span className="text-xs font-bold font-mono text-manifest-ink">
                          {item.repeatCount}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-manifest-lavender/50 text-manifest-auraPurple">
                          +1
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteAffirmation(item.id)}
                        className="p-1.5 rounded-full hover:bg-white/80 text-manifest-inkMuted hover:text-rose-500 transition-colors"
                        title="Eliminar manifestación"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="font-serif text-sm sm:text-base font-medium text-manifest-ink leading-relaxed italic">
                    «{item.text}»
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
