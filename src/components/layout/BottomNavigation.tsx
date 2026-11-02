'use client';

import React from 'react';
import { useAppStore, AppTab } from '@/store';
import { Sparkles, BookOpen, Target, Compass } from 'lucide-react';
import { motion, type Transition } from 'framer-motion';

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

const TAB_SPRING_TRANSITION: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 30,
  mass: 0.8,
};

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
        <nav
          role="navigation"
          aria-label="Navegación principal"
          className="relative max-w-md mx-auto pointer-events-auto h-14 rounded-3xl bg-white/75 backdrop-blur-2xl border border-white/70 shadow-[inset_0_1px_1px_rgba(255,255,255,0.85),0_12px_36px_-4px_rgba(184,163,248,0.22)] px-2 py-1 flex items-center justify-between overflow-hidden"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.key;
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                type="button"
                data-tour={`mobile-nav-${item.key}`}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setActiveTab(item.key)}
                className="relative flex-1 h-full flex flex-col items-center justify-center select-none cursor-pointer outline-none group py-0.5"
              >
                {/* Contenedor del ícono con la cápsula deslizante Liquid Glass */}
                <div className="relative flex items-center justify-center w-13 h-7">
                  {isActive && (
                    <motion.div
                      layoutId="mobile-tabbar-active-pill"
                      className="absolute inset-0 rounded-full bg-gradient-to-tr from-manifest-pink/65 via-manifest-lavender/75 to-manifest-celeste/65 border border-white/90 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.95),0_3px_12px_rgba(184,163,248,0.28)]"
                      transition={TAB_SPRING_TRANSITION}
                    />
                  )}

                  {/* Ícono con micro-interacción y física táctil háptica */}
                  <motion.div
                    animate={{
                      scale: isActive ? 1.08 : 1,
                      y: isActive ? -0.5 : 0,
                    }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                    className="relative z-10 flex items-center justify-center"
                  >
                    <Icon
                      className={`w-[17px] h-[17px] transition-colors duration-200 ${
                        isActive ? 'text-manifest-ink stroke-[2.3]' : 'text-manifest-inkMuted opacity-75 group-hover:opacity-90'
                      }`}
                    />
                  </motion.div>
                </div>

                {/* Etiqueta de texto debajo del ícono, siempre legible */}
                <span
                  className={`text-[10px] tracking-tight block mt-0.5 select-none transition-colors duration-200 leading-tight ${
                    isActive ? 'font-semibold text-manifest-ink' : 'font-medium text-manifest-inkMuted'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};
