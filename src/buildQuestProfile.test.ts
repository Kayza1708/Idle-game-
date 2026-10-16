import {newGame} from './legacyContractFixture';
import {describe,it,expect} from 'vitest';

import {claimMissionBonus} from './missions';
import {runNaturalProfile,summarizeNaturalProfile,profileOnlineAt} from '../scripts/natural-progression-profile';
const base={play:'continuous',priority:'model-first',seed:1708,seconds:120} as const;
describe('build and reward measurement contracts',()=>{
 it('rejects empty period bonuses without awarding XP, gems or materials',()=>{const s=newGame(0);for(const kind of ['daily','weekly','monthly'] as const)expect(claimMissionBonus(s,kind)).toBe(s)});
 it.each([0,1,3] as const)('counts real %s tap/s input and reconciles its paid income',tapsPerSecond=>{const p=runNaturalProfile({...base,tapsPerSecond,build:'chip'});expect(p.taps).toBe(120*tapsPerSecond);expect(p.tapIncome.relativeError).toBeLessThan(1e-9);expect(p.balances.relativeDataError).toBeLessThan(1e-10);expect(p.equippedTimeline).toEqual([])});
 it('uses exact session boundaries even when they do not align with ten-second slices',()=>{const config={...base,seconds:30,sessions:[[10,11],[23,24]] as const,claimRewards:true};expect(profileOnlineAt(config,0)).toBe(false);const p=runNaturalProfile(config);expect(p.onlineSeconds).toBe(2);expect(p.offlineSeconds).toBe(28);expect(p.taps).toBe(2);expect(p.actions.every(a=>a.at===10||a.at===23)).toBe(true);expect(summarizeNaturalProfile(p).manualActionSummary.outsideSessions).toBe(0)});
 it('claims real early rewards once and preserves their ledger through reload',()=>{const p=runNaturalProfile({...base,claimRewards:true,seconds:150});expect(p.rewards!.achievementClaims).toContain('taps:0');expect(p.actions.filter(a=>a.family==='achievement'&&a.detail==='taps:0')).toHaveLength(1);expect(p.rewards!.gems).toBeGreaterThan(50);expect(p.reload).toBe(true);expect(p.rewards!.achievementReadyAt['taps:0']).toBe(100)});
 it('keeps old no-claim defaults and seeded reward profiles reproducible',()=>{expect(runNaturalProfile(base).rewards).toBeNull();const config={...base,claimRewards:true,build:'relay'} as const;const a=runNaturalProfile(config),b=runNaturalProfile(config);expect(a.final).toEqual(b.final);expect(a.rewards).toEqual(b.rewards);expect(a.bookedCosts).toEqual(b.bookedCosts)});
 it('rejects overlapping session windows and unsupported tap cadence',()=>{expect(()=>runNaturalProfile({...base,sessions:[[0,20],[10,30]]})).toThrow('Invalid session');expect(()=>runNaturalProfile({...base,tapsPerSecond:5 as never})).toThrow('Invalid tap')});
});
