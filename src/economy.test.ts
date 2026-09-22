import { describe, expect, it } from 'vitest';
import { advance, blockCost, bulkCost, buyHardware, creditRate, newGame, trainingGoal } from './economy';

describe('economy', () => {
  it('uses the unrounded exponential next-block cost and exact bulk sum', () => {
    expect(blockCost(1)).toBeCloseTo(29.5, 12);
    expect(bulkCost(1, 3)).toBeCloseTo(blockCost(1) + blockCost(2) + blockCost(3), 12);
  });
  it('does not buy with insufficient credits', () => {
    const state = newGame(0);
    expect(buyHardware(state)).toBe(state);
  });
  it('retains overflow across several training completions', () => {
    const state = { ...newGame(0), hardware: 25 };
    const result = advance(state, 100);
    expect(result.levels).toBeGreaterThan(1);
    expect(result.state.training).toBeGreaterThanOrEqual(0);
    expect(result.state.training).toBeLessThan(trainingGoal(result.state.level));
  });
  it('accounts for level-dependent income identically when time is split', () => {
    const state = { ...newGame(0), hardware: 10 };
    const whole = advance(state, 1000).state;
    const half = advance(advance(state, 500).state, 500).state;
    expect(half.level).toBe(whole.level);
    expect(half.training).toBeCloseTo(whole.training, 8);
    expect(half.credits).toBeCloseTo(whole.credits, 8);
  });
  it('clamps negative time and offline time beyond 24 hours', () => {
    const state = newGame(0);
    expect(advance(state, -5).state.credits).toBe(0);
    expect(advance(state, 1e9).state.credits).toBeCloseTo(advance(state, 86400).state.credits);
    expect(advance(state, 1).state.credits).toBeCloseTo(creditRate(1, 0));
  });
});
