import {describe,it,expect} from 'vitest';
import {BALANCE,newGame,addCreditsScientific,addDataScientific,creditRateScientific,hardwarePurchasePreview,researchQuote,startResearchProject,newINT} from './economy';
import {ScientificNumber as S} from './scientificNumber';
import {simulateEarlyBalance} from './earlyBalanceSimulation';
import {earlyReportedState} from './testSupport/earlyReportedState';
import {createBalanceExportFiles} from './balanceReport';
import {predecessorProjection} from './testSupport/protectedProgression';
import baseline from './testSupport/dataAnalysisBaseline.json';
import {serialize,restore} from './storage';
import {advance} from './simulation';

describe('early V2 progression acceptance',()=>{
 it('allows only the ten reviewed price/growth changes through historical parameter guards',()=>{
  const reference=baseline.parameters.hardware;
  expect(predecessorProjection(BALANCE.hardware,reference,'hardware')).toEqual(reference);
  for(const changed of [{...BALANCE.hardware,sbc:{...BALANCE.hardware.sbc,baseCost:2001}},{...BALANCE.hardware,sbc:{...BALANCE.hardware.sbc,compute:11}},{...BALANCE.hardware,farm:{...BALANCE.hardware.farm,growth:1.24}}])expect(predecessorProjection(changed,reference,'hardware')).not.toEqual(reference);
 });
 it('offers a useful first reset in 45–75 minutes without ads or purchased bonuses',()=>{
  const run=simulateEarlyBalance({style:'casual',horizonSeconds:9000});
  expect(run.invalid).toBe(false);expect(run.firstINT).toBeGreaterThanOrEqual(30*60);expect(run.firstINT).toBeLessThanOrEqual(75*60);
  expect(run.resets).toHaveLength(2);expect(run.resets[0].at).toBeGreaterThanOrEqual(45*60);expect(run.resets[0].at).toBeLessThanOrEqual(75*60);expect(run.resets[0].gain).toBeGreaterThanOrEqual(3);
  expect(run.firstItem).not.toBeNull();expect(run.firstItem!).toBeLessThan(run.firstINT!);
  expect(run.hardwareByRun[1].pc!).toBeLessThan(run.hardwareByRun[0].pc!);
  expect(run.resets[1].durationSeconds).toBeLessThan(run.resets[0].durationSeconds);
  const early=[0,...run.productionSteps.filter(p=>p.run===0&&p.at<=600).map(p=>p.at),600];expect(Math.max(...early.slice(1).map((at,i)=>at-early[i]))).toBeLessThanOrEqual(90);
 },30000);
 it('improves the actual report-state hardware offers without changing existing production or granting free currency',()=>{
  const s=earlyReportedState(),rate=creditRateScientific(s.hardware,s.level,s).toNumber(),q=hardwarePurchasePreview(s,'gpu',1);
  expect(rate).toBeCloseTo(40568.59577994558,6);expect(s.credits).toBeCloseTo(3812613.9965874664,6);expect(newINT(s)).toBe(0);
  expect(q.allowed).toBe(true);const recovery=q.cost.toNumber()/q.creditGain.toNumber();expect(recovery).toBeLessThan(10*60);
  expect(s.hardwareCounts.gpu).toBe(6);expect(s.inventory).toHaveLength(6);expect(restore(serialize(s),s.savedAt).error).toBeUndefined();
 });
 it('smooths the fourth and fifth research levels and preserves paid running jobs on reload',()=>{
  let s=addDataScientific(addCreditsScientific(newGame(0),S.from(1e9)),S.from(1e6));s={...s,intro:{...s.intro,researchUsed:true},researchLevels:{...s.researchLevels,dataGeneration:3,modelArchitecture:3}};
  const q=researchQuote(s,'modelArchitecture')!;expect(q.baseDuration).toBeLessThanOrEqual(180);expect(q.cost.toNumber()).toBeLessThan(1200);
  const running=startResearchProject(s,'modelArchitecture'),loaded=restore(serialize(running),0);expect(loaded.error).toBeUndefined();expect(loaded.state.researchLabs).toEqual(running.researchLabs);
  expect(researchQuote({...s,researchLevels:{...s.researchLevels,modelArchitecture:4}},'modelArchitecture')!.baseDuration).toBeLessThanOrEqual(300);
  const job=running.researchLabs.find(j=>j?.id==='modelArchitecture')!,oldJob={...job,durationSeconds:job.durationSeconds*12,endsAt:job.startedAt+job.durationSeconds*12000,quoteBasis:{...job.quoteBasis!,baseDuration:1800}},historic={...running,researchLabs:running.researchLabs.map(j=>j?.jobId===job.jobId?oldJob:j)};
  const oldReload=restore(serialize(historic),0);expect(oldReload.error).toBeUndefined();expect(oldReload.state.researchLabs).toEqual(historic.researchLabs);expect(advance(oldReload.state,240,true,()=>.5).state.researchLabs.some(j=>j?.jobId===job.jobId)).toBe(true);
 });
 it('exports actual V2 project prices and requirements, not the legacy 25th-level price',()=>{
  const s=newGame(0),summary=JSON.parse(createBalanceExportFiles(s,0)['summary.json']);
  for(const id of Object.keys(BALANCE.researchProjects) as (keyof typeof BALANCE.researchProjects)[]){
   const q=researchQuote(s,id)!;expect(summary.dataSaving.nextResearchCosts[id]).toBe(q.cost.toNumber());expect(summary.dataSaving.nextResearchQuotes[id].requirements).toEqual(q.requirements);
  }
  expect(summary.dataSaving.nextResearchCosts.dataPipeline).toBe(100000);expect(summary.dataSaving.nextResearchQuotes.dataPipeline.allowed).toBe(false);
 });
});
