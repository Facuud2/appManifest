'use client';

import React, { useState, useRef } from 'react';
import { useAppStore } from '@/store';
import { storage } from '@/services/storage';
import {
  Settings,
  Download,
  Upload,
  Shield,
  Trash2,
  Sparkles,
  User,
  Heart,
  Check,
  AlertTriangle,
  Plus,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, restoreFromBackup, showToast } = useAppStore();

  const [nameInput, setNameInput] = useState(settings.userName);
  const [newAffirmation, setNewAffirmation] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveName = () => {
    if (!nameInput.trim()) return;
    updateSettings({ userName: nameInput.trim() });
  };

  const handleAddAffirmation = () => {
    if (!newAffirmation.trim()) return;
    const updated = [...settings.favoriteAffirmations, newAffirmation.trim()];
    updateSettings({ favoriteAffirmations: updated });
    setNewAffirmation('');
  };

  const handleRemoveAffirmation = (index: number) => {
    const updated = settings.favoriteAffirmations.filter((_, i) => i !== index);
    updateSettings({ favoriteAffirmations: updated });
  };

  // Export JSON file
  const handleExportBackup = () => {
    const backup = storage.exportBackup();
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `manifest-santuario-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Copia de seguridad descargada en tu dispositivo 💾', 'success');
  };

  // Import JSON file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const res = restoreFromBackup(content);
      if (!res.success) {
        setImportError(res.error || res.message);
      } else {
        setImportError(null);
      }
    };
    reader.onerror = () => {
      setImportError('Error al leer el archivo seleccionado.');
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearAll = () => {
    storage.clearAllData();
    setShowClearConfirm(false);
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* User Profile / Greeting */}
      <div className="p-5 rounded-3xl glass-card border border-white/95 shadow-glass space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-white/70">
          <User className="w-4 h-4 text-manifest-auraPurple" />
          <h3 className="font-serif text-sm font-bold text-manifest-ink">
            Tu Identidad en el Santuario
          </h3>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="text-manifest-inkMuted font-medium block mb-1">
              ¿Cómo deseas que te llame la aplicación?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Tu nombre o apelativo íntimo..."
                className="flex-1 px-3 py-2 rounded-xl glass-input text-xs"
              />
              <button
                onClick={handleSaveName}
                className="px-4 py-2 rounded-xl primary-gradient-btn font-semibold text-xs"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Favorite Affirmations List */}
      <div className="p-5 rounded-3xl glass-card border border-white/95 shadow-glass space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-white/70">
          <Heart className="w-4 h-4 text-manifest-auraRose" />
          <h3 className="font-serif text-sm font-bold text-manifest-ink">
            Tus Afirmaciones Favoritas
          </h3>
        </div>

        <div className="space-y-2">
          {settings.favoriteAffirmations.map((aff, index) => (
            <div
              key={index}
              className="p-3 rounded-2xl bg-white/70 border border-white flex items-center justify-between gap-2 text-xs"
            >
              <p className="font-serif italic text-manifest-ink leading-relaxed">
                «{aff}»
              </p>
              <button
                onClick={() => handleRemoveAffirmation(index)}
                className="p-1 rounded-full text-manifest-inkMuted hover:text-rose-500 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-1">
          <input
            type="text"
            value={newAffirmation}
            onChange={(e) => setNewAffirmation(e.target.value)}
            placeholder="Añade una nueva afirmación que te inspire..."
            className="flex-1 px-3 py-2 rounded-xl glass-input text-xs"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddAffirmation();
              }
            }}
          />
          <button
            onClick={handleAddAffirmation}
            className="px-3.5 py-2 rounded-xl glass-pill font-semibold text-xs text-manifest-ink flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Añadir
          </button>
        </div>
      </div>

      {/* Backup and Restore */}
      <div className="p-5 rounded-3xl glass-card border border-white/95 shadow-glass space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-white/70">
          <Download className="w-4 h-4 text-manifest-auraPurple" />
          <h3 className="font-serif text-sm font-bold text-manifest-ink">
            Copias de Seguridad & Restauración
          </h3>
        </div>

        <p className="text-xs text-manifest-inkMuted leading-relaxed">
          Todos tus registros, intenciones y reflexiones se encuentran guardados localmente en este navegador. Te recomendamos exportar periódicamente una copia en archivo JSON.
        </p>

        {importError && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 space-y-1">
            <span className="font-bold block">Error al restaurar copia:</span>
            <span className="leading-tight block">{importError}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleExportBackup}
            className="py-2.5 px-3 rounded-2xl glass-pill border border-white font-semibold text-xs text-manifest-ink flex items-center justify-center gap-1.5 hover:bg-white"
          >
            <Download className="w-3.5 h-3.5" />
            Descargar JSON
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="py-2.5 px-3 rounded-2xl primary-gradient-btn font-semibold text-xs flex items-center justify-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            Restaurar Copia
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Privacy and Data Transparency Notice */}
      <div className="p-4 rounded-3xl glass-card border border-white/80 space-y-2">
        <div className="flex items-center gap-2 text-manifest-ink font-semibold text-xs">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Privacidad Absoluta & Almacenamiento Local</span>
        </div>
        <p className="text-[11px] text-manifest-inkMuted leading-relaxed">
          Manifest Journal opera 100% en tu navegador mediante <code>localStorage</code>. No hay bases de datos remotas, servidores de seguimiento ni análisis invasivos. Recuerda que si limpias el historial o caché del navegador, podrías borrar los registros locales a menos que tengas tu archivo de copia descargado.
        </p>
      </div>

      {/* Danger Zone: Clear Data */}
      <div className="pt-2">
        <button
          onClick={() => setShowClearConfirm(true)}
          className="w-full py-2.5 px-4 rounded-2xl border border-rose-200/60 text-xs font-semibold text-rose-600 hover:bg-rose-50/50 flex items-center justify-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Restablecer datos de fábrica
        </button>
      </div>

      {/* Clear Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-manifest-ink/35 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl glass-card p-6 border border-white/95 text-center space-y-3.5"
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h4 className="font-serif text-base font-bold text-manifest-ink">
                ¿Borrar todos los registros?
              </h4>

              <p className="text-xs text-manifest-inkMuted leading-relaxed">
                Esta acción eliminará todas las entradas, intenciones y compromisos de este dispositivo y restablecerá los datos iniciales.
              </p>

              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 rounded-xl glass-pill text-xs font-medium text-manifest-ink"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md hover:bg-rose-700"
                >
                  Sí, borrar todo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
