'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Drawer } from 'vaul';
import {
  Sparkles,
  X,
  Mic,
  RotateCcw,
  CheckCircle2,
  Volume2,
  Headphones,
  CloudRain,
  Radio,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sliders,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { motion, AnimatePresence } from 'framer-motion';
import { IOS_TAP_SPRING, IOS_LAYOUT_SPRING } from '@/lib/iosSprings';
import { useVoiceProfile } from '@/hooks/useVoiceProfile';
import { audioEngine, AmbienceType } from '@/lib/audioEngine';
import { analyzeAudioBlobPitch } from '@/lib/voiceStorage';
import { WaveBars } from '@/components/ui/WaveBars';

interface RampageConfigDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSession: (
    theme: string,
    specs: string,
    options?: {
      autoPlayVoice: boolean;
      ambience: AmbienceType;
      userAffirmations?: string[];
      journalHighlights?: string[];
      userScope?: string;
    }
  ) => void;
  onOpenManualEditor?: () => void;
}

export const RampageConfigDrawer: React.FC<RampageConfigDrawerProps> = ({
  isOpen,
  onClose,
  onStartSession,
  onOpenManualEditor,
}) => {
  const isDesktop = useIsDesktop(768);
  const { showToast, affirmations, journalEntries, activeScope } = useAppStore();
  const { hasVoice, profile, saveSample } = useVoiceProfile();

  // Wizard Navigation: Step 1 = Calibration, Step 2 = Desires & Nuances, Step 3 = Atmosphere
  const [step, setStep] = useState<1 | 2 | 3>(hasVoice ? 2 : 1);
  const [stepDirection, setStepDirection] = useState<number>(1);

  // Form Fields: Focused entirely on concrete desires & nuances popurrí
  const [specifications, setSpecifications] = useState('');

  // Audio Playback Controls
  const [autoPlayVoice, setAutoPlayVoice] = useState(true);
  const [ambience, setAmbience] = useState<AmbienceType>('white_noise');

  // Calibration Recording State (Step 1)
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationCountdown, setCalibrationCountdown] = useState(6);
  const [calibrationSuccess, setCalibrationSuccess] = useState(false);
  const calibrationMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const calibrationChunksRef = useRef<Blob[]>([]);
  const calibrationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // In-line Dictation Recording State (Step 2)
  const [isDictatingSpecs, setIsDictatingSpecs] = useState(false);
  const [isTranscribingField, setIsTranscribingField] = useState(false);
  const dictationRecorderRef = useRef<MediaRecorder | null>(null);
  const dictationChunksRef = useRef<Blob[]>([]);
  const dictationStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  const specTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize correct step when drawer opens
  useEffect(() => {
    if (isOpen) {
      if (hasVoice) {
        setStep(2);
      } else {
        setStep(1);
      }
      setCalibrationSuccess(false);
      setIsCalibrating(false);
      setCalibrationCountdown(6);
      setIsDictatingSpecs(false);
      setIsTranscribingField(false);
    }
  }, [isOpen, hasVoice]);

  const goToStep = (nextStep: 1 | 2 | 3) => {
    setStepDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
  };

  // ==========================================
  // STEP 1: CALIBRATION RECORDING LOGIC
  // ==========================================
  const startCalibrationRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showToast('El navegador no soporta captura de micrófono', 'info');
        return;
      }

      await audioEngine.unlock();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      calibrationChunksRef.current = [];
      const mime = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          calibrationChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(calibrationChunksRef.current, {
          type: mime || 'audio/webm',
        });

        if (blob.size < 500) {
          setIsCalibrating(false);
          return;
        }

        try {
          // 1. Analyze pitch via Autocorrelation
          const pitchData = await analyzeAudioBlobPitch(blob);

          // 2. Transcribe with Gemini to detect vocal cadence
          let detectedTone = 'calma, firme, íntima';
          try {
            const formData = new FormData();
            formData.append('audio', blob, 'sample.webm');
            const res = await fetch('/api/ai/transcribe', {
              method: 'POST',
              body: formData,
            });
            if (res.ok) {
              const data = await res.json();
              if (data.detectedTone) detectedTone = data.detectedTone;
            }
          } catch (_) {}

          // 3. Save to master voice profile
          await saveSample(blob, {
            durationSeconds: 6,
            detectedTone,
            detectedPitch: pitchData.pitchRate,
            fundamentalFrequency: pitchData.f0,
          });

          setCalibrationSuccess(true);
          showToast('Huella vocal calibrada con éxito', 'success');

          // Transition to Step 2 after checkmark feedback
          setTimeout(() => {
            goToStep(2);
          }, 1100);
        } catch (err) {
          console.warn('[Calibration] Error:', err);
          showToast('Error al guardar calibración', 'info');
        } finally {
          setIsCalibrating(false);
        }
      };

      recorder.start(250);
      calibrationMediaRecorderRef.current = recorder;
      setIsCalibrating(true);
      setCalibrationCountdown(6);

      let count = 6;
      calibrationIntervalRef.current = setInterval(() => {
        count--;
        setCalibrationCountdown(count);
        if (count <= 0) {
          if (calibrationIntervalRef.current) clearInterval(calibrationIntervalRef.current);
          if (
            calibrationMediaRecorderRef.current &&
            calibrationMediaRecorderRef.current.state !== 'inactive'
          ) {
            calibrationMediaRecorderRef.current.stop();
          }
        }
      }, 1000);
    } catch (err) {
      console.warn('[Calibration] Mic error:', err);
      showToast('Permiso de micrófono requerido para calibración', 'info');
      setIsCalibrating(false);
    }
  };

  const cancelCalibrationRecording = () => {
    if (calibrationIntervalRef.current) {
      clearInterval(calibrationIntervalRef.current);
    }
    if (
      calibrationMediaRecorderRef.current &&
      calibrationMediaRecorderRef.current.state !== 'inactive'
    ) {
      try {
        calibrationMediaRecorderRef.current.stop();
      } catch (_) {}
    }
    setIsCalibrating(false);
    setCalibrationCountdown(6);
  };

  // ==========================================
  // STEP 2: REAL DICTATION RECORDING LOGIC
  // ==========================================
  const toggleSpecsDictation = async () => {
    if (isDictatingSpecs) {
      stopSpecsDictation();
      return;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showToast('El micrófono no está disponible en este dispositivo', 'info');
        return;
      }

      await audioEngine.unlock();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      dictationStreamRef.current = stream;

      dictationChunksRef.current = [];
      const mime = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          dictationChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        if (stream) stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(dictationChunksRef.current, {
          type: mime || 'audio/webm',
        });

        if (blob.size < 400) {
          setIsDictatingSpecs(false);
          return;
        }

        setIsTranscribingField(true);
        try {
          const formData = new FormData();
          formData.append('audio', blob, 'dictation.webm');

          const res = await fetch('/api/ai/transcribe', {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          const cleanText = (data.text || '').trim();

          if (cleanText) {
            setSpecifications((prev) => (prev ? `${prev}. ${cleanText}` : cleanText));
          }
        } catch (err) {
          console.warn('[Dictation Transcribe Error]', err);
          showToast('Error al transcribir voz con Gemini Flash', 'info');
        } finally {
          setIsTranscribingField(false);
          setIsDictatingSpecs(false);
        }
      };

      recorder.start(250);
      dictationRecorderRef.current = recorder;
      setIsDictatingSpecs(true);

      // Web Speech API for real-time visual feedback if supported
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.lang = 'es-ES';
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.onresult = (event: any) => {
            let interim = '';
            for (let i = 0; i < event.results.length; i++) {
              interim += event.results[i][0]?.transcript || '';
            }
            if (interim.trim()) {
              setSpecifications(interim.trim());
            }
          };
          recognition.start();
          recognitionRef.current = recognition;
        } catch (_) {}
      }
    } catch (err) {
      console.warn('[Dictation mic error]', err);
      showToast('Permite el acceso al micrófono para dictar', 'info');
      setIsDictatingSpecs(false);
    }
  };

  const stopSpecsDictation = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }
    if (dictationRecorderRef.current && dictationRecorderRef.current.state !== 'inactive') {
      try {
        dictationRecorderRef.current.stop();
      } catch (_) {}
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelCalibrationRecording();
      stopSpecsDictation();
    };
  }, []);

  const handleStartFinal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await audioEngine.unlock();

    const userAffTexts = (affirmations || []).map((a) => a.text).filter(Boolean);
    const journalHighlights = (journalEntries || [])
      .map((j) => (j.title ? `${j.title}: ${j.content.slice(0, 150)}` : j.content.slice(0, 150)))
      .filter(Boolean);

    const cleanSpecs = specifications.trim();
    const derivedTheme = cleanSpecs ? cleanSpecs.slice(0, 40) : userAffTexts[0] || 'Sesión Subliminal AYA';

    onStartSession(derivedTheme, cleanSpecs, {
      autoPlayVoice,
      ambience,
      userAffirmations: userAffTexts,
      journalHighlights,
      userScope: activeScope,
    });
    onClose();

    // Reset fields for future sessions
    setSpecifications('');
    setStep(hasVoice ? 2 : 1);
  };

  // Horizontal Spring Slide Variants
  const stepVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: IOS_LAYOUT_SPRING,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.96,
      transition: { duration: 0.18, ease: [0.32, 0.72, 0, 1] as const },
    }),
  };

  const renderContent = (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* iOS Modal Header */}
      <div className="shrink-0 px-5 sm:px-6 py-3.5 border-b border-manifest-glassBorder flex items-center justify-between gap-3 bg-manifest-surfaceNav/95 z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-manifest-lavender/50 border border-manifest-glassBorder flex items-center justify-center shrink-0 text-manifest-auraPurple">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-serif font-bold text-manifest-ink leading-tight truncate">
              Rampage Subliminal con Tu Voz
            </h3>
            <p className="text-[10px] sm:text-[11px] text-manifest-inkMuted leading-tight truncate mt-0.5">
              Paso {step} de 3 · {step === 1 ? 'Calibración' : step === 2 ? 'Intención' : 'Atmósfera'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Recalibrate Pill in Header if Voice is already active */}
          {hasVoice && step !== 1 && (
            <motion.button
              type="button"
              whileTap={IOS_TAP_SPRING}
              onClick={() => goToStep(1)}
              data-testid="recalibrate-voice-header-btn"
              className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100 text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Recalibrar timbre y tono maestro de voz"
            >
              <Mic className="w-3 h-3 text-emerald-600" />
              <span className="hidden sm:inline">Voz calibrada ·</span>
              <span>Recalibrar</span>
            </motion.button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-manifest-inkMuted hover:text-manifest-ink hover:bg-manifest-glassControlHover transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step Indicator Progress Bar */}
      <div className="w-full bg-manifest-ink/5 h-1">
        <div
          className="bg-manifest-auraPurple h-1 transition-all duration-300 ease-out"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      {/* Main Form Body with Smooth Transition Container */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 sm:px-6 py-5 touch-pan-y">
        <AnimatePresence mode="wait" custom={stepDirection}>
          {/* ========================================================== */}
          {/* PASO 1: CALIBRACIÓN DE HUELLA VOCAL (6 SEGUNDOS)           */}
          {/* ========================================================== */}
          {step === 1 && (
            <motion.div
              key="step-1-calibration"
              custom={stepDirection}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6 text-center py-2"
            >
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h4 className="text-base sm:text-lg font-serif font-bold text-manifest-ink">
                  {hasVoice ? 'Recalibra tu Huella Vocal AYA' : 'Calibra tu Voz en 6 Segundos'}
                </h4>
                <p className="text-xs text-manifest-inkMuted leading-relaxed">
                  Habla con naturalidad sobre cualquier deseo. Detectaremos tu tono fundamental y
                  timbre exacto para pronunciar cada afirmación.
                </p>
              </div>

              {/* Central Glowing Animated Orb with Concentric Waves */}
              <div className="py-4 flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center w-36 h-36">
                  {/* Concentric Pulsing Waves */}
                  {isCalibrating && (
                    <>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0.8 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
                        className="absolute inset-0 rounded-full border-2 border-purple-400/60 pointer-events-none"
                      />
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0.8 }}
                        animate={{ scale: 1.8, opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 2, delay: 0.6, ease: 'easeOut' }}
                        className="absolute inset-0 rounded-full border-2 border-cyan-400/50 pointer-events-none"
                      />
                    </>
                  )}

                  {/* Central Orb Button */}
                  <motion.button
                    type="button"
                    whileTap={IOS_TAP_SPRING}
                    onClick={isCalibrating ? cancelCalibrationRecording : startCalibrationRecording}
                    data-testid="calibration-orb-btn"
                    className={`relative z-10 w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-liquid cursor-pointer transition-all border ${
                      calibrationSuccess
                        ? 'bg-emerald-500 text-white border-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.35)]'
                        : isCalibrating
                        ? 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 text-white border-white/60 shadow-[0_0_30px_rgba(139,92,246,0.4)] animate-pulse'
                        : 'bg-gradient-to-tr from-manifest-auraPurple to-purple-500 text-white border-white/40 hover:scale-105'
                    }`}
                  >
                    {calibrationSuccess ? (
                      <CheckCircle2 className="w-10 h-10 animate-in zoom-in-75 duration-300" />
                    ) : isCalibrating ? (
                      <>
                        <span className="text-2xl font-bold font-serif">
                          {calibrationCountdown}s
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-90 mt-0.5">
                          Escuchando
                        </span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-8 h-8 mb-1" />
                        <span className="text-[11px] font-semibold leading-tight px-2">
                          Iniciar
                        </span>
                      </>
                    )}
                  </motion.button>
                </div>

                {/* State Feedback */}
                <div className="mt-4">
                  {calibrationSuccess ? (
                    <p className="text-xs font-semibold text-emerald-700 flex items-center justify-center gap-1.5 animate-in fade-in">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Timbre y cadencia guardados con éxito</span>
                    </p>
                  ) : isCalibrating ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <WaveBars count={14} active={true} minHeight={4} maxHeight={20} className="h-5" />
                      <p className="text-xs text-purple-700 font-medium">
                        Habla con tu tono natural y pausado...
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-manifest-inkMuted">
                      Toca el orbe y habla durante 6 segundos
                    </p>
                  )}
                </div>
              </div>

              {/* Skip / Continue Button */}
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink hover:bg-manifest-glassControlHover transition-colors cursor-pointer"
                >
                  {hasVoice ? 'Mantener voz actual →' : 'Continuar con voz estándar →'}
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* PASO 2: DESEOS Y MATICES CONCRETOS (POPURRÍ DINÁMICO)      */}
          {/* ========================================================== */}
          {step === 2 && (
            <motion.div
              key="step-2-intentions"
              custom={stepDirection}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-4"
            >
              {/* Tarjeta Única: Matices y deseos específicos */}
              <div
                className={`p-4 rounded-3xl transition-all border ${
                  isDictatingSpecs
                    ? 'liquid-glass-surface border-manifest-auraPurple/70 ring-2 ring-purple-300/30 shadow-md'
                    : 'liquid-glass-surface border-manifest-glassBorder hover:border-manifest-glassBorderHover shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-manifest-ink flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-manifest-auraPurple" />
                    <span>Deseos y matices concretos</span>
                  </label>
                  <span className="text-[10px] text-manifest-inkMuted">Habla o escribe libremente</span>
                </div>

                <div className="relative">
                  <textarea
                    ref={specTextareaRef}
                    data-testid="rampage-specifications-input"
                    value={specifications}
                    onChange={(e) => setSpecifications(e.target.value)}
                    rows={4}
                    placeholder="ej. Quiero sentir que soy profundamente amado, que todo fluye fácil y sin esfuerzo, éxito total y tranquilidad..."
                    className="w-full p-3.5 pr-12 rounded-2xl glass-input text-xs sm:text-sm placeholder:text-manifest-inkMuted/40 leading-relaxed resize-none focus:ring-2 focus:ring-manifest-auraPurple/30"
                    autoFocus
                  />
                  <div className="absolute right-2.5 bottom-2.5">
                    <motion.button
                      type="button"
                      whileTap={IOS_TAP_SPRING}
                      onClick={toggleSpecsDictation}
                      title={isDictatingSpecs ? 'Detener dictado' : 'Hablar notas por voz'}
                      data-testid="rampage-specs-mic-btn"
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        isDictatingSpecs
                          ? 'bg-purple-600 text-white shadow-md animate-pulse'
                          : 'glass-pill text-manifest-inkMuted hover:text-manifest-ink border border-manifest-glassBorder hover:bg-manifest-glassControlHover shadow-xs'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Inline listening feedback for specs */}
                {isDictatingSpecs && (
                  <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-purple-50/80 border border-purple-200 flex items-center justify-between text-[11px] text-purple-700 animate-in fade-in">
                    <span className="font-semibold">Escuchando tus deseos...</span>
                    <WaveBars count={12} active={true} minHeight={3} maxHeight={14} className="h-3.5" />
                  </div>
                )}

                {isTranscribingField && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-purple-700">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Puntuando con Gemini Flash...</span>
                  </div>
                )}
              </div>

              {/* Dynamic Popurrí Info Banner */}
              <div className="px-3.5 py-2.5 rounded-2xl bg-manifest-lavender/30 border border-manifest-glassBorder/80 flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-manifest-auraPurple/10 text-manifest-auraPurple flex items-center justify-center shrink-0">
                  <Sparkles className="w-3 h-3" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-manifest-ink font-medium leading-tight">
                    Popurrí Dinámico Integrado
                  </p>
                  <p className="text-[10px] text-manifest-inkMuted leading-tight mt-0.5">
                    Combinaremos tus {affirmations?.length || 0} decretos guardados y entradas de diario ({activeScope === 'facu' ? 'Facu' : activeScope === 'maia' ? 'Maia' : 'Juntos'}) con lo que expreses aquí.
                  </p>
                </div>
              </div>

              {/* Bottom iOS Step Button */}
              <div className="pt-2 flex items-center justify-end">
                <motion.button
                  type="button"
                  whileTap={IOS_TAP_SPRING}
                  onClick={() => {
                    stopSpecsDictation();
                    goToStep(3);
                  }}
                  data-testid="continue-to-ambience-btn"
                  className="px-5 py-2.5 rounded-full primary-gradient-btn text-xs font-semibold shadow-sm flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus"
                >
                  <span>Continuar a Atmósfera</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* PASO 3: ATMÓSFERA SUBLIMINAL E INICIO                      */}
          {/* ========================================================== */}
          {step === 3 && (
            <motion.div
              key="step-3-atmosphere"
              custom={stepDirection}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-4"
            >
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-manifest-ink flex items-center gap-1.5">
                  <Headphones className="w-4 h-4 text-manifest-auraPurple" />
                  <span>Atmósfera Sonora para Auriculares</span>
                </h4>
                <p className="text-[11px] text-manifest-inkMuted leading-normal">
                  Sintoniza una atmósfera relajante de fondo mientras escuchas cada afirmación:
                </p>
              </div>

              {/* Atmospheric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'none',
                    label: 'Silencio',
                    desc: 'Voz pura y directa sin fondo',
                    icon: Volume2,
                  },
                  {
                    id: 'white_noise',
                    label: 'Ruido Blanco',
                    desc: 'Frecuencia relajante para dormir',
                    icon: Sparkles,
                  },
                  {
                    id: 'astral_rain',
                    label: 'Ruido de Lluvia',
                    desc: 'Atmósfera envolvente suave',
                    icon: CloudRain,
                  },
                ].map((item) => {
                  const isSelected = ambience === item.id;
                  const IconComponent = item.icon;
                  return (
                    <motion.button
                      key={item.id}
                      type="button"
                      whileTap={IOS_TAP_SPRING}
                      onClick={() => setAmbience(item.id as AmbienceType)}
                      className={`p-3 rounded-2xl text-left transition-all border cursor-pointer flex flex-col justify-between min-h-[90px] ${
                        isSelected
                          ? 'bg-purple-50/80 text-manifest-ink border-manifest-auraPurple ring-1 ring-manifest-auraPurple/40 shadow-xs'
                          : 'bg-manifest-glassControl/60 text-manifest-ink border-manifest-glassBorder hover:bg-manifest-glassControl'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <IconComponent
                          className={`w-4 h-4 ${
                            isSelected ? 'text-manifest-auraPurple' : 'text-manifest-inkMuted'
                          }`}
                        />
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-manifest-auraPurple bg-manifest-auraPurple text-white'
                              : 'border-manifest-inkMuted/40'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="text-xs font-semibold block leading-tight">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-manifest-inkMuted block mt-0.5 leading-tight">
                          {item.desc}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Subliminal Loop Mode Switch */}
              <div className="p-3.5 rounded-2xl bg-manifest-glassControl border border-manifest-glassBorder flex items-center justify-between gap-3 mt-3">
                <div>
                  <span className="text-xs font-semibold text-manifest-ink block leading-tight">
                    Bucle Subliminal Automático
                  </span>
                  <span className="text-[10px] text-manifest-inkMuted block mt-0.5 leading-tight">
                    Pronuncia cada frase y deja una pausa respiratoria de 2.5s antes de avanzar sola
                  </span>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={autoPlayVoice}
                  data-testid="toggle-autoplay-voice"
                  onClick={() => setAutoPlayVoice((prev) => !prev)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus ${
                    autoPlayVoice ? 'bg-manifest-auraPurple' : 'bg-manifest-ink/20'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white shadow-sm block absolute top-0.5 transition-transform ${
                      autoPlayVoice ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Navigation Actions */}
              <div className="pt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver a Intención</span>
                </button>

                <motion.button
                  type="button"
                  whileTap={IOS_TAP_SPRING}
                  onClick={handleStartFinal}
                  data-testid="start-ai-rampage-btn"
                  className="px-5 py-2.5 rounded-full primary-gradient-btn text-xs sm:text-sm font-semibold shadow-md flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus"
                >
                  <span>Iniciar Sesión Subliminal</span>
                  <Headphones className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Manual Fallback in Footer if user wants to type affirmations manually */}
      {onOpenManualEditor && step === 2 && (
        <div className="shrink-0 px-5 sm:px-6 py-2.5 border-t border-manifest-glassBorder/60 flex items-center justify-center bg-manifest-surfaceNav/70 text-center">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenManualEditor();
            }}
            className="text-[11px] text-manifest-inkMuted hover:text-manifest-ink transition-colors cursor-pointer"
          >
            O crear un Set manual escribiendo tus propias frases
          </button>
        </div>
      )}
    </div>
  );

  // Desktop Dialog / Modal
  if (isDesktop) {
    return (
      <AnimatePresence>
        {isOpen && (
          <div
            data-testid="rampage-desktop-backdrop"
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              data-testid="rampage-desktop-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="relative z-10 w-full max-w-lg my-auto rounded-3xl liquid-glass-surface bg-manifest-surfaceElevated shadow-lens overflow-hidden border border-manifest-glassBorder flex flex-col max-h-[86vh]"
            >
              {renderContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  // Mobile Native Vaul Drawer
  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      handleOnly
      repositionInputs={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-md" />
        <Drawer.Content
          data-testid="rampage-config-drawer"
          className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-lg max-h-[88vh] max-h-[88dvh] flex flex-col rounded-t-[2.25rem] bg-manifest-surfaceElevated border-t border-manifest-glassBorder shadow-lens outline-none overflow-hidden"
        >
          {/* iOS Grabber Handle */}
          <div className="pt-3 pb-1 bg-manifest-surfaceElevated shrink-0">
            <Drawer.Handle
              data-testid="ios-sheet-grabber"
              className="mx-auto w-12 h-1.5 rounded-full bg-manifest-inkMuted/30 cursor-grab active:cursor-grabbing"
            />
          </div>
          {renderContent}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};