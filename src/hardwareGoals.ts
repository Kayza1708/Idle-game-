import {BALANCE,hardwareIds,hardwarePurchasePreview,scientificAffordability,exactEconomyValue,creditRateScientific,type GameState,type HardwareId} from './economy';
/** Pure savings quotes: purchase transaction and goal share the same SCI cost. */
export function hardwareSavingsQuote(s:GameState,id:HardwareId,amount=1){
 const purchase=hardwarePurchasePreview(s,id,amount);
 if(!purchase.resources.valid)return purchase;
 return{...purchase,resources:scientificAffordability(exactEconomyValue(s,'credits'),purchase.cost,creditRateScientific(s.hardware,s.level,s,s.savedAt))};
}
export function hardwareSavingsGoals(s:GameState){
 const nextId=hardwareIds.find(id=>s.hardwareCounts[id]===0);
 const owned=[...hardwareIds].reverse().find(id=>s.hardwareCounts[id]>0&&BALANCE.hardware[id].milestones.some(m=>m.threshold>s.hardwareCounts[id]));
 const milestone=owned?BALANCE.hardware[owned].milestones.find(m=>m.threshold>s.hardwareCounts[owned])!:null;
 return{next:nextId?hardwareSavingsQuote(s,nextId):null,milestone:owned&&milestone?{...hardwareSavingsQuote(s,owned,milestone.threshold-s.hardwareCounts[owned]),milestone}:null};
}
