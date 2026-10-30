import {describe,expect,it} from 'vitest';
import {BALANCE,hardwareIds,itemTypes,newGame,computeRateScientific,type GameState,type Item,type ItemTypeId} from './economy';
import {ScientificNumber as S} from './scientificNumber';
import {newItemSystemV3,itemFleetFactorV3,itemLensFactorV3,itemSynthesisCoordinatorFactorV3,itemSynthesisSpeedFactorV3,itemComputeFactorV3} from './itemSystemV3';
import {synthesisSpeed} from './experiments';

/** Isolated, explicitly prepared V3 items. The six new types are not yet in
 * the released acquisition catalog; do not imply ordinary players can get them. */
function base():GameState{
 const g=newGame(1000,'isolated-v3-industrial');
 return {...g,itemSystemV3:newItemSystemV3(),hardwareCounts:{...g.hardwareCounts,calculator:100,sbc:101,pc:99},hardware:300,discovered:['calculator','sbc','pc']};
}
function item(type:string):Item{return{id:'v3-test-'+type,type:type as ItemTypeId,rarity:'common',level:1,forge:0,locked:false};}

describe('V3 industrial item arithmetic and consumers (prepared, not player release)',()=>{
 it('fleet counts currently held classes with >=100 units rather than historical unlocks',()=>{
  const s=base();expect(hardwareIds.filter(id=>s.hardwareCounts[id]>=100)).toEqual(['calculator','sbc']);
  expect(itemFleetFactorV3(s,item('fleet-coordinator')).toNumber()).toBeCloseTo(2*(1+.15*2),12);
  const changed={...s,hardwareCounts:{...s.hardwareCounts,sbc:99}};
  expect(itemFleetFactorV3(changed,item('fleet-coordinator')).toNumber()).toBeCloseTo(2*(1+.15),12);
  expect(itemFleetFactorV3(s,item('fleet-coordinator')).toNumber()).toBeCloseTo(2.6,12);
 });
 it('synthesis coordinator scales only with verified self-produced components',()=>{
  const s=base();
  expect(itemSynthesisCoordinatorFactorV3(s,item('synthesis-coordinator'))).toBeCloseTo(2,12);
  s.itemSystemV3={...s.itemSystemV3!,componentsProduced:S.from(9999).toJSON()};
  const k=Math.log10(10000);
  expect(itemSynthesisCoordinatorFactorV3(s,item('synthesis-coordinator'))).toBeCloseTo(2*Math.pow(1+k/4,.5),12);
  expect(itemSynthesisSpeedFactorV3(s)).toBe(1);
 });
 it('lens powers only pre-global regular hardware Compute and is multiplicative',()=>{
  const raw=S.fromString('1e6'),lens=item('singularity-lens');
  expect(itemLensFactorV3(raw,lens).toNumber()).toBeCloseTo(Math.pow(1e6,.02),12);
  expect(itemLensFactorV3(raw,lens,true).toNumber()).toBeCloseTo(Math.pow(1e6,.03),12);
  expect(itemLensFactorV3(S.from(.01),lens).toNumber()).toBe(1);
 });
 it('normal non-V3 synthesis remains unchanged',()=>{
  const normal=newGame(1000,'non-v3-regression');
  expect(itemSynthesisSpeedFactorV3(normal)).toBe(1);
  expect(synthesisSpeed(normal)).toBe(synthesisSpeed({...normal,itemSystemV3:undefined}));
 });
 it('real V3 production receives fleet and third-cycle lens without touching global normal rules',()=>{
  const ids=['fleet-coordinator','singularity-lens'] as const;
  const saved=new Map(ids.map(id=>[id,(itemTypes as Record<string,unknown>)[id]]));
  try {
   for(const id of ids)(itemTypes as Record<string,unknown>)[id]={name:id,slot:'processor',effect:'compute'};
   let s=base();
   const fleet=item(ids[0]),lens=item(ids[1]);
   s={...s,inventory:[fleet,lens],equipped:{processor:fleet.id,processorAux:lens.id},nodes:['W01'],axiomResetCount:3};
   const without={...s,equipped:{}};
   const ratio=itemComputeFactorV3(s).divide(itemComputeFactorV3(without)).toNumber();
   const both=itemFleetFactorV3(s,fleet).multiply(itemLensFactorV3(
     // The lens is based on regular hardware, not item-multiplied Compute.
     S.from(1),lens
   )).toNumber();
   expect(ratio).toBeGreaterThan(both);
   expect(computeRateScientific(s.hardware,s).compare(computeRateScientific(s.hardware,without))).toBeGreaterThan(0);
   expect(itemComputeFactorV3({...s,axiomResetCount:2}).compare(itemComputeFactorV3(s))).toBeLessThan(0);
  } finally {
   for(const id of ids){const prev=saved.get(id);if(prev===undefined)delete (itemTypes as Record<string,unknown>)[id];else(itemTypes as Record<string,unknown>)[id]=prev;}
  }
 });
});
