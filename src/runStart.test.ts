import {describe,expect,it} from 'vitest';
import {BALANCE,addCreditsScientific,axiomThresholdScientific,automaticRestartAvailable,buyHardwareClass,creditRateScientific,exactEconomyValue,hardwareCostScientific,hardwareIds,newGame,newINTScientific,runStartContract,type GameState} from './economy';
import {axiomPreview,axiomReset,buyAxiomUpgrade,buyNode,prestige,prestigeAgentStatus,prestigePreview,runPrestigeAgent} from './prestige';
import {ScientificNumber} from './scientificNumber';
import {advance,advanceTo} from './simulation';
import {restore,serialize} from './storage';
import {automaticRestartText,prestigeAgentReasonText,runStartText} from './prestigeText';

const claimable=()=>addCreditsScientific(newGame(0),ScientificNumber.from(BALANCE.prestigeBaseRevenue*16));
const shopping=()=>{const earned=claimable(),reset=prestige(earned),unlocked=buyNode(reset,'shoppingAgent');return {...unlocked,hardwareAutoBuyers:{calculator:true},automation:{...unlocked.automation,reservePercent:.75}};};
const agent=()=>{const unlocked=shopping(),funded={...unlocked,axioms:3,availableAxioms:3,totalAxiomsEarned:3},bought=buyAxiomUpgrade(funded,'axiomAutomation');return {...bought,prestigeAgent:{...bought.prestigeAgent,enabled:true,minimumReward:{m:1,e:0},minimumRunMinutes:15 as const,waitForTraining:true,waitForAnalysis:true}};};
const readyAgent=()=>({...addCreditsScientific(agent(),ScientificNumber.from(BALANCE.prestigeBaseRevenue*100)),savedAt:900_000});

function expectStart(s:GameState){
 const start=runStartContract();expect(s.credits).toBe(50);expect(s.exactEconomy.credits).toEqual(start.creditLedger);expect(s.hardware).toBe(0);expect(s.hardwareCounts).toEqual(start.hardwareCounts);expect(hardwareIds.every(id=>s.hardwareCounts[id]===0)).toBe(true);
}

// A legally reachable post-prestige account: shopping node bought from earned INT,
// Axiom Automation bought from 3 historical Axioms (unchanged cost: 2); completed Data Generation I,
// Model Architecture I and Commercialization 250 persist from earlier runs.
// Technical automation flow proof, NOT a natural progression/timing measurement.
// The measured trajectory starts with 50 credits and no hardware; no grants/actions
// are applied during it. These research levels have no cap and finite scientific costs.
function integrationStart(){
 const fresh=newGame(0),historical=axiomThresholdScientific().multiplyNumber(9),revenue=historical.pow(2).multiplyNumber(BALANCE.prestigeBaseRevenue);
 const researched={...fresh,researchLevels:{...fresh.researchLevels,dataGeneration:1,modelArchitecture:1,commercialization:250},lifetime:{...fresh.lifetime,researchStarted:252,researchCompleted:252}};
 const past=prestige(addCreditsScientific(researched,revenue));
 const afterAxiom=axiomReset(past),normal=prestige(addCreditsScientific(afterAxiom,ScientificNumber.from(BALANCE.prestigeBaseRevenue*16))),shop=buyNode(normal,'shoppingAgent'),s=buyAxiomUpgrade(shop,'axiomAutomation');
 return {...s,hardwareAutoBuyers:{calculator:true},automation:{...s.automation,reservePercent:.75},prestigeAgent:{...s.prestigeAgent,enabled:true,minimumReward:{m:1,e:0},minimumRunMinutes:15 as const},offlineCapacitySeconds:3600};
}

