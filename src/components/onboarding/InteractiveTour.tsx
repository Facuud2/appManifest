'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store';
import {
  Sparkles,
  BookOpen,
  Calendar,
  Target,
  Compass,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TourStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  mobileSelector: string;
  desktopSelector: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'step-inicio',
    title: 'Inicio: Tu Santuario Diario',
    subtitle: 'Presencia, energía y afirmación viva',
    description:
      'En este botón accedes a tu centro principal. Aquí descubres tus afirmaciones fijadas, navegas sets de rampage y accedes a tu cuaderno.',
    mobileSelector: '[data-tour="mobile-nav-inicio"]',
    desktopSelector: '[data-tour="desktop-nav-inicio"]',
    icon: Sparkles,
    tag: 'Paso 1 de 4',
  },
  {
    id: 'step-objetivos',
    title: 'Afirmaciones & Sets de Rampage',
    subtitle: 'Decretos conscientes y bucles de poder',
    description:
      'Aquí gestionas tu lista completa de afirmaciones, organizas prioridades con el fijado y experimentas secuencias rítmicas de rampage para elevar tu certeza.',
    mobileSelector: '[data-tour="mobile-nav-objetivos"]',
    desktopSelector: '[data-tour="desktop-nav-objetivos"]',
    icon: Target,
    tag: 'Paso 2 de 4',
  },
  {
    id: 'step-diario',
    title: 'Diario: Cuaderno de Verdad',
    subtitle: 'Manifestación, gratitud y reflexiones',
    description:
      'Tu espacio para escribir con certeza en tiempo presente: Manifestaciones, Gratitud, Avances y Success Stories con guardado automático y privado.',
    mobileSelector: '[data-tour="mobile-nav-diario"]',
    desktopSelector: '[data-tour="desktop-nav-diario"]',
    icon: BookOpen,
    tag: 'Paso 3 de 4',
  },
  {
    id: 'step-espacio',
    title: 'Mi Espacio & Ritual de Liberación',
    subtitle: 'Progreso, sincronías y transmutación',
    description:
      'Consulta tus hitos y oráculo cósmico, revisa las señales del camino y utiliza el Ritual de Liberación para soltar cualquier peso emocional.',
    mobileSelector: '[data-tour="mobile-nav-espacio"]',
    desktopSelector: '[data-tour="desktop-nav-espacio"]',
    icon: Compass,
    tag: 'Paso 4 de 4',
  },
];

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface InteractiveTourProps {
  forceOpen?: boolean;
  onFinish?: () => void;
}

