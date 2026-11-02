'use client';

import React, { useEffect, useState } from 'react';
import { App as KonstaApp } from 'konsta/react';
import { useAppStore } from '@/store';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { DesktopSidebar } from '@/components/layout/DesktopSidebar';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { SlowNetworkBanner } from '@/components/ui/SlowNetworkBanner';
import { CosmicOracleWheel } from '@/components/ui/CosmicOracleWheel';
import { SuccessCelebrationModal } from '@/components/ui/SuccessCelebrationModal';
import { ActionableErrorBoundary } from '@/components/ui/ActionableErrorBoundary';
import { DashboardSkeleton } from '@/components/ui/LiquidSkeleton';
import { JournalEditorModal } from '@/components/journal/JournalEditorModal';
import { AffirmationEditorModal } from '@/components/goals/AffirmationEditorModal';
import { RampageSetEditorModal } from '@/components/goals/RampageSetEditorModal';
import { PwaInstallGuide } from '@/components/pwa/PwaInstallGuide';
import { InteractiveTour } from '@/components/onboarding/InteractiveTour';
import { DashboardView } from '@/features/dashboard/DashboardView';
import { JournalView } from '@/features/journal/JournalView';
import { GoalsView } from '@/features/goals/GoalsView';
import { MySpaceView } from '@/features/space/MySpaceView';

export default function Home() {
  const { isInitialized, init, activeTab } = useAppStore();
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);
  const [testSimulatedError, setTestSimulatedError] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__simulateError = () => setTestSimulatedError(true);
      (window as any).__resetSimulatedError = () => setTestSimulatedError(false);
    }
  }, []);

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
      <KonstaApp theme="ios" safeAreas className="min-h-screen aura-bg">
        <div className="min-h-screen max-w-lg mx-auto p-4 flex flex-col justify-center">
          <DashboardSkeleton />
        </div>
      </KonstaApp>
    );
  }

  return (
    <KonstaApp theme="ios" safeAreas className="min-h-screen relative w-full aura-bg">
      {/* Toast Feedback (iOS Liquid Glass Capsule) */}
      <ToastContainer />

      {/* Intelligent Offline Banner & Reconnection Pill */}
      <OfflineBanner />

      {/* Slow Network / Lite Mode Controller */}
      <SlowNetworkBanner />

      {/* Cosmic Oracle Wheel (Gacha / Gambling místico a 60fps) */}
      <CosmicOracleWheel />

      {/* Success Celebration & Micro-particles Modal */}
      <SuccessCelebrationModal />

      {/* Global Journal Editor iOS Sheet (Vaul) */}
      <JournalEditorModal />

      {/* Global Affirmation Editor iOS Sheet (Vaul) */}
      <AffirmationEditorModal />

      {/* Global Rampage Set Editor iOS Sheet (Vaul) */}
      <RampageSetEditorModal />

      {/* Vaul Background Scaling Wrapper */}
      <div
        vaul-drawer-wrapper=""
        data-testid="vaul-background-wrapper"
        className="min-h-screen relative flex w-full aura-bg"
      >
        {/* Desktop Left Sidebar (>= 1024px) */}
        <DesktopSidebar onOpenInstallGuide={() => setIsInstallGuideOpen(true)} />

        {/* Main Responsive Content Shell */}
        <div className="flex-1 flex flex-col w-full min-w-0">
          {/* Mobile Konsta Large Title Collapsible Navbar (< 1024px) */}
          <AppHeader onOpenInstallGuide={() => setIsInstallGuideOpen(true)} />

          <main className="flex-1 flex flex-col w-full max-w-full lg:max-w-6xl xl:max-w-7xl mx-auto px-3 sm:px-6 lg:px-10">
            <ActionableErrorBoundary
              simulatedError={testSimulatedError ? 'storage' : null}
              onReset={() => setTestSimulatedError(false)}
            >
              {/* Dynamic Content Canvas */}
              <div className="flex-1 pt-2 sm:pt-3 lg:pt-6 pb-[calc(env(safe-area-inset-bottom,0px)+7.5rem)] lg:pb-8">
                <div>
                  {activeTab === 'inicio' && (
                    <div key="inicio">
                      <DashboardView />
                    </div>
                  )}

                  {activeTab === 'diario' && (
                    <div key="diario">
                      <JournalView />
                    </div>
                  )}

                  {activeTab === 'objetivos' && (
                    <div key="objetivos">
                      <GoalsView />
                    </div>
                  )}

                  {activeTab === 'espacio' && (
                    <div key="espacio">
                      <MySpaceView />
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Konsta Translucent Floating Tabbar (< 1024px) */}
              <BottomNavigation />

              {/* PWA Install Guide Dialog */}
              <PwaInstallGuide
                isOpen={isInstallGuideOpen}
                onClose={() => setIsInstallGuideOpen(false)}
              />

              {/* Interactive Spotlight Onboarding Tour */}
              <InteractiveTour />
            </ActionableErrorBoundary>
          </main>
        </div>
      </div>
    </KonstaApp>
  );
}
