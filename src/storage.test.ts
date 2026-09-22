import { describe, expect, it } from 'vitest';
import { newGame } from './economy';
import { loadGame, persistGame, restore, serialize, StorageLike } from './storage';

class MemoryStorage implements StorageLike {
  value: string | null = null;
  getItem() { return this.value; }
  setItem(_key: string, value: string) { this.value = value; }
  removeItem() { this.value = null; }
}

describe('save format', () => {
  it('round-trips a versioned game state', () => {
    const state = { ...newGame(123), credits: 42.25, level: 3, training: 17 };
    expect(restore(serialize(state), 999)).toEqual({ state });
  });
  it('rejects corrupt and incompatible saves without throwing', () => {
    expect(restore('{nope', 50).error).toMatch(/beschädigt/);
    expect(restore('{"version":99,"state":{}}', 50).error).toMatch(/anderen Version/);
  });

  it('does not lose or duplicate time across background, save, close and reload', () => {
    const storage = new MemoryStorage();
    const started = newGame(0);
    const saved = persistGame(storage, started, 30_000);
    expect(saved.saved).toBe(true);
    expect(saved.state.credits).toBeCloseTo(30);
    expect(saved.state.savedAt).toBe(30_000);

    const loaded = loadGame(storage, 50_000);
    const resumed = persistGame(storage, loaded.state, 50_000);
    expect(resumed.state.credits).toBeCloseTo(50);
    expect(resumed.state.savedAt).toBe(50_000);
  });

  it('turns localStorage read and write failures into visible error results', () => {
    const readFailure: StorageLike = { getItem: () => { throw new Error('blocked'); }, setItem: () => {}, removeItem: () => {} };
    expect(loadGame(readFailure, 10).error).toMatch(/nicht gelesen/);
    expect(loadGame(readFailure, 10).writable).toBe(false);

    const writeFailure: StorageLike = { getItem: () => null, setItem: () => { throw new Error('full'); }, removeItem: () => {} };
    const result = persistGame(writeFailure, newGame(0), 1_000);
    expect(result.saved).toBe(false);
    expect(result.error).toMatch(/nicht möglich/);
  });
});
