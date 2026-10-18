import {BALANCE,componentIds,grantComponents,type GameState,type ComponentId,type Item,type ItemTypeId,type Rarity} from './economy';
import {createItem} from './inventory';
import {materialAccessible,materialTable} from './materialEconomy';
import {capsuleItemPool} from './capsuleMachine';
import {bonusBoxRoll} from './bonusBoxes';
import {addEvent} from './telemetry';
import type {AdResult} from './ads';
export type ChestTier=keyof typeof BALANCE.shop.chests;
export const chestTiers=Object.keys(BALANCE.shop.chests) as ChestTier[];
export type ShopRotation={day:number;materials:ComponentId[];discount:ComponentId;item:ItemTypeId;claimed:string[]};
export type ShopReceipt={id:number;at:number;offerId:string;kind:'chest'|'material'|'item';payment:'free'|'video'|'gems'|'season';cost:number;tier:ChestTier|null;components:Partial<Record<ComponentId,number>>;item:Item|null};
export type ShopState={revision:number;clockAt:number;rotation:ShopRotation|null;freeNextAt:number;adWindow:{startedAt:number;used:number};pendingAd:{id:string;at:number;expiresAt:number;context:string}|null;last:ShopReceipt|null};
export type ShopOffer={id:string;kind:'chest'|'material'|'item';cost:number;payment:'free'|'gems';tier?:ChestTier;component?:ComponentId;amount?:number;item?:ItemTypeId;rarity?:Rarity;stock?:boolean;discount?:number;originalCost?:number};
export type ShopTicket={id:string;revision:number;day:number};
export const emptyShop=():ShopState=>({revision:0,clockAt:0,rotation:null,freeNextAt:0,adWindow:{startedAt:0,used:0},pendingAd:null,last:null});
const clock=(s:GameState)=>Math.max(s.savedAt,s.shop.clockAt);
export const shopContext=(s:GameState)=>JSON.stringify([s.telemetry.campaignId,s.prestigeCount,s.axiomResetCount,s.retention.activeRun?.runId??null,!!s.challengeSession]);
const blocked=(s:GameState)=>!!s.retention.activeRun||!!s.challengeSession;
const hash=(s:GameState,key:string)=>bonusBoxRoll(s.telemetry.campaignId,'shop:'+key);
export function shopRotation(s:GameState):ShopRotation{
 const day=Math.floor(clock(s)/BALANCE.shop.cycleMs),old=s.shop.rotation;if(old&&day<=old.day)return old;
 const materials=componentIds.filter(id=>materialAccessible(s,id)),ordered=[...materials].sort((a,b)=>hash(s,`${day}:${a}`)-hash(s,`${day}:${b}`)||a.localeCompare(b));
 const pool=capsuleItemPool(s),offset=Math.floor(hash(s,'item-offset')*pool.length);
 let item=pool[(day+offset)%pool.length]??'quantum-chip';if(old&&item===old.item&&pool.length>1)item=pool[(pool.indexOf(item)+1)%pool.length];
 return{day,materials:ordered.slice(0,BALANCE.shop.rotatingOfferCount),discount:ordered.at(-1)??'circuits',item,claimed:[]};
}
export function visitShop(s:GameState):GameState{
 if(blocked(s))return s;const rotation=shopRotation(s),pending=s.shop.pendingAd,pendingAd=pending&&(pending.expiresAt<clock(s)||pending.context!==shopContext(s))?null:pending;
 if(rotation===s.shop.rotation&&pendingAd===pending)return s;
 return{...s,shop:{...s.shop,rotation,pendingAd,clockAt:clock(s),revision:s.shop.revision+1}};
}
export function shopOffers(s:GameState):ShopOffer[]{
 const r=shopRotation(s),packages=BALANCE.shop.materials;
 return[{id:'free-common',kind:'chest',tier:'common',cost:0,payment:'free'},...chestTiers.map(tier=>({id:`chest:${tier}`,kind:'chest' as const,tier,cost:BALANCE.shop.chests[tier].cost,payment:'gems' as const})),
 ...componentIds.map(component=>({id:`material:${component}`,kind:'material' as const,component,...packages[component],payment:'gems' as const})),
 ...r.materials.map(component=>({id:`daily:${r.day}:${component}`,kind:'material' as const,component,...packages[component],payment:'gems' as const,stock:true})),
 {id:`discount:${r.day}:${r.discount}`,kind:'material',component:r.discount,amount:packages[r.discount].amount,cost:Math.ceil(packages[r.discount].cost*(100-BALANCE.shop.discountPercent)/100),originalCost:packages[r.discount].cost,discount:BALANCE.shop.discountPercent,payment:'gems',stock:true},
 {id:`item:${r.day}`,kind:'item',item:r.item,rarity:BALANCE.shop.dailyItemRarity,cost:BALANCE.shop.dailyItemCost,payment:'gems',stock:true}];
}
export function shopQuote(s:GameState,id:string){
 const offer=shopOffers(s).find(o=>o.id===id),r=shopRotation(s),reason=blocked(s)?'challenge':!Number.isSafeInteger(s.shop.revision+2)?'limit':!offer?'expired':offer.component&&!materialAccessible(s,offer.component)?'locked':offer.stock&&r.claimed.includes(offer.id)?'sold':id==='free-common'&&clock(s)<s.shop.freeNextAt?'cooldown':offer.payment==='gems'&&s.gems<offer.cost?'gems':null;
 return{offer:offer??null,allowed:!reason,reason,ticket:{id,revision:s.shop.revision,day:r.day} satisfies ShopTicket,freeRemaining:Math.max(0,s.shop.freeNextAt-clock(s)),rotationRemaining:Math.max(0,(r.day+1)*BALANCE.shop.cycleMs-clock(s))};
}
export function shopVideoQuote(s:GameState){const now=clock(s),window=s.shop.adWindow,used=now>=window.startedAt+BALANCE.shop.cycleMs?0:window.used,pending=s.shop.pendingAd&&s.shop.pendingAd.expiresAt>=now&&s.shop.pendingAd.context===shopContext(s),reason=blocked(s)?'challenge':pending?'busy':used>=BALANCE.adLimits.shopChest?'limit':null;return{allowed:!reason,reason,remaining:BALANCE.adLimits.shopChest-used,resetIn:used?Math.max(0,window.startedAt+BALANCE.shop.cycleMs-now):0};}
function validTx(tx:unknown):tx is string{return typeof tx==='string'&&tx.length>0&&tx.length<=160;}
export function beginShopVideo(s:GameState,tx:string){if(!validTx(tx)||!shopVideoQuote(s).allowed)return s;const now=clock(s);return{...s,shop:{...s.shop,clockAt:now,pendingAd:{id:tx,at:now,expiresAt:now+BALANCE.shop.adTicketMs,context:shopContext(s)}}};}
export function cancelShopVideo(s:GameState,tx:string){return s.shop.pendingAd?.id===tx?{...s,shop:{...s.shop,pendingAd:null}}:s;}
function weighted<T>(rows:{value:T;weight:number}[],roll:()=>number):T{let n=roll()*rows.reduce((sum,r)=>sum+r.weight,0);for(const row of rows){n-=row.weight;if(n<0)return row.value}return rows.at(-1)!.value;}
function grant(s:GameState,offer:ShopOffer,payment:ShopReceipt['payment'],rng:()=>number):GameState{
 const roll=()=>{const value=rng();if(!Number.isFinite(value)||value<0||value>=1)throw new RangeError('Invalid shop roll');return value;};
 let components:ShopReceipt['components']={},itemType:ItemTypeId|undefined=offer.item,rarity=offer.rarity??'common';
 if(offer.kind==='chest'){
  const tier=BALANCE.shop.chests[offer.tier!],rows=materialTable(s,'world');if(!rows.length)return s;
  for(let n=0;n<tier.materialRolls;n++){const id=weighted(rows.map(r=>({value:r.id,weight:r.weight})),roll),amount=tier.materialMin+Math.floor(roll()*(tier.materialMax-tier.materialMin+1));components[id]=(components[id]??0)+amount}
  if(roll()*10000<tier.itemChance){const pool=capsuleItemPool(s);if(!pool.length)return s;rarity=weighted(Object.entries(tier.rarityWeights).filter(([,weight])=>weight>0).map(([value,weight])=>({value:value as Rarity,weight})),roll);itemType=pool[Math.floor(roll()*pool.length)]}
 }else if(offer.kind==='material')components={[offer.component!]:offer.amount!};
 const total=Object.values(components).reduce((n,v)=>n+v!,0);if(!Number.isSafeInteger(s.components+total)||!Number.isSafeInteger(s.lifetime.componentsEarned+total)||Object.entries(components).some(([id,n])=>!Number.isSafeInteger(s.componentInventory[id as ComponentId]+n!)))return s;
 let next=s;if(itemType){next=createItem(next,itemType,rarity);if(next===s)return s}if(total)next=grantComponents(next,components);
 const item=itemType?{...next.inventory.at(-1)!}:null,now=clock(s),id=s.shop.revision+1,cost=payment==='gems'?offer.cost:0;
 const receipt:ShopReceipt={id,at:now,offerId:offer.id,kind:offer.kind,payment,cost,tier:offer.tier??null,components,item};
 const shop:ShopState={...s.shop,revision:id,clockAt:now,rotation:s.shop.rotation?{...s.shop.rotation,claimed:offer.stock?[...s.shop.rotation.claimed,offer.id]:s.shop.rotation.claimed}:null,freeNextAt:payment==='free'?now+BALANCE.shop.cycleMs:s.shop.freeNextAt,last:receipt};
 return addEvent({...next,gems:next.gems-cost,shop,gemLedger:cost?[...next.gemLedger,{id:`shop:${s.telemetry.campaignId}:${id}`,at:now,amount:-cost,source:offer.id}]:next.gemLedger},'gem-purchase',now,{offer:offer.id,cost,payment,receipt:id,item:item?.type??'',rarity:item?.rarity??'',components:JSON.stringify(components)});
}
const seeded=(s:GameState)=>{let i=0;return()=>hash(s,`receipt:${s.shop.revision+1}:${i++}`)};
/** Expected revision/day prevent double taps and stale rotating offers. Debit + grant are atomic. */
export function buyShopOffer(s:GameState,ticket:ShopTicket,rng?:()=>number){
 if(!ticket||ticket.revision!==s.shop.revision||ticket.day!==shopRotation(s).day)return s;const q=shopQuote(s,ticket.id);if(!q.allowed||!q.offer)return s;
 const ready=visitShop(s);try{const next=grant(ready,q.offer,q.offer.payment,rng??seeded(ready));return next===ready?s:next}catch{return s}
}
/** Only a matching pending provider completion can grant one common chest. */
export function completeShopVideo(s:GameState,tx:string,result:AdResult):GameState{
 const pending=s.shop.pendingAd;if(!pending||pending.id!==tx)return s;
 if(result!=='success'||blocked(s)||pending.context!==shopContext(s)||clock(s)>pending.expiresAt)return cancelShopVideo(s,tx);
 const cleared=cancelShopVideo(s,tx),q=shopVideoQuote(cleared);if(!q.allowed)return cleared;
 const ready=visitShop(cleared),offer=shopOffers(ready)[0];let next:GameState;try{next=grant(ready,offer,'video',seeded(ready))}catch{return cleared}if(next===ready)return cleared;
 const prior=ready.shop.adWindow,now=clock(ready),window=now>=prior.startedAt+BALANCE.shop.cycleMs?{startedAt:now,used:0}:prior;
 return{...next,shop:{...next.shop,adWindow:{startedAt:window.startedAt,used:window.used+1}}};
}

