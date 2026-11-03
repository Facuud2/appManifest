'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { UserScope } from '@/types';
import { motion } from 'framer-motion';
import { Moon, Sparkles, Heart, Plus } from 'lucide-react';
import { IOS_TAP_SPRING } from '@/lib/iosSprings';

const SCOPES: {
  key: UserScope;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  activeColor: string;
}[] = [
  {
    key: 'facu',
    label: 'Facu',
    icon: Moon,
    activeColor: 'text-indigo-900',
  },
  {
    key: 'maia',
    label: 'Maia',
    icon: Heart,
    activeColor: 'text-pink-900',
  },
  {
    key: 'shared',
    label: 'Juntos',
    icon: Sparkles,
    activeColor: 'text-purple-950',
  },
];

export const MobileTopHeader: React.FC = () => {
  const {
    activeTab,
    activeScope,
    setActiveScope,
    openAffirmationEditor,
    openJournalEditor,
  } = useAppStore();

  // Dynamic time-based greeting for Inicio
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Buenos días' : currentHour < 20 ? 'Buenas tardes' : 'Buenas noches';
  const displayName = activeScope === 'facu' ? 'Facu' : activeScope === 'maia' ? 'Maia' : 'Chicos';

  // Editorial title per tab
  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'inicio':
        return `${greeting}, ${displayName}`;
      case 'objetivos':
        return 'Mis Decretos';
      case 'diario':
        return 'Grimorio & Diario';
      case 'espacio':
        return 'Mi Santuario';
      default:
        return 'Manifest';
    }
  };

  return (
    <header
      data-testid="mobile-top-header"
      className="lg:hidden sticky top-0 z-40 w-full bg-white/85 backdrop-blur-2xl border-b border-purple-100/80 px-4 pt-2.5 pb-2 transition-all shadow-[0_2px_16px_rgba(100,70,160,0.05)] space-y-2 select-none"
    >
      {/* 1. Fila Principal: Título Editorial a la izquierda, Acción rápida contextual a la derecha */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1
            data-testid="mobile-header-title"
            className="text-lg font-serif font-bold text-slate-900 tracking-tight truncate leading-snug"
          >
            {getHeaderTitle()}
          </h1>
        </div>

        {/* Botón de acción rápida contextual con diseño de píldora compacta */}
        <div className="shrink-0 flex items-center">
          {activeTab === 'inicio' && (
            <motion.button
              type="button"
              whileTap={IOS_TAP_SPRING}
              onClick={() => openAffirmationEditor(null)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full primary-gradient-btn text-xs font-serif tracking-wide shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+ Decreto</span>
            </motion.button>
          )}

          {activeTab === 'objetivos' && (
            <motion.button
              type="button"
              whileTap={IOS_TAP_SPRING}
              data-testid="mobile-header-action-decreto"
              onClick={() => openAffirmationEditor(null)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full primary-gradient-btn text-xs font-serif tracking-wide shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+ Decreto</span>
            </motion.button>
          )}

          {activeTab === 'diario' && (
            <motion.button
              type="button"
              whileTap={IOS_TAP_SPRING}
              data-testid="mobile-header-action-escribir"
              onClick={() => openJournalEditor('manifestation', null)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full primary-gradient-btn text-xs font-serif tracking-wide shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+ Escribir</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* 2. Sub-cabecera: Segmented Control compacto con pastilla deslizante (layoutId="space-selector-pill") */}
      <div className="w-full flex items-center justify-center">
        <div
          role="tablist"
          aria-label="Selector de Espacio"
          className="relative w-full max-w-[320px] mx-auto rounded-full p-0.5 bg-purple-50/70 border border-purple-100/90 shadow-inner flex items-center justify-between"
        >
          {SCOPES.map((scope) => {
            const isActive = activeScope === scope.key;
            const Icon = scope.icon;

            return (
              <button
                key={scope.key}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setActiveScope(scope.key)}
                className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-full font-sans text-xs transition-colors duration-150 select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-manifest-auraPurple ${
                  isActive ? `${scope.activeColor} font-bold` : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="space-selector-pill"
                    className="absolute inset-0 rounded-full bg-white border border-purple-200/90 shadow-[0_2px_8px_rgba(99,102,241,0.12)] -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <Icon className={`w-3.5 h-3.5 shrink-0 transition-transform ${isActive ? 'scale-105' : ''}`} />
                <span className="tracking-tight whitespace-nowrap">{scope.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
