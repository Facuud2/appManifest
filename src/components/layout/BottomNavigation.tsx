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
        className="lg:hidden fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-manifest-base via-manifest-base/95 via-50% to-transparent pointer-events-none z-30"
      />

      <div
        data-testid="ios-floating-tabbar-wrap"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(0.55rem,env(safe-area-inset-bottom))] pt-0.5 pointer-events-none"
      >
        <nav
          role="navigation"
          aria-label="Navegación principal"
          className="relative max-w-md mx-auto pointer-events-auto h-13 rounded-2xl bg-white/95 backdrop-blur-2xl border border-purple-200/80 shadow-[0_8px_32px_rgba(30,20,50,0.14)] px-2 py-1 flex items-center justify-between overflow-hidden"
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
                className="relative flex-1 h-full flex flex-col items-center justify-center select-none cursor-pointer outline-none group py-0.5 focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:rounded-xl focus-visible:outline-none"
              >
                {/* Contenedor del ícono con la cápsula deslizante Liquid Glass */}
                <div className="relative flex items-center justify-center w-12 h-6.5">
                  {isActive && (
                    <motion.div
                      layoutId="mobile-tabbar-active-pill"
                      className="absolute inset-0 rounded-xl bg-purple-100 border border-purple-300/80 shadow-xs backdrop-blur-md"
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
                        isActive ? 'text-purple-900 stroke-[2.4]' : 'text-slate-500 group-hover:text-slate-800'
                      }`}
                    />
                  </motion.div>
                </div>

                {/* Etiqueta de texto debajo del ícono, siempre legible */}
                <span
                  className={`text-[10px] tracking-tight block mt-0.5 select-none transition-colors duration-200 leading-tight ${
                    isActive ? 'font-serif font-bold text-purple-950' : 'font-serif font-medium text-slate-600 group-hover:text-slate-900'
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
