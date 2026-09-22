import { GameState, newGame } from './economy';

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
