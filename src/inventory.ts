import {automationFeatureUnlocked} from './economy';
import {addChallengeMetrics} from './challengeStages';
import {materialTable,discoverBlueprint} from './materialEconomy';
import {salvageWithRecovery} from './recovery';
import {deviceBonus} from './deviceEffects';
import {foundryBusy,queueForge,combineMaterialBasis} from './foundries';
import {blueprintQuote} from './blueprints';
import {componentText,moduleText} from './gameplayI18n';
import { researchModifiers, componentIds, specialItemEffectQuote, MAX_ECONOMY_VALUE, componentTotal, canAffordScientificResources, validEconomyValues, refundDataScientific, type CraftingJob, type ComponentId, BALANCE, GameState, grantComponents, Item, itemTypes,itemEffectProfile,itemEffectFor,deepPrestigeBonus,equipmentSlotCount,equipmentSlots,slotFamily,type ItemSlot,exactEconomyValue,spendScientificResources, ItemTypeId, ModuleId, Rarity, spendComponents, spendResources, hasNode, tapDropMultiplier, addCreditsScientific, addDataScientific, creditRateScientific, dataRateScientific } from './economy';
import { addEvent } from './telemetry';
import {ScientificNumber} from './scientificNumber';
import {dataAffordability as economyDataAffordability} from './economy';
import {craftingRecipe,sameReservation} from './craftingRecipes';
export const rarities=Object.keys(BALANCE.rarity) as Rarity[];

