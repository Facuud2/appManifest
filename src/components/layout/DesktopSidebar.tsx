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
      className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 h-full border-r border-white/80 bg-white/60 backdrop-blur-3xl shadow-[4px_0_24px_-4px_rgba(184,163,248,0.12)] z-20 select-none overflow-y-auto"
    >
      <div className="flex flex-col h-full min-h-max p-4 xl:p-5 space-y-4">
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-manifest-pink via-manifest-lavender to-manifest-celeste flex items-center justify-center shadow-glass border border-white">
              <Sparkles className="w-5 h-5 text-manifest-ink" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-serif font-bold text-lg text-manifest-ink leading-tight tracking-tight">
                  Manifest
                </h1>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[11px] text-manifest-inkMuted tracking-wide font-medium">
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
        <div className="p-3 rounded-2xl glass-card border border-white/85 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-manifest-lavender to-manifest-pink flex items-center justify-center text-xs font-bold text-manifest-ink border border-white shadow-xs shrink-0">
                {getUserInitial()}
              </div>
              <span className="font-semibold text-xs text-manifest-ink truncate">
                {activeScope === 'shared' ? 'Facu & Maia' : settings.userName}
              </span>
            </div>
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100/80 text-amber-900 text-[10px] font-bold border border-amber-200/60 shadow-2xs shrink-0"
              title="Días consecutivos de conexión activa"
            >
              <Flame className="w-3 h-3 text-amber-500 fill-amber-400" />
              <span>{settings.dailyStreak} {settings.dailyStreak === 1 ? 'día' : 'días'}</span>
            </div>
          </div>
          <p className="text-[11px] text-manifest-inkMuted leading-tight font-medium pl-0.5">
            {activeScope === 'shared' ? 'Co-creación y sincronía en equipo' : 'Presencia activa y consciente'}
          </p>
        </div>

        {/* Quick Creation Actions Bar */}
        <div className="space-y-1.5 pt-1">
          <button
            onClick={() => openJournalEditor('manifestation')}
            className="w-full py-2.5 px-3.5 rounded-2xl primary-gradient-btn text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all duration-200 hover:brightness-105 active:scale-[0.98] cursor-pointer"
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>Escribir en el Diario</span>
          </button>

          <button
            onClick={() => openAffirmationEditor()}
            className="w-full py-2 px-3 rounded-xl glass-pill hover:bg-white/80 text-xs text-manifest-ink font-medium flex items-center justify-center gap-1.5 transition-all duration-200 border border-white/90 shadow-2xs cursor-pointer"
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
                  className={`w-full relative flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left transition-all duration-200 group cursor-pointer ${
                    isActive
                      ? 'text-manifest-ink font-semibold'
                      : 'text-manifest-inkMuted hover:text-manifest-ink hover:bg-white/50'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeDesktopTab"
                      className="absolute inset-0 rounded-2xl bg-white/85 border border-purple-200/70 shadow-[0_4px_16px_rgba(184,163,248,0.15)]"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    >
                      <div className="absolute left-1.5 top-2.5 bottom-2.5 w-1 rounded-full bg-gradient-to-b from-manifest-auraPurple to-manifest-pink" />
                    </motion.div>
                  )}
                  <div
                    className={`relative z-10 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-105 ${
                      isActive
                        ? 'bg-gradient-to-tr from-purple-100 to-pink-50 text-manifest-ink shadow-2xs border border-white'
                        : 'bg-white/50 text-manifest-inkMuted border border-white/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="relative z-10 flex-1 min-w-0">
                    <span className="text-xs font-semibold block truncate leading-tight">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-manifest-inkMuted block truncate font-normal leading-tight mt-0.5">
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
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-white/75 via-purple-50/50 to-pink-50/40 border border-white/90 shadow-glass-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-manifest-ink">
                <Sparkles className="w-3.5 h-3.5 text-manifest-auraPurple fill-manifest-auraPurple/30" />
                <span>Oráculo Cósmico</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100/70 text-purple-800 font-bold">
                {etherFragments} ✨
              </span>
            </div>
            <p className="text-[10px] text-manifest-inkMuted leading-tight">
              Sintoniza una revelación mística y sincronía para tu día.
            </p>
            <button
              onClick={() => openOracle()}
              className="w-full py-1.5 px-2.5 rounded-xl bg-white/90 hover:bg-white text-[11px] font-semibold text-purple-900 flex items-center justify-center gap-1.5 border border-purple-200/60 shadow-2xs transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
            >
              <span>Girar Oráculo</span>
              <Sparkles className="w-3 h-3 text-manifest-auraPurple" />
            </button>
          </div>
        </div>

        {/* Footer Info & PWA / Turso Cloud Trigger */}
        <div className="pt-3 border-t border-white/70 space-y-2 mt-auto">
          <button
            onClick={onOpenInstallGuide}
            className="w-full flex items-center justify-between p-2.5 rounded-xl glass-pill hover:bg-white/90 text-xs text-manifest-inkMuted hover:text-manifest-ink transition-all border border-white/80 shadow-2xs cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-manifest-auraPurple" />
              <span>Instalar como App</span>
            </span>
            <span className="text-[10px] uppercase font-bold text-manifest-auraPurple bg-purple-100/70 px-1.5 py-0.5 rounded-md">
              PWA
            </span>
          </button>

          <div className="flex items-center justify-between text-[10px] text-manifest-inkMuted px-1 pt-0.5">
            <button
              onClick={handleManualSync}
              title="Haz clic para sincronizar con Turso Cloud"
              className="flex items-center gap-1.5 hover:text-manifest-ink transition-colors cursor-pointer group"
            >
              <RefreshCw
                className={`w-3 h-3 text-emerald-600 transition-transform ${
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
