import {useEffect} from 'react';
import type {GameState} from './economy';
import {tutorialGuide} from './tutorialGuide';

export function TutorialFocus({state,onShow,onSkip}:{state:GameState;onShow:(tab:string,subtab?:string,targetId?:string)=>void;onSkip:()=>void}){
 const guide=state.story.tutorial==='active'&&!state.story.open?tutorialGuide(state):null;
 useEffect(()=>{if(!guide)return;const element=document.getElementById(guide.targetId);element?.classList.add('tutorial-focus');return()=>element?.classList.remove('tutorial-focus')},[guide?.targetId]);
 if(!guide)return null;
 return <aside className="tutorial-helper" aria-live="polite">
  <img src="/assets/game/mira-voss.png" alt="" aria-hidden="true"/>
  <div><strong>{guide.title}</strong><p>{guide.explanation}</p>{guide.requirement&&<small>{guide.requirement}</small>}<div><button onClick={onSkip}>{guide.skip}</button><button className="story-next" onClick={()=>onShow(guide.tab,guide.subtab,guide.targetId)}>{guide.show}</button></div></div>
 </aside>
}
