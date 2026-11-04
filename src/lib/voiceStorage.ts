/**
 * Voice Storage Service for AYA Method Persistent Cloned Voice
 * Stores reference voice audio sample in IndexedDB ('aya_master_voice_sample')
 * and profile metadata in localStorage ('aya_voice_profile').
 */

export interface VoiceProfileMeta {
  voiceProfileId: string;
  recordedAt: string;
  durationSeconds: number;
  detectedTone: string;
  sampleName?: string;
  blobSize?: number;
  mimeType?: string;
  detectedPitch?: number; // 0.75 - 1.25 for SpeechSynthesisUtterance.pitch
  fundamentalFrequency?: number; // e.g. 150 Hz
  matchedVoice?: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Aoede' | string;
  stylePrompt?: string;
}

const DB_NAME = 'aya_voice_db';
const DB_VERSION = 1;
const STORE_NAME = 'voice_samples';
const SAMPLE_KEY = 'aya_master_voice_sample';
const LOCALSTORAGE_KEY = 'manifest_aya_voice_profile';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function openDatabase(): Promise<IDBDatabase | null> {
  if (!isBrowser() || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (err) => {
        console.warn('[voiceStorage] Error opening IndexedDB:', err);
        resolve(null);
      };
    } catch (e) {
      console.warn('[voiceStorage] IndexedDB unsupported or blocked:', e);
      resolve(null);
    }
  });
}

/**
 * Detect fundamental frequency (F0) and pitch multiplier using autocorrelation.
 */
export function detectPitchFromAudioBuffer(audioBuffer: AudioBuffer): {
  f0: number;
  pitchRate: number;
} {
  try {
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const windowSize = Math.min(channelData.length, 4096);
    if (windowSize < 512) return { f0: 160, pitchRate: 1.0 };

    let bestOffset = 0;
    let maxRms = 0;
    const step = 256;
    for (let offset = 0; offset + windowSize < channelData.length; offset += step) {
      let sum = 0;
      for (let i = 0; i < windowSize; i += 4) {
        sum += channelData[offset + i] * channelData[offset + i];
      }
      const rms = Math.sqrt(sum / (windowSize / 4));
      if (rms > maxRms) {
        maxRms = rms;
        bestOffset = offset;
      }
    }

    const minPeriod = Math.floor(sampleRate / 300);
    const maxPeriod = Math.floor(sampleRate / 70);

    let bestLag = -1;
    let bestCorr = 0;

    for (let lag = minPeriod; lag <= maxPeriod; lag++) {
      let corr = 0;
      let norm1 = 0;
      let norm2 = 0;
      for (let i = 0; i < windowSize - lag; i += 2) {
        const x1 = channelData[bestOffset + i];
        const x2 = channelData[bestOffset + i + lag];
        corr += x1 * x2;
        norm1 += x1 * x1;
        norm2 += x2 * x2;
      }
      const norm = Math.sqrt(norm1 * norm2);
      if (norm > 0.0001) {
        const r = corr / norm;
        if (r > bestCorr) {
          bestCorr = r;
          bestLag = lag;
        }
      }
    }

    if (bestLag > 0 && bestCorr > 0.3) {
      const f0 = Math.round(sampleRate / bestLag);
      const pitchRate = Math.max(0.78, Math.min(1.22, 0.85 + ((f0 - 90) / 160) * 0.3));
      return { f0, pitchRate: Number(pitchRate.toFixed(2)) };
    }
  } catch (err) {
    console.warn('[pitchDetector] Autocorrelation error:', err);
  }
  return { f0: 160, pitchRate: 1.0 };
}

export async function analyzeAudioBlobPitch(blob: Blob): Promise<{ f0: number; pitchRate: number }> {
  try {
    if (typeof window === 'undefined') return { f0: 160, pitchRate: 1.0 };
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtxClass || blob.size < 500) return { f0: 160, pitchRate: 1.0 };
    const ctx = new AudioCtxClass();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    const result = detectPitchFromAudioBuffer(audioBuffer);
    if (ctx.state !== 'closed') {
      try {
        ctx.close();
      } catch (_) {}
    }
    return result;
  } catch (err) {
    console.warn('[analyzeAudioBlobPitch] Error:', err);
    return { f0: 160, pitchRate: 1.0 };
  }
}

/**
 * Save master audio blob and update profile metadata
 */
