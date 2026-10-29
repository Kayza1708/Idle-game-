import {describe,it,expect} from 'vitest';
import {newGame,BALANCE,type GameState} from './economy';
import {startSynthesis,fabricationSpeed} from './progressionWork';
import {synthesisSpeed} from './experiments';
import {newItemSystemV3,itemSynthesisYieldV3,itemSynthesisOutputV3,resetItemProductionV3} from './itemSystemV3';
import {advanceTo} from './simulation';
import {buyProgressionAxiom,normalResetV2} from './progressionReset';
import {prestigeV3Description,synthesisOutputText} from './prestigeV3Copy';
import {languages} from './i18n';
import {ScientificNumber as S} from './scientificNumber';
const prepared=(level=0):GameState=>{const s=newGame(1000,'prepared-v3-synthesis');const funded:S=S.from(1000);return{...s,itemSystemV3:{...newItemSystemV3(),axiomDiscovered:true,axiomDiscoveryAt:1000},axiomResetCount:1,data:1e12,exactEconomy:{...s.exactEconomy,data:S.from(1e12).toJSON()},axiomUpgradeLevels:{...s.axiomUpgradeLevels,C06:level},axioms:1000,availableAxioms:1000,totalAxiomsEarned:1000,exactAxioms:{available:funded.toJSON(),total:funded.toJSON()}};};
function finish(s:GameState){expect(s.progression.synthesis).not.toBeNull();const j=s.progression.synthesis!;return advanceTo(s,s.savedAt+(j.required-j.work)/synthesisSpeed(s)*1000+.01,false,()=>.5).state;}
const K=(s:GameState)=>S.fromJSON(s.itemSystemV3!.componentsProduced).toNumber();
describe('V3 C06 actual paid synthesis contracts',()=>{
 it('retains fractional output across repeated real jobs without inventing craft speed',()=>{
  for(const level of [0,1,2,3]){let s=prepared(level);const factor=level?BALANCE.prestigeV3.axioms.C06[level-1]:1;expect(fabricationSpeed(s)).toBe(1);expect(itemSynthesisYieldV3(s)).toBe(factor);
   for(let n=1;n<=4;n++){const before=s,started=startSynthesis(s,'circuits');expect(S.fromJSON(before.exactEconomy.data).subtract(S.fromJSON(started.exactEconomy.data)).toNumber()).toBe(BALANCE.progression.synthesisCosts[0]);expect(started.itemSystemV3!.synthesisContract?.multiplier).toBe(factor);s=finish(started);expect(K(s)).toBe(Math.floor(n*factor));expect(s.itemSystemV3!.synthesisRemainders.circuits).toBeCloseTo(n*factor-Math.floor(n*factor),12);expect(s.itemSystemV3!.synthesisContract).toBeNull();expect(advanceTo(s,s.savedAt,false).state.itemSystemV3).toEqual(s.itemSystemV3);}
  }
 });
 it('freezes the paid contract while a real node purchase changes the next quote',()=>{
  const started=startSynthesis(prepared(1),'circuits');const bought=buyProgressionAxiom(started,'C06');expect(bought).not.toBe(started);expect(itemSynthesisYieldV3(bought)).toBe(2);expect(bought.itemSystemV3!.synthesisContract?.multiplier).toBe(1.5);const first=finish(bought);expect(K(first)).toBe(1);expect(first.itemSystemV3!.synthesisRemainders.circuits).toBe(.5);expect(itemSynthesisOutputV3(first,'circuits').amount).toBe(2);expect(K(finish(startSynthesis(first,'circuits')))).toBe(3);expect(started.itemSystemV3!.synthesisRemainders).toEqual({});
 });
 it('preserves legacy paid jobs at one output and retains paid V3 jobs and fractions through reset',()=>{
  const normal=startSynthesis({...prepared(3),itemSystemV3:undefined},'circuits');const migrated={...normal,itemSystemV3:newItemSystemV3()};expect(K(finish(migrated))).toBe(1);
  const paid=startSynthesis(prepared(1),'circuits'),reset=normalResetV2({...paid,progression:{...paid.progression,entitlement:S.from(100).toJSON()}});expect(reset.prestigeCount).toBe(1);expect(reset.itemSystemV3!.synthesisContract).toEqual(paid.itemSystemV3!.synthesisContract);const done=finish(reset);expect(K(done)).toBe(1);for(const kind of ['prestige','axiom'] as const)expect(resetItemProductionV3(done,kind).itemSystemV3!.synthesisRemainders.circuits).toBe(.5);
 });
 it('never starts locked material families and shares truthful seven-language descriptions',()=>{
  const s=prepared(3);expect(startSynthesis(s,'quantumCores')).toBe(s);expect(s.itemSystemV3!.synthesisContract).toBeNull();for(const language of languages){const text=prestigeV3Description('C06',language)!;expect(text).toContain('×3');expect(text).not.toContain('{');expect(synthesisOutputText(s,'circuits',language)).toContain('+3');expect(synthesisOutputText(s,'circuits',language)).not.toContain('{');}
 });
});
