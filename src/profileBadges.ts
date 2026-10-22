/** Presentation tiers only: server may never mint badges from these local counters. */
export type ProfileBadgeFamily='prestige'|'challenge'|'achievement'|'hardware';
export type LocalBadge={achievementId:string;family:ProfileBadgeFamily;tier:1|2|3;claims:number};

const families:{achievementId:string;family:ProfileBadgeFamily}[]=[
 {achievementId:'prestiges',family:'prestige'},
 {achievementId:'challenge-stages',family:'challenge'},
 {achievementId:'hardware',family:'hardware'},
 {achievementId:'research',family:'achievement'},
 {achievementId:'crafting',family:'achievement'},
 {achievementId:'items',family:'achievement'},
 {achievementId:'int',family:'prestige'}
];
export function profileBadgeFamily(achievementId:string):ProfileBadgeFamily{
 return families.find(x=>x.achievementId===achievementId)?.family??'achievement';
}
export function badgeTierForClaims(claims:number):1|2|3{
 return claims>=8?3:claims>=4?2:1;
}
export function localProfileBadges(claimedAchievements:readonly string[]):LocalBadge[]{
 const counts=new Map<string,Set<number>>();
 for(const key of claimedAchievements){
  if(typeof key!=='string')continue;
  const marker=key.lastIndexOf(':'),id=key.slice(0,marker),n=Number(key.slice(marker+1));
  if(marker<=0||!Number.isInteger(n)||n<0||n>=10)continue;
  if(!families.some(x=>x.achievementId===id))continue;
  if(!counts.has(id))counts.set(id,new Set());
  counts.get(id)!.add(n);
 }
 return families.map(({achievementId,family})=>{
  const claims=counts.get(achievementId)?.size??0;
  return {achievementId,family,claims,tier:badgeTierForClaims(claims)};
 }).filter(x=>x.claims>0);
}
/** The modal preview can show up to three highest earned badges without an online sync. */
export function localBadgeShowcase(claimedAchievements:readonly string[],limit=3){
 return localProfileBadges(claimedAchievements)
  .sort((a,b)=>b.tier-a.tier||b.claims-a.claims||a.achievementId.localeCompare(b.achievementId))
  .slice(0,Math.min(3,Math.max(0,limit)));
}