describe('one run start contract',()=>{
 it('initializes all three real start paths with the same paid budget and zero hardware',()=>{
  expectStart(newGame(123));expectStart(prestige(claimable()));
  const s=shopping(),cycle=axiomThresholdScientific(),ready={...s,cycleINTEarned:cycle.toNumber(),exactEconomy:{...s.exactEconomy,cycleINTEarned:cycle.toJSON()}};
  const axiom=axiomReset(ready);expectStart(axiom);expect(axiomReset(axiom)).toBe(axiom);expect(newINTScientific(axiom).isZero()).toBe(true);expect(exactEconomyValue(axiom,'cycleEligibleCredits').isZero()).toBe(true);expect(axiom.lifetime.regularCredits).toBe(ready.lifetime.regularCredits);expect(axiom.missions).toEqual(ready.missions);expect(newGame(123).prestigeAgent.enabled).toBe(false);
 });
 it('does not record start capital as production, entitlement, telemetry income or quest progress',()=>{
  const fresh=newGame(0);for(const key of ['runCreditsEarned','lifetimeCreditsEarned','lifetimeEligibleCredits','cycleEligibleCredits','prestigeEntitlementClaimed'] as const)expect(exactEconomyValue(fresh,key).isZero()).toBe(true);
  expect(newINTScientific(fresh).isZero()).toBe(true);expect(fresh.lifetime.regularCredits).toBe(0);expect(fresh.telemetry.metrics).toEqual([]);
  const before=claimable(),after=prestige(before);for(const key of ['lifetimeCreditsEarned','lifetimeEligibleCredits','cycleEligibleCredits'] as const)expect(exactEconomyValue(after,key).compare(exactEconomyValue(before,key))).toBe(0);
  expect(after.runCreditsEarned).toBe(0);expect(after.lifetime.regularCredits).toBe(before.lifetime.regularCredits);expect(after.missions).toEqual(before.missions);expect(newINTScientific(after).isZero()).toBe(true);
 });
 it.each([0,12.589,35,50,1234])('preserves an existing balance %s on save/reload and offline return',credits=>{
  const fresh=newGame(0),s={...fresh,credits,exactEconomy:{...fresh.exactEconomy,credits:ScientificNumber.from(credits).toJSON()}};
  const expected=ScientificNumber.from(credits),loaded=restore(serialize(s),0);expect(loaded.error).toBeUndefined();expect(exactEconomyValue(loaded.state,'credits').compare(expected)).toBe(0);expect(loaded.state.credits).toBe(expected.toNumber());
  const returned=advanceTo(loaded.state,60_000).state;expect(returned.credits).toBe(expected.toNumber());expect(exactEconomyValue(returned,'credits').compare(expected)).toBe(0);expect(returned.hardware).toBe(0);expect(returned.lifetime.regularCredits).toBe(0);
  expect(restore(serialize(returned),60_000).state.exactEconomy.credits).toEqual(expected.toJSON());
 });
 it('does not seed legacy saves when migrations build a newGame base',()=>{
  const old:any=newGame(0);old.credits=7;delete old.exactEconomy;
  const loaded=restore(JSON.stringify({version:26,state:old}),0);expect(loaded.error).toBeUndefined();expect(loaded.state.credits).toBe(7);expect(exactEconomyValue(loaded.state,'credits').toNumber()).toBe(7);
 });
 it('matches both previews to the actual new run',()=>{
  const before=claimable(),p=prestigePreview(before),after=prestige(before);expect(after.credits).toBe(p.start.credits);expect(after.hardwareCounts).toEqual(p.start.hardwareCounts);
  const amount=axiomThresholdScientific(),a={...before,cycleINTEarned:amount.toNumber(),exactEconomy:{...before.exactEconomy,cycleINTEarned:amount.toJSON()}},ap=axiomPreview(a),ar=axiomReset(a);expect(ar.credits).toBe(ap.start.credits);expect(ar.hardwareCounts).toEqual(ap.start.hardwareCounts);
  expect(runStartText(p.start,'de')).toBe('Neustart mit 50 Credits und ohne Hardware.');expect(runStartText(ap.start,'en')).toBe('Restart with 50 credits and no hardware.');
 });
});

