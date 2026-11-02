'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { Flame, Download, Plus, Sparkles } from 'lucide-react';
import { UserScopeSwitcher } from './UserScopeSwitcher';
import { motion } from 'framer-motion';
import { IOS_TAP_SPRING } from '@/lib/iosSprings';

interface AppHeaderProps {
  onOpenInstallGuide: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenInstallGuide }) => {
  const { settings, openAffirmationEditor } = useAppStore();
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
    <header
      data-testid="dynamic-app-header"
      className="lg:hidden sticky top-0 z-40 w-full bg-manifest-surfaceNav/95 backdrop-blur-2xl border-b border-manifest-glassBorder px-3 py-2.5 transition-all shadow-glass"
    >
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-2.5">
        {/* Left: Brand Monogram / Identity */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-manifest-glassControl border border-manifest-glassBorder flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-manifest-brass" />
          </div>
          <span className="font-serif font-bold text-base tracking-wide text-manifest-ink hidden xs:inline">
            Santuario
          </span>
        </div>

        {/* Center: Sleek, compact Scope Switcher right in the header row */}
        <div className="flex-1 max-w-[220px] sm:max-w-[260px]">
          <UserScopeSwitcher compact idPrefix="mobile-top-header" />
        </div>

        {/* Right: Streak & Quick Action */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Flame streak */}
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-amber-300/60 bg-amber-100/70 text-[11px] font-bold text-amber-900 shadow-neu-sm"
            title="Días consecutivos de conexión"
          >
            <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span className="font-sans tabular-nums">{settings.dailyStreak}d</span>
          </div>

          {/* Quick Create Button */}
          <motion.button
            type="button"
            whileTap={IOS_TAP_SPRING}
            onClick={() => openAffirmationEditor(null)}
            className="w-8 h-8 rounded-full primary-gradient-btn text-manifest-ink flex items-center justify-center shadow-sm cursor-pointer hover:brightness-110 focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none"
            title="Nuevo decreto"
            aria-label="Nuevo decreto"
          >
            <Plus className="w-4 h-4" />
          </motion.button>

          {!isStandalone && (
            <button
              type="button"
              onClick={onOpenInstallGuide}
              className="p-1.5 rounded-full border border-manifest-glassBorder bg-manifest-glassControl text-manifest-inkMuted hover:text-manifest-ink transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none"
              title="Instalar como App"
              aria-label="Instalar app"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
