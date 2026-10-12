import {withChallengeAccess} from './testSupport/challengeAccount';
import {describe,it,expect} from 'vitest';
import originalRecipes from './testSupport/originalItemRecipes.json';
import originalEffects from './testSupport/originalItemEffects.json';
import {BALANCE,newGame,addData,addCredits,spendResources,grantComponents,itemTypes,itemEffectProfile,itemEffectFor,hardwareIds,type Item,type GameState,type ComponentId} from './economy';
import {blueprintQuote,learnBlueprint,recipeIds} from './blueprints';
import {craftingRecipe} from './craftingRecipes';
import {craft,craftModule,createItem,settleCrafting,runCraftingPlanner,craftAffordability} from './inventory';
import {restore,serialize,importGame} from './storage';
import {balanceContexts} from './balanceSnapshot';
import {createBalanceExportFiles} from './balanceReport';
import {pinnableGoals,resolvePinnedGoal} from './nextGoal';
import {prestige} from './prestige';
import {startRunChallenge,abortRunChallenge} from './retention';

// Independent acceptance catalogue: singular names in the brief map to existing plural inventory IDs.
const expected={
 'photonic-array':{components:{circuits:20,copperCoils:8,siliconWafers:12,photonicLenses:6},modules:{computeBus:1},data:1200,price:6,seconds:900,effect:'training'},
 'memory-crystal':{components:{circuits:16,siliconWafers:16,graphene:6,neuralCrystals:2},modules:{dataLattice:1},data:1800,price:6,seconds:1200,effect:'credits'},
 'logic-seed':{components:{circuits:12,siliconWafers:10,graphene:4,nanotubes:2,neuralCrystals:1},modules:{dataLattice:1},data:1500,price:6,seconds:900,effect:'training'},
 'tensor-core':{components:{circuits:36,siliconWafers:20,titaniumBolts:12,graphene:6,nanotubes:4,superconductors:2},modules:{computeBus:1,dataLattice:1},data:3000,price:8,seconds:1800,effect:'compute'},
 'lab-drone':{components:{circuits:24,copperCoils:12,titaniumBolts:16,photonicLenses:8,nanotubes:4,quantumCores:1},modules:{computeBus:1,dataLattice:1},data:3600,price:10,seconds:1800,effect:'research'},
} as const;
const ids=Object.keys(expected) as (keyof typeof expected)[];
const reload=(s:GameState)=>{const r=restore(serialize(s),s.savedAt);expect(r.error).toBeUndefined();return r.state;};
function prepared(id:typeof ids[number],quantity=1){const e=expected[id];return grantComponents({...addData(newGame(0),e.data*quantity),completedResearch:['blueprints'],blueprintFragments:e.price,modules:{computeBus:0,dataLattice:0,...Object.fromEntries(Object.entries(e.modules).map(([k,n])=>[k,n*quantity]))}},Object.fromEntries(Object.entries(e.components).map(([k,n])=>[k,n*quantity])));}
describe('9C complete item catalogue',()=>{
 it('retains every original item effect at all rarities and both baseline/progressed levels',()=>{
  const base=newGame(0),advanced={...base,discovered:hardwareIds,hardwareCounts:Object.fromEntries(hardwareIds.map(id=>[id,500])) as GameState['hardwareCounts']};
  for(const row of originalEffects){const item={id:'baseline',type:row.type,rarity:row.rarity,level:0,forge:0,locked:false} as Item,profile=itemEffectProfile(item);expect(profile).toEqual(row.profile);expect(profile.map(e=>itemEffectFor(base,item,e))).toEqual(row.base);expect(profile.map(e=>itemEffectFor(advanced,{...item,level:3,forge:2},e))).toEqual(row.advanced);}
 });
 it('retains all six pre-9C recipe values from freshly fetched origin/main',()=>{expect(Object.fromEntries(recipeIds.slice(0,6).map(id=>[id,BALANCE.itemRecipes[id]]))).toEqual(originalRecipes);});
 it('covers all eleven types exactly once and appends the five recipes in order',()=>{expect(recipeIds).toHaveLength(30);expect(new Set(recipeIds).size).toBe(30);expect([...recipeIds].sort()).toEqual(Object.keys(itemTypes).sort());expect(recipeIds.slice(6,11)).toEqual(ids);for(const id of recipeIds)expect(craftingRecipe('item',id)?.result).toEqual({kind:'item',id,rarity:'common'});});
 it.each(ids)('%s has exact costs, zero unspecified ingredients, completed research and a one-time learning price',id=>{
  const e=expected[id],s=prepared(id),r=BALANCE.itemRecipes[id];expect(r.research).toBe('blueprints');expect(r.blueprints).toBe(e.price);expect(r.duration).toBe(e.seconds);
  expect(craftingRecipe('item',id)!.ingredients).toEqual({components:Object.fromEntries(Object.keys(BALANCE.itemRecipes[id].ingredients).map(k=>[k,e.components[k as keyof typeof e.components]??0])),modules:e.modules,data:e.data,blueprints:0});
  const areaOnly={...s,researchAreas:['materials' as const],completedResearch:[]};expect(blueprintQuote(areaOnly,id)).toMatchObject({prerequisite:false,learned:false,canLearn:false});expect(learnBlueprint(areaOnly,id)).toBe(areaOnly);expect(craft(areaOnly,id)).toBe(areaOnly);
  expect(blueprintQuote(s,id)).toMatchObject({prerequisite:true,learned:false,canLearn:true,price:e.price});expect(craft(s,id)).toBe(s);
  const short={...s,blueprintFragments:e.price-1};expect(blueprintQuote(short,id).missing).toBe(1);expect(learnBlueprint(short,id)).toBe(short);
  const learned=learnBlueprint(s,id);expect(learned.blueprintFragments).toBe(0);expect(learnBlueprint(learned,id)).toBe(learned);expect(reload(learned).learnedRecipes).toEqual([id]);
  const withoutResearch={...learned,completedResearch:[]};expect(blueprintQuote(withoutResearch,id)).toMatchObject({learned:true,prerequisite:false,accessible:false});expect(craft(withoutResearch,id)).toBe(withoutResearch);
 });
 it.each(ids)('%s pays each full order once, preserves partial/reloaded completion and permits fragment-free follow-up',id=>{
  const e=expected[id],s=learnBlueprint(prepared(id,3),id),paid=craft(s,id,'common',2);expect(paid.credits).toBe(s.credits);expect(paid.data).toBe(e.data);expect(paid.crafting.active!.ingredients).toEqual(craftingRecipe('item',id,2)!.ingredients);
  for(const [k,n] of Object.entries(e.components))expect(paid.componentInventory[k as ComponentId]).toBe(n);
  for(const [k,n] of Object.entries(e.modules))expect(paid.modules[k as keyof typeof paid.modules]).toBe(n);
  const queued=craft(paid,id);expect(queued.data).toBeCloseTo(0,8);expect(queued.blueprintFragments).toBe(0);expect(craft(queued,id)).toBe(queued);
  const partial=settleCrafting({...reload(queued),savedAt:e.seconds*1000});expect(partial.inventory).toHaveLength(1);expect(partial.crafting.active!.completed).toBe(1);
  const done=settleCrafting({...reload(partial),savedAt:e.seconds*3000});expect(done.inventory).toHaveLength(3);expect(done.inventory.every(i=>i.type===id&&i.rarity==='common'&&i.level===0&&(i.forge??0)===0)).toBe(true);expect(done.data).toBe(queued.data);expect(done.crafting).toEqual({active:null,queue:[]});expect(settleCrafting(reload(done)).inventory).toEqual(done.inventory);
  expect(itemEffectProfile(done.inventory[0])).toEqual([e.effect]);expect(done.learnedRecipes).toEqual([id]);
 });
 it.each(ids)('%s rejects each ingredient/module/Data shortage atomically and a competing start cannot reuse stock',id=>{
  const s=learnBlueprint(prepared(id),id),e=expected[id];
  for(const k of Object.keys(e.components) as ComponentId[]){const short={...s,componentInventory:{...s.componentInventory,[k]:s.componentInventory[k]-1}};expect(craft(short,id)).toBe(short);expect(craftAffordability(short,id).missingComponents[k]).toBe(1);}
  for(const k of Object.keys(e.modules) as (keyof typeof s.modules)[]){const short={...s,modules:{...s.modules,[k]:0}};expect(craft(short,id)).toBe(short);expect(craftAffordability(short,id).missingModules[k]).toBe(1);}
  const short=spendResources(s,{data:1});expect(craft(short,id)).toBe(short);expect(craft(s,id,'common',2)).toBe(s);const paid=craft(s,id);expect(craft(paid,id)).toBe(paid);
 });
 it.each(ids)('%s integrates planner, pinning, queue and bounded exports through the shared catalogue',id=>{
  const base=prepared(id),s={...base,axiomUpgrades:['craftingPlanner' as const],craftingPlanner:{enabled:true,recipeId:id,target:5 as const,elapsed:0},pinnedGoal:{kind:'recipe' as const,id}};
  expect(runCraftingPlanner(s)).toBe(s);expect(resolvePinnedGoal(s,s.pinnedGoal)?.reached).toBe(false);expect(pinnableGoals(s)).toContainEqual(s.pinnedGoal);
  const learned=learnBlueprint(s,id);expect(resolvePinnedGoal(learned,s.pinnedGoal)?.reached).toBe(true);expect(runCraftingPlanner(learned)).toEqual(craft(learned,id));
  const blocker=craftModule(grantComponents(addData(learned,350),BALANCE.modules.computeBus.ingredients),'computeBus'),queued=craft(blocker,id);expect(queued.crafting.queue[0].recipeId).toBe(id);expect(reload(queued).crafting).toEqual(queued.crafting);
  const row=balanceContexts(queued)[0].blueprints.find(r=>r.ownership.recipeId===id)!;expect(row.ownership.learned).toBe(true);expect(row.manufacturing!.ingredients.blueprints).toBe(0);expect(createBalanceExportFiles(queued,0)['crafting.csv']).toContain(id);
 });
 it.each(ids)('%s migrates historical item evidence without altering instances, but current finds never learn',id=>{
  const found=createItem(prepared(id),id,'legendary');found.inventory[0]={...found.inventory[0],level:3,forge:2,locked:true};expect(reload(found).learnedRecipes).toEqual([]);expect(craft(found,id)).toBe(found);
  const old=structuredClone(found);delete old.learnedRecipes;const result=restore(JSON.stringify({version:41,state:old}),0);expect(result.error).toBeUndefined();expect(result.state.learnedRecipes).toEqual([id]);expect(result.state.inventory).toEqual(found.inventory);expect(result.state.blueprintFragments).toBe(found.blueprintFragments);
 });
 it('keeps new ownership and migration isolated between main and challenge',()=>{
  const main=prestige(addCredits(learnBlueprint(prepared('photonic-array'),'photonic-array'),BALANCE.prestigeBaseRevenue*9));
  let challenge=startRunChallenge(withChallengeAccess(main),'no-items');expect(challenge.challengeSession).toBeDefined();challenge={...challenge,completedResearch:['blueprints'],blueprintFragments:10};challenge=learnBlueprint(challenge,'lab-drone');expect(challenge.learnedRecipes).toEqual(['lab-drone']);expect(abortRunChallenge(reload(challenge)).learnedRecipes).toEqual(['photonic-array']);
  const old=createItem(challenge,'memory-crystal','rare');old.challengeSession!.main=createItem(old.challengeSession!.main,'logic-seed','epic');delete old.learnedRecipes;delete old.challengeSession!.main.learnedRecipes;const migrated=restore(JSON.stringify({version:41,state:old}),old.savedAt);expect(migrated.error).toBeUndefined();expect(migrated.state.learnedRecipes).toEqual(['memory-crystal']);expect(migrated.state.challengeSession!.main.learnedRecipes).toEqual(['logic-seed']);
 });
 it('still rejects unknown ownership, recipe goals, planner IDs and queued recipe IDs',()=>{const s=prepared('lab-drone');for(const bad of [{...s,learnedRecipes:['missing']},{...s,pinnedGoal:{kind:'recipe',id:'missing'}},{...s,craftingPlanner:{...s.craftingPlanner,recipeId:'missing'}}])expect(()=>importGame(JSON.stringify({version:42,state:bad}))).toThrow();const job=craft(learnBlueprint(s,'lab-drone'),'lab-drone');job.crafting.active!.recipeId='missing' as never;expect(()=>importGame(JSON.stringify({version:42,state:job}))).toThrow();expect(craftingRecipe('item','missing')).toBeNull();});
});
