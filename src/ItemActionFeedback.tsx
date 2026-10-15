import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import {ComponentArt} from './GameArt';
import {ItemIdentity,ItemPortrait,rarityColors} from './ItemPresentation';
import type {ItemActionEvent,ItemActionKind} from './itemActionEvents';
import type {GameState,ComponentId} from './economy';
import {componentText} from './gameplayI18n';
import {MOBILE_BACK_EVENT} from './mobileIntegration';
const actionCopy:Record<ItemActionKind,[string,string]>={craft:['Item hergestellt','Item crafted'],fusion:['Fusion abgeschlossen','Fusion complete'],upgrade:['Aufgewertet','Level up'],refine:['Veredelt','Forging complete'],recycle:['Recycelt','Recycled'],equip:['Ausgerüstet','Equipped'],unequip:['Abgelegt','Unequipped'],lock:['Geschützt','Protected'],unlock:['Schutz entfernt','Protection removed']};
export function ItemActionFeedback({event,language,effects,onClose}:{event:ItemActionEvent;language:GameState['settings']['language'];effects:boolean;onClose:()=>void}){
 const callback=useRef(onClose);callback.current=onClose;
 const button=useRef<HTMLButtonElement>(null),de=language==='de';
 const [reduced,setReduced]=useState(()=>!effects||matchMedia('(prefers-reduced-motion: reduce)').matches),[ready,setReady]=useState(()=>!effects||matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)'),change=()=>{if(media.matches){setReduced(true);setReady(true)}};media.addEventListener('change',change);return()=>media.removeEventListener('change',change)},[]);
 useEffect(()=>{if(!effects){setReduced(true);setReady(true)}},[effects]);
 useEffect(()=>{
  const previous=document.activeElement instanceof HTMLElement?document.activeElement:null,overflow=document.body.style.overflow;
  if(event.cinematic){document.body.style.overflow='hidden';button.current?.focus()}
  const timer=window.setTimeout(()=>event.cinematic?setReady(true):callback.current(),event.cinematic?1850:3000);
  const key=(e:KeyboardEvent)=>{if(!event.cinematic)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();callback.current()}if(e.key==='Tab'){e.preventDefault();button.current?.focus()}};
  const back=(e:Event)=>{if(event.cinematic){e.preventDefault();e.stopImmediatePropagation();callback.current()}};
  const hide=()=>{if(document.hidden)callback.current()};
  document.addEventListener('keydown',key,true);window.addEventListener(MOBILE_BACK_EVENT,back,true);document.addEventListener('visibilitychange',hide);
  return()=>{clearTimeout(timer);document.removeEventListener('keydown',key,true);window.removeEventListener(MOBILE_BACK_EVENT,back,true);document.removeEventListener('visibilitychange',hide);if(event.cinematic){document.body.style.overflow=overflow;if(previous?.isConnected)previous.focus({preventScroll:true})}};
 },[]);
 const title=actionCopy[event.kind][de?0:1],components=Object.entries(event.components).filter(([,n])=>Number(n)>0);
 const content=event.cinematic?<div className={`item-action-scene action-${event.kind} ${reduced?'motion-off':''} ${ready?'is-ready':''}`} data-item-action={event.kind} role="dialog" aria-modal="true" aria-label={title} style={{'--item-color':rarityColors[event.item.rarity]} as CSSProperties}>
  <div className="item-scene-content"><header><small>{de?'SCHMIEDE':'FORGE'}</small><h2>{title}</h2></header>
  <div className="item-scene-stage" aria-hidden="true"><div className="item-scene-orbits"/><div className="item-scene-energy"/><div className="item-scene-flash"/>
   <div className="item-scene-inputs">{event.kind==='fusion'?event.inputs.map((item,i)=><span className={`item-scene-input input-${i}`} key={item.id}><ItemPortrait item={item}/></span>):components.slice(0,4).map(([id,n],i)=><span className={`item-scene-input material-input input-${i}`} key={id}><ComponentArt id={id as ComponentId}/><b>×{n}</b></span>)}</div>
   <div className="item-scene-result"><ItemPortrait item={event.item} size="hero" count={event.count}/></div>
   {!reduced&&!ready&&<ItemBurst color={rarityColors[event.item.rarity]}/>}
  </div>
  <div className="item-scene-receipt"><ItemIdentity item={event.item} language={language} count={event.count}/>{event.kind==='fusion'&&event.before&&<p className="item-rarity-change"><span className="rarity-dot" style={{background:rarityColors[event.before.rarity]}}/> → <span className="rarity-dot" style={{background:rarityColors[event.item.rarity]}}/> <b>{de?'Seltenheit erhöht':'Rarity increased'}</b></p>}<ul>{event.stats.map((line,i)=><li key={line}>{event.kind==='fusion'&&event.beforeStats[i]&&<small>{event.beforeStats[i]} →</small>}<strong>{line}</strong></li>)}</ul></div>
  <button ref={button} className="item-scene-continue" onClick={()=>ready?callback.current():setReady(true)}>{ready?(de?'Weiter':'Continue'):(de?'Überspringen':'Skip')}</button>
 </div></div>:<aside className={`item-action-toast action-${event.kind} ${reduced?'motion-off':''}`} data-item-action={event.kind} role="status" aria-live="polite" style={{'--item-color':rarityColors[event.item.rarity]} as CSSProperties}>
  <div className="item-toast-portrait"><ItemPortrait item={event.item} size="mini"/>{!reduced&&<i/>}</div><div><b>{title}</b><ItemIdentity item={event.item} language={language}/>{event.kind==='upgrade'&&event.before&&<strong className="item-change">Lv {event.before.level} → {event.item.level}</strong>}{event.kind==='refine'&&event.before&&<strong className="item-change">Forge {event.before.forge??0} → {event.item.forge??0}</strong>}{event.kind==='recycle'&&<div className="item-returned">{components.map(([id,n])=><span key={id} title={componentText(id as ComponentId,language).name}><ComponentArt id={id as ComponentId}/><b>+{n}</b></span>)}</div>}</div><button onClick={()=>callback.current()} aria-label={de?'Meldung schließen':'Dismiss notification'}>×</button>
 </aside>;
 return createPortal(content,document.body);
}
/** One bounded, elapsed-time burst; independent of game RNG and simulation. */
function ItemBurst({color}:{color:string}){
 const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const el=canvas.current,ctx=el?.getContext('2d');if(!el||!ctx)return;const dpr=Math.min(devicePixelRatio||1,2);el.width=360*dpr;el.height=300*dpr;ctx.scale(dpr,dpr);let frame=0,start:number|undefined;
 const draw=(now:number)=>{start??=now;const t=(now-start)/1000-.8;ctx.clearRect(0,0,360,300);if(t>=0)for(let i=0;i<36;i++){const a=i*2.399963,speed=45+i%6*17,x=180+Math.cos(a)*speed*t,y=150+Math.sin(a)*speed*t+45*t*t;ctx.globalAlpha=Math.max(0,1-t/1.1);ctx.fillStyle=i%3?color:'#fff4c9';ctx.fillRect(x,y,2+i%3,2+i%3)}ctx.globalAlpha=1;if(t<1.2)frame=requestAnimationFrame(draw)};frame=requestAnimationFrame(draw);return()=>cancelAnimationFrame(frame)},[color]);
 return <canvas className="item-scene-particles" ref={canvas} aria-hidden="true"/>;
}