describe('first automatic paid purchase',()=>{
 it('restarts and produces with only the shopping node and enabled calculator buyer',()=>{
  const reset=shopping();expectStart(reset);expect(reset.nodes).toEqual(['shoppingAgent']);
  expect(Object.values(reset.researchLevels).every(level=>level===0)).toBe(true);
  expect(Object.values(reset.axiomUpgradeLevels).every(level=>level===0)).toBe(true);
  expect(reset.prestigeAgent.enabled).toBe(false);
  const waiting=advance(reset,9,false,()=>.5).state;expectStart(waiting);
  const bought=advance(waiting,1,false,()=>.5).state;
  expect(bought.hardwareCounts.calculator).toBe(1);expect(bought.credits).toBe(35);
  expect(exactEconomyValue(bought,'credits').compare(exactEconomyValue(reset,'credits').subtract(hardwareCostScientific('calculator',0,reset)))).toBe(0);
  const productive=advance(bought,10,false,()=>.5);
  expect(productive.report.credits).toBeGreaterThan(0);expect(productive.state.credits).toBeGreaterThan(bought.credits);
  expect(productive.state.lifetime.regularCredits).toBeGreaterThan(bought.lifetime.regularCredits);
  expect(productive.state.lifetime.taps).toBe(reset.lifetime.taps);expect(productive.state.prestigeCount).toBe(reset.prestigeCount);
 });
 it.each([0,.25,.75])('pays the actual scientific price at reserve %s, only on the next shopping tick',reservePercent=>{
  const s=shopping(),start={...s,automation:{...s.automation,reservePercent}},before=exactEconomyValue(start,'credits'),cost=hardwareCostScientific('calculator',0,start);
  expect(advance(start,9,false,()=>.5).state.hardware).toBe(0);
  const after=advance(start,10,false,()=>.5).state;expect(after.hardwareCounts.calculator).toBe(1);expect(after.hardware).toBe(1);expect(exactEconomyValue(after,'credits').compare(before.subtract(cost))).toBe(0);
  expect(after.credits).toBe(35);expect(after.lifetime.regularCredits).toBe(start.lifetime.regularCredits);expect(after.lifetime.hardwareBought-start.lifetime.hardwareBought).toBe(1);
 });
 it('respects the percentage reserve immediately after the first calculator',()=>{
  const s=shopping(),first=advance(s,10,false,()=>.5).state,after=advance(first,10,false,()=>.5).state;
  expect(after.hardwareCounts.calculator).toBe(1);expect(after.credits).toBeGreaterThan(first.credits);
  const budget=exactEconomyValue(after,'credits'),price=hardwareCostScientific('calculator',1,after);expect(budget.subtract(price).compare(budget.multiplyNumber(.75))).toBe(-1);
  const withoutReserve=advance({...first,automation:{...first.automation,reservePercent:0}},10,false,()=>.5).state;expect(withoutReserve.hardwareCounts.calculator).toBe(2);
 });
 it('does not override reserve for other hardware or a partially populated run',()=>{
  const first=buyHardwareClass(shopping(),'calculator',1),after=advance(first,10,false,()=>.5).state;expect(after.hardwareCounts.calculator).toBe(1);
  const s=shopping(),rich={...s,credits:200,exactEconomy:{...s.exactEconomy,credits:ScientificNumber.from(200).toJSON()},hardwareAutoBuyers:{sbc:true}};
  expect(advance(rich,10,false,()=>.5).state.hardware).toBe(0);
 });
 it.each(['locked','disabled'] as const)('cannot buy a first calculator when %s',why=>{
  const s=shopping(),blocked=why==='locked'?{...s,nodes:[]}:{...s,hardwareAutoBuyers:{calculator:false}};
  expect(automaticRestartAvailable(blocked)).toBe(false);const after=advance(blocked,60,false,()=>.5).state;expect(after.hardware).toBe(0);expect(after.credits).toBe(50);
 });
 it('does not buy on shortage and never bypasses the repaired transaction',()=>{
  const s=shopping(),poor={...s,credits:12.589,exactEconomy:{...s.exactEconomy,credits:ScientificNumber.from(12.589).toJSON()}};
  const after=advance(poor,60,false,()=>.5).state;expect(after.hardware).toBe(0);expect(after.credits).toBe(ScientificNumber.from(12.589).toNumber());expect(after.exactEconomy.credits).toEqual(poor.exactEconomy.credits);
 });
 it('deactivates lost INT unlocks after Axiom reset while honoring effective permanent unlocks',()=>{
  const s=agent(),cycle=axiomThresholdScientific(),ready={...s,cycleINTEarned:cycle.toNumber(),exactEconomy:{...s.exactEconomy,cycleINTEarned:cycle.toJSON()}},reset=axiomReset(ready);
  expect(reset.hardwareAutoBuyers.calculator).toBe(true);expect(automaticRestartAvailable(reset)).toBe(false);expect(prestigeAgentStatus(reset)).toBe('restart-unavailable');expect(advance(reset,60,false,()=>.5).state.hardware).toBe(0);
  const permanent={...ready,axiomUpgrades:[...ready.axiomUpgrades,'anchoredShoppingAgent' as const]},retained=axiomReset(permanent);expect(automaticRestartAvailable(retained)).toBe(true);expect(advance(retained,10,false,()=>.5).state.hardware).toBe(1);
 });
});

