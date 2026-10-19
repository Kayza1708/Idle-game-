import {describe,it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {newGame,grantComponents,addDataScientific,componentIds,type GameState} from './economy';
import {ScientificNumber} from './scientificNumber';
import {craft,createItem,fuseItems} from './inventory';
import {itemActionEvent} from './itemActionEvents';
import {forgeFlights,FORGE_MOTION} from './forgeMotion';
import {ForgeActionReceipt} from './ForgeActionStage';
import {serialize,restore} from './storage';
const rich=():GameState=>grantComponents(addDataScientific({...newGame(0),completedResearch:['blueprints'],learnedRecipes:['quantum-chip']},ScientificNumber.from(1e9)),Object.fromEntries(componentIds.map(id=>[id,1000])));
describe('physical forge receipts and flight paths',()=>{
 it('uses only actual paid component quantities and leaves inventory granted before animation',()=>{
  const before=rich(),after=craft(before,'quantum-chip'),snapshot=serialize(after),receipt=itemActionEvent('craft',before,after)!;
  expect(after.inventory).toHaveLength(1);expect(after.crafting.active).toBeNull();expect(after.crafting.queue).toEqual([]);
  const flights=forgeFlights(receipt);expect(flights.map(f=>f.id)).toEqual(Object.keys(receipt.components).filter(id=>receipt.components[id as keyof typeof receipt.components]!>0).slice(0,4));expect(flights.every(f=>f.x>=0&&f.x<=100&&f.y>=0&&f.y<=100)).toBe(true);expect(serialize(after)).toBe(snapshot);expect(restore(snapshot,0).state.inventory).toEqual(after.inventory);
 });
 it('keeps the retained highest-level fusion input in its original physical slot',()=>{
  let before=rich();for(let n=0;n<3;n++)before=createItem(before,'quantum-chip','common');before={...before,inventory:before.inventory.map((item,index)=>({...item,level:[1,3,2][index]}))};
  const order=before.inventory.map(i=>i.id),after=fuseItems(before,order),receipt=itemActionEvent('item-fuse',before,after)!,flights=forgeFlights(receipt,order);
  expect(receipt.item.id).toBe(order[1]);expect(receipt.item.rarity).toBe('uncommon');expect(flights.find(f=>f.retained)).toMatchObject({id:order[1],slot:1,x:50,y:79});expect(new Set(flights.map(f=>f.id))).toEqual(new Set(order));expect(after.inventory).toHaveLength(1);expect(after.progression.fusion).toBeNull();expect(fuseItems(after,order)).toBe(after);
  const html=renderToStaticMarkup(<ForgeActionReceipt event={{...receipt,serial:1}} language="de"/>);expect(html).toContain('Gewöhnlich → Ungewöhnlich');expect(html).toContain('fusioniert');expect(html).not.toContain('Weiter');
 });
 it('has bounded short display sequences; they never change the instant transaction',()=>{expect(FORGE_MOTION.craft.duration).toBeLessThanOrEqual(1100);expect(FORGE_MOTION.fusion.duration).toBeLessThanOrEqual(1400);for(const sequence of Object.values(FORGE_MOTION))expect(sequence.reveal).toBeLessThan(sequence.duration)});
});
