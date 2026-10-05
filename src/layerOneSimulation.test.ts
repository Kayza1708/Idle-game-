import {describe,expect,it} from 'vitest';
import {BALANCE,buyHardwareClass,exactEconomyValue,hardwareBulkCostScientific,hardwareCostScientific,hardwareIds,isolatedBulkCostScientific,layerOneProfile,maxAffordable,newGame} from './economy';
import {ScientificNumber} from './scientificNumber';
import {simulateLayerOne} from './layerOneSimulation';

const funded=(credits:ScientificNumber)=>({...newGame(0),credits:credits.toNumber(),exactEconomy:{...newGame(0).exactEconomy,credits:credits.toJSON()}});
describe('layer one credit purchases',()=>{
 it('makes every class credit-only without discovery, research, model, INT or prestige gates',()=>{for(const id of hardwareIds){const owned=0,state=funded(hardwareCostScientific(id,owned));const bought=buyHardwareClass(state,id,1);expect(bought.hardwareCounts[id]).toBe(1);expect(exactEconomyValue(bought,'credits').isZero()).toBe(true);}});
 it('uses one geometric formula for unit and bulk prices',()=>{for(const id of hardwareIds){const sum=[0,1,2,3].reduce((n,offset)=>n.add(hardwareCostScientific(id,7+offset)),ScientificNumber.zero());expect(hardwareBulkCostScientific(id,7,4).divide(sum).toNumber()).toBeCloseTo(1,12);}});
 it('finds max without overdrawing and subtracts the exact ScientificNumber cost',()=>{const id='matrioshka',budget=hardwareBulkCostScientific(id,0,12),state=funded(budget);expect(maxAffordable(id,0,state.credits,state)).toBe(12);const bought=buyHardwareClass(state,id,'max');expect(bought.hardwareCounts[id]).toBe(12);expect(exactEconomyValue(bought,'credits').isZero()).toBe(true);});
 it('applies milestone output only when its exact edge is crossed',()=>{const profile=layerOneProfile(),i=0;const nine=isolatedBulkCostScientific(profile,i,0,9);expect(nine.compare(ScientificNumber.zero())).toBeGreaterThan(0);const run=simulateLayerOne(profile,'A',400);expect(run.milestones.filter(x=>x.id==='calculator'&&x.threshold===10)).toHaveLength(1);});
});
describe('isolated layer-one acceptance',()=>{
 const run=simulateLayerOne(layerOneProfile(),'A',24*3600),first=(id:(typeof hardwareIds)[number])=>run.firstPurchases[id]??Infinity;
 it('meets the explicit early purchase windows',()=>{expect(first('calculator')).toBeGreaterThanOrEqual(10);expect(first('calculator')).toBeLessThanOrEqual(20);expect(first('sbc')).toBeGreaterThanOrEqual(120);expect(first('sbc')).toBeLessThanOrEqual(240);expect(first('pc')).toBeGreaterThanOrEqual(480);expect(first('pc')).toBeLessThanOrEqual(720);expect(first('gpu')).toBeGreaterThanOrEqual(1200);expect(first('gpu')).toBeLessThanOrEqual(1800);expect(first('rig')).toBeGreaterThanOrEqual(2700);expect(first('rig')).toBeLessThanOrEqual(3600);expect(first('server')).toBeGreaterThanOrEqual(10800);});
 it('keeps first-purchase rate gains and production shares bounded',()=>{for(const id of ['sbc','pc','gpu','rig'] as const){const p=run.purchases.find(x=>x.id===id&&x.owned===1)!;const gain=Number(p.gain.split('e')[0])*10**Number(p.gain.split('e')[1]);const rateAfter=gain/p.share;expect(gain/(rateAfter-gain)).toBeGreaterThanOrEqual(.3);expect(gain/(rateAfter-gain)).toBeLessThanOrEqual(1.5);expect(p.share).toBeLessThanOrEqual(.75);}});
 it('keeps the accepted layer-one hardware prices and production unchanged',()=>{expect(hardwareIds.map(id=>[BALANCE.hardware[id].baseCost,BALANCE.hardware[id].compute])).toEqual([[15,1],[180,10],[5000,100],[100000,1000],[1000000,10000],[51000000,90000],[80000000,650000],[1e14,5e6],[1e20,4e7],[1e28,3e8],[1e38,2e9],[1e52,1e15],[1e70,1e22],[1e95,1e35],[1e125,1e55]]);});
 it('retains all classes and configured growth factors',()=>{expect(hardwareIds).toHaveLength(15);expect(hardwareIds.map(id=>BALANCE.hardware[id].growth)).toEqual([1.17,1.18,1.19,1.20,1.21,1.22,1.23,1.24,1.25,1.26,1.27,1.28,1.29,1.30,1.31]);});
});
