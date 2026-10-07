import {describe,it,expect} from 'vitest';
import {BALANCE,newGame,addCreditsScientific,exactEconomyValue,hardwarePurchasePreview,buyHardwareClass,hardwareBulkCostScientific,hardwareIds,creditRateScientific} from './economy';
import {ScientificNumber} from './scientificNumber';
import {hardwareSavingsQuote,hardwareSavingsGoals} from './hardwareGoals';
describe('Server/Farm Credit savings contract',()=>{
 it.each(['server','farm'] as const)('uses the calibrated %s price for preview, bulk and atomic purchase',id=>{
  const base=newGame(0),cost=ScientificNumber.from(BALANCE.hardware[id].baseCost),below=addCreditsScientific(base,cost.subtract(ScientificNumber.from(51)),false,false);
  expect(hardwarePurchasePreview(below,id).allowed).toBe(false);expect(buyHardwareClass(below,id)).toBe(below);
  const state=addCreditsScientific(base,cost.subtract(ScientificNumber.from(50)),false,false),quote=hardwareSavingsQuote(state,id),out=buyHardwareClass(state,id);
  expect(quote.allowed).toBe(true);expect(quote.cost.compare(cost)).toBe(0);expect(out.hardwareCounts[id]).toBe(1);expect(out.discovered).toEqual([id]);expect(exactEconomyValue(out,'credits').toNumber()).toBeLessThan(.0001);expect(out.hardware).toBe(1);
  expect(creditRateScientific(out.hardware,out.level,out,out.savedAt).subtract(creditRateScientific(state.hardware,state.level,state,state.savedAt)).compare(quote.creditGain)).toBe(0);
  const bulk=hardwarePurchasePreview(state,id,10);expect(bulk.cost.compare(hardwareBulkCostScientific(id,0,10,state))).toBe(0);expect(bulk.allowed).toBe(false);
 });
 it('preserves other base prices and Server/Farm production curves',()=>{
  expect(hardwareIds.map(id=>BALANCE.hardware[id].baseCost)).toEqual([15,6000,100000,4000000,75000000,15000000000,120000000000,1e14,1e20,1e28,1e38,1e52,1e70,1e95,1e125]);
  expect(BALANCE.hardware.server.compute).toBe(90000);expect(BALANCE.hardware.farm.compute).toBe(650000);expect(BALANCE.hardware.server.growth).toBe(1.22);expect(BALANCE.hardware.farm.growth).toBe(1.23);
  for(const id of hardwareIds)expect(BALANCE.hardware[id].milestones.map(m=>m.threshold)).toEqual([10,25,50,100,250,500]);
 });
 it('next server/farm savings targets use their real scientific prices and finite rates',()=>{
  let s=addCreditsScientific(newGame(0),ScientificNumber.from(1e12),false,false);for(const id of hardwareIds.slice(0,5))s=buyHardwareClass(s,id);
  const server=hardwareSavingsGoals(s).next;expect(server?.id).toBe('server');expect(server?.cost.toNumber()).toBe(15e9);
  s=buyHardwareClass(s,'server');const farm=hardwareSavingsGoals(s).next;expect(farm?.id).toBe('farm');expect(farm?.cost.toNumber()).toBe(120e9);expect(farm?.resources.secondsToAfford).toBe(0);
  const missing=hardwareSavingsQuote(newGame(0),'farm');expect(missing.resources.secondsToAfford).toBeNull();expect(missing.resources.missingExact.toNumber()).toBeCloseTo(120e9-50,2);
 });
});
