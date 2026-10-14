import {Research} from './Panels';
import {researchPreview} from './economy';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {ChallengeStagePicker} from './ChallengeStagePicker';
import {ChallengeRunPanel} from './ChallengeRunPanel';
import {describe,it,expect} from 'vitest';
import {BALANCE,newGame,hardwareIds,repeatableResearchIds,addCredits,addData,grantComponents,startResearchProject,trainingDurationSeconds,creditRateScientific,offlineTimeLimit,classComputeTerms,type GameState} from './economy';
import {createItem,equip,fuseItems,fusionPreview} from './inventory';
import {amplifyAnalysisMaterials,queueExperiment,completeExperiment} from './experiments';
import {salvageQuote} from './recovery';
import {serialize,restore} from './storage';
import {startRunChallenge,abortRunChallenge} from './retention';
import {challengeCatalogQuote,challengeTargetDefinitions,challengeAutomationUnlocks,challengeStartQuote,challengeEntryQuote,challengeCompletionQuote} from './challengeStages';
import {ScientificNumber} from './scientificNumber';
import {settleResearchCompletions,advance} from './simulation';
// Access fixtures are explicit. They do not establish natural unlock timings.
const account=():GameState=>({...newGame(0),prestigeCount:1,lifetime:{...newGame(0).lifetime,hardwareClasses:[...hardwareIds]},completedResearch:['blueprints','distributedInference'],researchAccessIds:[...repeatableResearchIds],nodes:['shoppingAgent'],hardwareAutoBuyers:{calculator:true},challengeStages:Object.fromEntries(Object.keys(BALANCE.challengeCatalog.families).map(id=>[id,68]))});
const reload=(s:GameState)=>{const result=restore(serialize(s),s.savedAt);expect(result.error).toBeUndefined();return result.state;};
describe('review corrections with persisted paid contracts',()=>{
 it('keeps the highest-level fusion base, level, Forge, tap counters and exact combined recovery budget',()=>{
  let s=newGame(0);for(let n=0;n<3;n++)s=createItem(s,'impulse-relay','common');
  s={...s,inventory:s.inventory.map((i,n)=>({...i,level:n+2,forge:n+4,relayTaps:n+10,materialBasis:{circuits:20+n},recoveryUsed:{circuits:1}}))};
  const ids=[s.inventory[1].id,s.inventory[0].id,s.inventory[2].id],before=structuredClone(s),preview=fusionPreview(s,ids),out=fuseItems(s,ids);
  expect(s).toEqual(before);expect(preview.result).toMatchObject({id:ids[2],level:4,forge:6});expect(out.nextId).toBe(s.nextId);
  expect(out.inventory).toHaveLength(1);expect(out.inventory[0]).toMatchObject({id:ids[2],rarity:'uncommon',level:4,forge:6,relayTaps:12,materialBasis:{circuits:63},recoveryUsed:{circuits:3}});
  expect(reload(out).inventory).toEqual(out.inventory);const q=salvageQuote(out,ids[2]);expect(q.returned.circuits!+q.remainders.circuits+3).toBeCloseTo(63*.6);
 });
 it('accumulates ten isolated rare finds with a ten-percent bonus through reload',()=>{
  let s=newGame(0),total=0;const factors={base:1,semiconductor:1,photonic:1,frontier:1,quantum:1.1};
  for(let n=0;n<10;n++){const q=amplifyAnalysisMaterials(s,{quantumCores:1},1,factors);total+=q.components.quantumCores!;s=reload({...s,materials:{...s.materials,analysisRemainders:q.remainders}});}
  expect(total).toBe(11);expect(s.materials.analysisRemainders.quantumCores).toBeCloseTo(0);expect(s.materials.analysisRemainders.circuits).toBe(0);
 });
 it('applies fractional yield once through an actual analysis completion and preserves old job payout policy',()=>{
  const fresh={...addData(newGame(0),10000),discovered:['calculator','sbc'] as GameState['discovered']};
  let started=queueExperiment(fresh,'hardware',0,'short');const job=started.experiments.active!;
  started={...started,experiments:{...started.experiments,active:{...job,materialContract:{...job.materialContract!,weights:[{id:'quantumCores',weight:1,chance:1}],familyFactors:{base:1,semiconductor:1,photonic:1,frontier:1,quantum:1.6}}}}};
  const done=completeExperiment(reload(started),job.endsAt,()=>.5);expect(done.componentInventory.quantumCores).toBe(1);expect(done.materials.analysisRemainders.quantumCores).toBeCloseTo(.6);
  expect(completeExperiment(reload(done),job.endsAt,()=>.5)).toEqual(done);
  const old=structuredClone(started);delete old.experiments.active!.materialContract!.fractionalYield;
  const oldDone=completeExperiment(old,job.endsAt,()=>.5);expect(oldDone.materials.analysisRemainders.quantumCores).toBe(0);
 });
 it('rejects malformed current fractional ledgers instead of silently repairing them',()=>{
  const s=newGame(0);for(const value of [-.1,1,NaN]){const raw=JSON.parse(serialize(s));raw.state.materials.analysisRemainders.quantumCores=value;expect(restore(JSON.stringify(raw),0).error).toBeTruthy();}
 });
 it('migrates v47 main and nested challenge without changing v1 targets or pending analysis snapshots',()=>{
  let run=startRunChallenge(account(),'quality-lock',30);run={...run,retention:{...run.retention,activeRun:{...run.retention.activeRun!,catalogVersion:1}}};
  const raw=JSON.parse(serialize(run));raw.version=47;delete raw.state.materials.analysisRemainders;delete raw.state.challengeSession.main.materials.analysisRemainders;
  const migrated=restore(JSON.stringify(raw),0);expect(migrated.error).toBeUndefined();expect(migrated.state.retention.activeRun!.catalogVersion).toBe(1);
  expect(challengeCompletionQuote(migrated.state).catalog!.quality).toBe(30);expect(migrated.state.materials.analysisRemainders.quantumCores).toBe(0);
  expect(abortRunChallenge(migrated.state).challengeStages).toEqual(account().challengeStages);
 });
 it('caps new quality/efficiency time prerequisites while preserving old contracts',()=>{
  for(const id of ['quality-lock','efficiency-lock'] as const){const latest=challengeCatalogQuote(id,69)!,old=challengeCatalogQuote(id,69,1)!;expect(latest.quality).toBe(9);expect(old.quality).toBe(69);
   const duration=Array.from({length:latest.quality},(_,n)=>trainingDurationSeconds(n+1)).reduce((a,b)=>a+b,0);expect(duration).toBeLessThan(3600);
  }
 });
 it('gives all 69 science and supply stages distinct real targets',()=>{
  for(const id of ['serial-science','closed-supply-chain'] as const){const targets=Array.from({length:69},(_,n)=>challengeTargetDefinitions(challengeCatalogQuote(id,n+1)!).map(t=>`${t.id}:${t.target.toScientificString()}`).join('|'));expect(new Set(targets).size).toBe(69);}
 });
 it('requires actual account progress and enough research areas without spending anything',()=>{
  const fresh=newGame(0);expect(challengeStartQuote(fresh,'no-items').reason).toBe('prestige');const post={...fresh,prestigeCount:1,discovered:['sbc'] as GameState['discovered']};expect(challengeStartQuote(post,'no-items').reason).toBe('hardware');
  expect(challengeEntryQuote(account(),'serial-science',69).reason).toBeNull();const blocked={...account(),researchAccessIds:[],nodes:[]};expect(challengeEntryQuote(blocked,'serial-science',11).reason).toBeNull();expect(challengeEntryQuote(blocked,'serial-science',21).reason).toBe('research-areas');
  expect(fresh.credits).toBe(50);
 });
 it('selects a late network edge, freezes the selection on reload and rejects over-budget selections',()=>{
  const main=account(),run=startRunChallenge(main,'fragmented-network',69,[],['campus']);expect(run.retention.activeRun?.networkLinks).toEqual(['campus']);
  const counts={...run.hardwareCounts,farm:25,campus:1,calculator:25,sbc:1},s={...run,hardwareCounts:counts,hardware:52};
  expect(classComputeTerms(s,'campus').linkedCompute).toBeGreaterThan(0);expect(classComputeTerms(s,'sbc').linkedCompute).toBe(0);
  expect(reload(s).retention.activeRun!.networkLinks).toEqual(['campus']);expect(startRunChallenge(main,'fragmented-network',69,[],['campus','sbc'])).toBe(main);
  const legacy={...s,retention:{...s.retention,activeRun:{...s.retention.activeRun!,catalogVersion:1 as const}}};expect(classComputeTerms(legacy,'campus').linkedCompute).toBe(0);expect(classComputeTerms(legacy,'sbc').linkedCompute).toBeGreaterThan(0);
 });
 it('requires alternating research in new science chapters and counts only paid completed research',()=>{
  let s=addData(startRunChallenge(account(),'serial-science',11),100000);s=startResearchProject(s,'dataGeneration');expect(s.researchLabs[0]).not.toBeNull();expect(s.retention.activeRun!.metrics!.researchDataSpent!.m).toBe(0);
  s=settleResearchCompletions({...s,savedAt:s.researchLabs[0]!.endsAt});expect(ScientificNumber.fromJSON(s.retention.activeRun!.metrics!.researchDataSpent!).toNumber()).toBe(363);
  expect(researchPreview(s,'dataGeneration')?.reason).toBe('challenge-rule');
  for(const language of ['de','en'] as const){const html=renderToStaticMarkup(createElement(Research,{s:{...s,settings:{...s.settings,language}},act:()=>{}}));expect(html).toContain(language==='de'?'Challenge: Forschungsbereich wechseln.':'Challenge: switch research area.');expect(html).toMatch(/id="research-dataGeneration" class="research-card locked"/);}
  expect(startResearchProject(s,'dataGeneration')).toBe(s);expect(startResearchProject(s,'modelArchitecture')).not.toBe(s);
 });
 it.each(['de','en'] as const)('renders stage prerequisites, selectable network and active v2 objectives in %s',language=>{
  const s={...account(),settings:{...account().settings,language}},html=renderToStaticMarkup(createElement(ChallengeStagePicker,{s,id:'fragmented-network',act:()=>{}}));
  expect(html).toContain(language==='de'?'Aktive Verbindungen':'Active connections');expect(html).toContain(BALANCE.hardware.cloud.name);
  const run=startRunChallenge(s,'fragmented-network',69,[],['campus']),active=renderToStaticMarkup(createElement(ChallengeRunPanel,{s:run,act:()=>{}}));expect(active).toContain('v2');expect(active).toContain(BALANCE.hardware.campus.name);
 });
 it('keeps Hands Off useful at the offline cap and integrates its memory bonus across reload',()=>{
  let s={...account(),unlockedEquipmentSlots:2};s=createItem(s,'long-term-memory','common');s=equip(s,s.inventory[0].id);s={...s,savedAt:1000,offlineCapacitySeconds:BALANCE.maxOfflineSeconds,challengeStages:{'no-taps':69},hardware:1,hardwareCounts:{...s.hardwareCounts,calculator:1},discovered:['calculator']};
  const plain={...s,challengeStages:{}};expect(creditRateScientific(s.hardware,s.level,s,s.savedAt).compare(creditRateScientific(plain.hardware,plain.level,plain,plain.savedAt))).toBeGreaterThan(0);
  const full=advance(s,12,false,()=>.5).state,split=advance(reload(advance(s,6,false,()=>.5).state),6,false,()=>.5).state;expect(full.exactEconomy.credits).toEqual(split.exactEconomy.credits);
 });
 it('uses total first completions for shared automation and gives distinct passive/mastery rewards',()=>{
  const base=newGame(0),a={...base,challengeStages:{'no-items':7,'no-taps':7,'five-hardware':7}};expect(challengeAutomationUnlocks(a)).toEqual(['research-queue']);
  expect(challengeAutomationUnlocks({...base,challengeStages:{'no-items':7}})).toEqual([]);expect(offlineTimeLimit({...base,challengeStages:{'no-taps':69}})).toBeGreaterThan(offlineTimeLimit(base));
  const mastered={...base,retention:{...base.retention,hardwareMasteryXp:{...base.retention.hardwareMasteryXp,calculator:1000}}},rewarded={...mastered,challengeStages:{'no-items':69}};
  expect(classComputeTerms(rewarded,'calculator').mastery).toBeGreaterThan(classComputeTerms(mastered,'calculator').mastery);
 });
});
