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
    accentColor: 'from-manifest-celeste/40 via-manifest-lavender/40 to-manifest-celeste/30 border-manifest-celeste/50',
  },
  {
    key: 'maia',
    label: 'Maia',
    icon: Heart,
    accentColor: 'from-manifest-pink/40 via-manifest-peach/40 to-manifest-pink/30 border-manifest-pink/50',
  },
  {
    key: 'shared',
    label: 'Juntos',
    icon: Sparkles,
    accentColor: 'from-manifest-butter/40 via-manifest-mint/40 to-manifest-lavender/30 border-manifest-butter/50',
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
        className={`w-full relative rounded-full backdrop-blur-xl bg-manifest-surfaceNav/90 border border-manifest-glassBorder shadow-glass flex items-center justify-between ${
          compact ? 'p-0.5' : 'p-1'
        }`}
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
              className={`relative z-10 flex-1 flex items-center justify-center gap-1 rounded-full font-sans transition-all duration-200 select-none cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none ${
                compact ? 'py-1 px-1.5 text-[11px] font-medium' : 'py-1.5 px-2.5 text-xs font-medium'
              } ${
                isActive
                  ? 'text-manifest-ink font-bold shadow-xs'
                  : 'text-manifest-inkMuted hover:text-manifest-ink hover:bg-manifest-glassControlHover'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId={`${idPrefix}-activeUserScopeIndicator`}
                  className={`absolute inset-0 rounded-full bg-gradient-to-r ${scope.accentColor} border shadow-xs -z-10`}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Icon
                className={`transition-transform shrink-0 ${
                  compact ? 'w-3 h-3' : 'w-3.5 h-3.5'
                } ${isActive ? 'scale-110 text-manifest-brass' : 'opacity-60'}`}
              />
              <span className="tracking-tight whitespace-nowrap">{scope.label}</span>
              {scope.badgeLabel && !isActive && (
                <span className="text-[9px] leading-none opacity-80">{scope.badgeLabel}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
