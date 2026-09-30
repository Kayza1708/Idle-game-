import {describe,expect,it} from 'vitest';
import {newGame} from './economy';
import {claimOnboarding,updateOnboarding} from './onboarding';
import {addEvent} from './telemetry';

describe('calculator milestone onboarding',()=>{
 it('stays open at 24 calculators and completes at 25',()=>{const base=newGame(0),at24=updateOnboarding({...base,hardwareCounts:{...base.hardwareCounts,calculator:24}});expect(at24.onboarding.completed).not.toContain('class-upgrade');const at25=updateOnboarding({...at24,hardwareCounts:{...at24.hardwareCounts,calculator:25}});expect(at25.onboarding.completed).toContain('class-upgrade')});
 it('recognizes a previously reached 25 milestone and grants its reward once',()=>{const base=newGame(0),historic=addEvent(base,'hardware-milestone',0,{id:'calculator',threshold:25},true),eligible=updateOnboarding(historic),claimed=claimOnboarding(eligible,'class-upgrade');expect(eligible.onboarding.completed).toContain('class-upgrade');expect(claimed.credits).toBe(250);expect(claimed.onboarding.claimed).toContain('class-upgrade');expect(claimOnboarding(claimed,'class-upgrade')).toBe(claimed)});
});

describe('research onboarding goal',()=>{
 it('recognizes Data Generation level 1 and grants one common item exactly once',()=>{const base=newGame(0),eligible=updateOnboarding({...base,researchLevels:{...base.researchLevels,dataGeneration:1}});expect(eligible.onboarding.completed).toContain('first-research');const claimed=claimOnboarding(eligible,'first-research');expect(claimed.inventory).toHaveLength(1);expect(claimed.inventory[0]).toMatchObject({type:'quantum-chip',rarity:'common'});expect(claimOnboarding(claimed,'first-research')).toBe(claimed)});
 it('does not accept unrelated research completion',()=>{const base=newGame(0),state=updateOnboarding({...base,lifetime:{...base.lifetime,researchCompleted:4}});expect(state.onboarding.completed).not.toContain('first-research')});
});