export const InteractiveTour: React.FC<InteractiveTourProps> = ({ forceOpen = false, onFinish }) => {
  const { settings, updateSettings, showToast } = useAppStore();

  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  // Check if tour should run
  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      setCurrentStepIndex(0);
      return;
    }

    // If tutorial is not yet completed in localStorage
    if (!settings.tutorialCompleted) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [forceOpen, settings.tutorialCompleted]);

  // Handle window resize and detect mobile vs desktop
  useEffect(() => {
    const checkViewport = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Update target spotlight bounding rect
  const updateSpotlight = useCallback(() => {
    if (!isOpen) return;

    const step = TOUR_STEPS[currentStepIndex];
    const selector = isDesktop ? step.desktopSelector : step.mobileSelector;
    const el = document.querySelector(selector);

    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    } else {
      setTargetRect(null);
    }
  }, [isOpen, currentStepIndex, isDesktop]);

  useEffect(() => {
    updateSpotlight();
    window.addEventListener('resize', updateSpotlight);
    window.addEventListener('scroll', updateSpotlight);

    // Short timeout to let layout settle
    const timer = setTimeout(updateSpotlight, 120);

    return () => {
      window.removeEventListener('resize', updateSpotlight);
      window.removeEventListener('scroll', updateSpotlight);
      clearTimeout(timer);
    };
  }, [updateSpotlight]);

  const handleNext = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleCompleteTour();
    }
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleCompleteTour = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    updateSettings({ tutorialCompleted: true });
    setIsOpen(false);
    showToast('¡Bienvenido a tu santuario! Todo está listo para ti.', 'celebrate');
    if (onFinish) onFinish();
  };

  const handleSkip = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    updateSettings({ tutorialCompleted: true });
    setIsOpen(false);
    showToast('Tutorial omitido. Puedes repetirlo desde Ajustes cuando desees.', 'gentle');
    if (onFinish) onFinish();
  };

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const Icon = currentStep.icon;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        handleSkip();
      }}
      className="fixed inset-0 z-50 overflow-hidden select-none"
    >
      {/* Semi-opaque Dark Sheet with Spotlight Cutout */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="tourSpotlightMask">
            {/* White covers entire screen (keeps dark background) */}
            <rect width="100%" height="100%" fill="white" />
            {/* Black rectangle cuts out the spotlight hole */}
            {targetRect && (
              <rect
                x={targetRect.left - 6}
                y={targetRect.top - 6}
                width={targetRect.width + 12}
                height={targetRect.height + 12}
                rx={18}
                ry={18}
                fill="black"
              />
            )}
          </mask>
        </defs>

        {/* Semi-transparent dark overlay filled with mask */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(8, 6, 12, 0.78)"
          mask="url(#tourSpotlightMask)"
        />
      </svg>

      {/* Luminous Pulsing Border around the Highlighted Element */}
      {targetRect && (
        <motion.div
          key={`spotlight-${currentStep.id}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute',
            top: targetRect.top - 7,
            left: targetRect.left - 7,
            width: targetRect.width + 14,
            height: targetRect.height + 14,
          }}
          className="pointer-events-none rounded-2xl border-2 border-manifest-lavender shadow-[0_0_24px_rgba(220,207,255,0.75)] animate-pulse"
        />
      )}

      {/* Interactive Explanatory Card */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{
              // On desktop: position to the right of the sidebar if rect exists
              ...(isDesktop && targetRect
                ? {
                    position: 'absolute',
                    left: `${Math.min(targetRect.left + targetRect.width + 24, window.innerWidth - 420)}px`,
                    top: `${Math.max(40, Math.min(targetRect.top - 20, window.innerHeight - 340))}px`,
                    width: '380px',
                  }
                : {
                    position: 'absolute',
                    bottom: '110px',
                    left: '16px',
                    right: '16px',
                    maxWidth: '420px',
                    margin: '0 auto',
                  }),
            }}
            className="pointer-events-auto w-full max-w-sm sm:max-w-md rounded-3xl glass-card p-5 sm:p-6 border border-white shadow-liquid text-manifest-ink space-y-4"
          >
            {/* Header: Tag + Device indicator + Skip button */}
            <div className="flex items-center justify-between pb-2 border-b border-white/70">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-manifest-lavender/60 text-manifest-ink">
                  {currentStep.tag}
                </span>
                <span className="text-[10px] text-manifest-inkMuted font-medium flex items-center gap-1">
                  {isDesktop ? (
                    <>
                      <Monitor className="w-3 h-3 text-manifest-auraPurple" />
                      <span>Vista Computadora</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-3 h-3 text-manifest-auraPurple" />
                      <span>Vista Móvil</span>
                    </>
                  )}
                </span>
              </div>

              <button
                type="button"
                onClick={handleSkip}
                className="p-1 rounded-full text-manifest-inkMuted hover:text-manifest-ink transition-colors cursor-pointer"
                title="Saltar tutorial"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content & Icon */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-manifest-lavender/50 flex items-center justify-center shrink-0 border border-white">
                <Icon className="w-5 h-5 text-manifest-ink" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="font-serif text-base font-bold text-manifest-ink leading-snug">
                  {currentStep.title}
                </h3>
                <p className="text-xs font-bold text-purple-950">
                  {currentStep.subtitle}
                </p>
                <p className="text-xs text-slate-700 leading-relaxed pt-1 font-normal">
                  {currentStep.description}
                </p>
              </div>
            </div>

            {/* Bottom Controls: Progress dots + Buttons */}
            <div className="pt-2 border-t border-white/60 flex items-center justify-between gap-2">
              {/* Step indicator dots */}
              <div className="flex items-center gap-1.5">
                {TOUR_STEPS.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentStepIndex
                        ? 'w-5 bg-manifest-ink'
                        : 'w-1.5 bg-manifest-ink/20'
                    }`}
                  />
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {currentStepIndex > 0 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="p-2 rounded-xl glass-pill text-manifest-ink hover:bg-white transition-colors cursor-pointer"
                    title="Paso anterior"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 rounded-xl primary-gradient-btn text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <span>{isLastStep ? 'Finalizar Tutorial' : 'Siguiente'}</span>
                  {isLastStep ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
