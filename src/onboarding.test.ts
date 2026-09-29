import {describe,expect,it} from 'vitest';
import {newGame} from './economy';
import {claimOnboarding,updateOnboarding} from './onboarding';
import {addEvent} from './telemetry';

describe('calculator milestone onboarding',()=>{
 it('stays open at 24 calculators and completes at 25',()=>{const base=newGame(0),at24=updateOnboarding({...base,hardwareCounts:{...base.hardwareCounts,calculator:24}});expect(at24.onboarding.completed).not.toContain('class-upgrade');const at25=updateOnboarding({...at24,hardwareCounts:{...at24.hardwareCounts,calculator:25}});expect(at25.onboarding.completed).toContain('class-upgrade')});
 it('recognizes a previously reached 25 milestone and grants its reward once',()=>{const base=newGame(0),historic=addEvent(base,'hardware-milestone',0,{id:'calculator',threshold:25},true),eligible=updateOnboarding(historic),claimed=claimOnboarding(eligible,'class-upgrade');expect(eligible.onboarding.completed).toContain('class-upgrade');expect(claimed.credits).toBe(250);expect(claimed.onboarding.claimed).toContain('class-upgrade');expect(claimOnboarding(claimed,'class-upgrade')).toBe(claimed)});
});
