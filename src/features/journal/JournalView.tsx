'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import {
  BookOpen,
  Plus,
  Search,
  Sparkles,
  Heart,
  Lightbulb,
  Feather,
  Smile,
  Trash2,
  Edit3,
  X,
  Check,
  Tag,
  Calendar,
  Target,
  Compass,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { EntryType, JournalEntry, MoodType, UserScope } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

const ENTRY_MODES: {
  type: EntryType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  prompt: string;
  color: string;
}[] = [
  {
    type: 'progress',
    label: 'Avance / Evidencia',
    icon: Sparkles,
    prompt: '¿Qué progreso tangible, paso o evidencia de tu manifestación experimentaste hoy?',
    color: 'bg-manifest-mint/40',
  },
  {
    type: 'sign',
    label: 'Señal / Sincronía',
    icon: Compass,
    prompt: 'Describe la señal o sincronía que viste (ej: 11:11, una pluma, sueño, coincidencia). ¿Qué sentiste al verla?',
    color: 'bg-manifest-sky/50',
  },
  {
    type: 'manifestation',
    label: 'Manifestación',
    icon: Target,
    prompt: 'Escribe en tiempo presente como si ya estuviera sucediendo. Describe cómo te sientes al vivirlo...',
    color: 'bg-manifest-lavender/40',
  },
  {
    type: 'gratitude',
    label: 'Gratitud',
    icon: Heart,
    prompt: '¿Qué 3 detalles simples o profundos agradeces con el corazón en este momento?',
    color: 'bg-manifest-pink/40',
  },
  {
    type: 'reflection',
    label: 'Reflexión Guiada',
    icon: Feather,
    prompt: '¿Qué aprendiste hoy? ¿Qué soltaste? ¿Qué te inspiró a ser más tú?',
    color: 'bg-manifest-celeste/40',
  },
  {
    type: 'free',
    label: 'Escritura Libre',
    icon: Feather,
    prompt: 'Vierte tu mente y tu sentir sin censura, este papel digital guarda silencio...',
    color: 'bg-manifest-butter/40',
  },
];

import {
  Wind,
  Flower2,
  Moon,
} from 'lucide-react';

interface MoodOption {
  type: MoodType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MOODS: MoodOption[] = [
  { type: 'radiant', label: 'Radiante', icon: Sparkles },
  { type: 'peaceful', label: 'Serena', icon: Wind },
  { type: 'inspired', label: 'Inspirada', icon: Lightbulb },
  { type: 'grateful', label: 'Agradecida', icon: Flower2 },
  { type: 'contemplative', label: 'Reflexiva', icon: Moon },
];

export const JournalView: React.FC = () => {
  const {
    journalEntries,
    saveJournalEntry,
    deleteJournalEntry,
    goals,
    saveManifestationSign,
    activeScope,
    includeSharedInPersonal,
    toggleIncludeSharedInPersonal,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<EntryType | 'all'>('all');

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [entryScope, setEntryScope] = useState<UserScope>(activeScope);

  // Form Fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [entryType, setEntryType] = useState<EntryType>('manifestation');
  const [mood, setMood] = useState<MoodType>('radiant');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Delete Confirm Modal State
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  // Open editor for new entry
  const handleOpenNew = (type: EntryType = 'manifestation') => {
    setEditingEntryId(null);
    setEntryScope(activeScope);
    setTitle('');
    setContent('');
    setEntryType(type);
    setMood('radiant');
    setTags([]);
    setSelectedGoalId('');
    setAutosaveStatus('idle');
    setIsEditorOpen(true);
  };

  // Open editor for existing entry
  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntryId(entry.id);
    setEntryScope(entry.userId || activeScope);
    setTitle(entry.title);
    setContent(entry.content);
    setEntryType(entry.entryType);
    setMood(entry.mood || 'radiant');
    setTags(entry.tags || []);
    setSelectedGoalId(entry.goalReferences?.[0] || '');
    setAutosaveStatus('saved');
    setIsEditorOpen(true);
  };

  // Add tag
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const clean = tagInput.trim();
    if (!tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((x) => x !== t));
  };

  // Autosave simulation or debounce
  useEffect(() => {
    if (!isEditorOpen || !title.trim() || !content.trim()) return;

    setAutosaveStatus('saving');
    const timer = setTimeout(() => {
      setAutosaveStatus('saved');
    }, 800);

    return () => clearTimeout(timer);
  }, [title, content, tags, mood, entryType, isEditorOpen]);

