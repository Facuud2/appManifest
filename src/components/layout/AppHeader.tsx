'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { Flame, Download, Sparkles } from 'lucide-react';
import { UserScopeSwitcher } from './UserScopeSwitcher';

interface AppHeaderProps {
  onOpenInstallGuide: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenInstallGuide }) => {
  const { settings } = useAppStore();
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(isStandaloneMode);
    }
  }, []);

  return (
    <header className="lg:hidden sticky top-0 z-30 w-full px-3 py-2 backdrop-blur-2xl bg-white/85 border-b border-white/80 shadow-sm transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Brand logo & icon */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-manifest-pink via-manifest-lavender to-manifest-celeste flex items-center justify-center shadow-glass border border-white">
            <Sparkles className="w-3.5 h-3.5 text-manifest-ink" />
          </div>
          <span className="font-serif font-bold text-xs tracking-tight text-manifest-ink hidden min-[360px]:inline">
            Manifest
          </span>
        </div>

        {/* Center: Compact Scope Switcher */}
        <div className="flex-1 flex justify-center max-w-[210px] sm:max-w-[230px]">
          <UserScopeSwitcher compact fullWidth idPrefix="mobile-header" />
        </div>

        {/* Right: Streak & PWA Button */}
        <div className="flex items-center gap-1 shrink-0">
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full glass-pill text-[11px] font-semibold text-manifest-ink shadow-sm"
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
    </header>
  );
};