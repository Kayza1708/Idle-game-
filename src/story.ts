import { type GameState, type HardwareId, newINT, reachedMilestones, tapCredits, trainingCost } from './economy';

export type TutorialTarget='prologue'|'tap'|'hardware'|'training'|'research'|null;
export type StoryState={tutorial:'active'|'skipped'|'completed';target:TutorialTarget;open:string|null;queue:string[];seen:string[]};
export const newStory=():StoryState=>({tutorial:'active',target:'prologue',open:'prologue-welcome',queue:[],seen:['prologue-welcome']});
export const migratedStory=():StoryState=>({tutorial:'skipped',target:null,open:null,queue:[],seen:[]});

type Dialogue={speaker:'Mira'|'AURA';text:(s:GameState)=>string};
export const dialogues:Record<string,Dialogue>={
 'prologue-welcome':{speaker:'Mira',text:()=> 'Gut, du bist da. Ich bin Dr. Mira Voss. Das hier ist unser Labor.'},
 'prologue-aura':{speaker:'Mira',text:s=> `Das ist ${s.aiName??'AURA'}. Im Moment läuft ihr ganzes Modell auf ziemlich bescheidener Hardware.`},
 'prologue-funding':{speaker:'Mira',text:()=> 'Die Förderung ist weg. Wenn wir das Labor selbst finanzieren, können wir die KI weiterentwickeln und echte Forschungsfragen angehen.'},
 'prologue-mission':{speaker:'Mira',text:()=> 'Hilfst du mir, aus diesem kleinen Prototyp eine KI zu machen, die die Welt verändern kann?'},
 'tutorial-tap':{speaker:'Mira',text:s=>`Gib ${s.aiName??'AURA'} einen ersten Impuls: Tippe einmal auf die Laborillustration. Der Impuls bringt aktuell ${tapCredits(s).toLocaleString('de-DE',{maximumFractionDigits:2})} Credits.`},
 'tutorial-tap-result':{speaker:'AURA',text:()=> 'IMPULS REGISTRIERT. LOKALE FINANZIERUNG AKTIV.'},
 'first-hardware':{speaker:'Mira',text:s=>`Erste Hardware online. ${s.hardware} Geräte liefern zusammen Compute; daraus entstehen Nutzer, und Nutzer erzeugen Credits sowie Daten.`},
 'tutorial-training':{speaker:'Mira',text:s=>`Als Nächstes trainieren wir dein Modell. Qualität steigert Nutzerwert und Taps; Effizienz bringt mehr Nutzer je Hardware. Der nächste Lauf kostet ab ${Math.min(trainingCost(s,'quality'),trainingCost(s,'efficiency')).toLocaleString('de-DE')} Credits plus Daten.`},
 'first-training':{speaker:'Mira',text:s=>`Training abgeschlossen. Dein Modell steht jetzt bei Qualität ${s.qualityLevel} und Effizienz ${s.efficiencyLevel}.`},
 'tutorial-research':{speaker:'Mira',text:s=>s.discovered.includes('sbc')?'Öffne Forschung. Dort kannst du das Einführungsexperiment oder ein bezahlbares Forschungsprojekt als nächsten Schritt starten.':'Forschung wird mit dem Einplatinencomputer zugänglich. Baue die aktuelle Hardware weiter aus; der Forschungsreiter zeigt dir die nächste Voraussetzung.'},
 'first-research':{speaker:'Mira',text:()=> 'Der erste Forschungsabschluss steht. Ab jetzt gehen wir Schritt für Schritt schwierigere Fragen an.'},
 'first-milestone':{speaker:'Mira',text:()=> 'Ein echter Hardware-Meilenstein. Große Stückzahlen verbessern nicht nur die Klasse selbst, sondern prägen die Leistung des ganzen Labors.'},
 'prestige-ready':{speaker:'Mira',text:s=>`${newINT(s)} INT wären jetzt erreichbar. Der Neustart geschieht nur, wenn du ihn im Prestige-Reiter selbst bestätigst.`},
 'first-prestige':{speaker:'Mira',text:s=>`Der Neustart brachte ${s.telemetry.prestigeHistory.at(-1)?.intEarned??0} INT. Credits, Daten, Hardwarebestände, Klassen-Upgrades und Modell wurden zurückgesetzt. INT, Entdeckungen, Items, Forschung, Gems, Aufträge, Projekte und Timer bleiben.`},
};

