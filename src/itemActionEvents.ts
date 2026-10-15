import {itemEffectProfile,itemEffectFor,deepPrestigeBonus,equipmentSlots,type GameState,type Item,type ComponentId} from './economy';
import {effectText} from './gameplayI18n';
import {specialItemEffectText} from './specialItemText';
import {salvageQuote} from './recovery';
export type ItemActionKind='craft'|'fusion'|'upgrade'|'refine'|'recycle'|'equip'|'unequip'|'lock'|'unlock';
export type ItemActionEvent={kind:ItemActionKind;item:Item;before?:Item;inputs:Item[];components:Partial<Record<ComponentId,number>>;count:number;stats:string[];beforeStats:string[];cinematic:boolean};
export const sameItemContext=(a:GameState,b:GameState)=>a.telemetry.campaignId===b.telemetry.campaignId&&a.prestigeCount===b.prestigeCount&&a.axiomResetCount===b.axiomResetCount&&a.retention.activeRun?.runId===b.retention.activeRun?.runId&&!!a.challengeSession===!!b.challengeSession;
export function itemStatLines(s:GameState,item:Item){const special=specialItemEffectText(s,item);return special?[special]:itemEffectProfile(item).map(effect=>`${effectText(effect,s.settings.language)} +${(itemEffectFor(s,item,effect)*(1+deepPrestigeBonus(s,'manufacturing'))*100).toFixed(2)} %`);}
/** Confirmed transitions only. No RNG, economy mutation, saved flags or animation callbacks. */
export function itemActionEvent(action:string,before:GameState,after:GameState):ItemActionEvent|null{
 if(before===after||!sameItemContext(before,after)||after.savedAt-before.savedAt>60000||['save-import','full-reset','test-reset'].includes(action))return null;
 if(before.inventory===after.inventory&&before.equipped===after.equipped)return null;
 const old=new Map(before.inventory.map(i=>[i.id,i]));
 const remaining=new Set(after.inventory.map(i=>i.id));
 const added=after.inventory.filter(i=>!old.has(i.id)),removed=before.inventory.filter(i=>!remaining.has(i.id));
 const make=(kind:ItemActionKind,item:Item,inputs:Item[]=[],components:ItemActionEvent['components']={},count=1):ItemActionEvent=>({kind,item:{...item},before:old.has(item.id)?{...old.get(item.id)!}:undefined,inputs:inputs.map(i=>({...i})),components:{...components},count,stats:kind==='recycle'?[]:itemStatLines(after,item),beforeStats:old.has(item.id)?itemStatLines(before,old.get(item.id)!):[],cinematic:(kind==='craft'&&action==='craft')||kind==='fusion'});
 if(action==='item-fuse'&&after.lifetime.itemsFused>before.lifetime.itemsFused){const result=after.inventory.find(i=>old.has(i.id)&&old.get(i.id)!.rarity!==i.rarity);if(result){const inputs=[old.get(result.id)!,...removed.filter(i=>i.type===result.type&&i.rarity===old.get(result.id)!.rarity)];if(inputs.length===3)return make('fusion',result,inputs)}}
 if(added.length&&after.lifetime.itemsCrafted>before.lifetime.itemsCrafted&&(action==='craft'||action==='foreground-tick')){
  const item=added[0],matching=added.filter(i=>i.type===item.type&&i.rarity===item.rarity&&i.level===item.level);
  const components=Object.fromEntries(Object.entries(before.componentInventory).map(([id,n])=>[id,Math.max(0,n-after.componentInventory[id as ComponentId])]).filter(([,n])=>Number(n)>0));
  return make('craft',item,[],components,matching.length);
 }
 if(action==='salvage'&&removed.length===1){const item=removed[0],q=salvageQuote(before,item.id);if(q.allowed)return make('recycle',item,[item],q.returned)}
 for(const item of after.inventory){const was=old.get(item.id);if(!was)continue;
  if(action==='upgrade'&&item.level>was.level)return make('upgrade',item,[was]);
  if((item.forge??0)>(was.forge??0)&&after.lifetime.forgeUpgrades>before.lifetime.forgeUpgrades)return make('refine',item,[was]);
  if(action==='lock'&&item.locked!==was.locked)return make(item.locked?'lock':'unlock',item);
 }
 if(action==='equip'||action==='unequip')for(const slot of equipmentSlots)if(before.equipped[slot]!==after.equipped[slot]){const id=action==='equip'?after.equipped[slot]:before.equipped[slot],item=after.inventory.find(i=>i.id===id);if(item)return make(action,item)}
 return null;
}
