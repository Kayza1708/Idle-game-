import {researchQueueCapacity,researchPreview,isRepeatableResearch,type GameState,type ResearchId} from './economy';
import {projectText,researchText} from './gameplayI18n';
export function ResearchQueue({s,act}:{s:GameState;act:(name:string,...args:any[])=>void}){
 if(!s.researchQueue.length)return null;
 const de=s.settings.language==='de',name=(id:ResearchId)=>(isRepeatableResearch(id)?researchText(id,s.settings.language):projectText(id,s.settings.language)).name;
 return <section className="research-queue-inline" aria-label={de?'Warteschlange':'Research queue'}><header><b>{de?'Als Nächstes':'Up next'}</b><small>{s.researchQueue.length}/{researchQueueCapacity(s)}</small></header><ol>{s.researchQueue.map((id,index)=><li key={id}><span className="queue-position">{index+1}</span><span><b>{name(id)}</b><small>Lv {researchPreview(s,id)?.level}</small></span><button aria-label={`${de?'Entfernen':'Remove'} ${name(id)}`} onClick={()=>act('research-queue-remove',id)}>×</button></li>)}</ol></section>;
}
