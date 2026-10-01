import { BALANCE, newGame, BreakthroughId, canPrestige, GameState, newINT, prestigeClaim, PrestigeUpgradeId, prestigeUpgradeCost, upgradeLevel, exactEconomyValue, hasNode, MAX_ECONOMY_VALUE } from './economy';
import {ScientificNumber} from './scientificNumber';
import { addEvent, recordPrestige } from './telemetry';
import {prestigeGate} from './retention';

export const prestigeUpgrades=BALANCE.prestigeUpgrades;
export type PrestigeJobPreview={kind:'training'|'research'|'analysis'|'crafting';name:string;status:'continues'|'cancelled';remainingSeconds:number;lostData:number};
export type PrestigePreview={claimableINT:number;totalINTAfter:number;availableINTAfter:number;creditBonusBefore:number;creditBonusAfter:number;eligibleRevenueToNextINT:number;reset:Record<string,number>;kept:Record<string,number>;jobs:PrestigeJobPreview[];firstEquipmentSlot:boolean};
const prestigeReset=(s:GameState,gain:number)=>{
 const base=newGame(s.savedAt),gainExact=ScientificNumber.from(gain),total=exactEconomyValue(s,'totalINTEarned').add(gainExact),unspent=exactEconomyValue(s,'unspentINT').add(gainExact),claimed=exactEconomyValue(s,'prestigeEntitlementClaimed').add(gainExact);
 return {...s,credits:0,data:0,hardware:1,hardwareCounts:base.hardwareCounts,classUpgrades:[],runMilestoneClasses:[],level:0,qualityLevel:0,efficiencyLevel:0,training:0,activeTraining:null,trainingQueue:[],runRecyclingRewards:[],researchQueue:s.researchQueue,researchLabs:s.researchLabs.map(lab=>lab?{...lab}:null),experiments:{...s.experiments,active:null,queue:[]},completedResearch:[...s.completedResearch],researchLevels:{...s.researchLevels},feedback:base.feedback,runCreditsEarned:0,lifetime:{...s.lifetime,prestiges:s.lifetime.prestiges+1,intEarned:s.lifetime.intEarned+gain},totalINTEarned:total.toNumber(MAX_ECONOMY_VALUE),unspentINT:unspent.toNumber(MAX_ECONOMY_VALUE),prestigeEntitlementClaimed:claimed.toNumber(MAX_ECONOMY_VALUE),exactEconomy:{...s.exactEconomy,credits:{m:0,e:0},data:{m:0,e:0},runCreditsEarned:{m:0,e:0},totalINTEarned:total.toJSON(),unspentINT:unspent.toJSON(),prestigeEntitlementClaimed:claimed.toJSON()},prestigeCount:s.prestigeCount+1,onboarding:{...s.onboarding,completed:[...new Set([...s.onboarding.completed,'first-prestige'])]}};
};
export function prestigePreview(s:GameState):PrestigePreview{
 const gain=newINT(s),after=prestigeReset(s,gain),remaining=(endsAt?:number)=>Math.max(0,((endsAt??s.savedAt)-s.savedAt)/1000),jobs:PrestigeJobPreview[]=[];
 for(const job of s.trainingQueue)jobs.push({kind:'training',name:`${job.track} Lv.${job.targetLevel}`,status:'cancelled',remainingSeconds:0,lostData:0});
 if(s.activeTraining)jobs.push({kind:'training',name:s.activeTraining.track,status:'cancelled',remainingSeconds:Math.max(0,s.activeTraining.workRequired-s.training),lostData:s.activeTraining.dataCost??0});
 for(const lab of s.researchLabs)if(lab)jobs.push({kind:'research',name:lab.id,status:'continues',remainingSeconds:remaining(lab.endsAt),lostData:0});
 for(const id of s.researchQueue)jobs.push({kind:'research',name:id,status:'continues',remainingSeconds:0,lostData:0});
 if(s.experiments.active)jobs.push({kind:'analysis',name:`${s.experiments.active.type}:${s.experiments.active.length}`,status:'cancelled',remainingSeconds:remaining(s.experiments.active.endsAt),lostData:s.experiments.active.dataCost??0});
 for(const id of s.experiments.queue)jobs.push({kind:'analysis',name:`${id}:queued`,status:'cancelled',remainingSeconds:0,lostData:0});
 if(s.crafting.active)jobs.push({kind:'crafting',name:s.crafting.active.recipeId,status:'continues',remainingSeconds:remaining(s.crafting.active.endsAt??undefined),lostData:0});
 for(const job of s.crafting.queue)jobs.push({kind:'crafting',name:job.recipeId,status:'continues',remainingSeconds:0,lostData:0});
 return{claimableINT:gain,totalINTAfter:after.totalINTEarned,availableINTAfter:after.unspentINT,creditBonusBefore:1+BALANCE.intCreditPerPoint*s.totalINTEarned,creditBonusAfter:1+BALANCE.intCreditPerPoint*after.totalINTEarned,eligibleRevenueToNextINT:Math.max(0,BALANCE.prestigeThreshold*(10**(((prestigeClaim(s)+1)/BALANCE.prestigeScale)**(1/BALANCE.prestigePower))-1)-s.lifetimeEligibleCredits),reset:{credits:s.credits,data:s.data,hardware:s.hardware,qualityLevel:s.qualityLevel,efficiencyLevel:s.efficiencyLevel,trainingProgress:s.training},kept:{components:s.components,modules:Object.values(s.modules).reduce((n,v)=>n+v,0),items:s.inventory.length,blueprintUnlocked:s.impulseRelayBlueprint?1:0,blueprintFragments:s.blueprintFragments,equipmentSlots:Math.max(s.purchasedEquipmentSlots,s.prestigeCount>0?1:0),equippedItems:Object.values(s.equipped).filter(Boolean).length,gems:s.gems,achievements:s.achievementPoints,questClaims:s.missions.daily.tasks.filter(task=>task.claimed).length+s.missions.weekly.tasks.filter(task=>task.claimed).length+s.missions.monthly.tasks.filter(task=>task.claimed).length,seasonClaims:s.season.claimed.length,craftingJobs:(s.crafting.active?1:0)+s.crafting.queue.length},jobs,firstEquipmentSlot:s.prestigeCount===0};
}
export function buyNode(s:GameState,id:PrestigeUpgradeId,_legacyTier?:number){
 const level=upgradeLevel(s,id),definition=BALANCE.prestigeUpgrades[id],cost=prestigeUpgradeCost(id,level);
 const gate=prestigeGate(s,definition.depth);
 if(level||('requiresPrestige' in definition&&definition.requiresPrestige&&s.prestigeCount<1)||s.unspentINT<cost||(gate&&!gate.ok)||!definition.requires.every(required=>upgradeLevel(s,required as PrestigeUpgradeId)>=1))return s;
 const unspent=exactEconomyValue(s,'unspentINT').subtract(ScientificNumber.from(cost)),spent=exactEconomyValue(s,'spentINT').add(ScientificNumber.from(cost));
 return addEvent({...s,unspentINT:Math.round(unspent.toNumber(MAX_ECONOMY_VALUE)),spentINT:Math.round(spent.toNumber(MAX_ECONOMY_VALUE)),exactEconomy:{...s.exactEconomy,unspentINT:unspent.toJSON(),spentINT:spent.toJSON()},nodes:[...s.nodes,id]},'prestige-node-buy',s.savedAt,{id,cost,branch:definition.branch,depth:definition.depth,effect:definition.effect});
}
export function prestige(s:GameState){
 if(!canPrestige(s))return s;
 const gain=newINT(s),reset=prestigeReset(s,gain);
 return recordPrestige(s,reset,gain);
}
export function buyBreakthrough(s:GameState,id:BreakthroughId){const cost=BALANCE.breakthroughs[id][0];return s.breakthroughs.includes(id)||s.researchFragments<cost?s:addEvent({...s,researchFragments:s.researchFragments-cost,breakthroughs:[...s.breakthroughs,id]},'breakthrough',s.savedAt,{id,cost});}
