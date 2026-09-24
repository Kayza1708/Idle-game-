import { BALANCE, newGame, BreakthroughId, canPrestige, GameState, newINT, PrestigeUpgradeId, prestigeUpgradeCost, upgradeLevel } from './economy';

export const prestigeUpgrades=BALANCE.prestigeUpgrades;
export function buyNode(s:GameState,id:PrestigeUpgradeId,_legacyTier?:number){
 const level=upgradeLevel(s,id),definition=BALANCE.prestigeUpgrades[id],cost=prestigeUpgradeCost(id,level);
 if(level>=definition.maxLevel||s.unspentINT<cost||(definition.requires&&upgradeLevel(s,definition.requires)<1))return s;
 return {...s,unspentINT:s.unspentINT-cost,spentINT:s.spentINT+cost,nodes:[...s.nodes.filter(x=>!x.startsWith(`${id}:`)),`${id}:${level+1}`]};
}
export function prestige(s:GameState){
 if(!canPrestige(s))return s;
 const gain=newINT(s),calculators=1+upgradeLevel(s,'coldStart'),startData=25*upgradeLevel(s,'researchGate');
 return {...s,credits:0,data:startData,hardware:calculators,hardwareCounts:{...newGame(s.savedAt).hardwareCounts,calculator:calculators},classUpgrades:[],level:0,qualityLevel:0,efficiencyLevel:0,training:0,activeTraining:null,runCreditsEarned:0,totalINTEarned:s.totalINTEarned+gain,unspentINT:s.unspentINT+gain,prestigeEntitlementClaimed:s.prestigeEntitlementClaimed+gain,prestigeCount:s.prestigeCount+1,onboarding:{...s.onboarding,completed:[...new Set([...s.onboarding.completed,'first-prestige'])]}};
}
export function buyBreakthrough(s:GameState,id:BreakthroughId){const cost=BALANCE.breakthroughs[id][0];return s.breakthroughs.includes(id)||s.researchFragments<cost?s:{...s,researchFragments:s.researchFragments-cost,breakthroughs:[...s.breakthroughs,id]};}
