import {type GameState} from './economy';
export type QueueKind='training'|'research';
export type QueueCommand={kind:QueueKind;signature:string;index:number;action:'remove'|'earlier'|'later'};
export function queueSignature(s:GameState,kind:QueueKind){return kind==='training'?s.trainingQueue.map(j=>j.track+':'+j.targetLevel).join('|'):s.researchQueue.join('|');}
/** Unpaid plans only. A stale closure cannot remove the next job after a start.
 * Same-track target dependencies may not be inverted by reordering. */
export function changeQueuedPlan(s:GameState,ticket:QueueCommand):GameState{
 if(!ticket||!['training','research'].includes(ticket.kind)||!['remove','earlier','later'].includes(ticket.action)||queueSignature(s,ticket.kind)!==ticket.signature||!Number.isSafeInteger(ticket.index))return s;
 const list=ticket.kind==='training'?s.trainingQueue:s.researchQueue,index=ticket.index;if(index<0||index>=list.length)return s;
 if(ticket.action==='remove'){
  if(ticket.kind==='research')return{...s,researchQueue:s.researchQueue.filter((_,i)=>i!==index)};
  const track=s.trainingQueue[index].track;return{...s,trainingQueue:s.trainingQueue.filter((j,i)=>i<index||j.track!==track)};
 }
 const target=index+(ticket.action==='earlier'?-1:1);if(target<0||target>=list.length)return s;
 if(ticket.kind==='training'){
  if(s.trainingQueue[index].track===s.trainingQueue[target].track)return s;
  const queue=[...s.trainingQueue];[queue[index],queue[target]]=[queue[target],queue[index]];return{...s,trainingQueue:queue};
 }
 const queue=[...s.researchQueue];[queue[index],queue[target]]=[queue[target],queue[index]];return{...s,researchQueue:queue};
}
