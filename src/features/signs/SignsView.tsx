'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store';
import {
  Compass,
  Plus,
  Sparkles,
  Trash2,
  X,
  Target,
  Eye,
  Calendar,
  CloudMoon,
  Zap,
  Feather,
  Users,
} from 'lucide-react';
import { ManifestationSign, SignType, UserScope } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

const SIGN_TYPES: {
  key: SignType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  { key: 'angel_number', label: 'Números Repetidos (11:11)', icon: Zap, color: 'bg-manifest-lavender/50' },
  { key: 'dream', label: 'Sueño Revelador', icon: CloudMoon, color: 'bg-manifest-sky/50' },
  { key: 'coincidence', label: 'Coincidencia Mágica', icon: Sparkles, color: 'bg-manifest-butter/50' },
  { key: 'symbol', label: 'Símbolo en el Camino', icon: Feather, color: 'bg-manifest-mint/50' },
  { key: 'encounter', label: 'Encuentro Clave', icon: Users, color: 'bg-manifest-pink/50' },
  { key: 'intuitive', label: 'Certeza Intuitiva', icon: Eye, color: 'bg-manifest-peach/50' },
];

export const SignsView: React.FC = () => {
  const {
    manifestationSigns,
    saveManifestationSign,
    deleteManifestationSign,
    goals,
    activeScope,
    showToast,
    checkAndUnlockMilestones,
  } = useAppStore();

  const [filterType, setFilterType] = useState<SignType | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [signScope, setSignScope] = useState<UserScope>(activeScope);
  const [title, setTitle] = useState('');
  const [signType, setSignType] = useState<SignType>('angel_number');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [feeling, setFeeling] = useState('');
  const [linkedGoalId, setLinkedGoalId] = useState('');

  const handleOpenNew = () => {
    setSignScope(activeScope);
    setTitle('');
    setSignType('angel_number');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setFeeling('');
    setLinkedGoalId('');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!title.trim() || !description.trim()) return;

    const author = signScope === 'facu' ? 'Facu' : signScope === 'maia' ? 'Maia' : 'Facu & Maia';

    const sign: ManifestationSign = {
      id: `sign-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId: signScope,
      author,
      title: title.trim(),
      signType,
      description: description.trim(),
      date,
      linkedGoalId: linkedGoalId || undefined,
      feeling: feeling.trim() || 'Alineación y certeza interior',
      createdAt: new Date().toISOString(),
    };

    saveManifestationSign(sign);
    setIsModalOpen(false);
    const unlocked = checkAndUnlockMilestones();
    if (unlocked.length === 0) {
      showToast('Señal registrada en tu camino', 'gentle');
    }
  };

  const filteredSigns = filterType === 'all'
    ? manifestationSigns
    : manifestationSigns.filter((s) => s.signType === filterType);

  return (
    <div className="space-y-4">
      {/* Intro Header */}
      <div className="p-4 rounded-3xl glass-card border border-white/95 flex items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-manifest-ink font-serif font-bold text-sm">
            <Compass className="w-4 h-4 text-manifest-auraPurple" />
            <span>Señales & Sincronías del Camino</span>
          </div>
          <p className="text-xs text-manifest-inkMuted leading-relaxed">
            Las migajas de pan que el universo va dejando antes de que un deseo se materialice.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-3.5 py-2 rounded-2xl primary-gradient-btn text-xs font-semibold shrink-0 flex items-center gap-1 shadow-glass"
        >
          <Plus className="w-4 h-4" />
          Señal
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
            filterType === 'all'
              ? 'bg-manifest-ink text-white shadow-sm'
              : 'glass-pill text-manifest-inkMuted hover:text-manifest-ink'
          }`}
        >
          Todas ({manifestationSigns.length})
        </button>
        {SIGN_TYPES.map((t) => {
          const isSel = filterType === t.key;
          const count = manifestationSigns.filter((s) => s.signType === t.key).length;
          return (
            <button
              key={t.key}
              onClick={() => setFilterType(t.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${
                isSel
                  ? 'bg-manifest-ink text-white shadow-sm'
                  : 'glass-pill text-manifest-inkMuted hover:text-manifest-ink'
              }`}
            >
              <t.icon className="w-3 h-3" />
              <span>{t.label}</span>
              {count > 0 && <span className="opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Signs Feed */}
      {filteredSigns.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl glass-card text-center space-y-3 border border-white/80">
          <div className="w-12 h-12 mx-auto rounded-full bg-manifest-sky/40 flex items-center justify-center text-manifest-ink">
            <Compass className="w-6 h-6 text-manifest-auraPurple" />
          </div>
          <h3 className="font-serif text-base font-bold text-manifest-ink">
            Observa con atención a tu alrededor
          </h3>
          <p className="text-xs text-manifest-inkMuted max-w-xs mx-auto leading-relaxed">
            Un número repetido en el reloj, un sueño vívido o una conversación casual pueden ser confirmaciones de que vas en sintonía.
          </p>
          <button
            onClick={handleOpenNew}
            className="px-4 py-2 rounded-2xl primary-gradient-btn text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Registrar primera señal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSigns.map((sign) => {
            const typeConfig = SIGN_TYPES.find((t) => t.key === sign.signType);
            const Icon = typeConfig?.icon || Compass;
            const linkedGoal = goals.find((g) => g.id === sign.linkedGoalId);

            return (
              <motion.div
                key={sign.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-3xl glass-card border border-white/95 shadow-glass space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        typeConfig?.color || 'bg-white/80'
                      } text-manifest-ink flex items-center gap-1`}
                    >
                      <Icon className="w-3 h-3" />
                      {typeConfig?.label.split(' ')[0]}
                    </span>
                    <span className="text-[11px] text-manifest-inkMuted flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {sign.date}
                    </span>
                    {sign.userId === 'shared' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-manifest-pink/60 to-manifest-celeste/60 text-manifest-ink border border-white">
                        ✨ Juntos
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/70 text-manifest-inkMuted">
                        {sign.author || (sign.userId === 'facu' ? 'Facu' : 'Maia')}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => deleteManifestationSign(sign.id)}
                    className="p-1 rounded-full hover:bg-white text-manifest-inkMuted hover:text-rose-600 transition-colors"
                    title="Eliminar señal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <h4 className="font-serif text-sm font-bold text-manifest-ink">
                    {sign.title}
                  </h4>
                  <p className="text-xs text-manifest-ink/80 leading-relaxed mt-1">
                    {sign.description}
                  </p>
                </div>

                {sign.feeling && (
                  <div className="text-[11px] text-manifest-inkMuted">
                    <span className="font-semibold">Sensación:</span> {sign.feeling}
                  </div>
                )}

                {linkedGoal && (
                  <div className="pt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-manifest-celeste/40 text-manifest-ink font-medium inline-flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      Vinculada con: {linkedGoal.title}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Sign Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-manifest-ink/35 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-sm rounded-3xl glass-card p-5 border border-white shadow-liquid space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/70">
                <h3 className="font-serif text-sm font-bold text-manifest-ink flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-manifest-auraPurple" />
                  Registrar Sincronía o Señal
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-full glass-pill text-manifest-inkMuted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-manifest-inkMuted block mb-1">
                    Tipo de señal
                  </label>
                  <select
                    value={signType}
                    onChange={(e) => setSignType(e.target.value as SignType)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  >
                    {SIGN_TYPES.map((t) => (
                      <option key={t.key} value={t.key}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-manifest-inkMuted block mb-1">
                    ¿Qué viste o experimentaste? *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: Secuencia 444 en la matrícula de un auto..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-bold text-manifest-ink"
                  />
                </div>

                <div>
                  <label className="font-semibold text-manifest-inkMuted block mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-manifest-inkMuted block mb-1">
                    Detalles y contexto de lo que pasaba *
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="¿En qué estabas pensando justo antes? ¿Qué detalles ocurrieron en ese instante?"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-manifest-inkMuted block mb-1">
                    ¿Qué emoción o certeza provocó en ti?
                  </label>
                  <input
                    type="text"
                    value={feeling}
                    onChange={(e) => setFeeling(e.target.value)}
                    placeholder="Paz repentina, confirmación, sonrisa interior..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                {goals.length > 0 && (
                  <div>
                    <label className="font-semibold text-manifest-inkMuted block mb-1">
                      Conectar con una intención (opcional)
                    </label>
                    <select
                      value={linkedGoalId}
                      onChange={(e) => setLinkedGoalId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                    >
                      <option value="">Ninguna intención asociada</option>
                      {goals.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-white/70 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-manifest-inkMuted"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!title.trim() || !description.trim()}
                  className="px-4 py-1.5 rounded-xl primary-gradient-btn text-xs font-semibold disabled:opacity-50"
                >
                  Guardar Señal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
