/**
 * Lightweight session persistence via sessionStorage.
 * Survives page refresh within the same tab; cleared when the tab closes.
 * Used to attempt socket rejoin after a refresh mid-game.
 */

const KEY = 'showmatch-session';

export interface SessionData {
  code: string;
  displayName: string;
}

export function saveSession(data: SessionData): void {
  try { sessionStorage.setItem(KEY, JSON.stringify(data)); } catch {}
}

export function loadSession(): SessionData | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SessionData) : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try { sessionStorage.removeItem(KEY); } catch {}
}
