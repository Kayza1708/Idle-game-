import {BALANCE,componentIds,type GameState,type ComponentId,type ItemTypeId} from './economy';
import {accessibleUnknownBlueprints,materialPackageQuote,grantMaterialBox,type MaterialFamily} from './materialEconomy';
import {addEvent} from './telemetry';
export type BonusBox={id:number;at:number;choices:{family:MaterialFamily;amount:number}[];blueprint:ItemTypeId|'fragment'|null};
export type BonusBoxReceipt={id:number;at:number;family:MaterialFamily;components:Partial<Record<ComponentId,number>>;blueprint:ItemTypeId|'fragment'|null;automatic:boolean};
export type BonusBoxState={earned:number;opened:number;pending:BonusBox[];lastDailyKey:string|null;lastOpened:BonusBoxReceipt|null};
export const emptyBonusBoxes=():BonusBoxState=>({earned:0,opened:0,pending:[],lastDailyKey:null,lastOpened:null});
const main=(s:GameState)=>!s.retention.activeRun&&!s.challengeSession;
/** Stable receipt roll: no call-time RNG, clock or open-time unlocks. */
export function bonusBoxRoll(campaign:string,key:string){let hash=2166136261;for(const char of `${campaign}:${key}`)hash=Math.imul(hash^char.charCodeAt(0),16777619)>>>0;hash^=hash>>>16;hash=Math.imul(hash,0x7feb352d)>>>0;hash^=hash>>>15;return (hash>>>0)/4294967296;}
export function openBonusBox(s:GameState,id:number,family:MaterialFamily,automatic=false){
 if(!main(s))return s;const box=s.bonusBoxes.pending.find(b=>b.id===id),choice=box?.choices.find(c=>c.family===family);if(!box||!choice)return s;
 const components=Object.fromEntries(BALANCE.materialFamilies[family].ids.map(id=>[id,choice.amount])) as Partial<Record<ComponentId,number>>;
 const beforeKnown=s.materials.knownBlueprints.includes(box.blueprint as ItemTypeId)||s.learnedRecipes?.includes(box.blueprint as ItemTypeId),blueprint=box.blueprint&&beforeKnown?'fragment':box.blueprint;
 if(Object.entries(components).some(([id,n])=>!Number.isSafeInteger(s.componentInventory[id as ComponentId]+n!))||!Number.isSafeInteger(s.components+Object.values(components).reduce((n,v)=>n+v!,0))||blueprint==='fragment'&&!Number.isSafeInteger(s.blueprintFragments+1))return s;
 const consumed={...s,bonusBoxes:{...s.bonusBoxes,opened:s.bonusBoxes.opened+1,pending:s.bonusBoxes.pending.filter(b=>b.id!==id),lastOpened:{id,at:s.savedAt,family,components,blueprint,automatic}}};
 const granted=grantMaterialBox(consumed,family,()=>1,{components,blueprint});
 return addEvent(granted,'bonus-box-open',s.savedAt,{id,family,automatic,components:JSON.stringify(components),blueprint:blueprint??''},true);
}
/** Called only by the actual daily bonus claim. No retroactive/login/timer generator. */
export function earnDailyBonusBox(s:GameState){
 const key=s.missions.daily.key;if(!main(s)||!s.missions.daily.bonusClaimed||s.bonusBoxes.lastDailyKey===key||s.bonusBoxes.earned>=Number.MAX_SAFE_INTEGER)return s;
 const choices=BALANCE.materialFamilyPriority.filter(f=>s.materials.families.includes(f as MaterialFamily)).map(f=>({family:f as MaterialFamily,amount:materialPackageQuote(s,f as MaterialFamily).components[BALANCE.materialFamilies[f as MaterialFamily].ids[0] as ComponentId]!}));if(!choices.length)return s;
 const roll=bonusBoxRoll(s.telemetry.campaignId,key),blueprint=roll<BALANCE.blueprintDropChance?(accessibleUnknownBlueprints(s)[0]??'fragment'):null,id=s.bonusBoxes.earned+1;
 let next=addEvent({...s,bonusBoxes:{...s.bonusBoxes,earned:id,lastDailyKey:key,pending:[...s.bonusBoxes.pending,{id,at:s.savedAt,choices,blueprint}]}},'bonus-box-earned',s.savedAt,{id,source:'daily-mission-bonus',period:key},true);
 // Preserve older choices; settle only the newly earned overflow receipt immediately.
 if(next.bonusBoxes.pending.length>BALANCE.bonusBoxMaxPending)next=openBonusBox(next,id,choices[0].family,true);
 return next.bonusBoxes.pending.length>BALANCE.bonusBoxMaxPending?s:next;
}
export function migrateBonusBoxes(value:any):any{if(!value||typeof value!=='object')return value;const next={...value,bonusBoxes:value.bonusBoxes??emptyBonusBoxes()};if(value.challengeSession)next.challengeSession={...value.challengeSession,main:migrateBonusBoxes(value.challengeSession.main)};return next;}
export function validBonusBoxes(value:unknown):value is BonusBoxState{
 const b=value as BonusBoxState;if(!b||!Number.isSafeInteger(b.earned)||!Number.isSafeInteger(b.opened)||b.opened<0||b.earned<b.opened||!Array.isArray(b.pending)||b.pending.length>BALANCE.bonusBoxMaxPending||b.earned-b.opened!==b.pending.length||!(b.lastDailyKey===null||typeof b.lastDailyKey==='string'&&b.lastDailyKey.length<=64))return false;
 const id=(n:number)=>Number.isSafeInteger(n)&&n>0&&n<=b.earned,at=(n:number)=>Number.isFinite(n)&&n>=0&&n<=8.64e15,blueprint=(x:unknown)=>x===null||x==='fragment'||typeof x==='string'&&Object.hasOwn(BALANCE.extendedItems,x);
 if(!b.pending.every(x=>x&&typeof x==='object'&&Array.isArray(x.choices)&&x.choices.every(c=>c&&typeof c==='object')))return false;
 if(new Set(b.pending.map(x=>x.id)).size!==b.pending.length||!b.pending.every(x=>x&&id(x.id)&&at(x.at)&&blueprint(x.blueprint)&&Array.isArray(x.choices)&&x.choices.length>0&&x.choices.length<=5&&new Set(x.choices.map(c=>c.family)).size===x.choices.length&&x.choices.every(c=>Object.hasOwn(BALANCE.materialFamilies,c.family)&&Number.isSafeInteger(c.amount)&&c.amount>0&&c.amount<=BALANCE.bonusBoxMaxMaterialAmount)))return false;
 const r=b.lastOpened;if(b.opened===0&&r!==null||b.opened>0&&r===null)return false;return r===null||!!r&&id(r.id)&&!b.pending.some(x=>x.id===r.id)&&at(r.at)&&Object.hasOwn(BALANCE.materialFamilies,r.family)&&typeof r.automatic==='boolean'&&blueprint(r.blueprint)&&!!r.components&&Object.keys(r.components).length===BALANCE.materialFamilies[r.family].ids.length&&Object.entries(r.components).every(([k,n])=>componentIds.includes(k as ComponentId)&&(BALANCE.materialFamilies[r.family].ids as readonly string[]).includes(k)&&Number.isSafeInteger(n)&&n!>0&&n!<=BALANCE.bonusBoxMaxMaterialAmount);
}
