import {predecessorProjection} from './testSupport/protectedProgression';
import {withChallengeAccess} from './testSupport/challengeAccount';
import dataBaseline from './testSupport/dataAnalysisBaseline.json';
import {describe,it,expect} from 'vitest';
import {createHash} from 'node:crypto';
import {BALANCE,newGame,addCredits,addDataScientific,buyHardwareClass,computeRateScientific,computeFactors,equipmentSlotCount,axiomThresholdScientific,passiveCircuitRate,creditRateScientific,dataRateScientific,dataSynergyScientific,averageDataSynergy,exactEconomyValue,hardwarePurchasePreview,productionBreakdown,registerTap,axiomEconomyValue,creditMultiplierFromAxiomsScientific,type GameState,type PrestigeUpgradeId} from './economy';
import {prestige,buyNode,axiomReset,buyAxiomUpgrade,prestigePreview,axiomPreview,axiomRewardScientific} from './prestige';
import {createItem,equip,buyEquipmentSlot} from './inventory';
import {advance,advanceTo} from './simulation';
import {queueExperiment,completeExperiment} from './experiments';
import {serialize,restore,importGame,SAVE_VERSION} from './storage';
import {createLifecycleGate} from './mobileIntegration';
import {startRunChallenge,abortRunChallenge} from './retention';
import {claimAchievement} from './achievements';
import {claimMission,rollPeriods} from './missions';
import {ScientificNumber as SN} from './scientificNumber';
const loaded=(s:GameState)=>{const r=restore(serialize(s),s.savedAt);expect(r.error).toBeUndefined();return r.state;};
const cycle=(s:GameState,value=axiomThresholdScientific())=>({...s,cycleINTEarned:value.toNumber(),exactEconomy:{...s.exactEconomy,cycleINTEarned:value.toJSON()}});
const firstPrestige=()=>prestige(addCredits(newGame(0,'technical-regressions'),1e20));
const stocked=(s:GameState,count:number)=>{for(const type of (['quantum-chip','tensor-core','field-scanner'] as const).slice(0,count))s=createItem(s,type,'common');for(const item of s.inventory)s=equip(s,item.id);return s;};
const archive=()=>({...buyAxiomUpgrade({...newGame(0),axioms:5,availableAxioms:5,totalAxiomsEarned:5},'axiomArchive'),discovered:['calculator','sbc'] as GameState['discovered']});
const found=(s:GameState)=>advance(s,(1-s.passiveCircuitProgress)/passiveCircuitRate(s)+.001,false,()=>.1).state;
describe('confirmed P0 permanent equipment sockets',()=>{
 it('preserves protected technical parameters under the authorized Data/analysis contract',()=>{for(const key of ['hardware','itemRecipes','itemCombinations','components','componentSources','experimentRewards','axiom','researchCategories'] as const)expect(predecessorProjection(BALANCE[key],dataBaseline.parameters[key],key)).toEqual(dataBaseline.parameters[key]);});
 it.each([2,3])('keeps %s regularly purchased Credit sockets across prestige/Axiom/save',count=>{
  let s=addCredits(firstPrestige(),1e21);for(let target=2;target<=count;target++)s=buyEquipmentSlot(s,target as 2|3);s=stocked(s,count);expect(Object.keys(s.equipped)).toHaveLength(count);expect(buyEquipmentSlot(s,count as 2|3)).toBe(s);
  expect(prestigePreview(s).kept.equipmentSlots).toBe(count);const p=prestige(s);expect(equipmentSlotCount(p)).toBe(count);const ready=cycle(p);expect(axiomPreview(ready).kept.equipmentSlots).toBe(count);const reset=loaded(axiomReset(ready));expect(equipmentSlotCount(reset)).toBe(count);expect(reset.equipped).toEqual(s.equipped);expect(reset.inventory).toEqual(s.inventory);expect(reset.nodes).toEqual([]);
 });
 it.each([2,3])('retains %s sockets from actual INT node purchases without retaining other node effects',count=>{
  let s={...firstPrestige(),achievementPoints:100};for(const id of ['manufacturing1','manufacturing2','manufacturing3','manufacturing4','manufacturing5'].slice(0,count===2?1:5))s=buyNode(s,id as PrestigeUpgradeId);expect(equipmentSlotCount(s)).toBe(count);expect(s.purchasedEquipmentSlots).toBe(0);s=stocked(s,count);
  const reset=loaded(axiomReset(cycle(s)));expect(equipmentSlotCount(reset)).toBe(count);expect(reset.equipped).toEqual(s.equipped);expect(reset.nodes).toEqual([]);expect(reset.inventory).toEqual(s.inventory);expect(reset.unlockedEquipmentSlots).toBe(count);
 });
 it('charges only the remaining Credit socket after a node unlock and never grants a fourth',()=>{const s=addCredits(buyNode(firstPrestige(),'manufacturing1'),1e21),paid=buyEquipmentSlot(s,3);expect(exactEconomyValue(s,'credits').subtract(exactEconomyValue(paid,'credits')).divideNumber(BALANCE.equipmentSlotCosts[1]).toNumber()).toBeCloseTo(1,12);expect(equipmentSlotCount(paid)).toBe(3);expect(buyEquipmentSlot(paid,3)).toBe(paid);expect(buyEquipmentSlot(paid,4 as 3)).toBe(paid);});
 it('migrates historical node/paid/compatible equipped evidence separately without inventing items',()=>{
  const s=stocked(buyNode(firstPrestige(),'manufacturing1'),2),old:any={...s,nodes:[]};delete old.unlockedEquipmentSlots;delete old.archivePassiveFindCount;const r=restore(JSON.stringify({version:42,state:old}),0);expect(r.error).toBeUndefined();expect(r.state.unlockedEquipmentSlots).toBe(2);expect(r.state.inventory).toEqual(JSON.parse(JSON.stringify(old.inventory)).map((i:any)=>({...i,level:i.level+1})));expect(r.state.archivePassiveFindCount).toBe(0);
  const challenge=startRunChallenge(withChallengeAccess(s),'no-items'),legacy:any=JSON.parse(serialize(challenge)).state;delete legacy.unlockedEquipmentSlots;delete legacy.archivePassiveFindCount;delete legacy.challengeSession.main.unlockedEquipmentSlots;delete legacy.challengeSession.main.archivePassiveFindCount;const c=restore(JSON.stringify({version:42,state:legacy}),0);expect(c.error).toBeUndefined();expect(equipmentSlotCount(c.state)).toBe(2);expect(equipmentSlotCount(c.state.challengeSession!.main)).toBe(2);expect(abortRunChallenge(c.state).inventory).toEqual(JSON.parse(JSON.stringify(s.inventory)).map((i:any)=>({...i,level:i.level+1})));
  old.equipped.core='missing';expect(restore(JSON.stringify({version:42,state:old}),0).error).toBeDefined();
 });
 it('requires valid current permanent ownership/counter fields and protects damaged originals',()=>{for(const field of ['unlockedEquipmentSlots','archivePassiveFindCount','exactAxioms'])for(const value of [undefined,-1,7,.5,'2']){const s={...newGame(0),[field]:value};expect(()=>importGame(JSON.stringify({version:SAVE_VERSION,state:s}))).toThrow();}});
});
describe('confirmed P1 active actions and lifecycle',()=>{
 it('accounts the same foreground time with ticks or frequent actual purchases/taps and preserves mission/achievement/drop progress',()=>{
  const ready={...rollPeriods(newGame(0),0),lifetime:{...newGame(0).lifetime,activeSeconds:570},worldDropProgress:BALANCE.worldDropSeconds-30};
  const plain=advanceTo(ready,30000,true,()=>.25).state;let busy=ready;const gate=createLifecycleGate(false,()=>{},()=>{});
  for(let at=100;at<=30000;at+=100){busy=advanceTo(busy,at,gate.active,()=>.25).state;busy=buyHardwareClass(busy,'calculator',1);if(at%500===0)busy=registerTap(busy,busy.savedAt);}
  busy=advanceTo(busy,30000,gate.active).state;expect(busy.lifetime.activeSeconds).toBeCloseTo(600,9);expect(busy.worldDropProgress).toBeCloseTo(plain.worldDropProgress,9);expect(busy.lootDrops).toEqual(plain.lootDrops);expect(claimAchievement(busy,'active',0).achievementClaims).toContain('active:0');
  const task=busy.missions.daily.tasks.find(t=>t.metric==='activeSeconds');expect(task).toBeDefined();expect(claimMission(busy,'daily',task!.id).missions.daily.tasks.find(t=>t.id===task!.id)!.claimed).toBe(true);
 });
 it('settles the last foreground fraction before background and coalesces browser/native signals without double time',()=>{
  let s=newGame(0),now=0;const gate=createLifecycleGate(false,()=>{s=advanceTo(s,now,true).state},()=>{s=advanceTo(s,now,false).state});
  now=1250;expect(gate.background()).toBe(true);expect(gate.background()).toBe(false);expect(s.lifetime.activeSeconds).toBe(1.25);now=4250;s=advanceTo(s,now,gate.active).state;expect(s.lifetime.activeSeconds).toBe(1.25);now=6250;expect(gate.foreground()).toBe(true);expect(gate.foreground()).toBe(false);now=7000;s=advanceTo(s,now,gate.active).state;expect(s.lifetime.activeSeconds).toBe(2);expect(s.savedAt).toBe(7000);expect(s.worldDropProgress).toBe(2);
 });
});
describe('confirmed P1 highest discovered integration tier',()=>{
 it.each([['cloud','calculator'],['calculator','cloud'],['orbital','pc','cloud']] as const)('uses highest discovery for purchase order %s',(...order)=>{
  let s={...addCredits(newGame(0),1e100),researchLevels:{...newGame(0).researchLevels,hardwareIntegration:2}};
  for(const id of order){const before=computeRateScientific(s.hardware,s),preview=hardwarePurchasePreview(s,id,1);expect(preview.allowed).toBe(true);s=buyHardwareClass(s,id,1);const after=computeRateScientific(s.hardware,s);expect(after.compare(before)).toBeGreaterThan(0);expect(after.subtract(before).divide(preview.computeGain).toNumber()).toBeCloseTo(1,11);expect(productionBreakdown(s).factors.compute.hardwareIntegration.toJSON()).toEqual(computeFactors(s).hardwareIntegration.toJSON());}
  const tier=order.includes('orbital' as never)?4:1;expect(computeFactors(s).hardwareIntegration.toNumber()).toBeCloseTo(1.12**(tier*2),12);
 });
});
describe('confirmed P1 independent Axiom archive counter',()=>{
 it('duplicates exactly the fourth passive outcome without using analysis fractions or extra rolls, including reload',()=>{
  let s={...archive(),componentRemainder:.75};for(let n=1;n<=8;n++){const before=s.components;s=found(s);expect(s.components-before).toBe(n%4===0?2:1);expect(s.componentRemainder).toBe(.75);expect(s.archivePassiveFindCount).toBe(n%4);s=loaded(s);}
 });
 it('analyses before and between finds do not alter the passive sequence; legacy fractions remain and counter starts at zero',()=>{
  let s={...archive(),componentRemainder:.25,data:1000000};const old:any={...s};delete old.archivePassiveFindCount;delete old.unlockedEquipmentSlots;const migrated=restore(JSON.stringify({version:42,state:old}),0);expect(migrated.error).toBeUndefined();expect(migrated.state.componentRemainder).toBe(.25);expect(migrated.state.archivePassiveFindCount).toBe(0);
  const analyse=(state:GameState)=>{const started=queueExperiment(state,'hardware',state.savedAt,'short');expect(started.experiments.active).not.toBeNull();const done=completeExperiment(started,started.experiments.active!.endsAt,()=>.25);expect(done.archivePassiveFindCount).toBe(state.archivePassiveFindCount);return done;};s=analyse(migrated.state);
  for(let n=1;n<=4;n++){if(n===3)s=loaded(analyse(s));const before=s.components;s=found(s);expect(s.components-before).toBe(n===4?2:1);}
 });
 it('online/offline paths produce the same archive outcomes and counter',()=>{const s=archive(),seconds=4/passiveCircuitRate(s)+.001,a=advance(s,seconds,true,()=>.1).state,b=advance(s,seconds,false,()=>.1).state;expect(a.componentInventory).toEqual(b.componentInventory);expect(a.components).toBe(5);expect(a.archivePassiveFindCount).toBe(0);expect(a.componentRemainder).toBe(b.componentRemainder);});
});
const producing=()=>buyHardwareClass(addCredits(newGame(0),1e6),'calculator',1);
const huge=()=>addDataScientific({...producing(),researchLevels:{...newGame(0).researchLevels,dataGeneration:20000}},SN.fromString('1e400'));
// Comparison uses dimensionless ratios. Quadrature target 1e-12, binary64
// logarithmic powers at exponent ~6000 lose ~1e-11 relative precision.
const near=(a:SN,b:SN,tolerance=2e-10)=>expect(Math.abs(a.divide(b).toNumber()-1)).toBeLessThan(tolerance);
describe('confirmed P2 scientific integration and previews',()=>{
 it('does not round a fractional Axiom balance up to a price',()=>{const n=.9999999999999998,s={...newGame(0),axioms:n,availableAxioms:n,totalAxiomsEarned:n};expect(buyAxiomUpgrade(s,'axiomResonance')).toBe(s);const restored=loaded(s);expect(axiomEconomyValue(restored,'available').toJSON()).toEqual(SN.from(n).toJSON());expect(buyAxiomUpgrade(restored,'axiomResonance')).toBe(restored);});
 it('integrates a changing rate with the same instantaneous lifetime Data formula, not a constant start rate',()=>{
  const s=producing(),duration=1,rate=creditRateScientific(s.hardware,s.level,s),gain=SN.fromJSON(advance(s,duration,false).report.exactCredits);expect(gain.compare(rate.multiplyNumber(duration))).toBeGreaterThan(0);
  let reference=SN.zero();const n=10000,step=duration/n,data=dataRateScientific(s);for(let i=0;i<n;i++){const at=addDataScientific(s,data.multiplyNumber((i+.5)*step));reference=reference.add(creditRateScientific(at.hardware,at.level,at).multiplyNumber(step));}near(gain,reference,2e-8);
  const split=advance(loaded(advance(s,.4,false).state),.6,false).state;near(exactEconomyValue(split,'credits'),exactEconomyValue(advance(s,1,false).state,'credits'),1e-11);
 });
 it('retains scientific interval gains above 1e308 and matches split/reloaded elapsed time',()=>{
  const s=huge(),instant=creditRateScientific(s.hardware,s.level,s);expect(instant.exponent).toBeGreaterThan(308);const a=advance(s,1,false),part=advance(loaded(advance(s,.4,false).state),.6,false);expect(a.state.savedAt).toBe(1000);const expected=instant.divide(dataSynergyScientific(s)).multiply(averageDataSynergy(s,dataRateScientific(s)));near(SN.fromJSON(a.report.exactCredits),expected);near(exactEconomyValue(part.state,'credits'),exactEconomyValue(a.state,'credits'));expect(loaded(a.state).exactEconomy).toEqual(a.state.exactEconomy);
 });
 it('does not overflow native antiderivatives when synergy is enormous but Data is below 1e100',()=>{
  const s=addDataScientific({...producing(),researchLevels:{...newGame(0).researchLevels,dataFlywheel:50000}},SN.fromString('1e50')),r=advance(s,1,false);expect(r.state.savedAt).toBe(1000);near(SN.fromJSON(r.report.exactCredits),creditRateScientific(s.hardware,s.level,s));
 });
 it('integrates a rapidly changing scientific rate without the former 1e100 cutoff',()=>{
  const s={...producing(),researchLevels:{...newGame(0).researchLevels,dataGeneration:4500,computeOptimization:20000}},data=dataRateScientific(s),mean=averageDataSynergy(s,data),end=addDataScientific(s,data);expect(data.exponent).toBeGreaterThan(308);expect(mean.exponent).toBeGreaterThan(308);expect(mean.compare(dataSynergyScientific(s))).toBeGreaterThan(0);expect(mean.compare(dataSynergyScientific(end))).toBeLessThan(0);
  const whole=advance(s,1,false).state,split=advance(loaded(advance(s,.4,false).state),.6,false).state;near(exactEconomyValue(whole,'credits'),exactEconomyValue(split,'credits'));
 });
 it('keeps entitlement, Axiom thresholds, payouts and subsequent production scientific, with finite display projections',()=>{
  const s={...producing(),cycleEligibleCredits:1e300,exactEconomy:{...producing().exactEconomy,cycleEligibleCredits:SN.fromString('1e800').toJSON()}},p=prestigePreview(s);expect(Number.isFinite(p.eligibleRevenueToNextINT)).toBe(true);expect(SN.isValidJSON(p.eligibleRevenueToNextINTExact)).toBe(true);const claimed=prestige(s);expect(exactEconomyValue(claimed,'cycleINTEarned').exponent).toBeGreaterThan(308);
  const preview=axiomPreview(cycle(s,SN.fromString('1e800'))),ready=cycle(s,SN.fromString('1e800')),reward=axiomRewardScientific(ready);expect(Number.isFinite(preview.nextThreshold)).toBe(true);expect(SN.fromJSON(preview.nextThresholdExact).exponent).toBeGreaterThan(308);const reset=loaded(axiomReset(ready));near(axiomEconomyValue(reset,'available'),reward);expect(axiomEconomyValue(reset,'available').exponent).toBeGreaterThan(308);near(creditMultiplierFromAxiomsScientific(reset),reward.multiplyNumber(BALANCE.axiom.creditPerTotal));expect(axiomReset(reset)).toBe(reset);
  const bought=loaded(buyAxiomUpgrade(reset,'axiomArchive'));expect(bought.axiomUpgradeLevels.axiomArchive).toBe(1);expect(axiomEconomyValue(bought,'total').toJSON()).toEqual(axiomEconomyValue(reset,'total').toJSON());
 });
});
