import { describe, expect, it } from 'vitest';
import { BALANCE, GameState, buyHardware, computeAllocation, creditRate, dataRate, hardwareBulkCost, hardwareCost, newGame, researchRate, researchDuration, repeatableResearchDataCost, repeatableResearchDuration, selectOperatingProfile, startTraining, trainingGoal, startResearchProject, researchLabCount } from './economy';
import { advance, advanceTo } from './simulation';
import {restore,serialize} from './storage';

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
  it('cannot start or charge the same project twice, including after completion',()=>{const base={...newGame(0),credits:10_000,data:1_000,researchPoints:100},once=startResearchProject(base,'operations');expect(startResearchProject(once,'operations')).toBe(once);const done=advance(once,180).state;expect(startResearchProject(done,'operations')).toBe(done)});
  it('keeps the base lab available without paid slots',()=>{expect(researchLabCount(newGame(0))).toBe(1)});
});

describe('fixed research contracts',()=>{
  it('stores the configured duration at start and charges all data exactly once',()=>{const base={...newGame(0),credits:1e6,data:1e6,researchPoints:1e6},duration=researchDuration('operations'),started=startResearchProject(base,'operations');expect(started.researchLabs[0]).toMatchObject({startedAt:0,endsAt:duration*1000});expect(base.data-started.data).toBe(BALANCE.researchProjects.operations.data);expect(startResearchProject(started,'operations')).toBe(started)});
  it('refuses a start when one unit of data is missing',()=>{const project=BALANCE.researchProjects.operations,base={...newGame(0),credits:project.credits,data:project.data-1,researchPoints:project.points};expect(startResearchProject(base,'operations').telemetry.recentEvents.at(-1)?.type).toBe('action-blocked')});
});


describe('repeatable research progression',()=>{
 it('uses precise duration growth, deterministic data growth and the 72 hour cap',()=>{expect(repeatableResearchDuration('dataGeneration',1)).toBe(90);expect(repeatableResearchDuration('dataGeneration',5)).toBeCloseTo(90*1.22**4);expect(repeatableResearchDuration('dataGeneration',50)).toBe(72*3600);expect(repeatableResearchDataCost('dataGeneration',5)).toBe(Math.ceil(40*1.28**4))});
 it('charges once, survives reload and completes exactly one level offline',()=>{let s={...newGame(0),credits:1e6,data:1e6,discovered:['calculator','sbc'] as GameState['discovered']};s=startResearchProject(s,'dataGeneration');const lab=s.researchLabs[0]!;expect(lab.durationSeconds).toBe(90);expect(s.data).toBe(1e6-40);s=restore(serialize(advance(s,89).state),89_000).state;const done=advance(s,2,false).state;expect(done.researchLevels.dataGeneration).toBe(1);expect(done.telemetry.recentEvents.filter(e=>e.type==='research-complete')).toHaveLength(1)});
});

describe('A-H hardware acceptance contract',()=>{
 it('keeps exactly 15 hardware classes and the six required milestones on every class',()=>{
  expect(Object.keys(BALANCE.hardware)).toHaveLength(15);
  for(const hardware of Object.values(BALANCE.hardware))expect(hardware.milestones.map(m=>m.threshold)).toEqual([10,25,50,100,250,500]);
 });
});