export function dataAffordability(s:GameState,cost:number){try{return {...economyDataAffordability(s,cost),valid:true};}catch{return{cost,balance:s.data,missing:Infinity,missingExact:ScientificNumber.zero(),valid:false};}}
export function craftingAffordability(s:GameState,kind:CraftingJob['kind'],id:string,quantity=1){
 const recipe=craftingRecipe(kind,id,quantity,false,kind==='item'?s.blueprintMastery[id as ItemTypeId]??0:0),costs=recipe?.ingredients;
 const shortages=<T extends string>(cost:Partial<Record<T,number>>,stock:Record<T,number>)=>Object.fromEntries(Object.entries(cost).map(([key,n])=>[key,Number.isSafeInteger(stock[key as T])&&stock[key as T]>=0?Math.max(0,Number(n)-stock[key as T]):Infinity]).filter(([,n])=>Number(n)>0)) as Partial<Record<T,number>>;
 const missingComponents=shortages(costs?.components??{},s.componentInventory),missingModules=shortages(costs?.modules??{},s.modules),data=dataAffordability(s,costs?.data??0);
 const unlocked=kind==='module'?s.completedResearch.includes('blueprints'):blueprintQuote(s,id).accessible;
 const missingBlueprints=Number.isSafeInteger(s.blueprintFragments)&&s.blueprintFragments>=0?Math.max(0,(costs?.blueprints??0)-s.blueprintFragments):Infinity;
 const reserved=kind==='item'?[s.crafting.active,...s.crafting.queue].filter(j=>j?.kind==='item'&&j.recipeId===id).reduce((n,j)=>n+j!.quantity-j!.completed,0):0;const valid=Number.isSafeInteger(s.lifetime.itemsCrafted+quantity)&&!!recipe&&(kind!=='item'||quantity<=BALANCE.maxInstantCraft)&&(kind!=='item'||Number.isSafeInteger((s.craftedItemCounts[id as ItemTypeId]??0)+reserved+quantity))&&data.valid&&Number.isSafeInteger(s.nextId)&&s.nextId>0&&Number.isSafeInteger(s.nextId+quantity+1)&&Number.isFinite(s.savedAt)&&s.savedAt>=0&&s.savedAt+recipe.durationPerUnit*1000*quantity<=Number.MAX_SAFE_INTEGER;
 const affordable=valid&&unlocked&&(kind==='item'||s.crafting.queue.length<3)&&missingBlueprints===0&&!Object.keys(missingComponents).length&&!Object.keys(missingModules).length&&canAffordScientificResources(s,ScientificNumber.zero(),ScientificNumber.from(costs!.data));
 const reasons=[...(!valid?['invalid-quantity']:[]),...(!unlocked?[kind==='item'&&blueprintQuote(s,id).prerequisite?'blueprint-unlearned':'recipe-locked']:[]),...(kind==='module'&&s.crafting.queue.length>=3?['queue-full']:[]),...(data.missing>0?['data']:[]),...(missingBlueprints>0?['blueprints']:[]),...Object.keys(missingComponents).map(id=>`component:${id}`),...Object.keys(missingModules).map(id=>`module:${id}`)];return{recycling:{fraction:kind==='item'?researchModifiers(s).materialRecycling:0,componentsPerExemplar:Object.fromEntries(Object.entries(costs?.components??{}).map(([key,n])=>[key,Number(n)/quantity])),remainders:s.craftingRecycleRemainders,atCompletion:true},recipe,valid,affordable,unlocked,data,missingComponents,missingModules,missingBlueprints,reasons};
}
export function moduleAffordability(s:GameState,id:ModuleId,quantity=1){return craftingAffordability(s,'module',id,quantity);}
export function craftAffordability(s:GameState,type:ItemTypeId,quantity=1){return craftingAffordability(s,'item',type,quantity);}
export function itemUpgradeCost(s:GameState,item:Item){if(item.level>=BALANCE.itemLevelMax)return null;const target=item.level+1,family=BALANCE.itemMaterialFamilies[item.type],complexity=Math.max(1,Math.min(BALANCE.itemLevelComplexityCap,Math.sqrt(BALANCE.itemRecipes[item.type].data/BALANCE.itemLevelComplexityBase))),discount=hasNode(s,'manufacturing2',1)?BALANCE.itemLevelManufacturingFactor:1,componentCost=Math.ceil(BALANCE.itemLevelMaterialBase*BALANCE.itemLevelMaterialGrowth**(target-2)*discount),dataCost=Math.ceil(BALANCE.itemLevelDataBase*complexity*BALANCE.itemLevelDataGrowth**(target-2)*discount),rare=target<BALANCE.itemLevelRareStart?0:1+Math.floor((target-BALANCE.itemLevelRareStart)/BALANCE.itemLevelRareStep);return{next:item.rarity,componentCost,dataCost,components:{circuits:componentCost,[family.base]:Math.ceil(componentCost/BALANCE.itemLevelBaseMaterialDivisor),...(rare?{[family.rare]:rare}:{})} as Partial<GameState['componentInventory']>};}
/** Quotes share the transaction guards; they never reserve or draw randomness. */
export function itemImprovementPreview(s:GameState,id:string,action:'upgrade'|'forge'){
 const item=s.inventory.find(i=>i.id===id);
 if(!item)return null;
 const upgradeCost=action==='upgrade'?itemUpgradeCost(s,item):null,forge=item.forge??0,rank=rarities.indexOf(item.rarity);
 const capped=action==='upgrade'?!upgradeCost:forge>=20;
 const componentCost=action==='upgrade'?(upgradeCost?.componentCost??0):Math.ceil(25*1.7**forge*(1+rank));
 const dataCost=action==='upgrade'?(upgradeCost?.dataCost??0):Math.ceil(1000*2**forge*(1+rank));
 const componentCosts=action==='upgrade'?(upgradeCost?.components??{}):{circuits:componentCost},missingMaterials=Object.fromEntries(Object.entries(componentCosts).filter(([key,n])=>!Number.isSafeInteger(s.componentInventory[key as keyof typeof s.componentInventory])||s.componentInventory[key as keyof typeof s.componentInventory]<Number(n)).map(([key,n])=>[key,Math.max(0,Number(n)-s.componentInventory[key as keyof typeof s.componentInventory])])),data=dataAffordability(s,dataCost),missingComponents=Math.max(0,componentCost-s.componentInventory.circuits);
 const reason=item.challengeCopy?'protected':foundryBusy(s,id)?'busy':capped?'maximum':!validEconomyValues(s,['credits','data'])?'invalid-resources':missingComponents?'circuits':Object.keys(missingMaterials).length?'materials':!canAffordScientificResources(s,ScientificNumber.zero(),ScientificNumber.from(dataCost))?'data':null;
 const result=capped?item:{...item,...(action==='upgrade'&&upgradeCost?{rarity:upgradeCost.next,level:item.level+1}:{forge:forge+1})};
 return{item,result,effects:{before:specialItemEffectQuote(s,item),after:specialItemEffectQuote(s,result)},effectChanges:[...new Set(itemEffectProfile(result))].map(effect=>({effect,before:itemEffectFor(s,item,effect)*(1+deepPrestigeBonus(s,'manufacturing')),after:itemEffectFor(s,result,effect)*(1+deepPrestigeBonus(s,'manufacturing'))})),componentCosts,dataCostExact:ScientificNumber.from(dataCost),componentCost,dataCost,data,missingComponents,missingMaterials,reason,allowed:reason===null};
}
export function fusionPreview(s:GameState,ids:string[]){
 const items=Array.isArray(ids)?ids.map(id=>s.inventory.find(i=>i.id===id)):[];
 const first=items.filter((i):i is Item=>!!i).reduce<Item|undefined>((best,i)=>!best||i.level>best.level||i.level===best.level&&(i.forge??0)>(best.forge??0)?i:best,undefined),reason=!Array.isArray(ids)||ids.length!==3||new Set(ids).size!==3||items.filter(Boolean).length!==3?'three-items':items.some(i=>i!.challengeCopy||i!.locked||Object.values(s.equipped).includes(i!.id)||foundryBusy(s,i!.id))?'protected':items.some(i=>i!.type!==first!.type||i!.rarity!==first!.rarity)?'matching':first!.rarity==='mythic'?'maximum':null;
 return{allowed:reason===null,reason,consumed:ids.filter(id=>id!==first?.id),result:!reason&&first?{...first,rarity:rarities[rarities.indexOf(first.rarity)+1]}:null};
}
export function createItem(s:GameState,type:ItemTypeId,rarity:Rarity){
 if(!Object.hasOwn(itemTypes,type)||!Object.hasOwn(BALANCE.rarity,rarity)||!Number.isSafeInteger(s.nextId)||s.nextId<1||!Number.isSafeInteger(s.nextId+1)||s.inventory.some(item=>item.id===`item-${s.nextId}`))return s;
 const item:Item={id:`item-${s.nextId}`,type,rarity,level:1,locked:false,relayTaps:type==='impulse-relay'?0:undefined},collectedTypes=s.lifetime.itemTypes.includes(type)?s.lifetime.itemTypes:[...s.lifetime.itemTypes,type];
 return addEvent({...s,nextId:s.nextId+1,inventory:[...s.inventory,item],lifetime:{...s.lifetime,itemTypes:collectedTypes}},'item-create',s.savedAt,{id:item.id,type,rarity});
}
export function randomItem(s:GameState,rng=Math.random){const types=(Object.keys(itemTypes) as ItemTypeId[]).filter(type=>type!=='impulse-relay'&&type!=='insight-archive');return createItem(s,types[Math.floor(rng()*types.length)%types.length],'common');}
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
 const job:CraftingJob={id:`craft-${s.nextId}`,kind,recipeId:result.id,quantity,completed:0,durationPerUnit,startedAt:null,endsAt:null,ingredients,result,masteryLevel:kind==='item'?s.blueprintMastery[result.id as ItemTypeId]:0};
 const paid={...resources,nextId:s.nextId+1,componentInventory,components:componentTotal(componentInventory),modules,blueprintFragments:s.blueprintFragments-ingredients.blueprints};if(kind==='item'){const done=settleCrafting(startCraftingJob(addEvent({...paid,crafting:{active:null,queue:[]}},'crafting_queued',s.savedAt,jobDetails(job)),job));return{...done,crafting:paid.crafting};}return enqueuePaid(paid,job);
}
export function craftModule(s:GameState,id:ModuleId,quantity=1){return reserveCrafting(s,'module',id,quantity);}
export function craft(s:GameState,type:ItemTypeId,rarity:Rarity='common',quantity=1){return reserveCrafting(s,'item',type,quantity,rarity);}
export function plannedItemCount(s:GameState,type:ItemTypeId){return s.inventory.filter(item=>item.type===type).length+[s.crafting.active,...s.crafting.queue].filter((job):job is NonNullable<typeof job>=>!!job&&job.kind==='item'&&job.recipeId===type).reduce((sum,job)=>sum+job.quantity-job.completed,0)}
export function runCraftingPlanner(s:GameState){if(!automationFeatureUnlocked(s,'craftingPlanner')||!s.craftingPlanner.enabled||plannedItemCount(s,s.craftingPlanner.recipeId)>=s.craftingPlanner.target)return s;const definition=BALANCE.itemRecipes[s.craftingPlanner.recipeId as keyof typeof BALANCE.itemRecipes];return definition?craft(s,s.craftingPlanner.recipeId,'common',1):s;}
export function cancelCrafting(s:GameState,id:string){
 const job=s.crafting.queue.find(x=>x.id===id);if(!job)return s;
 const recipe=craftingRecipe(job.kind,job.recipeId,job.quantity,job.fragmentContract==='legacy-reserved',job.masteryLevel??0,job.legacyTimed===true);
 if(!recipe||job.completed!==0||!sameReservation(job.ingredients,recipe.ingredients))return s;
 const refunded=refundDataScientific(s,ScientificNumber.from(job.ingredients.data));if(refunded===s)return s;
 const componentInventory={...s.componentInventory},modules={...s.modules};
 for(const [key,n] of Object.entries(job.ingredients.components)){const id=key as keyof typeof componentInventory,amount=componentInventory[id]+(n??0);if(!Number.isSafeInteger(amount)||amount<0)return s;componentInventory[id]=amount;}
 for(const [key,n] of Object.entries(job.ingredients.modules)){const id=key as ModuleId,amount=modules[id]+(n??0);if(!Number.isSafeInteger(amount)||amount<0)return s;modules[id]=amount;}
 // Legacy fragment reservations remain spent even when a waiting order is cancelled.
 const blueprints=s.blueprintFragments;if(!Number.isSafeInteger(blueprints)||blueprints<0)return s;
 return addEvent({...refunded,blueprintFragments:blueprints,componentInventory,components:componentTotal(componentInventory),modules,crafting:{...s.crafting,queue:s.crafting.queue.filter(x=>x.id!==id)}},'crafting_cancelled',s.savedAt,jobDetails(job));
}
export function settleCrafting(s:GameState){let next=s,guard=0;while(next.crafting.active&&next.crafting.active.endsAt!==null&&next.crafting.active.endsAt<=next.savedAt+.1&&guard++<10000){const job={...next.crafting.active,endsAt:next.crafting.active.endsAt as number};let completed=job.completed+1;if(job.kind==='module'){const id=job.result.id as ModuleId;next={...next,modules:{...next.modules,[id]:next.modules[id]+1}};}else{next=createItem({...next,lifetime:{...next.lifetime,itemsCrafted:next.lifetime.itemsCrafted+1}},job.result.id as ItemTypeId,job.result.rarity!);next={...next,inventory:next.inventory.map((i,index)=>index===next.inventory.length-1?{...i,materialBasis:Object.fromEntries(Object.entries(job.ingredients.components).map(([id,n])=>[id,Number(n)/job.quantity])),recoveryUsed:Object.fromEntries(Object.entries(job.ingredients.components).map(([id,n])=>[id,Number(n)/job.quantity*Math.min(BALANCE.recoveryFraction,researchModifiers(next).materialRecycling*(1+deviceBonus(next,'recovery')))]))}:i),craftedItemCounts:{...next.craftedItemCounts,[job.result.id]:next.craftedItemCounts[job.result.id as ItemTypeId]+1},craftedItemTypes:next.craftedItemTypes.includes(job.result.id as ItemTypeId)?next.craftedItemTypes:[...next.craftedItemTypes,job.result.id as ItemTypeId]};}if(job.kind==='item'&&researchModifiers(next).materialRecycling>0){const remainders={...next.craftingRecycleRemainders},returned:Partial<GameState['componentInventory']>={};for(const id of componentIds){const value=remainders[id]+(job.ingredients.components[id]??0)/job.quantity*Math.min(BALANCE.recoveryFraction,researchModifiers(next).materialRecycling*(1+deviceBonus(next,'recovery'))),nearest=Math.round(value),normalized=Math.abs(value-nearest)<=Number.EPSILON*Math.max(1,value)*16?nearest:value;returned[id]=Math.floor(normalized);remainders[id]=normalized-returned[id]!;}next=grantComponents({...next,craftingRecycleRemainders:remainders},returned);next=addEvent(next,'component-found',job.endsAt,{source:'material-recycling',jobId:job.id,exemplar:completed,components:JSON.stringify(returned)});}if(job.kind==='item'&&next.retention.activeRun){const m=next.retention.activeRun.metrics!,item=next.inventory.at(-1)!;next=addChallengeMetrics(next,{craftedIds:[...m.craftedIds,item.id],craftedTypes:[...new Set([...(m.craftedTypes??[]),item.type])],craftRarity:Math.max(m.craftRarity,rarities.indexOf(item.rarity))});}next=addEvent(next,'crafting_completed',job.endsAt, {...jobDetails(job),completed,resultQuantity:1,resultInstanceId:job.kind==='item'?next.inventory.at(-1)!.id:null,masteryLevel:job.masteryLevel??0});if(completed<job.quantity){next={...next,crafting:{...next.crafting,active:{...job,completed,startedAt:job.endsAt,endsAt:job.endsAt+job.durationPerUnit*1000}}};}else{const [following,...queue]=next.crafting.queue;next={...next,crafting:{active:null,queue}};if(following)next=startCraftingJob(next,following,job.endsAt);}}
return next;}
export function equipmentEligibility(s:GameState,id:string,requested?:ItemSlot){const item=s.inventory.find(i=>i.id===id),family=item&&Object.hasOwn(itemTypes,item.type)?itemTypes[item.type].slot:null,compatible=equipmentSlots.filter(slot=>slotFamily(slot)===family&&equipmentSlots.indexOf(slot)<equipmentSlotCount(s)),slot=requested??compatible.find(slot=>s.inventory.find(i=>i.id===s.equipped[slot])?.type===item?.type)??compatible.find(slot=>!s.equipped[slot])??compatible[0]??null,reason=!family?'unknown':s.prestigeCount<1?'prestige':Object.values(s.equipped).includes(id)?'equipped':s.inventory.some(i=>i.type===item!.type&&i.id!==s.equipped[slot!]&&Object.values(s.equipped).includes(i.id))?'duplicate-type':!slot||slotFamily(slot)!==family||equipmentSlots.indexOf(slot)>=equipmentSlotCount(s)?'no-socket':null;return{item,slot,reason,allowed:reason===null};}
export function equip(s:GameState,id:string,requested?:ItemSlot){const quote=equipmentEligibility(s,id,requested),item=quote.item;if(!quote.allowed||!item||!quote.slot)return s;const slot=quote.slot,replaced=s.equipped[slot]??null;return addEvent({...s,equipped:{...s.equipped,[slot]:id},onboarding:{...s.onboarding,completed:[...new Set([...s.onboarding.completed,'equip-item'])]}},'item-equip',s.savedAt,{id,type:item.type,slot,replaced});}


