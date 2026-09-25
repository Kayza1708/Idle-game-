import {GameState,HardwareId,hardwareIds,hardwareMasteryLevel,newGame,newINT} from './economy';
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
export type RunChallenge={id:string;name:string;description:string;stars:number};
export const runChallenges:RunChallenge[]=[
{id:'no-taps',name:'Hands Off',description:'Erreiche 1 INT ohne Tap-Credits.',stars:2},
{id:'no-items',name:'Bare Metal',description:'Erreiche 1 INT ohne ausgerüstete Itemeffekte.',stars:2},
{id:'five-hardware',name:'Compact Stack',description:'Erreiche 1 INT nur mit den ersten fünf Hardwareklassen.',stars:3},
{id:'data-crunch',name:'Data Drought',description:'Erreiche 1 INT mit nur 10 % Datenproduktion.',stars:3},
{id:'inflation',name:'Brutal Inflation',description:'Erreiche 1 INT bei 100× Hardwarepreisen.',stars:5}];
export const challengeClaimable=(s:GameState,c:Challenge)=>c.check(s)&&!s.retention.claimedChallenges.includes(c.id);
export function claimChallenge(s:GameState,id:string){const c=challenges.find(x=>x.id===id);if(!c||!challengeClaimable(s,c))return s;return{...s,retention:{...s.retention,challengeStars:s.retention.challengeStars+c.stars,claimedChallenges:[...s.retention.claimedChallenges,id]}};}
const resetRun=(s:GameState)=>{const b=newGame(s.savedAt);return{...s,credits:0,data:0,researchPoints:0,hardware:1,hardwareCounts:b.hardwareCounts,classUpgrades:[],discovered:['calculator'] as HardwareId[],level:0,qualityLevel:0,efficiencyLevel:0,training:0,activeTraining:null,completedResearch:[],researchLevels:b.researchLevels,researchLabs:[null,null,null,null] as GameState['researchLabs'],researchQueue:[],experiments:{...s.experiments,active:null,queue:[]},runCreditsEarned:0,runMilestoneClasses:[],exactEconomy:{...s.exactEconomy,credits:{m:0,e:0},data:{m:0,e:0},runCreditsEarned:{m:0,e:0}}};};
export function startRunChallenge(s:GameState,id:string){if(s.retention.activeRun||!runChallenges.some(c=>c.id===id))return s;const reset=resetRun(s);return{...reset,retention:{...reset.retention,activeRun:{id,startedAt:s.savedAt}}};}
export const runChallengeReady=(s:GameState)=>!!s.retention.activeRun&&newINT(s)>=1;
export function completeRunChallenge(s:GameState){const active=s.retention.activeRun,c=active&&runChallenges.find(x=>x.id===active.id);if(!active||!c||!runChallengeReady(s))return s;const seconds=Math.max(0,(s.savedAt-active.startedAt)/1000),count=(s.retention.runCompletions[c.id]??0)+1,best=Math.min(s.retention.runBestSeconds[c.id]??Infinity,seconds),reset=resetRun(s);return{...reset,retention:{...reset.retention,activeRun:null,challengeStars:reset.retention.challengeStars+c.stars,runCompletions:{...reset.retention.runCompletions,[c.id]:count},runBestSeconds:{...reset.retention.runBestSeconds,[c.id]:best}}};}
export function abortRunChallenge(s:GameState){if(!s.retention.activeRun)return s;const reset=resetRun(s);return{...reset,retention:{...reset.retention,activeRun:null}};}
export const totalMastery=(s:GameState)=>hardwareIds.reduce((n,id)=>n+hardwareMasteryLevel(s,id),0);
export const collectionSummary=(s:GameState)=>({hardware:s.lifetime.hardwareClasses.length,hardwareTotal:hardwareIds.length,components:Object.values(s.componentInventory).filter(v=>v>0).length,componentsTotal:Object.keys(s.componentInventory).length,itemTypes:s.lifetime.itemTypes.length,itemTypesTotal:9,artifacts:s.profile.artifacts.length,seasons:s.profile.completedSeasons.length});
export const prestigeGate=(s:GameState,depth:number)=>depth<=4?null:depth===5?{ok:s.achievementPoints>=100,label:'100 Achievement Points'}:depth===6?{ok:totalMastery(s)>=10,label:'10 Hardware Mastery'}:depth===7?{ok:s.retention.challengeStars>=10,label:'10 Challenge Stars'}:{ok:s.achievementPoints>=500&&totalMastery(s)>=50&&s.retention.challengeStars>=25,label:'500 AP · 50 Mastery · 25 Stars'};
export const masteryName=(id:HardwareId)=>id;
