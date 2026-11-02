'use client';

import React, { useState, useRef } from 'react';
import { List, ListItem, Toggle } from 'konsta/react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useAppStore } from '@/store';
import { storage } from '@/services/storage';
import {
  Download,
  Upload,
  Shield,
  Trash2,
  Sparkles,
  User,
  Heart,
  AlertTriangle,
  Plus,
  X,
  Compass,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IOS_TAP_SPRING, LIQUID_GLASS_SPECULAR } from '@/lib/iosSprings';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, restoreFromBackup, showToast, isLiteMode, toggleLiteMode } = useAppStore();

  const [nameInput, setNameInput] = useState(settings.userName);
  const [newAffirmation, setNewAffirmation] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [favListRef] = useAutoAnimate<HTMLDivElement>({ duration: 220 });

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
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Native Cupertino Grouped List (<List inset strong>) with Liquid Glass */}
      <List
        inset
        strong
        colors={{
          strongBgIos: `${LIQUID_GLASS_SPECULAR} rounded-3xl overflow-hidden`,
        }}
        className="!my-2"
      >
        <ListItem
          title={
            <span className="font-serif text-sm font-bold text-manifest-ink flex items-center gap-2">
              <Zap className="w-4 h-4 text-manifest-auraPurple shrink-0" />
              <span>Modo Ligero (60 FPS)</span>
            </span>
          }
          subtitle={
            <span className="text-[11px] text-manifest-inkMuted">
              {isLiteMode ? 'Activado — Máxima fluidez sin blur' : 'Estándar — Efecto Liquid Glass completo'}
            </span>
          }
          text="Reduce desenfoques pesados y prioriza velocidad instantánea en redes lentas o ahorro de batería."
          after={
            <div data-testid="settings-toggle-lite-mode" onClick={toggleLiteMode} className="cursor-pointer">
              <Toggle
                checked={isLiteMode}
                onChange={() => toggleLiteMode()}
                colors={{
                  checkedBgIos: 'bg-emerald-500',
                }}
              />
            </div>
          }
        />

        <ListItem
          link
          chevronIos
          onClick={() => {
            updateSettings({ tutorialCompleted: false });
            showToast('Iniciando recorrido interactivo...', 'gentle');
          }}
          media={
            <div className="w-8 h-8 rounded-xl bg-manifest-lavender/60 flex items-center justify-center">
              <Compass className="w-4 h-4 text-manifest-auraPurple" />
            </div>
          }
          title={
            <span className="font-serif text-sm font-bold text-manifest-ink">
              Recorrido Interactivo del Santuario
            </span>
          }
          subtitle="Volver a abrir la guía paso a paso con láminas de foco"
        />
      </List>

      {/* User Profile / Greeting in Konsta Cupertino List */}
      <List
        inset
        strong
        colors={{
          strongBgIos: `${LIQUID_GLASS_SPECULAR} rounded-3xl overflow-hidden`,
        }}
        className="!my-2"
      >
        <ListItem
          title={
            <div className="flex items-center gap-2 pb-1">
              <User className="w-4 h-4 text-manifest-auraPurple" />
              <span className="font-serif text-sm font-bold text-manifest-ink">
                Tu Identidad en el Santuario
              </span>
            </div>
          }
          footer={
            <div className="pt-2 space-y-2 w-full">
              <label className="text-manifest-inkMuted text-xs font-medium block">
                ¿Cómo deseas que te llame la aplicación?
              </label>
              <div className="flex gap-2 w-full">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Tu nombre o apelativo íntimo..."
                  className="flex-1 min-w-0 px-3 py-2 rounded-xl glass-input text-xs"
                />
                <motion.button
                  whileTap={IOS_TAP_SPRING}
                  onClick={handleSaveName}
                  className="shrink-0 px-4 py-2 rounded-xl primary-gradient-btn font-semibold text-xs cursor-pointer"
                >
                  Actualizar
                </motion.button>
              </div>
            </div>
          }
        />
      </List>

      {/* Favorite Affirmations List */}
      <div className={`p-5 rounded-3xl ${LIQUID_GLASS_SPECULAR} space-y-3 mx-4`}>
        <div className="flex items-center gap-2 pb-2 border-b border-white/70">
          <Heart className="w-4 h-4 text-manifest-auraRose" />
          <h3 className="font-serif text-sm font-bold text-manifest-ink">
            Tus Afirmaciones Favoritas
          </h3>
        </div>

        <div ref={favListRef} className="space-y-2">
          {settings.favoriteAffirmations.map((aff, index) => (
            <div
              key={`${aff}-${index}`}
              className="p-3 rounded-2xl bg-white/70 border border-white flex items-center justify-between gap-2 text-xs"
            >
              <p className="font-medium text-manifest-ink leading-relaxed">
                {aff}
              </p>
              <button
                onClick={() => handleRemoveAffirmation(index)}
                className="p-1 rounded-full text-manifest-inkMuted hover:text-rose-500 shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-1 w-full">
          <input
            type="text"
            value={newAffirmation}
            onChange={(e) => setNewAffirmation(e.target.value)}
            placeholder="Añade una nueva afirmación que te inspire..."
            className="flex-1 min-w-0 px-3 py-2 rounded-xl glass-input text-xs"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddAffirmation();
              }
            }}
          />
          <motion.button
            whileTap={IOS_TAP_SPRING}
            onClick={handleAddAffirmation}
            className="shrink-0 px-3.5 py-2 rounded-xl glass-pill font-semibold text-xs text-manifest-ink flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Añadir
          </motion.button>
        </div>
      </div>

      {/* Backup and Restore in Konsta Cupertino List */}
      <List
        inset
        strong
        colors={{
          strongBgIos: `${LIQUID_GLASS_SPECULAR} rounded-3xl overflow-hidden`,
        }}
        className="!my-2"
      >
        <ListItem
          media={
            <div className="w-8 h-8 rounded-xl bg-manifest-lavender/60 flex items-center justify-center">
              <Download className="w-4 h-4 text-manifest-auraPurple" />
            </div>
          }
          title={
            <span className="font-serif text-sm font-bold text-manifest-ink">
              Copias de Seguridad & Restauración
            </span>
          }
          text="Exporta o restaura tus registros locales en formato JSON."
          footer={
            <div className="pt-3 space-y-2 w-full">
              {importError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 space-y-1">
                  <span className="font-bold block">Error al restaurar copia:</span>
                  <span className="leading-tight block">{importError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  whileTap={IOS_TAP_SPRING}
                  onClick={handleExportBackup}
                  className="py-2.5 px-3 rounded-2xl glass-pill border border-white font-semibold text-xs text-manifest-ink flex items-center justify-center gap-1.5 hover:bg-white cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar JSON
                </motion.button>

                <motion.button
                  whileTap={IOS_TAP_SPRING}
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2.5 px-3 rounded-2xl primary-gradient-btn font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Restaurar Copia
                </motion.button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          }
        />

        <ListItem
          media={
            <div className="w-8 h-8 rounded-xl bg-emerald-100/80 flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-600" />
            </div>
          }
          title={
            <span className="font-serif text-xs font-bold text-manifest-ink">
              Privacidad Absoluta & Almacenamiento Local
            </span>
          }
          text="Tus manifestaciones y diario operan en tu dispositivo con sincronización segura."
        />
      </List>

      {/* Danger Zone: Clear Data */}
      <div className="px-4 pt-1 pb-2">
        <motion.button
          whileTap={IOS_TAP_SPRING}
          onClick={() => setShowClearConfirm(true)}
          className="w-full py-2.5 px-4 rounded-2xl border border-rose-200/60 text-xs font-semibold text-rose-600 hover:bg-rose-50/50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Restablecer datos de fábrica
        </motion.button>
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
