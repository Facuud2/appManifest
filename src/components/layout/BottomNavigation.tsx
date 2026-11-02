'use client';

import React from 'react';
import { Tabbar, TabbarLink } from 'konsta/react';
import { useAppStore, AppTab } from '@/store';
import { Sparkles, BookOpen, Target, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import { IOS_TAP_SPRING } from '@/lib/iosSprings';

interface NavItem {
  key: AppTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'inicio', label: 'Inicio', icon: Sparkles },
  { key: 'objetivos', label: 'Afirmaciones', icon: Target },
  { key: 'diario', label: 'Diario', icon: BookOpen },
  { key: 'espacio', label: 'Mi Espacio', icon: Compass },
];

export const BottomNavigation: React.FC = () => {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <>
      {/* Sellado inferior continuo contra filtración de texto bajo el dock */}
      <div
        aria-hidden="true"
        className="lg:hidden fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#FAF8FF] via-[#FAF8FF]/90 via-40% to-transparent pointer-events-none z-30"
      />

      <div
        data-testid="ios-floating-tabbar-wrap"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(0.55rem,env(safe-area-inset-bottom))] pt-0.5 pointer-events-none"
      >
        <div className="max-w-md mx-auto pointer-events-auto">
        <Tabbar
          labels
          icons
          {...({
            translucent: true,
            colors: {
              bgIos: 'bg-white/65',
            },
            bgClassName:
              'rounded-3xl border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.85),0_12px_36px_-4px_rgba(184,163,248,0.22)] backdrop-blur-2xl',
            innerClassName: 'px-1.5 py-1 h-14 rounded-3xl overflow-hidden',
          } as Record<string, unknown>)}
          className="!relative !bottom-auto !left-auto !right-auto rounded-3xl overflow-hidden"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.key;
            const Icon = item.icon;

            return (
              <TabbarLink
                key={item.key}
                active={isActive}
                component="button"
                linkProps={{
                  type: 'button',
                  'data-tour': `mobile-nav-${item.key}`,
                  'aria-label': item.label,
                }}
                onClick={() => setActiveTab(item.key)}
                {...({
                  colors: {
                    textIos: 'text-manifest-inkMuted',
                    textActiveIos: 'text-manifest-ink font-semibold',
                  },
                } as Record<string, unknown>)}
                className="relative rounded-2xl transition-colors select-none cursor-pointer"
                icon={
                  <motion.div
                    whileTap={IOS_TAP_SPRING}
                    className={`relative px-3 py-1 rounded-xl flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-gradient-to-tr from-manifest-pink/55 via-manifest-lavender/65 to-manifest-celeste/55 border border-white/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]'
                        : ''
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-manifest-ink stroke-[2.3]' : 'text-manifest-inkMuted opacity-80'
                      }`}
                    />
                  </motion.div>
                }
                label={
                  <span
                    className={`text-[10px] tracking-tight block mt-0.5 ${
                      isActive ? 'font-semibold text-manifest-ink' : 'font-medium text-manifest-inkMuted'
                    }`}
                  >
                    {item.label}
                  </span>
                }
              />
            );
          })}
        </Tabbar>
      </div>
    </div>
    </>
  );
};
