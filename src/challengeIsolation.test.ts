import {ScientificNumber} from './scientificNumber';
import {describe,expect,it} from 'vitest';
import {BALANCE,addCredits,addCreditsScientific,addData,buyHardwareClass,exactEconomyValue,grantComponents,newGame,registerTap,startResearchProject,startTraining,type GameState} from './economy';
import {abortRunChallenge,completeRunChallenge,runChallengeReady,startRunChallenge} from './retention';
import {advance,advanceTo} from './simulation';
import {createItem,equip,craftModule} from './inventory';
import {queueExperiment} from './experiments';
import {axiomReset,prestige} from './prestige';
import {buyGemOffer,gemOfferQuote} from './gemShop';
import {claimMission,claimMissionBonus,rollPeriods} from './missions';
import {claimSeasonReward} from './season';
import {claimAchievement} from './achievements';
import {claimOnboarding} from './onboarding';
import {BACKUP_KEYS,SAVE_KEY,SAVE_VERSION,importGame,loadGame,persistGame,restore,serialize,type StorageLike} from './storage';
import {createLifecycleGate} from './mobileIntegration';

const rng=()=>.5;
function preparedMain(){
 let s=addData(addCredits(newGame(0,'isolation'),1e6,false),1e6);
 s=buyHardwareClass(s,'calculator',10);s=buyHardwareClass(s,'sbc',1);s=buyHardwareClass(s,'pc',1);
 s=grantComponents({...s,prestigeCount:1,completedResearch:['blueprints']},{circuits:100,copperCoils:100,siliconWafers:100,titaniumBolts:100});
 s=equip(createItem(s,'quantum-chip','rare'),'item-1');
 s={...s,nodes:['shoppingAgent'],hardwareAutoBuyers:{calculator:true},automation:{...s.automation,reservePercent:.75}};
 s=startResearchProject(s,'dataGeneration');s=startTraining(s,'quality');s=craftModule(s,'computeBus',2);
 s=queueExperiment(s,'hardware',s.savedAt,'short');
 expect(s.researchLabs.some(Boolean)).toBe(true);expect(s.activeTraining).not.toBeNull();expect(s.crafting.active).not.toBeNull();expect(s.experiments.active).not.toBeNull();
 expect(restore(serialize(s),0).error).toBeUndefined();return s;
}
class MemoryStorage implements StorageLike{
 values=new Map<string,string>();getItem(key:string){return this.values.get(key)??null}setItem(key:string,value:string){this.values.set(key,value)}removeItem(key:string){this.values.delete(key)}
}
describe('isolated challenge runs with short real simulations',()=>{
 it('preserves the complete main state and starts no-taps with paid hardware and no income',()=>{
  const main=preparedMain(),before=serialize(main),run=startRunChallenge(main,'no-taps');
  expect(run.challengeSession?.main).toBe(main);expect(serialize(main)).toBe(before);
  expect(run.credits).toBe(50);expect(exactEconomyValue(run,'credits').toNumber()).toBe(50);expect(run.hardware).toBe(0);
  expect(Object.values(run.hardwareCounts).every(n=>n===0)).toBe(true);
  expect(run.runCreditsEarned).toBe(0);expect(run.lifetimeEligibleCredits).toBe(0);expect(run.totalINTEarned).toBe(0);expect(run.lifetime.regularCredits).toBe(0);
  expect(run.inventory).toEqual([]);expect(run.equipped).toEqual({});expect(run.nodes).toEqual([]);expect(run.completedResearch).toEqual([]);
  const bought=buyHardwareClass(run,'calculator',1);
  expect(bought.hardwareCounts.calculator).toBe(1);expect(bought.credits).toBe(35);expect(bought.challengeSession?.main.credits).toBe(main.credits);
  const progressed=advance(bought,30,true,rng).state;expect(progressed.credits).toBeGreaterThan(35);expect(main.lifetime.taps).toBe(0);
 });
 it('keeps active taps and the Data Drought modifier out of the passive main game',()=>{
  const main=preparedMain(),before=serialize(main),run=startRunChallenge(main,'data-crunch');
  const tapped=registerTap(run,run.savedAt),bought=buyHardwareClass(tapped,'calculator',1);
  expect(tapped.lifetime.taps).toBe(1);expect(serialize(bought.challengeSession!.main)).toBe(before);
  const advanced=advance(bought,30,true,rng),expected=advance(main,30,false,rng);
  expect(advanced.state.challengeSession?.main.exactEconomy).toEqual(expected.state.exactEconomy);
  expect(advanced.state.challengeSession?.main.lifetime.taps).toBe(main.lifetime.taps);
  expect(advanced.state.challengeSession?.main.lifetime.activeSeconds).toBe(main.lifetime.activeSeconds);
 });
 it.each(['abort','success'] as const)('returns the advanced main game after %s, retaining research, equipment and jobs',kind=>{
  const main=preparedMain(),expected=advance(main,300,false,rng),run=advance(startRunChallenge(main,'no-taps'),300,true,rng).state;
  const ready=kind==='success'?addCredits(run,BALANCE.prestigeBaseRevenue):run;
  const returned=kind==='success'?completeRunChallenge(ready):abortRunChallenge(ready);
  expect(returned.inventory).toEqual(expected.state.inventory);expect(returned.equipped).toEqual(main.equipped);expect(returned.completedResearch).toContain('blueprints');
  expect(returned.researchLevels).toEqual(expected.state.researchLevels);expect(returned.modules).toEqual(expected.state.modules);
  expect(returned.experiments).toEqual(expected.state.experiments);expect(returned.qualityLevel).toBe(expected.state.qualityLevel);
  expect(returned.lifetime.taps).toBe(main.lifetime.taps);expect(returned.lifetime.activeSeconds).toBe(main.lifetime.activeSeconds);
  expect(returned.exactEconomy).toEqual(expected.state.exactEconomy);expect(returned.hardwareCounts).toEqual(expected.state.hardwareCounts);
  expect(returned.challengeReturn?.report).toEqual(expected.report);
  expect(returned.retention.challengeStars).toBe(kind==='success'?2:0);expect(abortRunChallenge(returned)).toBe(returned);expect(completeRunChallenge(returned)).toBe(returned);
 });
 it('finishes all four main job types once, including analysis, across reload and more passive time',()=>{
  const run=advance(startRunChallenge(preparedMain(),'no-taps'),600,false,rng).state,main=run.challengeSession!.main;
  expect(main.researchLevels.dataGeneration).toBe(1);expect(main.qualityLevel).toBe(1);expect(main.modules.computeBus).toBe(2);
  expect(main.researchLabs.every(lab=>lab===null)).toBe(true);expect(main.activeTraining).toBeNull();expect(main.crafting.active).toBeNull();expect(main.experiments.active).toBeNull();
  expect(main.experiments.completedIds).toHaveLength(1);
  expect(run.challengeSession!.report).toMatchObject({levels:1,researchCompleted:1,experiments:1,craftingCompleted:2});
  const restored=restore(serialize(run),600000);expect(restored.error).toBeUndefined();
  const duplicate=advanceTo(restored.state,600000,false,rng).state;expect(duplicate.challengeSession!.report).toEqual(run.challengeSession!.report);
  const later=advanceTo(duplicate,610000,false,rng).state,returned=abortRunChallenge(later);
  expect(returned.researchLevels.dataGeneration).toBe(1);expect(returned.qualityLevel).toBe(1);expect(returned.modules.computeBus).toBe(2);
  expect(returned.experiments.completedIds).toEqual(main.experiments.completedIds);
  expect(returned.challengeReturn!.report).toMatchObject({levels:1,researchCompleted:1,experiments:1,craftingCompleted:2});
 });
 it('credits each time interval exactly once across lifecycle duplicates, save/reload and return',()=>{
  const main=preparedMain(),expected=advanceTo(main,120000,false,rng).state;
  let run=advanceTo(startRunChallenge(main,'no-taps'),60000,true,rng).state;
  const first=serialize(run.challengeSession!.main),gate=createLifecycleGate(true,()=>{},()=>{run=advanceTo(run,60000,false,rng).state});
  gate.foreground();gate.foreground();expect(serialize(run.challengeSession!.main)).toBe(first);
  const store=new MemoryStorage();expect(persistGame(store,run,60000).saved).toBe(true);
  run=loadGame(store,60000).state;run=advanceTo(run,120000,false,rng).state;
  expect(run.challengeSession?.anchor).toBe(120000);expect(run.challengeSession?.main.exactEconomy).toEqual(expected.exactEconomy);
  const returned=abortRunChallenge(run),reloaded=restore(serialize(returned),120000).state;
  expect(advanceTo(reloaded,120000,false,rng).state.exactEconomy).toEqual(expected.exactEconomy);
  expect(returned.researchLevels).toEqual(expected.researchLevels);expect(returned.modules).toEqual(expected.modules);
 });
 it('consumes nonproductive elapsed time once without granting another starter budget',()=>{
  const idle=newGame(0),wall=60000;
  const run=advanceTo(startRunChallenge(idle,'no-taps'),wall,false,rng).state;
  expect(run.challengeSession?.report.seconds).toBe(60);
  expect(run.challengeSession?.report.lostSeconds).toBe(0);expect(run.challengeSession?.anchor).toBe(wall);
  const again=advanceTo(run,wall,false,rng).state;
  expect(again.challengeSession?.report).toEqual(run.challengeSession?.report);expect(abortRunChallenge(again).credits).toBe(50);
 });
 it('transfers only the existing first-clear stars, once even after reload or a repeated run',()=>{
  const main=preparedMain(),run=addCredits(buyHardwareClass(startRunChallenge(main,'no-taps'),'calculator',1),BALANCE.prestigeBaseRevenue);
  expect(runChallengeReady(run)).toBe(true);const returned=completeRunChallenge(run);
  expect(returned.credits).toBe(main.credits);expect(returned.inventory).toEqual(main.inventory);expect(returned.data).toBe(main.data);
  expect(returned.retention.runCompletions['no-taps']).toBe(1);expect(returned.retention.challengeStars).toBe(2);
  const reloaded=restore(serialize(returned),0).state;expect(completeRunChallenge(reloaded)).toBe(reloaded);
  const again=completeRunChallenge(addCredits(startRunChallenge(reloaded,'no-taps'),BALANCE.prestigeBaseRevenue));
  expect(again.retention.runCompletions['no-taps']).toBe(2);expect(again.retention.challengeStars).toBe(2);
 });
 it('blocks resets, the gem shop and main-game claims through real domain transactions',()=>{
  const funded=rollPeriods(addCredits(startRunChallenge(preparedMain(),'no-taps'),BALANCE.prestigeBaseRevenue*100),0);
  const run={...funded,gems:1000,cycleINTEarned:1e12,exactEconomy:{...funded.exactEconomy,cycleINTEarned:{m:1,e:12}},season:{...funded.season,xp:1000},lifetime:{...funded.lifetime,hardwareBought:25},onboarding:{completed:['first-buy'],claimed:[]}};
  expect(prestige({...run,retention:{...run.retention,activeRun:null}})).not.toBe(run);
  expect(axiomReset({...run,retention:{...run.retention,activeRun:null}}).axiomResetCount).toBeGreaterThan(run.axiomResetCount);
  expect(prestige(run)).toBe(run);expect(axiomReset(run)).toBe(run);expect(buyGemOffer(run,'materials-circuits')).toBe(run);
  expect(gemOfferQuote(run,'materials-circuits')).toMatchObject({enabled:false,reason:'challenge'});
  expect(claimMission(run,'daily',run.missions.daily.tasks[0].id)).toBe(run);expect(claimMissionBonus(run,'daily')).toBe(run);
  expect(claimSeasonReward(run,1)).toBe(run);expect(claimAchievement(run,'hardware',0)).toBe(run);expect(claimOnboarding(run,'first-buy')).toBe(run);
 });
 it('has identical online/offline main and challenge results on the same short decision boundaries',()=>{
  const start=buyHardwareClass(startRunChallenge(preparedMain(),'no-taps'),'calculator',1);
  const offline=advanceTo(start,120000,false,rng).state;let online=start;
  for(let at=30000;at<=120000;at+=30000)online=advanceTo(online,at,true,rng).state;
  expect(online.exactEconomy).toEqual(offline.exactEconomy);expect(online.hardwareCounts).toEqual(offline.hardwareCounts);
  expect(online.challengeSession?.main.exactEconomy).toEqual(offline.challengeSession?.main.exactEconomy);
  expect(online.challengeSession?.main.researchLevels).toEqual(offline.challengeSession?.main.researchLevels);
  expect(online.challengeSession?.main.modules).toEqual(offline.challengeSession?.main.modules);
  expect(online.challengeSession?.report.seconds).toBe(offline.challengeSession?.report.seconds);
 });
 it.each([
  ['missing main',(s:GameState)=>{delete s.challengeSession}],
  ['invalid anchor',(s:GameState)=>{s.challengeSession!.anchor=1}],
  ['unknown challenge',(s:GameState)=>{s.retention.activeRun!.id='alien'}],
  ['damaged main item',(s:GameState)=>{s.challengeSession!.main.inventory[0].type='alien' as never}],
  ['damaged main reservation',(s:GameState)=>{s.challengeSession!.main.crafting.active!.ingredients.data++}],
  ['damaged main ledger',(s:GameState)=>{s.challengeSession!.main.exactEconomy.credits={m:-1,e:2}}],
  ['nested session',(s:GameState)=>{s.challengeSession!.main.challengeSession={...s.challengeSession!,main:newGame(0)}}],
 ] as const)('rejects %s without changing a valid save, backups or the running state',(_name,damage)=>{
  const valid=startRunChallenge(preparedMain(),'no-taps'),storage=new MemoryStorage(),before=serialize(valid);
  storage.setItem(SAVE_KEY,before);storage.setItem(BACKUP_KEYS[0],before);
  const broken=JSON.parse(before).state as GameState;damage(broken);const raw=JSON.stringify({version:SAVE_VERSION,state:broken});
  expect(()=>importGame(raw)).toThrow();expect(restore(raw,0).error).toBeTruthy();expect(persistGame(storage,broken,0).saved).toBe(false);
  expect(storage.getItem(SAVE_KEY)).toBe(before);expect(storage.getItem(BACKUP_KEYS[0])).toBe(before);expect(serialize(valid)).toBe(before);
 });
 it('preserves a main scientific ledger above native Number range through challenge reload and abort',()=>{
  const main=addCreditsScientific(newGame(0),ScientificNumber.fromString('1e1000'),false),run=startRunChallenge(main,'no-taps');
  const loaded=restore(serialize(run),0);expect(loaded.error).toBeUndefined();
  const returned=abortRunChallenge(advanceTo(loaded.state,30000,false,rng).state);
  expect(exactEconomyValue(returned,'credits').compare(exactEconomyValue(main,'credits'))).toBe(0);
  expect(returned.lifetimeEligibleCredits).toBe(0);expect(returned.hardware).toBe(0);
 });
 it('recovers the original v24 challenge metadata without inventing a missing historic main',()=>{
  const legacy={...preparedMain(),retention:{...preparedMain().retention,activeRun:{id:'no-taps',startedAt:0}}};
  const migrated=restore(JSON.stringify({version:24,state:legacy}),0);
  expect(migrated.error).toBeUndefined();expect(migrated.state.challengeMigrationNotice).toBe('legacy-challenge-recovered');
  expect(migrated.state.retention.activeRun).toBeNull();expect(migrated.state.credits).toBe(legacy.credits);expect(migrated.state.inventory).toEqual(legacy.inventory);
 });
 it('migrates a valid legacy challenge by retaining only known saved progress, with an explicit warning',()=>{
  const legacy=preparedMain();legacy.retention.activeRun={id:'no-taps',runId:'legacy',startedAt:0,eligibleAtStart:{m:0,e:0}};
  const migrated=restore(JSON.stringify({version:40,state:legacy}),0);
  expect(migrated.error).toBeUndefined();expect(migrated.migrated).toBe(true);expect(migrated.state.retention.activeRun).toBeNull();
  expect(migrated.state.challengeMigrationNotice).toBe('legacy-challenge-recovered');expect(migrated.state.exactEconomy).toEqual(legacy.exactEconomy);
  expect(migrated.state.inventory).toEqual(legacy.inventory);expect(migrated.state.credits).toBe(legacy.credits);
  legacy.retention.activeRun.id='alien';expect(restore(JSON.stringify({version:40,state:legacy}),0).error).toBeTruthy();
 });
});
