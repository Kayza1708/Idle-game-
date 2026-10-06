import { MAX_ECONOMY_VALUE, componentTotal, canAffordScientificResources, validEconomyValues, refundDataScientific, type CraftingJob, BALANCE, GameState, grantComponents, Item, itemTypes,equipmentSlotCount,equipmentSlots,exactEconomyValue,spendScientificResources, ItemTypeId, ModuleId, Rarity, spendComponents, spendResources, hasNode, tapDropMultiplier, addCreditsScientific, addDataScientific, creditRateScientific, dataRateScientific } from './economy';
import { addEvent } from './telemetry';
import {ScientificNumber} from './scientificNumber';
import {dataAffordability as economyDataAffordability} from './economy';
import {craftingRecipe,sameReservation} from './craftingRecipes';
export const rarities=Object.keys(BALANCE.rarity) as Rarity[];

export function dataAffordability(s:GameState,cost:number){try{return {...economyDataAffordability(s,cost),valid:true};}catch{return{cost,balance:s.data,missing:Infinity,missingExact:ScientificNumber.zero(),valid:false};}}
export function craftingAffordability(s:GameState,kind:CraftingJob['kind'],id:string,quantity=1){
 const recipe=craftingRecipe(kind,id,quantity),costs=recipe?.ingredients;
 const shortages=<T extends string>(cost:Partial<Record<T,number>>,stock:Record<T,number>)=>Object.fromEntries(Object.entries(cost).map(([key,n])=>[key,Number.isSafeInteger(stock[key as T])&&stock[key as T]>=0?Math.max(0,Number(n)-stock[key as T]):Infinity]).filter(([,n])=>Number(n)>0)) as Partial<Record<T,number>>;
 const missingComponents=shortages(costs?.components??{},s.componentInventory),missingModules=shortages(costs?.modules??{},s.modules),data=dataAffordability(s,costs?.data??0);
 const unlocked=kind==='module'?s.completedResearch.includes('blueprints'):id==='impulse-relay'?s.impulseRelayBlueprint:id==='insight-archive'?s.insightArchiveBlueprint:true;
 const missingBlueprints=Number.isSafeInteger(s.blueprintFragments)&&s.blueprintFragments>=0?Math.max(0,(costs?.blueprints??0)-s.blueprintFragments):Infinity;
 const valid=!!recipe&&data.valid&&Number.isSafeInteger(s.nextId)&&s.nextId>0&&Number.isSafeInteger(s.nextId+quantity+1)&&Number.isFinite(s.savedAt)&&s.savedAt>=0&&s.savedAt+recipe.durationPerUnit*1000*quantity<=Number.MAX_SAFE_INTEGER;
 const affordable=valid&&unlocked&&s.crafting.queue.length<3&&missingBlueprints===0&&!Object.keys(missingComponents).length&&!Object.keys(missingModules).length&&canAffordScientificResources(s,ScientificNumber.zero(),ScientificNumber.from(costs!.data));
 const reasons=[...(!valid?['invalid-quantity']:[]),...(!unlocked?['recipe-locked']:[]),...(s.crafting.queue.length>=3?['queue-full']:[]),...(data.missing>0?['data']:[]),...(missingBlueprints>0?['blueprints']:[]),...Object.keys(missingComponents).map(id=>`component:${id}`),...Object.keys(missingModules).map(id=>`module:${id}`)];return{recipe,valid,affordable,unlocked,data,missingComponents,missingModules,missingBlueprints,reasons};
}
export function moduleAffordability(s:GameState,id:ModuleId,quantity=1){return craftingAffordability(s,'module',id,quantity);}
export function craftAffordability(s:GameState,type:ItemTypeId,quantity=1){return craftingAffordability(s,'item',type,quantity);}
export function itemUpgradeCost(s:GameState,item:Item){if(item.rarity==='mythic')return null;const order:Rarity[]=['common','uncommon','rare','epic','legendary','mythic'],next=order[order.indexOf(item.rarity)+1],discount=hasNode(s,'manufacturing2',1)?.85:1,step=order.indexOf(next);return {next,componentCost:Math.ceil(BALANCE.upgradeBase*BALANCE.upgradeGrowth**step*discount),dataCost:Math.ceil(250*3**step*discount)};}
export function createItem(s:GameState,type:ItemTypeId,rarity:Rarity){
 if(!Object.hasOwn(itemTypes,type)||!Object.hasOwn(BALANCE.rarity,rarity)||!Number.isSafeInteger(s.nextId)||s.nextId<1||!Number.isSafeInteger(s.nextId+1)||s.inventory.some(item=>item.id===`item-${s.nextId}`))return s;
 const item:Item={id:`item-${s.nextId}`,type,rarity,level:0,locked:false,relayTaps:type==='impulse-relay'?0:undefined},collectedTypes=s.lifetime.itemTypes.includes(type)?s.lifetime.itemTypes:[...s.lifetime.itemTypes,type];
 return addEvent({...s,nextId:s.nextId+1,inventory:[...s.inventory,item],lifetime:{...s.lifetime,itemTypes:collectedTypes}},'item-create',s.savedAt,{id:item.id,type,rarity});
}
export function randomItem(s:GameState,rng=Math.random){let min=0; const pity={rare:s.pity.rare+1,epic:s.pity.epic+1,legendary:s.pity.legendary+1}; if(pity.legendary>=100)min=4;else if(pity.epic>=50)min=3;else if(pity.rare>=20)min=2; let roll=rng(),idx=rarities.findIndex(r=>{roll-=BALANCE.rarity[r].chance;return roll<=0});idx=Math.max(min,idx<0?0:idx);const rarity=rarities[idx];if(idx>=2)pity.rare=0;if(idx>=3)pity.epic=0;if(idx>=4)pity.legendary=0;const types=(Object.keys(itemTypes) as ItemTypeId[]).filter(type=>type!=='impulse-relay'&&type!=='insight-archive');return createItem({...s,pity},types[Math.floor(rng()*types.length)%types.length],rarity);}
const jobDetails=(job:CraftingJob)=>({jobId:job.id,recipe:job.recipeId,quantity:job.quantity,ingredients:JSON.stringify(job.ingredients),duration:job.durationPerUnit*job.quantity,result:job.result.id,startedAt:job.startedAt,endsAt:job.endsAt,completed:job.completed,resultQuantity:0,exactDataCost:ScientificNumber.from(job.ingredients.data).toScientificString(16)});
function startCraftingJob(s:GameState,job:CraftingJob,startedAt=s.savedAt){const active={...job,startedAt,endsAt:startedAt+job.durationPerUnit*1000};return addEvent({...s,crafting:{...s.crafting,active}},'crafting_started',s.savedAt,jobDetails(active));}
function enqueuePaid(s:GameState,job:CraftingJob){const queued=addEvent(s,'crafting_queued',s.savedAt,jobDetails(job));return queued.crafting.active?{...queued,crafting:{...queued.crafting,queue:[...queued.crafting.queue,job]}}:startCraftingJob(queued,job);}
function reserveCrafting(s:GameState,kind:CraftingJob['kind'],id:string,quantity:number,rarity?:Rarity){
 const quote=craftingAffordability(s,kind,id,quantity),recipe=quote.recipe;
 if(!quote.affordable||!recipe||(kind==='item'&&rarity!==recipe.result.rarity))return s;
 const {ingredients,durationPerUnit,result}=recipe;
 const resources=spendScientificResources(s,ScientificNumber.zero(),ScientificNumber.from(ingredients.data));
 if(resources===s)return s;
 const componentInventory={...s.componentInventory},modules={...s.modules};
 for(const [key,n] of Object.entries(ingredients.components))componentInventory[key as keyof typeof componentInventory]-=n??0;
 for(const [key,n] of Object.entries(ingredients.modules))modules[key as ModuleId]-=n??0;
 const job:CraftingJob={id:`craft-${s.nextId}`,kind,recipeId:result.id,quantity,completed:0,durationPerUnit,startedAt:null,endsAt:null,ingredients,result};
 return enqueuePaid({...resources,nextId:s.nextId+1,componentInventory,components:componentTotal(componentInventory),modules,blueprintFragments:s.blueprintFragments-ingredients.blueprints},job);
}
export function craftModule(s:GameState,id:ModuleId,quantity=1){return reserveCrafting(s,'module',id,quantity);}
export function craft(s:GameState,type:ItemTypeId,rarity:Rarity='common',quantity=1){return reserveCrafting(s,'item',type,quantity,rarity);}
export function plannedItemCount(s:GameState,type:ItemTypeId){return s.inventory.filter(item=>item.type===type).length+[s.crafting.active,...s.crafting.queue].filter((job):job is NonNullable<typeof job>=>!!job&&job.kind==='item'&&job.recipeId===type).reduce((sum,job)=>sum+job.quantity-job.completed,0)}
export function runCraftingPlanner(s:GameState){if(!s.axiomUpgrades.includes('craftingPlanner')||!s.craftingPlanner.enabled||plannedItemCount(s,s.craftingPlanner.recipeId)>=s.craftingPlanner.target)return s;const definition=BALANCE.itemRecipes[s.craftingPlanner.recipeId as keyof typeof BALANCE.itemRecipes];return definition?craft(s,s.craftingPlanner.recipeId,definition.rarity,1):s;}
export function cancelCrafting(s:GameState,id:string){
 const job=s.crafting.queue.find(x=>x.id===id);if(!job)return s;
 const recipe=craftingRecipe(job.kind,job.recipeId,job.quantity);
 if(!recipe||job.completed!==0||!sameReservation(job.ingredients,recipe.ingredients))return s;
 const refunded=refundDataScientific(s,ScientificNumber.from(job.ingredients.data));if(refunded===s)return s;
 const componentInventory={...s.componentInventory},modules={...s.modules};
 for(const [key,n] of Object.entries(job.ingredients.components)){const id=key as keyof typeof componentInventory,amount=componentInventory[id]+(n??0);if(!Number.isSafeInteger(amount)||amount<0)return s;componentInventory[id]=amount;}
 for(const [key,n] of Object.entries(job.ingredients.modules)){const id=key as ModuleId,amount=modules[id]+(n??0);if(!Number.isSafeInteger(amount)||amount<0)return s;modules[id]=amount;}
 const blueprints=s.blueprintFragments+job.ingredients.blueprints;if(!Number.isSafeInteger(blueprints)||blueprints<0)return s;
 return addEvent({...refunded,blueprintFragments:blueprints,componentInventory,components:componentTotal(componentInventory),modules,crafting:{...s.crafting,queue:s.crafting.queue.filter(x=>x.id!==id)}},'crafting_cancelled',s.savedAt,jobDetails(job));
}
export function settleCrafting(s:GameState){let next=s,guard=0;while(next.crafting.active&&next.crafting.active.endsAt!==null&&next.crafting.active.endsAt<=next.savedAt+.1&&guard++<10000){const job={...next.crafting.active,endsAt:next.crafting.active.endsAt as number};let completed=job.completed+1;if(job.kind==='module'){const id=job.result.id as ModuleId;next={...next,modules:{...next.modules,[id]:next.modules[id]+1}};}else{next=createItem({...next,lifetime:{...next.lifetime,itemsCrafted:next.lifetime.itemsCrafted+1}},job.result.id as ItemTypeId,job.result.rarity!);}next=addEvent(next,'crafting_completed',job.endsAt, {...jobDetails(job),completed,resultQuantity:1});if(completed<job.quantity){next={...next,crafting:{...next.crafting,active:{...job,completed,startedAt:job.endsAt,endsAt:job.endsAt+job.durationPerUnit*1000}}};}else{const [following,...queue]=next.crafting.queue;next={...next,crafting:{active:null,queue}};if(following)next=startCraftingJob(next,following,job.endsAt);}}
return next;}
export function equip(s:GameState,id:string){const item=s.inventory.find(i=>i.id===id);if(!item||s.prestigeCount<1||Object.values(s.equipped).includes(id))return s;const slot=itemTypes[item.type].slot,current=s.equipped[slot],equippedCount=Object.values(s.equipped).filter(Boolean).length;if(!current&&equippedCount>=equipmentSlotCount(s))return addEvent(s,'action-blocked',s.savedAt,{action:'item-equip',id,reason:'no-socket',slot});const replaced=s.equipped[slot]??null;return addEvent({...s,equipped:{...s.equipped,[slot]:id},onboarding:{...s.onboarding,completed:[...new Set([...s.onboarding.completed,'equip-item'])]}},'item-equip',s.savedAt,{id,type:item.type,slot,replaced});}
export function unequip(s:GameState,slot:typeof equipmentSlots[number]){const id=s.equipped[slot];if(!id)return s;const equipped={...s.equipped};delete equipped[slot];return addEvent({...s,equipped},'item-equip',s.savedAt,{id,slot,action:'remove'});}
export function buyEquipmentSlot(s:GameState,target:2|3){const count=equipmentSlotCount(s);if(s.prestigeCount<1||count>=target||target!==count+1)return s;const cost=ScientificNumber.from(BALANCE.equipmentSlotCosts[target-2]);if(exactEconomyValue(s,'credits').compare(cost)<0)return s;const paid=spendScientificResources(s,cost);return addEvent({...paid,purchasedEquipmentSlots:Math.max(s.purchasedEquipmentSlots??0,target-1)},'equipment-slot-buy',s.savedAt,{target,cost:cost.toScientificString()});}
export function toggleLock(s:GameState,id:string){const item=s.inventory.find(i=>i.id===id);return !item?s:addEvent({...s,inventory:s.inventory.map(i=>i.id===id?{...i,locked:!i.locked}:i)},'item-lock',s.savedAt,{id,locked:!item.locked});}
export function salvage(s:GameState,id:string){const item=s.inventory.find(i=>i.id===id);if(!item||item.locked||Object.values(s.equipped).includes(id))return s;const gained=BALANCE.rarity[item.rarity].salvage,next=grantComponents({...s,inventory:s.inventory.filter(i=>i.id!==id)},{circuits:gained});return addEvent(next,'item-salvage',s.savedAt,{id,type:item.type,rarity:item.rarity,component:'circuits',amount:gained});}
export function upgrade(s:GameState,id:string){const item=s.inventory.find(i=>i.id===id);if(!item)return s;const cost=itemUpgradeCost(s,item);if(!cost)return s;const {next,componentCost,dataCost}=cost;if(!validEconomyValues(s,['credits','data']))return s;if(!canAffordScientificResources(s,ScientificNumber.zero(),ScientificNumber.from(dataCost)))return s;const paid=spendComponents(s,{circuits:componentCost});if(paid===s)return s;const resources=spendResources(paid,{data:dataCost});if(resources===paid)return s;return addEvent({...resources,inventory:paid.inventory.map(i=>i.id===id?{...i,rarity:next,level:i.level+1}:i)},'item-upgrade',s.savedAt,{id,rarity:next,component:'circuits',componentCost,dataCost});}


