'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import {
  BookOpen,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Edit3,
  X,
  Calendar,
  Target,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { EntryType, JournalEntry, UserScope } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

export const JournalView: React.FC = () => {
  const {
    journalEntries,
    saveJournalEntry,
    deleteJournalEntry,
    activeScope,
    isJournalEditorOpen,
    journalEditorInitialMode,
    openJournalEditor,
    closeJournalEditor,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'manifestation' | 'progress'>('all');

  // Editor Modal State
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [entryScope, setEntryScope] = useState<UserScope>(activeScope);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [entryType, setEntryType] = useState<'manifestation' | 'progress'>('manifestation');

  // Delete Confirm Modal State
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  // Synchronize when store opens editor for new entry
  useEffect(() => {
    if (isJournalEditorOpen && !editingEntryId) {
      setEntryScope(activeScope);
      setTitle('');
      setContent('');
      setEntryType(
        journalEditorInitialMode === 'progress' ? 'progress' : 'manifestation'
      );
    }
  }, [isJournalEditorOpen, editingEntryId, journalEditorInitialMode, activeScope]);

  const handleOpenNew = (type: 'manifestation' | 'progress' = 'manifestation') => {
    setEditingEntryId(null);
    setEntryScope(activeScope);
    setTitle('');
    setContent('');
    setEntryType(type);
    openJournalEditor(type);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntryId(entry.id);
    setEntryScope(entry.userId || activeScope);
    setTitle(entry.title);
    setContent(entry.content);
    setEntryType(entry.entryType === 'progress' ? 'progress' : 'manifestation');
    openJournalEditor(entry.entryType);
  };

  const handleCloseEditor = () => {
    closeJournalEditor();
    setEditingEntryId(null);
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    const author =
      entryScope === 'facu' ? 'Facu' : entryScope === 'maia' ? 'Maia' : 'Facu & Maia';

    const newEntry: JournalEntry = {
      id: editingEntryId || `journal-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      userId: entryScope,
      author,
      title: title.trim() || (entryType === 'progress' ? 'Avance de Manifestación' : 'Nota de Manifestación'),
      content: content.trim(),
      entryType: entryType as EntryType,
      tags: [],
      createdAt: editingEntryId
        ? journalEntries.find((e) => e.id === editingEntryId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveJournalEntry(newEntry);
    handleCloseEditor();
  };

  const handleDeleteConfirm = () => {
    if (!entryToDelete) return;
    deleteJournalEntry(entryToDelete);
    setEntryToDelete(null);
  };

  // Filter entries: only manifestation notes and progress advances
  const filteredEntries = journalEntries
    .filter((entry) => {
      // Exclude legacy mock seed entries
      if (entry.id.startsWith('seed-')) return false;

      // Filter by type
      if (selectedFilter !== 'all' && entry.entryType !== selectedFilter) {
        return false;
      }

      // Filter by search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = entry.title.toLowerCase().includes(query);
        const matchesContent = entry.content.toLowerCase().includes(query);
        return matchesTitle || matchesContent;
      }

      return true;
    });

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-24 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-manifest-ink flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-manifest-auraPurple" />
            Diario de Manifestación
          </h2>
          <p className="text-xs text-manifest-inkMuted mt-0.5">
            Notas de manifestación y avances en tu realidad
          </p>
        </div>

        <button
          onClick={() => handleOpenNew('manifestation')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl primary-gradient-btn text-xs font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Escribir</span>
        </button>
      </div>

      {/* Filter Tabs: Todas / Notas / Avances */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            selectedFilter === 'all'
              ? 'bg-manifest-ink text-white shadow-sm'
              : 'glass-pill text-manifest-inkMuted hover:text-manifest-ink'
          }`}
        >
          Todas ({journalEntries.length})
        </button>
        <button
          onClick={() => setSelectedFilter('manifestation')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            selectedFilter === 'manifestation'
              ? 'bg-manifest-ink text-white shadow-sm'
              : 'glass-pill text-manifest-inkMuted hover:text-manifest-ink'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          Notas de Manifestación
        </button>
        <button
          onClick={() => setSelectedFilter('progress')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            selectedFilter === 'progress'
              ? 'bg-manifest-ink text-white shadow-sm'
              : 'glass-pill text-manifest-inkMuted hover:text-manifest-ink'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Avances
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-manifest-inkMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar notas o avances en tu diario..."
          className="w-full pl-10 pr-9 py-2.5 rounded-2xl glass-input text-xs placeholder:text-manifest-inkLight"
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

      {/* Entries List */}
      {filteredEntries.length === 0 ? (
        <div className="p-8 sm:p-10 rounded-3xl glass-card text-center space-y-3 border border-white/80">
          <div className="w-12 h-12 mx-auto rounded-full bg-manifest-lavender/40 flex items-center justify-center text-manifest-ink">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-base font-semibold text-manifest-ink">
            {searchQuery
              ? 'No encontramos entradas con esa búsqueda'
              : 'Tu diario espera por ti'}
          </h3>
          <p className="text-xs text-manifest-inkMuted max-w-xs mx-auto">
            {searchQuery
              ? 'Prueba con otras palabras o limpia la barra de búsqueda.'
              : 'Escribe tu primera nota de manifestación o registra un avance para comenzar.'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => handleOpenNew('manifestation')}
              className="px-4 py-2 rounded-2xl primary-gradient-btn text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Escribir primera entrada
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredEntries.map((entry) => {
            const formattedEntryDate = format(new Date(entry.createdAt), "d 'de' MMMM, yyyy", { locale: es });
            const isProgress = entry.entryType === 'progress';

            return (
              <motion.article
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 sm:p-5 rounded-3xl glass-card border border-white/95 shadow-sm space-y-2.5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isProgress
                          ? 'bg-manifest-mint/50 text-manifest-ink'
                          : 'bg-manifest-lavender/50 text-manifest-ink'
                      }`}
                    >
                      {isProgress ? 'Avance de Manifestación' : 'Nota de Manifestación'}
                    </span>
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
                  <p className="text-xs text-manifest-ink/80 leading-relaxed mt-1 whitespace-pre-line">
                    {entry.content}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {/* MODAL: Escribir / Editar Entrada */}
      <AnimatePresence>
        {isJournalEditorOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-manifest-ink/35 backdrop-blur-sm pb-[max(1rem,env(safe-area-inset-bottom))]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="w-full max-w-lg rounded-3xl glass-card p-5 sm:p-6 border border-white shadow-liquid space-y-4 max-h-[85dvh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/70">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-manifest-pink to-manifest-lavender flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-manifest-ink" />
                  </div>
                  <div>
                    <h3 className="font-serif text-sm font-bold text-manifest-ink">
                      {editingEntryId ? 'Editar en Diario' : 'Nueva Entrada en Diario'}
                    </h3>
                    <p className="text-[11px] text-manifest-inkMuted">
                      Notas de manifestación y avances
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseEditor}
                  className="p-1.5 rounded-full hover:bg-white/80 text-manifest-inkMuted hover:text-manifest-ink transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEntry} className="space-y-4">
                {/* Perfil Destinatario */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-manifest-ink">
                    Espacio
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
                        onClick={() => setEntryScope(sc.key)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all border ${
                          entryScope === sc.key
                            ? 'bg-manifest-ink text-white border-manifest-ink shadow-sm'
                            : 'bg-white/70 hover:bg-white text-manifest-inkMuted border-white/80'
                        }`}
                      >
                        {sc.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tipo de Entrada: Nota vs Avance */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-manifest-ink">
                    Tipo de entrada
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEntryType('manifestation')}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
                        entryType === 'manifestation'
                          ? 'bg-manifest-lavender text-manifest-ink border-manifest-auraPurple/50 shadow-sm'
                          : 'bg-white/70 hover:bg-white text-manifest-inkMuted border-white/80'
                      }`}
                    >
                      <Target className="w-3.5 h-3.5" />
                      <span>Nota de Manifestación</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEntryType('progress')}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
                        entryType === 'progress'
                          ? 'bg-manifest-mint text-manifest-ink border-emerald-400/50 shadow-sm'
                          : 'bg-white/70 hover:bg-white text-manifest-inkMuted border-white/80'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Avance de Manifestación</span>
                    </button>
                  </div>
                </div>

                {/* Título */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-manifest-ink">
                    Título
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      entryType === 'progress'
                        ? 'Ej: Primer indicio de mi nuevo proyecto...'
                        : 'Ej: Mi visión viviendo en el campo...'
                    }
                    className="w-full px-3 py-2 rounded-2xl glass-input text-base sm:text-xs font-serif placeholder:text-manifest-inkLight"
                  />
                </div>

                {/* Contenido */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-manifest-ink">
                    {entryType === 'progress'
                      ? 'Describe el avance o evidencia vivida'
                      : 'Describe tu manifestación o sentir'}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={
                      entryType === 'progress'
                        ? 'Describe qué sucedió, qué señal percibiste o qué paso diste...'
                        : 'Escribe en tiempo presente como si ya estuviese ocurriendo, detallando tus sensaciones...'
                    }
                    className="w-full p-3 rounded-2xl glass-input text-base sm:text-xs resize-none placeholder:text-manifest-inkLight leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseEditor}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink hover:bg-white/60 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl primary-gradient-btn text-xs font-semibold shadow-sm"
                  >
                    {editingEntryId ? 'Guardar Cambios' : 'Guardar en Diario'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {entryToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-manifest-ink/30 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl glass-card p-6 border border-white shadow-liquid space-y-4 text-center"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-rose-100/70 text-rose-600 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-base font-bold text-manifest-ink">
                  ¿Eliminar esta entrada?
                </h3>
                <p className="text-xs text-manifest-inkMuted">
                  Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setEntryToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink bg-white/70 hover:bg-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold shadow-sm hover:bg-rose-700 transition-colors"
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
