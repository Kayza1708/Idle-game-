import {useEffect,useRef} from 'react';
import type {GameState} from './economy';
import {tutorialGuide} from './tutorialGuide';

export function TutorialFocus({state,onShow,onSkip}:{state:GameState;onShow:(tab:string,subtab?:string,targetId?:string)=>void;onSkip:()=>void}){
 const coach=useRef<HTMLElement>(null);
 const guide=state.story.tutorial==='active'&&!state.story.open?tutorialGuide(state):null;
 useEffect(()=>{if(!guide)return;const element=document.getElementById(guide.targetId);element?.classList.add('tutorial-focus');return()=>document.getElementById(guide.targetId)?.classList.remove('tutorial-focus')},[guide?.targetId]);
 useEffect(()=>{if(!guide||!coach.current)return;const root=document.documentElement,measure=()=>root.style.setProperty('--tutorial-dock-height',`${coach.current?.getBoundingClientRect().height??0}px`);measure();const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(measure);observer?.observe(coach.current);window.addEventListener('resize',measure);return()=>{observer?.disconnect();window.removeEventListener('resize',measure);root.style.removeProperty('--tutorial-dock-height')}},[guide?.targetId]);
 if(!guide)return null;
 const content=<aside ref={coach} className="tutorial-helper" aria-live="polite">
  <img src="/assets/game/mira-voss.png" alt="" aria-hidden="true"/>
  <div><strong>{guide.title}</strong><div className="tutorial-copy"><p>{guide.explanation}</p>{guide.requirement&&<small>{guide.requirement}</small>}</div><div><button onClick={onSkip}>{guide.skip}</button><button className="story-next" onClick={()=>onShow(guide.tab,guide.subtab,guide.targetId)}>{guide.show}</button></div></div>
 </aside>;
 return content;
}
