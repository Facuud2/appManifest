export interface SyncPayload {
  entity: 'journal' | 'goal' | 'step' | 'event' | 'sign' | 'story' | 'future' | 'release' | 'affirmation';
  action: 'save' | 'delete';
  data?: unknown;
  id?: string;
  timestamp?: number;
}

const SYNC_QUEUE_KEY = 'manifest_sync_queue';

class TursoSyncService {
  private isProcessingQueue = false;

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  public getQueue(): SyncPayload[] {
    if (!this.isBrowser()) return [];
    try {
      const raw = window.localStorage.getItem(SYNC_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveQueue(queue: SyncPayload[]): void {
    if (!this.isBrowser()) return;
    try {
      window.localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.warn('[TursoSync] Error saving queue:', e);
    }
  }

  public async processQueue(): Promise<void> {
    if (this.isProcessingQueue || !this.isBrowser()) return;
    const queue = this.getQueue();
    if (queue.length === 0) return;

    this.isProcessingQueue = true;
    const remaining: SyncPayload[] = [];

    for (const item of queue) {
      try {
        const res = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });

        if (!res.ok) {
          remaining.push(item);
        }
      } catch (e) {
        remaining.push(item);
      }
    }

    this.saveQueue(remaining);
    this.isProcessingQueue = false;
  }

  public async fetchRemoteData(): Promise<any | null> {
    try {
      // First, flush any pending deletions or changes to the DB
      await this.processQueue();

      // Bust cache using timestamp query param
      const res = await fetch(`/api/sync?t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        cache: 'no-store',
      });

      if (!res.ok) {
        console.warn('[TursoSync] Remote fetch failed with status:', res.status);
        return null;
      }

      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
      return null;
    } catch (e) {
      console.warn('[TursoSync] Network error fetching from Turso:', e);
      return null;
    }
  }

  public async pushChange(payload: SyncPayload): Promise<boolean> {
    const queueItem: SyncPayload = {
      ...payload,
      timestamp: Date.now(),
    };

    // Save to persistent queue first
    const queue = this.getQueue();
    queue.push(queueItem);
    this.saveQueue(queue);

    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Remove from queue upon verified success
        const currentQueue = this.getQueue();
        const updated = currentQueue.filter(
          (q) => !(q.id === payload.id && q.entity === payload.entity && q.action === payload.action)
        );
        this.saveQueue(updated);
        return true;
      }

      return false;
    } catch (e) {
      console.warn('[TursoSync] Failed to push change to remote immediately, kept in offline retry queue:', e);
      return false;
    }
  }
}

export const tursoSync = new TursoSyncService();
