import {describe,it,expect} from 'vitest';
import {newGame,BALANCE,type GameState} from './economy';
import {createItem,equip,unequip} from './inventory';
import {newItemSystemV3,itemAnalysisFactorV3,itemStrengthV3,resetItemProductionV3} from './itemSystemV3';
import {queueExperiment,completeExperiment,experimentSpeed,cancelExperiment,synthesisSpeed} from './experiments';
import {advanceTo} from './simulation';
import {emptyChallengeMetrics} from './challengeStages';
import {ScientificNumber as S} from './scientificNumber';
const prepared=()=>{let s:GameState={...newGame(1000,'prepared-v3-scanner'),itemSystemV3:newItemSystemV3(),data:1e12};s={...s,exactEconomy:{...s.exactEconomy,data:S.from(1e12).toJSON()}};s=createItem(s,'field-scanner','common');return equip(s,s.inventory[0].id);};
function finish(s:GameState,active=false){const start=queueExperiment(s,'hardware',s.savedAt,'short');expect(start.experiments.active).not.toBeNull();return advanceTo(start,start.experiments.active!.endsAt+.01,active,()=>.5).state;}
describe('V3 field scanner from actual paid analysis completions',()=>{
 it('uses exact softcap formula, W10 once, and no old primary/secondary effects',()=>{
  const s=prepared();expect(experimentSpeed(s)).toBe(2);expect(synthesisSpeed(s)).toBe(1);for(const count of [0,24,25,26,1000000]){const state={...s,itemSystemV3:{...s.itemSystemV3!,scannerAnalyses:count}};const soft=count<=25?count:25+Math.sqrt((count-25)*25);expect(itemAnalysisFactorV3(state).toNumber()).toBeCloseTo(2*(1+.05*soft),10);const w10={...state,nodes:['W10']};expect(itemAnalysisFactorV3(w10).toNumber()).toBeCloseTo(2**1.15*(1+.05*1.15*soft),10);}
  const strongest={...s,inventory:s.inventory.map(i=>({...i,rarity:'mythic' as const,level:69,forge:20}))};const p=itemStrengthV3(strongest.inventory[0]).P;expect(itemAnalysisFactorV3(strongest).toNumber()).toBeCloseTo(2**p,12);
 });
 it('counts once, rejects duplicate claims and retired legacy intro, and excludes unequipped completion',()=>{
  let s=finish(prepared());expect(s.itemSystemV3!.scannerAnalyses).toBe(1);expect(experimentSpeed(s)).toBeCloseTo(2.1,12);expect(completeExperiment(s,s.savedAt)).toBe(s);expect(advanceTo(s,s.savedAt,false).state.itemSystemV3).toEqual(s.itemSystemV3);
  s=finish(unequip(s,'research'));expect(s.itemSystemV3!.scannerAnalyses).toBe(1);expect(experimentSpeed(s)).toBe(1);s=equip(s,s.inventory[0].id);expect(experimentSpeed(s)).toBeCloseTo(2.1,12);
  const start=queueExperiment(s,'hardware',s.savedAt,'short'),intro={...start,experiments:{...start.experiments,active:{...start.experiments.active!,length:'intro' as const}}};expect(completeExperiment(intro,intro.experiments.active.endsAt,()=>.5).itemSystemV3!.scannerAnalyses).toBe(1);
 });
 it('takes completion-time equipment, never grants progress for cancel or refused payment, and resets per run',()=>{
  let s=prepared(),start=queueExperiment(unequip(s,'research'),'hardware',s.savedAt,'short');start=equip(start,start.inventory[0].id);const end=completeExperiment(start,start.experiments.active!.endsAt,()=>.5);expect(end.itemSystemV3!.scannerAnalyses).toBe(1);
  const cancelled=cancelExperiment(queueExperiment(end,'hardware',end.savedAt,'short'));expect(cancelled.itemSystemV3!.scannerAnalyses).toBe(1);
  const poor={...s,data:0,exactEconomy:{...s.exactEconomy,data:S.zero().toJSON()}};expect(queueExperiment(poor,'hardware',poor.savedAt,'short').experiments.active).toBeNull();expect(poor.itemSystemV3!.scannerAnalyses).toBe(0);
  for(const kind of ['prestige','axiom'] as const)expect(resetItemProductionV3(end,kind).itemSystemV3!.scannerAnalyses).toBe(0);
 });
 it('has identical online/offline receipts and suppresses no-items effects',()=>{
  const s=prepared(),online=finish(s,true),offline=finish(s,false);expect(online.itemSystemV3).toEqual(offline.itemSystemV3);
  const challenge:GameState={...s,retention:{...s.retention,activeRun:{id:'no-items',stage:1,catalogVersion:2,metrics:emptyChallengeMetrics(),runId:'prepared-scanner-no-items',startedAt:s.savedAt,eligibleAtStart:s.exactEconomy.lifetimeEligibleCredits,loadout:s.inventory}}};expect(itemAnalysisFactorV3(challenge).toNumber()).toBe(1);expect(finish(challenge).itemSystemV3!.scannerAnalyses).toBe(0);
  expect(itemAnalysisFactorV3({...s,itemSystemV3:undefined}).toNumber()).toBe(1);expect(BALANCE.itemV3.scanner.threshold).toBe(25);
 });
});
