import { BALANCE, newGame, initializeRun,runStartContract,automaticRestartAvailable, BreakthroughId, canPrestige, GameState, newINT,newINTScientific, prestigeClaim, PrestigeUpgradeId, prestigeUpgradeCost,prestigeUpgradeCostScientific, upgradeLevel, exactEconomyValue, hasNode,axiomThresholdScientific, MAX_ECONOMY_VALUE,creditMultiplierFromAxioms,creditMultiplierFromINT,type AxiomUpgradeId,axiomUpgradeCost } from './economy';
import {ScientificNumber} from './scientificNumber';
import { addEvent, recordPrestige } from './telemetry';
import {prestigeGate} from './retention';

export const prestigeUpgrades=BALANCE.prestigeUpgrades;
export type PrestigeJobPreview={kind:'training'|'research'|'analysis'|'crafting';name:string;status:'continues'|'cancelled';remainingSeconds:number;lostData:number};
export type PrestigePreview={start:ReturnType<typeof runStartContract>;claimableINT:number;totalINTAfter:number;availableINTAfter:number;creditBonusBefore:number;creditBonusAfter:number;eligibleRevenueToNextINT:number;reset:Record<string,number>;kept:Record<string,number>;jobs:PrestigeJobPreview[];firstEquipmentSlot:boolean};
const prestigeReset=(s:GameState,gainExact:ScientificNumber)=>{
 const base=newGame(s.savedAt),gain=gainExact.toNumber(MAX_ECONOMY_VALUE),total=exactEconomyValue(s,'totalINTEarned').add(gainExact),cycle=exactEconomyValue(s,'cycleINTEarned').add(gainExact),unspent=exactEconomyValue(s,'unspentINT').add(gainExact),claimed=exactEconomyValue(s,'prestigeEntitlementClaimed').add(gainExact);
 return initializeRun({...s,credits:0,data:0,hardware:0,hardwareCounts:{...base.hardwareCounts},discovered:[...s.discovered],classUpgrades:[],runMilestoneClasses:[],runMilestoneEdges:[],runTrainingCompleted:0,runResearchCompleted:0,runStartedAt:s.savedAt,prestigeAgent:{...s.prestigeAgent,elapsed:0},level:0,qualityLevel:0,efficiencyLevel:0,training:0,activeTraining:null,trainingQueue:[],runRecyclingRewards:[],researchQueue:s.researchQueue,researchLabs:s.researchLabs.map(lab=>lab?{...lab}:null),experiments:{...s.experiments,active:null,queue:[]},completedResearch:[...s.completedResearch],researchLevels:{...s.researchLevels},feedback:base.feedback,runCreditsEarned:0,lifetime:{...s.lifetime,prestiges:s.lifetime.prestiges+1,intEarned:s.lifetime.intEarned+gain},totalINTEarned:total.toNumber(MAX_ECONOMY_VALUE),cycleINTEarned:cycle.toNumber(MAX_ECONOMY_VALUE),unspentINT:unspent.toNumber(MAX_ECONOMY_VALUE),prestigeEntitlementClaimed:claimed.toNumber(MAX_ECONOMY_VALUE),exactEconomy:{...s.exactEconomy,credits:{m:0,e:0},data:{m:0,e:0},runCreditsEarned:{m:0,e:0},totalINTEarned:total.toJSON(),cycleINTEarned:cycle.toJSON(),unspentINT:unspent.toJSON(),prestigeEntitlementClaimed:claimed.toJSON()},prestigeCount:s.prestigeCount+1,onboarding:{...s.onboarding,completed:[...new Set([...s.onboarding.completed,'first-prestige'])]}});
};
export function prestigePreview(s:GameState):PrestigePreview{
 const gainExact=newINTScientific(s),gain=gainExact.toNumber(MAX_ECONOMY_VALUE),after=prestigeReset(s,gainExact),remaining=(endsAt?:number)=>Math.max(0,((endsAt??s.savedAt)-s.savedAt)/1000),jobs:PrestigeJobPreview[]=[];
 for(const job of s.trainingQueue)jobs.push({kind:'training',name:`${job.track} Lv.${job.targetLevel}`,status:'cancelled',remainingSeconds:0,lostData:0});
 if(s.activeTraining)jobs.push({kind:'training',name:s.activeTraining.track,status:'cancelled',remainingSeconds:Math.max(0,s.activeTraining.workRequired-s.training),lostData:s.activeTraining.dataCost??0});
 for(const lab of s.researchLabs)if(lab)jobs.push({kind:'research',name:lab.id,status:'continues',remainingSeconds:remaining(lab.endsAt),lostData:0});
 for(const id of s.researchQueue)jobs.push({kind:'research',name:id,status:'continues',remainingSeconds:0,lostData:0});
 if(s.experiments.active)jobs.push({kind:'analysis',name:`${s.experiments.active.type}:${s.experiments.active.length}`,status:'cancelled',remainingSeconds:remaining(s.experiments.active.endsAt),lostData:s.experiments.active.dataCost??0});
 for(const id of s.experiments.queue)jobs.push({kind:'analysis',name:`${id}:queued`,status:'cancelled',remainingSeconds:0,lostData:0});
 if(s.crafting.active)jobs.push({kind:'crafting',name:s.crafting.active.recipeId,status:'continues',remainingSeconds:remaining(s.crafting.active.endsAt??undefined),lostData:0});
 for(const job of s.crafting.queue)jobs.push({kind:'crafting',name:job.recipeId,status:'continues',remainingSeconds:0,lostData:0});
 return{start:runStartContract(),claimableINT:gain,totalINTAfter:after.totalINTEarned,availableINTAfter:after.unspentINT,creditBonusBefore:creditMultiplierFromINT(s),creditBonusAfter:creditMultiplierFromINT(after),eligibleRevenueToNextINT:Math.max(0,(prestigeClaim(s)+1)**2*BALANCE.prestigeBaseRevenue-s.cycleEligibleCredits),reset:{credits:s.credits,data:s.data,hardware:s.hardware,classUpgrades:s.classUpgrades.length,qualityLevel:s.qualityLevel,efficiencyLevel:s.efficiencyLevel,trainingProgress:s.training},kept:{axiomNodes:Object.values(s.axiomUpgradeLevels).reduce((n,v)=>n+v,0),components:s.components,modules:Object.values(s.modules).reduce((n,v)=>n+v,0),items:s.inventory.length,blueprintUnlocked:s.impulseRelayBlueprint?1:0,blueprintFragments:s.blueprintFragments,equipmentSlots:Math.max(s.purchasedEquipmentSlots,s.prestigeCount>0?1:0),equippedItems:Object.values(s.equipped).filter(Boolean).length,gems:s.gems,achievements:s.achievementPoints,questClaims:s.missions.daily.tasks.filter(task=>task.claimed).length+s.missions.weekly.tasks.filter(task=>task.claimed).length+s.missions.monthly.tasks.filter(task=>task.claimed).length,seasonClaims:s.season.claimed.length,craftingJobs:(s.crafting.active?1:0)+s.crafting.queue.length},jobs,firstEquipmentSlot:s.prestigeCount===0};
}
export function buyNode(s:GameState,id:PrestigeUpgradeId,_legacyTier?:number){if(s.retention.activeRun)return s;
 const level=upgradeLevel(s,id),definition=BALANCE.prestigeUpgrades[id],cost=prestigeUpgradeCost(id,level),costExact=prestigeUpgradeCostScientific(id,level);
 const gate=prestigeGate(s,definition.depth);
 if(level||('requiresPrestige' in definition&&definition.requiresPrestige&&s.prestigeCount<1)||exactEconomyValue(s,'unspentINT').compare(costExact)<0||(gate&&!gate.ok)||!definition.requires.every(required=>upgradeLevel(s,required as PrestigeUpgradeId)>=1))return s;
 const unspent=exactEconomyValue(s,'unspentINT').subtract(costExact),spent=exactEconomyValue(s,'spentINT').add(costExact);
 return addEvent({...s,unspentINT:Math.round(unspent.toNumber(MAX_ECONOMY_VALUE)),spentINT:Math.round(spent.toNumber(MAX_ECONOMY_VALUE)),exactEconomy:{...s.exactEconomy,unspentINT:unspent.toJSON(),spentINT:spent.toJSON()},nodes:[...s.nodes,id],insightArchiveBlueprint:s.insightArchiveBlueprint||id==='researchArchive'},'prestige-node-buy',s.savedAt,{id,cost,branch:definition.branch,depth:definition.depth,effect:definition.effect});
}
export function prestige(s:GameState){if(s.retention.activeRun)return s;
 if(!canPrestige(s))return s;
 const gainExact=newINTScientific(s),gain=gainExact.toNumber(MAX_ECONOMY_VALUE),reset=prestigeReset(s,gainExact);
 return recordPrestige(s,reset,gain);
}

