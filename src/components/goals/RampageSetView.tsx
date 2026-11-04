'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  Edit3,
  CheckCircle2,
  Loader2,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Headphones,
  Mic,
  Square,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import { IOS_TAP_SPRING, IOS_LAYOUT_SPRING, LIQUID_GLASS_SPECULAR } from '@/lib/iosSprings';
import { SmoothSizeContainer } from '@/components/ui/SmoothSizeContainer';
import { RampageAffirmation, RampageSet } from '@/types';
import { RampageConfigDrawer } from './RampageConfigDrawer';
import { RampageDecisionModal } from './RampageDecisionModal';
import { logAiTelemetry } from '@/lib/gemini';
import { audioEngine, AmbienceType } from '@/lib/audioEngine';
import { useVoiceProfile } from '@/hooks/useVoiceProfile';
import {
  saveAffirmationVoiceAudio,
  getAffirmationVoiceAudio,
  hasAffirmationVoiceAudio,
  deleteAffirmationVoiceAudio,
} from '@/lib/voiceStorage';
import { WaveBars } from '@/components/ui/WaveBars';
import { RampageCardSkeleton } from '@/components/ui/LiquidSkeleton';

export const RampageSetView: React.FC = () => {
  const {
    rampageSets,
    incrementRampageAffirmationRepeat,
    openRampageSetEditor,
    checkAndUnlockMilestones,
    activeScope,
    saveRampageSet,
    showToast,
    aiSandboxMode,
    isRampageConfigOpen,
    openRampageConfig,
    closeRampageConfig,
  } = useAppStore();

  const { profile, hasVoice, saveSample } = useVoiceProfile();

  // User Affirmation Voice Recording State
  const [recordingAffId, setRecordingAffId] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStreamRef = useRef<MediaStream | null>(null);
  const [hasRecordedVoiceMap, setHasRecordedVoiceMap] = useState<Record<string, boolean>>({});

  // Manual Set State
  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const [affirmationIndex, setAffirmationIndex] = useState(0);
  const [direction, setDirection] = useState<number>(1);
  const [dragOffsetX, setDragOffsetX] = useState<number>(0);

  // Dynamic AI Rampage Session State
  const [isAiSession, setIsAiSession] = useState(false);
  const [aiTheme, setAiTheme] = useState('');
  const [aiSpecs, setAiSpecs] = useState('');
  const [aiAffirmations, setAiAffirmations] = useState<RampageAffirmation[]>([]);
  const [aiIndex, setAiIndex] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [batchCount, setBatchCount] = useState(1);
  const [isDecisionOpen, setIsDecisionOpen] = useState(false);

  // Audio & Voice Playback State
  const [autoPlayVoice, setAutoPlayVoice] = useState(true);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [reactiveEnergy, setReactiveEnergy] = useState<number>(0);
  const [isSubliminalSavedSession, setIsSubliminalSavedSession] = useState(false);

  // Debounce ref to fix step counter skipping 2 by 2
  const lastAdvanceTimeRef = useRef<number>(0);

  // Audio object URL cache mapping affirmation.id -> objectUrl
  const audioCacheRef = useRef<Map<string, string>>(new Map());
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isFetchingBatchRef = useRef<boolean>(false);
  const batchCountRef = useRef<number>(1);
  const aiThemeRef = useRef<string>('');
  const aiSpecsRef = useRef<string>('');
  const aiIndexRef = useRef<number>(0);
  const aiAffirmationsRef = useRef<RampageAffirmation[]>([]);
  const userAffirmationsRef = useRef<string[]>([]);
  const journalHighlightsRef = useRef<string[]>([]);
  const userScopeRef = useRef<string>('facu');

  // Keep refs synchronized
  useEffect(() => {
    batchCountRef.current = batchCount;
  }, [batchCount]);

  useEffect(() => {
    aiThemeRef.current = aiTheme;
  }, [aiTheme]);

  useEffect(() => {
    aiSpecsRef.current = aiSpecs;
  }, [aiSpecs]);

  useEffect(() => {
    aiIndexRef.current = aiIndex;
  }, [aiIndex]);

  useEffect(() => {
    aiAffirmationsRef.current = aiAffirmations;
  }, [aiAffirmations]);

  // Reactive Halo 60fps monitor
  useEffect(() => {
    let animId: number;
    const updateHalo = () => {
      if (isAiSession || isSubliminalSavedSession) {
        const energy = audioEngine.getReactiveEnergy();
        setReactiveEnergy(energy);
        setIsVoicePlaying(audioEngine.isPlaying());
      }
      animId = requestAnimationFrame(updateHalo);
    };
    animId = requestAnimationFrame(updateHalo);
    return () => cancelAnimationFrame(animId);
  }, [isAiSession, isSubliminalSavedSession]);

  // Clean all audio URLs from memory on unmount
  useEffect(() => {
    const currentAudioCache = audioCacheRef.current;
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
      currentAudioCache.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (_) {}
      });
      currentAudioCache.clear();
      if (recordingStreamRef.current) {
        recordingStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      audioEngine.stopVoice();
      audioEngine.stopAmbience();
    };
  }, []);

  // Intercept navigation away if unconfirmed AI session is active
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isAiSession && aiAffirmations.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isAiSession, aiAffirmations.length]);

  /**
   * Synthesize audio for an affirmation using the persistent voiceProfileId
   */
  const synthesizeAffirmationAudio = useCallback(
    async (aff: RampageAffirmation): Promise<string | null> => {
      if (audioCacheRef.current.has(aff.id)) {
        return audioCacheRef.current.get(aff.id)!;
      }

      try {
        const voiceProfileId = profile?.voiceProfileId || 'voice_aya_master';
        const detectedTone = profile?.detectedTone || 'calma, firme, íntima';

        const res = await fetch('/api/ai/voice-synthesize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: aff.text,
            voiceProfileId,
            detectedTone,
          }),
        });

        if (!res.ok) {
          return null;
        }

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const json = await res.json();
          if (json.useLocalSynthesis) {
            return null; // Triggers Zero-Failure Local Speech Synthesis
          }
        }

        const blob = await res.blob();
        if (blob.size < 200) return null;
        const objectUrl = URL.createObjectURL(blob);
        audioCacheRef.current.set(aff.id, objectUrl);
        return objectUrl;
      } catch (err) {
        console.warn('[AI Rampage] Voice synthesis error for affirmation:', err);
        return null;
      }
    },
    [profile]
  );

  /**
   * Unified voice player: Cloned audio buffer OR Zero-Failure Local Speech Engine (rate: 0.88, calibrated pitch)
   */
  const playAffirmationVoice = useCallback(
    async (aff: RampageAffirmation, onEndedCallback: () => void) => {
      if (!autoPlayVoice) {
        onEndedCallback();
        return;
      }

      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }

      // 1. Check if user recorded their own voice for this affirmation!
      let audioUrl: string | null | undefined = audioCacheRef.current.get(aff.id);
      if (!audioUrl) {
        const recordedBlob = await getAffirmationVoiceAudio(aff.id);
        if (recordedBlob && recordedBlob.size > 200) {
          audioUrl = URL.createObjectURL(recordedBlob);
          audioCacheRef.current.set(aff.id, audioUrl);
          setHasRecordedVoiceMap((prev) => ({ ...prev, [aff.id]: true }));
        }
      }

      // 2. If not recorded individually, check synthesis
      if (!audioUrl) {
        audioUrl = await synthesizeAffirmationAudio(aff);
      }

      if (audioUrl) {
        await audioEngine.playVoice(audioUrl, onEndedCallback);
        setIsVoicePlaying(true);
      } else {
        // Zero-Failure Local Speech Synthesis Engine (pausado e hipnótico, rate: 0.88)
        const pitch = profile?.detectedPitch || 1.0;
        const spoke = audioEngine.speakVoice(
          aff.text,
          { pitch, rate: 0.88 },
          onEndedCallback
        );
        if (spoke) {
          setIsVoicePlaying(true);
        } else {
          onEndedCallback();
        }
      }
    },
    [autoPlayVoice, profile?.detectedPitch, synthesizeAffirmationAudio]
  );

  /**
   * Start recording user voice repeating this affirmation
   */
  const startRecordingCurrentAffirmation = async (aff: RampageAffirmation) => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showToast('El micrófono no está disponible en este dispositivo', 'info');
        return;
      }
      audioEngine.stopVoice();
      setIsVoicePlaying(false);
      await audioEngine.unlock();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      recordingStreamRef.current = stream;
      audioChunksRef.current = [];

      const mime = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        if (recordingStreamRef.current) {
          recordingStreamRef.current.getTracks().forEach((t) => t.stop());
          recordingStreamRef.current = null;
        }
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }

        const blob = new Blob(audioChunksRef.current, { type: mime || 'audio/webm' });
        if (blob.size < 500) {
          showToast('Grabación muy corta, no se guardó', 'info');
          setRecordingAffId(null);
          setRecordingSeconds(0);
          return;
        }

        // 1. Save affirmation audio to IndexedDB
        await saveAffirmationVoiceAudio(aff.id, blob);

        // 2. Cache object URL
        const objectUrl = URL.createObjectURL(blob);
        audioCacheRef.current.set(aff.id, objectUrl);

        // 3. If master sample doesn't exist, calibrate profile with this sample!
        if (!hasVoice) {
          try {
            await saveSample(blob, {
              durationSeconds: recordingSeconds || 5,
              detectedTone: 'calma, firme, íntima',
            });
          } catch (_) {}
        }

        // 4. Increment repetition counter
        if (isAiSession) {
          setAiAffirmations((prev) => {
            const copy = [...prev];
            const curIdx = aiIndexRef.current;
            if (copy[curIdx] && copy[curIdx].id === aff.id) {
              copy[curIdx] = {
                ...copy[curIdx],
                repeatCount: (copy[curIdx].repeatCount || 0) + 1,
              };
            }
            return copy;
          });
        } else if (currentSet) {
          incrementRampageAffirmationRepeat(currentSet.id, aff.id);
        }

        setHasRecordedVoiceMap((prev) => ({ ...prev, [aff.id]: true }));
        setRecordingAffId(null);
        setRecordingSeconds(0);
        showToast('✨ Tu voz ha sido guardada para esta afirmación', 'success');

        // Play brief preview so user hears their voice immediately!
        await audioEngine.playVoice(objectUrl);
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setRecordingAffId(aff.id);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('[RampageSetView] Mic error:', err);
      showToast('Permiso de micrófono requerido para grabar tu voz', 'info');
      setRecordingAffId(null);
    }
  };

  const stopRecordingCurrentAffirmation = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
    }
  };

  const cancelRecordingCurrentAffirmation = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (recordingStreamRef.current) {
      recordingStreamRef.current.getTracks().forEach((t) => t.stop());
      recordingStreamRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
    }
    audioChunksRef.current = [];
    setRecordingAffId(null);
    setRecordingSeconds(0);
  };

  const deleteRecordingCurrentAffirmation = async (affId: string) => {
    await deleteAffirmationVoiceAudio(affId);
    if (audioCacheRef.current.has(affId)) {
      const url = audioCacheRef.current.get(affId);
      if (url) {
        try {
          URL.revokeObjectURL(url);
        } catch (_) {}
      }
      audioCacheRef.current.delete(affId);
    }
    setHasRecordedVoiceMap((prev) => ({ ...prev, [affId]: false }));
    showToast('Grabación de voz eliminada para esta afirmación', 'gentle');
  };

  /**
   * Request next batch of 3 affirmations in background and pre-synthesize their audios
   */
  const fetchNextBatch = useCallback(
    async (currentAffs: RampageAffirmation[]) => {
      if (isFetchingBatchRef.current) return;
      if (batchCountRef.current >= 10) return; // Safety limit: max 10 batches (30 affirmations)

      isFetchingBatchRef.current = true;

      try {
        const lastTwoAffirmations = currentAffs.slice(-2).map((a) => a.text);

        const res = await fetch('/api/ai/rampage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            centralTheme: aiThemeRef.current,
            specifications: aiSpecsRef.current,
            userAffirmations: userAffirmationsRef.current,
            journalHighlights: journalHighlightsRef.current,
            userScope: userScopeRef.current,
            detectedTone: profile?.detectedTone || 'calma, firme, íntima',
            previousAffirmations: lastTwoAffirmations,
            batchSize: 3,
            batchIndex: batchCountRef.current,
          }),
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        const incomingTexts: string[] = Array.isArray(data.affirmations)
          ? data.affirmations
          : [];

        if (incomingTexts.length > 0) {
          const newBatchItems: RampageAffirmation[] = incomingTexts.map((text, idx) => ({
            id: `ai-aff-${Date.now()}-${batchCountRef.current}-${idx}`,
            text,
            repeatCount: 0,
          }));

          setAiAffirmations((prev) => {
            const nextList = [...prev, ...newBatchItems];
            logAiTelemetry('/api/ai/rampage', data.source, data.totalTokens || 0, {
              batchNumber: batchCountRef.current + 1,
              addedCount: newBatchItems.length,
              totalNow: nextList.length,
            });
            return nextList;
          });

          setBatchCount((prev) => prev + 1);

          // Pre-synthesize audios for the newly added batch in background
          newBatchItems.forEach((item) => {
            synthesizeAffirmationAudio(item);
          });
        }
      } catch (err) {
        console.warn('[AI Rampage] Error prefetching next batch:', err);
      } finally {
        isFetchingBatchRef.current = false;
      }
    },
    [profile, synthesizeAffirmationAudio]
  );

  /**
   * Advance affirmation in AI Session
   */
  const advanceAiAffirmation = useCallback(
    (dir = 1) => {
      const now = Date.now();
      if (now - lastAdvanceTimeRef.current < 450) return;
      lastAdvanceTimeRef.current = now;

      const currentList = aiAffirmationsRef.current;
      if (currentList.length === 0) return;

      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }

      // 1. Increment repeat count for current affirmation
      const curIdx = aiIndexRef.current;
      setAiAffirmations((prev) => {
        const copy = [...prev];
        if (copy[curIdx]) {
          copy[curIdx] = {
            ...copy[curIdx],
            repeatCount: (copy[curIdx].repeatCount || 0) + 1,
          };
        }
        return copy;
      });

      checkAndUnlockMilestones({ suppressModal: true });
      setDirection(dir);

      const totalNow = currentList.length;
      const nextIndex = (curIdx + dir + totalNow) % totalNow;
      setAiIndex(nextIndex);

      // 2. Penultimate Affirmation Trigger (e.g. index 1 of 3, index 4 of 6)
      if (nextIndex === totalNow - 2) {
        fetchNextBatch(currentList);
      }
    },
    [checkAndUnlockMilestones, fetchNextBatch]
  );

  // Manual Set Navigation
  const totalSets = rampageSets.length;
  const safeSetIndex = totalSets > 0 ? ((activeSetIndex % totalSets) + totalSets) % totalSets : 0;
  const currentSet = rampageSets[safeSetIndex];

  const totalAffirmationsInSet = currentSet?.affirmations?.length || 0;
  const safeAffirmationIndex =
    totalAffirmationsInSet > 0
      ? ((affirmationIndex % totalAffirmationsInSet) + totalAffirmationsInSet) %
        totalAffirmationsInSet
      : 0;
  const currentAffirmation = currentSet?.affirmations?.[safeAffirmationIndex];

  // Check if current affirmation has recorded voice
  useEffect(() => {
    const activeAff = isAiSession ? aiAffirmations[aiIndex] : currentAffirmation;
    if (activeAff?.id && hasRecordedVoiceMap[activeAff.id] === undefined) {
      hasAffirmationVoiceAudio(activeAff.id).then((hasAudio) => {
        setHasRecordedVoiceMap((prev) => ({ ...prev, [activeAff.id]: hasAudio }));
      });
    }
  }, [isAiSession, aiAffirmations, aiIndex, currentAffirmation, hasRecordedVoiceMap]);

  const advanceManualAffirmation = useCallback(
    (dir = 1) => {
      const now = Date.now();
      if (now - lastAdvanceTimeRef.current < 450) return;
      lastAdvanceTimeRef.current = now;

      if (!currentSet || totalAffirmationsInSet === 0 || !currentAffirmation) return;
      incrementRampageAffirmationRepeat(currentSet.id, currentAffirmation.id);
      checkAndUnlockMilestones({ suppressModal: true });
      setDirection(dir);
      setAffirmationIndex(
        (prev) => (prev + dir + totalAffirmationsInSet) % totalAffirmationsInSet
      );
    },
    [
      currentSet,
      totalAffirmationsInSet,
      currentAffirmation,
      incrementRampageAffirmationRepeat,
      checkAndUnlockMilestones,
    ]
  );

  /**
   * Handle audio completion of current affirmation (triggers 2.5s integration pause)
   */
  const handleAffirmationAudioEnded = useCallback(() => {
    setIsVoicePlaying(false);
    if (!autoAdvance && !isSubliminalSavedSession) return;

    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
    }

    // 2.5s Subconscious Assimilation Pause (as required for sleep/automatic mode)
    autoAdvanceTimerRef.current = setTimeout(() => {
      if (isAiSession) {
        advanceAiAffirmation(1);
      } else if (isSubliminalSavedSession) {
        advanceManualAffirmation(1);
      }
    }, 2500);
  }, [
    autoAdvance,
    isSubliminalSavedSession,
    isAiSession,
    advanceAiAffirmation,
    advanceManualAffirmation,
  ]);

  /**
   * Play audio of current affirmation in AI Session
   */
  const playCurrentAffirmationAudio = useCallback(async () => {
    const currentAff = aiAffirmations[aiIndex];
    if (!currentAff) return;
    await playAffirmationVoice(currentAff, handleAffirmationAudioEnded);
  }, [aiAffirmations, aiIndex, playAffirmationVoice, handleAffirmationAudioEnded]);

  // Play audio whenever current affirmation changes in AI Session
  useEffect(() => {
    if (isAiSession && !isInitialLoading && aiAffirmations.length > 0) {
      playCurrentAffirmationAudio();
    }
  }, [isAiSession, isInitialLoading, aiIndex, playCurrentAffirmationAudio, aiAffirmations.length]);

  /**
   * Start a new AI Rampage Queue Session
   */
  const handleStartAiSession = async (
    theme: string,
    specs: string,
    options?: {
      autoPlayVoice: boolean;
      ambience: AmbienceType;
      userAffirmations?: string[];
      journalHighlights?: string[];
      userScope?: string;
    }
  ) => {
    setIsAiSession(true);
    setAiTheme(theme);
    setAiSpecs(specs);
    setAiAffirmations([]);
    setAiIndex(0);
    setBatchCount(1);
    setIsInitialLoading(true);
    isFetchingBatchRef.current = false;
    batchCountRef.current = 1;
    userAffirmationsRef.current = options?.userAffirmations || [];
    journalHighlightsRef.current = options?.journalHighlights || [];
    userScopeRef.current = options?.userScope || 'facu';

    // Apply audio preferences
    setAutoPlayVoice(options?.autoPlayVoice ?? true);
    if (options?.ambience) {
      audioEngine.setAmbience(options.ambience);
    }

    // Clear previous audio cache
    audioCacheRef.current.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch (_) {}
    });
    audioCacheRef.current.clear();

    try {
      const isSandbox =
        aiSandboxMode ||
        (typeof window !== 'undefined' && (window.navigator as any)?.webdriver === true);

      const res = await fetch('/api/ai/rampage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(isSandbox ? { 'x-ai-sandbox': 'true' } : {}),
        },
        body: JSON.stringify({
          centralTheme: theme,
          specifications: specs,
          userAffirmations: userAffirmationsRef.current,
          journalHighlights: journalHighlightsRef.current,
          userScope: userScopeRef.current,
          detectedTone: profile?.detectedTone || 'calma, firme, íntima',
          previousAffirmations: [],
          batchSize: 3,
          batchIndex: 0,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      logAiTelemetry('/api/ai/rampage', data.source, data.totalTokens || 0, {
        batchNumber: 1,
        initialBatchSize: data.affirmations?.length || 0,
      });

      const initialAffs: RampageAffirmation[] = (data.affirmations || []).map(
        (text: string, idx: number) => ({
          id: `ai-aff-${Date.now()}-0-${idx}`,
          text,
          repeatCount: 0,
        })
      );

      // Pre-synthesize audio for first 2 affirmations before lifting skeleton
      if (initialAffs.length >= 2) {
        await Promise.all([
          synthesizeAffirmationAudio(initialAffs[0]),
          synthesizeAffirmationAudio(initialAffs[1]),
        ]);
        // Also fire third in background
        if (initialAffs[2]) {
          synthesizeAffirmationAudio(initialAffs[2]);
        }
      }

      setAiAffirmations(initialAffs);
    } catch (err) {
      console.error('[AI Rampage] Error starting session:', err);
      showToast('Error al conectar con IA. Usando modo de contingencia.', 'info');
      // Contingency affirmations: Short, natural 2-7 words subliminal affirmations (zero poetic templates)
      const cleanThemeWord = theme.replace(/^(mi|el|la|los|las|un|una)\s+/i, '').trim();
      const fallbackTexts = [
        cleanThemeWord ? `Soy ${cleanThemeWord}.` : 'Soy Dios.',
        'Todo fluye a mi favor.',
        'Soy profundamente amado.',
      ];
      const fallbackAffs: RampageAffirmation[] = fallbackTexts.map((text, idx) => ({
        id: `ai-aff-${Date.now()}-${idx}`,
        text,
        repeatCount: 0,
      }));
      setAiAffirmations(fallbackAffs);
      fallbackAffs.forEach((item) => synthesizeAffirmationAudio(item));
    } finally {
      setIsInitialLoading(false);
    }
  };

  /**
   * Handle Click on "Finalizar Rampage": 400ms fade-out of all audio, then open Decision Modal
   */
  const handleOpenFinishModal = async () => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    // Soft 400ms fade-out
    await audioEngine.fadeAndStopAll(400);
    setIsDecisionOpen(true);
  };

  /**
   * Save AI Session
   */
  const handleSaveAiSession = () => {
    if (!aiTheme.trim() || aiAffirmations.length === 0) return;

    const author =
      activeScope === 'facu' ? 'Facu' : activeScope === 'maia' ? 'Maia' : 'Juntos';

    const newSet: RampageSet = {
      id: `rampage-${Date.now()}`,
      title: aiTheme.trim(),
      userId: activeScope,
      author,
      affirmations: aiAffirmations,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveRampageSet(newSet);
    showToast('Set guardado en tu Santuario', 'success');

    // Cleanup resources
    audioCacheRef.current.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch (_) {}
    });
    audioCacheRef.current.clear();

    setIsAiSession(false);
    setIsDecisionOpen(false);
    setAiAffirmations([]);
    setActiveSetIndex(rampageSets.length);
    setAffirmationIndex(0);
  };

  /**
   * Discard AI Session
   */
  const handleDiscardAiSession = () => {
    // Release all Object URLs from memory
    audioCacheRef.current.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch (_) {}
    });
    audioCacheRef.current.clear();
    audioEngine.stopVoice();
    audioEngine.stopAmbience();

    setIsAiSession(false);
    setIsDecisionOpen(false);
    setAiAffirmations([]);
    setAiIndex(0);
    showToast('Rampage descartado limpiamente', 'gentle');
  };


  /**
   * Play current affirmation audio in saved set
   */
  const playManualCurrentAffirmationAudio = useCallback(async () => {
    if (!currentAffirmation) return;
    await playAffirmationVoice(currentAffirmation, handleAffirmationAudioEnded);
  }, [currentAffirmation, playAffirmationVoice, handleAffirmationAudioEnded]);

  /**
   * Toggle Subliminal Audio Mode for Saved Sets
   */
  const toggleSubliminalSavedSession = async () => {
    if (isSubliminalSavedSession) {
      setIsSubliminalSavedSession(false);
      audioEngine.stopVoice();
      audioEngine.stopAmbience();
      setIsVoicePlaying(false);
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
      showToast('Sesión subliminal pausada', 'info');
    } else {
      await audioEngine.unlock();
      audioEngine.setAmbience('white_noise');
      setIsSubliminalSavedSession(true);
      setAutoPlayVoice(true);
      setAutoAdvance(true);
      showToast('Modo Audio Subliminal activado en bucle', 'success');
      playManualCurrentAffirmationAudio();
    }
  };

  // Play audio on affirmation change if subliminal saved session is active
  useEffect(() => {
    if (isSubliminalSavedSession && currentAffirmation) {
      playManualCurrentAffirmationAudio();
    }
  }, [isSubliminalSavedSession, safeAffirmationIndex, currentAffirmation, playManualCurrentAffirmationAudio]);

  // Setup iOS lockscreen & headphone controls via MediaSession API
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      const activeText = isAiSession
        ? aiAffirmations[aiIndex]?.text
        : currentAffirmation?.text;
      const title = isAiSession ? aiTheme || 'Rampage con IA' : currentSet?.title || 'Rampage';

      if (activeText) {
        try {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: activeText,
            artist: 'Voz Propia · Reprogramación Subliminal AYA',
            album: title,
          });

          navigator.mediaSession.setActionHandler('play', () => {
            if (isAiSession) playCurrentAffirmationAudio();
            else playManualCurrentAffirmationAudio();
          });

          navigator.mediaSession.setActionHandler('pause', () => {
            audioEngine.stopVoice();
            setIsVoicePlaying(false);
          });

          navigator.mediaSession.setActionHandler('nexttrack', () => {
            if (isAiSession) advanceAiAffirmation(1);
            else advanceManualAffirmation(1);
          });

          navigator.mediaSession.setActionHandler('previoustrack', () => {
            if (isAiSession) advanceAiAffirmation(-1);
            else advanceManualAffirmation(-1);
          });
        } catch (_) {}
      }
    }
  }, [
    isAiSession,
    aiAffirmations,
    aiIndex,
    aiTheme,
    currentAffirmation,
    currentSet,
    advanceAiAffirmation,
    advanceManualAffirmation,
    playCurrentAffirmationAudio,
    playManualCurrentAffirmationAudio,
  ]);

  // Gesture handling
  const bindCardGesture = useDrag(
    ({ down, movement: [mx], velocity: [vx], direction: [dx], tap }) => {
      if (tap) {
        setDragOffsetX(0);
        if (isAiSession) {
          advanceAiAffirmation(1);
        } else {
          advanceManualAffirmation(1);
        }
        return;
      }

      if (down) {
        setDragOffsetX(mx * 0.45);
      } else {
        setDragOffsetX(0);
        if (Math.abs(mx) > 48 || vx > 0.45) {
          const swipeDir = dx < 0 || mx < 0 ? 1 : -1;
          if (isAiSession) {
            advanceAiAffirmation(swipeDir);
          } else {
            advanceManualAffirmation(swipeDir);
          }
        }
      }
    },
    {
      axis: 'x',
      filterTaps: true,
      rubberband: true,
    }
  );

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 90 : -90,
      opacity: 0,
      scale: 0.95,
      filter: 'blur(5px)',
    }),
    center: {
      x: dragOffsetX,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: IOS_LAYOUT_SPRING,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -90 : 90,
      opacity: 0,
      scale: 0.95,
      filter: 'blur(5px)',
      transition: { duration: 0.22, ease: [0.32, 0.72, 0, 1] as const },
    }),
  };

  // ========================================================
  // RENDER CASE 1: AI RAMPAGE SLIDING QUEUE SESSION (AYA METHOD)
  // ========================================================
  if (isAiSession) {
    const currentAiAff = aiAffirmations[aiIndex];
    const totalAiNow = aiAffirmations.length;
    const totalAiRepeats = aiAffirmations.reduce(
      (sum, a) => sum + (a.repeatCount || 0),
      0
    );

    return (
      <div className="space-y-4">
        {/* AI Session Header Banner */}
        <div className="p-3 sm:p-4 rounded-3xl liquid-glass-surface flex items-center justify-between gap-3 border border-manifest-auraPurple/30">
          <div className="flex-1 min-w-0 px-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5">
              <span className="w-2 h-2 rounded-full bg-manifest-auraPurple animate-pulse shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-manifest-auraPurple">
                Voz AYA en vivo • Lote {batchCount}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-serif font-bold text-manifest-ink truncate mt-0.5">
              “{aiTheme}”
            </h3>
            <p className="text-[11px] text-manifest-inkMuted mt-0.5">
              Cola dinámica de {totalAiNow} afirmaciones generadas
            </p>
          </div>

          {/* Prominent "Finalizar Rampage" Button */}
          <motion.button
            type="button"
            whileTap={IOS_TAP_SPRING}
            onClick={handleOpenFinishModal}
            data-testid="finish-rampage-btn"
            className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-2xl primary-gradient-btn text-xs font-semibold shadow-sm cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Finalizar Rampage</span>
          </motion.button>
        </div>

        {/* Subheader: Progreso en tiempo real & Controles de Audio */}
        <div className="flex items-center justify-between px-2 pt-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-manifest-ink" data-testid="rampage-progress-label">
              Afirmación {totalAiNow > 0 ? aiIndex + 1 : 0} de {totalAiNow}
            </span>
            {/* Dots */}
            <div className="flex items-center gap-1 max-w-[140px] overflow-hidden">
              {aiAffirmations.map((_, dotIdx) => (
                <span
                  key={dotIdx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    dotIdx === aiIndex
                      ? 'w-4 bg-manifest-auraPurple'
                      : 'w-1.5 bg-manifest-ink/20'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isFetchingBatchRef.current && (
              <div
                data-testid="prefetching-indicator"
                className="flex items-center gap-1 text-[11px] text-manifest-auraPurple animate-pulse font-medium"
              >
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="hidden sm:inline">Pre-cargando lote +3...</span>
              </div>
            )}

            {/* Auto-Advance Toggle Badge */}
            <button
              type="button"
              onClick={() => setAutoAdvance((p) => !p)}
              data-testid="toggle-auto-advance"
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                autoAdvance
                  ? 'bg-manifest-lavender/50 text-manifest-auraPurple border-manifest-auraPurple/40'
                  : 'bg-white/70 text-manifest-inkMuted border-black/10'
              }`}
              title={autoAdvance ? 'Avance automático activado' : 'Modo manual por toque'}
            >
              {autoAdvance ? 'Auto' : 'Manual'}
            </button>
          </div>
        </div>

        {/* Protagonist Card / Liquid Skeleton with Real-Time Reactive Pastel Halo */}
        <div className="relative overflow-hidden contain-layout w-full min-h-[230px] sm:min-h-[260px] flex items-center justify-center p-2">
          {isInitialLoading ? (
            <RampageCardSkeleton />
          ) : (
            <AnimatePresence mode="popLayout" custom={direction}>
              {currentAiAff && (
                <div className="relative w-full">
                  {/* Halo Reactivo Pastel a 60fps sincronizado al AnalyserNode de Web Audio API */}
                  <div
                    data-testid="voice-reactive-halo"
                    aria-hidden="true"
                    className="absolute -inset-1.5 rounded-[2.25rem] pointer-events-none transition-all duration-100 ease-out"
                    style={{
                      background:
                        'radial-gradient(circle, rgba(184,163,248,0.45) 0%, rgba(254,205,211,0.35) 50%, rgba(186,230,253,0.3) 100%)',
                      opacity: isVoicePlaying ? 0.35 + reactiveEnergy * 0.65 : 0.08,
                      transform: `scale(${1 + reactiveEnergy * 0.035})`,
                      filter: `blur(${8 + reactiveEnergy * 14}px)`,
                    }}
                  />

                  <motion.div
                    key={`ai-card-${currentAiAff.id}-${aiIndex}`}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    whileTap={IOS_TAP_SPRING}
                    {...(bindCardGesture() as any)}
                    data-testid="rampage-next-btn"
                    className="w-full relative p-6 sm:p-9 rounded-3xl sm:rounded-[2rem] liquid-glass-surface shadow-liquid cursor-pointer select-none flex flex-col justify-between min-h-[220px] sm:min-h-[250px] touch-pan-y border border-white/80"
                  >
                    {/* Corner Decorative Quotation Marks (4 corners) */}
                    <span
                      aria-hidden="true"
                      className="absolute top-3.5 left-4 font-serif text-3xl sm:text-4xl text-manifest-ink/20 select-none pointer-events-none leading-none"
                    >
                      “
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute top-3.5 right-4 font-serif text-3xl sm:text-4xl text-manifest-ink/20 select-none pointer-events-none leading-none rotate-180"
                    >
                      “
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute bottom-3.5 left-4 font-serif text-3xl sm:text-4xl text-manifest-ink/20 select-none pointer-events-none leading-none rotate-180"
                    >
                      ”
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute bottom-3.5 right-4 font-serif text-3xl sm:text-4xl text-manifest-ink/20 select-none pointer-events-none leading-none"
                    >
                      ”
                    </span>

                    {/* Sub-header inside card */}
                    <div className="relative z-10 flex items-center justify-between pb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-manifest-lavender/50 text-manifest-auraPurple border border-white flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>AFIRMACIÓN #{aiIndex + 1}</span>
                      </span>

                      {/* Repetition Counter & Audio Indicator */}
                      <div className="flex items-center gap-2">
                        {isVoicePlaying && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-manifest-auraPurple px-2 py-0.5 rounded-full bg-manifest-lavender/30 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-manifest-auraPurple" />
                            <span>Voz AYA</span>
                          </span>
                        )}

                        <div
                          title="Contador independiente de repeticiones"
                          className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/85 border border-white shadow-sm"
                        >
                          <Flame
                            className={`w-3.5 h-3.5 ${
                              (currentAiAff.repeatCount || 0) > 0
                                ? 'text-amber-500 fill-amber-400'
                                : 'text-manifest-inkMuted'
                            }`}
                          />
                          <span
                            data-testid="rampage-repeat-counter"
                            className="text-xs font-bold text-manifest-ink"
                          >
                            {currentAiAff.repeatCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Protagonist Affirmation Text OR Active Voice Recording State */}
                    {recordingAffId === currentAiAff.id ? (
                      <div className="relative z-10 my-auto py-4 text-center px-4 space-y-2 animate-in fade-in" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2 text-rose-500 font-semibold text-xs">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                          <span>Grabando tu voz ({recordingSeconds}s)...</span>
                        </div>
                        <WaveBars count={16} active={true} minHeight={4} maxHeight={22} className="h-6" />
                        <p className="text-xs text-manifest-inkMuted text-center">
                          Repite en voz alta con naturalidad:
                        </p>
                        <p className="text-sm sm:text-base font-serif font-bold text-manifest-ink italic">
                          &ldquo;{currentAiAff.text}&rdquo;
                        </p>
                        <div className="flex items-center justify-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={stopRecordingCurrentAffirmation}
                            className="px-3.5 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <Square className="w-3 h-3 fill-white" />
                            <span>Detener y guardar</span>
                          </button>
                          <button
                            type="button"
                            onClick={cancelRecordingCurrentAffirmation}
                            className="px-3 py-1.5 rounded-full text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative z-10 my-auto py-5 text-center px-4 sm:px-6">
                        <p className="text-base sm:text-xl md:text-2xl font-serif font-bold text-manifest-ink leading-relaxed tracking-tight">
                          {currentAiAff.text}
                        </p>
                      </div>
                    )}

                    {/* Compact iOS Audio Controls & Tactile Hint */}
                    <div className="relative z-10 flex items-center justify-between pt-2 border-t border-black/[0.04]">
                      {/* Play / Pause / Replay / Record Buttons */}
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <motion.button
                          type="button"
                          whileTap={IOS_TAP_SPRING}
                          onClick={() => {
                            if (isVoicePlaying) {
                              audioEngine.stopVoice();
                              setIsVoicePlaying(false);
                            } else {
                              playCurrentAffirmationAudio();
                            }
                          }}
                          data-testid="audio-play-pause-btn"
                          className="w-7 h-7 rounded-full glass-pill text-manifest-ink flex items-center justify-center shadow-xs transition-colors cursor-pointer hover:bg-manifest-glassControlHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus"
                          title={isVoicePlaying ? 'Pausar audio' : 'Reproducir voz'}
                        >
                          <AnimatePresence mode="wait" initial={false}>
                            {isVoicePlaying ? (
                              <motion.div
                                key="pause"
                                initial={{ opacity: 0, scale: 0.7, rotate: -25 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                exit={{ opacity: 0, scale: 0.7, rotate: 25 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 26 }}
                              >
                                <Pause className="w-3.5 h-3.5" />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="play"
                                initial={{ opacity: 0, scale: 0.7, rotate: 25 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                exit={{ opacity: 0, scale: 0.7, rotate: -25 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 26 }}
                              >
                                <Play className="w-3.5 h-3.5 ml-0.5" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>

                        <button
                          type="button"
                          onClick={() => playCurrentAffirmationAudio()}
                          data-testid="audio-repeat-btn"
                          className="w-7 h-7 rounded-full glass-pill text-manifest-ink flex items-center justify-center shadow-xs transition-colors cursor-pointer hover:bg-manifest-glassControlHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus"
                          title="Repetir audio actual"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>

                        <motion.button
                          type="button"
                          whileTap={IOS_TAP_SPRING}
                          onClick={() => {
                            if (recordingAffId === currentAiAff.id) {
                              stopRecordingCurrentAffirmation();
                            } else {
                              startRecordingCurrentAffirmation(currentAiAff);
                            }
                          }}
                          data-testid="audio-record-btn"
                          className={`w-7 h-7 rounded-full flex items-center justify-center shadow-xs transition-colors cursor-pointer border ${
                            recordingAffId === currentAiAff.id
                              ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                              : hasRecordedVoiceMap[currentAiAff.id]
                              ? 'bg-purple-100 text-manifest-auraPurple border-purple-300 hover:bg-purple-200'
                              : 'glass-pill text-manifest-inkMuted hover:text-manifest-ink border-manifest-glassBorder hover:bg-manifest-glassControlHover'
                          }`}
                          title={
                            hasRecordedVoiceMap[currentAiAff.id]
                              ? 'Volver a grabar tu voz para esta afirmación'
                              : 'Grabar tu propia voz repitiendo esta afirmación'
                          }
                        >
                          <Mic className="w-3.5 h-3.5" />
                        </motion.button>

                        {hasRecordedVoiceMap[currentAiAff.id] && (
                          <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50/80 px-2 py-0.5 rounded-full border border-emerald-200/60 shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Tu Voz Grabada</span>
                          </div>
                        )}
                      </div>

                      {isVoicePlaying ? (
                        <div className="flex items-center gap-1.5 text-manifest-auraPurple">
                          <span className="text-[10px] font-semibold">
                            {hasRecordedVoiceMap[currentAiAff.id] ? 'Tu Voz Real' : 'Voz AYA'}
                          </span>
                          <WaveBars count={10} active={true} minHeight={3} maxHeight={12} className="h-3.5" />
                        </div>
                      ) : (
                        <span className="text-[10px] font-medium text-manifest-inkMuted/60">
                          Bucle Subliminal
                        </span>
                      )}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Rampage Decision Modal */}
        <RampageDecisionModal
          isOpen={isDecisionOpen}
          title={aiTheme}
          totalAffirmations={totalAiNow}
          totalRepeats={totalAiRepeats}
          onSave={handleSaveAiSession}
          onDiscard={handleDiscardAiSession}
          onClose={() => setIsDecisionOpen(false)}
        />
      </div>
    );
  }

  // ========================================================
  // RENDER CASE 2: EMPTY STATE (NO SETS YET)
  // ========================================================
  if (!currentSet || totalSets === 0) {
    return (
      <div className="p-8 rounded-3xl liquid-glass-surface text-center space-y-3">
        <Sparkles className="w-8 h-8 text-manifest-auraPurple mx-auto" />
        <h4 className="font-serif text-base font-bold text-manifest-ink">
          Crea tu primer Set de Rampage
        </h4>
        <p className="text-xs text-manifest-inkMuted max-w-sm mx-auto">
          Un set de rampage es una secuencia rítmica de afirmaciones con tu propia voz clonada para repetir en bucle y reprogramar tu subconsciente.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <motion.button
            whileTap={IOS_TAP_SPRING}
            onClick={openRampageConfig}
            data-testid="open-rampage-modal-btn"
            className="px-5 py-2.5 rounded-xl primary-gradient-btn text-xs font-semibold cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Iniciar Rampage con IA</span>
          </motion.button>
          <button
            type="button"
            onClick={() => openRampageSetEditor(null)}
            className="px-4 py-2 rounded-xl text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink hover:bg-manifest-glassControlHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus transition-colors"
          >
            O crear manualmente
          </button>
        </div>

        {/* Rampage Config Drawer */}
        <RampageConfigDrawer
          isOpen={isRampageConfigOpen}
          onClose={closeRampageConfig}
          onStartSession={handleStartAiSession}
          onOpenManualEditor={() => openRampageSetEditor(null)}
        />
      </div>
    );
  }

  // ========================================================
  // RENDER CASE 3: STANDARD MANUAL RAMPAGE SETS VIEW
  // ========================================================
  return (
    <div className="space-y-4">
      {/* Set Navigation Bar */}
      <div className="p-3 sm:p-4 rounded-3xl liquid-glass-surface flex items-center justify-between gap-3">
        <motion.button
          type="button"
          whileTap={IOS_TAP_SPRING}
          onClick={(e) => {
            e.stopPropagation();
            if (totalSets <= 1) return;
            setDirection(-1);
            setActiveSetIndex((prev) => (prev - 1 + totalSets) % totalSets);
            setAffirmationIndex(0);
          }}
          disabled={totalSets <= 1}
          title="Set anterior"
          className="w-8 h-8 rounded-full flex items-center justify-center glass-pill text-manifest-ink disabled:opacity-35 transition-colors shadow-sm cursor-pointer hover:bg-manifest-glassControlHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus"
        >
          <ChevronLeft className="w-4 h-4" />
        </motion.button>

        <div className="flex-1 text-center min-w-0 px-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-manifest-auraPurple block">
            Set {safeSetIndex + 1} de {totalSets}
          </span>
          <h3 className="text-sm sm:text-base font-serif font-bold text-manifest-ink truncate mt-0.5">
            “{currentSet.title}”
          </h3>
          <p className="text-[11px] text-manifest-inkMuted mt-0.5">
            Secuencia de {totalAffirmationsInSet} afirmaciones
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <motion.button
            type="button"
            whileTap={IOS_TAP_SPRING}
            onClick={(e) => {
              e.stopPropagation();
              if (totalSets <= 1) return;
              setDirection(1);
              setActiveSetIndex((prev) => (prev + 1) % totalSets);
              setAffirmationIndex(0);
            }}
            disabled={totalSets <= 1}
            title="Set siguiente"
            className="w-8 h-8 rounded-full flex items-center justify-center glass-pill text-manifest-ink disabled:opacity-35 transition-colors shadow-sm cursor-pointer hover:bg-manifest-glassControlHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Subheader */}
      <div className="flex items-center justify-between px-2 pt-0.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-manifest-ink">
            Afirmación {safeAffirmationIndex + 1} de {totalAffirmationsInSet}
          </span>
          <div className="flex items-center gap-1">
            {currentSet.affirmations.map((_, dotIdx) => (
              <span
                key={dotIdx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  dotIdx === safeAffirmationIndex
                    ? 'w-4 bg-manifest-auraPurple'
                    : 'w-1.5 bg-manifest-ink/20'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Subliminal Audio Mode for Saved Set */}
          <motion.button
            type="button"
            whileTap={IOS_TAP_SPRING}
            onClick={toggleSubliminalSavedSession}
            data-testid="toggle-saved-subliminal-btn"
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              isSubliminalSavedSession
                ? 'bg-emerald-500 text-white shadow-emerald-500/25 ring-2 ring-emerald-300/40'
                : 'glass-pill text-manifest-auraPurple hover:text-manifest-ink border border-manifest-glassBorder hover:bg-manifest-glassControlHover'
            }`}
            title="Escuchar este set en bucle continuo para dormir o meditar"
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>{isSubliminalSavedSession ? 'Subliminal Activo' : 'Modo Audio Subliminal'}</span>
          </motion.button>

          <span className="text-manifest-ink/20">•</span>

          <motion.button
            type="button"
            whileTap={IOS_TAP_SPRING}
            onClick={openRampageConfig}
            className="flex items-center gap-1 text-[11px] font-semibold text-manifest-auraPurple hover:text-manifest-ink transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>Rampage IA</span>
          </motion.button>

          <span className="text-manifest-ink/20">•</span>

          <motion.button
            type="button"
            whileTap={IOS_TAP_SPRING}
            onClick={() => openRampageSetEditor(currentSet)}
            className="flex items-center gap-1 text-[11px] font-semibold text-manifest-inkMuted hover:text-manifest-ink transition-colors cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            <span>Editar</span>
          </motion.button>
        </div>
      </div>

      {/* Protagonist Affirmation Card with SmoothSizeContainer */}
      <SmoothSizeContainer className="w-full">
        <div className="relative overflow-hidden contain-layout w-full min-h-[220px] sm:min-h-[250px] flex items-center justify-center">
          <AnimatePresence mode="popLayout" custom={direction}>
            {currentAffirmation && (
              <motion.div
                key={`${currentSet.id}-${currentAffirmation.id}-${safeAffirmationIndex}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                whileTap={IOS_TAP_SPRING}
                {...(bindCardGesture() as any)}
                data-testid="rampage-next-btn"
                className="w-full relative p-6 sm:p-9 rounded-3xl sm:rounded-[2rem] liquid-glass-surface shadow-liquid cursor-pointer select-none flex flex-col justify-between min-h-[220px] sm:min-h-[250px] touch-pan-y"
              >
                {/* Corner Decorative Quotation Marks (4 corners) */}
                <span
                  aria-hidden="true"
                  className="absolute top-3.5 left-4 font-serif text-3xl sm:text-4xl text-manifest-ink/20 select-none pointer-events-none leading-none"
                >
                  “
                </span>
                <span
                  aria-hidden="true"
                  className="absolute top-3.5 right-4 font-serif text-3xl sm:text-4xl text-manifest-ink/20 select-none pointer-events-none leading-none rotate-180"
                >
                  “
                </span>
                <span
                  aria-hidden="true"
                  className="absolute bottom-3.5 left-4 font-serif text-3xl sm:text-4xl text-manifest-ink/20 select-none pointer-events-none leading-none rotate-180"
                >
                  ”
                </span>
                <span
                  aria-hidden="true"
                  className="absolute bottom-3.5 right-4 font-serif text-3xl sm:text-4xl text-manifest-ink/20 select-none pointer-events-none leading-none"
                >
                  ”
                </span>

                {/* Sub-header inside card */}
                <div className="relative z-10 flex items-center justify-between pb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-manifest-lavender/50 text-manifest-auraPurple border border-white">
                    AFIRMACIÓN #{safeAffirmationIndex + 1}
                  </span>

                  <div
                    title="Contador independiente de esta afirmación"
                    className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/85 border border-white shadow-sm"
                  >
                    <Flame
                      className={`w-3.5 h-3.5 ${
                        (currentAffirmation.repeatCount || 0) > 0
                          ? 'text-amber-500 fill-amber-400'
                          : 'text-manifest-inkMuted'
                      }`}
                    />
                    <span
                      data-testid="rampage-repeat-counter"
                      className="text-xs font-bold text-manifest-ink"
                    >
                      {currentAffirmation.repeatCount || 0}
                    </span>
                  </div>
                </div>

                {/* Affirmation Text Protagonist OR Active Voice Recording State */}
                {recordingAffId === currentAffirmation.id ? (
                  <div className="relative z-10 my-auto py-4 text-center px-4 space-y-2 animate-in fade-in" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2 text-rose-500 font-semibold text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                      <span>Grabando tu voz ({recordingSeconds}s)...</span>
                    </div>
                    <WaveBars count={16} active={true} minHeight={4} maxHeight={22} className="h-6" />
                    <p className="text-xs text-manifest-inkMuted text-center">
                      Repite en voz alta con naturalidad:
                    </p>
                    <p className="text-sm sm:text-base font-serif font-bold text-manifest-ink italic">
                      &ldquo;{currentAffirmation.text}&rdquo;
                    </p>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={stopRecordingCurrentAffirmation}
                        className="px-3.5 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Square className="w-3 h-3 fill-white" />
                        <span>Detener y guardar</span>
                      </button>
                      <button
                        type="button"
                        onClick={cancelRecordingCurrentAffirmation}
                        className="px-3 py-1.5 rounded-full text-xs font-medium text-manifest-inkMuted hover:text-manifest-ink cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative z-10 my-auto py-6 text-center px-4 sm:px-6">
                    <p className="text-lg sm:text-2xl md:text-3xl font-serif font-bold text-manifest-ink leading-relaxed tracking-tight">
                      {currentAffirmation.text}
                    </p>
                  </div>
                )}

                {/* Bottom Bar: Audio controls & wave indicator */}
                <div className="relative z-10 flex items-center justify-between pt-2 border-t border-black/[0.04]">
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <motion.button
                      type="button"
                      whileTap={IOS_TAP_SPRING}
                      onClick={() => {
                        if (isVoicePlaying) {
                          audioEngine.stopVoice();
                          setIsVoicePlaying(false);
                        } else {
                          playManualCurrentAffirmationAudio();
                        }
                      }}
                      data-testid="audio-play-pause-btn"
                      className="w-7 h-7 rounded-full glass-pill text-manifest-ink flex items-center justify-center shadow-xs transition-colors cursor-pointer hover:bg-manifest-glassControlHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus"
                      title={isVoicePlaying ? 'Pausar audio' : 'Reproducir voz'}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {isVoicePlaying ? (
                          <motion.div
                            key="pause"
                            initial={{ opacity: 0, scale: 0.7, rotate: -25 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.7, rotate: 25 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 26 }}
                          >
                            <Pause className="w-3.5 h-3.5" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="play"
                            initial={{ opacity: 0, scale: 0.7, rotate: 25 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.7, rotate: -25 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 26 }}
                          >
                            <Play className="w-3.5 h-3.5 ml-0.5" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    <button
                      type="button"
                      onClick={() => playManualCurrentAffirmationAudio()}
                      data-testid="audio-repeat-btn"
                      className="w-7 h-7 rounded-full glass-pill text-manifest-ink flex items-center justify-center shadow-xs transition-colors cursor-pointer hover:bg-manifest-glassControlHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus"
                      title="Repetir audio actual"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>

                    <motion.button
                      type="button"
                      whileTap={IOS_TAP_SPRING}
                      onClick={() => {
                        if (recordingAffId === currentAffirmation.id) {
                          stopRecordingCurrentAffirmation();
                        } else {
                          startRecordingCurrentAffirmation(currentAffirmation);
                        }
                      }}
                      data-testid="audio-record-btn"
                      className={`w-7 h-7 rounded-full flex items-center justify-center shadow-xs transition-colors cursor-pointer border ${
                        recordingAffId === currentAffirmation.id
                          ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                          : hasRecordedVoiceMap[currentAffirmation.id]
                          ? 'bg-purple-100 text-manifest-auraPurple border-purple-300 hover:bg-purple-200'
                          : 'glass-pill text-manifest-inkMuted hover:text-manifest-ink border-manifest-glassBorder hover:bg-manifest-glassControlHover'
                      }`}
                      title={
                        hasRecordedVoiceMap[currentAffirmation.id]
                          ? 'Volver a grabar tu voz para esta afirmación'
                          : 'Grabar tu propia voz repitiendo esta afirmación'
                      }
                    >
                      <Mic className="w-3.5 h-3.5" />
                    </motion.button>

                    {hasRecordedVoiceMap[currentAffirmation.id] && (
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50/80 px-2 py-0.5 rounded-full border border-emerald-200/60 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Tu Voz Grabada</span>
                      </div>
                    )}
                  </div>

                  {isVoicePlaying ? (
                    <div className="flex items-center gap-1.5 text-manifest-auraPurple">
                      <span className="text-[10px] font-semibold">
                        {hasRecordedVoiceMap[currentAffirmation.id] ? 'Tu Voz Real' : 'Voz AYA'}
                      </span>
                      <WaveBars count={10} active={true} minHeight={3} maxHeight={12} className="h-3.5" />
                    </div>
                  ) : isSubliminalSavedSession ? (
                    <span className="text-[10px] font-semibold text-emerald-600">
                      Bucle Subliminal Activo
                    </span>
                  ) : (
                    <span className="text-[10px] text-manifest-inkMuted/60 font-medium">
                      Modo Subliminal
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SmoothSizeContainer>

      {/* Rampage Config Drawer */}
      <RampageConfigDrawer
        isOpen={isRampageConfigOpen}
        onClose={closeRampageConfig}
        onStartSession={handleStartAiSession}
        onOpenManualEditor={() => openRampageSetEditor(null)}
      />
    </div>
  );
};
