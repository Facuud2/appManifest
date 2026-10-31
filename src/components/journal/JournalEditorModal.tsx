'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { BookOpen, X, Target, Sparkles } from 'lucide-react';
import { EntryType, JournalEntry, UserScope } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

export const JournalEditorModal: React.FC = () => {
  const {
    isJournalEditorOpen,
    journalEditorInitialMode,
    editingJournalEntry,
    activeScope,
    saveJournalEntry,
    closeJournalEditor,
  } = useAppStore();

  const [entryScope, setEntryScope] = useState<UserScope>(activeScope);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [entryType, setEntryType] = useState<'manifestation' | 'progress'>('manifestation');

  // Synchronize state when editor is opened
  useEffect(() => {
    if (isJournalEditorOpen) {
      if (editingJournalEntry) {
        setEntryScope(editingJournalEntry.userId || activeScope);
        setTitle(editingJournalEntry.title);
        setContent(editingJournalEntry.content);
        setEntryType(editingJournalEntry.entryType === 'progress' ? 'progress' : 'manifestation');
      } else {
        setEntryScope(activeScope);
        setTitle('');
        setContent('');
        setEntryType(journalEditorInitialMode === 'progress' ? 'progress' : 'manifestation');
      }
    }
  }, [isJournalEditorOpen, editingJournalEntry, journalEditorInitialMode, activeScope]);

  if (!isJournalEditorOpen) return null;

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    const author =
      entryScope === 'facu' ? 'Facu' : entryScope === 'maia' ? 'Maia' : 'Facu & Maia';

    const newEntry: JournalEntry = {
      id: editingJournalEntry?.id || `journal-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      userId: entryScope,
      author,
      title: title.trim() || (entryType === 'progress' ? 'Avance de Manifestación' : 'Nota de Manifestación'),
      content: content.trim(),
      entryType: entryType as EntryType,
      tags: [],
      createdAt: editingJournalEntry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveJournalEntry(newEntry);
    closeJournalEditor();
  };

  return (
    <AnimatePresence>
      <div
        onClick={closeJournalEditor}
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
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-manifest-pink to-manifest-lavender flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-manifest-ink" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-bold text-manifest-ink">
                  {editingJournalEntry ? 'Editar en Diario' : 'Nueva Entrada en Diario'}
                </h3>
                <p className="text-[11px] text-manifest-inkMuted">
                  Notas de manifestación y avances
                </p>
              </div>
            </div>
            <button
              onClick={closeJournalEditor}
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
                onClick={closeJournalEditor}
                className="px-4 py-2 rounded-xl text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink hover:bg-white/60 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl primary-gradient-btn text-xs font-semibold shadow-sm"
              >
                {editingJournalEntry ? 'Guardar Cambios' : 'Guardar en Diario'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
