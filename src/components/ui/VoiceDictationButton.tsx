'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useAppStore } from '@/store';

interface VoiceDictationButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  title?: string;
  size?: 'sm' | 'md';
}

export const VoiceDictationButton: React.FC<VoiceDictationButtonProps> = ({
  onTranscript,
  className = '',
  title = 'Dictar por voz (Español)',
  size = 'md',
}) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { showToast } = useAppStore();

  useEffect(() => {
    return () => {
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

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      setIsListening(false);
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

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          onTranscript(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          showToast(
            'Permiso de micrófono denegado. Permite el acceso al micrófono para dictar.',
            'info'
          );
        } else if (event.error !== 'no-speech') {
          showToast('Micrófono detenido o sin señal.', 'gentle');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech recognition error:', err);
      showToast('No se pudo inicializar el micrófono.', 'info');
      setIsListening(false);
    }
  };

  const isSmall = size === 'sm';

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {isListening && (
        <span className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-manifest-pink via-manifest-lavender to-manifest-celeste opacity-75 blur-sm animate-pulse pointer-events-none" />
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
            : 'bg-white/80 hover:bg-white text-manifest-inkMuted hover:text-manifest-ink border border-white/90 shadow-sm'
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
