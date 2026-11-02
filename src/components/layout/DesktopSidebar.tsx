'use client';

import React, { useState } from 'react';
import { useAppStore, AppTab } from '@/store';
import {
  Sparkles,
  BookOpen,
  Target,
  Compass,
  Flame,
  Shield,
  Download,
  PenLine,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { UserScopeSwitcher } from './UserScopeSwitcher';

interface NavItem {
  key: AppTab;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'inicio', label: 'Inicio', subtitle: 'Santuario y Resumen', icon: Sparkles },
  { key: 'objetivos', label: 'Afirmaciones', subtitle: 'Decretos y Sets Rampage', icon: Target },
  { key: 'diario', label: 'Diario', subtitle: 'Cuaderno y Reflexiones', icon: BookOpen },
  { key: 'espacio', label: 'Mi Espacio', subtitle: 'Progreso y Configuración', icon: Compass },
];

interface DesktopSidebarProps {
  onOpenInstallGuide: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ onOpenInstallGuide }) => {
  const {
    activeTab,
    setActiveTab,
    openJournalEditor,
    openAffirmationEditor,
    openOracle,
    etherFragments,
    settings,
    activeScope,
    isSyncing,
    syncFromRemote,
  } = useAppStore();

  const [isSyncTriggered, setIsSyncTriggered] = useState(false);

  const handleManualSync = async () => {
    if (isSyncing) return;
    setIsSyncTriggered(true);
    try {
      await syncFromRemote();
    } finally {
      setTimeout(() => setIsSyncTriggered(false), 800);
    }
  };

  const getScopeSubtitle = () => {
    switch (activeScope) {
      case 'facu':
        return 'Santuario de Facu';
      case 'maia':
        return 'Santuario de Maia';
      case 'shared':
        return 'Espacio de Facu & Maia';
      default:
        return 'Santuario Personal';
    }
  };

  const getUserInitial = () => {
    if (activeScope === 'shared') return '✨';
    if (activeScope === 'maia') return 'M';
    return (settings.userName || 'F').charAt(0).toUpperCase();
  };

  return (
    <aside
      aria-label="Barra lateral de navegación"
      className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 h-full border-r border-manifest-glassBorder bg-manifest-surfaceNav/95 backdrop-blur-3xl shadow-lens z-20 select-none overflow-y-auto"
    >
      <div className="flex flex-col h-full min-h-max p-4 xl:p-5 space-y-4">
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-manifest-glassBorder">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-manifest-glassControl border border-manifest-glassBorder flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-manifest-auraPurple" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-serif font-bold text-lg text-manifest-ink leading-tight tracking-tight">
                  Manifest
                </h1>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-manifest-inkLight tracking-wide font-medium">
                {getScopeSubtitle()}
              </p>
            </div>
          </div>
        </div>

        {/* User Scope Switcher (Facu / Maia / Juntos) */}
        <div className="pt-0.5">
          <UserScopeSwitcher idPrefix="desktop-sidebar" className="w-full justify-between" />
        </div>

        {/* User Profile & Connection Streak Card */}
        <div className="p-3 rounded-2xl glass-card shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-manifest-glassControl border border-manifest-glassBorder flex items-center justify-center text-xs font-bold text-manifest-ink shadow-xs shrink-0">
                {getUserInitial()}
              </div>
              <span className="font-semibold text-xs text-manifest-ink truncate">
                {activeScope === 'shared' ? 'Facu & Maia' : settings.userName}
              </span>
            </div>
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100/70 text-amber-900 text-[10px] font-bold border border-amber-300/60 shadow-neu-sm shrink-0"
              title="Días consecutivos de conexión activa"
            >
              <Flame className="w-3 h-3 text-amber-600 fill-amber-500" />
              <span>{settings.dailyStreak} {settings.dailyStreak === 1 ? 'día' : 'días'}</span>
            </div>
          </div>
          <p className="text-[11px] text-manifest-inkLight leading-tight font-medium pl-0.5">
            {activeScope === 'shared' ? 'Co-creación y sincronía mística' : 'Presencia y verdad consciente'}
          </p>
        </div>

        {/* Quick Creation Actions Bar */}
        <div className="space-y-1.5 pt-1">
          <button
            onClick={() => openJournalEditor('manifestation')}
            className="w-full py-2.5 px-3.5 rounded-2xl primary-gradient-btn text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all duration-200 hover:brightness-110 active:scale-[0.98] cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none"
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>Escribir en el Diario</span>
          </button>

          <button
            onClick={() => openAffirmationEditor()}
            className="w-full py-2 px-3 rounded-xl glass-pill hover:bg-manifest-glassControlHover text-xs text-manifest-ink font-medium flex items-center justify-center gap-1.5 transition-all duration-200 border border-manifest-glassBorder shadow-2xs cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none"
          >
            <Plus className="w-3.5 h-3.5 text-manifest-auraPurple" />
            <span>Nueva Afirmación</span>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="space-y-1 pt-2">
          <div className="px-3 pb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-manifest-inkLight">
              Navegación
            </span>
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.key;
              const Icon = item.icon;

              return (
                <button
                  key={item.key}
                  data-tour={`desktop-nav-${item.key}`}
                  onClick={() => setActiveTab(item.key)}
                  className={`w-full relative flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left transition-all duration-200 group cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none ${
                    isActive
                      ? 'text-manifest-ink font-semibold'
                      : 'text-manifest-inkMuted hover:text-manifest-ink hover:bg-manifest-glassControlHover'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeDesktopTab"
                      className="absolute inset-0 rounded-2xl bg-manifest-glassControlActive border border-manifest-glassBorderFocus shadow-[0_0_16px_var(--color-brass-glow)]"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    >
                      <div className="absolute left-1.5 top-2.5 bottom-2.5 w-1 rounded-full bg-manifest-auraPurple" />
                    </motion.div>
                  )}
                  <div
                    className={`relative z-10 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-105 ${
                      isActive
                        ? 'bg-manifest-glassControl text-manifest-ink shadow-2xs border border-manifest-glassBorderFocus'
                        : 'bg-manifest-glassControl text-manifest-inkMuted border border-manifest-glassBorder'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="relative z-10 flex-1 min-w-0">
                    <span className="text-xs font-semibold block truncate leading-tight">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-manifest-inkLight block truncate font-normal leading-tight mt-0.5">
                      {item.subtitle}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Cosmic Oracle Card / Ethereal Feature Widget */}
        <div className="pt-2">
          <div className="p-3.5 rounded-2xl glass-card border border-manifest-glassBorder shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-manifest-ink">
                <Sparkles className="w-3.5 h-3.5 text-manifest-auraPurple fill-manifest-auraPurple/30" />
                <span>Oráculo Cósmico</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-manifest-glassControl text-manifest-auraPurple font-bold border border-manifest-glassBorder">
                {etherFragments} ✧
              </span>
            </div>
            <p className="text-[10px] text-manifest-inkLight leading-tight">
              Sintoniza una revelación mística y sincronía para tu día.
            </p>
            <button
              onClick={() => openOracle()}
              className="w-full py-1.5 px-2.5 rounded-xl glass-pill hover:bg-manifest-glassControlHover text-[11px] font-semibold text-manifest-ink flex items-center justify-center gap-1.5 border border-manifest-glassBorder shadow-2xs transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none"
            >
              <span>Girar Oráculo</span>
              <Sparkles className="w-3 h-3 text-manifest-auraPurple" />
            </button>
          </div>
        </div>

        {/* Footer Info & PWA / Turso Cloud Trigger */}
        <div className="pt-3 border-t border-manifest-glassBorder space-y-2 mt-auto">
          <button
            onClick={onOpenInstallGuide}
            className="w-full flex items-center justify-between p-2.5 rounded-xl glass-pill hover:bg-manifest-glassControlHover text-xs text-manifest-inkLight hover:text-manifest-ink transition-all border border-manifest-glassBorder shadow-2xs cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none"
          >
            <span className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-manifest-auraPurple" />
              <span>Instalar como App</span>
            </span>
            <span className="text-[10px] uppercase font-bold text-manifest-auraPurple bg-manifest-glassControl border border-manifest-glassBorder px-1.5 py-0.5 rounded-md">
              PWA
            </span>
          </button>

          <div className="flex items-center justify-between text-[10px] text-manifest-inkLight px-1 pt-0.5">
            <button
              onClick={handleManualSync}
              title="Haz clic para sincronizar con Turso Cloud"
              className="flex items-center gap-1.5 hover:text-manifest-ink transition-colors cursor-pointer group focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none rounded"
            >
              <RefreshCw
                className={`w-3 h-3 text-emerald-400 transition-transform ${
                  isSyncing || isSyncTriggered ? 'animate-spin' : 'group-hover:rotate-45'
                }`}
              />
              <span className="font-medium">
                {isSyncing || isSyncTriggered ? 'Sincronizando...' : 'Turso Cloud Replicado'}
              </span>
            </button>
            <span className="font-semibold text-manifest-inkLight">v2.2</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
