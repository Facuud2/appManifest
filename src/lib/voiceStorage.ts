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
 * Save master audio blob and update profile metadata
 */
export async function saveMasterVoiceSample(
  blob: Blob,
  metadata?: Partial<VoiceProfileMeta>
): Promise<VoiceProfileMeta> {
  const existingMeta = getVoiceProfileMeta();
  const voiceProfileId = existingMeta?.voiceProfileId || `voice_aya_${Date.now()}`;

  const meta: VoiceProfileMeta = {
    voiceProfileId,
    recordedAt: new Date().toISOString(),
    durationSeconds: metadata?.durationSeconds || 6,
    detectedTone: metadata?.detectedTone || 'calma, firme, íntima',
    sampleName: metadata?.sampleName || 'Muestra Maestra AYA',
    blobSize: blob.size,
    mimeType: blob.type || 'audio/webm',
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
