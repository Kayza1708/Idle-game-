import {describe,expect,it} from 'vitest';
import {BALANCE,addCredits,creditMultiplierFromINT,newGame} from './economy';
import {prestige,prestigePreview} from './prestige';
import {restore,serialize} from './storage';
import {ScientificNumber} from './scientificNumber';

const withCycleINT=(value:number)=>{const state=newGame(0),exact=ScientificNumber.from(value).toJSON();return{...state,cycleINTEarned:value,totalINTEarned:value,exactEconomy:{...state.exactEconomy,cycleINTEarned:exact,totalINTEarned:exact}}};
const milestones=[1,5,10,25,50,100,250,500,1000] as const;

describe('permanent INT production curve',()=>{
 it('matches the configured natural-log curve at every design milestone',()=>{for(const value of milestones)expect(creditMultiplierFromINT(withCycleINT(value))).toBeCloseTo(1+BALANCE.prestigeBonusLogScale*Math.log1p(value),10)});
 it('is strictly monotonic and never loses bonus as earned INT rises',()=>{const values=[0,...milestones].map(value=>creditMultiplierFromINT(withCycleINT(value)));for(let i=1;i<values.length;i++)expect(values[i]).toBeGreaterThan(values[i-1])});
 it('makes the first prestige meaningful while retaining logarithmic diminishing returns',()=>{expect(creditMultiplierFromINT(withCycleINT(1))).toBeGreaterThan(1.35);expect(creditMultiplierFromINT(withCycleINT(1000))).toBeLessThan(5);});
 it('keeps preview, actual reset, and save reload on the same authoritative multiplier',()=>{const before=addCredits(newGame(1000),1e15),preview=prestigePreview(before),after=prestige(before),loaded=restore(serialize(after),after.savedAt).state;expect(preview.creditBonusAfter).toBe(creditMultiplierFromINT(after));expect(creditMultiplierFromINT(loaded)).toBe(creditMultiplierFromINT(after));});
});
