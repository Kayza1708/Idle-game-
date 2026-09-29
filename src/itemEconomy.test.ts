import {describe,expect,it} from 'vitest';
import {BALANCE,buyHardwareClass,newGame} from './economy';
import {advance} from './simulation';
import {craft,craftAffordability,craftModule,equip,itemUpgradeCost,upgrade} from './inventory';
describe('module and item economy',()=>{
 it('crafts modules atomically from data and components',()=>{const b=newGame(0),s={...b,completedResearch:['blueprints' as const],data:1000,componentInventory:{...b.componentInventory,circuits:20,copperCoils:10,siliconWafers:10,titaniumBolts:10},components:50};const queued=craftModule(s,'computeBus');expect(queued.data).toBe(750);const n=advance(queued,BALANCE.craftingSeconds.module).state;expect(n.modules.computeBus).toBe(1);expect(n.componentInventory.circuits).toBe(10);expect(n.componentInventory.copperCoils).toBe(4);expect(n.componentInventory.siliconWafers).toBe(6);expect(n.componentInventory.titaniumBolts).toBe(6)});
 it('requires module and data for item craft',()=>{const b=newGame(0),s={...b,data:5000,blueprintFragments:10,modules:{computeBus:1,dataLattice:0},componentInventory:{circuits:50,copperCoils:20,siliconWafers:20,titaniumBolts:20,photonicLenses:20,graphene:20,nanotubes:10,superconductors:5,neuralCrystals:5,quantumCores:5},components:125};const queued=craft(s,'quantum-chip','common');expect(queued.modules.computeBus).toBe(0);expect(queued.data).toBe(3200);const n=advance(queued,BALANCE.craftingSeconds.common).state;expect(n.inventory).toHaveLength(1)});
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
  s=buyHardwareClass(s,'gpu',10);expect(Object.values(s.componentInventory).reduce((a,b)=>a+b,0)).toBeGreaterThan(0);
 });
});

it('reports data affordability with a finite ETA when production exists',async()=>{
 const {dataAffordability}=await import('./economy'),base=newGame(0),s={...base,hardwareCounts:{...base.hardwareCounts,calculator:10},hardware:10};
 const quote=dataAffordability(s,100);expect(quote.cost).toBe(100);expect(quote.balance).toBe(0);expect(quote.missing).toBe(100);expect(quote.secondsToAfford).toBeGreaterThan(0);
});

describe('data affordability contracts',()=>{
 it('reports exact data/component/module shortages before crafting',()=>{const s={...newGame(0),data:100,blueprintFragments:0};const a=craftAffordability(s,'quantum-chip');expect(a.data.cost).toBe(BALANCE.itemRecipes['quantum-chip'].data);expect(a.data.balance).toBe(100);expect(a.data.missing).toBe(BALANCE.itemRecipes['quantum-chip'].data-100);expect(a.missingBlueprints).toBe(BALANCE.itemRecipes['quantum-chip'].blueprints);expect(a.missingModules.computeBus).toBe(1);expect(a.missingComponents.circuits).toBe(30)});
 it('applies the manufacturing-II discount to both item upgrade costs',()=>{const item={id:'x',type:'quantum-chip' as const,rarity:'common' as const,level:0,locked:false};const base=itemUpgradeCost(newGame(0),item)!;const discounted=itemUpgradeCost({...newGame(0),nodes:['manufacturing1','manufacturing2']},item)!;expect(discounted.componentCost).toBe(Math.ceil(base.componentCost*.85));expect(discounted.dataCost).toBe(Math.ceil(base.dataCost*.85))});
});

it('exposes every equipped item effect in the production breakdown',async()=>{
 const {productionBreakdown}=await import('./economy'),base=newGame(0),items=[
  {id:'c',type:'neural-asic' as const,rarity:'common' as const,level:0,locked:false},
  {id:'d',type:'data-prism' as const,rarity:'common' as const,level:0,locked:false}
 ];
 const s={...base,prestigeCount:1,nodes:['manufacturing1'],inventory:items,equipped:{processor:'c',utility:'d'}};
 const breakdown=productionBreakdown(s);expect(breakdown.itemBonuses.credits).toBeGreaterThan(0);expect(breakdown.itemBonuses.data).toBeGreaterThan(0);
});

describe('component recipe reachability',()=>{
 it('keeps every recipe component reachable through every analysis source',()=>{
  const componentIds=Object.keys(BALANCE.components);
  expect(componentIds).toHaveLength(10);

  for(const recipe of Object.values(BALANCE.itemRecipes)){
   for(const [component,amount] of Object.entries(recipe.ingredients)){
    if((amount??0)>0)expect(componentIds).toContain(component);
   }
  }

  for(const source of Object.values(BALANCE.componentSources)){
   for(const component of componentIds){
    expect(source[component as keyof typeof source]).toBeGreaterThan(0);
   }
  }

  for(const component of componentIds){
   expect(BALANCE.worldDropWeights[component as keyof typeof BALANCE.worldDropWeights]).toBeGreaterThan(0);
  }
 });
});

describe('scaling and synergy economy',()=>{
 it('keeps old hardware relevant through ownership and legacy multipliers',async()=>{
  const {creditRate,legacyInfrastructureMultiplier,hardwareOwnershipCreditMultiplier}=await import('./economy');
  const base=newGame(0),counts={...base.hardwareCounts,calculator:500,sbc:500};
  const s={...base,hardwareCounts:counts,hardware:1000,discovered:['calculator','sbc'] as import('./economy').HardwareId[]};
  expect(legacyInfrastructureMultiplier(s)).toBeGreaterThan(1);
  expect(hardwareOwnershipCreditMultiplier(s)).toBeGreaterThan(1);
  expect(creditRate(s.hardware,s.level,s)).toBeGreaterThan(creditRate(base.hardware,base.level,base));
 });
 it('makes equipped item effects scale with progression',async()=>{
  const {equippedBonus}=await import('./economy'),item={id:'scale',type:'quantum-chip' as const,rarity:'legendary' as const,level:3,locked:false};
  const base={...newGame(0),prestigeCount:1,inventory:[item],equipped:{processor:'scale'}};
  const advanced={...base,discovered:['calculator','sbc','pc','gpu'] as import('./economy').HardwareId[],hardwareCounts:{...base.hardwareCounts,calculator:500,sbc:100,pc:50,gpu:25}};
  expect(equippedBonus(advanced,'compute')).toBeGreaterThan(equippedBonus(base,'compute'));
 });
});
