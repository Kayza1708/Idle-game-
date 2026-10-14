import {useEffect,useRef} from 'react';
import type { GameState } from './economy';
import { dialogues,dialogueUiCopy,storyChapters } from './story';

export function dialogueSummary(s:GameState){
 const de=s.settings.language==='de',id=s.story.open;
 const text:Record<string,[string,string]>={
  'first-prestige':[`+${s.telemetry.prestigeHistory.at(-1)?.intEarned??0} INT. Daten bleiben. Wähle jetzt einen INT-Knoten.`,`+${s.telemetry.prestigeHistory.at(-1)?.intEarned??0} INT. Data stays. Choose an INT node next.`],
  'tutorial-production':['Hardware liefert Compute. Nutzer erzeugen Credits und Daten.','Hardware supplies compute. Users generate credits and data.'],
  'tutorial-research':['Forsche für stärkere Produktion. Wähle Datenerzeugung.','Research strengthens production. Choose Data Generation.'],
  'tutorial-analysis':['Starte eine Hardwareanalyse für Komponenten.','Start a hardware analysis for components.'],
  'tutorial-crafting':['Öffne die Schmiede und fertige dein erstes Item.','Open crafting and build your first item.'],
  'tutorial-prestige':['Prestige bringt INT. Daten und Forschung bleiben.','Prestige earns INT. Data and research stay.'],
  'first-training':['Training fertig. Dein Modell verdient jetzt mehr.','Training complete. Your model earns more now.'],
  'first-item':['Item gefunden. Öffne die Ausrüstung und lege es an.','Item found. Open equipment and equip it.'],
  'first-automation':['Automation bereit. Wähle, was automatisch laufen soll.','Automation ready. Choose what runs automatically.'],
 };return id&&text[id]?text[id][de?0:1]:null;
}

export function DialogueOverlay({state,onContinue,onSkip}:{state:GameState;onContinue:()=>void;onSkip:()=>void}){
 const id=state.story.open,dialogue=id?dialogues[id]:undefined,next=useRef<HTMLButtonElement>(null),skipRef=useRef(onSkip),copy=dialogueUiCopy(state);skipRef.current=onSkip;
 useEffect(()=>{if(!id)return;const previous=document.activeElement as HTMLElement|null,escape=(event:KeyboardEvent)=>{if(event.key==='Escape')skipRef.current()};next.current?.focus();window.addEventListener('keydown',escape);return()=>{window.removeEventListener('keydown',escape);previous?.focus()}},[id]);
 if(!id||!dialogue)return null;
 const brief=dialogueSummary(state);
 const mira=dialogue.speaker==='Mira';
 const finalChapterPage=storyChapters.some(chapter=>chapter.pages[1]===id);
 return <aside className={`story-dialogue mira-stage${mira?' has-mira':''}`} role="dialog" aria-labelledby="story-heading" aria-describedby="story-text">
  {mira&&<img className="mira-sprite mira-character" src="/assets/game/mira-voss.png" alt="Dr. Mira Voss"/>}
  <div className="story-copy mira-speech"><strong>{dialogue.speaker==='Mira'?'Dr. Mira Voss':(state.aiName??'AURA')}</strong><h2 id="story-heading" className={dialogue.title?undefined:'visually-hidden'}>{dialogue.title?.(state)??copy.heading}</h2><p id="story-text">{brief??dialogue.text(state)}</p>{brief&&<details className="mira-more"><summary>{state.settings.language==='de'?'Details':'Details'}</summary><p>{dialogue.text(state)}</p></details>}<div className="story-actions"><button onClick={onSkip}>{dialogue.title?copy.close:copy.skip}</button><button ref={next} className="story-next" onClick={onContinue}>{finalChapterPage?copy.close:copy.continue}</button></div></div>
 </aside>;
}
