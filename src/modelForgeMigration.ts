import {BALANCE} from './economy';
/** One-way v55→56 migration. Existing paid jobs and rare possessions are not repriced.
 * Missing/malformed current fields stay missing/malformed for the validator. */
export function migrateModelForge(value:any):any{
 if(!value||typeof value!=='object')return value;
 const migrateItem=(item:any)=>{if(!item||!Number.isSafeInteger(item.level)||item.level<0)return item;const level=Math.min(BALANCE.itemLevelMax,item.level+1),factor=(1+BALANCE.legacyItemLevelEffectPerStep*item.level)/(1+BALANCE.itemLevelEffectPerStep*(level-1));return{...item,level,...(factor>1?{legacyLevelFactor:factor}:{})}};
 const levelById=new Map((value.inventory??[]).map((item:any)=>[item.id,migrateItem(item).level]));
 const markJob=(job:any)=>job?{...job,...(job.kind==='item'?{legacyTimed:true}:{})}:job;
 const next={...value};
 if(Array.isArray(value.inventory))next.inventory=value.inventory.map(migrateItem);
 if(value.pinnedGoal?.kind==='item-upgrade'&&(value.pinnedGoal.target===undefined||Number.isSafeInteger(value.pinnedGoal.target)&&value.pinnedGoal.target>0))next.pinnedGoal={...value.pinnedGoal,target:Math.min(BALANCE.itemLevelMax,(levelById.get(value.pinnedGoal.id) as number??1)+1)};
 if(value.activeTraining)next.activeTraining={...value.activeTraining,paymentResource:value.activeTraining.paymentResource??'data'};
 if(value.crafting)next.crafting={...value.crafting,active:markJob(value.crafting.active),queue:Array.isArray(value.crafting.queue)?value.crafting.queue.map(markJob):value.crafting.queue};
 if(Array.isArray(value.foundries))next.foundries=value.foundries.map((foundry:any)=>({...foundry,active:foundry.active?{...foundry.active,before:{...foundry.active.before,level:levelById.get(foundry.active.itemId)??foundry.active.before.level+1}}:foundry.active}));
 if(value.challengeSession)next.challengeSession={...value.challengeSession,main:migrateModelForge(value.challengeSession.main)};
 if(value.retention?.activeRun?.loadout)next.retention={...value.retention,activeRun:{...value.retention.activeRun,loadout:value.retention.activeRun.loadout.map(migrateItem)}};
 return next;
}
