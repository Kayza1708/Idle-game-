import {describe,it,expect} from 'vitest';
import {newGame,BALANCE,type GameState} from './economy';
import {newItemSystemV3,itemWorkFactorV3} from './itemSystemV3';
import {createItem,equip} from './inventory';
const prepared=()=>{let s:GameState={...newGame(1000,'prepared-blueprint-archive'),itemSystemV3:newItemSystemV3()};s=createItem(s,'blueprint-archive','common');return equip(s,s.inventory[0].id);};
describe('V3 blueprint archive valid distinct mastery',()=>{
 it('ignores unknown names without deleting their original values',()=>{const s=prepared(),mixed={...s,blueprintMastery:{...s.blueprintMastery,'quantum-chip':3,'foreign-blueprint':100,'toString':2}},before=JSON.stringify(mixed.blueprintMastery),base=itemWorkFactorV3(s,true);expect(itemWorkFactorV3(mixed,true)/base).toBeCloseTo(1+BALANCE.itemV3.blueprint.perBlueprint,12);expect(JSON.stringify(mixed.blueprintMastery)).toBe(before);});
 it('does not treat inherited properties as earned mastery',()=>{const s=prepared(),inherited={...s,blueprintMastery:Object.create({'quantum-chip':10}) as GameState['blueprintMastery']};expect(itemWorkFactorV3(inherited,true)).toBe(itemWorkFactorV3(s,true));});
 it('counts each existing blueprint once and ignores mastery zero',()=>{const s=prepared(),one={...s,blueprintMastery:{...s.blueprintMastery,'quantum-chip':1}},many={...s,blueprintMastery:{...s.blueprintMastery,'quantum-chip':100,'insight-archive':4}};expect(itemWorkFactorV3(many,true)/itemWorkFactorV3(s,true)).toBeCloseTo(1+2*BALANCE.itemV3.blueprint.perBlueprint,12);expect(itemWorkFactorV3({...one,blueprintMastery:{...one.blueprintMastery,'quantum-chip':100}},true)).toBe(itemWorkFactorV3(one,true));});
});