export const axiomReward=(s:GameState)=>{
 const cycle=exactEconomyValue(s,'cycleINTEarned');if(cycle.compare(axiomThresholdScientific())<0)return 0;
 const root=cycle.divide(axiomThresholdScientific()).sqrt().toNumber(MAX_ECONOMY_VALUE);return Math.floor(root+Math.max(1,root)*Number.EPSILON*8);
};
export type AxiomPreview=ReturnType<typeof axiomPreview>;
export function axiomPreview(s:GameState){
 const reward=axiomReward(s),base=newGame(s.savedAt),keptResearch=s.researchLabs.filter(Boolean).length,craftingJobs=(s.crafting.active?1:0)+s.crafting.queue.length;
 return{start:runStartContract(),reward,cycleINT:s.cycleINTEarned,discardedCycleINT:s.cycleINTEarned,nextThreshold:axiomThresholdScientific().multiplyNumber((reward+1)**2).toNumber(MAX_ECONOMY_VALUE),availableAfter:s.availableAxioms+reward,totalAfter:s.totalAxiomsEarned+reward,creditBonusBefore:creditMultiplierFromAxioms(s),creditBonusAfter:1+BALANCE.axiom.creditPerTotal*(s.totalAxiomsEarned+reward),intBonusBefore:creditMultiplierFromINT(s),intBonusAfter:1,reset:{credits:s.credits,data:s.data,hardware:s.hardware,classUpgrades:s.classUpgrades.length,qualityLevel:s.qualityLevel,efficiencyLevel:s.efficiencyLevel,trainingJobs:(s.activeTraining?1:0)+s.trainingQueue.length,analyses:(s.experiments.active?1:0)+s.experiments.queue.length,availableINT:s.unspentINT,spentINT:s.spentINT,nodes:s.nodes.length,runMilestones:s.runMilestoneEdges.length,runTraining:s.runTrainingCompleted,runResearch:s.runResearchCompleted,queuedResearch:s.researchQueue.length},kept:{axiomNodes:Object.values(s.axiomUpgradeLevels).reduce((n,v)=>n+v,0),components:s.components,modules:Object.values(s.modules).reduce((n,v)=>n+v,0),fragments:s.researchFragments+s.blueprintFragments,items:s.inventory.length,equipmentSlots:Math.max(s.purchasedEquipmentSlots,s.prestigeCount>0?1:0),craftingJobs,research:keptResearch,completedResearch:s.completedResearch.length,gems:s.gems,purchasedLabs:s.purchasedResearchLabs},baseHardware:0};
}
export function axiomReset(s:GameState){if(s.retention.activeRun)return s;
 const gain=axiomReward(s);if(gain<1)return s;
 const base=newGame(s.savedAt),available=s.availableAxioms+gain,total=s.totalAxiomsEarned+gain;
 return addEvent(initializeRun({...s,axioms:available,availableAxioms:available,totalAxiomsEarned:total,axiomResetCount:s.axiomResetCount+1,credits:0,data:0,hardware:0,hardwareCounts:{...base.hardwareCounts},discovered:[...s.discovered],classUpgrades:[],runMilestoneClasses:[],runMilestoneEdges:[],runTrainingCompleted:0,runResearchCompleted:0,runStartedAt:s.savedAt,prestigeAgent:{...s.prestigeAgent,elapsed:0},level:0,qualityLevel:0,efficiencyLevel:0,training:0,activeTraining:null,trainingQueue:[],runRecyclingRewards:[],experiments:{...s.experiments,active:null,queue:[]},researchQueue:[],researchLabs:s.researchLabs.map(lab=>lab?{...lab}:null),nodes:[],cycleINTEarned:0,unspentINT:0,spentINT:0,prestigeEntitlementClaimed:0,cycleEligibleCredits:0,runCreditsEarned:0,feedback:base.feedback,exactEconomy:{...s.exactEconomy,credits:{m:0,e:0},data:{m:0,e:0},runCreditsEarned:{m:0,e:0},cycleEligibleCredits:{m:0,e:0},prestigeEntitlementClaimed:{m:0,e:0},cycleINTEarned:{m:0,e:0},unspentINT:{m:0,e:0},spentINT:{m:0,e:0}}}),'axiom-reset',s.savedAt,{gain,cycleINT:s.cycleINTEarned});
}

