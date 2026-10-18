import {newGame} from './legacyContractFixture';
import baseline from './testSupport/dataAnalysisBaseline.json';
import {describe,expect,it} from 'vitest';
import {BALANCE,buyHardwareClass,exactEconomyValue,hardwareBulkCostScientific,hardwareCostScientific,hardwareIds,isolatedBulkCostScientific,layerOneProfile,maxAffordable} from './economy';
import {predecessorProjection} from './testSupport/protectedProgression';
import {ScientificNumber} from './scientificNumber';
import {simulateLayerOne} from './layerOneSimulation';

const funded=(credits:ScientificNumber)=>({...newGame(0),credits:credits.toNumber(),exactEconomy:{...newGame(0).exactEconomy,credits:credits.toJSON()}});
describe('layer one credit purchases',()=>{
 it('makes every class credit-only without discovery, research, model, INT or prestige gates',()=>{for(const id of hardwareIds){const owned=0,state=funded(hardwareCostScientific(id,owned));const bought=buyHardwareClass(state,id,1);expect(bought.hardwareCounts[id]).toBe(1);expect(exactEconomyValue(bought,'credits').isZero()).toBe(true);}});
 it('uses one geometric formula for unit and bulk prices',()=>{for(const id of hardwareIds){const sum=[0,1,2,3].reduce((n,offset)=>n.add(hardwareCostScientific(id,7+offset)),ScientificNumber.zero());expect(hardwareBulkCostScientific(id,7,4).divide(sum).toNumber()).toBeCloseTo(1,12);}});
 it('finds max without overdrawing and subtracts the exact ScientificNumber cost',()=>{const id='matrioshka',budget=hardwareBulkCostScientific(id,0,12),state=funded(budget);expect(maxAffordable(id,0,state.credits,state)).toBe(12);const bought=buyHardwareClass(state,id,'max');expect(bought.hardwareCounts[id]).toBe(12);expect(exactEconomyValue(bought,'credits').isZero()).toBe(true);});
 it('applies milestone output only when its exact edge is crossed',()=>{const profile=layerOneProfile(),i=0;const nine=isolatedBulkCostScientific(profile,i,0,9);expect(nine.compare(ScientificNumber.zero())).toBeGreaterThan(0);const run=simulateLayerOne(profile,'A',400);expect(run.milestones.filter(x=>x.id==='calculator'&&x.threshold===10)).toHaveLength(1);});
});

describe('current protected hardware catalog',()=>{
 it('accepts the authorized early prices while preserving production and late classes',()=>{expect(hardwareIds.map(id=>[predecessorProjection(BALANCE.hardware[id].baseCost,baseline.parameters.hardware[id].baseCost,`hardware.${id}.baseCost`),BALANCE.hardware[id].compute])).toEqual(hardwareIds.map(id=>[baseline.parameters.hardware[id].baseCost,baseline.parameters.hardware[id].compute]));});
 it('retains all classes and configured growth factors',()=>{expect(hardwareIds).toHaveLength(15);expect(hardwareIds.map(id=>BALANCE.hardware[id].growth)).toEqual([1.17,1.16,1.17,1.18,1.19,1.20,1.23,1.24,1.25,1.26,1.27,1.28,1.29,1.30,1.31]);});
});
