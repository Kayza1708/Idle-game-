import { describe, expect, it } from 'vitest';
import { GameState, newGame, startTraining } from './economy';
import { queueExperiment } from './experiments';
import { prestige } from './prestige';
import { advance, advanceTo, debugAdvance, simulationNow } from './simulation';
import { persistGame, loadGame, restore, serialize, StorageLike } from './storage';

class MemoryStorage implements StorageLike {
  value:string|null=null;
  getItem(){return this.value;}
  setItem(_key:string,value:string){this.value=value;}
  removeItem(){this.value=null;}
}

const prestigeReady=(now:number)=>({...newGame(now),credits:13_000_000_000,runCreditsEarned:13_000_000_000,lifetimeCreditsEarned:13_000_000_000,lifetimeEligibleCredits:13_000_000_000,specialization:'assistant' as const});

describe('simulation clock regressions',()=>{
  it('produces for ten seconds immediately after a normal prestige',()=>{
    const reset=prestige(prestigeReady(1_000));
    const training=startTraining({...reset,credits:1000,data:1000},'quality');
    const next=advanceTo(training,11_000).state;
    expect(next.credits).toBeGreaterThan(training.credits);
    expect(next.training).toBeGreaterThan(training.training);
  });

  it('produces immediately after debug fast-forward and prestige',()=>{
    const jumped=debugAdvance(prestigeReady(1_000),3600,1_000).state;
    const reset=prestige(jumped);
    const training=startTraining({...reset,credits:1000,data:1000},'efficiency');
    const next=advanceTo(training,11_000).state;
    expect(next.credits).toBeGreaterThan(training.credits);
    expect(next.training).toBeGreaterThan(0);
    expect(next.savedAt).toBe(simulationNow(next,11_000));
  });

  it('keeps the debug timeline productive after save and reload',()=>{
    const storage=new MemoryStorage();
    const jumped=debugAdvance(prestigeReady(1_000),3600,1_000).state;
    const reset=prestige(jumped);
    expect(persistGame(storage,reset,1_000).saved).toBe(true);
    const loaded=loadGame(storage,1_000).state;
    const training=startTraining({...loaded,credits:1000,data:1000},'quality');
    const next=advanceTo(training,11_000).state;
    expect(next.credits).toBeGreaterThan(training.credits);
    expect(next.training).toBeGreaterThan(training.training);
  });

  it('preserves experiment and boost remaining time across a jump',()=>{
    let state:GameState={...newGame(1_000),prestigeCount:1,discovered:['calculator','sbc'] as ('calculator'|'sbc')[],trainingBoostUntil:3_601_000};
    state=queueExperiment(state,'hardware',1_000);
    const beforeExperiment=state.experiments.active!.endsAt-state.savedAt;
    const jumped=debugAdvance(state,600,1_000).state;
    expect(jumped.experiments.active!.endsAt-jumped.savedAt).toBeCloseTo(beforeExperiment-600_000);
    expect(jumped.trainingBoostUntil-jumped.savedAt).toBeCloseTo(3_000_000);
    const training=startTraining({...jumped,credits:1000,data:1000},'quality');expect(advanceTo(training,11_000).state.training).toBeGreaterThan(training.training);
  });

  it('does not mutate nested data in the input state',()=>{
    const state={...newGame(0),prestigeCount:1,automation:{enabled:true,reserve:0,elapsed:3,target:null},missions:{...newGame(0).missions,daily:{...newGame(0).missions.daily,training:2},weekly:{...newGame(0).missions.weekly,training:4}}};
    const snapshot=structuredClone(state);
    advance(state,100);
    expect(state).toEqual(snapshot);
  });

  it('autosave-style synchronization neither duplicates nor loses progress',()=>{
    const storage=new MemoryStorage();
    const initial=newGame(0);
    const first=persistGame(storage,initial,5_000).state;
    const sameInstant=persistGame(storage,first,5_000).state;
    const loaded=loadGame(storage,5_000).state;
    const final=persistGame(storage,loaded,10_000).state;
    expect(sameInstant.credits).toBeCloseTo(first.credits);
    expect(final.credits).toBeCloseTo(10.125);
    expect(final.training).toBe(0);
  });

  it('repairs future-dated v2 saves without losing permanent state',()=>{
    const old={...newGame(3_601_000),gems:321,totalInsightEarned:8,researchFragments:17,inventory:[{id:'kept',type:'quantum-chip' as const,rarity:'rare' as const,level:2,locked:true}]};
    const raw=JSON.stringify({version:2,state:Object.fromEntries(Object.entries(old).filter(([key])=>key!=='clockOffsetMs'))});
    const repaired=restore(raw,1_000);
    expect(repaired.migrated).toBe(true);
    expect(repaired.state.clockOffsetMs).toBe(3_600_000);
    expect(repaired.state.gems).toBe(321);
    expect(repaired.state.totalInsightEarned).toBe(8);
    expect(repaired.state.researchFragments).toBe(17);
    expect(repaired.state.inventory[0].id).toBe('kept');
    expect(restore(serialize(repaired.state),1_000).state).toEqual(repaired.state);
  });
});
