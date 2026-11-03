'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { UserScope } from '@/types';
import { motion } from 'framer-motion';
import { Moon, Sparkles, Heart } from 'lucide-react';

interface ScopeOption {
  key: UserScope;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeLabel?: string;
}

const SCOPES: ScopeOption[] = [
  {
    key: 'facu',
    label: 'Facu',
    icon: Moon,
    accentColor: 'text-indigo-950',
  },
  {
    key: 'maia',
    label: 'Maia',
    icon: Heart,
    accentColor: 'text-pink-950',
  },
  {
    key: 'shared',
    label: 'Juntos',
    icon: Sparkles,
    accentColor: 'text-purple-950',
    badgeLabel: '✧',
  },
];

interface UserScopeSwitcherProps {
  className?: string;
  compact?: boolean;
  fullWidth?: boolean;
  idPrefix?: string;
}

export const UserScopeSwitcher: React.FC<UserScopeSwitcherProps> = ({
  className = '',
  compact = false,
  fullWidth = true,
  idPrefix = 'scope',
}) => {
  const { activeScope, setActiveScope } = useAppStore();

  return (
    <div className={`w-full flex items-center justify-center ${className}`}>
      {/* Switcher Pill */}
      <div
        className={`w-full relative rounded-full backdrop-blur-xl bg-white/85 border border-purple-200/80 shadow-[0_2px_12px_rgba(139,92,246,0.06)] flex items-center justify-between ${
          compact ? 'p-0.5' : 'p-1'
        }`}
        role="tablist"
        aria-label="Selector de Santuario Personal o Compartido"
      >
        {SCOPES.map((scope) => {
          const isActive = activeScope === scope.key;
          const Icon = scope.icon;

          const activeIconColor =
            scope.key === 'facu'
              ? 'text-indigo-600'
              : scope.key === 'maia'
              ? 'text-pink-600'
              : 'text-purple-600';

          return (
            <button
              key={scope.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveScope(scope.key)}
              className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 rounded-full font-sans transition-all duration-200 select-none cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none ${
                compact ? 'py-1 px-1.5 text-[11px]' : 'py-1.5 px-2.5 text-xs'
              } ${
                isActive
                  ? `${scope.accentColor} font-bold shadow-xs`
                  : 'text-slate-600 hover:text-slate-900 font-medium hover:bg-slate-100/50'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId={`${idPrefix}-activeUserScopeIndicator`}
                  className="absolute inset-0 rounded-full bg-white border border-purple-200/90 shadow-[0_2px_8px_rgba(99,102,241,0.12)] -z-10"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Icon
                className={`transition-transform shrink-0 ${
                  compact ? 'w-3 h-3' : 'w-3.5 h-3.5'
                } ${isActive ? `scale-110 ${activeIconColor}` : 'text-slate-500'}`}
              />
              <span className="tracking-tight whitespace-nowrap">{scope.label}</span>
              {scope.badgeLabel && !isActive && (
                <span className="text-[9px] leading-none text-purple-600 font-bold">{scope.badgeLabel}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
