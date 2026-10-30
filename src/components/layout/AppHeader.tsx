'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { Flame, Download, Sparkles } from 'lucide-react';

interface AppHeaderProps {
  onOpenInstallGuide: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenInstallGuide }) => {
  const { settings } = useAppStore();
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

  return (
    <header className="sticky top-0 z-30 px-4 pt-3 pb-2 backdrop-blur-xl bg-white/40 border-b border-white/60">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-manifest-pink via-manifest-lavender to-manifest-celeste flex items-center justify-center shadow-glass border border-white">
            <Sparkles className="w-5 h-5 text-manifest-ink" />
          </div>
          <div>
            <h2 className="text-xs font-semibold tracking-wide uppercase text-manifest-inkMuted/80">
              {greeting}, {settings.userName}
            </h2>
            <h1 className="text-base font-serif font-bold text-manifest-ink">
              Manifest Santuario
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Streak pill */}
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full glass-pill text-xs font-medium text-manifest-ink shadow-sm"
            title="Días consecutivos de conexión personal"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span>{settings.dailyStreak} {settings.dailyStreak === 1 ? 'día' : 'días'}</span>
          </div>

          {/* PWA Install Button (if not already running standalone) */}
          {!isStandalone && (
            <button
              onClick={onOpenInstallGuide}
              className="p-1.5 rounded-full glass-pill text-manifest-inkMuted hover:text-manifest-ink transition-colors"
              title="Instalar en tu dispositivo"
              aria-label="Instalar app"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
