import {emptyChallengeMetrics} from './challengeStages';
import {describe,it,expect} from 'vitest';
import {normalResetV2,axiomResetV2} from './progressionReset';
import {BALANCE,newGame,startTraining,trainingRate,type GameState,type TrainingTrack} from './economy';
import {newItemSystemV3,completeItemTrainingV3,resetItemProductionV3} from './itemSystemV3';
import {createItem,equip} from './inventory';
import {advanceTo} from './simulation';
import {buyGemOffer} from './gemShop';
import {ScientificNumber as S} from './scientificNumber';

/** Explicit funded fixture; actual start, payment, time and completion paths. */
function prepared(){let s:GameState={...newGame(1000,'prepared-v3-learning'),itemSystemV3:newItemSystemV3(),qualityLevel:1,nodes:['T04'],gems:1000,credits:1e12,data:1e12};s={...s,exactEconomy:{...s.exactEconomy,credits:S.from(1e12).toJSON(),data:S.from(1e12).toJSON()}};s=createItem(s,'logic-seed','common');return equip(s,s.inventory[0].id);}
function finish(s:GameState,track:TrainingTrack,active=false){const started=startTraining(s,track);expect(started.activeTraining).not.toBeNull();const seconds=started.activeTraining!.workRequired/trainingRate(started.hardware,started)+.01;return advanceTo(started,started.savedAt+seconds*1000,active,()=>.5).state;}
describe('V3 learning series from actual paid completion events',()=>{
 it('assigns IDs after successful payment and settles each completed job once',()=>{
  const s=prepared(),started=startTraining(s,'quality');expect(started.activeTraining!.jobId).toBe('v3-training-1');expect(started.itemSystemV3!.nextTrainingSequence).toBe(2);expect(started.telemetry.recentEvents.filter(e=>e.type==='training-start').at(-1)?.jobId).toBe('v3-training-1');
  expect(completeItemTrainingV3(started,'regular')).toBe(started);
  const ready={...started,training:started.activeTraining!.workRequired},settled=completeItemTrainingV3(ready,'regular');
  expect(settled.itemSystemV3!.learningStreak).toBe(1);expect(settled.itemSystemV3!.lastCompletedTrainingSequence).toBe(1);expect(completeItemTrainingV3(settled,'regular')).toBe(settled);
  const poor={...s,credits:0,exactEconomy:{...s.exactEconomy,credits:S.zero().toJSON()}};expect(startTraining(poor,'quality')).toBe(poor);expect(poor.itemSystemV3!.nextTrainingSequence).toBe(1);
 });
 it('updates actual work speed, caps alternation at ten and floors a repeated track',()=>{
  let s=prepared();for(let i=0;i<12;i++)s=finish(s,i%2?'efficiency':'quality');expect(s.itemSystemV3!.learningStreak).toBe(10);
  const ratio=trainingRate(s.hardware,s)/trainingRate(s.hardware,{...s,itemSystemV3:{...s.itemSystemV3!,learningStreak:0}});expect(ratio).toBeCloseTo(2,12);
  s=finish(s,'efficiency');expect(s.itemSystemV3!.learningStreak).toBe(5);expect(s.itemSystemV3!.lastLearningTrack).toBe('efficiency');
 });
 it('retains the series on unequip and ignores integration and no-items completions',()=>{
  let s=finish(prepared(),'quality');const itemId=s.inventory[0].id;s=finish({...s,equipped:{}},'efficiency');expect(s.itemSystemV3!.learningStreak).toBe(1);expect(s.itemSystemV3!.lastLearningTrack).toBe('quality');
  s=equip(s,itemId);s=finish(s,'integration');expect(s.itemSystemV3!.learningStreak).toBe(1);expect(s.itemSystemV3!.lastLearningTrack).toBe('quality');
  s=finish(s,'efficiency');expect(s.itemSystemV3!.learningStreak).toBe(2);
  const forbidden=finish({...s,retention:{...s.retention,activeRun:{id:'no-items',stage:1,catalogVersion:2,metrics:emptyChallengeMetrics(),runId:'prepared-no-items',startedAt:s.savedAt,eligibleAtStart:s.exactEconomy.lifetimeEligibleCredits,loadout:s.inventory}}},'quality');expect(forbidden.itemSystemV3!.learningStreak).toBe(2);
 });
 it('excludes intro and Gem-shop bonus finishes, even if the item is equipped',()=>{
  const initial=prepared(),intro=finish({...initial,qualityLevel:0,story:{...initial.story,tutorial:'active',target:'training'}},'quality');expect(intro.itemSystemV3!.learningStreak).toBe(0);expect(intro.itemSystemV3!.lastCompletedTrainingSequence).toBe(1);expect(intro.itemSystemV3!.lastTrainingCompletionCause).toBe('intro');
  const started=startTraining(prepared(),'quality'),bonus=buyGemOffer(started,'training-15m');expect(bonus.activeTraining).toBeNull();expect(bonus.itemSystemV3!.learningStreak).toBe(0);expect(bonus.itemSystemV3!.lastCompletedTrainingSequence).toBe(1);expect(bonus.itemSystemV3!.lastTrainingCompletionCause).toBe('bonus');expect(bonus.telemetry.recentEvents.filter(e=>e.type==='training-complete').at(-1)?.jobId).toBe('v3-training-1');
  expect(completeItemTrainingV3(bonus,'regular')).toBe(bonus);
 });
 it('rejects unknown or unissued IDs and never invents a legacy completion bonus',()=>{
  const started=startTraining(prepared(),'quality');for(const id of [undefined,'old-contract','v3-training-01','v3-training-2','v3-training-9007199254740992']){const candidate={...started,training:started.activeTraining!.workRequired,activeTraining:{...started.activeTraining!,jobId:id}};expect(completeItemTrainingV3(candidate,'regular')).toBe(candidate);}
 });
 it('uses the same online/offline completion and preserves monotonic IDs across resets',()=>{
  const a=finish(prepared(),'quality',true),b=finish(prepared(),'quality',false);expect(a.itemSystemV3).toEqual(b.itemSystemV3);
  const repeated=advanceTo(a,a.savedAt,true,()=>.5).state;expect(repeated.itemSystemV3).toEqual(a.itemSystemV3);
  for(const kind of ['prestige','axiom'] as const){const reset=resetItemProductionV3(a,kind);expect(reset.itemSystemV3!.learningStreak).toBe(0);expect(reset.itemSystemV3!.nextTrainingSequence).toBe(2);expect(startTraining(reset,'efficiency').activeTraining!.jobId).toBe('v3-training-2');}
 });
 it('keeps receipt IDs through actual prestige and axiom transactions',()=>{
  const complete=finish(prepared(),'quality'),normal=normalResetV2({...complete,progression:{...complete.progression,entitlement:S.from(100).toJSON()}});
  expect(normal.prestigeCount).toBe(1);expect(normal.itemSystemV3!.nextTrainingSequence).toBe(2);expect(normal.itemSystemV3!.lastCompletedTrainingSequence).toBe(1);expect(normal.itemSystemV3!.learningStreak).toBe(0);
  const cycle=S.fromString('1e12').toJSON(),axiom=axiomResetV2({...complete,cycleINTEarned:1e12,totalINTEarned:1e12,unspentINT:1e12,exactEconomy:{...complete.exactEconomy,cycleINTEarned:cycle,totalINTEarned:cycle,unspentINT:cycle},progression:{...complete.progression,known:Object.keys(BALANCE.progression.nodes).slice(0,30),entitlement:cycle},itemSystemV3:{...complete.itemSystemV3!,axiomDiscovered:true,axiomDiscoveryAt:1000}});
  expect(axiom.axiomResetCount).toBe(1);expect(axiom.itemSystemV3!.nextTrainingSequence).toBe(2);expect(axiom.itemSystemV3!.lastCompletedTrainingSequence).toBe(1);expect(axiom.itemSystemV3!.learningStreak).toBe(0);expect(axiom.inventory).toEqual(complete.inventory);
 });

});
