'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { DesktopSidebar } from '@/components/layout/DesktopSidebar';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { PwaInstallGuide } from '@/components/pwa/PwaInstallGuide';
import { InteractiveTour } from '@/components/onboarding/InteractiveTour';
import { DashboardView } from '@/features/dashboard/DashboardView';
import { AgendaView } from '@/features/agenda/AgendaView';
import { JournalView } from '@/features/journal/JournalView';
import { GoalsView } from '@/features/goals/GoalsView';
import { MySpaceView } from '@/features/space/MySpaceView';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function Home() {
  const { isInitialized, init, activeTab } = useAppStore();
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);

  useEffect(() => {
    init();

    // Register Service Worker for PWA offline capabilities
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[PWA] Service Worker registrado con alcance:', reg.scope);
          })
          .catch((err) => {
            console.warn('[PWA] Fallo en registro de Service Worker:', err);
          });
      });
    }
  }, [init]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center aura-bg">
        <motion.div
          animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-center space-y-3"
        >
          <div className="w-12 h-12 mx-auto rounded-3xl bg-gradient-to-tr from-manifest-pink via-manifest-lavender to-manifest-celeste flex items-center justify-center shadow-glass">
            <Sparkles className="w-6 h-6 text-manifest-ink" />
          </div>
          <p className="font-serif italic text-sm text-manifest-ink tracking-wide">
            Abriendo tu santuario...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex w-full aura-bg">
      {/* Toast Feedback */}
      <ToastContainer />

      {/* Desktop Left Sidebar (>= 1024px) */}
      <DesktopSidebar onOpenInstallGuide={() => setIsInstallGuideOpen(true)} />

      {/* Main Responsive Content Shell */}
      <main className="flex-1 flex flex-col min-h-screen w-full max-w-full lg:max-w-6xl xl:max-w-7xl mx-auto px-3 sm:px-6 lg:px-10">
        {/* Mobile Header (< 1024px) */}
        <AppHeader onOpenInstallGuide={() => setIsInstallGuideOpen(true)} />

        {/* Dynamic Content Canvas with View Crossfading */}
        <div className="flex-1 pt-2 sm:pt-4 lg:pt-6 pb-24 lg:pb-12">
          <AnimatePresence mode="wait">
            {activeTab === 'inicio' && (
              <motion.div
                key="inicio"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <DashboardView />
              </motion.div>
            )}

            {activeTab === 'agenda' && (
              <motion.div
                key="agenda"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <AgendaView />
              </motion.div>
            )}

            {activeTab === 'diario' && (
              <motion.div
                key="diario"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <JournalView />
              </motion.div>
            )}

            {activeTab === 'objetivos' && (
              <motion.div
                key="objetivos"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <GoalsView />
              </motion.div>
            )}

            {activeTab === 'espacio' && (
              <motion.div
                key="espacio"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <MySpaceView />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Fixed Glass Bottom Navigation (< 1024px) */}
        <BottomNavigation />

        {/* PWA Install Guide Dialog */}
        <PwaInstallGuide
          isOpen={isInstallGuideOpen}
          onClose={() => setIsInstallGuideOpen(false)}
        />

        {/* Interactive Spotlight Onboarding Tour */}
        <InteractiveTour />
      </main>
    </div>
  );
}