describe('guarded normal auto prestige',()=>{
 it.each(['locked','disabled','sbc-only'] as const)('blocks automatic resets without a working first calculator route: %s',why=>{
  const s=readyAgent(),blocked=why==='locked'?{...s,nodes:[]}:why==='disabled'?{...s,hardwareAutoBuyers:{calculator:false}}:{...s,hardwareAutoBuyers:{sbc:true}};
  expect(prestigeAgentStatus(blocked)).toBe('restart-unavailable');expect(runPrestigeAgent(blocked)).toBe(blocked);expect(advance(blocked,10,false,()=>.5).state.prestigeCount).toBe(blocked.prestigeCount);
  expect(prestige(blocked).prestigeCount).toBe(blocked.prestigeCount+1);expect(prestigeAgentReasonText(prestigeAgentStatus(blocked),'de')).toBe('Automatischer Neustart benötigt einen aktivierten Einkaufsagenten');
 });
 it('checks the current minimum scientific claim even beyond native Number range',()=>{
  const s=readyAgent(),minimum=ScientificNumber.fromString('1e1000'),below={...s,prestigeAgent:{...s.prestigeAgent,minimumReward:minimum.toJSON()}};
  expect(prestigeAgentStatus(below)).toBe('insufficient-int');expect(runPrestigeAgent(below)).toBe(below);
  const rich=addCreditsScientific(below,ScientificNumber.fromString('1e2020'));expect(prestigeAgentStatus(rich)).toBe('ready');expect(runPrestigeAgent(rich).prestigeCount).toBe(rich.prestigeCount+1);
 });
 it('never advertises a reset without the normal one-INT minimum even when configured to zero',()=>{
  const s=agent(),zero={...s,prestigeAgent:{...s.prestigeAgent,minimumReward:{m:0,e:0}},savedAt:900000};expect(prestigeAgentStatus(zero)).toBe('insufficient-int');expect(runPrestigeAgent(zero)).toBe(zero);
 });
 it('preserves minimum runtime, independent waits, disabled settings and manual prestige',()=>{
  const s=readyAgent(),young={...s,savedAt:899_999};expect(prestigeAgentStatus(young)).toBe('minimum-runtime');expect(runPrestigeAgent(young)).toBe(young);
  const disabled={...s,prestigeAgent:{...s.prestigeAgent,enabled:false}};expect(prestigeAgentStatus(disabled)).toBe('disabled');expect(runPrestigeAgent(disabled)).toBe(disabled);expect(prestige(disabled).prestigeCount).toBe(disabled.prestigeCount+1);
  const training={...s,activeTraining:{track:'quality' as const,workRequired:10,creditCost:0}},analysis={...s,experiments:{...s.experiments,active:{id:'analysis',type:'hardware' as const,length:'short' as const,startedAt:s.savedAt,endsAt:s.savedAt+10000,dataCost:0}}};
  expect(prestigeAgentStatus(training)).toBe('training-active');expect(prestigeAgentStatus(analysis)).toBe('analysis-active');expect(prestigeAgentStatus({...training,prestigeAgent:{...s.prestigeAgent,waitForTraining:false}})).toBe('ready');expect(prestigeAgentStatus({...analysis,prestigeAgent:{...s.prestigeAgent,waitForAnalysis:false}})).toBe('ready');
 });
 it('resets timer/counters once and leaves purchasing to a subsequent periodic tick',()=>{
  const s={...readyAgent(),runTrainingCompleted:2,runResearchCompleted:3,runMilestoneEdges:['calculator:10'],automation:{...agent().automation,shoppingElapsed:9,elapsed:9}},reset=runPrestigeAgent(s);
  expectStart(reset);expect(reset.prestigeCount).toBe(s.prestigeCount+1);expect(reset.runStartedAt).toBe(s.savedAt);expect(reset.telemetry.runStartedAt).toBe(s.savedAt);expect(reset.runTrainingCompleted).toBe(0);expect(reset.runResearchCompleted).toBe(0);expect(reset.runMilestoneEdges).toEqual([]);expect(reset.prestigeAgent.elapsed).toBe(0);expect(reset.automation.shoppingElapsed).toBe(0);expect(runPrestigeAgent(reset)).toBe(reset);
  expect(advance(reset,9,false,()=>.5).state.hardware).toBe(0);expect(advance(reset,10,false,()=>.5).state.hardware).toBe(1);expect(reset.axiomResetCount).toBe(s.axiomResetCount);
 });
 it('technically completes two automatic cycles with prepared Commercialization 250, not natural progression',()=>{
  const start=integrationStart();expectStart(start);expect(start.availableAxioms).toBe(3-BALANCE.axiom.automationCost);expect(exactEconomyValue(start,'lifetimeEligibleCredits').compare(axiomThresholdScientific().multiplyNumber(9).pow(2).multiplyNumber(BALANCE.prestigeBaseRevenue))).toBeGreaterThanOrEqual(0);expect(restore(serialize(start),start.savedAt).error).toBeUndefined();
  const first=advance(start,900,true,()=>.5).state;expect(first.prestigeCount).toBe(start.prestigeCount+1);expectStart(first);expect(first.runStartedAt).toBe(900_000);
  const second=advance(first,900,true,()=>.5).state;expect(second.prestigeCount).toBe(start.prestigeCount+2);expectStart(second);expect(second.runStartedAt).toBe(1_800_000);expect(second.lifetime.taps).toBe(start.lifetime.taps);expect(second.lifetime.hardwareBought).toBeGreaterThan(first.lifetime.hardwareBought);expect(second.telemetry.prestigeHistory.at(-1)?.before.runCreditsEarned).toBeGreaterThan(0);
  expect(second.axiomResetCount).toBe(start.axiomResetCount);expect(second.researchLevels).toEqual(start.researchLevels);expect(creditRateScientific(second.hardware,second.level,second).isZero()).toBe(true);
 });
 it('makes identical online/offline decisions, including reload between runs',()=>{
  const start=integrationStart(),online=advance(start,1800,true,()=>.5).state,offline=advance(start,1800,false,()=>.5).state;
  expect(online.prestigeCount).toBe(start.prestigeCount+2);expect(offline.prestigeCount).toBe(online.prestigeCount);expect(offline.exactEconomy).toEqual(online.exactEconomy);expect(offline.hardwareCounts).toEqual(online.hardwareCounts);expect(offline.runStartedAt).toBe(online.runStartedAt);expect(offline.telemetry.prestigeHistory).toEqual(online.telemetry.prestigeHistory);
  const first=advance(start,900,false,()=>.5).state,loaded=restore(serialize(first),first.savedAt);expect(loaded.error).toBeUndefined();const split=advance(loaded.state,900,false,()=>.5).state;expect(split.exactEconomy).toEqual(offline.exactEconomy);expect(split.prestigeCount).toBe(offline.prestigeCount);expect(split.lifetime.hardwareBought).toBe(offline.lifetime.hardwareBought);
 });
 it('caps large jumps and cannot recursively reset at one checkpoint',()=>{
  const start=integrationStart(),short={...start,offlineCapacitySeconds:BALANCE.baseOfflineSeconds},after=advance(short,1e12,false,()=>.5);
  expect(after.report.seconds).toBe(BALANCE.baseOfflineSeconds);expect(after.state.prestigeCount-start.prestigeCount).toBeLessThanOrEqual(Math.floor(BALANCE.baseOfflineSeconds/900));expect(after.state.axiomResetCount).toBe(start.axiomResetCount);expect(after.state.lifetime.taps).toBe(0);expect(after.state.credits).toBeGreaterThanOrEqual(0);
 });
 it('provides concrete German and English restart status',()=>{
  expect(automaticRestartText(true,'de')).toBe('Automatischer Neustart bereit');expect(automaticRestartText(false,'en')).toBe('Automatic restart requires an enabled shopping agent');expect(prestigeAgentReasonText('training-active','en')).toBe('Waiting for training');
 });
});
