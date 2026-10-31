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
  const [greeting, setGreeting] = useState('Hola');
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('Buenos días');
    } else if (hour >= 12 && hour < 20) {
      setGreeting('Buenas tardes');
    } else {
      setGreeting('Buenas noches');
    }

    if (typeof window !== 'undefined') {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(isStandaloneMode);
    }
  }, []);

  const getSubtitle = () => {
    switch (activeScope) {
      case 'facu':
        return 'Santuario de Facu';
      case 'maia':
        return 'Santuario de Maia';
      case 'shared':
        return 'Espacio de Facu & Maia';
      default:
        return 'Manifest Santuario';
    }
  };

  return (
    <header className="lg:hidden sticky top-0 z-30 w-full px-3.5 pt-2.5 pb-2.5 backdrop-blur-2xl bg-white/70 border-b border-white/70 shadow-sm">
      <div className="max-w-md mx-auto space-y-2.5">
        {/* Top Row: Brand & Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-manifest-pink via-manifest-lavender to-manifest-celeste flex items-center justify-center shadow-glass border border-white">
              <Sparkles className="w-4 h-4 text-manifest-ink" />
            </div>
            <div>
              <h2 className="text-[11px] font-semibold tracking-wide uppercase text-manifest-inkMuted/80 leading-none">
                {greeting}, {settings.userName}
              </h2>
              <h1 className="text-sm font-serif font-bold text-manifest-ink leading-tight">
                {getSubtitle()}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Streak pill */}
            <div
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full glass-pill text-[11px] font-medium text-manifest-ink shadow-sm"
              title="Días consecutivos de conexión personal"
            >
              <Flame className="w-3 h-3 text-amber-500 fill-amber-400" />
              <span>{settings.dailyStreak}d</span>
            </div>

            {/* PWA Install Button */}
            {!isStandalone && (
              <button
                onClick={onOpenInstallGuide}
                className="p-1 rounded-full glass-pill text-manifest-inkMuted hover:text-manifest-ink transition-colors"
                title="Instalar en tu dispositivo"
                aria-label="Instalar app"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* User Scope Switcher (Facu / Maia / Juntos) Full Width */}
        <div className="w-full">
          <UserScopeSwitcher fullWidth idPrefix="mobile-header" className="w-full" />
        </div>
      </div>
    </header>
  );
};