import {describe,expect,it} from 'vitest';
import {buyHardwareClass,newGame} from './economy';
import {craft,craftModule,equip,upgrade} from './inventory';
describe('module and item economy',()=>{
 it('crafts modules atomically from data and components',()=>{const b=newGame(0),s={...b,nodes:['manufacturing3'],data:1000,componentInventory:{...b.componentInventory,circuits:20,laser:10,titaniumBolts:10},components:40};const n=craftModule(s,'computeBus');expect(n.modules.computeBus).toBe(1);expect(n.data).toBe(750);expect(n.componentInventory.circuits).toBe(10)});
 it('requires module and data for item craft',()=>{const b=newGame(0),s={...b,data:5000,blueprintFragments:10,modules:{computeBus:1,dataLattice:0},componentInventory:{circuits:50,laser:20,graphene:20,titaniumBolts:20,nanotubes:10,quantumCores:5},components:125};const n=craft(s,'quantum-chip','common');expect(n.inventory).toHaveLength(1);expect(n.modules.computeBus).toBe(0);expect(n.data).toBe(3800)});
 it('promotes rarity and applies manufacturing discount',()=>{const b=newGame(0),item={id:'x',type:'quantum-chip' as const,rarity:'common' as const,level:0,locked:false},s={...b,nodes:['manufacturing2'],data:10000,componentInventory:{...b.componentInventory,circuits:1000},components:1000,inventory:[item]};const n=upgrade(s,'x');expect(n.inventory[0].rarity).toBe('uncommon');expect(n.data).toBeLessThan(s.data)});
});

describe('durable equipment sockets and component sources',()=>{
 it('unlocks socket one at first prestige and socket two from manufacturing I',()=>{
  const base=newGame(0),item={id:'socket-item',type:'quantum-chip' as const,rarity:'common' as const,level:0,locked:false};
  const locked=equip({...base,inventory:[item]},item.id);expect(locked.equipped).toEqual({});
  const one=equip({...base,prestigeCount:1,inventory:[item]},item.id);expect(one.equipped.processor).toBe(item.id);
  const second={id:'socket-item-2',type:'field-scanner' as const,rarity:'common' as const,level:0,locked:false};
  const blocked=equip({...one,inventory:[item,second]},second.id);expect(blocked.equipped.research).toBeUndefined();
  const opened=equip({...one,nodes:['manufacturing1'],inventory:[item,second]},second.id);expect(opened.equipped.research).toBe(second.id);
 });
 it('grants titanium on hardware milestones and lasers on gaming GPU milestones',()=>{
  let s={...newGame(0),credits:1e12,discovered:['calculator','sbc','pc','gpu'] as import('./economy').HardwareId[]};
  s=buyHardwareClass(s,'sbc',10);expect(s.componentInventory.titaniumBolts).toBeGreaterThanOrEqual(1);
  s=buyHardwareClass(s,'gpu',10);expect(s.componentInventory.laser).toBeGreaterThanOrEqual(1);
 });
});

it('reports data affordability with a finite ETA when production exists',async()=>{
 const {dataAffordability}=await import('./economy'),base=newGame(0),s={...base,hardwareCounts:{...base.hardwareCounts,calculator:10},hardware:10};
 const quote=dataAffordability(s,100);expect(quote.cost).toBe(100);expect(quote.balance).toBe(0);expect(quote.missing).toBe(100);expect(quote.secondsToAfford).toBeGreaterThan(0);
});
