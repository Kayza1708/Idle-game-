import type {GameState} from './economy';
import {MetaArt} from './GameArt';
import {nextGoal} from './nextGoal';
type Action=(name:string,...args:any[])=>void;
export function NextGoalCard({s,act}:{s:GameState;act:Action}){const goal=nextGoal(s),de=s.settings.language==='de';return <section id="next-goal-card" className="card next-goal-card"><MetaArt id="profile"/><div><small>{de?'NÄCHSTES ZIEL':'NEXT GOAL'}</small><b>{goal.title}</b><span>{goal.progress}</span><small>{goal.benefit}</small></div>{goal.kind!=='complete'&&<button onClick={()=>act('view-goal',goal.tab,goal.subtab,goal.targetId)}>{de?'Ansehen':'View'}</button>}</section>}
