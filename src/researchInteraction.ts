import {researchQuote,researchQueuePreview,queueResearchProject,startResearchProject,type GameState,type ResearchId} from './economy';
/** One manual action: start in a free lab, otherwise queue without reserving Data. */
export function researchActionQuote(s:GameState,id:ResearchId){
 const q=researchQuote(s,id);
 if(!q)return {allowed:false,mode:'start' as const,reason:'unknown'};
 if(s.researchQueue.includes(id))return {allowed:false,mode:'queue' as const,reason:'queued'};
 if(q.reason==='lab'){const queued=researchQueuePreview(s,id);return {allowed:queued.allowed,mode:'queue' as const,reason:queued.reason};}
 return {allowed:q.allowed,mode:'start' as const,reason:q.reason};
}
export function requestResearchProject(s:GameState,id:ResearchId){const q=researchActionQuote(s,id);return !q.allowed?s:q.mode==='queue'?queueResearchProject(s,id):startResearchProject(s,id);}
