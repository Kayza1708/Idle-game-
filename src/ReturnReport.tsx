import {returnGuidance,type ReturnAction} from './returnGuidance';
import {returnText} from './returnText';
import {exactEconomyValue,formatScientific,type GameState} from './economy';
import {ItemReceipt} from './ItemReceipt';
import {useEffect,useRef} from 'react';
import {createPortal} from 'react-dom';
import type {AdvanceReport} from './simulation';
import {ScientificNumber} from './scientificNumber';
import {ComponentArt,ResourceArt} from './GameArt';
import {PixelIcon} from './PixelIcon';
import {componentText} from './gameplayI18n';
const duration=(seconds:number)=>{const minutes=Math.floor(seconds/60),hours=Math.floor(minutes/60),rest=minutes%60;return hours?`${hours} h ${rest} min`:`${minutes} min`};
const amount=(value:{m:number;e:number},format:GameState['settings']['numberFormat'])=>formatScientific(ScientificNumber.fromJSON(value),2,format);
export function ReturnReport({report,state,onClose,onRewards,onInventory,onAction}:{report:AdvanceReport;state:GameState;onClose:()=>void;onRewards:()=>void;onInventory:()=>void;onAction?:(action:ReturnAction)=>void}){
 const close=useRef(onClose);close.current=onClose;
 const button=useRef<HTMLButtonElement>(null),dialog=useRef<HTMLElement>(null),de=state.settings.language==='de',copy=returnText[state.settings.language],guidance=returnGuidance(state),components=Object.entries(report.components).filter(([,n])=>Number(n)>0),hasItem=report.craftingCompleted>0,hasRewards=report.newQuestRewards+report.newSeasonRewards>0;
 const completions=[{icon:'training' as const,label:de?'Training':'Training',count:report.levels},{icon:'research' as const,label:de?'Forschung':'Research',count:report.researchCompleted},{icon:'analysis' as const,label:de?'Analysen':'Analyses',count:report.experiments},{icon:'craft' as const,label:de?'Herstellung':'Crafting',count:report.craftingCompleted},{icon:'hardware' as const,label:copy.hardware,count:report.hardware}].filter(row=>row.count>0);
 useEffect(()=>{const previous=document.activeElement as HTMLElement|null,old=document.body.style.overflow;document.body.style.overflow='hidden';button.current?.focus();const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();close.current()}if(event.key==='Tab'){const focusable=[...(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled),summary,[tabindex="0"]')??[])].filter(e=>e.getClientRects().length),first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}}};addEventListener('keydown',key);return()=>{removeEventListener('keydown',key);document.body.style.overflow=old;previous?.focus({preventScroll:true})}},[]);
 const material=(entries:typeof components)=><div className="return-material-grid">{entries.map(([id,n])=>{const name=componentText(id as keyof GameState['componentInventory'],state.settings.language).name;return <span key={id} title={`${name} +${n}`} aria-label={`${name} +${n}`}><ComponentArt id={id as keyof GameState['componentInventory']}/><b>+{n}</b></span>})}</div>;
 return createPortal(<div className="return-backdrop"><section ref={dialog} className="return-report return-compact" role="dialog" aria-modal="true" aria-labelledby="return-title">
  <header className="return-report__header"><PixelIcon name="time"/><div><h2 id="return-title">{report.context==='challenge'?(de?'Hauptspiel':'Main game'):(de?'Zurück im Labor':'Back in the lab')}</h2><small>{duration(report.seconds)} {de?'angerechnet':'credited'}{report.lostSeconds>0&&` · ${de?'Limit erreicht':'Limit reached'}`}</small></div></header>
  <div className="return-report__body"><small className="return-gross-label">{de?'Produziert':'Produced'} · {de?'vor automatischen Ausgaben':'before automatic spending'}</small><div className="return-resource-grid">{(['credits','data'] as const).map(id=><div key={id}><ResourceArt id={id}/><span>{id==='credits'?'Credits':de?'Daten':'Data'}</span><b>+{amount(id==='credits'?report.exactCredits:report.exactData,state.settings.numberFormat)}</b></div>)}</div>
   {components.length>0&&<section className="return-materials"><h3>{de?'Materialien':'Materials'}</h3>{material(components.slice(0,8))}</section>}
   {completions.length>0&&<div className="return-completions">{completions.map(row=><span key={row.icon} aria-label={`${row.label}: ${row.count}`} title={`${row.label}: ${row.count}`}><PixelIcon name={row.icon}/><b>{row.count}</b><small>{row.label}</small></span>)}</div>}
   <details className="return-more"><summary>{de?'Details':'Details'}{components.length>8&&` · +${components.length-8} ${de?'Materialtypen':'material types'}`}</summary>
    {components.length>8&&material(components.slice(8))}<dl><div><dt>{de?'Abwesenheit':'Absence'}</dt><dd>{duration(report.elapsedSeconds)}</dd></div><div><dt>{de?'Angerechnet':'Credited'}</dt><dd>{duration(report.seconds)}</dd></div>{report.lostSeconds>0&&<div><dt>{de?'Durch Offline-Limit verloren':'Lost to offline limit'}</dt><dd>{duration(report.lostSeconds)}</dd></div>}</dl>
    <h3>{copy.available}</h3><p>Credits: {amount(exactEconomyValue(state,'credits').toJSON(),state.settings.numberFormat)} · {de?'Daten':'Data'}: {amount(exactEconomyValue(state,'data').toJSON(),state.settings.numberFormat)}</p>
    {report.itemResults?.length? <section><h3>{de?'Items':'Items'}</h3>{report.itemResults.map((g,i)=><ItemReceipt key={i} s={state} item={g.item} count={g.count}/>)}</section>:null}
    {hasRewards&&<p>{de?'Abholbar':'Claimable'}: {report.newQuestRewards} Quest · {report.newSeasonRewards} Season</p>}
    {onAction&&guidance.length>0&&<section className="return-guidance">{guidance.map(action=><button key={action.kind} onClick={()=>onAction(action)}>{copy[action.kind]}</button>)}{guidance.some(action=>action.kind==='queue')&&<small>{copy.queueNote}</small>}</section>}
    <small>{de?'Bereits gebucht. Kein erneuter Ertrag beim Schließen.':'Already credited. Closing does not grant rewards again.'}</small>
   </details>
  </div><footer className="return-report__footer">{hasRewards&&<button onClick={onRewards}>{de?'Belohnungen':'Rewards'}</button>}{hasItem&&<button onClick={onInventory}>Items</button>}<button className="return-continue" ref={button} onClick={onClose}>{de?'Weiter spielen':'Continue playing'}</button></footer>
 </section></div>,document.body);
}