export function buyAxiomUpgrade(s:GameState,id:AxiomUpgradeId){if(s.retention.activeRun)return s;
 const cost=axiomUpgradeCost(id),modern=id==='axiomResonance'||id==='axiomAutomation'||id==='axiomArchive',level=modern?s.axiomUpgradeLevels[id]:s.axiomUpgrades.includes(id)?1:0,max=id==='axiomResonance'?BALANCE.axiom.resonanceMax:1;
 if(level>=max||s.availableAxioms<cost)return s;
 const available=s.availableAxioms-cost,levels=modern?{...s.axiomUpgradeLevels,[id]:level+1}:s.axiomUpgradeLevels,upgrades=s.axiomUpgrades.includes(id)?s.axiomUpgrades:[...s.axiomUpgrades,id];
 return addEvent({...s,axioms:available,availableAxioms:available,axiomUpgradeLevels:levels,axiomUpgrades:upgrades},'axiom-upgrade-buy',s.savedAt,{id,cost,level:level+1},true);
}
export function prestigeAgentStatus(s:GameState){
 if((s.axiomUpgradeLevels.axiomAutomation??0)<1)return 'locked';
 if(!s.prestigeAgent.enabled)return 'disabled';
 if(!automaticRestartAvailable(s))return 'restart-unavailable';
 if(!canPrestige(s)||newINTScientific(s).compare(ScientificNumber.fromJSON(s.prestigeAgent.minimumReward))<0)return 'insufficient-int';
 if(s.savedAt-s.runStartedAt<s.prestigeAgent.minimumRunMinutes*60_000)return 'minimum-runtime';
 if((s.prestigeAgent.waitForTraining??s.prestigeAgent.waitForJobs??true)&&s.activeTraining)return 'training-active';
 if((s.prestigeAgent.waitForAnalysis??s.prestigeAgent.waitForJobs??true)&&s.experiments.active)return 'analysis-active';
 return 'ready';
}
export function runPrestigeAgent(s:GameState){
 const reason=prestigeAgentStatus(s);if(reason!=='ready')return s;
 return prestige(s);
}
export function buyBreakthrough(s:GameState,id:BreakthroughId){const cost=BALANCE.breakthroughs[id][0];return s.breakthroughs.includes(id)||s.researchFragments<cost?s:addEvent({...s,researchFragments:s.researchFragments-cost,breakthroughs:[...s.breakthroughs,id]},'breakthrough',s.savedAt,{id,cost});}
