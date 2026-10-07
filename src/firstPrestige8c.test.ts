import {describe,it,expect} from 'vitest';
import {BALANCE,newGame,addCreditsScientific,exactEconomyValue,intYieldFactor,newINTScientific,prestigeClaimScientific,creditMultiplierFromINT,type GameState} from './economy';
import {ScientificNumber} from './scientificNumber';
import {prestige,buyNode} from './prestige';
import {restore,serialize} from './storage';
const amount=(n:number)=>ScientificNumber.from(BALANCE.prestigeBaseRevenue).multiplyNumber(n);
describe('first three-INT prestige calibration contract',()=>{
 it('weights each new eligible booking once using that booking state, never retroactively',()=>{
  const base=newGame(0),first:GameState={...base,nodes:['milestoneMemory','modelSynthesis','researchArchive'],runMilestoneEdges:['calculator:10','calculator:25'],runTrainingCompleted:2,runResearchCompleted:1};
  const delta=ScientificNumber.from(1000),booked=addCreditsScientific(first,delta),changed={...booked,runTrainingCompleted:10,runResearchCompleted:4},next=addCreditsScientific(changed,delta);
  const expected=delta.multiplyNumber(intYieldFactor(first)).add(delta.multiplyNumber(intYieldFactor(changed)));
  expect(exactEconomyValue(next,'cycleEligibleCredits').compare(expected)).toBe(0);expect(exactEconomyValue(booked,'cycleEligibleCredits').compare(delta.multiplyNumber(intYieldFactor(first)))).toBe(0);
  expect(exactEconomyValue(next,'lifetimeEligibleCredits').toNumber()).toBe(2000);
 });
 it('excludes both initial/reset capital and noneligible reward credits',()=>{
  const fresh=newGame(0);expect(fresh.credits).toBe(50);expect(exactEconomyValue(fresh,'cycleEligibleCredits').isZero()).toBe(true);expect(fresh.lifetime.regularCredits).toBe(0);
  const reward=addCreditsScientific(fresh,ScientificNumber.fromParts(1,1000),false,false);expect(newINTScientific(reward).isZero()).toBe(true);expect(exactEconomyValue(reward,'cycleEligibleCredits').isZero()).toBe(true);
  const ready=addCreditsScientific(fresh,amount(9)),reset=prestige(ready);expect(reset.credits).toBe(50);expect(exactEconomyValue(reset,'cycleEligibleCredits').compare(exactEconomyValue(ready,'cycleEligibleCredits'))).toBe(0);expect(reset.runCreditsEarned).toBe(0);expect(reset.lifetime.regularCredits).toBe(ready.lifetime.regularCredits);
 });
 it('keeps cumulative entitlement, subtracts already claimed INT and resets exactly once including reload',()=>{
  const ready=addCreditsScientific(newGame(0),amount(9)),reset=prestige(ready);expect(newINTScientific(ready).toNumber()).toBe(3);expect(reset.prestigeCount).toBe(1);expect(reset.hardware).toBe(0);expect(reset.runStartedAt).toBe(ready.savedAt);expect(prestige(reset)).toBe(reset);
  const loaded=restore(serialize(reset),reset.savedAt);expect(loaded.error).toBeUndefined();expect(prestige(loaded.state)).toBe(loaded.state);
  const later=addCreditsScientific(reset,amount(7));expect(prestigeClaimScientific(later).toNumber()).toBe(4);expect(newINTScientific(later).toNumber()).toBe(1);const second=prestige(later);expect(second.cycleINTEarned).toBe(4);expect(second.prestigeCount).toBe(2);
 });
 it('regularly spending one INT on the shopping agent never reduces earned Credit bonus',()=>{
  const reset=prestige(addCreditsScientific(newGame(0),amount(9))),bonus=creditMultiplierFromINT(reset),bought=buyNode(reset,'shoppingAgent');expect(bought.nodes).toContain('shoppingAgent');expect(bought.unspentINT).toBe(2);expect(bought.spentINT).toBe(1);expect(bought.cycleINTEarned).toBe(3);expect(creditMultiplierFromINT(bought)).toBe(bonus);expect(buyNode(bought,'shoppingAgent')).toBe(bought);
 });
 it('supports scientific claims far above native Number and does not grant them twice',()=>{
  const ready=addCreditsScientific(newGame(0),ScientificNumber.fromParts(1,1000)),claim=newINTScientific(ready);expect(claim.exponent).toBeGreaterThan(308);const reset=prestige(ready);expect(exactEconomyValue(reset,'prestigeEntitlementClaimed').compare(claim)).toBe(0);expect(newINTScientific(reset).isZero()).toBe(true);expect(prestige(reset)).toBe(reset);expect(Number.isFinite(creditMultiplierFromINT(reset))).toBe(true);
 });
});
