import {craft} from './inventory';
import {describe,it,expect} from 'vitest';
import {BALANCE,newGame,grantComponents,buyHardwareClass,buyClassUpgrade,componentIds,type ItemTypeId,type GameState} from './economy';
import {newItemSystemV3,recordItemComponentsV3,resetItemProductionV3} from './itemSystemV3';
import {queueExperiment,completeExperiment,experimentSpeed} from './experiments';
import {startSynthesis} from './progressionWork';
import {advanceTo} from './simulation';
import {buyGemOffer} from './gemShop';
import {ScientificNumber as S} from './scientificNumber';
/** Explicitly funded temporary domain states, not a natural progression run. */
const prepared=():GameState=>{const s=newGame(1000,'prepared-v3-components');return{...s,itemSystemV3:newItemSystemV3(),gems:1000,credits:1e12,data:1e12,exactEconomy:{...s.exactEconomy,credits:S.from(1e12).toJSON(),data:S.from(1e12).toJSON()}};};
const K=(s:GameState)=>S.fromJSON(s.itemSystemV3!.componentsProduced);
describe('V3 component production from actual sources',()=>{
 it('excludes ordinary grants, purchased packs and existing wallets',()=>{
  const s=grantComponents(prepared(),{circuits:1000});expect(K(s).isZero()).toBe(true);const bought=buyGemOffer(s,'materials-circuits');expect(bought.componentInventory.circuits).toBeGreaterThan(s.componentInventory.circuits);expect(K(bought).isZero()).toBe(true);
  expect(recordItemComponentsV3(s,{circuits:1},'shop' as never)).toBe(s);expect(recordItemComponentsV3(s,{circuits:1})).toBe(s);
 });
 it('records actual paid analysis output once and excludes retired intro analysis',()=>{
  const started=queueExperiment(prepared(),'hardware',1000,'short');expect(started.experiments.active).not.toBeNull();const seconds=(started.experiments.active!.endsAt-started.savedAt)/1000+.01;
  const done=advanceTo(started,started.savedAt+seconds*1000,false,()=>.5).state;expect(done.experiments.active).toBeNull();const amounts=done.experiments.lastResult!.components;const produced=componentIds.reduce((n,id)=>n+(amounts[id]??0),0);expect(produced).toBeGreaterThan(0);expect(K(done).toNumber()).toBe(produced);
  expect(completeExperiment(done,done.savedAt,()=>.5)).toBe(done);expect(K(advanceTo(done,done.savedAt,false).state).compare(K(done))).toBe(0);
  const intro={...started,experiments:{...started.experiments,active:{...started.experiments.active!,length:'intro' as const}}};const retired=completeExperiment(intro,intro.experiments.active.endsAt,()=>.5);expect(K(retired).isZero()).toBe(true);
 });
 it('counts paid synthesis once, persists through prestige and clears only at axiom reset',()=>{
  const started=startSynthesis(prepared(),'circuits');expect(started.progression.synthesis).not.toBeNull();const seconds=started.progression.synthesis!.required/experimentSpeed(started)+.01;
  const done=advanceTo(started,started.savedAt+seconds*1000,false).state;expect(K(done).toNumber()).toBe(1);expect(done.progression.synthesis).toBeNull();const spent=craft(done,Object.keys(BALANCE.progression.starters)[0] as ItemTypeId);expect(spent.inventory.length).toBe(done.inventory.length+1);expect(spent.components).toBeLessThan(done.components);expect(K(spent).toNumber()).toBe(1);expect(K(advanceTo(done,done.savedAt,false).state).toNumber()).toBe(1);expect(K(resetItemProductionV3(done,'prestige')).toNumber()).toBe(1);expect(K(resetItemProductionV3(done,'axiom')).isZero()).toBe(true);
 });
 it('counts earned hardware packages without treating the starter gift as production',()=>{
  const start=prepared(),bought=buyHardwareClass(start,'calculator',25);expect(bought.hardwareCounts.calculator).toBe(25);const receipts=[...bought.telemetry.recentEvents,...bought.telemetry.permanentEvents].filter(e=>e.type==='component-found'&&e.source==='paid-hardware-package');expect(receipts.length).toBeGreaterThan(0);const expected=receipts.flatMap(e=>Object.values(JSON.parse(e.details.components as string) as Record<string,number>)).reduce((a,b)=>a+b,0);expect(K(bought).toNumber()).toBe(expected);expect(K(buyHardwareClass(bought,'calculator',1)).toNumber()).toBe(expected);
  const fifty=buyHardwareClass(bought,'calculator',25),up=buyClassUpgrade(fifty,'calculator');expect(up).not.toBe(fifty);expect(K(up).compare(K(fifty))).toBeGreaterThan(0);expect(buyClassUpgrade(up,'calculator')).toBe(up);
 });
 it('sums scientific counters past normal range without changing regular-mode saves',()=>{
  const s=prepared();s.itemSystemV3={...s.itemSystemV3!,componentsProduced:S.fromString('1e1000').toJSON()};expect(K(recordItemComponentsV3(s,{circuits:100},'analysis')).compare(K(s))).toBeGreaterThan(0);
  const normal=newGame(1000);expect(grantComponents(normal,{circuits:3},'analysis').itemSystemV3).toBeUndefined();expect(()=>recordItemComponentsV3(prepared(),{circuits:Infinity},'analysis')).toThrow();
 });
});
