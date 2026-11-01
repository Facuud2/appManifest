'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAppStore } from '@/store';
import { Flame, Download, Sparkles } from 'lucide-react';
import { UserScopeSwitcher } from './UserScopeSwitcher';

interface AppHeaderProps {
  onOpenInstallGuide: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenInstallGuide }) => {
  const { settings, activeScope, activeTab } = useAppStore();
  const [isStandalone, setIsStandalone] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(isStandaloneMode);
    }
  }, []);

  // Always bring the header back into view if active scope or tab changes
  useEffect(() => {
    setIsVisible(true);
  }, [activeScope, activeTab]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let ticking = false;
    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const lastScrollY = lastScrollYRef.current;
          const deltaY = currentScrollY - lastScrollY;

          // 1. At the very top (or during rubber-band bounce on iOS), always keep header visible
          if (currentScrollY <= 25) {
            setIsVisible(true);
            lastScrollYRef.current = currentScrollY;
            ticking = false;
            return;
          }

          // 2. Prevent false scroll-up triggers during iOS bottom overscroll bounce
          const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
          if (currentScrollY >= maxScrollY - 15) {
            ticking = false;
            return;
          }

          // 3. Significant scroll threshold (hysteresis to prevent micro-jitter)
          if (deltaY > 8 && currentScrollY > 60) {
            // Scrolling down -> hide header upwards
            setIsVisible(false);
          } else if (deltaY < -8) {
            // Scrolling up -> show header downwards
            setIsVisible(true);
          }

          lastScrollYRef.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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
    <header
      data-testid="dynamic-app-header"
      className={`lg:hidden sticky top-0 z-30 w-full px-3.5 sm:px-6 pt-[calc(env(safe-area-inset-top,0px)+0.65rem)] pb-2.5 backdrop-blur-2xl bg-white/95 border-b border-white/90 space-y-2 transition-transform duration-300 ease-out will-change-transform ${
        isVisible
          ? 'translate-y-0 shadow-[0_4px_20px_-4px_rgba(30,10,60,0.06)]'
          : '-translate-y-full shadow-none pointer-events-none'
      }`}
    >
      <div className="max-w-md sm:max-w-2xl mx-auto flex items-center justify-between gap-2">
        {/* Brand logo & space name */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-manifest-pink via-manifest-lavender to-manifest-celeste flex items-center justify-center shadow-glass border border-white">
            <Sparkles className="w-3.5 h-3.5 text-manifest-ink" />
          </div>
          <div>
            <span className="font-serif font-bold text-xs sm:text-sm tracking-tight text-manifest-ink block leading-tight">
              {getScopeSubtitle()}
            </span>
          </div>
        </div>

        {/* Right: Streak & PWA Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full glass-pill text-[11px] sm:text-xs font-semibold text-manifest-ink shadow-sm"
            title="Días consecutivos de conexión personal"
          >
            <Flame className="w-3 h-3 text-amber-500 fill-amber-400" />
            <span>{settings.dailyStreak}d</span>
          </div>

          {!isStandalone && (
            <button
              onClick={onOpenInstallGuide}
              className="p-1.5 rounded-full glass-pill text-manifest-inkMuted hover:text-manifest-ink transition-colors cursor-pointer"
              title="Instalar en tu dispositivo"
              aria-label="Instalar app"
            >
              <Download className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Full width Scope Switcher with generous space */}
      <div className="max-w-md sm:max-w-2xl mx-auto w-full">
        <UserScopeSwitcher fullWidth idPrefix="mobile-header" className="w-full" />
      </div>
    </header>
  );
};