export function unequip(s:GameState,slot:typeof equipmentSlots[number]){const id=s.equipped[slot];if(!id)return s;const equipped={...s.equipped};delete equipped[slot];return addEvent({...s,equipped},'item-equip',s.savedAt,{id,slot,action:'remove'});}
export function buyEquipmentSlot(s:GameState,target:2|3){if(target!==2&&target!==3)return s;const count=equipmentSlotCount(s);if(s.prestigeCount<1||count>=target||target!==count+1)return s;const cost=ScientificNumber.from(BALANCE.equipmentSlotCosts[target-2]);if(exactEconomyValue(s,'credits').compare(cost)<0)return s;const paid=spendScientificResources(s,cost);return addEvent({...paid,purchasedEquipmentSlots:Math.max(s.purchasedEquipmentSlots??0,target-1),unlockedEquipmentSlots:Math.max(s.unlockedEquipmentSlots??0,target)},'equipment-slot-buy',s.savedAt,{target,cost:cost.toScientificString()});}
export function toggleLock(s:GameState,id:string){const item=s.inventory.find(i=>i.id===id);return !item||item.challengeCopy||foundryBusy(s,id)?s:addEvent({...s,inventory:s.inventory.map(i=>i.id===id?{...i,locked:!i.locked}:i)},'item-lock',s.savedAt,{id,locked:!item.locked});}
export function salvage(s:GameState,id:string,rng=Math.random){return salvageWithRecovery(s,id,rng);}
export type ImprovementTicket=Pick<Item,'rarity'|'level'|'forge'>;
const sameImprovement=(item:Item,ticket?:ImprovementTicket)=>!ticket||(item.rarity===ticket.rarity&&item.level===ticket.level&&(item.forge??0)===(ticket.forge??0));
export function upgrade(s:GameState,id:string,ticket?:ImprovementTicket){const quote=itemImprovementPreview(s,id,'upgrade');if(!quote?.allowed||!sameImprovement(quote.item,ticket))return s;const resources=spendScientificResources(s,ScientificNumber.zero(),quote.dataCostExact);if(resources===s)return s;const paid=spendComponents(resources,quote.componentCosts);if(paid===resources)return s;let result=addEvent({...paid,inventory:paid.inventory.map(i=>i.id===id?{...quote.result,materialBasis:combineMaterialBasis(i.materialBasis??{circuits:BALANCE.legacyItemRecovery[i.rarity]},quote.componentCosts)}:i)},'item-upgrade',s.savedAt,{id,type:quote.item.type,rarity:quote.result.rarity,level:quote.result.level,componentCost:quote.componentCost,components:JSON.stringify(quote.componentCosts),dataCost:quote.dataCost,exactDataCost:quote.dataCostExact.toScientificString(16)});if(result.retention.activeRun?.metrics?.craftedIds.includes(id))result=addChallengeMetrics(result,{craftRarity:Math.max(result.retention.activeRun.metrics.craftRarity,rarities.indexOf(quote.result.rarity))});return result;}


