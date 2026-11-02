'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, ArrowUp, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store';
import { logAiTelemetry } from '@/lib/gemini';

export interface VoiceAudioVisualizerProps {
  initialText?: string;
  onCommit: (
    fullText: string,
    extra?: { detectedTone?: string; audioBlob?: Blob; durationMs?: number }
  ) => void;
  onSend?: (fullText: string) => void;
  onCancel: () => void;
  className?: string;
  placeholder?: string;
}

const BAR_COUNT = 13;
const CENTER_INDEX = 6;
const MIN_HEIGHT = 4; // px (silent dot)
const MAX_HEIGHT = 34; // px (peak voice)

export const VoiceAudioVisualizer: React.FC<VoiceAudioVisualizerProps> = ({
  initialText = '',
  onCommit,
  onSend,
  onCancel,
  className = '',
  placeholder = 'Habla ahora...',
}) => {
  const { showToast, aiSandboxMode } = useAppStore();
  const [transcribedText, setTranscribedText] = useState(initialText);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const baseTextRef = useRef<string>((initialText || '').trim());
  const currentFullTextRef = useRef<string>((initialText || '').trim());
  const isListeningRef = useRef<boolean>(true);

  // References for Web Audio API & MediaRecorder
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  const maxTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordedMimeTypeRef = useRef<string>('audio/webm');

  // References for the 13 CAVA bars
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const barHeightsRef = useRef<number[]>(new Array(BAR_COUNT).fill(MIN_HEIGHT));

  // Stop MediaRecorder and wait for the final data flush
  const stopAndGetAudioBlob = (): Promise<Blob> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        resolve(
          new Blob(audioChunksRef.current, {
            type: recordedMimeTypeRef.current || 'audio/webm',
          })
        );
        return;
      }

      recorder.onstop = () => {
        const finalBlob = new Blob(audioChunksRef.current, {
          type: recordedMimeTypeRef.current || 'audio/webm',
        });
        resolve(finalBlob);
      };

      try {
        recorder.stop();
      } catch (_) {
        resolve(
          new Blob(audioChunksRef.current, {
            type: recordedMimeTypeRef.current || 'audio/webm',
          })
        );
      }
    });
  };

  // Cleanup all audio and speech resources
  const cleanup = useCallback(() => {
    isListeningRef.current = false;

    if (maxTimerRef.current) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_) {}
      recognitionRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (_) {}
      });
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      try {
        if (audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }
      } catch (_) {}
      audioContextRef.current = null;
    }
  }, []);

  // Process recorded audio with Gemini AI editorial transcript
  const processRecordedAudio = async (isSendAction: boolean) => {
    if (isTranscribing) return;

    const duration = Date.now() - recordingStartTimeRef.current;
    const spokenTextSnapshot = (currentFullTextRef.current || '').trim();

    // 1. Await final audio blob from recorder before tearing down resources
    const audioBlob = await stopAndGetAudioBlob();
    cleanup();

    const hasSpokenWords = spokenTextSnapshot.length > 0;
    const hasAudioData = audioBlob.size > 800 && duration >= 800;

    // Guardrail: Cancel locally if silence or too short
    if (!hasSpokenWords && !hasAudioData) {
      showToast('Grabación demasiado corta', 'info');
      onCancel();
      return;
    }

    setIsTranscribing(true);

    try {
      const isWebdriver =
        typeof window !== 'undefined' && (window.navigator as any)?.webdriver === true;
      const isSandboxActive = Boolean(aiSandboxMode && isWebdriver);

      const formData = new FormData();
      if (audioBlob.size > 200) {
        const ext = recordedMimeTypeRef.current.includes('mp4') ? 'mp4' : 'webm';
        formData.append('audio', audioBlob, `speech.${ext}`);
      }
      if (spokenTextSnapshot) {
        formData.append('spokenText', spokenTextSnapshot);
      }
      formData.append('previousTextTail', baseTextRef.current.slice(-60));

      const res = await fetch('/api/ai/transcribe', {
        method: 'POST',
        headers: isSandboxActive ? { 'x-ai-sandbox': 'true' } : {},
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      logAiTelemetry('/api/ai/transcribe', data.source, data.totalTokens || 0, {
        durationMs: duration,
        blobSize: audioBlob.size,
        spokenLength: spokenTextSnapshot.length,
      });

      const editorialText = (data.text || spokenTextSnapshot).trim();
      let combinedText = '';

      if (baseTextRef.current) {
        const lastChar = baseTextRef.current.slice(-1);
        const needsPeriod = !['.', '!', '?', ';', '\n', ':'].includes(lastChar);
        const prefix = needsPeriod
          ? `${baseTextRef.current}. `
          : baseTextRef.current.endsWith(' ')
          ? baseTextRef.current
          : `${baseTextRef.current} `;
        combinedText = `${prefix}${editorialText}`;
      } else {
        combinedText = editorialText;
      }

      const finalText = combinedText.trim() || spokenTextSnapshot;
      onCommit(finalText, {
        detectedTone: data.detectedTone,
        audioBlob,
        durationMs: duration,
      });
      if (isSendAction && onSend) {
        onSend(finalText);
      }
    } catch (err) {
      console.warn('[AI Transcribe] Falling back directly to spoken words:', err);
      // Fallback directly to whatever the user actually said!
      const fallback = spokenTextSnapshot;
      if (fallback) {
        const base = baseTextRef.current;
        const separator = base && !base.endsWith(' ') ? ' ' : '';
        const full = base ? `${base}${separator}${fallback}` : fallback;
        onCommit(full, {
          detectedTone: 'calma, firme, íntima',
          audioBlob,
          durationMs: duration,
        });
        if (isSendAction && onSend) onSend(full);
      } else {
        onCancel();
      }
    } finally {
      setIsTranscribing(false);
    }
  };

  const processRecordedAudioRef = useRef(processRecordedAudio);
  processRecordedAudioRef.current = processRecordedAudio;

  const handleStop = () => {
    processRecordedAudio(false);
  };

  const handleSend = () => {
    processRecordedAudio(true);
  };

  const handleCancel = useCallback(() => {
    cleanup();
    onCancel();
  }, [cleanup, onCancel]);

  useEffect(() => {
    isListeningRef.current = true;
    baseTextRef.current = (initialText || '').trim();
    currentFullTextRef.current = '';
    setTranscribedText('');
    audioChunksRef.current = [];
    recordingStartTimeRef.current = Date.now();

    if (typeof window === 'undefined') return;

    // 1. Initialize Web Audio API and MediaRecorder
    const startAudioSystem = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.warn('getUserMedia not supported in this environment');
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        if (!isListeningRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        mediaStreamRef.current = stream;

        // Determine compatible MIME type (iOS WebKit compatibility: audio/mp4 or audio/webm)
        let mimeType = 'audio/webm';
        if (typeof MediaRecorder !== 'undefined') {
          if (MediaRecorder.isTypeSupported('audio/mp4')) {
            mimeType = 'audio/mp4';
          } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            mimeType = 'audio/webm;codecs=opus';
          } else if (MediaRecorder.isTypeSupported('audio/webm')) {
            mimeType = 'audio/webm';
          }
        }
        recordedMimeTypeRef.current = mimeType;

        try {
          const recorder = new MediaRecorder(stream, {
            mimeType,
            audioBitsPerSecond: 32000,
          });

          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };

          recorder.start(250); // collect chunks every 250ms
          mediaRecorderRef.current = recorder;
          recordingStartTimeRef.current = Date.now();

          // Limit continuous recording to a maximum of 90 seconds
          maxTimerRef.current = setTimeout(() => {
            if (isListeningRef.current) {
              showToast('Límite de grabación de 90s alcanzado', 'info');
              processRecordedAudioRef.current(false);
            }
          }, 90000);
        } catch (recorderErr) {
          console.warn('MediaRecorder init error:', recorderErr);
        }

        // Setup Web Audio Analyser for CAVA 13 bars
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        audioContextRef.current = audioCtx;

        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.55;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const renderFrame = () => {
          if (!isListeningRef.current || !analyserRef.current) return;

          analyserRef.current.getByteFrequencyData(dataArray);

          let sum = 0;
          let count = 0;
          for (let i = 1; i < Math.min(dataArray.length, 16); i++) {
            sum += dataArray[i];
            count++;
          }
          const avg = count > 0 ? sum / count : 0;
          const normalizedVol = Math.max(0, (avg - 12) / (255 - 12));

          for (let i = 0; i < BAR_COUNT; i++) {
            const bar = barRefs.current[i];
            if (!bar) continue;

            const distFromCenter = Math.abs(i - CENTER_INDEX) / CENTER_INDEX;
            const bellWeight = Math.max(
              0.15,
              Math.cos(distFromCenter * (Math.PI * 0.46))
            );

            const binIdx = Math.min(
              dataArray.length - 1,
              Math.max(1, Math.round(2 + (1 - distFromCenter) * 5 + (i % 2)))
            );
            const binEnergy = (dataArray[binIdx] || 0) / 255;
            const waveEnergy = (normalizedVol * 0.75 + binEnergy * 0.25) * bellWeight;
            const targetHeight =
              MIN_HEIGHT + waveEnergy * (MAX_HEIGHT - MIN_HEIGHT);

            const prevHeight = barHeightsRef.current[i] || MIN_HEIGHT;
            const smoothedHeight =
              prevHeight + (targetHeight - prevHeight) * 0.4;
            barHeightsRef.current[i] = smoothedHeight;

            bar.style.height = `${smoothedHeight.toFixed(1)}px`;
          }

          animFrameRef.current = requestAnimationFrame(renderFrame);
        };

        animFrameRef.current = requestAnimationFrame(renderFrame);
      } catch (err: any) {
        console.warn('Audio analysis init:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          showToast(
            'Permiso de micrófono denegado. Permite el acceso para dictar.',
            'info'
          );
        }
      }
    };

    // 2. Initialize Real-Time Speech Recognition for instant visual feedback
    const startSpeechRecognition = () => {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) return;

      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          if (!isListeningRef.current) return;

          let sessionFinal = '';
          let sessionInterim = '';

          for (let i = 0; i < event.results.length; i++) {
            const res = event.results[i];
            const phrase = res[0]?.transcript || '';
            if (res.isFinal) {
              sessionFinal += (sessionFinal ? ' ' : '') + phrase.trim();
            } else {
              sessionInterim += (sessionInterim ? ' ' : '') + phrase.trim();
            }
          }

          const sessionSpoken = [sessionFinal, sessionInterim]
            .filter(Boolean)
            .join(' ')
            .trim();

          if (sessionSpoken) {
            currentFullTextRef.current = sessionSpoken;
            setTranscribedText(sessionSpoken);
          }
        };

        recognition.onerror = (event: any) => {
          if (event.error === 'not-allowed') {
            showToast(
              'Permiso de micrófono denegado. Permite el acceso para dictar.',
              'info'
            );
            handleCancel();
          }
        };

        recognition.onend = () => {
          if (isListeningRef.current) {
            try {
              recognition.start();
            } catch (_) {
              setTimeout(() => {
                if (isListeningRef.current) {
                  try {
                    startSpeechRecognition();
                  } catch (_) {}
                }
              }, 250);
            }
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (e) {
        console.warn('SpeechRecognition start error:', e);
      }
    };

    startAudioSystem();
    startSpeechRecognition();

    return () => {
      cleanup();
    };
  }, [cleanup, initialText, showToast, handleCancel]);

  return (
    <div
      className={`w-full flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-200 ${className}`}
      data-testid="gemini-voice-visualizer"
    >
      {/* Real-time transcribed text preview banner or transcribing spinner */}
      {isTranscribing ? (
        <div className="flex items-center justify-between px-3.5 py-1 text-[11px] text-manifest-auraPurple min-h-[20px] transition-all">
          <div className="flex items-center gap-1.5 truncate">
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-manifest-auraPurple" />
            <span className="font-semibold">Puntuando y limpiando con Gemini...</span>
          </div>
          <span className="text-[10px] text-manifest-inkLight shrink-0 ml-2">
            Gemini Flash
          </span>
        </div>
      ) : transcribedText ? (
        <div className="flex items-center justify-between px-3.5 py-1 text-[11px] text-manifest-inkMuted min-h-[20px] transition-all">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="truncate font-medium">{transcribedText}</span>
          </div>
          <span className="text-[10px] text-manifest-inkLight shrink-0 ml-2">
            Escuchando...
          </span>
        </div>
      ) : (
        <div className="flex items-center px-3.5 py-1 text-[11px] text-manifest-inkLight min-h-[20px]">
          <span>{placeholder}</span>
        </div>
      )}

      {/* Gemini Voice Pill Container */}
      <div className="w-full h-14 rounded-full bg-white border border-black/5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] px-3.5 sm:px-4 flex items-center justify-between gap-3 select-none">
        {/* Left: Plus (+) Button to Cancel */}
        <button
          type="button"
          onClick={handleCancel}
          disabled={isTranscribing}
          title="Cancelar dictado"
          aria-label="Cancelar dictado"
          className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-800 hover:text-black hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Plus className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Center: CAVA Audio Waves (13 vertical bars growing symmetrically from the middle) */}
        <div
          className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 h-10 overflow-hidden px-1"
          aria-hidden="true"
        >
          {Array.from({ length: BAR_COUNT }).map((_, i) => (
            <span
              key={i}
              ref={(el) => {
                barRefs.current[i] = el;
              }}
              style={{ height: `${MIN_HEIGHT}px` }}
              className="w-[3px] sm:w-[3.5px] rounded-full bg-[#111111] transition-[height] duration-75 block shrink-0"
            />
          ))}
        </div>

        {/* Right Action Buttons: Stop (⏹) and Send (↑) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Stop / Pause Button (⏹): Detiene, transcribe y guarda en el campo */}
          <button
            type="button"
            onClick={handleStop}
            disabled={isTranscribing}
            title="Detener y conservar lo dicho"
            aria-label="Detener y conservar lo dicho"
            data-testid="voice-stop-btn"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#E8EAED] hover:bg-[#DCE0E5] active:scale-95 flex items-center justify-center transition-all cursor-pointer text-neutral-900 shadow-sm disabled:opacity-50"
          >
            {isTranscribing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <span className="w-3.5 h-3.5 rounded-[3px] border-[2px] border-neutral-900 bg-transparent block" />
            )}
          </button>

          {/* Send / Commit Button (↑): Detiene, transcribe y confirma */}
          <button
            type="button"
            onClick={handleSend}
            disabled={isTranscribing}
            title="Aceptar y enviar"
            aria-label="Aceptar y enviar"
            data-testid="voice-send-btn"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#A8D4FE] hover:bg-[#92c6fd] active:scale-95 flex items-center justify-center transition-all cursor-pointer text-neutral-900 shadow-sm disabled:opacity-50"
          >
            {isTranscribing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
