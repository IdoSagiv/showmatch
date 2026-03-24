import type { GameHistoryEntry } from '@/types/game';

const STORAGE_KEY = 'showmatch-history';

export function saveGameToHistory(entry: GameHistoryEntry): void {
  try {
    const history = getGameHistory();
    history.unshift(entry);
    // Keep last 50 games
    const trimmed = history.slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {}
}

export function getGameHistory(): GameHistoryEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function deleteGameFromHistory(id: string): void {
  try {
    const history = getGameHistory().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {}
}

export function clearGameHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
