// Frozen pre-v56 order contracts; live instant crafting is covered by modelForgeV1.test.ts.
import {legacyPaidCraft as craft} from './testSupport/legacyPaidCraft';
import {ScientificNumber} from './scientificNumber';
import {describe,it,expect} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {newGame,addData,addCredits,buyHardwareClass,startResearchProject,grantComponents,BALANCE,exactEconomyValue,axiomThresholdScientific,type GameState} from './economy';
import {advance,settleResearchCompletions} from './simulation';
import {prestige,axiomReset} from './prestige';
import {restore,serialize,SAVE_VERSION} from './storage';
import {startRunChallenge,abortRunChallenge} from './retention';
import {withChallengeAccess} from './testSupport/challengeAccount';
import {learnBlueprint} from './blueprints';
import {craftModule,settleCrafting,equip} from './inventory';
import {blueprintResearchRewardQuote,earnBlueprintResearchReward} from './blueprintResearchReward';
import {ResearchQuoteDetails,BlueprintResearchRewardNotice} from './ResearchQuoteDetails';
import {projectText} from './gameplayI18n';
import {createBalanceExportFiles} from './balanceReport';
const ready=()=>buyHardwareClass(addCredits(addData(newGame(0,'blueprint-reward-proof'),10000),10000,false),'sbc',1);
const start=(s=ready())=>startResearchProject(s,'blueprints');
const finish=(s:GameState)=>settleResearchCompletions({...s,savedAt:s.researchLabs.find(j=>j?.id==='blueprints')!.endsAt});
const rewardEvents=(s:GameState)=>s.telemetry.permanentEvents.filter(e=>e.type==='blueprint-research-reward');
const legacy=(s:GameState,version=48)=>{const raw=structuredClone(s) as any;delete raw.blueprintResearchReward;if(raw.challengeSession)delete raw.challengeSession.main.blueprintResearchReward;return JSON.stringify({version,state:raw});};
const reload=(s:GameState)=>{const r=restore(serialize(s),s.savedAt);expect(r.error).toBeUndefined();return r.state;};
describe('one-time paid main research to blueprint learning',()=>{
 it('pays the existing project cost and awards nothing on start or before completion',()=>{
  const s=ready(),started=start(s),job=started.researchLabs[0]!;
  expect(started).not.toBe(s);expect(exactEconomyValue(started,'data').toJSON()).toEqual(exactEconomyValue(s,'data').subtract(ScientificNumber.from(job.dataCost)).toJSON());
  expect(started.blueprintFragments).toBe(0);expect(started.blueprintResearchReward).toBe('unearned');
  expect(earnBlueprintResearchReward(started,job)).toBe(started);
  expect(settleResearchCompletions({...started,savedAt:job.endsAt-1}).blueprintFragments).toBe(0);
 });
 it.each([true,false])('books exactly four fragments on real completion, active=%s, including reload',active=>{
  const started=reload(start()),job=started.researchLabs[0]!;
  const done=advance(started,job.durationSeconds,active,()=>.5).state;
  expect(done.blueprintFragments).toBe(BALANCE.firstBlueprintResearchFragments);expect(done.blueprintResearchReward).toBe('consumed');expect(done.completedResearch).toContain('blueprints');
  expect(rewardEvents(done)).toHaveLength(1);expect(rewardEvents(done)[0].details.amount).toBe(4);
  expect(settleResearchCompletions(done)).toBe(done);expect(startResearchProject(done,'blueprints')).toBe(done);
  const repeated=settleResearchCompletions({...reload(done),researchLabs:[job,null,null,null]});expect(repeated.blueprintFragments).toBe(4);expect(rewardEvents(repeated)).toHaveLength(1);
 });
 it('preserves the receipt and remaining fragments across Prestige and Axiom',()=>{
  const done=finish(start()),learned=learnBlueprint(done,'quantum-chip');expect(learned.blueprintFragments).toBe(0);
  const normal=prestige(addCredits(learned,1e20)),threshold=axiomThresholdScientific(),reset=axiomReset({...normal,cycleINTEarned:threshold.toNumber(),exactEconomy:{...normal.exactEconomy,cycleINTEarned:threshold.toJSON()}});
  expect(reset.axiomResetCount).toBe(1);expect(reload(reset).blueprintResearchReward).toBe('consumed');expect(reset.blueprintFragments).toBe(0);
  expect(startResearchProject(reset,'blueprints')).toBe(reset);expect(rewardEvents(reset)).toHaveLength(1);
 });
 it('does not infer a reward from an unpaid legacy job or duplicate completed project',()=>{
  const started=start(),job=started.researchLabs[0]!;
  const unpaid=finish({...started,researchLabs:[{...job,dataCost:0,dataCostExact:undefined,quoteBasis:undefined},null,null,null]});expect(unpaid.blueprintFragments).toBe(0);expect(rewardEvents(unpaid)).toHaveLength(0);
  const duplicate=finish({...started,completedResearch:['blueprints']});expect(duplicate.blueprintFragments).toBe(0);
 });
 it('retains a capacity-blocked earned reward across save and books it only once after spending',()=>{
  const pending=finish(start({...ready(),blueprintFragments:Number.MAX_SAFE_INTEGER}));expect(pending.blueprintResearchReward).toBe('pending');expect(pending.blueprintFragments).toBe(Number.MAX_SAFE_INTEGER);expect(rewardEvents(pending)).toHaveLength(0);
  const spent=learnBlueprint(reload(pending),'quantum-chip'),booked=settleResearchCompletions(spent);
  expect(booked.blueprintFragments).toBe(Number.MAX_SAFE_INTEGER);expect(booked.blueprintResearchReward).toBe('consumed');expect(rewardEvents(booked)).toHaveLength(1);expect(settleResearchCompletions(reload(booked)).blueprintFragments).toBe(Number.MAX_SAFE_INTEGER);
 });
 it('unblocks learning while module, material and Data crafting costs remain real',()=>{
  const stock=grantComponents(ready(),Object.fromEntries(Object.keys(BALANCE.components).map(id=>[id,1000]))),done=finish(start(stock)),learned=learnBlueprint(done,'quantum-chip');
  expect(learned.blueprintFragments).toBe(0);expect(craft(learned,'quantum-chip')).toBe(learned);
  const module=craftModule(learned,'computeBus'),moduleDone=settleCrafting({...module,savedAt:module.crafting.active!.endsAt!}),item=craft(moduleDone,'quantum-chip');
  expect(item.modules.computeBus).toBe(0);expect(item.crafting.active!.ingredients).toMatchObject({modules:{computeBus:1},data:BALANCE.itemRecipes['quantum-chip'].data});
  expect(exactEconomyValue(item,'data').toJSON()).toEqual(exactEconomyValue(moduleDone,'data').subtract(ScientificNumber.from(1800)).toJSON());
  expect(item.componentInventory.circuits).toBe(moduleDone.componentInventory.circuits-30);
  const completed=settleCrafting({...item,savedAt:item.crafting.active!.endsAt!});expect(completed.craftedItemCounts['quantum-chip']).toBe(1);expect(reload(completed).craftedItemCounts['quantum-chip']).toBe(1);
 });
});
describe('grant ownership and migration',()=>{
 it('challenge completion never pays this reward or changes the returned main receipt',()=>{
  const main=withChallengeAccess(ready()),run=startRunChallenge(main,'no-items'),funded=buyHardwareClass(addCredits(addData(run,10000),10000,false),'sbc',1),done=finish(start(funded));
  expect(done.blueprintFragments).toBe(0);expect(done.blueprintResearchReward).toBe('unearned');expect(rewardEvents(done)).toHaveLength(0);
  const returned=abortRunChallenge(reload(done));expect(returned.blueprintResearchReward).toBe('unearned');expect(returned.blueprintFragments).toBe(0);
 });
 it('an actual paid main project completing during a challenge pays only the main snapshot',()=>{
  const main=start(withChallengeAccess(ready())),run=startRunChallenge(main,'no-items'),done=advance(run,main.researchLabs[0]!.durationSeconds,false,()=>.5).state;
  expect(done.blueprintFragments).toBe(0);expect(done.challengeSession!.main.blueprintFragments).toBe(4);expect(done.challengeSession!.main.blueprintResearchReward).toBe('consumed');
  const returned=abortRunChallenge(reload(done));expect(returned.blueprintFragments).toBe(4);expect(rewardEvents(returned)).toHaveLength(1);
 });
 it.each([44,47,48])('migrates a completed historical v%s project without retroactive fragments',version=>{
  const old={...ready(),completedResearch:['blueprints'] as GameState['completedResearch'],blueprintFragments:2};const migrated=restore(legacy(old,version),old.savedAt);
  expect(migrated.error).toBeUndefined();expect(migrated.migrated).toBe(true);expect(migrated.state.blueprintResearchReward).toBe('consumed');expect(migrated.state.blueprintFragments).toBe(2);expect(rewardEvents(migrated.state)).toHaveLength(0);
 });
 it('migrates an actual paid in-flight v48 project and grants on its future completion',()=>{
  const started=start(),loaded=restore(legacy(started),0);expect(loaded.error).toBeUndefined();expect(loaded.state.researchLabs).toEqual(started.researchLabs);expect(loaded.state.blueprintResearchReward).toBe('unearned');expect(finish(loaded.state).blueprintFragments).toBe(4);
 });
 it('migrates saved main and challenge independently without transferring existing resources',()=>{
  const main=withChallengeAccess(ready()),run=startRunChallenge(main,'no-items'),old={...run,completedResearch:['blueprints'] as GameState['completedResearch']};
  const loaded=restore(legacy(old),0);expect(loaded.error).toBeUndefined();expect(loaded.state.blueprintResearchReward).toBe('consumed');expect(loaded.state.challengeSession!.main.blueprintResearchReward).toBe('unearned');expect(loaded.state.blueprintFragments).toBe(0);
 });
 it.each([undefined,true,'unknown','pending'])('rejects invalid/missing current receipt %s instead of inventing ownership',value=>{
  const state={...newGame(0),blueprintResearchReward:value};const raw=JSON.stringify({version:SAVE_VERSION,state});expect(restore(raw,0).error).toBeTruthy();
 });
 it.each(['de','en'] as const)('shows the one-time amount and receipt state in %s and audits its actual payout',language=>{
  const initial=ready(),s={...initial,settings:{...initial.settings,language}},copy=projectText('blueprints',language);
  expect(copy.effect).toContain(String(BALANCE.firstBlueprintResearchFragments));expect(copy.effect).not.toContain('{fragments}');
  const html=renderToStaticMarkup(createElement(ResearchQuoteDetails,{s,id:'blueprints'}));expect(html).toContain('data-blueprint-reward="unearned"');expect(html).toContain(language==='de'?'einmalig +4':'once.');
  const done=finish(start(s));
  const notice=renderToStaticMarkup(createElement(BlueprintResearchRewardNotice,{s:done}));expect(notice).toContain(language==='de'?'4 Bauplanfragmente verbucht':'4 blueprint fragments credited once');
  expect(renderToStaticMarkup(createElement(BlueprintResearchRewardNotice,{s:{...s,completedResearch:['blueprints'],blueprintResearchReward:'consumed'}}))).toBe('');
  const csv=createBalanceExportFiles(done,done.savedAt)['research.csv'];expect(csv).toContain('blueprintFragmentsGranted');expect(csv).toContain('blueprint-research-reward');expect(csv).toMatch(/"blueprint-research-reward"[^\n]*,"4"\r?$/m);
 });
});
