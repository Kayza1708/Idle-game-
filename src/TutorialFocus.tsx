import {TutorialFinger} from './TutorialFinger';
import {useEffect,useRef} from 'react';
import type {GameState} from './economy';
import {tutorialGuide} from './tutorialGuide';

export function TutorialFocus({state,onShow,onSkip}:{state:GameState;onShow:(tab:string,subtab?:string,targetId?:string)=>void;onSkip:()=>void}){
 const coach=useRef<HTMLElement>(null);
 const guide=state.story.tutorial==='active'&&!state.story.open?tutorialGuide(state):null;
 useEffect(()=>{if(!guide)return;const element=document.getElementById(guide.targetId);element?.classList.add('tutorial-focus');return()=>document.getElementById(guide.targetId)?.classList.remove('tutorial-focus')},[guide?.targetId]);
 useEffect(()=>{if(!guide||!coach.current)return;const root=document.documentElement,measure=()=>root.style.setProperty('--tutorial-dock-height',`${coach.current?.getBoundingClientRect().height??0}px`);measure();const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(measure);observer?.observe(coach.current);window.addEventListener('resize',measure);return()=>{observer?.disconnect();window.removeEventListener('resize',measure);root.style.removeProperty('--tutorial-dock-height')}},[guide?.targetId]);
 if(!guide)return null;
 const content=<aside ref={coach} className="tutorial-helper mira-stage" aria-live="polite">
  <img className="mira-character" src="/assets/game/mira-voss.png" alt="" aria-hidden="true"/>
  <div className="mira-speech"><button className="mira-close" onClick={onSkip} aria-label={guide.skip}>×</button><strong>{guide.title}</strong><div className="tutorial-copy"><p>{guide.explanation}</p>{guide.requirement&&<small className="mira-requirement">{guide.requirement}</small>}</div><button className="story-next mira-cue" onClick={()=>onShow(guide.tab,guide.subtab,guide.targetId)}>{guide.show} <span aria-hidden="true">›</span></button></div>
 </aside>;
 return <><TutorialFinger targetId={guide.targetId} routeTargetId={guide.targetId==='tutorial-quality-training'?'tutorial-model-entry':`tab-${guide.tab}`} animate={state.settings.effects}/>{content}</>;
}
