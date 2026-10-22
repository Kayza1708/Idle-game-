import {createItem} from './inventory';
import {commerceState,type ProductId} from './commerce';
import {seasonLoot} from './seasonLoot';
import type {ChestTier} from './shop';
import {BALANCE,GameState,ComponentId,SeasonState,type ItemTypeId,type Rarity,grantComponents} from './economy';
import {addEvent} from './telemetry';
import {earnGumballVoucher,vouchersAvailable} from './gumballVouchers';
export const SEASON_DAYS=30,SEASON_LEVELS=50,SEASON_XP_PER_LEVEL=1000,SEASON_GRACE_DAYS=7;
export type SeasonReward={level:number;gems?:number;component?:ComponentId;amount?:number;artifact?:string;chest?:ChestTier;vouchers?:number;item?:{type:ItemTypeId;rarity:Rarity}};
export type SeasonRewardTier={level:number;free:SeasonReward;premium:SeasonReward;milestone:boolean};
const rewardFor=(level:number,track:'free'|'premium'):SeasonReward=>{const config=BALANCE.seasonRewards[track],milestone=level%5===0;if(milestone){const index=level/5-1;return{level,gems:config.milestoneGems[index],component:config.milestoneComponents[index] as ComponentId,amount:config.milestoneAmounts[index],...(level===SEASON_LEVELS?{artifact:'boot-sequence-core'}:{})}}const band=Math.min(4,Math.floor((level-1)/10));return{level,gems:config.regularGems[band]+level%3*2,component:config.regularComponents[band] as ComponentId,amount:config.regularAmounts[band]+level%3}};
export const seasonRewardTiers:SeasonRewardTier[]=Array.from({length:SEASON_LEVELS},(_,i)=>{const level=i+1;return{level,free:rewardFor(level,'free'),premium:rewardFor(level,'premium'),milestone:level%5===0}});
/** Existing claims and saves continue to address the free track by level. */
export const seasonRewards:SeasonReward[]=seasonRewardTiers.map(tier=>tier.free);
const levelFor=(season:SeasonState)=>Math.min(SEASON_LEVELS,Math.floor(season.xp/SEASON_XP_PER_LEVEL));
export const seasonLevel=(s:GameState)=>levelFor(s.season);
export const seasonProgress=(s:GameState)=>s.season.xp>=SEASON_LEVELS*SEASON_XP_PER_LEVEL?1:(s.season.xp%SEASON_XP_PER_LEVEL)/SEASON_XP_PER_LEVEL;
export function rollSeason(s:GameState,now:number){if(now<s.season.endsAt)return s.previousSeason&&now>s.previousSeason.claimUntil?{...s,previousSeason:null}:s;const completed=seasonLevel(s)>=SEASON_LEVELS,completedSeasons=completed?[...new Set([...s.profile.completedSeasons,s.season.id])]:s.profile.completedSeasons,elapsed=Math.max(1,Math.floor((now-s.season.startedAt)/(SEASON_DAYS*86400000))),number=Math.max(2,Number(s.season.id.split('-')[1]||1)+elapsed),previous={...s.season,claimUntil:s.season.endsAt+SEASON_GRACE_DAYS*86400000},next={...s,profile:{...s.profile,completedSeasons},previousSeason:now<=previous.claimUntil?previous:null,season:{id:`season-${String(number).padStart(2,'0')}`,startedAt:s.season.endsAt+(elapsed-1)*SEASON_DAYS*86400000,endsAt:s.season.endsAt+elapsed*SEASON_DAYS*86400000,xp:0,claimed:[]}};return addEvent(next,'season-rollover',now,{from:s.season.id,to:next.season.id,graceUntil:previous.claimUntil});}
const legacySeasonClaimable=(s:GameState)=>seasonRewards.some(r=>r.level<=seasonLevel(s)&&!s.season.claimed.includes(r.level))||!!s.previousSeason&&s.savedAt<=s.previousSeason.claimUntil&&seasonRewards.some(r=>r.level<=levelFor(s.previousSeason!)&&!s.previousSeason!.claimed.includes(r.level));
export function addSeasonXP(s:GameState,xp:number,source:string){if(xp<=0)return s;return addEvent({...s,season:{...s.season,xp:s.season.xp+xp}},'season-xp',s.savedAt,{xp,source});}
function claimLegacySeasonReward(s:GameState,level:number,seasonId=s.season.id){if(s.retention.activeRun)return s;const previous=seasonId===s.previousSeason?.id&&s.savedAt<=s.previousSeason.claimUntil,target=previous?s.previousSeason:s.season;if(!target||seasonId!==target.id)return s;const reward=seasonRewards.find(r=>r.level===level);if(!reward||level>levelFor(target)||target.claimed.includes(level))return s;const claimed={...target,claimed:[...target.claimed,level]};let next:GameState=previous?{...s,previousSeason:claimed as GameState['previousSeason']}:{...s,season:claimed};if(reward.gems)next={...next,gems:next.gems+reward.gems,gemLedger:[...next.gemLedger,{id:`season-${seasonId}-${level}`,at:s.savedAt,amount:reward.gems,source:'season'}]};if(reward.component&&reward.amount)next={...next,components:next.components+reward.amount,componentInventory:{...next.componentInventory,[reward.component]:next.componentInventory[reward.component]+reward.amount},lifetime:{...next.lifetime,componentsEarned:next.lifetime.componentsEarned+reward.amount}};if(reward.artifact){const artifact=`${seasonId}-core`;if(!next.profile.artifacts.includes(artifact))next={...next,profile:{...next.profile,artifacts:[...next.profile.artifacts,artifact],completedSeasons:[...new Set([...next.profile.completedSeasons,seasonId])]}}}return addEvent(next,'season-reward',s.savedAt,{seasonId,level,gems:reward.gems??0,component:reward.component??'',amount:reward.amount??0,artifact:reward.artifact??''});}
export const questSeasonXP=(kind:'daily'|'weekly'|'monthly',tier=1)=>({daily:100,weekly:500,monthly:900}[kind]*tier);

