import { describe, expect, it } from 'vitest';
import { BALANCE, GameState, addCredits, addData, buyHardwareClass, exactEconomyValue, hardwareCostScientific, newGame, researchDuration, queueResearchProject, startResearchProject, startTraining, trainingDataCost, type TrainingTrack } from './economy';
import { queueExperiment } from './experiments';
import { prestige } from './prestige';
import { advance, advanceTo, debugAdvance, settleResearchCompletions, simulationNow, type ResearchCompletionStep } from './simulation';
import { persistGame, loadGame, restore, serialize, StorageLike } from './storage';

class MemoryStorage implements StorageLike {
  value:string|null=null;
  getItem(){return this.value;}
  setItem(_key:string,value:string){this.value=value;}
  removeItem(){this.value=null;}
}

const prestigeReady=(now:number)=>addCredits(newGame(now),1_000_000_000_000_000);

function productiveTraining(reset:GameState,track:TrainingTrack){
  expect(reset.hardware).toBe(0);expect(reset.credits).toBe(50);
  const budget=exactEconomyValue(reset,'credits'),price=hardwareCostScientific('calculator',0,reset);
  const bought=buyHardwareClass(reset,'calculator',1);
  expect(bought.hardwareCounts.calculator).toBe(1);
  expect(exactEconomyValue(bought,'credits').compare(budget.subtract(price))).toBe(0);
  // Prepare only the training ingredient; production requires the paid hardware.
  const training=startTraining(addData(bought,trainingDataCost(bought,track)),track);
  expect(training.activeTraining?.track).toBe(track);
  return training;
}

function expectTenSeconds(training:GameState,result:ReturnType<typeof advanceTo>){
  expect(result.report.elapsedSeconds).toBe(10);expect(result.report.seconds).toBe(10);expect(result.report.lostSeconds).toBe(0);
  expect(result.state.savedAt-training.savedAt).toBe(10_000);
  expect(result.report.credits).toBeGreaterThan(0);
  expect(exactEconomyValue(result.state,'credits').compare(exactEconomyValue(training,'credits'))).toBe(1);
}

