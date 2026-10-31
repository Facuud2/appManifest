'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  Trash2,
  Edit3,
  X,
  ChevronLeft,
  ChevronRight,
  Target,
  Sparkles,
} from 'lucide-react';
import { format, addDays, subDays, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { AgendaEvent, UserScope } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

export const AgendaView: React.FC = () => {
  const {
    agendaEvents,
    saveAgendaEvent,
    toggleAgendaEvent,
    deleteAgendaEvent,
    goals,
    activeScope,
  } = useAppStore();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'all'>('day');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [agendaScope, setAgendaScope] = useState<UserScope>(activeScope);

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState('');
  const [linkedGoalId, setLinkedGoalId] = useState('');

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

  // Days for the mini week bar
  const weekDays = [-3, -2, -1, 0, 1, 2, 3].map((offset) => addDays(selectedDate, offset));

  const handleOpenNew = (dateToUse?: string) => {
    setEditingId(null);
    setAgendaScope(activeScope);
    setTitle('');
    setDescription('');
    setEventDate(dateToUse || selectedDateStr);
    setEventTime('10:00');
    setLinkedGoalId('');
    setIsModalOpen(true);
  };

  const handleEdit = (event: AgendaEvent) => {
    setEditingId(event.id);
    setAgendaScope(event.userId || activeScope);
    setTitle(event.title);
    setDescription(event.description || '');
    setEventDate(event.date);
    setEventTime(event.time || '');
    setLinkedGoalId(event.goalId || '');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!title.trim() || !eventDate) return;

    const author =
      agendaScope === 'facu' ? 'Facu' : agendaScope === 'maia' ? 'Maia' : 'Facu & Maia';

    const event: AgendaEvent = {
      id: editingId || `event-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId: agendaScope,
      author,
      title: title.trim(),
      description: description.trim() || undefined,
      date: eventDate,
      time: eventTime.trim() || undefined,
      completed: editingId ? agendaEvents.find((e) => e.id === editingId)?.completed || false : false,
      goalId: linkedGoalId || undefined,
      createdAt: editingId
        ? agendaEvents.find((e) => e.id === editingId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
    };

    saveAgendaEvent(event);
    setIsModalOpen(false);
  };

  // Filtered by selected date or all
  const filteredEvents = viewMode === 'day'
    ? agendaEvents.filter((e) => e.date === selectedDateStr)
    : [...agendaEvents].sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''));

  return (
    <div className="space-y-6 pb-20 pt-1 sm:pt-2">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-manifest-ink flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-manifest-auraPurple" />
            Agenda Consciente
          </h2>
          <p className="text-xs text-manifest-inkMuted">
            Tus compromisos y momentos clave con intención
          </p>
        </div>

        <button
          onClick={() => handleOpenNew()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl primary-gradient-btn text-xs font-semibold shadow-glass"
        >
          <Plus className="w-4 h-4" />
          Actividad
        </button>
      </div>

      <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Left Column: Date Switcher & Mini Calendar Week Bar */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-3xl glass-card border border-white/95 shadow-glass space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                  className="p-1 rounded-full glass-pill hover:bg-white text-manifest-inkMuted hover:text-manifest-ink"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-serif text-sm font-bold capitalize text-manifest-ink">
                  {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                </span>
                <button
                  onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                  className="p-1 rounded-full glass-pill hover:bg-white text-manifest-inkMuted hover:text-manifest-ink"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setSelectedDate(new Date())}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full glass-pill text-manifest-inkMuted hover:text-manifest-ink"
              >
                Hoy
              </button>
            </div>

            {/* 7-Day horizontal slider */}
            <div className="flex items-center justify-between gap-1 overflow-x-auto scrollbar-none pt-1">
              {weekDays.map((day) => {
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                const dayStr = format(day, 'yyyy-MM-dd');
                const hasEvents = agendaEvents.some((e) => e.date === dayStr);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`flex flex-col items-center justify-center w-11 sm:w-12 py-2.5 rounded-2xl transition-all ${
                      isSelected
                        ? 'bg-manifest-ink text-white shadow-sm'
                        : 'glass-pill text-manifest-inkMuted hover:text-manifest-ink'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-semibold">
                      {format(day, 'EEE', { locale: es }).substring(0, 3)}
                    </span>
                    <span className={`text-xs font-bold mt-0.5 ${isToday && !isSelected ? 'text-manifest-auraPurple' : ''}`}>
                      {format(day, 'd')}
                    </span>
                    {hasEvents && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full mt-1 ${
                          isSelected ? 'bg-manifest-pink' : 'bg-manifest-auraPurple'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-manifest-inkMuted">
              {viewMode === 'day' ? 'Compromisos del día' : 'Vista cronológica total'} ({filteredEvents.length})
            </span>
            <div className="flex gap-1 p-0.5 rounded-xl glass-pill">
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'day' ? 'bg-white shadow-sm text-manifest-ink' : 'text-manifest-inkMuted'
                }`}
              >
                Día
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'all' ? 'bg-white shadow-sm text-manifest-ink' : 'text-manifest-inkMuted'
                }`}
              >
                Todos
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Events List */}
        <div className="lg:col-span-7 space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="p-8 sm:p-12 rounded-3xl glass-card text-center space-y-2 border border-white/80">
              <p className="text-xs text-manifest-inkMuted">
                {viewMode === 'day'
                  ? 'No hay actividades registradas para este día.'
                  : 'Aún no tienes compromisos en tu agenda.'}
              </p>
              <button
                onClick={() => handleOpenNew(selectedDateStr)}
                className="text-xs font-semibold text-manifest-auraPurple underline underline-offset-4"
              >
                + Añadir un compromiso para {format(selectedDate, "d 'de' MMMM", { locale: es })}
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredEvents.map((event) => {
                const linkedGoal = goals.find((g) => g.id === event.goalId);

                return (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 sm:p-5 rounded-2xl glass-card border border-white/90 shadow-glass flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => toggleAgendaEvent(event.id)}
                        className="mt-0.5 text-manifest-inkMuted hover:text-manifest-ink shrink-0 transition-transform active:scale-90"
                      >
                        {event.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Circle className="w-5 h-5 text-manifest-lavender" />
                        )}
                      </button>

                      <div className="space-y-1">
                        <p
                          className={`text-sm font-medium leading-snug ${
                            event.completed ? 'line-through text-manifest-inkLight' : 'text-manifest-ink'
                          }`}
                        >
                          {event.title}
                        </p>

                        {event.description && (
                          <p className="text-xs text-manifest-inkMuted leading-relaxed">
                            {event.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-manifest-inkMuted">
                          {event.time && (
                            <span className="flex items-center gap-1 font-medium">
                              <Clock className="w-3 h-3" />
                              {event.time}
                            </span>
                          )}
                          {viewMode === 'all' && (
                            <span>• {event.date}</span>
                          )}
                          {linkedGoal && (
                            <span className="px-2 py-0.5 rounded-full bg-manifest-celeste/40 text-manifest-ink text-[10px] font-medium flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              <span>{linkedGoal.title}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleEdit(event)}
                        className="p-1.5 rounded-full hover:bg-white text-manifest-inkMuted hover:text-manifest-ink"
                        title="Editar"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteAgendaEvent(event.id)}
                        className="p-1.5 rounded-full hover:bg-white text-manifest-inkMuted hover:text-rose-600"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Event Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-manifest-ink/35 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-sm rounded-3xl glass-card p-5 border border-white shadow-liquid space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/70">
                <h3 className="font-serif text-sm font-bold text-manifest-ink">
                  {editingId ? 'Editar Actividad' : 'Nueva Actividad Consciente'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-full glass-pill hover:bg-white text-manifest-inkMuted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-manifest-inkMuted block mb-1">
                    Espacio de la actividad
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-white/60 border border-white/80">
                    <button
                      type="button"
                      onClick={() => setAgendaScope(activeScope === 'maia' ? 'maia' : 'facu')}
                      className={`py-1 px-2 rounded-lg text-[11px] font-medium transition-all text-center ${
                        agendaScope !== 'shared'
                          ? 'bg-white shadow-sm text-manifest-ink font-semibold'
                          : 'text-manifest-inkMuted hover:bg-white/40'
                      }`}
                    >
                      {activeScope === 'maia' ? '🌸 Agenda de Maia' : '🌙 Agenda de Facu'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAgendaScope('shared')}
                      className={`py-1 px-2 rounded-lg text-[11px] font-medium transition-all text-center ${
                        agendaScope === 'shared'
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
                    Título o compromiso *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: Cita de manifestación, Paseo consciente..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-manifest-inkMuted block mb-1">
                      Fecha *
                    </label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl glass-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-manifest-inkMuted block mb-1">
                      Hora (opcional)
                    </label>
                    <input
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl glass-input text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-manifest-inkMuted block mb-1">
                    Descripción / Notas (opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalles para recordarte la intención..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none"
                  />
                </div>

                {goals.length > 0 && (
                  <div>
                    <label className="font-semibold text-manifest-inkMuted block mb-1">
                      Conectar a una intención (opcional)
                    </label>
                    <select
                      value={linkedGoalId}
                      onChange={(e) => setLinkedGoalId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                    >
                      <option value="">Ninguna intención</option>
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
                  className="px-3 py-1.5 rounded-xl text-xs text-manifest-inkMuted hover:text-manifest-ink"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!title.trim() || !eventDate}
                  className="px-4 py-1.5 rounded-xl primary-gradient-btn text-xs font-semibold disabled:opacity-50"
                >
                  {editingId ? 'Guardar Cambios' : 'Agendar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
