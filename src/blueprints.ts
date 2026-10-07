import {BALANCE,type GameState,type CraftingJob} from './economy';
import {addEvent} from './telemetry';
export type RecipeId=keyof typeof BALANCE.itemRecipes;
export const recipeIds=Object.keys(BALANCE.itemRecipes) as RecipeId[];
export function blueprintQuote(s:GameState,id:string){
 const recipe=Object.hasOwn(BALANCE.itemRecipes,id)?BALANCE.itemRecipes[id as RecipeId]:null;
 const prerequisite=!!recipe&&(id==='impulse-relay'?s.impulseRelayBlueprint:id==='insight-archive'?s.insightArchiveBlueprint:true);
 const price=recipe?.blueprints??0,learned=!!recipe&&(price===0||(s.learnedRecipes??[]).includes(id as RecipeId));
 const validStock=Number.isSafeInteger(s.blueprintFragments)&&s.blueprintFragments>=0;
 const missing=learned?0:validStock?Math.max(0,price-s.blueprintFragments):price;
 return{recipeId:id,valid:!!recipe,prerequisite,price,balance:s.blueprintFragments,missing,learned,accessible:prerequisite&&learned,canLearn:!!recipe&&price>0&&prerequisite&&!learned&&validStock&&missing===0};
}
export function learnBlueprint(s:GameState,id:string){const q=blueprintQuote(s,id);if(!q.canLearn)return s;return addEvent({...s,blueprintFragments:s.blueprintFragments-q.price,learnedRecipes:[...(s.learnedRecipes??[]),id as RecipeId]},'blueprint-learn',s.savedAt,{recipe:id,paidFragments:q.price,source:'manual-blueprint-learning'},true);}
/** Only missing ownership fields are legacy. Area access alone is never evidence of payment. */
export function migrateBlueprints(s:GameState,original:unknown):GameState{
 const raw=original&&typeof original==='object'?original as Partial<GameState>:{};
 let next=s;
 if(!Object.hasOwn(raw,'learnedRecipes')){
  const jobs=[s.crafting.active,...s.crafting.queue].filter((j):j is CraftingJob=>!!j);
  const evidence=[...s.inventory.map(i=>i.type),...jobs.filter(j=>j.kind==='item').map(j=>j.recipeId),...(s.impulseRelayBlueprint?['impulse-relay']:[]),...(s.insightArchiveBlueprint?['insight-archive']:[])];
  const mark=(j:CraftingJob|null):CraftingJob|null=>j&&j.ingredients.blueprints>0?{...j,fragmentContract:'legacy-reserved'}:j;
  next={...s,learnedRecipes:recipeIds.filter(id=>evidence.includes(id)),crafting:{active:mark(s.crafting.active),queue:s.crafting.queue.map(j=>mark(j)!)}};
 }
 if(s.challengeSession){const main=migrateBlueprints(s.challengeSession.main,raw.challengeSession?.main);if(main!==s.challengeSession.main)next={...next,challengeSession:{...s.challengeSession,main}};}
 return next;
}
