import { BALANCE, newGame, BreakthroughId, canPrestige, GameState, newINT, PrestigeUpgradeId, prestigeUpgradeCost, upgradeLevel, exactEconomyValue, hasNode, MAX_ECONOMY_VALUE } from './economy';
import {ScientificNumber} from './scientificNumber';
import { addEvent, recordPrestige } from './telemetry';

export const prestigeUpgrades=BALANCE.prestigeUpgrades;
export function buyNode(s:GameState,id:PrestigeUpgradeId,_legacyTier?:number){
 const level=upgradeLevel(s,id),definition=BALANCE.prestigeUpgrades[id],cost=prestigeUpgradeCost(id,level);
 if(level||s.unspentINT<cost||!definition.requires.every(required=>upgradeLevel(s,required as PrestigeUpgradeId)>=1))return s;
 const unspent=exactEconomyValue(s,'unspentINT').subtract(ScientificNumber.from(cost)),spent=exactEconomyValue(s,'spentINT').add(ScientificNumber.from(cost));
 return addEvent({...s,unspentINT:unspent.toNumber(MAX_ECONOMY_VALUE),spentINT:spent.toNumber(MAX_ECONOMY_VALUE),exactEconomy:{...s.exactEconomy,unspentINT:unspent.toJSON(),spentINT:spent.toJSON()},nodes:[...s.nodes,id]},'prestige-node-buy',s.savedAt,{id,cost,branch:definition.branch,depth:definition.depth,effect:definition.effect});
}
export function prestige(s:GameState){
 if(!canPrestige(s))return s;
 const gain=newINT(s),base=newGame(s.savedAt);
 const gainExact=ScientificNumber.from(gain),total=exactEconomyValue(s,'totalINTEarned').add(gainExact),unspent=exactEconomyValue(s,'unspentINT').add(gainExact),claimed=exactEconomyValue(s,'prestigeEntitlementClaimed').add(gainExact);
 const reset={...s,credits:0,data:0,hardware:1,hardwareCounts:base.hardwareCounts,classUpgrades:[],runMilestoneClasses:[],level:0,qualityLevel:0,efficiencyLevel:0,training:0,activeTraining:null,runRecyclingRewards:[],researchQueue:hasNode(s,'labs5',1)?s.researchQueue:[],researchLabs:[null,null,null,null],experiments:{...s.experiments,active:null,queue:[]},completedResearch:[],researchLevels:base.researchLevels,feedback:base.feedback,runCreditsEarned:0,lifetime:{...s.lifetime,prestiges:s.lifetime.prestiges+1,intEarned:s.lifetime.intEarned+gain},totalINTEarned:total.toNumber(MAX_ECONOMY_VALUE),unspentINT:unspent.toNumber(MAX_ECONOMY_VALUE),prestigeEntitlementClaimed:claimed.toNumber(MAX_ECONOMY_VALUE),exactEconomy:{...s.exactEconomy,credits:{m:0,e:0},data:{m:0,e:0},runCreditsEarned:{m:0,e:0},totalINTEarned:total.toJSON(),unspentINT:unspent.toJSON(),prestigeEntitlementClaimed:claimed.toJSON()},prestigeCount:s.prestigeCount+1,onboarding:{...s.onboarding,completed:[...new Set([...s.onboarding.completed,'first-prestige'])]}};
 return recordPrestige(s,reset,gain);
}
export function buyBreakthrough(s:GameState,id:BreakthroughId){const cost=BALANCE.breakthroughs[id][0];return s.breakthroughs.includes(id)||s.researchFragments<cost?s:addEvent({...s,researchFragments:s.researchFragments-cost,breakthroughs:[...s.breakthroughs,id]},'breakthrough',s.savedAt,{id,cost});}