const append=(s:GameState,id:string)=>{
 if(s.story.seen.includes(id)||s.story.open===id||s.story.queue.includes(id))return s;
 const story=s.story.open?{...s.story,queue:[...s.story.queue,id]}:{...s.story,open:id,seen:[...s.story.seen,id]};
 return {...s,story};
};

const totalTaps=(s:GameState)=>s.telemetry.archivedMetrics.taps+s.telemetry.metrics.reduce((sum,b)=>sum+b.taps,0);
const firstMilestoneCount=(s:GameState)=>Object.entries(s.hardwareCounts).reduce((sum,[id,count])=>sum+reachedMilestones(id as HardwareId,count).length,0);

export function syncStory(before:GameState,after:GameState):GameState{
 let next=after;
 if(after.story.tutorial==='active'){
  if(after.story.target==='tap'&&totalTaps(after)>totalTaps(before))next=append(next,'tutorial-tap-result');
  if(after.story.target==='hardware'&&after.hardware>before.hardware)next=append(next,'first-hardware');
  if(after.story.target==='training'&&after.level>before.level)next=append(next,'first-training');
  if(after.story.target==='research'&&(after.completedResearch.length>before.completedResearch.length||after.breakthroughs.length>before.breakthroughs.length||after.experiments.completedIds.length>before.experiments.completedIds.length))next=append(next,'first-research');
 }
 if(after.hardware>before.hardware)next=append(next,'first-hardware');
 if(after.level>before.level)next=append(next,'first-training');
 if(after.completedResearch.length>before.completedResearch.length||after.breakthroughs.length>before.breakthroughs.length||after.experiments.completedIds.length>before.experiments.completedIds.length)next=append(next,'first-research');
 if(firstMilestoneCount(after)>firstMilestoneCount(before))next=append(next,'first-milestone');
 if(newINT(before)<1&&newINT(after)>=1)next=append(next,'prestige-ready');
 if(after.prestigeCount>before.prestigeCount)next=append(next,'first-prestige');
 return next;
}

const showNext=(s:GameState,story:StoryState,id?:string)=>{
 const open=id??story.queue[0]??null,queue=id?story.queue.filter(queued=>queued!==id):story.queue.slice(open?1:0);
 return {...s,story:{...story,open,queue,seen:open&&!story.seen.includes(open)?[...story.seen,open]:story.seen}};
};

export function continueDialogue(s:GameState):GameState{
 const id=s.story.open;if(!id)return s;let story={...s.story,open:null};
 if(story.tutorial==='active'){
  const prologue=['prologue-welcome','prologue-aura','prologue-funding','prologue-mission'];const index=prologue.indexOf(id);
  if(index>=0)return showNext(s,story,prologue[index+1]??'tutorial-tap');
  if(id==='tutorial-tap'){story.target='tap';return totalTaps(s)>0?showNext(s,story,'tutorial-tap-result'):{...s,story};}
  if(id==='tutorial-tap-result'){story.target='hardware';return s.hardware>1?showNext(s,story,'first-hardware'):{...s,story};}
  if(id==='first-hardware'){story.target='training';return showNext(s,story,'tutorial-training');}
  if(id==='tutorial-training')return s.level>0?showNext(s,story,'first-training'):{...s,story};
  if(id==='first-training'){story.target='research';return s.completedResearch.length||s.breakthroughs.length||s.experiments.completedIds.length?showNext(s,story,'first-research'):showNext(s,story,'tutorial-research');}
  if(id==='tutorial-research'){
   if(s.completedResearch.length||s.breakthroughs.length||s.experiments.completedIds.length)return showNext(s,story,'first-research');
   if(!s.discovered.includes('sbc'))return showNext(s,{...story,tutorial:'completed',target:null});
   return {...s,story};
  }
  if(id==='first-research')return showNext(s,{...story,tutorial:'completed',target:null});
 }
 return showNext(s,story);
}

export function skipTutorial(s:GameState):GameState{const story={...s.story,tutorial:'skipped' as const,target:null,open:null,queue:s.story.queue.filter(id=>!id.startsWith('prologue-')&&!id.startsWith('tutorial-'))};return showNext(s,story);}
export function skipCurrentDialogue(s:GameState):GameState{return s.story.tutorial==='active'?skipTutorial(s):showNext(s,{...s.story,open:null});}
export function reopenDialogue(s:GameState,id:string):GameState{return !dialogues[id]||!s.story.seen.includes(id)||s.story.open!==null?s:{...s,story:{...s.story,open:id}};}
