import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {ComponentArt} from './GameArt';
import {ItemPortrait,rarityColors} from './ItemPresentation';
import {itemText,rarityText} from './gameplayI18n';
import type {GameState,ComponentId} from './economy';
import type {ItemActionEvent} from './itemActionEvents';
import {forgeFlights,FORGE_MOTION} from './forgeMotion';
export type ForgeFeedback=ItemActionEvent&{serial:number};
export function ForgeActionStage({event,inputOrder,effects,onComplete}:{event:ForgeFeedback;inputOrder:readonly string[];effects:boolean;onComplete:()=>void}){
 const root=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null),callback=useRef(onComplete);callback.current=onComplete;
 const [phase,setPhase]=useState<'assembly'|'reveal'|'settled'>('assembly'),[reduced,setReduced]=useState(()=>!effects||typeof matchMedia!=='function'||matchMedia('(prefers-reduced-motion: reduce)').matches);
 const kind=event.kind==='fusion'?'fusion':'craft',timing=FORGE_MOTION[kind],flights=forgeFlights(event,inputOrder),color=rarityColors[event.item.rarity];
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)'),change=()=>{if(media.matches)setReduced(true)};media.addEventListener('change',change);return()=>media.removeEventListener('change',change)},[]);
 useEffect(()=>{if(!effects)setReduced(true)},[effects]);
 useEffect(()=>{
  const el=root.current;if(!el)return;const animations:Animation[]=[],timers:number[]=[];let frame=0;
  const hide=()=>{if(document.hidden)callback.current()};document.addEventListener('visibilitychange',hide);
  const finishTimer=window.setTimeout(()=>callback.current(),reduced?1600:timing.duration+1450);timers.push(finishTimer);
  const clean=()=>{animations.forEach(a=>a.cancel());timers.forEach(clearTimeout);cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',hide)};
  if(reduced||typeof el.animate!=='function'){setPhase('settled');return clean}
  const animate=(target:Element|null,frames:Keyframe[],options:KeyframeAnimationOptions)=>{if(target)animations.push(target.animate(frames,{fill:'both',...options}))};
  const width=el.clientWidth,height=el.clientHeight,target={x:width*.5,y:height*(kind==='fusion'?.38:.5)};
  for(const [index,flight] of flights.entries()){
   const actor=el.querySelector(`[data-flight="${flight.slot}"]`),dx=target.x-width*flight.x/100,dy=target.y-height*flight.y/100;
   const pose=(x:number,y:number,scale:number,angle=0)=>`translate(-50%,-50%) translate(${x}px,${y}px) scale(${scale}) rotate(${angle}deg)`;
   animate(actor,[{offset:0,opacity:0,transform:pose(0,8,.75)},{offset:.14,opacity:1,transform:pose(0,0,1)},{offset:.36,opacity:1,transform:pose(dx*.18,dy*.12-12,1.12,index%2?8:-8)},{offset:.8,opacity:1,transform:pose(dx*.8,dy*.65-15,.8,index%2?-12:12)},{offset:1,opacity:0,transform:pose(dx,dy,flight.retained?.9:.08)}],{duration:timing.reveal-80,delay:index*35,easing:'cubic-bezier(.42,0,.2,1)'});
  }
  for(const [index,path] of Array.from(el.querySelectorAll('.forge-motion-links path')).entries())animate(path,[{offset:0,strokeDashoffset:1,opacity:0},{offset:.3,strokeDashoffset:0,opacity:.8},{offset:.8,strokeDashoffset:-1,opacity:.95},{offset:1,strokeDashoffset:-1,opacity:0}],{duration:timing.reveal,delay:80+index*35,easing:'ease-in-out'});
  for(const [index,clamp] of Array.from(el.querySelectorAll('.forge-motion-clamp')).entries())animate(clamp,[{offset:0,transform:`translateX(${index?28:-28}px)`,opacity:0},{offset:.45,transform:'translateX(0)',opacity:1},{offset:.7,transform:`translateX(${index?-6:6}px)`,opacity:1},{offset:1,transform:`translateX(${index?28:-28}px)`,opacity:0}],{duration:timing.reveal,delay:100,easing:'cubic-bezier(.2,.8,.2,1)'});
  animate(el.querySelector('.forge-motion-result'),[{opacity:0,transform:'translate(-50%,-50%) scale(.32)'},{offset:.38,opacity:1,transform:'translate(-50%,-50%) scale(1.13)'},{opacity:1,transform:'translate(-50%,-50%) scale(1)'}],{duration:timing.duration-timing.reveal,delay:timing.reveal,easing:'cubic-bezier(.16,1,.3,1)'});
  animate(el.querySelector('.forge-motion-rim'),[{opacity:0,scale:.72},{offset:.35,opacity:1,scale:1.1},{opacity:.85,scale:1}],{duration:480,delay:timing.reveal,easing:'ease-out'});
  animate(el.querySelector('.forge-motion-impact'),[{opacity:0,scale:.3},{offset:.22,opacity:.65,scale:1},{opacity:0,scale:1.5}],{duration:220,delay:timing.reveal,easing:'ease-out'});
  animate(el.querySelector('.forge-motion-scan'),[{transform:'translateY(35px)',opacity:0},{offset:.2,opacity:.9},{transform:'translateY(-35px)',opacity:0}],{duration:380,delay:timing.reveal+80,easing:'ease-out'});
  timers.push(window.setTimeout(()=>setPhase('reveal'),timing.reveal),window.setTimeout(()=>setPhase('settled'),timing.duration));
  const c=canvas.current,context=c?.getContext('2d');if(c&&context){const ratio=Math.min(devicePixelRatio||1,2);c.width=width*ratio;c.height=height*ratio;context.scale(ratio,ratio);const started=performance.now();
   const draw=(now:number)=>{const t=(now-started-timing.reveal)/1000;context.clearRect(0,0,width,height);if(t>=0&&t<.8){for(let i=0;i<42;i++){const angle=i*2.399963,speed=30+(i%7)*12,x=target.x+Math.cos(angle)*speed*t,y=target.y+Math.sin(angle)*speed*t+36*t*t;context.globalAlpha=Math.max(0,1-t/.8);context.strokeStyle=i%3?color:'#fff0bc';context.lineWidth=i%4===0?2:1;context.beginPath();context.moveTo(x,y);context.lineTo(x-Math.cos(angle)*7,y-Math.sin(angle)*7);context.stroke()}context.globalAlpha=1}if(t<.85)frame=requestAnimationFrame(draw)};frame=requestAnimationFrame(draw);
  }
  return clean;
 },[event.serial,reduced]);
 return <div ref={root} className={`forge-action-stage motion-${kind} ${reduced?'motion-reduced':''}`} data-forge-action={kind} data-phase={phase} style={{'--forge-rarity':color} as CSSProperties} aria-hidden="true">
  <svg className="forge-motion-links" viewBox="0 0 100 100" preserveAspectRatio="none">{flights.map(f=><path key={f.id} pathLength="1" d={`M${f.x} ${f.y} Q${(f.x+50)/2} ${f.y-22} 50 ${kind==='fusion'?38:50}`}/>)}</svg>
  {flights.map(f=>{const item=event.inputs.find(i=>i.id===f.id);return <span className="forge-motion-actor" data-flight={f.slot} data-item-id={item?.id} data-retained={f.retained} key={f.id} style={{left:f.x+'%',top:f.y+'%'}}>{item?<ItemPortrait item={item} surface="inset" level={false}/>:<><ComponentArt id={f.id as ComponentId}/><b>×{event.components[f.id as ComponentId]}</b></>}</span>})}
  <span className="forge-motion-machine" style={{top:kind==='fusion'?'38%':'50%'}}><i className="forge-motion-clamp clamp-left"/><i className="forge-motion-clamp clamp-right"/><i className="forge-motion-impact"/><svg className="forge-motion-rim" viewBox="0 0 100 100"><path d="M16 8H84L94 18V82L84 92H16L6 82V18Z"/></svg><i className="forge-motion-scan"/></span>
  <span className="forge-motion-result" style={{top:kind==='fusion'?'38%':'50%'}}><ItemPortrait item={event.item} level={false} surface="inset" count={event.count}/></span><canvas ref={canvas} className="forge-motion-particles"/>
 </div>;
}
export function ForgeActionReceipt({event,language}:{event:ForgeFeedback;language:GameState['settings']['language']}){
 const de=language==='de';return <span className="forge-action-receipt" role="status" style={{'--forge-rarity':rarityColors[event.item.rarity]} as CSSProperties}><b>✓ {itemText(event.item.type,language)}{event.count>1?` ×${event.count}`:''} · {event.kind==='fusion'?(de?'fusioniert':'fused'):(de?'hergestellt':'crafted')}</b><small>{event.kind==='fusion'&&event.before?`${rarityText(event.before.rarity,language)} → ${rarityText(event.item.rarity,language)} · `:''}{event.stats[0]}</small></span>;
}
