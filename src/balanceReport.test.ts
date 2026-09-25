import { describe, expect, it } from 'vitest';
import { createBalanceReport, serializeBalanceReport, createBalanceZip, createBalanceZipAsync } from './balanceReport';
import { addEvent } from './telemetry';
import { newGame, type GameState } from './economy';
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
 it('contains every documented local analysis file and no direct personal fields',async()=>{const {createBalanceExportFiles,createBalanceZip}=await import('./balanceReport');const files=createBalanceExportFiles(newGame(0),1000);expect(Object.keys(files).sort()).toEqual(['diagnostics.json','economy.json','events.csv','events.jsonl','manifest.json','milestones.csv','prestige.csv','purchases.csv','research.csv','sessions.csv','snapshots.csv','summary.json','timeline.csv','timeline.json','training.csv']);expect(createBalanceZip(newGame(0),1000).slice(0,2)).toEqual(new Uint8Array([80,75]));expect(JSON.stringify(files)).not.toMatch(/email|ipAddress|realName/i);});
});

it('writes ZIP central directory offsets and CRC-compatible stored entries',()=>{const zip=createBalanceZip(newGame(0),1000),view=new DataView(zip.buffer,zip.byteOffset,zip.byteLength),end=zip.length-22;expect(view.getUint32(0,true)).toBe(0x04034b50);expect(view.getUint32(end,true)).toBe(0x06054b50);const centralOffset=view.getUint32(end+16,true);expect(view.getUint32(centralOffset,true)).toBe(0x02014b50);expect(view.getUint16(end+8,true)).toBe(15);expect(view.getUint16(end+10,true)).toBe(15);});

it('exports immutable event resources, populated purchases, and 30-second snapshots',async()=>{const {buyHardwareClass}=await import('./economy'),{advance}=await import('./simulation'),{createBalanceExportFiles}=await import('./balanceReport');let state={...newGame(0),credits:1000};state=buyHardwareClass(state,'calculator',2);const purchase=state.telemetry.recentEvents.find(x=>x.type==='hardware-purchase')!;const eventCredits=purchase.resources.credits;state=advance(state,95,true).state;expect(purchase.resources.credits).toBe(eventCredits);expect(state.telemetry.snapshots.length).toBeGreaterThanOrEqual(3);const files=createBalanceExportFiles(state);expect(files['purchases.csv']).toContain('2');expect(files['purchases.csv']).not.toMatch(/"undefined"/);expect(files['snapshots.csv'].split('\r\n').length).toBeGreaterThanOrEqual(4);});


it('supports cancellation without mutating the state',async()=>{const state=newGame(123),before=JSON.stringify(state),controller=new AbortController();controller.abort();await expect(createBalanceZipAsync(state,456,controller.signal)).rejects.toMatchObject({name:'AbortError'});expect(JSON.stringify(state)).toBe(before)});

it('exports formulas, bounded-drop diagnostics and no AI name',async()=>{const {createBalanceExportFiles}=await import('./balanceReport');let state:GameState={...newGame(0),aiName:'PrivateName'};for(let i=0;i<520;i++)state=addEvent(state,'action-blocked',i,{action:'research-start',missingData:1});const files=createBalanceExportFiles(state,1000);expect(JSON.parse(files['economy.json']).formulas.repeatableResearchDuration).toContain('1.22');expect(JSON.parse(files['diagnostics.json']).droppedEvents).toBeGreaterThan(0);expect(JSON.stringify(files)).not.toContain('PrivateName')});
