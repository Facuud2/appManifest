'use client';

import React from 'react';
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
  { key: 'inicio', label: 'Inicio', subtitle: 'Tu santuario de manifestación', icon: Sparkles },
  { key: 'objetivos', label: 'Afirmaciones', subtitle: 'Tus afirmaciones y sets de rampage', icon: Target },
  { key: 'diario', label: 'Diario', subtitle: 'Notas y avances', icon: BookOpen },
  { key: 'espacio', label: 'Mi Espacio', subtitle: 'Progreso y santuario', icon: Compass },
];

interface DesktopSidebarProps {
  onOpenInstallGuide: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ onOpenInstallGuide }) => {
  const { activeTab, setActiveTab, openJournalEditor, settings, activeScope } = useAppStore();

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

  return (
    <aside className="hidden lg:flex flex-col w-72 shrink-0 sticky top-0 h-screen p-5 border-r border-white/70 bg-white/45 backdrop-blur-2xl z-20">
      {/* Brand Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/60">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-manifest-pink via-manifest-lavender to-manifest-celeste flex items-center justify-center shadow-glass border border-white">
          <Sparkles className="w-6 h-6 text-manifest-ink" />
        </div>
        <div>
          <h1 className="font-serif font-bold text-lg text-manifest-ink leading-tight">
            Manifest
          </h1>
          <p className="text-[11px] text-manifest-inkMuted tracking-wide font-medium">
            {getScopeSubtitle()}
          </p>
        </div>
      </div>

      {/* User Scope Switcher (Facu / Maia / Juntos) */}
      <div className="pt-4 pb-2">
        <UserScopeSwitcher idPrefix="desktop-sidebar" className="w-full justify-between" />
      </div>

      {/* User & Streak Banner */}
      <div className="my-3 p-3.5 rounded-2xl glass-card border border-white/80 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-serif font-semibold text-manifest-ink truncate max-w-[140px]">
            {settings.userName}
          </span>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100/70 text-amber-900 text-[10px] font-bold">
            <Flame className="w-3 h-3 text-amber-500 fill-amber-400" />
            <span>{settings.dailyStreak} {settings.dailyStreak === 1 ? 'día' : 'días'}</span>
          </div>
        </div>
        <p className="text-[11px] text-manifest-inkMuted leading-tight">
          {activeScope === 'shared' ? 'Co-creación y sincronía en equipo' : 'Presencia activa y consciente'}
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.key;
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              data-tour={`desktop-nav-${item.key}`}
              onClick={() => setActiveTab(item.key)}
              className={`w-full relative flex items-center gap-3.5 px-4 py-3 rounded-2xl text-left transition-all duration-200 group ${
                isActive
                  ? 'text-manifest-ink font-semibold'
                  : 'text-manifest-inkMuted hover:text-manifest-ink hover:bg-white/50'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeDesktopTab"
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-manifest-pink/40 via-manifest-lavender/45 to-manifest-celeste/40 border border-white/90 shadow-sm"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <div
                className={`relative z-10 w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                  isActive ? 'bg-white text-manifest-ink shadow-sm' : 'bg-white/40 text-manifest-inkMuted'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="relative z-10 flex-1 min-w-0">
                <span className="text-xs font-semibold block truncate">
                  {item.label}
                </span>
                <span className="text-[10px] opacity-75 block truncate font-normal">
                  {item.subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Quick Journal Writing Action */}
      <div className="pt-3 pb-2">
        <button
          onClick={() => openJournalEditor('progress')}
          className="w-full py-2.5 px-3 rounded-2xl primary-gradient-btn text-xs font-semibold flex items-center justify-center gap-2 shadow-sm"
        >
          <PenLine className="w-3.5 h-3.5" />
          <span>Escribir en el Diario</span>
        </button>
      </div>

      {/* Footer Info & PWA Trigger */}
      <div className="pt-3 border-t border-white/60 space-y-2">
        <button
          onClick={onOpenInstallGuide}
          className="w-full flex items-center justify-between p-2.5 rounded-xl glass-pill hover:bg-white text-xs text-manifest-inkMuted hover:text-manifest-ink transition-colors"
        >
          <span className="flex items-center gap-2">
            <Download className="w-3.5 h-3.5" />
            <span>Instalar como App</span>
          </span>
          <span className="text-[10px] uppercase font-bold text-manifest-auraPurple">PWA</span>
        </button>

        <div className="flex items-center justify-between text-[10px] text-manifest-inkMuted/80 px-1 pt-1">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-600" />
            Turso Cloud Replicado
          </span>
          <span>v2.2</span>
        </div>
      </div>
    </aside>
  );
};