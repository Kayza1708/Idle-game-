import { describe, expect, it } from 'vitest';
import { newGame } from './economy';
import { restore, serialize } from './storage';

describe('save format', () => {
  it('round-trips a versioned game state', () => {
    const state = { ...newGame(123), credits: 42.25, level: 3, training: 17 };
    expect(restore(serialize(state), 999)).toEqual({ state });
  });
  it('rejects corrupt and incompatible saves without throwing', () => {
    expect(restore('{nope', 50).error).toMatch(/beschädigt/);
    expect(restore('{"version":99,"state":{}}', 50).error).toMatch(/anderen Version/);
  });
});
