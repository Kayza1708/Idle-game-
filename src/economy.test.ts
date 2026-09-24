import { describe, expect, it } from 'vitest';
import { BALANCE, GameState, buyHardware, computeAllocation, creditRate, dataRate, hardwareBulkCost, hardwareCost, newGame, researchRate, selectOperatingProfile, startTraining, trainingGoal, startResearchProject, buyResearchLab } from './economy';
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
  it('uses normalized profiles from the central configuration',()=>{
    for(const profile of Object.values(BALANCE.operatingProfiles))expect(profile.inference+profile.training+profile.research).toBeCloseTo(1,12);
    const balanced=newGame(0),training=selectOperatingProfile(balanced,'training');
    expect(computeAllocation(training).training).toBeGreaterThan(computeAllocation(balanced).training);
    expect(creditRate(training.hardware,training.level,training)).toBeLessThan(creditRate(balanced.hardware,balanced.level,balanced));
    expect(dataRate(balanced)).toBeGreaterThan(0);expect(researchRate(balanced)).toBeGreaterThan(0);
  });
  it('retains overflow across several training completions', () => {
    const ready = { ...newGame(0), credits: 1000, data: 1000, hardware: 25, hardwareCounts: { ...newGame(0).hardwareCounts, calculator: 25 } };
    const state = startTraining(ready, 'quality');
    const result = advance(state, 100);
    expect(result.report.levels).toBe(1);
    expect(result.state.activeTraining).toBeNull();
    expect(result.state.training).toBeGreaterThanOrEqual(0);
    expect(result.state.training).toBe(0);
  });
  it('accounts for level-dependent income identically when time is split', () => {
    const ready = { ...newGame(0), credits: 1000, data: 1000, hardware: 10, hardwareCounts: { ...newGame(0).hardwareCounts, calculator: 10 } };
    const state = startTraining(ready, 'efficiency');
    const whole = advance(state, 1000).state;
    const half = advance(advance(state, 500).state, 500).state;
    expect(half.level).toBe(whole.level);
    expect(half.training).toBeCloseTo(whole.training, 8);
    expect(half.credits).toBeCloseTo(whole.credits, 8);
  });
  it('clamps negative time and default offline time beyond eight hours', () => {
    const state = newGame(0);
    expect(advance(state, -5).state.credits).toBe(0);
    expect(advance(state, 1e9).state.credits).toBeCloseTo(advance(state, 28800).state.credits);
    expect(advance(state, 1).state.credits).toBeCloseTo(creditRate(1, 0, state));
    const futureDated = { ...state, savedAt: 5_000 };
    expect(advanceTo(futureDated, 1_000).state).toEqual(futureDated);
  });
});

describe('persistent research laboratories',()=>{
  it('charges once and completes from elapsed offline time',()=>{const base={...newGame(0),credits:10_000,data:1_000,researchPoints:100,discovered:['calculator','sbc'] as GameState['discovered']},started=startResearchProject(base,'operations');expect(started.credits).toBe(5_000);expect(started.data).toBe(750);expect(started.researchPoints).toBe(75);expect(started.researchLabs[0]?.endsAt).toBe(180_000);const done=advance(started,180).state;expect(done.completedResearch).toContain('operations');expect(done.researchLabs[0]).toBeNull();expect(done.credits).toBeGreaterThan(5_000)});
  it('cannot start or charge the same project twice',()=>{const base={...newGame(0),credits:10_000,data:1_000,researchPoints:100},once=startResearchProject(base,'operations');expect(startResearchProject(once,'operations')).toBe(once)});
  it('unlocks one optional lab without allowing negative gems',()=>{const poor={...newGame(0),gems:124},rich={...poor,gems:125};expect(buyResearchLab(poor)).toBe(poor);const bought=buyResearchLab(rich);expect(bought.gems).toBe(0);expect(bought.purchasedResearchLabs).toBe(1);expect(buyResearchLab(bought)).toBe(bought)});
});