export function migrateShopSave(value:any):any{if(!value||typeof value!=='object')return value;const next={...value,shop:Object.hasOwn(value,'shop')?value.shop:emptyShop()};if(value.challengeSession)next.challengeSession={...value.challengeSession,main:migrateShopSave(value.challengeSession.main)};return next;}
/** Reject malformed new saves instead of silently replenishing claims or resetting limits. */
export function validShop(value:unknown):value is ShopState{
 const s=value as ShopState,int=(n:unknown)=>Number.isSafeInteger(n)&&Number(n)>=0,time=(n:unknown)=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=8.64e15;
 if(!s||!int(s.revision)||!time(s.clockAt)||!time(s.freeNextAt)||!s.adWindow||!time(s.adWindow.startedAt)||!int(s.adWindow.used)||s.adWindow.used>BALANCE.adLimits.shopChest)return false;
 if(s.rotation!==null){const r=s.rotation;if(!r||!int(r.day)||!Array.isArray(r.materials)||r.materials.length!==BALANCE.shop.rotatingOfferCount||new Set(r.materials).size!==r.materials.length||r.materials.some(id=>!componentIds.includes(id))||!componentIds.includes(r.discount)||!capsuleItemType(r.item)||!Array.isArray(r.claimed)||r.claimed.length>BALANCE.shop.rotatingOfferCount+2||new Set(r.claimed).size!==r.claimed.length||r.claimed.some(id=>typeof id!=='string'||!([...r.materials.map(c=>`daily:${r.day}:${c}`),`discount:${r.day}:${r.discount}`,`item:${r.day}`].includes(id))))return false;}
 if(s.pendingAd!==null){const p=s.pendingAd;if(!p||!validTx(p.id)||!time(p.at)||!time(p.expiresAt)||p.expiresAt-p.at!==BALANCE.shop.adTicketMs||typeof p.context!=='string'||p.context.length>1000)return false;}
 if(s.last!==null){const r=s.last;if(!r||!int(r.id)||!r.id||r.id>s.revision||!time(r.at)||!validTx(r.offerId)||!['chest','material','item'].includes(r.kind)||!['free','video','gems','season'].includes(r.payment)||!int(r.cost)||(r.payment!=='gems'&&r.cost!==0)||!(r.tier===null||chestTiers.includes(r.tier))||!r.components||Array.isArray(r.components)||typeof r.components!=='object'||Object.entries(r.components).some(([id,n])=>!componentIds.includes(id as ComponentId)||!int(n)||Number(n)<=0))return false;
  if(r.kind==='chest'&&!r.tier||r.kind!=='chest'&&r.tier!==null)return false;
  if(r.item!==null&&(!r.item||!validTx(r.item.id)||!capsuleItemType(r.item.type)||!Object.hasOwn(BALANCE.rarity,r.item.rarity)||r.item.level!==1||r.item.locked!==false))return false;
  if(r.kind==='item'&&!r.item||r.kind==='material'&&r.item!==null)return false;
 }else if(s.revision>0&&s.freeNextAt>0)return false;
 return true;
}
function capsuleItemType(id:unknown):id is ItemTypeId{return typeof id==='string'&&Object.hasOwn(BALANCE.itemRecipes,id)&&!['impulse-relay','insight-archive'].includes(id);}

/** Earned chest: the same loot table and receipt animation, without spending or changing daily offers. */
export function grantRewardChest(s:GameState,tier:ChestTier,source:string){
 if(blocked(s)||!chestTiers.includes(tier)||!Number.isSafeInteger(s.shop.revision+1))return s;
 try{return grant(s,{id:source,kind:'chest',tier,cost:0,payment:'free'},'season',seeded(s));}catch{return s;}
}
