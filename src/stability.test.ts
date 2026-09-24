import {describe,expect,it} from 'vitest';
import {buyHardwareClass,newGame,startTraining,trainingRate,trainingWork,type GameState} from './economy';
import {advance} from './simulation';
import {BACKUP_KEY,loadGame,persistGame,SAVE_KEY,type StorageLike} from './storage';
import {createBalanceExportFiles,createBalanceZip} from './balanceReport';

class KeyStorage implements StorageLike { values=new Map<string,string>();getItem(k:string){return this.values.get(k)??null}setItem(k:string,v:string){this.values.set(k,v)}removeItem(k:string){this.values.delete(k)} }

describe('long-running core stability',()=>{
 it('runs the measured 475,346 second workload, reloads, recovers and exports within bounded telemetry',()=>{
  const memory=()=>((globalThis as any).process?.memoryUsage?.().heapUsed??0),storage=new KeyStorage();let state:GameState={...newGame(0,'stability-run'),credits:1e18,data:1e12,lifetimeEligibleCredits:1e12};
  const started=performance.now(),heapBefore=memory();
  for(let buy=0;buy<36;buy++)state=buyHardwareClass(state,'calculator',1);
  for(let run=0;run<34;run++){
   const track=run%2?'efficiency':'quality';state=startTraining(state,track);
   expect(state.activeTraining?.track).toBe(track);
   while(state.activeTraining)state=advance(state,30,run%3!==0).state;
   if(run%4===0){const saved=persistGame(storage,state,state.savedAt);expect(saved.saved).toBe(true);state=loadGame(storage,state.savedAt).state;}
  }
  state=advance(state,Math.max(0,475_346-state.savedAt/1000),false).state;
  expect(state.qualityLevel).toBe(17);expect(state.efficiencyLevel).toBe(17);
  expect(state.telemetry.snapshots.length).toBeGreaterThan(100);expect(state.telemetry.snapshots.length).toBeLessThanOrEqual(2_000);
  const saved=persistGame(storage,state,state.savedAt);expect(saved.saved).toBe(true);const valid=storage.getItem(SAVE_KEY)!;persistGame(storage,{...state,credits:state.credits+1},state.savedAt);expect(storage.getItem(BACKUP_KEY)).toBe(valid);
  storage.setItem(SAVE_KEY,'{interrupted');const recovered=loadGame(storage,state.savedAt);expect(recovered.error).toMatch(/Backup/);expect(recovered.state.credits).toBeCloseTo(state.credits);
  const files=createBalanceExportFiles(recovered.state,state.savedAt);expect(files['purchases.csv']).toContain('creditsBefore');expect(files['training.csv']).toContain('actualDuration');expect(createBalanceZip(recovered.state).length).toBeGreaterThan(1_000);
  expect(performance.now()-started).toBeLessThan(30_000);expect(memory()-heapBefore).toBeLessThan(150*1024*1024);
 });
 it('keeps high compute useful but bounded at early, middle and late levels',()=>{for(const level of [0,5,10,20]){const state={...newGame(0),level,qualityLevel:level,credits:1e20,data:1e20,hardwareCounts:{...newGame(0).hardwareCounts,calculator:500},hardware:500};const seconds=trainingWork(state,'quality')/trainingRate(state.hardware,state);expect(seconds).toBeGreaterThanOrEqual(trainingWork(state,'quality')/3-1e-9);expect(seconds).toBeGreaterThan(0);}});
});