export function seasonTheme(id:string){const number=Math.max(1,Math.floor(Number(id.split('-')[1]))||1);return BALANCE.seasonV2.themes[(number-1)%BALANCE.seasonV2.themes.length];}
export const seasonProduct=(id:string)=>`ai_singularity.season.${id.split('-')[1]}` as ProductId;
export const premiumSeasonOwned=(s:GameState,id=s.season.id)=>commerceState(s).owned.includes(seasonProduct(id));
export function getSeasonTiers(id:string):SeasonRewardTier[]{
 const theme=seasonTheme(id),c=BALANCE.seasonV2;
 const reward=(level:number,premium:boolean):SeasonReward=>{
  const track=premium?1:0,band=Math.floor((level-1)/10),milestone=level%c.milestoneEvery===0,
   r:SeasonReward={level},itemType=theme.items[band%theme.items.length] as ItemTypeId;
  if(milestone){r.gems=level===SEASON_LEVELS?c.finalGems[track]:c.milestoneGems[track]*(1+band);r.chest=premium?(level>=40?'legendary':level>=20?'epic':'rare'):(level===SEASON_LEVELS?'epic':level>=40?'rare':'common');}
  else if(level%5===(premium?4:3))r.chest=premium?(band>=3?'epic':'rare'):(band>=3?'rare':'common');
  else if(premium&&level%5===2)r.item={type:itemType,rarity:band>=3?'epic':'rare'};
  else if(level%5===(premium?1:2))r.gems=c.gemBase[track]*(1+band);
  else {r.component=([['circuits','copperCoils','siliconWafers','titaniumBolts','photonicLenses'],['copperCoils','siliconWafers','photonicLenses','graphene','superconductors']][track][band]) as ComponentId;r.amount=c.materialBase[track]+band*c.materialBase[0];}
  const special=(premium?c.premiumItems:c.freeItems) as Record<number,string>;
  if(special[level])r.item={type:theme.items[(level/10-1)%theme.items.length] as ItemTypeId,rarity:special[level] as Rarity};
  if(level===(premium?BALANCE.gumballVouchers.seasonPremiumLevel:BALANCE.gumballVouchers.seasonFreeLevel))r.vouchers=1;
  if(level===SEASON_LEVELS)r.artifact=theme.artifact;
  return r;
 };
 return Array.from({length:SEASON_LEVELS},(_,i)=>({level:i+1,free:reward(i+1,false),premium:reward(i+1,true),milestone:(i+1)%c.milestoneEvery===0}));
}
export const rewardsForSeason=(s:GameState,id=s.season.id)=>s.progression?.version===2?getSeasonTiers(id):seasonRewardTiers;
export function seasonClaimable(s:GameState){
 if(s.progression?.version!==2)return legacySeasonClaimable(s);
 return [s.season,...(s.previousSeason&&s.savedAt<=s.previousSeason.claimUntil?[s.previousSeason]:[])].some(season=>rewardsForSeason(s,season.id).some(r=>r.level<=levelFor(season)&&(!season.claimed.includes(r.level)||premiumSeasonOwned(s,season.id)&&!(season.premiumClaimed??[]).includes(r.level))));
}
export function claimSeasonReward(s:GameState,level:number,seasonId=s.season.id,track:'free'|'premium'='free'){
 if(s.progression?.version!==2)return track==='free'?claimLegacySeasonReward(s,level,seasonId):s;
 if(s.retention.activeRun||s.challengeSession||!['free','premium'].includes(track))return s;
 const previous=seasonId===s.previousSeason?.id&&s.savedAt<=s.previousSeason.claimUntil,target=previous?s.previousSeason:seasonId===s.season.id?s.season:null;
 if(!target||!Number.isInteger(level)||level>levelFor(target)||track==='premium'&&!premiumSeasonOwned(s,seasonId))return s;
 const claimed=track==='free'?target.claimed:target.premiumClaimed??[],r=rewardsForSeason(s,seasonId).find(r=>r.level===level)?.[track],loot=seasonLoot(s);
 if(!r||claimed.includes(level)||r.chest&&loot.pending.length>=BALANCE.seasonV2.maxChests||!Number.isSafeInteger(s.gems+(r.gems??0))||r.chest&&!Number.isSafeInteger(loot.nextId+1)||(r.vouchers??0)>0&&vouchersAvailable(s)+(r.vouchers??0)>BALANCE.gumballVouchers.maxOwned)return s;
 let n=s;
 if(r.component&&r.amount){if(!Number.isSafeInteger(s.componentInventory[r.component]+r.amount)||!Number.isSafeInteger(s.components+r.amount))return s;n=grantComponents(n,{[r.component]:r.amount});}
 if(r.item){const created=createItem(n,r.item.type,r.item.rarity);if(created===n)return s;n=created;}
 if(r.chest)n={...n,seasonLoot:{nextId:loot.nextId+1,pending:[...loot.pending,{id:loot.nextId,tier:r.chest,seasonId}]}};
 if(r.vouchers)n=earnGumballVoucher(n,r.vouchers);
 if(r.gems)n={...n,gems:n.gems+r.gems,gemLedger:[...n.gemLedger,{id:`season:${seasonId}:${track}:${level}`,at:s.savedAt,amount:r.gems,source:`season-${track}`}]};
 if(r.artifact){const id=`${seasonId}-${track==='premium'?'premium-core':'core'}`;n={...n,profile:{...n.profile,artifacts:[...new Set([...n.profile.artifacts,id])],completedSeasons:[...new Set([...n.profile.completedSeasons,seasonId])]}};}
 const changed={...target,[track==='free'?'claimed':'premiumClaimed']:[...claimed,level]};
 n=previous?{...n,previousSeason:changed as GameState['previousSeason']}:{...n,season:changed};
 return addEvent(n,'season-reward',s.savedAt,{seasonId,level,track,gems:r.gems??0,chest:r.chest??'',item:r.item?.type??'',rarity:r.item?.rarity??'',component:r.component??'',amount:r.amount??0,vouchers:r.vouchers??0});
}
