'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { Flame, Download, Sparkles } from 'lucide-react';
import { UserScopeSwitcher } from './UserScopeSwitcher';

interface AppHeaderProps {
  onOpenInstallGuide: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenInstallGuide }) => {
  const { settings, activeScope } = useAppStore();
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(isStandaloneMode);
    }
  }, []);

  const getScopeSubtitle = () => {
    switch (activeScope) {
      case 'facu':
        return 'Santuario de Facu';
      case 'maia':
        return 'Santuario de Maia';
      case 'shared':
        return 'Espacio de Facu & Maia';
      default:
        return 'Santuario Consciente';
    }
  };

  return (
    <header className="lg:hidden sticky top-0 z-30 w-full px-3.5 pt-2.5 pb-2 backdrop-blur-2xl bg-white/90 border-b border-white/80 shadow-sm transition-all space-y-2">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Brand logo & space name */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-manifest-pink via-manifest-lavender to-manifest-celeste flex items-center justify-center shadow-glass border border-white">
            <Sparkles className="w-3.5 h-3.5 text-manifest-ink" />
          </div>
          <div>
            <span className="font-serif font-bold text-xs tracking-tight text-manifest-ink block leading-tight">
              {getScopeSubtitle()}
            </span>
          </div>
        </div>

        {/* Right: Streak & PWA Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full glass-pill text-[11px] font-semibold text-manifest-ink shadow-sm"
            title="Días consecutivos de conexión personal"
          >
            <Flame className="w-3 h-3 text-amber-500 fill-amber-400" />
            <span>{settings.dailyStreak}d</span>
          </div>

          {!isStandalone && (
            <button
              onClick={onOpenInstallGuide}
              className="p-1.5 rounded-full glass-pill text-manifest-inkMuted hover:text-manifest-ink transition-colors"
              title="Instalar en tu dispositivo"
              aria-label="Instalar app"
            >
              <Download className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Full width Scope Switcher with generous space */}
      <div className="max-w-md mx-auto w-full">
        <UserScopeSwitcher fullWidth idPrefix="mobile-header" className="w-full" />
      </div>
    </header>
  );
};