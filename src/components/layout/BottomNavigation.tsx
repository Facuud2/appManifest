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
  damping: 34,
};

export const BottomNavigation: React.FC = () => {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <>
      {/* 1. Escudo de enmascaramiento inferior fijo (sellado contra filtración de texto bajo el dock) */}
      <div
        aria-hidden="true"
        data-testid="bottom-dock-blur-shield"
        className="lg:hidden fixed bottom-0 left-0 right-0 h-20 sm:h-28 pointer-events-none z-30 bg-gradient-to-t from-[#FAF8FF] via-[#FAF8FF]/95 to-transparent backdrop-blur-[2px]"
      />

      {/* 2. Dock cápsula compacta estilo iOS 18 */}
      <div
        data-testid="ios-floating-tabbar-wrap"
        className="lg:hidden fixed bottom-[max(env(safe-area-inset-bottom,0px),10px)] left-0 right-0 z-40 px-3 pointer-events-none flex justify-center"
      >
        <nav
          role="navigation"
          aria-label="Navegación principal"
          className="relative w-full mx-auto max-w-[335px] pointer-events-auto rounded-full bg-white/85 backdrop-blur-2xl border border-white/90 shadow-[0_10px_28px_rgba(100,70,160,0.12)] px-1.5 py-1 flex items-center justify-between overflow-hidden"
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
                className="relative flex-1 h-full flex flex-col items-center justify-center select-none cursor-pointer outline-none group py-0.5 focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:rounded-full focus-visible:outline-none"
              >
                {/* Contenedor del ícono con la cápsula deslizante Liquid Glass */}
                <div className="relative flex items-center justify-center w-11 h-6">
                  {isActive && (
                    <motion.div
                      layoutId="mobile-tabbar-active-pill"
                      className="absolute inset-0 rounded-full bg-purple-100/90 border border-purple-300/80 shadow-xs backdrop-blur-md"
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
                      className={`w-[15px] h-[15px] transition-colors duration-200 ${
                        isActive ? 'text-purple-900 stroke-[2.4]' : 'text-slate-500 group-hover:text-slate-800'
                      }`}
                    />
                  </motion.div>
                </div>

                {/* Etiqueta de texto debajo del ícono, siempre legible */}
                <span
                  className={`text-[9.5px] tracking-tight block mt-0.5 select-none transition-colors duration-200 leading-tight ${
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