/** Fuse three identical items into one item of the next rarity. This is the long-tail item sink. */
export function fuseItems(s:GameState,ids:string[]){
 if(!fusionPreview(s,ids).allowed)return s;
 const unique=[...new Set(ids)],items=unique.map(id=>s.inventory.find(i=>i.id===id)).filter((i):i is Item=>!!i);
 if(items.length!==3||items.some(i=>i.locked||Object.values(s.equipped).includes(i.id)))return s;
 const first=fusionPreview(s,ids).result!;const basis=items.find(i=>i.id===first.id)!;if(items.some(i=>i.type!==basis.type||i.rarity!==basis.rarity)||basis.rarity==='mythic')return s;
 const order:Rarity[]=['common','uncommon','rare','epic','legendary','mythic'],rarity=order[order.indexOf(basis.rarity)+1];
 const consumed=items.filter(item=>item.id!==first.id).map(item=>item.id),rarityResult=rarity;
 const result={...first,rarity:rarityResult,materialBasis:combineMaterialBasis(...items.map(old=>old.materialBasis??{circuits:BALANCE.legacyItemRecovery[old.rarity]})),recoveryUsed:combineMaterialBasis(...items.map(old=>old.recoveryUsed??{}))};
 let backed={...s,inventory:s.inventory.filter(i=>!consumed.includes(i.id)).map(i=>i.id===first.id?result:i),pinnedGoal:s.pinnedGoal?.kind==='item-upgrade'&&consumed.includes(s.pinnedGoal.id)?null:s.pinnedGoal,lifetime:{...s.lifetime,itemsFused:s.lifetime.itemsFused+1}};
 if(s.retention.activeRun&&unique.every(id=>s.retention.activeRun!.metrics!.craftedIds.includes(id))){const m=s.retention.activeRun.metrics!;backed=addChallengeMetrics(backed,{craftedIds:m.craftedIds.filter(id=>!consumed.includes(id)),craftRarity:Math.max(m.craftRarity,rarities.indexOf(rarity))});}
 return addEvent(backed,'item-craft',s.savedAt,{action:'fusion',type:first.type,rarity,resultInstanceId:first.id,consumed:consumed.join(',')});
}
/** Forge upgrades improve the scaling of one item without replacing rarity progression. */
export function forgeItem(s:GameState,id:string,ticket?:ImprovementTicket){const item=s.inventory.find(i=>i.id===id);if(!item||!sameImprovement(item,ticket))return s;const index=s.foundries.findIndex(f=>!f.active);return index<0?s:queueForge(s,index,id);}


