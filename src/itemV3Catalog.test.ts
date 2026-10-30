import {describe,expect,it} from 'vitest';
import {BALANCE,itemTypes,lateMetaItemUnlocked,newV3ItemCatalog,newGame,type GameState,type ItemTypeId} from './economy';
import {newItemSystemV3} from './itemSystemV3';
import {blueprintQuote,learnBlueprint} from './blueprints';
import {randomItem} from './inventory';

const extra=Object.keys(newV3ItemCatalog) as (keyof typeof newV3ItemCatalog)[];
const prepared=():GameState=>{
 const g=newGame(1000,'isolated-new-v3-catalog');
 return {...g,itemSystemV3:newItemSystemV3(),nodes:['T06','F03'],discovered:[...g.discovered,'campus'],hardwareCounts:{...g.hardwareCounts,campus:1},completedResearch:['blueprints'],discoveredComponents:['circuits'],axiomResetCount:3,blueprintFragments:1000};
};

describe('all six proposed V3 items have deterministic guarded recipes',()=>{
 it('registers exactly 42 stable distinct types with six real component recipes',()=>{
  expect(Object.keys(itemTypes)).toHaveLength(42);
  expect(extra).toHaveLength(6);
  expect(new Set(Object.keys(itemTypes)).size).toBe(42);
  for(const id of extra){
   const def=newV3ItemCatalog[id],recipe=BALANCE.itemRecipes[id];
   expect(itemTypes[id].name).toBe(def.name);
   expect(itemTypes[id].slot).toBe(def.slot);
   expect(recipe.data).toBeGreaterThan(0);
   expect(recipe.blueprints).toBeGreaterThan(0);
   expect(Object.values(recipe.ingredients).every(v=>Number.isSafeInteger(v)&&v>=0)).toBe(true);
   expect(Object.values(recipe.modules).every(v=>Number.isSafeInteger(v)&&v>=0)).toBe(true);
   expect(BALANCE.itemMaterialFamilies[id].base).toBeTruthy();
   expect(BALANCE.itemMaterialFamilies[id].rare).toBeTruthy();
  }
 });
 it('never exposes one of the six in normal V2 loot, even at extreme RNG endpoints',()=>{
  const s=newGame(1000,'normal-v2-still-safe');
  for(const id of extra)expect(lateMetaItemUnlocked(s,id)).toBe(false);
  for(const roll of [0,.01,.15,.35,.5,.7,.9,.99999]){
   const n=randomItem(s,()=>roll);
   expect(extra).not.toContain(n.inventory[n.inventory.length-1].type);
  }
 });
 it('respects the six separate V3 acquisition gates',()=>{
  const all=prepared();
  for(const id of extra)expect(lateMetaItemUnlocked(all,id)).toBe(true);
  expect(lateMetaItemUnlocked({...all,discovered:['calculator'],hardwareCounts:{...all.hardwareCounts,campus:0}},'fleet-coordinator')).toBe(false);
  expect(lateMetaItemUnlocked({...all,nodes:['F03']},'gradient-buffer')).toBe(false);
  expect(lateMetaItemUnlocked({...all,nodes:['T06']},'overdrive-capacitor')).toBe(false);
  expect(lateMetaItemUnlocked({...all,completedResearch:[]},'synthesis-coordinator')).toBe(false);
  expect(lateMetaItemUnlocked({...all,axiomResetCount:2},'singularity-lens')).toBe(false);
  expect(lateMetaItemUnlocked({...all,axiomResetCount:0},'axiom-anchor')).toBe(false);
 });
 it('charges exactly the fixed blueprint costs and does not grant a free item',()=>{
  let s=prepared();
  for(const id of extra){
   const q=blueprintQuote(s,id);
   expect(q.prerequisite,id).toBe(true);
   expect(q.price,id).toBe(BALANCE.itemRecipes[id].blueprints);
   expect(q.canLearn,id).toBe(true);
   const old=s.blueprintFragments,inventory=s.inventory.length;
   s=learnBlueprint(s,id);
   expect(s.blueprintFragments,id).toBe(old-q.price);
   expect(s.inventory.length,id).toBe(inventory);
   expect(blueprintQuote(s,id).learned,id).toBe(true);
   expect(learnBlueprint(s,id)).toBe(s);
  }
 });
});
