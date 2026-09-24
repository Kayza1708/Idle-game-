import { describe, expect, it } from 'vitest';
import { buyHardware, creditRate, hardwareBulkCost, hardwareCost, newGame, startTraining, trainingGoal } from './economy';
import { advance, advanceTo } from './simulation';

describe('economy', () => {
  it('uses the calculator balance and exact geometric bulk sum', () => {
    expect(hardwareCost('calculator', 1)).toBeCloseTo(11.5, 12);
    expect(hardwareBulkCost('calculator', 1, 3)).toBeCloseTo(hardwareCost('calculator', 1) + hardwareCost('calculator', 2) + hardwareCost('calculator', 3), 12);
  });
  it('does not buy with insufficient credits', () => {
    const state = newGame(0);
    expect(buyHardware(state)).toBe(state);
  });
  it('retains overflow across several training completions', () => {
    const ready = { ...newGame(0), credits: 1000, hardware: 25, hardwareCounts: { ...newGame(0).hardwareCounts, calculator: 25 } };
    const state = startTraining(ready, 'quality');
    const result = advance(state, 100);
    expect(result.report.levels).toBe(1);
    expect(result.state.activeTraining).toBeNull();
    expect(result.state.training).toBeGreaterThanOrEqual(0);
    expect(result.state.training).toBe(0);
  });
  it('accounts for level-dependent income identically when time is split', () => {
    const ready = { ...newGame(0), credits: 1000, hardware: 10, hardwareCounts: { ...newGame(0).hardwareCounts, calculator: 10 } };
    const state = startTraining(ready, 'efficiency');
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
    const futureDated = { ...state, savedAt: 5_000 };
    expect(advanceTo(futureDated, 1_000).state).toEqual(futureDated);
  });
});
