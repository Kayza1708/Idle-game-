import { advanceTo, GameState, newGame } from './economy';

export const SAVE_KEY = 'ai-singularity.save';
export const SAVE_VERSION = 1;
type Envelope = { version: number; state: GameState };
const valid = (s: GameState) => [s.credits, s.hardware, s.level, s.training, s.savedAt].every(Number.isFinite) && s.credits >= 0 && s.hardware >= 1 && s.level >= 0 && s.training >= 0;

export function serialize(state: GameState) { return JSON.stringify({ version: SAVE_VERSION, state } satisfies Envelope); }
export function restore(raw: string | null, now = Date.now()): { state: GameState; error?: string } {
  if (!raw) return { state: newGame(now) };
  try {
    const data = JSON.parse(raw) as Envelope;
    if (data.version !== SAVE_VERSION) return { state: newGame(now), error: 'Der Spielstand stammt aus einer anderen Version und wurde sicher aufbewahrt.' };
    if (!data.state || !valid(data.state)) throw new Error('invalid');
    return { state: data.state };
  } catch {
    return { state: newGame(now), error: 'Der lokale Spielstand ist beschädigt. Er wurde nicht überschrieben.' };
  }
}

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export type LoadResult = { state: GameState; error?: string; writable: boolean };

export function browserStorage(): StorageLike | undefined {
  try { return window.localStorage; }
  catch { return undefined; }
}

export function loadGame(storage: StorageLike | undefined, now = Date.now()): LoadResult {
  try {
    if (!storage) throw new Error('unavailable');
    const result = restore(storage.getItem(SAVE_KEY), now);
    return { ...result, writable: !result.error };
  } catch {
    return { state: newGame(now), error: 'Der lokale Speicher konnte nicht gelesen werden. Dein Fortschritt wird nicht überschrieben.', writable: false };
  }
}

export function persistGame(storage: StorageLike | undefined, state: GameState, now = Date.now()): { state: GameState; saved: boolean; error?: string } {
  const synchronized = advanceTo(state, now).state;
  try {
    if (!storage) throw new Error('unavailable');
    storage.setItem(SAVE_KEY, serialize(synchronized));
    return { state: synchronized, saved: true };
  } catch {
    return { state: synchronized, saved: false, error: 'Speichern ist in diesem Browser gerade nicht möglich. Das Spiel läuft weiter, aber dieser Fortschritt ist noch nicht gesichert.' };
  }
}

export function removeGame(storage: StorageLike | undefined): string | undefined {
  try { if (!storage) throw new Error('unavailable'); storage.removeItem(SAVE_KEY); }
  catch { return 'Der lokale Spielstand konnte nicht gelöscht werden.'; }
}
