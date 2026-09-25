import {GameState,HardwareId,hardwareIds,hardwareMasteryLevel} from './economy';
export type Challenge={id:string;name:string;description:string;stars:number;check:(s:GameState)=>boolean};
export const challenges:Challenge[]=[
{id:'first-empire',name:'Compute Empire',description:'Besitze 500 Einheiten in 5 Hardwareklassen.',stars:1,check:s=>hardwareIds.filter(id=>s.hardwareCounts[id]>=500).length>=5},
{id:'master-network',name:'Master Network',description:'Erreiche insgesamt 25 Hardware-Mastery-Level.',stars:2,check:s=>hardwareIds.reduce((n,id)=>n+hardwareMasteryLevel(s,id),0)>=25},
{id:'prestige-25',name:'Recursive Intelligence',description:'Führe 25 Prestiges durch.',stars:2,check:s=>s.lifetime.prestiges>=25},
{id:'prestige-100',name:'Deep Recursion',description:'Führe 100 Prestiges durch.',stars:4,check:s=>s.lifetime.prestiges>=100},
{id:'research-500',name:'Research Institute',description:'Schließe 500 Forschungen ab.',stars:3,check:s=>s.lifetime.researchCompleted>=500},
{id:'components-100k',name:'Material Vault',description:'Finde 100.000 Komponenten.',stars:3,check:s=>s.lifetime.componentsEarned>=100000},
{id:'items-250',name:'Master Fabricator',description:'Stelle 250 Items her.',stars:3,check:s=>s.lifetime.itemsCrafted>=250},
{id:'achievement-500',name:'Completionist',description:'Erreiche 500 Achievement Points.',stars:4,check:s=>s.achievementPoints>=500},
{id:'season-3',name:'Seasoned Operator',description:'Schließe 3 Seasons vollständig ab.',stars:4,check:s=>s.profile.completedSeasons.length>=3},
{id:'season-12',name:'Year One',description:'Schließe 12 Seasons vollständig ab.',stars:8,check:s=>s.profile.completedSeasons.length>=12},
{id:'mastery-100',name:'Hardware Savant',description:'Erreiche insgesamt 100 Hardware-Mastery-Level.',stars:8,check:s=>hardwareIds.reduce((n,id)=>n+hardwareMasteryLevel(s,id),0)>=100},
{id:'all-mastered',name:'Machine Civilization',description:'Erreiche Mastery 5 mit allen 15 Hardwareklassen.',stars:12,check:s=>hardwareIds.every(id=>hardwareMasteryLevel(s,id)>=5)}];
export const challengeClaimable=(s:GameState,c:Challenge)=>c.check(s)&&!s.retention.claimedChallenges.includes(c.id);
export function claimChallenge(s:GameState,id:string){const c=challenges.find(x=>x.id===id);if(!c||!challengeClaimable(s,c))return s;return{...s,retention:{...s.retention,challengeStars:s.retention.challengeStars+c.stars,claimedChallenges:[...s.retention.claimedChallenges,id]}};}
export const totalMastery=(s:GameState)=>hardwareIds.reduce((n,id)=>n+hardwareMasteryLevel(s,id),0);
export const collectionSummary=(s:GameState)=>({hardware:s.lifetime.hardwareClasses.length,hardwareTotal:hardwareIds.length,components:Object.values(s.componentInventory).filter(v=>v>0).length,componentsTotal:Object.keys(s.componentInventory).length,itemTypes:s.lifetime.itemTypes.length,itemTypesTotal:9,artifacts:s.profile.artifacts.length,seasons:s.profile.completedSeasons.length});
export const prestigeGate=(s:GameState,depth:number)=>depth<=4?null:depth===5?{ok:s.achievementPoints>=100,label:'100 Achievement Points'}:depth===6?{ok:totalMastery(s)>=10,label:'10 Hardware Mastery'}:depth===7?{ok:s.retention.challengeStars>=10,label:'10 Challenge Stars'}:{ok:s.achievementPoints>=500&&totalMastery(s)>=50&&s.retention.challengeStars>=25,label:'500 AP · 50 Mastery · 25 Stars'};
export const masteryName=(id:HardwareId)=>id;
