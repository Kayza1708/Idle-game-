import {describe,it,expect} from 'vitest';
import {BALANCE,newGame,addDataScientific,exactEconomyValue,automationFeatureUnlocked,type GameState} from './economy';
import {ScientificNumber as S} from './scientificNumber';
import {enqueueAnalysis,removeAnalysis,runAnalysisQueue,queueExperiment,runAnalysisPlanner} from './experiments';
import {serialize,restore} from './storage';
import {advanceTo} from './simulation';
const fresh=()=>addDataScientific({...newGame(1_000_000),aiName:'AURA'},S.from(1e6));
describe('analysis planning and increased yields',()=>{
 it('migrates web version63 without dropping original data and roundtrips new short queues',()=>{const s=fresh();s.nodes=['F02'];const raw=JSON.stringify({version:63,state:s});const old=restore(raw,s.savedAt);expect(old.error).toBeUndefined();expect(old.state.componentInventory).toEqual(s.componentInventory);const queued=enqueueAnalysis(old.state,'hardware','short');const saved=serialize(queued);expect(JSON.parse(saved).version).toBe(64);expect(restore(saved,s.savedAt).state.experiments.queue).toEqual(['hardware-short']);expect(raw).toBe(JSON.stringify({version:63,state:s}));});
 it('doubles each new base contract without changing price/work or paid jobs',()=>{
  expect(Object.values(BALANCE.progression.analyses).map(a=>[a.units,a.cost,a.work])).toEqual([[24,250,600],[720,6000,14400],[36,800,1800],[720,12800,28800],[60,4000,7200],[900,48000,86400]]);
  let s=queueExperiment(fresh(),'hardware',1_000_000,'short');s.experiments.active!.progressionUnits=12;
  const n=advanceTo(s,1_600_000).state;expect(Object.values(n.componentInventory).reduce((a,b)=>a+b,0)).toBe(12);
 });
 it('requires F02, has six unpaid slots, validates access and removes by index',()=>{
  let s=fresh();expect(enqueueAnalysis(s,'hardware','short')).toBe(s);s={...s,nodes:['F02']};expect(enqueueAnalysis(s,'architecture','short')).toBe(s);
  const before=exactEconomyValue(s,'data');for(let i=0;i<6;i++)s=enqueueAnalysis(s,'hardware','short');expect(s.experiments.queue).toHaveLength(6);expect(enqueueAnalysis(s,'hardware','short')).toBe(s);expect(exactEconomyValue(s,'data').compare(before)).toBe(0);expect(removeAnalysis(s,2).experiments.queue).toHaveLength(5);expect(removeAnalysis(s,-1)).toBe(s);
 });
 it('waits for affordability, drains FIFO offline and never rewards twice after reload',()=>{
  let s={...fresh(),nodes:['F02']};for(let i=0;i<6;i++)s=enqueueAnalysis(s,'hardware','short');
  const outcome=advanceTo(s,s.savedAt+3_600_000),n=outcome.state;expect(n.experiments.queue).toHaveLength(0);expect(n.experiments.active).toBeNull();expect(outcome.report.analysisResults).toHaveLength(6);expect(outcome.report.analysisResults.flatMap(r=>Object.values(r.components)).reduce((a,b)=>a+(b??0),0)).toBe(144);expect(exactEconomyValue(n,'data').toNumber()).toBeCloseTo(998500+outcome.report.data);
  const loaded=JSON.parse(JSON.stringify(n));expect(advanceTo(loaded,loaded.savedAt).state.componentInventory).toEqual(n.componentInventory);
  const poor={...s,data:0,exactEconomy:{...s.exactEconomy,data:S.zero().toJSON()}};expect(runAnalysisQueue(poor)).toBe(poor);
 });
 it('F03 repeats without an axiom and stops for reserved data',()=>{
  let s={...fresh(),nodes:['F03'],analysisPlanner:{enabled:true,type:'hardware' as const,length:'short' as const,elapsed:0}};expect(automationFeatureUnlocked(s,'analysisPlanner')).toBe(true);expect(runAnalysisPlanner(s).experiments.active).not.toBeNull();
  s.progression.reserves.data=S.from(1e6).toJSON();expect(runAnalysisPlanner(s)).toBe(s);
 });
 it('caps a nine hour absence at the unchanged eight hour capacity',()=>{const s={...fresh(),nodes:['F03'],analysisPlanner:{enabled:true,type:'hardware' as const,length:'short' as const,elapsed:0}};const eight=advanceTo(s,s.savedAt+28_800_000),nine=advanceTo(s,s.savedAt+32_400_000);expect(nine.report.seconds).toBe(28800);expect(nine.report.lostSeconds).toBe(3600);expect(nine.state.componentInventory).toEqual(eight.state.componentInventory);expect(exactEconomyValue(nine.state,'data').compare(exactEconomyValue(eight.state,'data'))).toBe(0);expect(nine.state.experiments.completedIds).toEqual(eight.state.experiments.completedIds);});
 it('preserves sequential online and one offline allocation, bounded by offline capacity',()=>{
  const s={...fresh(),nodes:['F03'],analysisPlanner:{enabled:true,type:'hardware' as const,length:'short' as const,elapsed:0}};const offline=advanceTo(s,s.savedAt+7_200_000).state;let online:GameState=s;for(let i=0;i<12;i++)online=advanceTo(online,online.savedAt+600_000).state;
  expect(online.componentInventory).toEqual(offline.componentInventory);expect(online.experiments.active?.progressionUnits).toEqual(offline.experiments.active?.progressionUnits);expect(exactEconomyValue(online,'data').compare(exactEconomyValue(offline,'data'))).toBe(0);
 });
});
