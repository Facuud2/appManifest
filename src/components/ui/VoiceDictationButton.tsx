'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic } from 'lucide-react';
import { useAppStore } from '@/store';

interface VoiceDictationButtonProps {
  onTranscript: (fullText: string) => void;
  initialText?: string;
  className?: string;
  title?: string;
  size?: 'sm' | 'md';
}

export const VoiceDictationButton: React.FC<VoiceDictationButtonProps> = ({
  onTranscript,
  initialText = '',
  className = '',
  title = 'Dictar por voz (Español)',
  size = 'md',
}) => {
  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef<boolean>(false);
  const baseTextRef = useRef<string>('');
  const currentFullTextRef = useRef<string>('');
  const recognitionRef = useRef<any>(null);
  const { showToast } = useAppStore();

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isListeningRef.current) {
      isListeningRef.current = false;
      setIsListening(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      return;
    }

    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast(
        'El dictado por voz no es compatible con este navegador. Puedes escribir directamente.',
        'info'
      );
      return;
    }

    // Save initial text reference, but DO NOT show listening pulse until onstart fires
    baseTextRef.current = (initialText || '').trim();
    currentFullTextRef.current = baseTextRef.current;

    const startRecognitionSession = () => {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
          isListeningRef.current = true;
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          if (!isListeningRef.current) return;

          let sessionFinal = '';
          let sessionInterim = '';

          // Iterate over all results in the current session so pauses don't discard previous speech
          for (let i = 0; i < event.results.length; i++) {
            const res = event.results[i];
            const phrase = res[0]?.transcript || '';
            if (res.isFinal) {
              sessionFinal += (sessionFinal ? ' ' : '') + phrase.trim();
            } else {
              sessionInterim += (sessionInterim ? ' ' : '') + phrase.trim();
            }
          }

          let sessionSpoken = [sessionFinal, sessionInterim].filter(Boolean).join(' ').trim();
          if (sessionSpoken) {
            // Strip colloquial Spanish fillers at beginning ("y bueno", "eh", "este", "o sea")
            sessionSpoken = sessionSpoken.replace(/^(y\s+bueno|bueno|eh|este|o\s+sea)[,\s]*/i, '');
            if (!sessionSpoken) return;

            const base = baseTextRef.current;
            let fullText = '';
            if (base) {
              const lastChar = base.slice(-1);
              const needsPeriod = !['.', '!', '?', ';', '\n', ':'].includes(lastChar);
              const prefix = needsPeriod ? `${base}. ` : base.endsWith(' ') ? base : `${base} `;
              const capitalizedSpoken = sessionSpoken.charAt(0).toUpperCase() + sessionSpoken.slice(1);
              fullText = `${prefix}${capitalizedSpoken}`;
            } else {
              fullText = sessionSpoken.charAt(0).toUpperCase() + sessionSpoken.slice(1);
            }

            currentFullTextRef.current = fullText;
            onTranscript(fullText);
          }
        };

        recognition.onerror = (event: any) => {
          if (event.error === 'not-allowed') {
            showToast(
              'Permiso de micrófono denegado. Permite el acceso al micrófono para dictar.',
              'info'
            );
            isListeningRef.current = false;
            setIsListening(false);
          } else if (event.error === 'no-speech') {
            // Silence detected during a pause: keep listening, do not abort
          } else {
            console.warn('Speech recognition status:', event.error);
          }
        };

        recognition.onend = () => {
          // If the user hasn't explicitly stopped (e.g. mobile engine timed out after a pause)
          if (isListeningRef.current) {
            // Snapshot current accumulated text as the new base text for the resumed session
            baseTextRef.current = currentFullTextRef.current;
            try {
              recognition.start();
            } catch (_) {
              setTimeout(() => {
                if (isListeningRef.current) {
                  try {
                    startRecognitionSession();
                  } catch (_) {
                    isListeningRef.current = false;
                    setIsListening(false);
                  }
                }
              }, 250);
            }
          } else {
            setIsListening(false);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.warn('Speech recognition init error:', err);
        showToast('No se pudo inicializar el micrófono.', 'info');
        isListeningRef.current = false;
        setIsListening(false);
      }
    };

    startRecognitionSession();
  };

  const isSmall = size === 'sm';

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {isListening && (
        <span className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-manifest-amethyst via-manifest-auraPurple to-manifest-gold opacity-75 blur-sm animate-pulse pointer-events-none" />
      )}
      <button
        type="button"
        onClick={toggleListening}
        title={isListening ? 'Detener dictado' : title}
        className={`relative z-10 flex items-center justify-center transition-all ${
          isSmall ? 'w-7 h-7 rounded-xl text-xs' : 'w-8 h-8 rounded-xl text-sm'
        } ${
          isListening
            ? 'bg-rose-500 text-white shadow-lg ring-2 ring-rose-400/80 scale-105'
            : 'glass-pill text-purple-700 border border-purple-300/50 hover:bg-purple-100/70 shadow-neu-sm'
        }`}
      >
        {isListening ? (
          <span className="relative flex items-center justify-center">
            <Mic className={`${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} animate-pulse`} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-200 animate-ping" />
          </span>
        ) : (
          <Mic className={isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        )}
      </button>
    </div>
  );
};
