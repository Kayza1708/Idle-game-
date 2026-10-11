import {ScientificNumber} from './scientificNumber';
import {itemTypes,type GameState} from './economy';
/** Only historical evidence supplies slot ownership. Validation still rejects
 * unknown/missing instances, incompatible slots, duplicates and malformed fields. */
export function migrateTechnicalSave(old:GameState):GameState{
 if(!old||typeof old!=='object')return old;
 const nodes=Array.isArray(old.nodes)?old.nodes:[],inventory=Array.isArray(old.inventory)?old.inventory:[];
 const compatibleIds=new Set(Object.entries(old.equipped??{}).flatMap(([slot,id])=>inventory.some(item=>item.id===id&&Object.hasOwn(itemTypes,item.type)&&itemTypes[item.type].slot===slot)?[id]:[]));
 const purchased=Number.isInteger(old.purchasedEquipmentSlots)&&old.purchasedEquipmentSlots>=0?Math.min(3,1+old.purchasedEquipmentSlots):1;
 const nodeSlots=(nodes.includes('manufacturing5')||nodes.includes('manufacturing5:1'))?3:(nodes.includes('manufacturing1')||nodes.includes('manufacturing1:1'))?2:1;
 const slots=old.prestigeCount>=1?Math.min(3,Math.max(purchased,nodeSlots,compatibleIds.size)):0;
 return {...old,exactAxioms:old.exactAxioms??{available:ScientificNumber.from(old.availableAxioms??old.axioms??0).toJSON(),total:ScientificNumber.from(old.totalAxiomsEarned??old.axioms??0).toJSON()},unlockedEquipmentSlots:old.unlockedEquipmentSlots??slots,archivePassiveFindCount:old.archivePassiveFindCount??0,
  ...(old.challengeSession?{challengeSession:{...old.challengeSession,main:migrateTechnicalSave(old.challengeSession.main)}}:{})};
}
