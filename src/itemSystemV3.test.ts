import {advanceTo} from './simulation';
import {describe,it,expect} from 'vitest';
import {BALANCE,newGame,computeFactors,computeRateScientific,creditRateScientific,dataRateScientific,hardwareIds,trainingRate,type GameState,type ItemTypeId,type Item} from './economy';
import {trainingStrength,progressionResearchSpeed,knowledgeRate,computeLog} from './progression';
import {createItem,equip} from './inventory';
import {serialize} from './storage';
import {ScientificNumber as S} from './scientificNumber';
import {newItemSystemV3,itemStrengthV3,itemSoftcapV3,itemLensFactorV3,itemV3Snapshot,itemCombinationsV3,withoutItemV3Equipment,itemBaseFactorV3,itemHardwareClassesV3,itemWorkFactorV3,recordItemProductionV3,resetItemProductionV3} from './itemSystemV3';
const item=(rarity:Item['rarity']='common',level=1,forge=0):Item=>({id:'reference',type:'quantum-chip',rarity,level,forge,locked:false});
/** Explicit prepared mathematical fixture, not a natural campaign. */
function prepared(types:ItemTypeId[],H=1000,rarity:Item['rarity']='common',level=1,forge=0):GameState{
 let s={...newGame(1000,'item-v3-prepared'),itemSystemV3:newItemSystemV3()};
 s={...s,hardwareCounts:{...s.hardwareCounts,calculator:H},hardware:H,discovered:H?['calculator']:[]};
 for(const type of types){s=createItem(s,type,rarity) as typeof s;const i=s.inventory.at(-1)!;s={...s,inventory:s.inventory.map(it=>it.id===i.id?{...it,level,forge}:it)};s=equip(s,i.id) as typeof s;}
 return s;
}
const ratio=(after:S,before:S)=>after.divide(before).toNumber();
describe('Item V3 actual production consumers (prepared states)',()=>{
 it('retains original rules and storage until a complete V3 migration is enabled',()=>{
  const s=prepared(['quantum-chip']);expect(()=>serialize(s)).toThrow('migration');const original=withoutItemV3Equipment(s);expect(serialize(original)).toContain('"version":64');expect(newGame().itemSystemV3).toBeUndefined();
 });
 it('records actual data/knowledge and only credited time once per timeline interval',()=>{
  let s=prepared(['entropy-sink','memory-crystal']);s={...s,cycleINTEarned:1000,unspentINT:1000,totalINTEarned:1000,exactEconomy:{...s.exactEconomy,cycleINTEarned:S.from(1000).toJSON(),unspentINT:S.from(1000).toJSON(),totalINTEarned:S.from(1000).toJSON()},progression:{...s.progression,lab:true,entitlement:S.from(1000).toJSON()}};
  const initialData=dataRateScientific(s),initialKnowledge=knowledgeRate(s),end=s.savedAt+30000;
  const first=advanceTo(s,s.savedAt+29000,true,()=>.5);
  expect(S.fromJSON(first.state.itemSystemV3!.dataProduced).divide(initialData.multiplyNumber(29)).toNumber()).toBeCloseTo(1,11);
  expect(S.fromJSON(first.state.itemSystemV3!.knowledgeProduced).divide(initialKnowledge.multiplyNumber(29)).toNumber()).toBeCloseTo(1,11);
  const result=advanceTo(s,end,true,()=>.5);
  expect(S.fromJSON(result.state.itemSystemV3!.dataProduced).divide(S.fromJSON(result.report.exactData)).toNumber()).toBeCloseTo(1,11);
  // This first call crosses the persistent 30-second boundary at t=30000;
  // the remaining second uses the next snapshot, not newly produced E inside
  // the preceding interval. Both rates are finite and grow only next interval.
  expect(S.fromJSON(result.state.itemSystemV3!.dataProduced).compare(initialData.multiplyNumber(29))).toBeGreaterThanOrEqual(0);
  expect(S.fromJSON(result.state.itemSystemV3!.knowledgeProduced).compare(initialKnowledge.multiplyNumber(29))).toBeGreaterThanOrEqual(0);
  expect(result.state.itemSystemV3!.runMinutes).toBeCloseTo(.5,12);
  const repeated=advanceTo(result.state,end,true,()=>.5);
  expect(repeated.state.itemSystemV3).toEqual(result.state.itemSystemV3);
  const offline=advanceTo(s,s.savedAt+86400000,false,()=>.5);
  expect(offline.state.itemSystemV3!.runMinutes).toBeCloseTo(offline.report.seconds/60,9);
  expect(offline.report.lostSeconds).toBeGreaterThan(0);
 });
 it('resets run counters independently from axiom-cycle production and preserves discovery',()=>{
  const s=recordItemProductionV3(prepared([]),120,S.from(200),S.from(30));
  s.itemSystemV3={...s.itemSystemV3!,componentsProduced:S.from(40).toJSON(),axiomDiscovered:true,axiomDiscoveryAt:1000};
  const run=resetItemProductionV3(s,'prestige');expect(run.itemSystemV3!.dataProduced).toEqual(S.zero().toJSON());expect(run.itemSystemV3!.runMinutes).toBe(0);
  expect(run.itemSystemV3!.knowledgeProduced).toEqual(S.from(30).toJSON());expect(run.itemSystemV3!.componentsProduced).toEqual(S.from(40).toJSON());
  const cycle=resetItemProductionV3(run,'axiom');expect(cycle.itemSystemV3!.knowledgeProduced).toEqual(S.zero().toJSON());expect(cycle.itemSystemV3!.componentsProduced).toEqual(S.zero().toJSON());expect(cycle.itemSystemV3!.axiomDiscovered).toBe(true);
  expect(s.itemSystemV3!.runMinutes).toBe(2);expect(()=>recordItemProductionV3(s,-1,S.zero(),S.zero())).toThrow();
 });
 it('computes strength exactly and rejects invalid inputs instead of taking absolute values',()=>{
  expect(itemStrengthV3(item())).toEqual({P:1,Q:1});expect(itemStrengthV3(item('mythic',69,20)).P).toBeCloseTo(3.7632,12);expect(itemStrengthV3(item('mythic',69,20)).Q).toBeCloseTo(1.9398969045,9);
  for(const bad of [item('common',0),item('common',70),item('common',1,-1),item('common',1,21)])expect(()=>itemStrengthV3(bad)).toThrow();expect(()=>itemSoftcapV3(S.from(1),-1)).toThrow();
 });
 for(const [H,common,mythic]of [[0,3,62.446],[100,5.045,171.190],[1000,18.120,2044.789],[10000,95.579,51479.619],[1000000,3000.225,41234107.851]]){
  it(`applies quantum H=${H} to real computeFactors, no secondary or tertiary effects`,()=>{
   for(const[r,l,f,expected]of [['common',1,0,common],['mythic',69,20,mythic]] as const){const s=prepared(['quantum-chip'],H,r,l,f),unique=(computeFactors(s).itemV3 as S).divide(S.from(itemBaseFactorV3(s,'processor')));expect(Math.abs(unique.toNumber()/expected-1)).toBeLessThan(0.0001);if(H>0)expect(ratio(computeRateScientific(H,s),computeRateScientific(H,withoutItemV3Equipment(s)))) .toBeCloseTo(unique.toNumber()*itemBaseFactorV3(s,'processor'),7);}
  });
 }
 for(const [M,neural,tensor]of [[0,3,3],[25,8.173,6],[100,20.428,15],[1000,120.387,123]])it(`uses M=${M} in real neural/tensor production`,()=>{
  for(const[type,expected]of [['neural-asic',neural],['tensor-core',tensor]] as const){const initial=prepared([type]),s={...initial,qualityLevel:M};const plain=withoutItemV3Equipment(s),a=type==='neural-asic'?creditRateScientific(s.hardware,s.level,s,0,false):computeRateScientific(s.hardware,s),b=type==='neural-asic'?creditRateScientific(plain.hardware,plain.level,plain,0,false):computeRateScientific(plain.hardware,plain),base=itemBaseFactorV3(s,'processor');expect(Math.abs(ratio(a,b)/base/expected-1)).toBeLessThan(.0001);}
 });
 it('replaces old combination and rarity effects, with pair benefit exactly once',()=>{
  const s=prepared(['quantum-chip','tensor-core']),withoutTensor={...s,equipped:{processor:s.equipped.processor}};
  expect(itemCombinationsV3(s).find(c=>c.id==='compute-network')?.pair).toBe(true);
  expect(ratio(computeRateScientific(s.hardware,s),computeRateScientific(s.hardware,withoutTensor))).toBeCloseTo(15,10);
  const banned={...s,retention:{...s.retention,activeRun:{id:'no-items'} as never}};
  expect(itemBaseFactorV3(banned,'processor')).toBe(1);expect(itemCombinationsV3(banned).every(c=>!c.pair)).toBe(true);
  expect(ratio(computeRateScientific(banned.hardware,banned),computeRateScientific(banned.hardware,withoutItemV3Equipment(banned)))).toBeCloseTo(1,10);
 });
 it('data production uses F without counting a project twice',()=>{
  const initial=prepared(['data-prism']),s={...initial,researchLevels:{...initial.researchLevels,computeOptimization:5,blueprints:1} as GameState['researchLevels'],completedResearch:['blueprints'] as GameState['completedResearch']};
  expect(itemV3Snapshot(s).F.toNumber()).toBe(6);const plain=withoutItemV3Equipment(s);expect(ratio(dataRateScientific(s),dataRateScientific(plain))).toBeCloseTo(4.8,10);
 });
 it('wallet spending never decreases production counters and huge stocks remain scientific',()=>{
  const s=prepared(['memory-crystal']);s.itemSystemV3!.dataProduced=S.fromString('1e1000').toJSON();s.data=100;const a=creditRateScientific(s.hardware,s.level,s,0,false);expect(creditRateScientific(s.hardware,s.level,{...s,data:0},0,false).compare(a)).toBe(0);
  const e=prepared(['entropy-sink']);e.itemSystemV3!.knowledgeProduced=S.fromString('1e1000').toJSON();expect(Number.isFinite(computeRateScientific(e.hardware,e).log10())).toBe(true);
  expect(itemLensFactorV3(S.fromString('1e1000'),item()).log10()).toBeCloseTo(20,12);
 });
 it('softcap is continuous, grows beyond threshold and handles huge inputs without clamp',()=>{
  expect(itemSoftcapV3(S.from(240),240).toNumber()).toBe(240);expect(itemSoftcapV3(S.from(240.000001),240).toNumber()).toBeGreaterThan(240);expect(itemSoftcapV3(S.fromString('1e1000'),240).log10()).toBeCloseTo(501.1901056208558,9);
 });
 it('production evaluation is pure and deterministic',()=>{
  const s=prepared(['quantum-chip','tensor-core','data-prism']);const before=JSON.stringify(s);const values=Array.from({length:3},()=>[computeRateScientific(s.hardware,s).toJSON(),creditRateScientific(s.hardware,s.level,s).toJSON(),dataRateScientific(s).toJSON()]);expect(values[1]).toEqual(values[0]);expect(values[2]).toEqual(values[0]);expect(JSON.stringify(s)).toBe(before);expect(hardwareIds).toHaveLength(Object.keys(s.hardwareCounts).length);
 });
 it('strengthens exactly the first three classes, and Sparse ranks local production stably',()=>{
  const s=prepared(['legacy-controller']);s.hardwareCounts={...s.hardwareCounts,calculator:25,sbc:25,pc:25,gpu:25};s.hardware=100;
  const legacy=itemHardwareClassesV3(s),plain=itemHardwareClassesV3({...s,equipped:{}});for(let i=0;i<3;i++)expect(ratio(legacy[i],plain[i])).toBeCloseTo(10,12);expect(ratio(legacy[3],plain[3])).toBe(1);
  const sparse=prepared(['sparse-decoder']);sparse.hardwareCounts={...sparse.hardwareCounts,calculator:1,sbc:1,pc:1,gpu:1};const a=itemHardwareClassesV3(sparse),b=itemHardwareClassesV3({...sparse,equipped:{}});expect(ratio(a[0],b[0])).toBe(1);for(let i=1;i<=3;i++)expect(ratio(a[i],b[i])).toBe(2.5);
 });
 it('couples only an already valid link and router counts connections rather than units',()=>{
  const coupled=prepared(['quantum-coupler']);coupled.hardwareCounts={...coupled.hardwareCounts,calculator:25,sbc:30};const prior=itemHardwareClassesV3(coupled);const noItems=itemHardwareClassesV3({...coupled,equipped:{}});expect(prior[1].compare(noItems[1])).toBe(0);
  coupled.completedResearch=['distributedInference'];const plain=itemHardwareClassesV3({...coupled,equipped:{}});expect(ratio(itemHardwareClassesV3(coupled)[1],plain[1])).toBeCloseTo(32/31,12);
  const router=prepared(['inference-router']);router.hardwareCounts={...coupled.hardwareCounts};router.completedResearch=['distributedInference'];expect((computeFactors(router).itemV3 as S).toNumber()).toBeCloseTo(1.21,12);
 });
 it('photonic production applies to Compute and Data during overdrive, never again to revenue',()=>{
  const s=prepared(['photonic-matrix']),active={...s,overclock:{...s.overclock,activeUntil:s.savedAt+10000}};
  const computeRatio=ratio(computeRateScientific(active.hardware,active),computeRateScientific(s.hardware,s));expect(computeRatio).toBeCloseTo(3,12);
  // Data also follows the unchanged users^0.5 relationship, then its own x3.
  expect(ratio(dataRateScientific(active),dataRateScientific(s))).toBeCloseTo(3*3**BALANCE.progression.formula.dataPower,12);
  expect(ratio(creditRateScientific(active.hardware,active.level,active,active.savedAt,false),creditRateScientific(s.hardware,s.level,s,s.savedAt,false))).toBeCloseTo(3,12);
 });
 it('adapts the actual logarithmic training softcap monotonically and continuously',()=>{
  const distill=prepared(['distillation-module']),curriculum=prepared(['curriculum-module']);let both=prepared(['distillation-module','curriculum-module']);both={...both,nodes:['W02']};both=equip(both,both.inventory[1].id,'coreAux');
  for(const s of [distill,curriculum,both]){let previous=0;for(let n=0;n<=1000;n+=.1){const value=trainingStrength(n,s);expect(value).toBeGreaterThanOrEqual(previous-1e-10);expect(value).toBeLessThanOrEqual(n+1e-9);previous=value;}expect(trainingStrength(1000,s)).toBeGreaterThan(trainingStrength(1000,withoutItemV3Equipment(s)));}
  const threshold=75;expect(trainingStrength(threshold,both)).toBe(threshold);expect(trainingStrength(threshold+1e-6,both)-threshold).toBeCloseTo(1e-6,10);
 });
 it('uses actual learning/research/knowledge consumers, with no-items disabling the entire layer',()=>{
  const learning=prepared(['photonic-array','logic-seed','lab-drone']);expect(itemWorkFactorV3(learning,false)).toBe(3);expect(itemWorkFactorV3(learning,true)).toBeCloseTo(1.65,12);
  const uncombined={...learning,equipped:{core:learning.equipped.core}};expect(trainingRate(learning.hardware,learning)/trainingRate(uncombined.hardware,uncombined)).toBeCloseTo(1.5*computeLog(learning)/computeLog(uncombined),12);
  const cycles=prepared(['cycle-observatory']);const late={...cycles,axiomResetCount:100};expect(progressionResearchSpeed(late)/progressionResearchSpeed(cycles)).toBeCloseTo(101**.75,10);
  const lab=prepared(['entropy-sink','model-echo-core','darklab-resonator']);lab.progression={...lab.progression,lab:true,bestINT:S.from(1e6).toJSON()};expect(knowledgeRate(lab).compare(knowledgeRate(withoutItemV3Equipment(lab)))).toBeGreaterThan(0);
 });
});
