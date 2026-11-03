/**
 * iOS WebKit Safe Web Audio Engine for AYA Rampage
 * Handles unlocked AudioContext, master gain, AnalyserNode for pastel reactive halo,
 * ambient sound generation (Silencio, 432Hz, Lluvia Astral), and voice playback.
 */

export type AmbienceType = 'none' | 'white_noise' | 'astral_rain';

export function getBestSpanishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const spanish = voices.filter((v) => v.lang.toLowerCase().startsWith('es'));
  if (spanish.length === 0) return null;

  // Prioritize enhanced natural Siri / neural voices on iOS / macOS
  const enhanced = spanish.find(
    (v) =>
      v.name.toLowerCase().includes('enhanced') ||
      v.name.toLowerCase().includes('natural') ||
      v.name.toLowerCase().includes('siri') ||
      v.name.toLowerCase().includes('premium') ||
      v.name.toLowerCase().includes('mónica') ||
      v.name.toLowerCase().includes('monica') ||
      v.name.toLowerCase().includes('jorge') ||
      v.name.toLowerCase().includes('paulina')
  );
  if (enhanced) return enhanced;

  const preferredLocale = spanish.find(
    (v) => v.lang === 'es-ES' || v.lang === 'es-US' || v.lang === 'es-MX'
  );
  return preferredLocale || spanish[0];
}

class AyaAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private warmFilter: BiquadFilterNode | null = null;

  // Ambience nodes
  private ambienceGain: GainNode | null = null;
  private ambienceOsc1: OscillatorNode | null = null;
  private ambienceOsc2: OscillatorNode | null = null;
  private ambienceSource: AudioBufferSourceNode | null = null;
  private currentAmbience: AmbienceType = 'none';

  // Voice playback nodes
  private voiceGain: GainNode | null = null;
  private voiceSource: AudioBufferSourceNode | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private isUnlocked: boolean = false;
  private isVoicePlaying: boolean = false;
  private isSpeechSynthesisPlaying: boolean = false;
  private animFrame: number | null = null;
  private currentEnergy: number = 0;

  public getAudioContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtxClass =
        (typeof window !== 'undefined' &&
          ((window as any).AudioContext || (window as any).webkitAudioContext)) ||
        null;

      if (!AudioCtxClass) {
        throw new Error('Web Audio API no soportado');
      }

      this.ctx = new AudioCtxClass();
      this.setupGraph();
    }
    return this.ctx!;
  }

  private setupGraph() {
    if (!this.ctx) return;

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

    // Warm Lowpass Filter (3400Hz) for soothing hypnotic vocal sound
    this.warmFilter = this.ctx.createBiquadFilter();
    this.warmFilter.type = 'lowpass';
    this.warmFilter.frequency.setValueAtTime(3400, this.ctx.currentTime);
    this.warmFilter.Q.setValueAtTime(0.7, this.ctx.currentTime);

    // Analyser Node for Reactive Pastel Waves (60fps)
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 64;
    this.analyser.smoothingTimeConstant = 0.8;

    // Voice Gain
    this.voiceGain = this.ctx.createGain();
    this.voiceGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

    // Ambience Gain
    this.ambienceGain = this.ctx.createGain();
    this.ambienceGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    // Graph routing:
    // voiceGain -> warmFilter -> analyser -> masterGain -> destination
    // ambienceGain -> masterGain -> destination
    this.voiceGain.connect(this.warmFilter);
    this.warmFilter.connect(this.analyser);
    this.analyser.connect(this.masterGain);
    this.ambienceGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    // Start energy tracking loop
    this.startEnergyMonitoring();
  }

  /**
   * Unlock AudioContext on iOS WebKit on direct user touch
   */
  public async unlock(): Promise<boolean> {
    try {
      const ctx = this.getAudioContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // iOS WebKit trick: play 0.01s silent buffer to permanently unlock
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);

      // Also unlock master <audio> element if in browser
      if (typeof window !== 'undefined' && !this.audioEl) {
        const audio = new Audio();
        audio.preload = 'auto';
        this.audioEl = audio;
      }

      this.isUnlocked = true;
      return true;
    } catch (e) {
      console.warn('[audioEngine] Could not unlock Web Audio:', e);
      return false;
    }
  }

  private startEnergyMonitoring() {
    if (this.animFrame || typeof window === 'undefined') return;

    const dataArray = new Uint8Array(32);
    const update = () => {
      if (this.analyser && this.isVoicePlaying) {
        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        // Focus on vocal presence frequencies (bins 2-16)
        for (let i = 2; i < 16; i++) {
          sum += dataArray[i];
        }
        const avg = sum / 14;
        const normalized = Math.min(1, Math.max(0, (avg - 10) / 120));
        // Smooth transition
        this.currentEnergy = this.currentEnergy * 0.7 + normalized * 0.3;
      } else {
        this.currentEnergy = this.currentEnergy * 0.8;
        if (this.currentEnergy < 0.01) this.currentEnergy = 0;
      }
      this.animFrame = requestAnimationFrame(update);
    };

    this.animFrame = requestAnimationFrame(update);
  }

  /**
   * Returns reactive vocal energy (0.0 to 1.0) for the pastel halo
   */
  public getReactiveEnergy(): number {
    return this.currentEnergy;
  }

  /**
   * Ambience sound generator: none | white_noise | astral_rain
   * Uses 10-second circular crossfaded noise buffers with lowpass filtering
   * to guarantee continuous, seamless, glitch-free background audio.
   */
  public setAmbience(type: AmbienceType) {
    if (this.currentAmbience === type) return;
    this.stopAmbience();
    this.currentAmbience = type;

    if (type === 'none') return;

    try {
      const ctx = this.getAudioContext();
      if (!this.ambienceGain) return;

      const now = ctx.currentTime;
      this.ambienceGain.gain.cancelScheduledValues(now);
      this.ambienceGain.gain.setValueAtTime(0, now);
      this.ambienceGain.gain.linearRampToValueAtTime(0.12, now + 1.2);

      if (type === 'white_noise') {
        // High quality soothing white/pink noise blanket (ideal for sleep/focus)
        const bufferDuration = 10;
        const bufferSize = ctx.sampleRate * bufferDuration;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.08;
        }

        // Circular boundary crossfade (2048 samples) to eliminate any loop seam click
        const fadeLen = 2048;
        for (let i = 0; i < fadeLen; i++) {
          const t = i / fadeLen;
          output[i] = output[i] * t + output[bufferSize - fadeLen + i] * (1 - t);
        }

        const source = ctx.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;

        // Warm lowpass filter (850Hz) for deep hypnotic comfort
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(850, now);
        filter.Q.setValueAtTime(0.5, now);

        source.connect(filter);
        filter.connect(this.ambienceGain);
        source.start();

        this.ambienceSource = source;
      } else if (type === 'astral_rain') {
        // Procedural gentle pink noise astral shower (10-second seamless loop)
        const bufferDuration = 10;
        const bufferSize = ctx.sampleRate * bufferDuration;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0,
          b1 = 0,
          b2 = 0,
          b3 = 0,
          b4 = 0,
          b5 = 0,
          b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.969 * b2 + white * 0.153852;
          b3 = 0.8665 * b3 + white * 0.3104856;
          b4 = 0.55 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.016898;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.045;
          b6 = white * 0.115926;
        }

        // Circular boundary crossfade (2048 samples)
        const fadeLen = 2048;
        for (let i = 0; i < fadeLen; i++) {
          const t = i / fadeLen;
          output[i] = output[i] * t + output[bufferSize - fadeLen + i] * (1 - t);
        }

        const rainSource = ctx.createBufferSource();
        rainSource.buffer = noiseBuffer;
        rainSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(950, now);
        filter.Q.setValueAtTime(1.2, now);

        rainSource.connect(filter);
        filter.connect(this.ambienceGain);
        rainSource.start();

        this.ambienceSource = rainSource;
      }
    } catch (e) {
      console.warn('[audioEngine] Error starting ambience:', e);
    }
  }

  public stopAmbience() {
    if (this.ctx && this.ambienceGain) {
      const now = this.ctx.currentTime;
      this.ambienceGain.gain.cancelScheduledValues(now);
      this.ambienceGain.gain.setValueAtTime(this.ambienceGain.gain.value, now);
      this.ambienceGain.gain.linearRampToValueAtTime(0, now + 0.3);
    }

    if (this.ambienceOsc1) {
      try {
        this.ambienceOsc1.stop();
        this.ambienceOsc1.disconnect();
      } catch (_) {}
      this.ambienceOsc1 = null;
    }
    if (this.ambienceOsc2) {
      try {
        this.ambienceOsc2.stop();
        this.ambienceOsc2.disconnect();
      } catch (_) {}
      this.ambienceOsc2 = null;
    }
    if (this.ambienceSource) {
      try {
        this.ambienceSource.stop();
        this.ambienceSource.disconnect();
      } catch (_) {}
      this.ambienceSource = null;
    }
    this.currentAmbience = 'none';
  }

  /**
   * Decode an ArrayBuffer into an AudioBuffer safely
   */
  public async decodeAudio(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
    const ctx = this.getAudioContext();
    return new Promise((resolve, reject) => {
      ctx.decodeAudioData(
        arrayBuffer.slice(0),
        (buf) => resolve(buf),
        (err) => reject(err)
      );
    });
  }

  /**
   * Play synthesized voice affirmation through Web Audio graph
   */
  public async playVoice(
    audioSource: AudioBuffer | string,
    onEnded?: () => void
  ): Promise<void> {
    this.stopVoice();

    try {
      const ctx = this.getAudioContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      let audioBuffer: AudioBuffer | null = null;

      if (typeof audioSource === 'string') {
        // Fetch and decode url
        const res = await fetch(audioSource);
        const arrayBuf = await res.arrayBuffer();
        audioBuffer = await this.decodeAudio(arrayBuf);
      } else {
        audioBuffer = audioSource;
      }

      if (!audioBuffer || !this.voiceGain) return;

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;

      // Reset voice gain
      const now = ctx.currentTime;
      this.voiceGain.gain.cancelScheduledValues(now);
      this.voiceGain.gain.setValueAtTime(1.0, now);

      source.connect(this.voiceGain);

      source.onended = () => {
        this.isVoicePlaying = false;
        if (onEnded) onEnded();
      };

      this.voiceSource = source;
      this.isVoicePlaying = true;
      source.start(0);
    } catch (e) {
      console.warn('[audioEngine] Error playing voice:', e);
      this.isVoicePlaying = false;
      // In case of error, still trigger onEnded to avoid freezing queue
      if (onEnded) onEnded();
    }
  }

  /**
   * Zero-Failure Local Speech Synthesis Engine (iOS WebKit / macOS / Android safe)
   * Pre-calibrated rate: 0.88 (pausado e hipnótico), custom pitch from vocal autocorrelation.
   */
  public speakVoice(
    text: string,
    options?: { pitch?: number; rate?: number },
    onEnded?: () => void
  ): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnded) onEnded();
      return false;
    }

    this.stopVoice();

    try {
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
      }
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      (window as any).__ayaCurrentUtterance = utterance;

      utterance.lang = 'es-ES';
      utterance.volume = 1.0;
      utterance.rate = options?.rate ?? 0.88;
      utterance.pitch = options?.pitch ?? 1.0;

      // Select highest quality Spanish voice
      const bestVoice = getBestSpanishVoice();
      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      this.isVoicePlaying = true;
      this.isSpeechSynthesisPlaying = true;

      // Simulate reactive audio energy pulses for wave bars while speech synthesis is active
      let speechTimer: any = null;
      let step = 0;
      speechTimer = setInterval(() => {
        if (!this.isSpeechSynthesisPlaying) {
          clearInterval(speechTimer);
          return;
        }
        step++;
        const pulse = 0.35 + 0.45 * Math.sin(step * 0.45) * Math.sin(step * 0.2);
        this.currentEnergy = Math.max(0.1, Math.min(0.9, pulse));
      }, 50);

      const finishPlayback = () => {
        if (speechTimer) clearInterval(speechTimer);
        this.isSpeechSynthesisPlaying = false;
        this.isVoicePlaying = false;
        this.currentEnergy = 0;
        if (onEnded) onEnded();
      };

      utterance.onend = () => {
        finishPlayback();
      };

      utterance.onerror = (e) => {
        console.warn('[audioEngine] SpeechSynthesis error:', e);
        finishPlayback();
      };

      // iOS WebKit fix: keep synthesis alive if utterance takes a few seconds
      const resumeInterval = setInterval(() => {
        if (!this.isSpeechSynthesisPlaying) {
          clearInterval(resumeInterval);
          return;
        }
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }, 1000);

      window.speechSynthesis.speak(utterance);
      return true;
    } catch (err) {
      console.warn('[audioEngine] Could not speak text:', err);
      this.isVoicePlaying = false;
      this.isSpeechSynthesisPlaying = false;
      if (onEnded) onEnded();
      return false;
    }
  }

  public stopVoice() {
    this.isSpeechSynthesisPlaying = false;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
    if (this.voiceSource) {
      try {
        this.voiceSource.stop();
        this.voiceSource.disconnect();
      } catch (_) {}
      this.voiceSource = null;
    }
    this.isVoicePlaying = false;
  }

  public isPlaying(): boolean {
    return this.isVoicePlaying;
  }

  /**
   * Fade out all audio (ambience + voice) gently within given ms
   */
  public async fadeAndStopAll(fadeDurationMs: number = 400): Promise<void> {
    if (!this.ctx || !this.masterGain) {
      this.stopVoice();
      this.stopAmbience();
      return;
    }

    try {
      const now = this.ctx.currentTime;
      const fadeSec = fadeDurationMs / 1000;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0.001, now + fadeSec);

      await new Promise((resolve) => setTimeout(resolve, fadeDurationMs));

      this.stopVoice();
      this.stopAmbience();

      // Reset master gain for future sessions
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    } catch (e) {
      this.stopVoice();
      this.stopAmbience();
    }
  }

  /**
   * Complete teardown and release of resources
   */
  public dispose() {
    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = null;
    }
    this.stopVoice();
    this.stopAmbience();

    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        this.ctx.close();
      } catch (_) {}
    }
    this.ctx = null;
    this.masterGain = null;
    this.analyser = null;
    this.voiceGain = null;
    this.ambienceGain = null;
    this.isUnlocked = false;
    this.currentEnergy = 0;
  }
}

// Global singleton instance for WebKit stability
export const audioEngine = new AyaAudioEngine();
