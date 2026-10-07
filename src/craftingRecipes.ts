import {BALANCE, type CraftingJob, type CraftingReservation, type ComponentInventory, type ModuleInventory} from './economy';

const scaled=<T extends string>(source:Partial<Record<T,number>>,quantity:number)=>Object.fromEntries(Object.entries(source).map(([id,n])=>[id,Number(n)*quantity])) as Partial<Record<T,number>>;
export const validCraftingQuantity=(quantity:unknown):quantity is number=>typeof quantity==='number'&&Number.isSafeInteger(quantity)&&quantity>0;
export type CraftingRecipe={quantity:number;ingredients:CraftingReservation;durationPerUnit:number;result:CraftingJob['result']};
/** Full order costs, shared by preview, reservation and save validation. No prices are changed. */
export function craftingRecipe(kind:CraftingJob['kind'],id:string,quantity=1,legacyFragments=false):CraftingRecipe|null {
 if(!validCraftingQuantity(quantity))return null;
 let ingredients:CraftingReservation,durationPerUnit:number,result:CraftingJob['result'];
 if(kind==='module'&&Object.hasOwn(BALANCE.modules,id)){
  const moduleId=id as keyof typeof BALANCE.modules,recipe=BALANCE.modules[moduleId];
  ingredients={components:scaled(recipe.ingredients,quantity),modules:{},data:recipe.data*quantity,blueprints:0};
  durationPerUnit=BALANCE.craftingSeconds.module;result={kind,id:moduleId};
 }else if(kind==='item'&&Object.hasOwn(BALANCE.itemRecipes,id)){
  const itemId=id as keyof typeof BALANCE.itemRecipes,recipe=BALANCE.itemRecipes[itemId];
  ingredients={components:scaled(recipe.ingredients,quantity),modules:scaled(recipe.modules,quantity),data:recipe.data*quantity,blueprints:legacyFragments?recipe.blueprints*quantity:0};
  durationPerUnit='duration' in recipe?recipe.duration:BALANCE.craftingSeconds[recipe.rarity];result={kind,id:itemId,rarity:recipe.rarity};
 }else return null;
 // Recipe quantities are discrete native integers; reject multiplication overflow rather than clamp.
 if(![...Object.values(ingredients.components),...Object.values(ingredients.modules),ingredients.data,ingredients.blueprints,durationPerUnit*1000*quantity].every(n=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=0))return null;
 return{quantity,ingredients,durationPerUnit,result};
}
export function sameReservation(actual:CraftingReservation,expected:CraftingReservation){
 const sameMap=(a:Partial<ComponentInventory>|Partial<ModuleInventory>,b:typeof a)=>Object.keys(a).every(id=>Object.hasOwn(b,id)||a[id as keyof typeof a]===0)&&Object.keys(b).every(id=>(a[id as keyof typeof a]??0)===b[id as keyof typeof b]);
 return sameMap(actual.components,expected.components)&&sameMap(actual.modules,expected.modules)&&actual.data===expected.data&&actual.blueprints===expected.blueprints;
}
