import {describe,expect,it} from 'vitest';
import {buyHardwareClass,hardwareMasteryLevel,newGame} from './economy';
import {challengeClaimable,challenges,claimChallenge,collectionSummary,prestigeGate,totalMastery} from './retention';

describe('long-term retention progression',()=>{
 it('earns persistent mastery XP only beyond 500 owned',()=>{let s=newGame(0);s={...s,credits:1e100,hardwareCounts:{...s.hardwareCounts,calculator:500},hardware:500,discovered:['calculator'],exactEconomy:{...s.exactEconomy,credits:{m:1,e:100}}};s=buyHardwareClass(s,'calculator',250);expect(s.retention.hardwareMasteryXp.calculator).toBe(250);expect(hardwareMasteryLevel(s,'calculator')).toBe(1);});
 it('claims challenge stars exactly once',()=>{let s=newGame(0);s={...s,lifetime:{...s.lifetime,prestiges:25}};const c=challenges.find(x=>x.id==='prestige-25')!;expect(challengeClaimable(s,c)).toBe(true);s=claimChallenge(s,c.id);expect(s.retention.challengeStars).toBe(2);expect(claimChallenge(s,c.id).retention.challengeStars).toBe(2);});
 it('tracks collection completion from permanent discovery',()=>{const s=newGame(0),c=collectionSummary(s);expect(c.hardware).toBe(1);expect(c.hardwareTotal).toBe(15);expect(c.componentsTotal).toBe(6);});
 it('gates deep prestige by account progression',()=>{let s=newGame(0);expect(prestigeGate(s,7)?.ok).toBe(false);s={...s,retention:{...s.retention,challengeStars:10}};expect(prestigeGate(s,7)?.ok).toBe(true);expect(totalMastery(s)).toBe(0);});
});
