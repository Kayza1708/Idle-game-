import {describe,expect,it} from 'vitest';
import {BALANCE,GameState,newGame,startResearchProject} from './economy';
import {analysisAffordability,analysisBlockReason,cancelExperiment,completeExperiment,queueExperiment} from './experiments';
import {advance} from './simulation';
import {restore,serialize} from './storage';

const playable=(now=0):GameState=>({...newGame(now),discovered:['calculator','sbc'],credits:100_000,data:10_000,researchPoints:1_000});

describe('transactional component analyses',()=>{
 it.each(['short','long'] as const)('starts and completes a %s hardware analysis from a realistic save',length=>{
  const base=restore(serialize(playable())).state,cost=BALANCE.analysisCosts.hardware[length];
  const started=queueExperiment(base,'hardware',base.savedAt,length);
  expect(started.experiments.active?.length).toBe(length);
  expect(started.credits).toBeCloseTo(base.credits-cost.credits,6);
  expect(started.data).toBeCloseTo(base.data-cost.data,6);
  const done=advance(started,(started.experiments.active!.endsAt-started.savedAt)/1000,false,()=>1).state;
  expect(done.experiments.active).toBeNull();expect(done.components).toBeGreaterThan(0);
  expect(completeExperiment(done,done.savedAt,()=>0).components).toBe(done.components);
 });
 it('uses an analysis slot independently from an occupied research lab',()=>{
  const researching=startResearchProject(playable(),'dataGeneration');
  const analyzing=queueExperiment(researching,'architecture',researching.savedAt,'short');
  expect(researching.researchLabs.some(Boolean)).toBe(true);expect(analyzing.experiments.active?.type).toBe('architecture');
 });
 it('reports exact shortages, rejects double starts, and cancels without refund',()=>{
  const poor={...playable(),credits:1,data:2},cost=BALANCE.analysisCosts.artifact.short;
  expect(analysisBlockReason(poor,'artifact','short')).toBe(`${cost.credits-1} Credits fehlen.`);
  const started=queueExperiment(playable(),'hardware',0,'short'),again=queueExperiment(started,'artifact',0,'long');
  expect(again.experiments.active?.id).toBe(started.experiments.active?.id);expect(again.credits).toBe(started.credits);
  const cancelled=cancelExperiment(started);expect(cancelled.experiments.active).toBeNull();expect(cancelled.credits).toBe(started.credits);
 });
 it('recovers a completed-id save that formerly left the analysis slot stuck',()=>{
  const active=queueExperiment(playable(),'hardware',0,'short').experiments.active!;
  const stuck={...playable(),savedAt:active.endsAt,experiments:{...playable().experiments,active,completedIds:[active.id]}};
  const repaired=advance(stuck,1).state;
  expect(repaired.experiments.active).toBeNull();
  expect(queueExperiment(repaired,'hardware',repaired.savedAt,'short').experiments.active).not.toBeNull();
 });
});

it('persists an active analysis across reload and rewards it exactly once offline',()=>{const base=playable(),started=queueExperiment(base,'hardware',0,'short'),restored=restore(serialize(started)).state,end=restored.experiments.active!.endsAt;const done=advance(restored,(end-restored.savedAt)/1000,false,()=>1).state;const components=done.components;expect(done.experiments.active).toBeNull();expect(done.experiments.completedIds).toContain(started.experiments.active!.id);expect(completeExperiment(done,done.savedAt,()=>0).components).toBe(components)});

it('reports affordability including data ETA and grants rare component from Analyse III',()=>{
 const poor={...playable(),data:0},quote=analysisAffordability(poor,'artifact','short');
 expect(quote.missing.data).toBe(BALANCE.analysisCosts.artifact.short.data);expect(quote.secondsToData).toBeGreaterThan(0);
 const started=queueExperiment({...playable(),credits:1e12,data:1e12,nodes:['analysis1','analysis2','analysis3']},'artifact',0,'short'),done=completeExperiment(started,started.experiments.active!.endsAt,()=>1);
 expect(done.componentInventory.quantumCores).toBeGreaterThanOrEqual(1);
});

describe('analysis drop disclosure',()=>{
 it('reports normalized component chances and sources',async()=>{
  const {analysisDropTable}=await import('./experiments'),s=newGame(0),table=analysisDropTable(s,'hardware');
  expect(table.reduce((n,row)=>n+row.chance,0)).toBeCloseTo(1);
  expect(table.find(row=>row.id==='photonicLenses')?.chance).toBeGreaterThan(0);
  expect(table.every(row=>row.source.length>0)).toBe(true);
 });
});

describe('registered rare guarantee',()=>{
 it('recognizes every centrally rare component and never guarantees a quantum core',async()=>{const {guaranteeRare}=await import('./experiments'),{BALANCE}=await import('./economy');for(const [id,definition] of Object.entries(BALANCE.components)){if(['häufig','ungewöhnlich'].includes(definition.rarity))continue;const found:any={[id]:1};guaranteeRare(found);expect(found).toEqual({[id]:1})}const empty:any={};guaranteeRare(empty);expect(empty).toEqual({graphene:1});expect(empty.quantumCores).toBeUndefined()});
});

it('keeps deterministic online/offline result details and does not rebook them on reload or render',()=>{const base=playable(),onlineStarted=queueExperiment(base,'hardware',0,'short'),offlineStarted=queueExperiment(base,'hardware',0,'short'),end=onlineStarted.experiments.active!.endsAt,online=completeExperiment(onlineStarted,end,()=>.25,'active'),offline=completeExperiment(offlineStarted,end,()=>.25,'offline');expect(offline.experiments.lastResult?.components).toEqual(online.experiments.lastResult?.components);expect(offline.experiments.lastResult?.blueprintFragments).toBe(online.experiments.lastResult?.blueprintFragments);const restored=restore(serialize(offline),end).state,before=restored.componentInventory;expect(restored.experiments.lastResult).toEqual(offline.experiments.lastResult);expect(restored.componentInventory).toEqual(before);expect(completeExperiment(restored,end,()=>.25,'offline')).toBe(restored)});
it('repeat start uses normal resource and occupied-slot checks',()=>{const base=playable(),started=queueExperiment(base,'hardware',0,'short'),end=started.experiments.active!.endsAt,done=completeExperiment(started,end,()=>.2),poor={...done,credits:0,data:0},blocked=queueExperiment(poor,done.experiments.lastResult!.type,end,done.experiments.lastResult!.length);expect(blocked.experiments.active).toBeNull();expect(blocked.experiments.lastResult).toEqual(done.experiments.lastResult);expect(queueExperiment(started,'hardware',1,'short').experiments.active?.id).toBe(started.experiments.active?.id)});

it('offline report contains only component and analysis gains from that interval',()=>{const seeded={...playable(),componentInventory:{...playable().componentInventory,circuits:99},components:99},started=queueExperiment(seeded,'hardware',0,'short'),seconds=started.experiments.active!.endsAt/1000,{state,report}=advance(started,seconds,false,()=>.1);expect(report.analysisResults).toHaveLength(1);expect(report.components).toEqual(report.analysisResults[0].components);expect(report.components.circuits).not.toBe(state.componentInventory.circuits);expect(report.analysisResults[0].mode).toBe('offline')});
