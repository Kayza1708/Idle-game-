import {describe,expect,it} from 'vitest';
import {BALANCE,buyHardwareClass,exactEconomyValue,hardwareBulkCostScientific,hardwareCostScientific,hardwareIds,isolatedBulkCostScientific,layerOneProfile,maxAffordable,newGame} from './economy';
import {ScientificNumber} from './scientificNumber';
import {simulateLayerOne} from './layerOneSimulation';

describe('isolated layer-one acceptance',()=>{
 const run=simulateLayerOne(layerOneProfile(),'A',24*3600),first=(id:(typeof hardwareIds)[number])=>run.firstPurchases[id]??Infinity;
 it('meets the explicit early purchase windows',()=>{expect(first('calculator')).toBeGreaterThanOrEqual(10);expect(first('calculator')).toBeLessThanOrEqual(20);expect(first('sbc')).toBeGreaterThanOrEqual(120);expect(first('sbc')).toBeLessThanOrEqual(240);expect(first('pc')).toBeGreaterThanOrEqual(480);expect(first('pc')).toBeLessThanOrEqual(720);expect(first('gpu')).toBeGreaterThanOrEqual(1200);expect(first('gpu')).toBeLessThanOrEqual(1800);expect(first('rig')).toBeGreaterThanOrEqual(2700);expect(first('rig')).toBeLessThanOrEqual(3600);expect(first('server')).toBeGreaterThanOrEqual(10800);});
 it('keeps first-purchase rate gains and production shares bounded',()=>{for(const id of ['sbc','pc','gpu','rig'] as const){const p=run.purchases.find(x=>x.id===id&&x.owned===1)!;const gain=Number(p.gain.split('e')[0])*10**Number(p.gain.split('e')[1]);const rateAfter=gain/p.share;expect(gain/(rateAfter-gain)).toBeGreaterThanOrEqual(.3);expect(gain/(rateAfter-gain)).toBeLessThanOrEqual(1.5);expect(p.share).toBeLessThanOrEqual(.75);}});

});