/** Active world loot: common signals give a small production burst, caches improve component quality,
 * and rare cores are short jackpot moments. Drop research/items/prestige affect both frequency and quality. */
export function claimLootDrop(s:GameState,id:string,rng=Math.random){
 if(s.retention.activeRun?.id==='no-taps')return s;const drop=s.lootDrops.find(d=>d.id===id);if(!drop||drop.expiresAt<s.savedAt)return {...s,lootDrops:s.lootDrops.filter(d=>d.id!==id)};
 const rewardFactor=drop.rewardFactor??1;const variant=drop.variant??'coin',quality=tapDropMultiplier(s),qualityBoost=variant==='core'?2.35:variant==='cache'?1.45:1;
 const entries=(materialTable(s,'world').map(row=>[row.id,row.weight] as [ComponentId,number]) as [keyof typeof s.componentInventory,number][]).map(([k,w])=>[k,w*Math.pow(Math.max(1,quality)*qualityBoost,BALANCE.materialQualityPowers[k])] as [keyof typeof s.componentInventory,number]);
 const draw=()=>{const total=entries.reduce((n,[,w])=>n+w,0);let roll=rng()*total,pick=entries[entries.length-1][0];for(const [candidate,w] of entries){roll-=w;if(roll<=0){pick=candidate;break}}return pick};
 const draws=variant==='core'?7:variant==='cache'?3:1,perDraw=variant==='core'?2:1,grant:Partial<typeof s.componentInventory>={};
 for(let i=0;i<draws;i++){const pick=draw();const quantity=perDraw*rewardFactor,whole=Math.floor(quantity),fraction=quantity-whole;grant[pick]=(grant[pick]??0)+whole+(fraction>0&&rng()<fraction?1:0);}
 let next=grantComponents({...s,lootDrops:s.lootDrops.filter(d=>d.id!==id),lifetime:{...s.lifetime,dropsClaimed:s.lifetime.dropsClaimed+1}},grant);
 const creditSeconds=variant==='core'?60:variant==='cache'?15:5,dataSeconds=variant==='core'?45:variant==='cache'?12:0;
 const creditGain=creditRateScientific(next.hardware,next.level,next,next.savedAt,false).multiplyNumber(creditSeconds*rewardFactor),dataGain=dataRateScientific(next).multiplyNumber(dataSeconds*rewardFactor);next=addCreditsScientific(next,creditGain,true,false);
 if(dataSeconds>0)next=addDataScientific(next,dataRateScientific(next).multiplyNumber(dataSeconds*rewardFactor));
 let itemDropped=false;
 if(variant==='core'&&s.retention.activeRun?.id!=='closed-supply-chain'){
   const itemChance=Math.min(1,rewardFactor*Math.min(.15,.03+.006*Math.max(0,quality-1)));
   if(rng()<itemChance){next=randomItem(next,rng);itemDropped=true;}
 }
 if(rng()<BALANCE.blueprintDropChance)next=discoverBlueprint(next);return addEvent(next,'component-found',s.savedAt,{source:'world-drop',variant,draws,components:Object.entries(grant).map(([k,v])=>`${k}:${v}`).join(','),creditSeconds,dataSeconds,itemDropped,quality,creditGainExact:JSON.stringify(creditGain.toJSON()),dataGainExact:JSON.stringify(dataGain.toJSON())});
}

export function craftingMissingText(quote:ReturnType<typeof craftingAffordability>,language:string){const de=language==='de';return quote.reasons.map(reason=>reason==='invalid-quantity'?(de?'Ungültige Menge':'Invalid quantity'):reason==='blueprint-unlearned'?(de?'Bauplan noch nicht gelernt':'Blueprint not learned'):reason==='recipe-locked'?(de?'Bauplan gesperrt':'Recipe locked'):reason==='queue-full'?(de?'Warteschlange voll':'Queue full'):reason==='data'?`${quote.data.missingExact.toScientificString()} Data`:reason==='blueprints'?`${quote.missingBlueprints} ${de?'Bauplanfragmente':'blueprint fragments'}`:reason.startsWith('component:')?`${componentText(reason.slice(10) as keyof typeof quote.missingComponents,de?'de':'en').name} ×${quote.missingComponents[reason.slice(10) as keyof typeof quote.missingComponents]}`:`${moduleText(reason.slice(7) as ModuleId,de?'de':'en')} ×${quote.missingModules[reason.slice(7) as keyof typeof quote.missingModules]}`).join(' · ');}
