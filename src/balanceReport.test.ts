import { describe, expect, it } from 'vitest';
import { createBalanceReport, serializeBalanceReport } from './balanceReport';
import { addEvent } from './telemetry';
import { newGame } from './economy';
import { prestige } from './prestige';
import { restore } from './storage';

describe('local balance report',()=>{
  it('preserves finite large idle numbers',()=>{
    const state={...newGame(100),credits:1e300,lifetimeCreditsEarned:9.87654321e250};
    const json=serializeBalanceReport(state,1_000),report=JSON.parse(json);
    expect(report.currentState.resources.credits).toBe(1e300);
    expect(json).toContain('1e+300');
  });

  it('keeps snapshots for multiple completed runs',()=>{
    let state={...newGame(1_000),savedAt:11_000,credits:13e9,runCreditsEarned:13e9,lifetimeCreditsEarned:13e9,lifetimeEligibleCredits:13e9};
    state=prestige(state);
    state={...state,savedAt:31_000,credits:40e9,runCreditsEarned:27e9,lifetimeCreditsEarned:40e9,lifetimeEligibleCredits:40e9};
    state=prestige(state);
    const report=createBalanceReport(state,41_000);
    expect(report.prestigeHistory).toHaveLength(2);
    expect(report.prestigeHistory.map(run=>run.run)).toEqual([0,1]);
    expect(report.prestigeHistory[0].before.credits).toBe(13e9);
    expect(report.currentRun.number).toBe(3);
  });

  it('marks history missing from an old save as unavailable',()=>{
    const old=newGame(1000) as any;delete old.telemetry;
    const migrated=restore(JSON.stringify({version:7,state:old}),2_000).state;
    const report=createBalanceReport(migrated,3_000);
    expect(report.campaign.durationSeconds).toBeNull();
    expect(report.currentRun.durationSeconds).toBeNull();
    expect(report.unavailable).toContain('events before telemetry');
  });

  it('replaces invalid numeric values and never emits non-JSON numbers',()=>{
    const state={...newGame(0),credits:Number.POSITIVE_INFINITY,data:Number.NaN};
    const json=serializeBalanceReport(state,100),report=JSON.parse(json);
    expect(report.currentState.resources.credits).toBeNull();
    expect(report.currentState.resources.data).toBeNull();
    expect(json).not.toMatch(/NaN|Infinity/);
  });


  it('explains research stock and summarizes decision events',()=>{let state=newGame(0);state={...state,researchPoints:80};state=addEvent(state,'research-start',10,{researchPointCost:20});state=addEvent(state,'training-start',20,{track:'quality'});const report=createBalanceReport(state,100);expect(report.currentState.diagnostics.researchPoints).toMatchObject({current:80,spentOnProjects:20});expect(report.currentState.diagnostics.eventCounts).toMatchObject({researchStarts:1,trainingStarts:1})});

  it('does not mutate the game state while exporting',()=>{
    const state=newGame(123),before=JSON.stringify(state);
    createBalanceReport(state,456);
    expect(JSON.stringify(state)).toBe(before);
  });
});

describe('analysis archive',()=>{
 it('contains every documented local analysis file and no direct personal fields',async()=>{const {createBalanceExportFiles,createBalanceZip}=await import('./balanceReport');const files=createBalanceExportFiles(newGame(0),1000);expect(Object.keys(files).sort()).toEqual(['diagnostics.json','milestones.csv','prestige.csv','purchases.csv','research.csv','sessions.csv','snapshots.csv','summary.json','timeline.csv','timeline.json','training.csv']);expect(createBalanceZip(newGame(0),1000).slice(0,2)).toEqual(new Uint8Array([80,75]));expect(JSON.stringify(files)).not.toMatch(/email|ipAddress|realName/i);});
});
