import {buyProgressionNode,axiomResetV2} from './progressionReset';
import {ScientificNumber as S} from './scientificNumber';
import {describe,it,expect} from 'vitest';
import {newGame,grantComponents,addData,BALANCE,type GameState} from './economy';
import {newItemSystemV3,archiveBlueprintRightV3} from './itemSystemV3';
import {blueprintQuote,learnBlueprint} from './blueprints';
import {craft,craftingAffordability} from './inventory';

const prepared=():GameState=>({...newGame(1000,'prepared-v3-archive'),itemSystemV3:newItemSystemV3(),completedResearch:['blueprints'],blueprintFragments:0});
describe('V3 archive acquisition: existing researchArchive -> I04 right',()=>{
 it('keeps the old zero fragment price and requires the earned right and research',()=>{
  expect(BALANCE.progression.legacyMap.researchArchive).toBe('I04');
  expect(BALANCE.itemRecipes['insight-archive'].blueprints).toBe(0);
  const s=prepared();expect(blueprintQuote(s,'insight-archive')).toMatchObject({price:0,canLearn:false,accessible:false});
  const budget=BALANCE.progression.nodes.I04.cost;const right=buyProgressionNode({...s,cycleINTEarned:budget,totalINTEarned:budget,unspentINT:budget,exactEconomy:{...s.exactEconomy,cycleINTEarned:S.from(budget).toJSON(),totalINTEarned:S.from(budget).toJSON(),unspentINT:S.from(budget).toJSON()},progression:{...s.progression,entitlement:S.from(budget).toJSON()}},'I04');expect(archiveBlueprintRightV3(right)).toBe(true);expect(right.unspentINT).toBe(0);expect(right.spentINT).toBe(budget);
  expect(blueprintQuote({...right,completedResearch:[]},'insight-archive').canLearn).toBe(false);
  expect(blueprintQuote({...right,itemSystemV3:undefined},'insight-archive').canLearn).toBe(false);
 });
 it('preserves purchased, historical, legacy and already learned ownership without granting items',()=>{
  const s=prepared();for(const candidate of [{...s,nodes:['I04']},{...s,progression:{...s.progression,known:['I04']}},{...s,insightArchiveBlueprint:true},{...s,itemSystemV3:{...s.itemSystemV3!,archiveBlueprintRight:true}}]){
   const q=blueprintQuote(candidate,'insight-archive');expect(q.canLearn).toBe(true);
   const learned=learnBlueprint(candidate,'insight-archive');expect(learned.learnedRecipes).toContain('insight-archive');expect(learned.inventory).toEqual(candidate.inventory);
   expect(learned.blueprintFragments).toBe(0);expect(learned.data).toBe(candidate.data);expect(learned.credits).toBe(candidate.credits);
   expect(learnBlueprint(learned,'insight-archive')).toBe(learned);
   expect(blueprintQuote({...learned,nodes:[],progression:{...learned.progression,known:[]}},'insight-archive').accessible).toBe(true);
  }
 });
 it('uses the existing actual recipe and payment once for instant crafting',()=>{
  const s=learnBlueprint({...prepared(),nodes:['I04']},'insight-archive');expect(craft(s,'insight-archive')).toBe(s);
  const funded=grantComponents({...addData(s,1e12),modules:{computeBus:100,dataLattice:100}},Object.fromEntries(Object.keys(BALANCE.components).map(id=>[id,100000])));
  const quote=craftingAffordability(funded,'item','insight-archive');expect(quote.affordable).toBe(true);
  const made=craft(funded,'insight-archive');expect(made.inventory).toHaveLength(1);expect(made.inventory[0].type).toBe('insight-archive');expect(made.crafting.active).toBeNull();
  expect(funded.data-made.data).toBe(quote.recipe!.ingredients.data);expect(made.blueprintFragments).toBe(0);
  const cycle=S.fromString('1e12').toJSON(),ready={...made,cycleINTEarned:1e12,totalINTEarned:1e12,unspentINT:1e12,exactEconomy:{...made.exactEconomy,cycleINTEarned:cycle,totalINTEarned:cycle,unspentINT:cycle},itemSystemV3:{...made.itemSystemV3!,axiomDiscovered:true,axiomDiscoveryAt:1000},progression:{...made.progression,entitlement:cycle,known:Object.keys(BALANCE.progression.nodes).slice(0,30).concat('I04')}};
  const reset=axiomResetV2(ready);expect(reset.axiomResetCount).toBe(1);expect(reset.inventory).toEqual(made.inventory);expect(blueprintQuote(reset,'insight-archive').accessible).toBe(true);
  const noRight=prepared();expect(craft(funded,'unknown' as never)).toBe(funded);expect(learnBlueprint(noRight,'insight-archive')).toBe(noRight);
 });
});
