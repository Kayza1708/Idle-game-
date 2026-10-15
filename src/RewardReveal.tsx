import {useEffect,useRef,useState,type ReactNode} from 'react';
import {MOBILE_BACK_EVENT} from './mobileIntegration';
import {createPortal} from 'react-dom';

/** Cosmetic receipt only: this component has no economy action or random reward roll. */
export function RewardReveal({title,closeLabel,effects,onClose,children,variant=''}:{title:string;closeLabel:string;effects:boolean;onClose:()=>void;children:ReactNode;variant?:string}){
 const close=useRef(onClose);close.current=onClose;
 const root=useRef<HTMLDivElement>(null),button=useRef<HTMLButtonElement>(null);
 const [reduced]=useState(()=>!effects||window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 const [ready,setReady]=useState(reduced);
 useEffect(()=>{
  const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
  button.current?.focus();
  const timer=window.setTimeout(()=>setReady(true),1600);
  const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();close.current()}if(event.key==='Tab'){event.preventDefault();button.current?.focus()}};
  const hidden=()=>{if(document.hidden)close.current()};
  const back=(event:Event)=>{event.preventDefault();event.stopImmediatePropagation();close.current()};window.addEventListener(MOBILE_BACK_EVENT,back,true);document.addEventListener('keydown',key);document.addEventListener('visibilitychange',hidden);
  const old=document.body.style.overflow;document.body.style.overflow='hidden';
  return()=>{window.clearTimeout(timer);window.removeEventListener(MOBILE_BACK_EVENT,back,true);document.removeEventListener('keydown',key);document.removeEventListener('visibilitychange',hidden);document.body.style.overflow=old;previous?.isConnected&&previous.focus()};
 },[]);
 return createPortal(<div ref={root} className={`reward-reveal ${variant} ${reduced?'motion-off':''} ${ready?'is-ready':''}`} role="dialog" aria-modal="true" aria-label={title}>
  <div className="reward-rays" aria-hidden="true"/>
  <div className="reward-content">
   <h2>{title}</h2>
   <div className="reward-chest" aria-hidden="true"><div className="chest-aura"/><div className="chest-rig-body"/><div className="chest-rig-lid"/><div className="chest-flash"/>{!reduced&&<RewardParticles/>}</div>
   <div className="reward-loot" aria-live="polite">{children}</div>
   <button ref={button} className="reward-continue" onClick={()=>{if(ready)close.current();else setReady(true)}}>{ready?closeLabel:'››'}</button>
  </div>
 </div>,document.body);
}
export function RewardParticles(){
 const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const el=canvas.current,ctx=el?.getContext('2d');if(!el||!ctx)return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const size=320,dpr=Math.min(window.devicePixelRatio||1,2);el.width=size*dpr;el.height=size*dpr;ctx.scale(dpr,dpr);
  let frame=0,start:number|undefined;
  const draw=(now:number)=>{start??=now;const t=(now-start)/1000;ctx.clearRect(0,0,size,size);
   if(t>.35)for(let i=0;i<28;i++){const age=t-.35,angle=i*2.399963,velocity=50+(i%5)*16;const x=160+Math.cos(angle)*velocity*age,y=170+Math.sin(angle)*velocity*age-100*age+70*age*age;ctx.globalAlpha=Math.max(0,1-age/1.4);ctx.fillStyle=i%3?'#a3fff0':'#ffe5a2';const n=i%3+2;ctx.fillRect(x,y,n,n)}
   ctx.globalAlpha=1;if(t<1.8)frame=requestAnimationFrame(draw);
  };frame=requestAnimationFrame(draw);return()=>cancelAnimationFrame(frame);
 },[]);
 return <canvas className="reward-particles" ref={canvas} aria-hidden="true"/>;
}
