import {describe,it,expect} from 'vitest';
import {BALANCE,newGame,hardwareIds,computeRateScientific,creditRateScientific,addCreditsScientific,exactEconomyValue,researchQuote,dataRateScientific,type GameState} from './economy';
import {ScientificNumber as S} from './scientificNumber';
import {newItemSystemV3,itemBaseFactorV3,itemAbilityStrengthV3,itemStrengthV3} from './itemSystemV3';
import {prestigeHardwareFirstV3,prestigeHardwareSecondV3,prestigeCreditHardwareV3,prestigeINTWeightV3,prestigeGainExponentV3,prestigeCreditExponentV3,axiomDiscoveryEligibleV3,discoverAxiomsV3} from './prestigeV3';
import {itemAmplifier,discoverProgression,progressionResearchSpeed,integrationLimit,modelCore} from './progression';
import {createItem,equip} from './inventory';
import {axiomRewardV2,buyProgressionNode,buyProgressionAxiom,progressionAgent,axiomResetV2} from './progressionReset';
const prepared=(nodes:string[]=[]):GameState=>({...newGame(1000,'prepared-prestige-v3'),itemSystemV3:newItemSystemV3(),nodes});
describe('Joint prestige/item V3 actual consumers (prepared)',()=>{
 it('keeps all existing IDs and purchase costs',()=>{
  expect(Object.keys(BALANCE.progression.nodes)).toHaveLength(60);expect(Object.keys(BALANCE.progression.axioms)).toHaveLength(24);
  const s=prepared(),price=BALANCE.progression.nodes.H06.cost;const funded={...s,unspentINT:price,exactEconomy:{...s.exactEconomy,unspentINT:S.from(price).toJSON()}};const bought=buyProgressionNode(funded,'H06');expect(bought.nodes).toContain('H06');expect(exactEconomyValue(bought,'unspentINT').isZero()).toBe(true);expect(buyProgressionNode(bought,'H06')).toBe(bought);
 });
 it('removes H07/H09 caps and applies H06/H10 once to raw hardware',()=>{
  const base=prepared(),rich={...base,hardwareCounts:{...base.hardwareCounts,calculator:1000000},hardware:1000000};
  const h6={...rich,nodes:['H06']};expect(computeRateScientific(h6.hardware,h6).divide(computeRateScientific(rich.hardware,rich)).toNumber()).toBeCloseTo(3,12);
  expect(prestigeHardwareFirstV3({...rich,nodes:['H07']}).toNumber()).toBeCloseTo(Math.sqrt(10001),12);
  const all={...rich,hardwareCounts:Object.fromEntries(hardwareIds.map(id=>[id,500])) as GameState['hardwareCounts'],nodes:['H09']};expect(prestigeHardwareSecondV3(all).toNumber()).toBeCloseTo(5*1.15**15,10);
  const h10={...rich,nodes:['H10']};expect(prestigeHardwareSecondV3(h10).compare(S.from(10))).toBeGreaterThan(0);expect(computeRateScientific(h10.hardware,h10).divide(computeRateScientific(rich.hardware,rich)).divide(prestigeHardwareSecondV3(h10)).toNumber()).toBeCloseTo(1,12);
 });
 it('gives H08 x8.5 at fifteen classes and T07 grows beyond the old x1.5',()=>{
  const base=prepared(['H08']);const all={...base,hardwareCounts:Object.fromEntries(hardwareIds.map(id=>[id,1])) as GameState['hardwareCounts']};expect(prestigeCreditHardwareV3(all).toNumber()).toBe(8.5);
  expect(prestigeCreditHardwareV3({...all,nodes:['T07'],qualityLevel:1000}).toNumber()).toBeCloseTo(101**.75,10);
  expect(creditRateScientific(all.hardware,all.level,all).divide(creditRateScientific(all.hardware,all.level,{...all,nodes:[]})).toNumber()).toBeCloseTo(8.5,10);
 });
 it('keeps raw P/Q apart from W10 and x18 base amplification',()=>{
  let s=prepared(['W05','W09','W10']);s=createItem(s,'quantum-chip','common');s=equip(s,s.inventory[0].id);const item=s.inventory[0];expect(itemStrengthV3(item)).toEqual({P:1,Q:1});expect(itemAbilityStrengthV3(s,item)).toEqual({P:1.15,Q:1.05});expect(itemAmplifier(s)).toBe(18);expect(itemBaseFactorV3(s,'processor')).toBeCloseTo(2.8,12);
  const integrated={...s,integrationLevel:100};expect(itemAmplifier(integrated)).toBeCloseTo(18*1.01**100,10);const perfect={...integrated,nodes:[...integrated.nodes,'T10']};expect(itemAmplifier(perfect)).toBeCloseTo(18*1.015**100,10);
 });
 it('uses multiplicative future INT weights and never revalues earned entitlement',()=>{
  const s=prepared(),earned=addCreditsScientific(s,S.fromString('1e12'));const entitlement=earned.progression.entitlement;
  const upgraded={...earned,nodes:['I02','I03','I04','I09','I10'],qualityLevel:100,researchLevels:{...earned.researchLevels,dataGeneration:20},runMilestoneEdges:['calculator:10','calculator:25']};
  expect(upgraded.progression.entitlement).toEqual(entitlement);expect(prestigeINTWeightV3(upgraded).toNumber()).toBeCloseTo(Math.sqrt(1.2)*Math.sqrt(5)*Math.sqrt(2)*5,10);
  const after=addCreditsScientific(upgraded,S.from(1000));expect(S.fromJSON(after.progression.entitlement).compare(S.fromJSON(entitlement))).toBeGreaterThan(0);
  expect(S.fromJSON(earned.progression.entitlement).toJSON()).toEqual(entitlement);
 });
 it('reaches precisely the new gain/credit exponent contracts',()=>{
  const s={...prepared(['I05','I10']),axiomUpgradeLevels:{...newGame(0).axiomUpgradeLevels,A01:5}};
  expect(prestigeGainExponentV3(s)).toBeCloseTo(.73,14);expect(prestigeCreditExponentV3(s)).toBeCloseTo(.22,14);
 });
 it('charges the new F07 price only for new research starts',()=>{
  const s=prepared(),base=researchQuote(s,'materialAnalysis')!.cost;
  const discounted=researchQuote({...s,nodes:['F07']},'materialAnalysis')!.cost;
  expect(discounted.toNumber()).toBe(Math.ceil(base.toNumber()*.7));
  const normal={...s,itemSystemV3:undefined,nodes:['F07']};
  expect(researchQuote(normal,'materialAnalysis')!.cost.toNumber()).toBe(Math.ceil(base.toNumber()*.85));
 });
 it('counts occupied regular F08 labs, never bought extra labs',()=>{
  const s=prepared(['F01','F04','F08']),job={id:'materialAnalysis' as const,level:1,startedAt:1000,endsAt:1000000,durationSeconds:999,dataCost:0};
  const empty=progressionResearchSpeed(s),busy={...s,purchasedResearchLabs:2,researchLabs:[job,job,job,job,job,job]};
  expect(progressionResearchSpeed(busy)/empty).toBeCloseTo(2,12);
  expect(progressionResearchSpeed({...busy,researchLabs:[job,null,null,null,job,job]})/empty).toBeCloseTo(1.25,12);
  expect(progressionResearchSpeed({...busy,researchLabs:[null,null,null,null,job,job]})/empty).toBeCloseTo(1,12);
 });
 it('uses actual summed research F for F10 data and updated integration limits/coupling',()=>{
  const base=prepared(),s={...base,nodes:['F10'],researchLevels:{...base.researchLevels,dataGeneration:100}};
  expect(dataRateScientific({...s,hardware:100,hardwareCounts:{...s.hardwareCounts,calculator:100}}).divide(dataRateScientific({...s,nodes:[],hardware:100,hardwareCounts:{...s.hardwareCounts,calculator:100}})).toNumber()).toBeCloseTo(5*Math.sqrt(5),11);
  expect(integrationLimit({...base,axiomUpgradeLevels:{...base.axiomUpgradeLevels,A05:3}})).toBe(275);
  const model={...base,integrationLevel:100,axiomUpgradeLevels:{...base.axiomUpgradeLevels,D05:1},progression:{...base.progression,models:{K01:0},active:'K01' as const}};
  expect(modelCore(model)).toBeGreaterThan(modelCore({...model,integrationLevel:0}));
 });
 it('guards hidden axiom purchases and requires a real manual first reset',()=>{
  const s=prepared(),funded={...s,availableAxioms:100,exactAxioms:{...s.exactAxioms,available:S.from(100).toJSON()}};
  expect(buyProgressionAxiom(funded,'A01')).toBe(funded);
  const now=2000000,cycle=S.fromString('1e12').toJSON();
  const ready={...funded,savedAt:now,itemSystemV3:{...newItemSystemV3(),axiomDiscovered:true,axiomDiscoveryAt:1000},cycleINTEarned:1e12,exactEconomy:{...funded.exactEconomy,cycleINTEarned:cycle},axiomUpgradeLevels:{...s.axiomUpgradeLevels,B06:1},progression:{...s.progression,axiomAuto:true,axiomCycleStartedAt:0,known:Object.keys(BALANCE.progression.nodes).slice(0,30)}};
  expect(axiomRewardV2(ready).compare(S.from(1))).toBeGreaterThanOrEqual(0);
  expect(progressionAgent(ready).axiomResetCount).toBe(0);
  const manual=axiomResetV2(ready);expect(manual.axiomResetCount).toBe(1);
  const next={...manual,savedAt:now+2000000,cycleINTEarned:1e12,exactEconomy:{...manual.exactEconomy,cycleINTEarned:cycle}};
  expect(progressionAgent(next).axiomResetCount).toBe(2);
 });
 it('pauses relative prestige automation without a positive reference even at timeout',()=>{
  const s=prepared(['I06','I07']),ready=addCreditsScientific({...s,savedAt:10000000,prestigeAgent:{...s.prestigeAgent,enabled:true,minimumRunMinutes:15},progression:{...s.progression,relative:2,maximumRunSeconds:60,lastPrestige:S.zero().toJSON()}},S.fromString('1e18'));
  expect(progressionAgent(ready).prestigeCount).toBe(0);
  expect(progressionAgent({...ready,progression:{...ready.progression,lastPrestige:S.from(1).toJSON()}}).prestigeCount).toBe(1);
 });
 it('discovers only from actually earned cycle INT and thirty distinct valid purchased nodes',()=>{
  const s=prepared(),nodes=Object.keys(BALANCE.progression.nodes).slice(0,30);let candidate={...s,progression:{...s.progression,known:nodes,entitlement:S.fromString('1e100').toJSON()}};
  expect(axiomDiscoveryEligibleV3(candidate)).toBe(false);expect(axiomRewardV2(candidate).isZero()).toBe(true);
  candidate={...candidate,cycleINTEarned:1000000,exactEconomy:{...candidate.exactEconomy,cycleINTEarned:S.from(1000000).toJSON()}};
  expect(axiomDiscoveryEligibleV3(candidate)).toBe(true);expect(axiomDiscoveryEligibleV3({...candidate,progression:{...candidate.progression,known:Array(30).fill(nodes[0])}})).toBe(false);
  const discovered=discoverAxiomsV3(candidate);expect(discovered.itemSystemV3!.axiomDiscovered).toBe(true);expect(discovered.itemSystemV3!.axiomDiscoveryAt).toBe(candidate.savedAt);expect(discoverAxiomsV3(discovered)).toBe(discovered);
  expect(discovered.credits).toBe(candidate.credits);expect(discovered.axiomResetCount).toBe(0);
  expect(discoverProgression(candidate).itemSystemV3!.axiomDiscovered).toBe(true);
 });
});
