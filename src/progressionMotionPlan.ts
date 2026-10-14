import {equipmentSlots,isRepeatableResearch,type GameState,type ItemTypeId,type ResearchId,type ResearchProjectId} from './economy';
import {itemText,projectText,researchText} from './gameplayI18n';
export type CompletionNotice={kind:'research'|'forge'|'craft';title:string;count:number;item?:ItemTypeId};
export type MotionPlan={targets:string[];links:string[];notices:CompletionNotice[];handledItems:string[];transfer?:{id:string;slot:string}};
const eventKey=(event:GameState['telemetry']['recentEvents'][number])=>JSON.stringify([event.type,event.at,event.runId,event.jobId,event.details]);
/** Pure presentation diff: no timers, rewards, persisted flags or RNG. */
export function progressionMotionPlan(action:string,before:GameState,after:GameState):MotionPlan{
 const plan:MotionPlan={targets:[],links:[],notices:[],handledItems:[]};
 if(before===after||before.telemetry.campaignId!==after.telemetry.campaignId||before.prestigeCount!==after.prestigeCount||before.axiomResetCount!==after.axiomResetCount||before.retention.activeRun?.runId!==after.retention.activeRun?.runId||['save-import','full-reset','test-reset'].includes(action)||after.savedAt-before.savedAt>60000)return plan;
 const de=after.settings.language==='de',completed=after.lifetime.researchCompleted>before.lifetime.researchCompleted||after.lifetime.forgeUpgrades>before.lifetime.forgeUpgrades||after.lifetime.itemsCrafted>before.lifetime.itemsCrafted||Object.keys(after.modules).some(id=>after.modules[id as keyof typeof after.modules]>before.modules[id as keyof typeof before.modules]);
 const old=completed?new Set(before.telemetry.recentEvents.map(eventKey)):null;
 const fresh=old?after.telemetry.recentEvents.filter(event=>!old.has(eventKey(event))):[];
 const groups=new Map<CompletionNotice['kind'],CompletionNotice>();
 for(const event of fresh){
  if(event.type==='research-complete'&&after.lifetime.researchCompleted>before.lifetime.researchCompleted){
   const id=String(event.details.id) as ResearchId;if(!(id in after.researchLevels)&&!after.completedResearch.includes(id as ResearchProjectId))continue;
   const title=isRepeatableResearch(id)?researchText(id,after.settings.language).name:projectText(id as ResearchProjectId,after.settings.language).name;
   plan.targets.push(`#research-${id}`,id==='dataGeneration'?'#tutorial-data-generation':`#tutorial-${id}`,`[data-motion-lab="${event.details.labId}"]`);add({kind:'research',title:`${title} ✓`,count:1});
  }
  if(event.type==='forge-complete'&&after.lifetime.forgeUpgrades>before.lifetime.forgeUpgrades){const item=after.inventory.find(item=>item.id===event.details.item);if(!item)continue;plan.handledItems.push(item.id);plan.targets.push(`#item-detail-${item.id}`,`[data-foundry="${event.details.index}"]`);add({kind:'forge',item:item.type,title:`${itemText(item.type,after.settings.language)} · Forge ${item.forge??0}`,count:1});}
  if(event.type==='crafting_completed'){
   const item=after.inventory.find(item=>item.id===event.details.resultInstanceId);if(item)plan.handledItems.push(item.id);plan.targets.push(item?`#item-detail-${item.id}`:'.recipe-list');add({kind:'craft',item:item?.type,title:item?`${itemText(item.type,after.settings.language)} ✓`:(de?'Bauteil hergestellt ✓':'Module crafted ✓'),count:1});
  }
 }
 function add(notice:CompletionNotice){const current=groups.get(notice.kind);if(current){current.count+=notice.count;current.title=de?({research:'Forschung abgeschlossen',forge:'Forge abgeschlossen',craft:'Herstellung abgeschlossen'}[notice.kind]):({research:'Research completed',forge:'Forge completed',craft:'Crafting completed'}[notice.kind]);}else groups.set(notice.kind,notice);}
 plan.notices=[...groups.values()];
 for(const id of after.nodes)if(!before.nodes.includes(id)){plan.targets.push(`#prestige-node-${id}`);plan.links.push(`[data-link-to="${id}"]`,`[data-link-from="${id}"]`);}
 if(action==='equip'||action==='unequip')for(const slot of equipmentSlots)if(before.equipped[slot]!==after.equipped[slot]){plan.targets.push(`[data-motion-slot="${slot}"]`);const id=after.equipped[slot];if(id){plan.targets.push(`#item-detail-${id}`);if(action==='equip')plan.transfer={id,slot};}}
 plan.targets=[...new Set(plan.targets)];return plan;
}
