'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Navbar } from 'konsta/react';
import { useAppStore } from '@/store';
import { Flame, Download, Sparkles } from 'lucide-react';
import { UserScopeSwitcher } from './UserScopeSwitcher';

interface AppHeaderProps {
  onOpenInstallGuide: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenInstallGuide }) => {
  const { settings, activeScope, activeTab } = useAppStore();
  const [isStandalone, setIsStandalone] = useState(false);

  // Proxy scroll element so Konsta's large/transparent Navbar reacts to window scrolling
  const scrollListenersRef = useRef<Set<(e: { target: { scrollTop: number } }) => void>>(new Set());
  const scrollProxyRef = useRef({
    scrollTop: 0,
    addEventListener: (type: string, cb: (e: { target: { scrollTop: number } }) => void) => {
      if (type === 'scroll') {
        scrollListenersRef.current.add(cb);
      }
    },
    removeEventListener: (type: string, cb: (e: { target: { scrollTop: number } }) => void) => {
      if (type === 'scroll') {
        scrollListenersRef.current.delete(cb);
      }
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(isStandaloneMode);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleWindowScroll = () => {
      const y = Math.max(0, window.scrollY || document.documentElement.scrollTop || 0);
      scrollProxyRef.current.scrollTop = y;
      scrollListenersRef.current.forEach((cb) => {
        cb({ target: { scrollTop: y } });
      });
    };

    handleWindowScroll();
    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, [activeTab, activeScope]);

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

  const getLargeSectionTitle = () => {
    switch (activeTab) {
      case 'inicio':
        return getScopeSubtitle();
      case 'objetivos':
        return 'Afirmaciones';
      case 'diario':
        return 'Diario & Cuaderno';
      case 'espacio':
        return 'Mi Espacio';
      default:
        return getScopeSubtitle();
    }
  };

  return (
    <div
      data-testid="dynamic-app-header"
      className="lg:hidden sticky top-0 z-30 w-full bg-[#FDFBF7]/75 backdrop-blur-2xl border-b border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.85),0_4px_20px_-4px_rgba(184,163,248,0.12)]"
    >
      <Navbar
        data-testid="ios-collapsible-navbar"
        large
        transparent
        translucent
        centerTitle
        scrollEl={scrollProxyRef}
        title={getLargeSectionTitle()}
        titleFontSizeIos="text-[16px]"
        titleLargeFontSizeIos="text-[26px] sm:text-[28px]"
        colors={{
          bgIos: 'bg-white/80',
          textIos: 'text-manifest-ink',
        }}
        bgClassName="backdrop-blur-2xl border-b border-white/60"
        innerClassName="max-w-2xl mx-auto px-3.5 sm:px-6"
        titleClassName="font-serif font-bold tracking-tight text-manifest-ink"
        subnavbarClassName="max-w-2xl mx-auto w-full px-3.5 sm:px-6 pb-2 pt-0.5 h-auto"
        left={
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-manifest-pink via-manifest-lavender to-manifest-celeste flex items-center justify-center shadow-glass border border-white/80">
              <Sparkles className="w-3.5 h-3.5 text-manifest-ink" />
            </div>
          </div>
        }
        right={
          <div className="flex items-center gap-1.5 shrink-0">
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] backdrop-blur-xl bg-white/55 text-[11px] sm:text-xs font-semibold text-manifest-ink"
              title="Días consecutivos de conexión personal"
            >
              <Flame className="w-3 h-3 text-amber-500 fill-amber-400" />
              <span>{settings.dailyStreak}d</span>
            </div>

            {!isStandalone && (
              <button
                type="button"
                onClick={onOpenInstallGuide}
                className="p-1.5 rounded-full border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] backdrop-blur-xl bg-white/55 text-manifest-inkMuted hover:text-manifest-ink transition-colors cursor-pointer"
                title="Instalar en tu dispositivo"
                aria-label="Instalar app"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        }
        subnavbar={
          <div className="w-full">
            <UserScopeSwitcher fullWidth idPrefix="mobile-header" className="w-full" />
          </div>
        }
      />
    </div>
  );
};
