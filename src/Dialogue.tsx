import {useEffect,useRef} from 'react';
import type { GameState } from './economy';
import { dialogues } from './story';

export function DialogueOverlay({state,onContinue,onSkip}:{state:GameState;onContinue:()=>void;onSkip:()=>void}){
 const id=state.story.open,dialogue=id?dialogues[id]:undefined,next=useRef<HTMLButtonElement>(null),de=state.settings.language==='de';
 useEffect(()=>{if(!id)return;const previous=document.activeElement as HTMLElement|null;next.current?.focus();return()=>previous?.focus()},[id]);
 if(!id||!dialogue)return null;
 const mira=dialogue.speaker==='Mira';
 return <aside className={`story-dialogue${mira?' has-mira':''}`} role="dialog" aria-labelledby="story-speaker" aria-describedby="story-text">
  {mira&&<img className="mira-sprite" src="/assets/game/mira-voss.png" alt="Dr. Mira Voss"/>}
  <div className="story-copy"><strong id="story-speaker">{dialogue.speaker==='Mira'?'Dr. Mira Voss':(state.aiName??'AURA')}</strong><p id="story-text">{dialogue.text(state)}</p><div className="story-actions"><button onClick={onSkip}>{de?'Überspringen':'Skip'}</button><button ref={next} className="story-next" onClick={onContinue}>{de?'Weiter':'Continue'}</button></div></div>
 </aside>;
}