export async function saveMasterVoiceSample(
  blob: Blob,
  metadata?: Partial<VoiceProfileMeta>
): Promise<VoiceProfileMeta> {
  const existingMeta = getVoiceProfileMeta();
  const voiceProfileId = existingMeta?.voiceProfileId || `voice_aya_${Date.now()}`;

  let pitchInfo = { f0: 160, pitchRate: 1.0 };
  if (!metadata?.detectedPitch && blob.size > 800) {
    try {
      pitchInfo = await analyzeAudioBlobPitch(blob);
    } catch (_) {}
  }

  const f0 = metadata?.fundamentalFrequency ?? pitchInfo.f0;
  let defaultMatchedVoice = 'Charon';
  if (f0 < 125) defaultMatchedVoice = 'Fenrir';
  else if (f0 < 165) defaultMatchedVoice = 'Charon';
  else if (f0 < 210) defaultMatchedVoice = 'Kore';
  else defaultMatchedVoice = 'Aoede';

  const meta: VoiceProfileMeta = {
    voiceProfileId,
    recordedAt: new Date().toISOString(),
    durationSeconds: metadata?.durationSeconds || 6,
    detectedTone: metadata?.detectedTone || 'calma, firme, íntima',
    sampleName: metadata?.sampleName || 'Muestra Maestra AYA',
    blobSize: blob.size,
    mimeType: blob.type || 'audio/webm',
    detectedPitch: metadata?.detectedPitch ?? pitchInfo.pitchRate,
    fundamentalFrequency: f0,
    matchedVoice: metadata?.matchedVoice || defaultMatchedVoice,
    ...metadata,
  };

  // 1. Save Blob in IndexedDB
  try {
    const db = await openDatabase();
    if (db) {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(blob, SAMPLE_KEY);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
      db.close();
    }
  } catch (err) {
    console.warn('[voiceStorage] Could not write sample to IndexedDB:', err);
  }

  // 2. Save metadata in localStorage for instant synchronous availability
  if (isBrowser()) {
    try {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(meta));
    } catch (_) {}
  }

  return meta;
}

/**
 * Retrieve master audio blob and metadata
 */
export async function getMasterVoiceSample(): Promise<{
  blob: Blob;
  meta: VoiceProfileMeta;
} | null> {
  const meta = getVoiceProfileMeta();
  if (!meta) return null;

  try {
    const db = await openDatabase();
    if (!db) {
      // Fallback: Return empty audio blob if IDB not accessible but meta exists
      const dummyBlob = new Blob([], { type: meta.mimeType || 'audio/webm' });
      return { blob: dummyBlob, meta };
    }

    const blob = await new Promise<Blob | null>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(SAMPLE_KEY);
      req.onsuccess = () => resolve((req.result as Blob) || null);
      req.onerror = () => resolve(null);
    });

    db.close();

    if (!blob) {
      return { blob: new Blob([], { type: meta.mimeType || 'audio/webm' }), meta };
    }

    return { blob, meta };
  } catch (err) {
    console.warn('[voiceStorage] Error reading IndexedDB sample:', err);
    return null;
  }
}

/**
 * Get profile metadata from localStorage (synchronous)
 */
export function getVoiceProfileMeta(): VoiceProfileMeta | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(LOCALSTORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VoiceProfileMeta;
  } catch (_) {
    return null;
  }
}

/**
 * Check if a valid voice profile is registered
 */
export function hasMasterVoiceProfile(): boolean {
  const meta = getVoiceProfileMeta();
  return Boolean(meta && meta.voiceProfileId);
}

/**
 * Delete master voice sample and profile metadata
 */
export async function deleteMasterVoiceProfile(): Promise<void> {
  if (isBrowser()) {
    try {
      localStorage.removeItem(LOCALSTORAGE_KEY);
    } catch (_) {}
  }

  try {
    const db = await openDatabase();
    if (db) {
      await new Promise<void>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(SAMPLE_KEY);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      });
      db.close();
    }
  } catch (err) {
    console.warn('[voiceStorage] Error deleting sample from IndexedDB:', err);
  }
}

/**
 * Save user voice recording for a specific affirmation
 */
export async function saveAffirmationVoiceAudio(
  affirmationId: string,
  blob: Blob
): Promise<void> {
  if (!isBrowser() || !affirmationId || blob.size < 200) return;
  try {
    const db = await openDatabase();
    if (!db) return;
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, `aff_voice_${affirmationId}`);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    db.close();
  } catch (err) {
    console.warn('[voiceStorage] Error saving affirmation voice audio:', err);
  }
}

/**
 * Retrieve user voice recording for a specific affirmation
 */
export async function getAffirmationVoiceAudio(
  affirmationId: string
): Promise<Blob | null> {
  if (!isBrowser() || !affirmationId) return null;
  try {
    const db = await openDatabase();
    if (!db) return null;
    const blob = await new Promise<Blob | null>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(`aff_voice_${affirmationId}`);
      req.onsuccess = () => resolve((req.result as Blob) || null);
      req.onerror = () => resolve(null);
    });
    db.close();
    return blob;
  } catch (err) {
    console.warn('[voiceStorage] Error getting affirmation voice audio:', err);
    return null;
  }
}

/**
 * Check if a user voice recording exists for a specific affirmation
 */
export async function hasAffirmationVoiceAudio(
  affirmationId: string
): Promise<boolean> {
  const blob = await getAffirmationVoiceAudio(affirmationId);
  return Boolean(blob && blob.size > 200);
}

/**
 * Delete voice recording for a specific affirmation
 */
export async function deleteAffirmationVoiceAudio(
  affirmationId: string
): Promise<void> {
  if (!isBrowser() || !affirmationId) return;
  try {
    const db = await openDatabase();
    if (!db) return;
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(`aff_voice_${affirmationId}`);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
    db.close();
  } catch (err) {
    console.warn('[voiceStorage] Error deleting affirmation voice audio:', err);
  }
}

