export const BALANCE = {
  blockBaseCost: 25,
  blockGrowth: 1.18,
  computePerBlock: 10,
  tierSize: 25,
  creditPerCompute: 0.1,
  qualityGrowth: 1.08,
  efficiencyGrowth: 1.04,
  trainingPerCompute: 0.05,
  trainingBase: 300,
  trainingGrowth: 1.8,
  maxOfflineSeconds: 24 * 60 * 60,
} as const;

export type GameState = { credits: number; hardware: number; level: number; training: number; savedAt: number };
export const newGame = (now = Date.now()): GameState => ({ credits: 0, hardware: 1, level: 0, training: 0, savedAt: now });
export const blockCost = (owned: number) => BALANCE.blockBaseCost * BALANCE.blockGrowth ** owned;
export const bulkCost = (owned: number, count: number) => Array.from({ length: count }, (_, i) => blockCost(owned + i)).reduce((a, b) => a + b, 0);
export const computeRate = (hardware: number) => BALANCE.computePerBlock * hardware * 2 ** Math.floor(hardware / BALANCE.tierSize);
export const quality = (level: number) => BALANCE.qualityGrowth ** level;
export const efficiency = (level: number) => BALANCE.efficiencyGrowth ** level;
export const creditRate = (hardware: number, level: number) => computeRate(hardware) * BALANCE.creditPerCompute * quality(level) * efficiency(level);
export const trainingRate = (hardware: number) => computeRate(hardware) * BALANCE.trainingPerCompute;
export const trainingGoal = (level: number) => BALANCE.trainingBase * BALANCE.trainingGrowth ** level;

export function buyHardware(state: GameState, count = 1): GameState {
  const cost = bulkCost(state.hardware, count);
  return count > 0 && state.credits >= cost ? { ...state, credits: state.credits - cost, hardware: state.hardware + count } : state;
}

export function advance(state: GameState, seconds: number): { state: GameState; levels: number } {
  let left = Math.max(0, Math.min(seconds, BALANCE.maxOfflineSeconds));
  let next = { ...state };
  let levels = 0;
  const workRate = trainingRate(next.hardware);
  while (left > 0) {
    const need = Math.max(0, trainingGoal(next.level) - next.training);
    const toLevel = workRate > 0 ? need / workRate : Infinity;
    const slice = Math.min(left, toLevel);
    next.credits += creditRate(next.hardware, next.level) * slice;
    next.training += workRate * slice;
    left -= slice;
    if (toLevel <= slice) {
      next.training = Math.max(0, next.training - trainingGoal(next.level));
      next.level += 1;
      levels += 1;
    } else break;
  }
  return { state: next, levels };
}

/** Advances to a wall-clock instant and keeps state and timestamp in lockstep. */
export function advanceTo(state: GameState, now: number): { state: GameState; levels: number } {
  const result = advance(state, (now - state.savedAt) / 1000);
  result.state.savedAt = Math.max(state.savedAt, now);
  return result;
}
