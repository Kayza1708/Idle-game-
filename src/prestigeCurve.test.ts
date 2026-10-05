import {describe,expect,it} from 'vitest';
import {addCredits,BALANCE,canPrestige,creditMultiplierFromINT,newGame,newINT,prestigeClaimForEligible} from './economy';
import {prestige,prestigePreview} from './prestige';
import {ScientificNumber} from './scientificNumber';

describe('calibrated cumulative INT entitlement',()=>{
 it('is monotonic and handles scientific revenues far beyond Number range',()=>{const values=[ScientificNumber.zero(),ScientificNumber.from(1e12),ScientificNumber.from(1e100),ScientificNumber.fromParts(1,10_000)],claims=values.map(prestigeClaimForEligible);expect(claims).toEqual([...claims].sort((a,b)=>a-b));expect(claims.every(Number.isFinite)).toBe(true);expect(claims.at(-1)).toBeGreaterThan(claims.at(-2)!);});
 it('subtracts claimed entitlement and never grants the same revenue twice',()=>{const ready=addCredits(newGame(0),1e15),first=prestige(ready);expect(first.totalINTEarned).toBeGreaterThan(0);expect(newINT(first)).toBe(0);expect(prestige(first)).toBe(first);});
 it('allows reset at one INT without any additional gate and keeps preview exact',()=>{const state=addCredits(newGame(0),BALANCE.prestigeBaseRevenue),preview=prestigePreview(state),after=prestige(state);expect(newINT(state)).toBe(1);expect(canPrestige(state)).toBe(true);expect(preview.claimableINT).toBe(1);expect(preview.totalINTAfter).toBe(after.totalINTEarned);expect(preview.availableINTAfter).toBe(after.unspentINT);});
 it('keeps the lifetime bonus after INT spending',()=>{const earned=prestige(addCredits(newGame(0),1e18)),spent={...earned,unspentINT:0};expect(creditMultiplierFromINT(spent)).toBe(creditMultiplierFromINT(earned));});
 it('does not count explicitly ineligible reward, shop, or debug-style credits',()=>{const state=addCredits(newGame(0),1e30,false);expect(newINT(state)).toBe(0);expect(canPrestige(state)).toBe(false);});
 it('changes only the calibrated threshold among protected economy parameters',()=>{expect(BALANCE).toMatchObject({prestigeBaseRevenue:442_493_746_168,baseDataPerSecond:.1,trainingDurationBaseSeconds:90,trainingDurationGrowth:1.35,researchDataGrowth:1.85,researchDurationGrowth:1.35});expect(BALANCE.hardware.calculator).toMatchObject({baseCost:15,growth:1.17,compute:1});expect(BALANCE.analysisCosts.hardware.short).toEqual({data:57623,duration:600});});
 it('places the comparison prestige at 45 minutes with at least 3 INT',async()=>{const {simulateBalance}=await import('./simulation'),measured=simulateBalance(90/1440,true,1708,Infinity,'training-first',[{start:0,end:5400}],false);expect(measured.milestones.firstPrestige).toBe(2700);expect(measured.final.totalINTEarned).toBeGreaterThanOrEqual(3);},20_000);
});
