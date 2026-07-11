// Per-session "done" tracking, persisted to localStorage so it survives reloads.
// Storage access is fully guarded — a private-mode browser (or the node test env,
// which has no localStorage) degrades to in-memory only, never throws.

const KEY = 'algoharness:c-progress:v1';

function storage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    // access itself can throw under strict privacy settings
    return null;
  }
}

/** The set of completed exercise ids from storage (empty if none/unavailable). */
export function loadCompleted(): Set<string> {
  const s = storage();
  if (!s) return new Set();
  try {
    const raw = s.getItem(KEY);
    const arr: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

export function saveCompleted(done: Set<string>): void {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(KEY, JSON.stringify([...done]));
  } catch {
    // quota exceeded / privacy mode — best-effort only
  }
}

/** Pure: return a NEW set with `id` toggled (never mutates the input). */
export function toggleId(done: Set<string>, id: string): Set<string> {
  const next = new Set(done);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}
