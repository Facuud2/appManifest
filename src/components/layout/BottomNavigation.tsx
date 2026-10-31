'use client';

import React from 'react';
import { useAppStore, AppTab } from '@/store';
import { Sparkles, Calendar, BookOpen, Target, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

interface NavItem {
  key: AppTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'inicio', label: 'Inicio', icon: Sparkles },
  { key: 'agenda', label: 'Agenda', icon: Calendar },
  { key: 'diario', label: 'Diario', icon: BookOpen },
  { key: 'objetivos', label: 'Intenciones', icon: Target },
  { key: 'espacio', label: 'Mi Espacio', icon: Compass },
];

export const BottomNavigation: React.FC = () => {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-0.5 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="glass-nav rounded-2xl p-1 flex items-center justify-around border border-white/95 shadow-glass backdrop-blur-2xl bg-white/80">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.key;
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                data-tour={`mobile-nav-${item.key}`}
                onClick={() => setActiveTab(item.key)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all duration-200 select-none ${
                  isActive ? 'text-manifest-ink' : 'text-manifest-inkMuted hover:text-manifest-ink'
                }`}
                aria-label={item.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 rounded-xl bg-gradient-to-tr from-manifest-pink/40 via-manifest-lavender/50 to-manifest-celeste/40 border border-white/80 shadow-sm"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <div className="relative z-10 flex flex-col items-center gap-0.5">
                  <Icon
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isActive ? 'scale-110 text-manifest-ink' : 'opacity-70'
                    }`}
                  />
                  <span
                    className={`text-[9.5px] font-medium tracking-tight ${
                      isActive ? 'font-semibold text-manifest-ink' : 'opacity-80'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
