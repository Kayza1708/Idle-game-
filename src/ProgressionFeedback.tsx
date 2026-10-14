import {ActivityArt,ItemArt,ResourceArt} from './GameArt';
import type {CompletionNotice} from './progressionMotionPlan';
/** Non-blocking, screen-independent completion feedback; announcements remain with motion off. */
export function ProgressionFeedback({notices}:{notices:CompletionNotice[]}){
 if(!notices.length)return null;
 return <aside className="progression-feedback" role="status" aria-live="polite" aria-atomic="true">{notices.map(notice=><div key={notice.kind} data-completion={notice.kind}>{notice.item?<ItemArt type={notice.item}/>:notice.kind==='research'?<ResourceArt id="research"/>:<ActivityArt id="workbench"/>}<b>{notice.title}</b>{notice.count>1&&<strong>×{notice.count}</strong>}</div>)}</aside>;
}