/** Fuse three identical items into one item of the next rarity. This is the long-tail item sink. */
export function fuseItems(s:GameState,ids:string[]){
 if(!Array.isArray(ids)||ids.length!==3||new Set(ids).size!==3)return s;
 const unique=[...new Set(ids)],items=unique.map(id=>s.inventory.find(i=>i.id===id)).filter((i):i is Item=>!!i);
 if(items.length!==3||items.some(i=>i.locked||Object.values(s.equipped).includes(i.id)))return s;
 const first=items[0];if(items.some(i=>i.type!==first.type||i.rarity!==first.rarity)||first.rarity==='mythic')return s;
 const order:Rarity[]=['common','uncommon','rare','epic','legendary','mythic'],rarity=order[order.indexOf(first.rarity)+1];
 const kept=s.inventory.filter(i=>!unique.includes(i.id));const made=createItem({...s,inventory:kept,lifetime:{...s.lifetime,itemsFused:s.lifetime.itemsFused+1}},first.type,rarity);
 return addEvent(made,'item-craft',s.savedAt,{action:'fusion',type:first.type,rarity,consumed:unique.join(',')});
}
/** Forge upgrades improve the scaling of one item without replacing rarity progression. */
export function forgeItem(s:GameState,id:string){const item=s.inventory.find(i=>i.id===id);if(!item)return s;const forge=item.forge??0;if(forge>=20)return s;const rank=(['common','uncommon','rare','epic','legendary','mythic'] as Rarity[]).indexOf(item.rarity),dataCost=Math.ceil(1000*2**forge*(1+rank)),cost=Math.ceil(25*1.7**forge*(1+rank));if(!canAffordScientificResources(s,ScientificNumber.zero(),ScientificNumber.from(dataCost)))return s;const paid=spendComponents(s,{circuits:cost});if(paid===s)return s;const resources=spendResources(paid,{data:dataCost});if(resources===paid)return s;return addEvent({...resources,inventory:resources.inventory.map(i=>i.id===id?{...i,forge:forge+1}:i),lifetime:{...resources.lifetime,forgeUpgrades:resources.lifetime.forgeUpgrades+1}},'item-upgrade',s.savedAt,{id,forge:forge+1,dataCost,componentCost:cost});}
/** Active world loot: common signals give a small production burst, caches improve component quality,
 * and rare cores are short jackpot moments. Drop research/items/prestige affect both frequency and quality. */
