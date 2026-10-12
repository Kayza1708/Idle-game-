import {plannedResearchStart} from './deviceEffects';
import {BALANCE,researchQueueUnlocked,researchRepeatUnlocked,hasNode,isRepeatableResearch,researchLevel,researchQuote,researchModifiers,researchLabCount,startResearchProject,exactEconomyValue,type GameState,type ResearchTarget,type ResearchDirector,type RepeatableResearchId} from './economy';
import {ScientificNumber} from './scientificNumber';
const validTarget=(entry:ResearchTarget)=>!!entry&&!!researchQuoteCatalog(entry.id)&&Number.isSafeInteger(entry.targetLevel)&&entry.targetLevel>0&&(isRepeatableResearch(entry.id)||entry.targetLevel===1);
const researchQuoteCatalog=(id:string)=>Object.hasOwn(BALANCE.repeatableResearch,id)||Object.hasOwn(BALANCE.researchProjects,id);
export function configureResearchRepeat(s:GameState,id:RepeatableResearchId|null,targetLevel:number,enabled:boolean){if((id!==null&&!isRepeatableResearch(id))||!Number.isSafeInteger(targetLevel)||targetLevel<1||typeof enabled!=='boolean')return s;return{...s,researchRepeat:{id,targetLevel,enabled:enabled&&id!==null&&researchRepeatUnlocked(s)}};}
export function configureResearchDirector(s:GameState,patch:Partial<Pick<ResearchDirector,'enabled'|'entries'|'reservePercent'|'budget'|'mode'>>){
 const config={...s.researchDirector,...patch};
 if(typeof config.enabled!=='boolean'||!Array.isArray(config.entries)||config.entries.length>6||!config.entries.every(validTarget)||new Set(config.entries.map(e=>e.id)).size!==config.entries.length||![0,.25,.5,.75].includes(config.reservePercent)||!['strict','affordable'].includes(config.mode)||config.budget!==null&&!ScientificNumber.isValidJSON(config.budget))return s;
 return{...s,researchDirector:{...config,entries:config.entries.map(e=>({...e})),budget:config.budget?{...config.budget}:null}};
}
/** Selection is pure and uses precisely the quote used by the paid domain start. */
export function researchDirectorQuote(s:GameState){
 const d=s.researchDirector,spent=ScientificNumber.fromJSON(d.spent),budget=d.budget?ScientificNumber.fromJSON(d.budget):null,remaining=budget?.subtract(spent)??null;
 const entries=d.entries.map(entry=>{const quote=researchQuote(s,entry.id)!,reached=researchLevel(s,entry.id)>=entry.targetLevel,reserve=exactEconomyValue(s,'data').multiplyNumber(d.reservePercent),reason=reached?'target':quote.reason??(!remaining?'budget-unset':quote.cost.compare(remaining)>0?'budget':quote.cost.compare(exactEconomyValue(s,'data').subtract(reserve))>0?'reserve':null);return{...entry,quote,reached,reserve,reason};});
 const usable=entries.filter(e=>!e.reached&&e.reason!=='running'&&e.reason!=='completed'),candidate=d.mode==='affordable'?usable.find(e=>!e.reason):usable[0],reason=!d.enabled?'disabled':!researchModifiers(s).director?'unlock':!budget?'budget-unset':candidate?.reason??(candidate?null:usable.length?(usable[0].reason??'target'):entries.some(e=>!e.reached&&e.reason==='running')?'running':'target');
 return{enabled:d.enabled,unlocked:researchModifiers(s).director,budget,spent,remaining,entries,candidate:reason===null?candidate??null:null,reason};
}
export function researchRepeatQuote(s:GameState){const r=s.researchRepeat,q=r.id?researchQuote(s,r.id):null,reason=!r.enabled?'disabled':!researchRepeatUnlocked(s)?'unlock':!r.id?'project':researchLevel(s,r.id)>=r.targetLevel?'target':q?.reason??null;return{...r,quote:q,reason};}
/** Completed once-only jobs leave the queue. Invalid entries are skipped; the first valid unaffordable job blocks. */
export function researchQueueStatus(s:GameState){
 if(!researchQueueUnlocked(s))return{candidate:null,reason:'unlock'};
 let skippedReason:string|null=null;
 for(const id of s.researchQueue){const q=researchQuote(s,id);if(!q||q.done||q.reason==='area'||q.reason==='requirement'||q.reason==='running'){skippedReason??=q?.reason??'unknown';continue;}return{candidate:q.allowed?id:null,reason:q.reason,quote:q};}
 return{candidate:null,reason:skippedReason??'empty'};
}
export function startManualResearchQueue(state:GameState){let next=state;if(!researchQueueUnlocked(next))return next;
 const cleaned=next.researchQueue.filter(id=>!researchQuote(next,id)?.done);if(cleaned.length!==next.researchQueue.length)next={...next,researchQueue:cleaned};
 for(let i=0;i<researchLabCount(next);i++){const status=researchQueueStatus(next);if(!status.candidate)break;const started=plannedResearchStart(next,startResearchProject(next,status.candidate));if(started===next)break;next={...started,researchQueue:next.researchQueue.filter(id=>id!==status.candidate)};}return next;
}
/** Shared online/offline scheduler; no upfront cost and every laboratory sees the preceding debit. */
export function runResearchAutomation(state:GameState){let next=startManualResearchQueue(state);if(researchQueueStatus(next).reason==='data')return next;
 const free=next.researchLabs.filter((lab,i)=>i<researchLabCount(next)&&!lab).length;
 for(let i=0;i<free;i++){
  const director=researchDirectorQuote(next);if(director.candidate){const before=next,started=plannedResearchStart(next,startResearchProject(next,director.candidate.id));if(started===before)break;next={...started,researchDirector:{...started.researchDirector,spent:ScientificNumber.fromJSON(started.researchDirector.spent).add(director.candidate.quote.cost).toJSON()}};continue;}
  // An enabled, effective director owns the automatic decision even when blocked.
  if(next.researchDirector.enabled&&researchModifiers(next).director)break;
  const repeat=researchRepeatQuote(next);if(repeat.reason||!repeat.id)break;const started=plannedResearchStart(next,startResearchProject(next,repeat.id));if(started===next)break;next=started;
 }
 return next;
}
