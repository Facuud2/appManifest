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
    accentColor: 'from-manifest-celeste/70 to-manifest-lavender/70',
  },
  {
    key: 'maia',
    label: 'Maia',
    icon: Heart,
    accentColor: 'from-manifest-pink/70 to-manifest-peach/70',
  },
  {
    key: 'shared',
    label: 'Juntos',
    icon: Sparkles,
    accentColor: 'from-manifest-lavender/70 via-manifest-butter/70 to-manifest-mint/70',
    badgeLabel: '✨',
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
    <div className={`w-full flex items-center ${className}`}>
      {/* Switcher Pill */}
      <div
        className="w-full relative p-1 rounded-2xl backdrop-blur-xl bg-white/75 border border-white/95 shadow-glass flex items-center justify-between"
        role="tablist"
        aria-label="Selector de Santuario Personal o Compartido"
      >
        {SCOPES.map((scope) => {
          const isActive = activeScope === scope.key;
          const Icon = scope.icon;

          return (
            <button
              key={scope.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveScope(scope.key)}
              className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 rounded-xl font-medium transition-all duration-200 select-none py-2 px-2 text-xs sm:text-sm ${
                isActive
                  ? 'text-manifest-ink font-semibold shadow-sm'
                  : 'text-manifest-inkMuted hover:text-manifest-ink hover:bg-white/40'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId={`${idPrefix}-activeUserScopeIndicator`}
                  className={`absolute inset-0 rounded-xl bg-gradient-to-r ${scope.accentColor} border border-white shadow-sm -z-10`}
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <Icon
                className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                  isActive ? 'scale-110 text-manifest-ink' : 'opacity-70'
                }`}
              />
              <span className="tracking-tight whitespace-nowrap">{scope.label}</span>
              {scope.badgeLabel && !isActive && (
                <span className="text-[10px] leading-none opacity-80">{scope.badgeLabel}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};