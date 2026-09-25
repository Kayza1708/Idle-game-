import {describe,expect,it} from 'vitest';
import {newGame} from './economy';
import {craft,craftModule,upgrade} from './inventory';
describe('module and item economy',()=>{
 it('crafts modules atomically from data and components',()=>{const b=newGame(0),s={...b,nodes:['manufacturing3'],data:1000,componentInventory:{...b.componentInventory,circuits:20,laser:10,titaniumBolts:10},components:40};const n=craftModule(s,'computeBus');expect(n.modules.computeBus).toBe(1);expect(n.data).toBe(750);expect(n.componentInventory.circuits).toBe(10)});
 it('requires module and data for item craft',()=>{const b=newGame(0),s={...b,data:5000,blueprintFragments:10,modules:{computeBus:1,dataLattice:0},componentInventory:{circuits:50,laser:20,graphene:20,titaniumBolts:20,nanotubes:10,quantumCores:5},components:125};const n=craft(s,'quantum-chip','common');expect(n.inventory).toHaveLength(1);expect(n.modules.computeBus).toBe(0);expect(n.data).toBe(3800)});
 it('promotes rarity and applies manufacturing discount',()=>{const b=newGame(0),item={id:'x',type:'quantum-chip' as const,rarity:'common' as const,level:0,locked:false},s={...b,nodes:['manufacturing2'],data:10000,componentInventory:{...b.componentInventory,circuits:1000},components:1000,inventory:[item]};const n=upgrade(s,'x');expect(n.inventory[0].rarity).toBe('uncommon');expect(n.data).toBeLessThan(s.data)});
});
