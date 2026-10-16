/** Historical v59 contracts. New production coverage uses the real newGame/restore.
 * These fixtures retain the old rules to protect the pre-migration reader. */
import { newGame as currentGame, type GameState } from "./economy";
import {
  restoreLegacySnapshot,
  loadGame as currentLoadGame,
  type StorageLike,
} from "./storage";
export function restore(
  raw: string | null,
  now = Date.now(),
): ReturnType<typeof restoreLegacySnapshot> {
  const result = restoreLegacySnapshot(raw, now);
  if (raw && !result.error && JSON.parse(raw).version === 59) {
    const { migrated, ...rest } = result;
    return rest;
  }
  return result;
}
export function importGame(raw: string) {
  if (typeof raw !== "string" || !raw.trim())
    throw new TypeError("Der Import enthält keinen Spielstand.");
  const result = restore(raw);
  if (result.error) throw new Error(result.error);
  return result.state;
}
export const loadGame = (storage: StorageLike | undefined, now = Date.now()) =>
  currentLoadGame(storage, now, restore);

export function newGame(
  now = Date.now(),
  campaignId = "unassigned",
): GameState {
  const s = currentGame(now, campaignId);
  delete (s as Partial<GameState>).progression;
  return s;
}
