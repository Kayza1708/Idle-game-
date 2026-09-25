import {describe,expect,it} from 'vitest';
import {BALANCE,GameState,newGame,startResearchProject} from './economy';
import {analysisBlockReason,cancelExperiment,completeExperiment,queueExperiment} from './experiments';
import {advance} from './simulation';
import {restore,serialize} from './storage';

const playable=(now=0):GameState=>({...newGame(now),discovered:['calculator','sbc'],credits:100_000,data:10_000,researchPoints:1_000});

describe('transactional component analyses',()=>{
 it.each(['short','long'] as const)('starts and completes a %s hardware analysis from a realistic save',length=>{
  const base=restore(serialize(playable())).state,cost=BALANCE.analysisCosts.hardware[length];
  const started=queueExperiment(base,'hardware',base.savedAt,length);
  expect(started.experiments.active?.length).toBe(length);
  expect(started.credits).toBe(base.credits-cost.credits);
  expect(started.data).toBe(base.data-cost.data);
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