  // Save entry
  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;

    const author =
      entryScope === 'facu' ? 'Facu' : entryScope === 'maia' ? 'Maia' : 'Facu & Maia';

    const entry: JournalEntry = {
      id: editingEntryId || `journal-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId: entryScope,
      author,
      title: title.trim(),
      content: content.trim(),
      entryType,
      mood,
      tags,
      goalReferences: selectedGoalId ? [selectedGoalId] : [],
      createdAt: editingEntryId
        ? journalEntries.find((e) => e.id === editingEntryId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveJournalEntry(entry);

    if (entryType === 'sign') {
      saveManifestationSign({
        id: `sign-${entry.id}`,
        userId: entry.userId,
        author: entry.author,
        title: entry.title,
        signType: 'intuitive',
        description: entry.content,
        date: entry.createdAt.split('T')[0],
        linkedGoalId: selectedGoalId || undefined,
        feeling: 'Registrada con presencia en el diario',
        createdAt: entry.createdAt,
      });
    }

    setIsEditorOpen(false);
  };

  // Filtered entries
  const filteredEntries = journalEntries.filter((entry) => {
    const matchesFilter = selectedFilter === 'all' || entry.entryType === selectedFilter;
    const matchesQuery =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="space-y-6 pb-28 pt-2">
      {/* Header & New Entry CTA */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-serif font-bold text-manifest-ink flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-manifest-auraPurple" />
            Cuaderno de Manifestación
          </h2>
          <p className="text-xs text-manifest-inkMuted">
            {activeScope === 'shared'
              ? 'Diario en conjunto: sueños y vivencias compartidas de Facu & Maia'
              : `Santuario íntimo de ${activeScope === 'facu' ? 'Facu' : 'Maia'}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeScope !== 'shared' && (
            <button
              onClick={toggleIncludeSharedInPersonal}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                includeSharedInPersonal
                  ? 'bg-manifest-lavender/50 text-manifest-ink font-semibold border border-manifest-auraPurple/30'
                  : 'glass-pill text-manifest-inkMuted hover:text-manifest-ink'
              }`}
              title="Alternar inclusión de vivencias conjuntas en este diario"
            >
              <Sparkles className="w-3.5 h-3.5 text-manifest-auraPurple" />
              <span className="hidden sm:inline">{includeSharedInPersonal ? 'Mi diario + Compartido' : 'Solo diario propio'}</span>
            </button>
          )}

          <button
            onClick={() => handleOpenNew('manifestation')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl primary-gradient-btn text-xs font-semibold shadow-glass"
          >
            <Plus className="w-4 h-4" />
            Nueva
          </button>
        </div>
      </div>

      {/* Writing Modes Horizontal Selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
            selectedFilter === 'all'
              ? 'bg-manifest-ink text-white shadow-sm'
              : 'glass-pill text-manifest-inkMuted hover:text-manifest-ink'
          }`}
        >
          Todas ({journalEntries.length})
        </button>
        {ENTRY_MODES.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedFilter === mode.type;
          return (
            <button
              key={mode.type}
              onClick={() => setSelectedFilter(mode.type)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-manifest-ink text-white shadow-sm'
                  : 'glass-pill text-manifest-inkMuted hover:text-manifest-ink'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {mode.label}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-manifest-inkMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por palabras, temas o intenciones..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-xs placeholder:text-manifest-inkLight"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-manifest-inkMuted hover:text-manifest-ink"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Entries Feed */}
      {filteredEntries.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl glass-card text-center space-y-3 border border-white/80">
          <div className="w-12 h-12 mx-auto rounded-full bg-manifest-lavender/40 flex items-center justify-center text-manifest-ink">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-base font-semibold text-manifest-ink">
            Tu diario espera por ti
          </h3>
          <p className="text-xs text-manifest-inkMuted max-w-xs mx-auto">
            {searchQuery
              ? 'No encontramos entradas con esa búsqueda. Prueba con otras palabras.'
              : 'Escribe tu primer avance, señal sincrónica o reflexión para comenzar.'}
          </p>
          <button
            onClick={() => handleOpenNew('manifestation')}
            className="px-4 py-2 rounded-2xl primary-gradient-btn text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Escribir primera entrada
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredEntries.map((entry) => {
            const formattedEntryDate = format(new Date(entry.createdAt), "d 'de' MMMM, yyyy", { locale: es });
            const modeConfig = ENTRY_MODES.find((m) => m.type === entry.entryType);
            const moodConfig = MOODS.find((m) => m.type === entry.mood);
            const linkedGoal = goals.find((g) => entry.goalReferences?.includes(g.id));

            return (
              <motion.article
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 sm:p-6 rounded-3xl glass-card border border-white/95 shadow-glass space-y-3 hover:shadow-glass-hover transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${modeConfig?.color || 'bg-white/80'} text-manifest-ink`}>
                        {modeConfig?.label || 'Diario'}
                      </span>
                      {moodConfig && (
                        <span className="p-1 rounded-md bg-white/60 text-manifest-ink" title={`Ánimo: ${moodConfig.label}`}>
                          <moodConfig.icon className="w-3 h-3" />
                        </span>
                      )}
                      <span className="text-[11px] text-manifest-inkMuted flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formattedEntryDate}
                      </span>
                      {entry.userId === 'shared' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-manifest-pink/60 to-manifest-celeste/60 text-manifest-ink border border-white">
                          ✨ Juntos
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/70 text-manifest-inkMuted">
                          {entry.author || (entry.userId === 'facu' ? 'Facu' : 'Maia')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditEntry(entry)}
                        className="p-1.5 rounded-full hover:bg-white/80 text-manifest-inkMuted hover:text-manifest-ink transition-colors"
                        title="Editar entrada"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEntryToDelete(entry.id)}
                        className="p-1.5 rounded-full hover:bg-white/80 text-manifest-inkMuted hover:text-rose-600 transition-colors"
                        title="Eliminar entrada"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-serif text-base font-bold text-manifest-ink leading-snug">
                      {entry.title}
                    </h3>
                    <p className="text-xs text-manifest-ink/80 leading-relaxed mt-1.5 whitespace-pre-line line-clamp-4">
                      {entry.content}
                    </p>
                  </div>
                </div>

                {/* Tags and Linked Goal */}
                <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-white/60">
                  {entry.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-white/70 border border-white text-manifest-inkMuted"
                    >
                      #{t}
                    </span>
                  ))}
                  {linkedGoal && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-manifest-celeste/40 text-manifest-ink font-medium flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      <span>{linkedGoal.title}</span>
                    </span>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {/* Editor Modal */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-manifest-ink/35 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl rounded-3xl glass-card p-5 sm:p-7 border border-white shadow-liquid max-h-[92vh] flex flex-col my-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/70">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-manifest-pink to-manifest-lavender flex items-center justify-center">
                    <Feather className="w-4 h-4 text-manifest-ink" />
                  </div>
                  <div>
                    <h3 className="font-serif text-sm font-bold text-manifest-ink">
                      {editingEntryId ? 'Editar Entrada' : 'Nuevo Registro Consciente'}
                    </h3>
                    <span className="text-[10px] text-manifest-inkMuted">
                      {autosaveStatus === 'saving'
                        ? 'Sincronizando...'
                        : autosaveStatus === 'saved'
                        ? 'Listo para guardar ✨'
                        : 'Escribe a tu ritmo'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="p-1.5 rounded-full glass-pill hover:bg-white text-manifest-inkMuted hover:text-manifest-ink"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <div className="space-y-4 py-4 overflow-y-auto flex-1">
                {/* Espacio de Guardado (Personal o Compartido) */}
                <div>
                  <label className="text-[11px] font-semibold text-manifest-inkMuted block mb-1.5">
                    Espacio de Guardado
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white/60 border border-white/80">
                    <button
                      type="button"
                      onClick={() => setEntryScope(activeScope === 'maia' ? 'maia' : 'facu')}
                      className={`py-1.5 px-3 rounded-xl text-xs font-medium transition-all text-center ${
                        entryScope !== 'shared'
                          ? 'bg-white shadow-sm text-manifest-ink font-semibold'
                          : 'text-manifest-inkMuted hover:bg-white/40'
                      }`}
                    >
                      {activeScope === 'maia' ? '🌸 Diario personal de Maia' : '🌙 Diario personal de Facu'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEntryScope('shared')}
                      className={`py-1.5 px-3 rounded-xl text-xs font-medium transition-all text-center ${
                        entryScope === 'shared'
                          ? 'bg-gradient-to-r from-manifest-pink/70 via-manifest-lavender/70 to-manifest-celeste/70 shadow-sm text-manifest-ink font-semibold'
                          : 'text-manifest-inkMuted hover:bg-white/40'
                      }`}
                    >
                      ✨ En Conjunto (Facu & Maia)
                    </button>
                  </div>
                </div>

                {/* Entry Type Picker */}
                <div>
                  <label className="text-[11px] font-semibold text-manifest-inkMuted block mb-1.5">
                    Modalidad de Escritura
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {ENTRY_MODES.map((mode) => {
                      const Icon = mode.icon;
                      const isSel = entryType === mode.type;
                      return (
                        <button
                          key={mode.type}
                          type="button"
                          onClick={() => setEntryType(mode.type)}
                          className={`flex items-center gap-1.5 p-2 rounded-xl text-[11px] font-medium border text-left transition-all ${
                            isSel
                              ? 'bg-manifest-lavender/60 border-manifest-auraPurple/50 text-manifest-ink shadow-sm'
                              : 'bg-white/50 border-white/80 text-manifest-inkMuted hover:text-manifest-ink'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{mode.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Energy Mood Picker */}
                <div>
                  <label className="text-[11px] font-semibold text-manifest-inkMuted block mb-1.5">
                    ¿Cuál es tu vibración hoy?
                  </label>
                  <div className="flex gap-1.5 flex-wrap">
                    {MOODS.map((m) => {
                      const Icon = m.icon;
                      const isSel = mood === m.type;
                      return (
                        <button
                          key={m.type}
                          type="button"
                          onClick={() => setMood(m.type)}
                          className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 border transition-all ${
                            isSel
                              ? 'bg-white border-manifest-auraPurple text-manifest-ink shadow-sm font-medium'
                              : 'bg-white/50 border-white/80 text-manifest-inkMuted'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título o afirmación central..."
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-sm font-serif font-bold text-manifest-ink placeholder:font-sans placeholder:font-normal placeholder:text-manifest-inkLight"
                  />
                </div>

                {/* Content area with dynamic prompt suggestion */}
                <div>
                  <p className="text-[11px] text-manifest-inkMuted/80 italic mb-1">
                    {ENTRY_MODES.find((m) => m.type === entryType)?.prompt}
                  </p>
                  <textarea
                    rows={6}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Escribe libremente con el corazón..."
                    className="w-full p-3.5 rounded-2xl glass-input text-xs leading-relaxed text-manifest-ink placeholder:text-manifest-inkLight resize-none"
                  />
                </div>

                {/* Link to Goal (Optional) */}
                {goals.length > 0 && (
                  <div>
                    <label className="text-[11px] font-semibold text-manifest-inkMuted block mb-1">
                      Conectar con una intención activa (opcional)
                    </label>
                    <select
                      value={selectedGoalId}
                      onChange={(e) => setSelectedGoalId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-manifest-ink"
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

                {/* Tags */}
                <div>
                  <label className="text-[11px] font-semibold text-manifest-inkMuted block mb-1">
                    Etiquetas de enfoque
                  </label>
                  <div className="flex gap-1.5 mb-2 flex-wrap">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-manifest-lavender/50 text-manifest-ink flex items-center gap-1"
                      >
                        #{t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
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
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="Nueva etiqueta (ej: Amor, Claridad, Negocio)..."
                      className="flex-1 px-3 py-1.5 rounded-xl glass-input text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-1.5 rounded-xl glass-pill text-xs font-medium text-manifest-ink"
                    >
                      Añadir
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/70 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!title.trim() || !content.trim()}
                  className="px-5 py-2 rounded-xl primary-gradient-btn text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  {editingEntryId ? 'Guardar Cambios' : 'Anclar al Santuario'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {entryToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-manifest-ink/35 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl glass-card p-6 border border-white/95 text-center space-y-3"
            >
              <div className="w-10 h-10 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-base font-bold text-manifest-ink">
                ¿Eliminar esta entrada?
              </h4>
              <p className="text-xs text-manifest-inkMuted">
                Esta acción retirará las palabras de tu diario de forma definitiva en este dispositivo.
              </p>
              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => setEntryToDelete(null)}
                  className="px-4 py-2 rounded-xl glass-pill text-xs font-medium text-manifest-ink"
                >
                  Conservar
                </button>
                <button
                  onClick={() => {
                    deleteJournalEntry(entryToDelete);
                    setEntryToDelete(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold shadow-sm hover:bg-rose-600 transition-colors"
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
