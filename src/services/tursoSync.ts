export interface SyncPayload {
  entity: 'journal' | 'goal' | 'step' | 'event' | 'sign' | 'story' | 'future' | 'release';
  action: 'save' | 'delete';
  data?: unknown;
  id?: string;
}

class TursoSyncService {
  private isSyncing = false;

  public async fetchRemoteData(): Promise<any | null> {
    try {
      const res = await fetch('/api/sync', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
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
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      return res.ok;
    } catch (e) {
      console.warn('[TursoSync] Failed to push change to remote:', e);
      return false;
    }
  }
}

export const tursoSync = new TursoSyncService();
