import {describe,expect,it} from 'vitest';
import {BALANCE,hardwareIds,newGame,toggleHardwareAutobuyer} from './economy';
import {achievements,currentAchievementTier} from './achievements';
import {rollPeriods} from './missions';
import {advanceTo} from './simulation';

describe('Progression V2',()=>{
 it('keeps long achievement families in one dynamically advancing card',()=>{let s=newGame(0);const taps=achievements.find(a=>a.id==='taps')!;expect(taps.thresholds.length).toBe(10);s={...s,lifetime:{...s.lifetime,taps:100}};expect(currentAchievementTier(s,taps)).toBe(0);});
 it('creates 6 daily, 12 weekly and 30 monthly quests',()=>{const s=rollPeriods(newGame(Date.UTC(2026,8,25)),Date.UTC(2026,8,25));expect(s.missions.daily.tasks).toHaveLength(6);expect(s.missions.weekly.tasks).toHaveLength(12);expect(s.missions.monthly.tasks).toHaveLength(30);});
 it('uses progressive quest tiers in the monthly pool',()=>{const s=rollPeriods(newGame(Date.UTC(2026,8,25)),Date.UTC(2026,8,25));expect(s.missions.monthly.tasks.some(t=>t.de.includes('Stufe 2'))).toBe(true);});
 it('unlocks an individual autobuyer at 100 owned and preserves all 15 classes',()=>{let s=newGame(0);s={...s,hardwareCounts:{...s.hardwareCounts,calculator:100}};s=toggleHardwareAutobuyer(s,'calculator');expect(s.hardwareAutoBuyers.calculator).toBe(true);expect(hardwareIds).toHaveLength(15);expect(BALANCE.hardwareAutobuyerUnlock).toBe(100);});
 it('runs a mastery autobuyer without the old global automation unlock',()=>{let s=newGame(0);s={...s,credits:1e9,hardwareCounts:{...s.hardwareCounts,calculator:100},hardware:100,hardwareAutoBuyers:{calculator:true}};const result=advanceTo(s,6000).state;expect(result.hardwareCounts.calculator).toBeGreaterThan(100);});
 it('expands the permanent prestige tree to forty nodes',()=>{expect(Object.keys(BALANCE.prestigeUpgrades)).toHaveLength(40);expect(BALANCE.prestigeUpgrades.manufacturing8.depth).toBe(8);});
});
