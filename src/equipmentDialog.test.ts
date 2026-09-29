import {describe,expect,it} from 'vitest';
import {addCredits,equipmentSlotCount,exactEconomyValue,newGame,type GameState} from './economy';
import {buyEquipmentSlot,createItem,equip,unequip} from './inventory';
import {equipmentPreview} from './EquipmentDialog';
import {prestige} from './prestige';
import {ScientificNumber} from './scientificNumber';
import {restore,serialize} from './storage';

describe('persistent AI equipment slots',()=>{
 it('opens exactly one free slot after the first prestige',()=>{const base=newGame(0),ready=addCredits(base,1e12),after=prestige(ready);expect(equipmentSlotCount(base)).toBe(0);expect(equipmentSlotCount(after)).toBe(1);expect(after.purchasedEquipmentSlots).toBe(0)});
 it('buys slots with exact scientific credits, protects double clicks, and persists through prestige',()=>{let s={...addCredits(newGame(0),1e21),prestigeCount:1};const before=exactEconomyValue(s,'credits');s=buyEquipmentSlot(s,2);expect(equipmentSlotCount(s)).toBe(2);expect(exactEconomyValue(s,'credits').compare(before.subtract(ScientificNumber.from(1e9)))).toBe(0);expect(buyEquipmentSlot(s,2)).toBe(s);const beforeThird=exactEconomyValue(s,'credits');s=buyEquipmentSlot(s,3);expect(exactEconomyValue(s,'credits').compare(beforeThird.subtract(ScientificNumber.from(1e20)))).toBe(0);expect(equipmentSlotCount(s)).toBe(3);expect(s.purchasedEquipmentSlots).toBe(2);const retained=prestige({...s,lifetimeEligibleCredits:1e30,exactEconomy:{...s.exactEconomy,lifetimeEligibleCredits:{m:1,e:30}}});expect(retained.purchasedEquipmentSlots).toBe(2);expect(equipmentSlotCount(retained)).toBe(3)});
 it('honors free prestige-node slots without exceeding three',()=>{const base={...newGame(0),prestigeCount:1,nodes:['manufacturing1','manufacturing5']};expect(equipmentSlotCount(base)).toBe(3);expect(equipmentSlotCount({...base,purchasedEquipmentSlots:2})).toBe(3)});
});

describe('equipment transactions and preview',()=>{
 const stocked=()=>{let s:GameState={...newGame(0),prestigeCount:1,purchasedEquipmentSlots:2};s=createItem(s,'quantum-chip','common');s=createItem(s,'neural-asic','rare');s=createItem(s,'memory-crystal','common');return s};
 it('equips, replaces, and removes without deleting item instances or duplicating occupancy',()=>{let s=stocked(),ids=s.inventory.map(item=>item.id);s=equip(s,ids[0]);expect(s.equipped.processor).toBe(ids[0]);s=equip(s,ids[1]);expect(s.equipped.processor).toBe(ids[1]);expect(s.inventory.map(item=>item.id)).toEqual(ids);expect(equip(s,ids[1])).toBe(s);s=unequip(s,'processor');expect(s.equipped.processor).toBeUndefined();expect(s.inventory.map(item=>item.id)).toEqual(ids);const reloaded=restore(serialize({...s,purchasedEquipmentSlots:2}),0).state;expect(reloaded.purchasedEquipmentSlots).toBe(2);expect(reloaded.equipped).toEqual(s.equipped);expect(reloaded.inventory.map(item=>item.id)).toEqual(ids)});
 it('enforces category locks and preview equals the real equipped economy',()=>{const stockedBase={...stocked(),purchasedEquipmentSlots:0},core=stockedBase.inventory.find(item=>item.type==='memory-crystal')!,processor=stockedBase.inventory.find(item=>item.type==='quantum-chip')!,base=equip(stockedBase,processor.id);expect(equip(base,core.id).equipped.core).toBeUndefined();const preview=equipmentPreview(base,processor.id)!,actual=equip(base,processor.id),actualPreview=equipmentPreview(actual,processor.id)!;expect(preview.state.equipped.processor).toBe(processor.id);expect(preview.after).toEqual(actualPreview.before)});
});
