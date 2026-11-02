/**
 * iOS WebKit Safe Web Audio Engine for AYA Rampage
 * Handles unlocked AudioContext, master gain, AnalyserNode for pastel reactive halo,
 * ambient sound generation (Silencio, 432Hz, Lluvia Astral), and voice playback.
 */

export type AmbienceType = 'none' | '432hz' | 'astral_rain';

class AyaAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;

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
    // voiceGain -> analyser -> masterGain -> destination
    // ambienceGain -> masterGain -> destination
    this.voiceGain.connect(this.analyser);
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
   * Ambience sound generator: none | 432hz | astral_rain
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
      this.ambienceGain.gain.linearRampToValueAtTime(0.15, now + 1.2);

      if (type === '432hz') {
        // Binaural healing frequency: 432Hz and 432.8Hz with warm lowpass filter
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, now);

        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(432, now);

        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(432.8, now);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(this.ambienceGain);

        osc1.start();
        osc2.start();

        this.ambienceOsc1 = osc1;
        this.ambienceOsc2 = osc2;
      } else if (type === 'astral_rain') {
        // Procedural gentle pink noise astral shower
        const bufferSize = ctx.sampleRate * 3;
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
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
          b6 = white * 0.115926;
        }

        const rainSource = ctx.createBufferSource();
        rainSource.buffer = noiseBuffer;
        rainSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, now);
        filter.Q.setValueAtTime(1.5, now);

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

  public stopVoice() {
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
