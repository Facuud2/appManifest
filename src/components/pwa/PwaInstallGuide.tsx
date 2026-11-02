'use client';

import React, { useEffect, useState } from 'react';
import { Share, PlusSquare, Smartphone, X, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PwaInstallGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PwaInstallGuide: React.FC<PwaInstallGuideProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isIosDevice);

      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      });

      window.addEventListener('appinstalled', () => {
        setInstalled(true);
        setDeferredPrompt(null);
      });
    }
  }, []);

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-md"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm rounded-3xl liquid-glass-surface bg-manifest-surfaceElevated p-6 border border-manifest-glassBorder shadow-lens text-manifest-ink relative overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full glass-pill hover:bg-manifest-glassControlHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4 text-manifest-inkMuted" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-manifest-glassControl border border-manifest-glassBorder flex items-center justify-center shadow-glass text-manifest-auraPurple">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-manifest-ink">
                Instalar Manifest PWA
              </h3>
              <p className="text-xs text-manifest-inkMuted">
                Lleva tu santuario a tu pantalla de inicio
              </p>
            </div>
          </div>

          {installed ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100/80 border border-emerald-300/60 text-emerald-700 flex items-center justify-center mb-2 shadow-neu-sm">
                <Check className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold">¡Aplicación instalada con éxito!</p>
              <p className="text-xs text-manifest-inkMuted mt-1">
                Ya puedes abrirla directamente desde tu pantalla de inicio.
              </p>
            </div>
          ) : isIOS ? (
            <div className="space-y-3.5 my-3">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-manifest-glassControl border border-manifest-glassBorder">
                <div className="p-2 rounded-xl bg-manifest-glassControlActive text-manifest-ink shrink-0 mt-0.5">
                  <Share className="w-4 h-4" />
                </div>
                <div className="text-xs leading-relaxed">
                  <span className="font-semibold block text-manifest-ink">Paso 1: Compartir</span>
                  Toca el botón <strong>Compartir</strong> en la barra inferior de Safari.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-manifest-glassControl border border-manifest-glassBorder">
                <div className="p-2 rounded-xl bg-manifest-glassControlActive text-manifest-ink shrink-0 mt-0.5">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div className="text-xs leading-relaxed">
                  <span className="font-semibold block text-manifest-ink">Paso 2: Añadir</span>
                  Desliza hacia abajo y pulsa <strong>«Añadir a pantalla de inicio»</strong>.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-manifest-glassControl border border-manifest-glassBorder">
                <div className="p-2 rounded-xl bg-manifest-glassControlActive text-manifest-ink shrink-0 mt-0.5">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="text-xs leading-relaxed">
                  <span className="font-semibold block text-manifest-ink">Paso 3: Disfrutar</span>
                  Ábrela como una app nativa, a pantalla completa y disponible offline.
                </div>
              </div>
            </div>
          ) : (
            <div className="my-4 space-y-4">
              <p className="text-xs leading-relaxed text-manifest-inkMuted">
                Disfruta de una experiencia fluida sin barras de navegador, acceso rápido y persistencia total en tu dispositivo.
              </p>
              {deferredPrompt ? (
                <button
                  onClick={handleNativeInstall}
                  className="w-full py-3 px-4 rounded-2xl primary-gradient-btn font-medium text-sm flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus"
                >
                  <Sparkles className="w-4 h-4" />
                  Instalar ahora en este dispositivo
                </button>
              ) : (
                <div className="p-3 rounded-2xl bg-manifest-glassControl border border-manifest-glassBorder text-xs text-manifest-inkMuted leading-relaxed">
                  Para instalar en Chrome o navegadores Android: Toca el menú de tres puntos ⋮ y selecciona <strong>«Instalar aplicación»</strong> o <strong>«Añadir a la pantalla principal»</strong>.
                </div>
              )}
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-manifest-glassBorder text-center">
            <button
              onClick={onClose}
              className="text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus rounded-lg px-2 py-1"
            >
              Cerrar guía
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
