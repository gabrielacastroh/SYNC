const STORAGE_KEY = 'sync-app-state';

export interface PersistedState {
  boards: Record<string, unknown>;
  columns: Record<string, unknown>;
  cards: Record<string, unknown>;
  activity: Record<string, unknown>;
  activeBoardId?: string | null;
  version: number;
}

export function loadFromStorage(): Partial<PersistedState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

export function saveToStorage(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}
