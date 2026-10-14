import {ScientificNumber,type ScientificJSON} from './scientificNumber';
import {BALANCE,creditRateScientific,dataRateScientific,addCreditsScientific,addDataScientific,componentIds,dayKey,grantComponents,itemTypes,type GameState,type ComponentId,type ItemTypeId,type Rarity} from './economy';
import {materialTable,newBlueprintAccess} from './materialEconomy';
import {createItem} from './inventory';
import {bonusBoxRoll} from './bonusBoxes';
import {addEvent} from './telemetry';
import type {AdResult} from './ads';
const rarities=Object.keys(BALANCE.rarity) as Rarity[];
export type CapsuleReceipt={id:number;at:number;payment:'gems'|'video';kind:'item'|'components'|'credits'|'data'|'gems'|'jackpot';resource:{id:'credits'|'data'|'gems';amount:ScientificJSON}|null;rarity:Rarity;item:{id:string;type:ItemTypeId}|null;components:Partial<Record<ComponentId,number>>};
export type CapsuleState={draws:number;items:number;last:CapsuleReceipt|null};
export const emptyCapsuleMachine=():CapsuleState=>({draws:0,items:0,last:null});
export function capsuleItemPool(s:GameState){return (Object.keys(itemTypes) as ItemTypeId[]).filter(type=>type!=='impulse-relay'&&type!=='insight-archive'&&(!Object.hasOwn(BALANCE.extendedItems,type)||newBlueprintAccess(s,type)));}
export function capsuleQuote(s:GameState){
 const reason=s.retention.activeRun||s.challengeSession?'challenge':s.prestigeCount<1?'prestige':!Number.isSafeInteger(s.capsuleMachine.draws+1)?'limit':null;
 const day=dayKey(s.savedAt),used=s.ads.day===day?(s.ads.counts.capsule??0):0;
 return{reason,cost:BALANCE.capsuleMachine.gemCost,itemChance:BALANCE.capsuleMachine.itemChance,next:s.capsuleMachine.draws+1,allowed:!reason&&Number.isSafeInteger(s.gems)&&s.gems>=BALANCE.capsuleMachine.gemCost,videoAllowed:!reason&&used<BALANCE.adLimits.capsule,videoRemaining:Math.max(0,BALANCE.adLimits.capsule-used),materials:materialTable(s,'world'),items:capsuleItemPool(s)};
}
export function capsuleMaterialTier(chance:number){return chance<BALANCE.capsuleMachine.rareChanceBoundary?'rare':chance<BALANCE.capsuleMachine.uncommonChanceBoundary?'uncommon':'common';}
function grant(s:GameState,id:number,payment:CapsuleReceipt['payment'],rng:()=>number,at:number){
 const q=capsuleQuote(s);if(q.reason||id!==q.next)return s;
 const random=()=>{const value=rng();if(!Number.isFinite(value)||value<0||value>=1)throw new RangeError('Invalid capsule roll');return value};
 let next=s,item:CapsuleReceipt['item']=null,components:CapsuleReceipt['components']={},rarity:Rarity='common',kind:CapsuleReceipt['kind']='components',resource:CapsuleReceipt['resource']=null;const roll=random();
 if(roll<q.itemChance){
  if(!q.items.length)return s;let value=random(),picked=rarities.at(-1)!;for(const r of rarities){value-=BALANCE.rarity[r].chance;if(value<0){picked=r;break}}
  rarity=picked;const type=q.items[Math.floor(random()*q.items.length)];next=createItem(s,type,rarity);if(next===s)return s;item={id:next.inventory.at(-1)!.id,type};kind='item';
 }else if(roll<q.itemChance+BALANCE.capsuleMachine.componentChance){
  let value=random(),picked=q.materials.at(-1);for(const row of q.materials){value-=row.chance;if(value<0){picked=row;break}}if(!picked)return s;
  rarity=capsuleMaterialTier(picked.chance);const [minimum,maximum]=BALANCE.capsuleMachine.componentRanges[rarity as 'common'|'uncommon'|'rare'],amount=minimum+Math.floor(random()*(maximum-minimum+1));
  if(!Number.isSafeInteger(s.componentInventory[picked.id]+amount)||!Number.isSafeInteger(s.components+amount)||!Number.isSafeInteger(s.lifetime.componentsEarned+amount))return s;
  components={[picked.id]:amount};next=addEvent(grantComponents(s,components),'component-found',at,{source:'capsule-machine',components:JSON.stringify(components)});
 }
 else{
  const b=BALANCE.capsuleMachine,componentEnd=Number((q.itemChance+b.componentChance).toFixed(10)),creditEnd=Number((componentEnd+b.creditChance).toFixed(10)),dataEnd=Number((creditEnd+b.dataChance).toFixed(10));
  kind=roll<creditEnd?'credits':roll<dataEnd?'data':roll<1-b.jackpotChance?'gems':'jackpot';
  if(kind==='credits'||kind==='data'){
   const range=kind==='credits'?b.creditSeconds:b.dataSeconds,seconds=range[0]+Math.floor(random()*(range[1]-range[0]+1)),rate=kind==='credits'?creditRateScientific(s.hardware,s.level,s,at,false):dataRateScientific(s),floor=ScientificNumber.from(kind==='credits'?b.creditFloor:b.dataFloor),raw=rate.multiplyNumber(seconds),amount=raw.compare(floor)<0?floor:raw;
   resource={id:kind,amount:amount.toJSON()};next=kind==='credits'?addCreditsScientific(s,amount,false,false):addDataScientific(s,amount);
  }else{
   const amount=kind==='jackpot'?b.gemCost*b.jackpotMultiplier:b.gemRange[0]+Math.floor(random()*(b.gemRange[1]-b.gemRange[0]+1));if(!Number.isSafeInteger(s.gems+amount))return s;
   resource={id:'gems',amount:ScientificNumber.from(amount).toJSON()};next={...s,gems:s.gems+amount,gemLedger:[...s.gemLedger,{id:`capsule-reward-${id}`,at,amount,source:'capsule-reward'}]};
  }
 }
 const receipt:CapsuleReceipt={id,at,payment,kind,rarity,item,components,resource};
 return {...next,capsuleMachine:{draws:id,items:s.capsuleMachine.items+(kind==='item'?1:0),last:receipt}};
}
const recordDraw=(s:GameState)=>{const r=s.capsuleMachine.last!;return addEvent(s,'capsule-draw',r.at,{id:r.id,payment:r.payment,kind:r.kind,rarity:r.rarity,item:r.item?.type??'',components:JSON.stringify(r.components),resource:r.resource?.id??'',amount:r.resource?ScientificNumber.fromJSON(r.resource.amount).toScientificString(16):''})};
const rolls=(s:GameState,key:string)=>{let index=0;return()=>bonusBoxRoll(s.telemetry.campaignId,`capsule:${key}:${index++}`)};
/** Debit and grant are one state transaction. Animation never books a second reward. */
export function drawGemCapsule(s:GameState,id:number,rng=rolls(s,`gem:${id}`)){
 if(!capsuleQuote(s).allowed)return s;const paid={...s,gems:s.gems-BALANCE.capsuleMachine.gemCost,gemLedger:[...s.gemLedger,{id:`capsule-${id}`,at:s.savedAt,amount:-BALANCE.capsuleMachine.gemCost,source:'capsule-machine'}]};const next=grant(paid,id,'gems',rng,s.savedAt);if(next===paid)return s;
 return recordDraw(next);
}
/** Called only with the provider completion result, never from a video-button click. */
export function rewardCapsuleVideo(s:GameState,tx:string,result:AdResult,now:number,rng=rolls(s,`video:${tx}`)){
 if(result!=='success'||typeof tx!=='string'||!Number.isFinite(now)||now<0||now>8.64e15||!tx||tx.length>160||s.ads.transactions.includes(tx)||!capsuleQuote({...s,savedAt:now}).videoAllowed)return s;
 const next=grant(s,s.capsuleMachine.draws+1,'video',rng,now);if(next===s)return s;
 const day=dayKey(now),counts=s.ads.day===day?s.ads.counts:{};
 return recordDraw({...next,ads:{day,counts:{...counts,capsule:(counts.capsule??0)+1},transactions:[...s.ads.transactions,tx]}});
}
export function migrateCapsuleMachine(value:any):any{if(!value||typeof value!=='object')return value;const next={...value,capsuleMachine:value.capsuleMachine?{...value.capsuleMachine,last:value.capsuleMachine.last?{...value.capsuleMachine.last,resource:value.capsuleMachine.last.resource??null}:null}:emptyCapsuleMachine()};if(value.challengeSession)next.challengeSession={...value.challengeSession,main:migrateCapsuleMachine(value.challengeSession.main)};return next;}
export function validCapsuleMachine(value:unknown):value is CapsuleState{
 const s=value as CapsuleState,integer=(v:unknown)=>Number.isSafeInteger(v)&&Number(v)>=0;
 if(!s||!integer(s.draws)||!integer(s.items)||s.items>s.draws)return false;
 if(s.draws===0)return s.items===0&&s.last===null;const r=s.last;
 if(!r||r.id!==s.draws||!Number.isFinite(r.at)||r.at<0||r.at>8.64e15||!['gems','video'].includes(r.payment)||!rarities.includes(r.rarity)||!r.components||typeof r.components!=='object'||Array.isArray(r.components))return false;
 if(['credits','data','gems','jackpot'].includes(r.kind)){if(r.item!==null||Object.keys(r.components).length||!r.resource||r.resource.id!==(['gems','jackpot'].includes(r.kind)?'gems':r.kind)||!ScientificNumber.isValidJSON(r.resource.amount))return false;const amount=ScientificNumber.fromJSON(r.resource.amount);return !amount.isZero()&&(r.resource.id!=='gems'||Number.isSafeInteger(amount.toNumber())&&amount.toNumber()>0)}
 if(r.resource!==null)return false;
 if(r.kind==='item')return s.items>0&&!!r.item&&typeof r.item.id==='string'&&r.item.id.length>0&&Object.hasOwn(itemTypes,r.item.type)&&Object.keys(r.components).length===0;
 return r.kind==='components'&&r.item===null&&Object.keys(r.components).length===1&&Object.entries(r.components).every(([id,n])=>componentIds.includes(id as ComponentId)&&integer(n)&&n!>=1&&n!<=BALANCE.capsuleMachine.componentRanges.common[1]);
}

export const capsuleTier=(receipt:CapsuleReceipt)=>receipt.kind==='item'||receipt.kind==='jackpot'?'high':receipt.kind==='data'||receipt.kind==='gems'?'mid':'low';
