'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Trash2, PenLine, Sparkles } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
  simulatedError?: 'storage' | 'speech' | 'render' | null;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorType: 'storage' | 'speech' | 'render' | 'unknown';
}

export class ActionableErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorType: 'unknown',
  };

  public static getDerivedStateFromError(error: Error): State {
    const msg = error?.message?.toLowerCase() || '';
    let errorType: State['errorType'] = 'render';

    if (msg.includes('quota') || msg.includes('localstorage') || msg.includes('storage')) {
      errorType = 'storage';
    } else if (msg.includes('speech') || msg.includes('audio') || msg.includes('recognition')) {
      errorType = 'speech';
    }

    return { hasError: true, error, errorType };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ActionableErrorBoundary caught an error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorType: 'unknown' });
    if (this.props.onReset) {
      this.props.onReset();
    } else if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private handleClearTempCache = () => {
    try {
      if (typeof window !== 'undefined') {
        // Clear transient sync/cache items safely without deleting affirmations or journal entries
        const keysToRemove = ['manifest_temp_', 'next_cache_', 'offline_queue_'];
        Object.keys(localStorage).forEach((key) => {
          if (keysToRemove.some((prefix) => key.startsWith(prefix))) {
            localStorage.removeItem(key);
          }
        });
      }
      this.handleRetry();
    } catch (_) {
      this.handleRetry();
    }
  };

  public render() {
    const isError = this.state.hasError || Boolean(this.props.simulatedError);
    if (isError) {
      const errorType = this.props.simulatedError || this.state.errorType;
      const error = this.state.error || (this.props.simulatedError ? new Error('QuotaExceededError: localStorage storage limit reached') : null);

      let title = 'Pequeño tropiezo en el santuario';
      let explanation =
        'Ocurrió una interrupción temporal al sincronizar o renderizar esta vista. Tus manifestaciones y diario siguen protegidos en este dispositivo.';
      let primaryAction = 'Reintentar sincronización';

      if (errorType === 'storage') {
        title = 'Memoria temporal colmada';
        explanation =
          'El almacenamiento local de tu navegador ha alcanzado su límite de cuota. Podemos limpiar la caché temporal sin tocar tus manifestaciones guardadas.';
        primaryAction = 'Limpiar caché temporal y reintentar';
      } else if (errorType === 'speech') {
        title = 'Micrófono en reposo';
        explanation =
          'El dictado por voz no pudo conectarse con el transcriptor en este instante. Puedes continuar escribiendo a mano libremente.';
        primaryAction = 'Continuar escribiendo a mano';
      }

      return (
        <div
          data-testid="actionable-error-state"
          className="my-6 mx-auto max-w-lg p-6 sm:p-7 rounded-3xl liquid-glass-surface bg-manifest-surfaceElevated border border-rose-500/30 shadow-lens text-manifest-ink space-y-4"
        >
          {/* Header & Icon */}
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-100/80 border border-rose-300/60 text-rose-700 flex items-center justify-center shrink-0 shadow-neu-sm">
              <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-base sm:text-lg font-bold text-manifest-ink">
                {title}
              </h3>
              <p className="text-xs text-manifest-inkMuted leading-relaxed">
                {explanation}
              </p>
            </div>
          </div>

          {/* Technical detail collapsible / subtle note */}
          {error?.message && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px] font-mono text-rose-800 truncate">
              Detalle: {error.message}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={this.handleClearTempCache}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-800 bg-rose-100/70 hover:bg-rose-100 border border-rose-300/60 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-neu-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar caché temporal</span>
            </button>

            <button
              type="button"
              onClick={this.handleRetry}
              className="px-4 py-2 rounded-xl primary-gradient-btn text-xs font-semibold shadow-sm active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{primaryAction}</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
