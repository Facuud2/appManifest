'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { UserScope } from '@/types';
import { motion } from 'framer-motion';
import { Moon, Sparkles, Heart, Cloud, RefreshCw } from 'lucide-react';

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
}

export const UserScopeSwitcher: React.FC<UserScopeSwitcherProps> = ({
  className = '',
  compact = false,
}) => {
  const { activeScope, setActiveScope, isSyncing, lastSyncTime } = useAppStore();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Switcher Pill */}
      <div
        className="relative inline-flex p-1 rounded-2xl backdrop-blur-xl bg-white/60 border border-white/80 shadow-glass"
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
              className={`relative z-10 flex items-center justify-center gap-1.5 rounded-xl font-medium transition-all duration-200 select-none ${
                compact ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-xs'
              } ${
                isActive
                  ? 'text-manifest-ink font-semibold shadow-sm'
                  : 'text-manifest-inkMuted hover:text-manifest-ink hover:bg-white/30'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeUserScopeIndicator"
                  className={`absolute inset-0 rounded-xl bg-gradient-to-r ${scope.accentColor} border border-white shadow-sm -z-10`}
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <Icon
                className={`w-3.5 h-3.5 transition-transform ${
                  isActive ? 'scale-110 text-manifest-ink' : 'opacity-70'
                }`}
              />
              <span className="tracking-tight">{scope.label}</span>
              {scope.badgeLabel && !isActive && (
                <span className="text-[10px] leading-none opacity-80">{scope.badgeLabel}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Cloud Sync Status Indicator */}
      <div
        className="flex items-center gap-1 text-[11px] text-manifest-inkMuted px-1.5 py-1 rounded-lg hover:bg-white/40 transition-colors"
        title={
          isSyncing
            ? 'Sincronizando con Turso Cloud en tiempo real...'
            : lastSyncTime
            ? `Sincronizado con Turso a las ${lastSyncTime}`
            : 'Conectado a Turso Cloud'
        }
      >
        {isSyncing ? (
          <RefreshCw className="w-3 h-3 text-manifest-auraPurple animate-spin" />
        ) : (
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm" />
            <Cloud className="w-3 h-3 text-manifest-inkMuted/70" />
          </div>
        )}
      </div>
    </div>
  );
};