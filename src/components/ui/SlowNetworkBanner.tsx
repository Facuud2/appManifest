'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Gauge, X, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store';

export const SlowNetworkBanner: React.FC = () => {
  const { isLiteMode, toggleLiteMode } = useAppStore();
  const [isSlowNetwork, setIsSlowNetwork] = useState(false);
  const [loadProgress, setLoadProgress] = useState(100);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Check Network Information API
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (connection) {
      const checkSpeed = () => {
        const type = connection.effectiveType;
        if (type === '2g' || type === 'slow-2g') {
          setIsSlowNetwork(true);
        }
      };
      checkSpeed();
      connection.addEventListener?.('change', checkSpeed);
    }

    // 2. Measure initial asset loading performance
    const startTime = performance.now();
    const handleLoad = () => {
      const elapsed = performance.now() - startTime;
      if (elapsed > 3200 && !isLiteMode) {
        setIsSlowNetwork(true);
      }
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [isLiteMode]);

  // Simulate progress when slow network is active
  useEffect(() => {
    if (isSlowNetwork && loadProgress < 100) {
      const interval = setInterval(() => {
        setLoadProgress((prev) => {
          if (prev >= 98) {
            clearInterval(interval);
            return 100;
          }
          return prev + Math.floor(Math.random() * 8) + 4;
        });
      }, 350);
      return () => clearInterval(interval);
    }
  }, [isSlowNetwork, loadProgress]);

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {(isSlowNetwork || isLiteMode) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          data-testid="slow-network-banner"
          className="w-full bg-manifest-surfaceNav/95 backdrop-blur-md border-b border-manifest-glassBorder px-3.5 py-2 text-manifest-ink select-none relative z-40 shadow-xs"
        >
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="w-7 h-7 rounded-xl bg-manifest-glassControl border border-manifest-glassBorder text-manifest-auraPurple flex items-center justify-center shrink-0">
                <Gauge className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-manifest-ink">
                    {isLiteMode ? 'Modo Ligero Activo (60 FPS)' : 'Conexión lenta detectada'}
                  </span>
                  {!isLiteMode && (
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.2 rounded-full bg-manifest-ink/10 text-manifest-ink">
                      {loadProgress}%
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-manifest-inkMuted truncate sm:whitespace-normal">
                  {isLiteMode
                    ? 'Efectos pesados y desenfoques desactivados para máxima velocidad táctil.'
                    : 'Puedes activar el Modo Ligero para navegar con fluidez instantánea sin shaders pesados.'}
                </p>
              </div>
            </div>

            {/* Actions: Toggle Lite Mode & Dismiss */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
              <button
                type="button"
                onClick={toggleLiteMode}
                data-testid="toggle-lite-mode-btn"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus ${
                  isLiteMode
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'primary-gradient-btn text-white'
                }`}
              >
                {isLiteMode ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Modo Ligero ON</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Cambiar a Modo Ligero</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="p-1 rounded-lg text-manifest-inkMuted hover:text-manifest-ink hover:bg-manifest-glassControlHover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus"
                title="Cerrar aviso"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
