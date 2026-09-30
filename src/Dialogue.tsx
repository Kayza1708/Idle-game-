import {useEffect,useRef} from 'react';
import type { GameState } from './economy';
import { dialogues,storyChapters } from './story';

export function DialogueOverlay({state,onContinue,onSkip}:{state:GameState;onContinue:()=>void;onSkip:()=>void}){
 const id=state.story.open,dialogue=id?dialogues[id]:undefined,next=useRef<HTMLButtonElement>(null),de=state.settings.language==='de';
 useEffect(()=>{if(!id)return;const previous=document.activeElement as HTMLElement|null;next.current?.focus();return()=>previous?.focus()},[id]);
 if(!id||!dialogue)return null;
 const mira=dialogue.speaker==='Mira';
 const finalChapterPage=storyChapters.some(chapter=>chapter.pages[1]===id);
 return <aside className={`story-dialogue${mira?' has-mira':''}`} role="dialog" aria-labelledby="story-heading" aria-describedby="story-text">
  {mira&&<img className="mira-sprite" src="/assets/game/mira-voss.png" alt="Dr. Mira Voss"/>}
  <div className="story-copy"><strong>{dialogue.speaker==='Mira'?'Dr. Mira Voss':(state.aiName??'AURA')}</strong><h2 id="story-heading">{dialogue.title?.(state)??(de?'Mira-Dialog':'Mira dialogue')}</h2><p id="story-text">{dialogue.text(state)}</p><div className="story-actions"><button onClick={onSkip}>{dialogue.title?(de?'Schließen':'Close'):(de?'Überspringen':'Skip')}</button><button ref={next} className="story-next" onClick={onContinue}>{finalChapterPage?(de?'Schließen':'Close'):(de?'Weiter':'Continue')}</button></div></div>
 </aside>;
}
