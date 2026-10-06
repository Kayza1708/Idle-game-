import {describe,expect,it} from 'vitest';
import {BALANCE} from './economy';
import {simulateBalance} from './simulation';

describe('layer-three calibrated starts',()=>{
 it.each(['training-first','analysis-first'] as const)('hits both independent windows for %s',priority=>{const run=simulateBalance(90/1440,true,1708,0,priority,[{start:0,end:5400}],true);expect(run.milestones.firstResearch).toBeGreaterThanOrEqual(300);expect(run.milestones.firstResearch).toBeLessThanOrEqual(600);expect(run.milestones.firstAnalysis).toBeGreaterThanOrEqual(840);expect(run.milestones.firstAnalysis).toBeLessThanOrEqual(1800);const researchBoundary=Math.floor(Math.max(...run.evaluation!.dataDecisions.filter(d=>d.category==='research'&&d.at<300).map(d=>d.dataBefore)))+1,analysisBoundary=Math.floor(Math.max(...run.evaluation!.dataDecisions.filter(d=>d.category==='analysis'&&d.at<900).map(d=>d.dataBefore)))+1;expect(researchBoundary).toBe(313);expect(analysisBoundary).toBe(59132);},15_000);
 it('uses the smallest integer boundary costs from the deterministic timeline',()=>{expect(BALANCE.researchCategories.data.baseData).toBe(363);expect(BALANCE.analysisCosts.hardware.short.data).toBe(57623);});
});

describe('layer-three measurement scenarios',()=>{
 it('starts at t=0 with no prefetched offline production',()=>{const run=simulateBalance(90/1440,true,1708,0,'training-first',[{start:0,end:5400}],true);expect(run.evaluation!.timing).toMatchObject({onlineSeconds:5400,offlineSeconds:0,creditedOfflineSeconds:0,taps:5400});expect(run.milestones.firstResearch).toBeGreaterThan(0);},10_000);
 it('separates the first session, absence, and credited offline time',()=>{const run=simulateBalance((8*60+40)/1440,true,1708,0,'training-first',[{start:0,end:1200},{start:30000,end:31200}],true);expect(run.evaluation!.timing.onlineSeconds).toBe(2400);expect(run.evaluation!.timing.offlineSeconds).toBe(28800);expect(run.evaluation!.timing.creditedOfflineSeconds).toBe(28800);});
 it('makes reproducible, real-resource data decisions',()=>{const windows=[{start:0,end:5400}],a=simulateBalance(90/1440,true,1708,0,'analysis-first',windows,true),b=simulateBalance(90/1440,true,1708,0,'analysis-first',windows,true);expect(a.evaluation!.dataDecisions).toEqual(b.evaluation!.dataDecisions);for(const d of a.evaluation!.dataDecisions.filter(x=>x.accepted)){expect(d.dataAfter).toBeLessThanOrEqual(d.dataBefore);expect(d.missing).toBe(0);}},15_000);
 it('naturally crafts the stable first catalog recipe without grants',()=>{const run=simulateBalance(3,true,1708,0,'training-first',undefined,true);expect(run.milestones.firstCraftable).not.toBeNull();expect(run.milestones.firstCraft).not.toBeNull();expect(run.final.lifetime.itemsCrafted).toBeGreaterThan(0);expect(run.final.lifetime.componentsEarned).toBeGreaterThan(0);expect(Object.keys(BALANCE.itemRecipes)[0]).toBe('impulse-relay');},60_000);
});
