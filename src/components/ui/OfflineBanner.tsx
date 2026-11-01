'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store';

export const OfflineBanner: React.FC = () => {
  const { showToast, syncFromRemote } = useAppStore();
  const [isOffline, setIsOffline] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOffline(false);
      setJustReconnected(true);
      showToast('Conexión restablecida. Sincronizando santuario...', 'success');
      syncFromRemote();
      setTimeout(() => setJustReconnected(false), 3000);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setJustReconnected(false);
    };

    // Check initial status
    if (!navigator.onLine) {
      setIsOffline(true);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast, syncFromRemote]);

  return (
    <>
      {/* Top Compact Liquid Glass Offline Banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            data-testid="offline-banner"
            className="w-full bg-gradient-to-r from-amber-500/15 via-manifest-lavender/25 to-amber-500/15 backdrop-blur-md border-b border-amber-300/40 px-3.5 py-2 text-manifest-ink select-none relative z-40 shadow-sm"
          >
            <div className="max-w-2xl mx-auto flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                  <WifiOff className="w-3.5 h-3.5 stroke-[2.2]" />
                </div>
                <p className="text-[11.5px] leading-tight font-medium text-manifest-ink truncate sm:whitespace-normal">
                  Estás sin conexión. Mostrando tus manifestaciones guardadas en este dispositivo <span className="hidden sm:inline text-manifest-inkMuted">(el dictado por voz en la nube puede no estar disponible)</span>.
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 border border-white text-amber-800 shrink-0">
                Offline
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bottom Reconnecting Pill */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            data-testid="offline-reconnecting-pill"
            className="fixed bottom-20 lg:bottom-6 right-4 sm:right-8 z-40 flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-amber-200/80 shadow-liquid text-xs font-semibold text-amber-900 bg-white/95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            <span>Reconectando...</span>
          </motion.div>
        )}

        {justReconnected && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-20 lg:bottom-6 right-4 sm:right-8 z-40 flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-emerald-300 shadow-liquid text-xs font-semibold text-emerald-800 bg-white/95"
          >
            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            <span>Conexión restablecida</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
