import {useEffect,useLayoutEffect,useMemo,useRef} from 'react';
import {ProgressionNodeArt} from './ProgressionArt';
import {ResourceArt} from './GameArt';
import type {PrestigeNodeV2,AxiomNodeV2} from './progression';
import {buildProgressionNetwork,networkZoom,zoomCamera,NETWORK_ZOOM,type NetworkPoint} from './progressionNetworkLayout';
import './prestige-network.css';
export type NetworkNode={id:PrestigeNodeV2|AxiomNodeV2;name:string;cost:string;order:number;owned:boolean;affordable:boolean;level?:number};
export function ProgressionNetwork({nodes,labels,de,effects,onSelect,kind}:{nodes:NetworkNode[];labels:Record<string,string>;de:boolean;effects:boolean;onSelect:(id:PrestigeNodeV2|AxiomNodeV2)=>void;kind:'int'|'axiom'}){
 const signature=nodes.map(n=>`${n.id}:${n.order}`).join('|'),layout=useMemo(()=>buildProgressionNetwork(nodes),[signature]);
 const viewport=useRef<HTMLDivElement>(null),world=useRef<HTMLDivElement>(null),readout=useRef<HTMLOutputElement>(null),camera=useRef({x:0,y:0,z:NETWORK_ZOOM.initial});
 const pointers=useRef(new Map<number,NetworkPoint>()),origin=useRef<NetworkPoint|null>(null),dragged=useRef(false),previousOwned=useRef(new Set(nodes.filter(n=>n.owned).map(n=>n.id)));
 const apply=(next:typeof camera.current)=>{
  const el=viewport.current;if(!el||!world.current)return;
  next.z=networkZoom(next.z);next.x=Math.min(el.clientWidth-40,Math.max(40-layout.width*next.z,next.x));next.y=Math.min(el.clientHeight-40,Math.max(40-layout.height*next.z,next.y));camera.current=next;
  world.current.style.transform=`translate(${next.x}px,${next.y}px) scale(${next.z})`;world.current.style.setProperty('--network-scale',String(next.z));
  if(readout.current)readout.current.textContent=`${Math.round(next.z*100)}%`;
 };
 const center=(point:NetworkPoint=layout.core)=>{const el=viewport.current;if(el)apply({x:el.clientWidth/2-point.x*camera.current.z,y:el.clientHeight/2-point.y*camera.current.z,z:camera.current.z})};
 const zoom=(factor:number)=>{const el=viewport.current;if(el)apply(zoomCamera(camera.current,camera.current.z*factor,{x:el.clientWidth/2,y:el.clientHeight/2}))};
 useLayoutEffect(()=>{
  let width=0,height=0;const observer=new ResizeObserver(()=>{const el=viewport.current;if(!el)return;if(!width){camera.current.z=networkZoom(Math.min(NETWORK_ZOOM.initial,el.clientWidth/430));center()}else apply({...camera.current,x:camera.current.x+(el.clientWidth-width)/2,y:camera.current.y+(el.clientHeight-height)/2});width=el.clientWidth;height=el.clientHeight});
  if(viewport.current)observer.observe(viewport.current);return()=>observer.disconnect();
 },[layout]);
 useEffect(()=>{const old=previousOwned.current;for(const node of nodes){if(node.owned&&!old.has(node.id)&&effects&&!matchMedia('(prefers-reduced-motion: reduce)').matches)world.current?.querySelector(`[data-network-node="${node.id}"] .network-node-art`)?.animate([{filter:'brightness(2)',scale:'1.22'},{filter:'brightness(1)',scale:'1'}],{duration:550,easing:'cubic-bezier(.16,1,.3,1)'})}previousOwned.current=new Set(nodes.filter(n=>n.owned).map(n=>n.id))},[nodes,effects]);
 const finishPointer=(id:number)=>{pointers.current.delete(id);if(!pointers.current.size){origin.current=null;viewport.current?.removeAttribute('data-dragging')}if(viewport.current?.hasPointerCapture(id))viewport.current.releasePointerCapture(id)};
 return <section className={`prestige-network network-${kind}`} aria-label={de?'Prestigenetz':'Prestige network'}>
  <div className="network-toolbar"><label><span className="network-sr-only">{de?'Bereich finden':'Find branch'}</span><select aria-label={de?'Bereich finden':'Find branch'} defaultValue="" onChange={e=>{const branch=e.currentTarget.value,nodesInBranch=layout.nodes.filter(n=>n.branch===branch),target=nodesInBranch.find(p=>nodes.some(n=>n.id===p.id&&!n.owned&&n.affordable))??nodesInBranch.find(p=>nodes.some(n=>n.id===p.id&&!n.owned))??nodesInBranch[0];if(target)center(target);e.currentTarget.value=''}}><option value="" disabled>{de?'Bereich finden':'Find branch'}</option>{layout.branches.map(b=><option key={b} value={b}>{labels[b]}</option>)}</select></label><button data-network-zoom="out" onClick={()=>zoom(1/1.15)} aria-label={de?'Verkleinern':'Zoom out'}>−</button><output ref={readout} aria-label={de?'Zoomstufe':'Zoom level'}>82%</output><button data-network-zoom="in" onClick={()=>zoom(1.15)} aria-label={de?'Vergrößern':'Zoom in'}>+</button><button data-network-home onClick={()=>{camera.current.z=networkZoom(Math.min(NETWORK_ZOOM.initial,(viewport.current?.clientWidth??430)/430));center()}} aria-label={de?'Zum Zentrum':'Center network'}>◎</button></div>
  <div ref={viewport} className="network-viewport" tabIndex={0} role="region" aria-label={de?'Knotennetz. Ziehen zum Verschieben, zwei Finger zum Zoomen.':'Node network. Drag to pan, pinch to zoom.'}
   onPointerDown={e=>{if(e.button!==0)return;if(!pointers.current.size){dragged.current=false;origin.current={x:e.clientX,y:e.clientY}}pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});if(!(e.target as HTMLElement).closest('button'))e.currentTarget.setPointerCapture(e.pointerId)}}
   onPointerMove={e=>{const previous=pointers.current.get(e.pointerId);if(!previous)return;const old=[...pointers.current.values()];pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});if(origin.current&&Math.hypot(e.clientX-origin.current.x,e.clientY-origin.current.y)>7){dragged.current=true;e.currentTarget.dataset.dragging='true';e.currentTarget.setPointerCapture(e.pointerId)}
    if(pointers.current.size===2){dragged.current=true;const next=[...pointers.current.values()],rect=e.currentTarget.getBoundingClientRect(),a={x:(old[0].x+old[1].x)/2-rect.left,y:(old[0].y+old[1].y)/2-rect.top},b={x:(next[0].x+next[1].x)/2-rect.left,y:(next[0].y+next[1].y)/2-rect.top};const beforeDistance=Math.hypot(old[0].x-old[1].x,old[0].y-old[1].y),distance=Math.hypot(next[0].x-next[1].x,next[0].y-next[1].y);const nextCamera=zoomCamera(camera.current,camera.current.z*distance/Math.max(1,beforeDistance),a);apply({...nextCamera,x:nextCamera.x+b.x-a.x,y:nextCamera.y+b.y-a.y})}
    else if(pointers.current.size===1&&dragged.current)apply({...camera.current,x:camera.current.x+e.clientX-previous.x,y:camera.current.y+e.clientY-previous.y});}}
   onPointerUp={e=>finishPointer(e.pointerId)} onPointerCancel={e=>finishPointer(e.pointerId)} onClickCapture={e=>{if(e.detail>0&&dragged.current){e.preventDefault();e.stopPropagation()}}}
   onKeyDown={e=>{const delta:Record<string,NetworkPoint>={ArrowUp:{x:0,y:65},ArrowDown:{x:0,y:-65},ArrowLeft:{x:65,y:0},ArrowRight:{x:-65,y:0}};if(delta[e.key]){e.preventDefault();apply({...camera.current,x:camera.current.x+delta[e.key].x,y:camera.current.y+delta[e.key].y})}else if(e.key==='+'||e.key==='='){e.preventDefault();zoom(1.15)}else if(e.key==='-'){e.preventDefault();zoom(1/1.15)}else if(e.key==='Home'){e.preventDefault();center()}}}>
   <div ref={world} className="network-world" style={{width:layout.width,height:layout.height}}>
    <svg className="network-wires" viewBox={`0 0 ${layout.width} ${layout.height}`} aria-hidden="true">{layout.links.map(link=>{const node=nodes.find(n=>n.id===link.to)!;return <path key={link.to} d={link.path} data-link-from={link.from} data-link-to={link.to} className={`network-wire branch-${link.to[0]} ${node.owned?'is-owned':node.affordable?'is-available':''}`}/>})}</svg>
    <div className="network-core" style={{left:layout.core.x,top:layout.core.y}} aria-hidden="true"><ResourceArt id="int"/><b>{kind==='int'?'INT':de?'AXIOM':'AXIOM'}</b></div>
    {layout.nodes.map(point=>{const node=nodes.find(n=>n.id===point.id)!;return <button key={node.id} id={`prestige-node-${node.id}`} data-network-node={node.id} data-branch={point.branch} data-node-state={node.owned?'owned':node.affordable?'affordable':'unaffordable'} className={`network-node ${node.owned?'owned':node.affordable?'available':''}`} style={{left:point.x,top:point.y}} aria-label={`${node.name}, ${node.owned?(de?'aktiv':'owned'):node.cost}${node.level!==undefined?`, Level ${node.level}`:''}`} onFocus={e=>{if(e.currentTarget.matches(':focus-visible'))center(point)}} onClick={()=>onSelect(node.id)}>
     <span className="network-node-art"><ProgressionNodeArt id={node.id}/>{node.owned&&<i aria-hidden="true">✓</i>}</span><b>{node.name}</b><small>{node.level!==undefined?`Lv ${node.level} · `:''}{node.owned?(de?'Aktiv':'Owned'):node.cost}</small>
    </button>})}
   </div>
   <span className="network-gesture-hint" aria-hidden="true">{de?'Ziehen · Zwei Finger zum Zoomen':'Drag · Pinch to zoom'}</span>
  </div>
  <p className="network-purchase-note">{de?`Verbindungen zeigen Bereiche. Kauf nur nach ${kind==='int'?'INT':'Axiom'}-Preis.`:`Connections show branches. Purchases need only ${kind==='int'?'INT':'Axioms'}.`}</p>
 </section>;
}