describe('simulation clock regressions',()=>{
  const researchReady=(now=0)=>({...newGame(now),credits:1_000_000,data:1_000_000,researchPoints:1_000_000});

  it('settles the first research exactly once and returns a save/render-ready state',()=>{
    const started=startResearchProject(researchReady(),'operations'),atEnd={...started,savedAt:started.researchLabs[0]!.endsAt},steps:ResearchCompletionStep[]=[];
    const done=settleResearchCompletions(atEnd,step=>steps.push(step));
    expect(steps).toEqual(['project-complete','reward-applied','unlock-applied','queue-checked','missions-achievements-ready','state-ready-for-save-render']);
    expect(done.researchLabs[0]).toBeNull();expect(done.completedResearch).toEqual(['operations']);expect(done.lifetime.researchCompleted).toBe(1);
    const again=advance(done,1,true).state;
    expect(again.completedResearch).toEqual(['operations']);expect(again.lifetime.researchCompleted).toBe(1);
    expect(again.telemetry.recentEvents.filter(event=>event.type==='research-complete')).toHaveLength(1);
  });

  it.each([true,false])('completes first research during %s simulation without a queue',(active:boolean)=>{
    const duration=researchDuration('operations'),started=startResearchProject(researchReady(),'operations'),done=advance(started,duration+1,active).state;
    expect(done.savedAt).toBe((duration+1)*1000);expect(done.researchLabs[0]).toBeNull();expect(done.completedResearch).toEqual(['operations']);expect(done.lifetime.researchCompleted).toBe(1);
  });

  it('starts one queued successor with positive remaining time and completes it once',()=>{
    let started=startResearchProject({...researchReady(),nodes:['labs2','labs3']},'operations');started=queueResearchProject(started,'blueprints');
    const first=advance(started,researchDuration('operations')+1).state;
    expect(first.completedResearch).toEqual(['operations']);expect(first.researchLabs[0]?.id).toBe('blueprints');expect(first.researchLabs[0]!.endsAt).toBeGreaterThan(first.savedAt);
    const done=advance(first,10_000).state;
    expect(done.completedResearch).toEqual(['operations','blueprints']);expect(done.lifetime.researchCompleted).toBe(2);expect(done.researchLabs.every(lab=>lab===null)).toBe(true);
  });

  it('reloads immediately before completion and persists the single reward',()=>{
    const storage=new MemoryStorage(),started=startResearchProject(researchReady(),'operations'),duration=researchDuration('operations'),near=advance(started,duration-.1).state;
    persistGame(storage,near,near.savedAt);const loaded=loadGame(storage,near.savedAt).state,done=advance(loaded,.2).state;
    expect(done.completedResearch).toEqual(['operations']);expect(done.lifetime.researchCompleted).toBe(1);expect(done.researchLabs[0]).toBeNull();
    persistGame(storage,done,done.savedAt);const reloaded=loadGame(storage,done.savedAt).state;
    expect(reloaded.completedResearch).toEqual(['operations']);expect(reloaded.lifetime.researchCompleted).toBe(1);
  });
  it('produces for ten seconds immediately after a normal prestige',()=>{
    const reset=prestige(prestigeReady(1_000));
    const training=productiveTraining(reset,'quality');
    const result=advanceTo(training,11_000),next=result.state;expectTenSeconds(training,result);
    expect(next.credits).toBeGreaterThan(training.credits);
    expect(next.training).toBeGreaterThan(training.training);
  });

  it('produces immediately after debug fast-forward and prestige',()=>{
    const jumped=debugAdvance(prestigeReady(1_000),3600,1_000).state;
    const reset=prestige(jumped);
    const training=productiveTraining(reset,'efficiency');
    const result=advanceTo(training,11_000),next=result.state;expectTenSeconds(training,result);
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
    const training=productiveTraining(loaded,'quality');
    const result=advanceTo(training,11_000),next=result.state;expectTenSeconds(training,result);
    expect(next.credits).toBeGreaterThan(training.credits);
    expect(next.training).toBeGreaterThan(training.training);
  });

  it('preserves experiment and boost remaining time across a jump',()=>{
    let state:GameState={...newGame(1_000),prestigeCount:1,discovered:['calculator','sbc'] as ('calculator'|'sbc')[],credits:1e9,data:1e9,trainingBoostUntil:3_601_000};
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
    const initial=buyHardwareClass(newGame(0),'calculator',1);
    const expected=advance(initial,10).state;
    const first=persistGame(storage,initial,5_000).state;
    const sameInstant=persistGame(storage,first,5_000).state;
    const loaded=loadGame(storage,5_000).state;
    const final=persistGame(storage,loaded,10_000).state;
    expect(sameInstant.credits).toBeCloseTo(first.credits);
    expect(final.credits).toBeCloseTo(expected.credits);
    expect(final.credits).toBeGreaterThan(initial.credits);
    expect(final.savedAt-initial.savedAt).toBe(10_000);
    expect(final.training).toBe(0);
  });

  it('advances time without inventing production when a reset has no hardware',()=>{
    const reset=prestige(prestigeReady(1_000)),result=advanceTo(reset,11_000);
    expect(result.state.savedAt-reset.savedAt).toBe(10_000);expect(result.report.seconds).toBe(10);
    expect(result.report.credits).toBe(0);expect(result.state.exactEconomy.credits).toEqual(reset.exactEconomy.credits);
  });

  it('credits only the offline capacity after a longer absence and does not replay lost time',()=>{
    const initial=buyHardwareClass(newGame(1_000),'calculator',1),cap=BALANCE.baseOfflineSeconds,wallNow=1_000+(cap+7200)*1000;
    const result=advanceTo(initial,wallNow,false,()=>.5),expected=advance(initial,cap,false,()=>.5);
    expect(result.report.elapsedSeconds).toBe(cap+7200);expect(result.report.seconds).toBe(cap);expect(result.report.lostSeconds).toBe(7200);
    expect(result.state.savedAt).toBe(wallNow);expect(result.report.credits).toBeGreaterThan(0);
    expect(result.state.exactEconomy).toEqual(expected.state.exactEconomy);
    const again=advanceTo(result.state,wallNow,false,()=>.5);
    expect(again.report.seconds).toBe(0);expect(again.report.credits).toBe(0);expect(again.state.exactEconomy).toEqual(result.state.exactEconomy);
  });

  it('repairs future-dated v2 saves without losing permanent state',()=>{
    const old={...newGame(3_601_000),gems:321,totalINTEarned:8,researchFragments:17,inventory:[{id:'kept',type:'quantum-chip' as const,rarity:'rare' as const,level:2,locked:true}]};
    const raw=JSON.stringify({version:2,state:Object.fromEntries(Object.entries(old).filter(([key])=>key!=='clockOffsetMs'))});
    const repaired=restore(raw,1_000);
    expect(repaired.migrated).toBe(true);
    expect(repaired.state.clockOffsetMs).toBe(3_600_000);
    expect(repaired.state.gems).toBe(321);
    expect(repaired.state.totalINTEarned).toBe(8);
    expect(repaired.state.researchFragments).toBe(17);
    expect(repaired.state.inventory[0].id).toBe('kept');
    expect(restore(serialize(repaired.state),1_000).state).toEqual(repaired.state);
  });
});

it('records each repeatable research completion phase once without duplicate reward',()=>{const started=startResearchProject({...newGame(0),credits:1e6,data:1e6,researchPoints:1e6,discovered:['calculator','sbc']},'dataGeneration'),atEnd={...started,savedAt:started.researchLabs[0]!.endsAt},steps:ResearchCompletionStep[]=[];const done=settleResearchCompletions(atEnd,step=>steps.push(step));expect(done.researchLevels.dataGeneration).toBe(1);expect(steps).toEqual(['project-complete','reward-applied','unlock-applied','queue-checked','missions-achievements-ready','state-ready-for-save-render']);expect(done.telemetry.diagnostics.researchCompletionPhases['state-ready-for-save-render']).toBe(1);const again=settleResearchCompletions(done);expect(again.researchLevels.dataGeneration).toBe(1);expect(again.telemetry.recentEvents.filter(event=>event.type==='research-complete')).toHaveLength(1)});
