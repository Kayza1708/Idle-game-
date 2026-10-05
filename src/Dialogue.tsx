import {useEffect,useRef} from 'react';
import type { GameState } from './economy';
import { dialogues,dialogueUiCopy,storyChapters } from './story';

export function DialogueOverlay({state,onContinue,onSkip}:{state:GameState;onContinue:()=>void;onSkip:()=>void}){
 const id=state.story.open,dialogue=id?dialogues[id]:undefined,next=useRef<HTMLButtonElement>(null),skipRef=useRef(onSkip),copy=dialogueUiCopy(state);skipRef.current=onSkip;
 useEffect(()=>{if(!id)return;const previous=document.activeElement as HTMLElement|null,escape=(event:KeyboardEvent)=>{if(event.key==='Escape')skipRef.current()};next.current?.focus();window.addEventListener('keydown',escape);return()=>{window.removeEventListener('keydown',escape);previous?.focus()}},[id]);
 if(!id||!dialogue)return null;
 const mira=dialogue.speaker==='Mira';
 const finalChapterPage=storyChapters.some(chapter=>chapter.pages[1]===id);
 return <aside className={`story-dialogue${mira?' has-mira':''}`} role="dialog" aria-labelledby="story-heading" aria-describedby="story-text">
  {mira&&<img className="mira-sprite" src="/assets/game/mira-voss.png" alt="Dr. Mira Voss"/>}
  <div className="story-copy"><strong>{dialogue.speaker==='Mira'?'Dr. Mira Voss':(state.aiName??'AURA')}</strong><h2 id="story-heading">{dialogue.title?.(state)??copy.heading}</h2><p id="story-text">{dialogue.text(state)}</p><div className="story-actions"><button onClick={onSkip}>{dialogue.title?copy.close:copy.skip}</button><button ref={next} className="story-next" onClick={onContinue}>{finalChapterPage?copy.close:copy.continue}</button></div></div>
 </aside>;
}
