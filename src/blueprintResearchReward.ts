import {BALANCE,type GameState} from './economy';
import {ScientificNumber} from './scientificNumber';
import {addEvent} from './telemetry';
/** A completed paid project earns a permanent receipt; inventory capacity can delay booking. */
export function blueprintResearchRewardQuote(s:GameState){
 const amount=BALANCE.firstBlueprintResearchFragments,main=!s.retention.activeRun&&!s.challengeSession;
 const capacity=Number.isSafeInteger(s.blueprintFragments)&&s.blueprintFragments>=0&&Number.isSafeInteger(s.blueprintFragments+amount);
 return{amount,status:s.blueprintResearchReward,main,capacity,pending:s.blueprintResearchReward==='pending',canReceive:main&&s.blueprintResearchReward==='pending'&&capacity};
}
export function settleBlueprintResearchReward(s:GameState){
 const q=blueprintResearchRewardQuote(s);if(!q.canReceive)return s;
 return addEvent({...s,blueprintResearchReward:'consumed',blueprintFragments:s.blueprintFragments+q.amount},'blueprint-research-reward',s.savedAt,{source:'first-paid-blueprints-research',id:'blueprints',amount:q.amount,oncePerAccount:true},true);
}
export function earnBlueprintResearchReward(s:GameState,lab:NonNullable<GameState['researchLabs'][number]>){
 const paid=lab.dataCostExact?ScientificNumber.fromJSON(lab.dataCostExact):ScientificNumber.from(lab.dataCost??0);
 if(lab.id!=='blueprints'||!s.completedResearch.includes('blueprints')||lab.endsAt>s.savedAt+.1||paid.isZero()||s.blueprintResearchReward!=='unearned'||s.retention.activeRun||s.challengeSession)return s;
 return settleBlueprintResearchReward({...s,blueprintResearchReward:'pending'});
}
/** v48 and older have no grant receipt. Completed historical projects get no retroactive payout. */
export function migrateBlueprintResearchReward(value:any):any{
 if(!value||typeof value!=='object')return value;
 return{...value,blueprintResearchReward:Array.isArray(value.completedResearch)&&value.completedResearch.includes('blueprints')?'consumed':'unearned',...(value.challengeSession?{challengeSession:{...value.challengeSession,main:migrateBlueprintResearchReward(value.challengeSession.main)}}:{})};
}
