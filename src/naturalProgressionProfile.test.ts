import {describe,it,expect} from 'vitest';
import {runNaturalProfile,onlineAt,summarizeNaturalProfile} from '../scripts/natural-progression-profile';
describe('natural profile measurement boundaries',()=>{
 it('labels session boundaries consistently',()=>{expect([0,599,600,3599,3600,3899,3900,7199].map(second=>onlineAt('short-sessions',second))).toEqual([true,true,false,false,true,true,false,false]);});
 it('uses real initial stocks and paid purchases without synthetic progression',()=>{const p=runNaturalProfile({play:'continuous',priority:'model-first',seed:1708,seconds:30});expect(p.initial).toMatchObject({credits:{m:5,e:1},hardware:0,data:0,components:0});expect(p.taps).toBe(30);expect(p.final.prestiges).toBe(0);expect(p.final.nodes).toEqual([]);expect(p.final.hardware.calculator).toBeGreaterThan(0);expect(p.manualActionDebits.hardware.credits.m).toBeGreaterThan(0);expect(p.reload).toBe(true);expect(p.balances.relativeDataError).toBeLessThan(1e-10);});
 it('performs no manual decisions or taps during the offline part of a real session',()=>{const p=runNaturalProfile({play:'short-sessions',priority:'materials-first',seed:1708,seconds:660});expect(p.onlineSeconds).toBe(600);expect(p.offlineSeconds).toBe(60);expect(p.taps).toBe(600);expect(p.actions.every(a=>a.at<600)).toBe(true);expect(p.final.hardware).toEqual((p.checkpoints[0] as any).hardware);expect(p.reload).toBe(true);},10000);
 it('resumes real paid decisions at return and preserves identical seeded outcomes',()=>{
  const config={play:'short-sessions',priority:'model-first',seed:1708,seconds:3601} as const;
  const p=runNaturalProfile(config),again=runNaturalProfile(config);
  expect(p.onlineSeconds).toBe(601);expect(p.taps).toBe(601);expect(p.offlineSeconds).toBe(3000);
  expect(p.actions.some(action=>action.at===3600)).toBe(true);
  expect(p.actions.some(action=>action.at>=600&&action.at<3600)).toBe(false);
  expect(p.final).toEqual(again.final);expect(p.bookedCosts).toEqual(again.bookedCosts);
  const report=summarizeNaturalProfile(p);expect(report.manualActionSummary.outsideSessions).toBe(0);expect(report.sampledManualActions.length).toBeLessThanOrEqual(30);
 },10000);
 it.each([0,-1,7201,Infinity])('rejects an unbounded or invalid measurement horizon %s',seconds=>{expect(()=>runNaturalProfile({play:'continuous',priority:'model-first',seed:1708,seconds})).toThrow('1..7200');});
});
