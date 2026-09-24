import { BALANCE, newGame, BreakthroughId, canPrestige, GameState, newINT, PrestigeUpgradeId, prestigeUpgradeCost, upgradeLevel } from './economy';
import { addEvent, recordPrestige } from './telemetry';

export const prestigeUpgrades=BALANCE.prestigeUpgrades;
export function buyNode(s:GameState,id:PrestigeUpgradeId,_legacyTier?:number){
 const level=upgradeLevel(s,id),definition=BALANCE.prestigeUpgrades[id],cost=prestigeUpgradeCost(id,level);
 if(level||s.unspentINT<cost||!definition.requires.every(required=>upgradeLevel(s,required as PrestigeUpgradeId)>=1))return s;
 return {...s,unspentINT:s.unspentINT-cost,spentINT:s.spentINT+cost,nodes:[...s.nodes,id]};
}
export function prestige(s:GameState){
 if(!canPrestige(s))return s;
 const gain=newINT(s),base=newGame(s.savedAt);
 const reset={...s,credits:0,data:0,hardware:1,hardwareCounts:base.hardwareCounts,classUpgrades:[],runMilestoneClasses:[],level:0,qualityLevel:0,efficiencyLevel:0,training:0,activeTraining:null,runRecyclingRewards:[],researchQueue:null,feedback:base.feedback,runCreditsEarned:0,lifetime:{...s.lifetime,prestiges:s.lifetime.prestiges+1,intEarned:s.lifetime.intEarned+gain},totalINTEarned:s.totalINTEarned+gain,unspentINT:s.unspentINT+gain,prestigeEntitlementClaimed:s.prestigeEntitlementClaimed+gain,prestigeCount:s.prestigeCount+1,onboarding:{...s.onboarding,completed:[...new Set([...s.onboarding.completed,'first-prestige'])]}};
 return recordPrestige(s,reset,gain);
}
export function buyBreakthrough(s:GameState,id:BreakthroughId){const cost=BALANCE.breakthroughs[id][0];return s.breakthroughs.includes(id)||s.researchFragments<cost?s:addEvent({...s,researchFragments:s.researchFragments-cost,breakthroughs:[...s.breakthroughs,id]},'breakthrough',s.savedAt,{id,cost});}