export function claimLootDrop(s:GameState,id:string,rng=Math.random){
 const drop=s.lootDrops.find(d=>d.id===id);if(!drop||drop.expiresAt<s.savedAt)return {...s,lootDrops:s.lootDrops.filter(d=>d.id!==id)};
 const variant=drop.variant??'coin',quality=tapDropMultiplier(s),qualityBoost=variant==='core'?2.35:variant==='cache'?1.45:1;
 const entries=(Object.entries(BALANCE.worldDropWeights) as [keyof typeof s.componentInventory,number][]).map(([k,w],index)=>[k,w*Math.pow(Math.max(1,quality)*qualityBoost,index/8)] as [keyof typeof s.componentInventory,number]);
 const draw=()=>{const total=entries.reduce((n,[,w])=>n+w,0);let roll=rng()*total,pick=entries[entries.length-1][0];for(const [candidate,w] of entries){roll-=w;if(roll<=0){pick=candidate;break}}return pick};
 const draws=variant==='core'?7:variant==='cache'?3:1,perDraw=variant==='core'?2:1,grant:Partial<typeof s.componentInventory>={};
 for(let i=0;i<draws;i++){const pick=draw();grant[pick]=(grant[pick]??0)+perDraw;}
 let next=grantComponents({...s,lootDrops:s.lootDrops.filter(d=>d.id!==id),lifetime:{...s.lifetime,dropsClaimed:s.lifetime.dropsClaimed+1}},grant);
 const creditSeconds=variant==='core'?60:variant==='cache'?15:5,dataSeconds=variant==='core'?45:variant==='cache'?12:0;
 next=addCreditsScientific(next,creditRateScientific(next.hardware,next.level,next,next.savedAt,false).multiplyNumber(creditSeconds),true,false);
 if(dataSeconds>0)next=addDataScientific(next,dataRateScientific(next).multiplyNumber(dataSeconds));
 let itemDropped=false;
 if(variant==='core'){
   const itemChance=Math.min(.15,.03+.006*Math.max(0,quality-1));
   if(rng()<itemChance){next=randomItem(next,rng);itemDropped=true;}
 }
 return addEvent(next,'component-found',s.savedAt,{source:'world-drop',variant,draws,components:Object.entries(grant).map(([k,v])=>`${k}:${v}`).join(','),creditSeconds,dataSeconds,itemDropped,quality});
}

export function craftingMissingText(quote:ReturnType<typeof craftingAffordability>,language:string){const de=language==='de';return quote.reasons.map(reason=>reason==='invalid-quantity'?(de?'Ungültige Menge':'Invalid quantity'):reason==='recipe-locked'?(de?'Bauplan gesperrt':'Recipe locked'):reason==='queue-full'?(de?'Warteschlange voll':'Queue full'):reason==='data'?`${quote.data.missingExact.toScientificString()} Data`:reason==='blueprints'?`${quote.missingBlueprints} ${de?'Bauplanfragmente':'blueprint fragments'}`:reason.startsWith('component:')?`${reason.slice(10)} ×${quote.missingComponents[reason.slice(10) as keyof typeof quote.missingComponents]}`:`${reason.slice(7)} ×${quote.missingModules[reason.slice(7) as keyof typeof quote.missingModules]}`).join(' · ');}
