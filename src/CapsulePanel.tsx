import {itemText,componentText} from './gameplayI18n';
import {useEffect,useRef,useState} from 'react';
import {BALANCE,type GameState,type ComponentId} from './economy';
import {capsuleQuote,capsuleMaterialTier} from './capsuleMachine';
import {ComponentArt,ItemArt,GemAmount} from './GameArt';
import {MobileDetailSheet} from './MobileDetailSheet';

/** Original code-native art. The pixels stay crisp at every device density. */
export function CapsuleMachineArt(){return <svg className="capsule-machine-art" viewBox="0 0 160 192" shapeRendering="crispEdges" aria-hidden="true">
 <path fill="#080f22" d="M36 8h88v8h8v8h8v64h-8v16H28V88h-8V24h8v-8h8z"/>
 <path fill="#b9ede2" d="M36 16h88v8h8v64h-8v8H36v-8h-8V24h8z"/>
 <path fill="#254457" d="M40 28h80v8h8v44h-8v8H40v-8h-8V36h8z"/>
 <path fill="#6da0a7" d="M40 24h80v4H40zm-8 12h4v32h-4z"/>
 <g className="machine-balls">{[[44,62,'#f6b74d'],[66,66,'#f48569'],[90,62,'#8fd4bb'],[108,70,'#be9aeb'],[52,44,'#85bfea'],[80,42,'#f6b74d'],[104,42,'#f48569'],[36,76,'#8fd4bb'],[78,78,'#85bfea']].map(([x,y,c],i)=><g key={i} transform={`translate(${x} ${y})`}><path fill={c as string} d="M4 0h12v4h4v12h-4v4H4v-4H0V4h4z"/><path fill="#eaf5e8" d="M4 4h8v4H4z"/><path fill="#172639" d="M0 10h20v3H0z"/></g>)}</g>
 <path fill="#080f22" d="M24 96h112v84h8v12H16v-12h8z"/>
 <path fill="#b85048" d="M32 104h96v72H32z"/><path fill="#ed8a65" d="M32 104h96v8H32zm0 8h8v56h-8z"/><path fill="#763643" d="M120 112h8v64H32v-8h88z"/>
 <path fill="#f7ddb0" d="M48 112h64v20H48z"/><path fill="#1b3043" d="M56 116h8v12h-8zm12 0h4v12h-4zm8 0h8v12h-8zm12 0h8v12h-8zm12 0h4v12h-4z"/>
 <g className="machine-crank"><path fill="#080f22" d="M56 136h48v24H56z"/><path fill="#ebc77d" d="M60 140h40v16H60z"/><path fill="#72505a" d="M64 148h32v4H64z"/><path fill="#fff0c1" d="M76 136h8v24h-8z"/></g>
 <path fill="#080f22" d="M56 164h48v16H56z"/><path fill="#35505c" d="M64 168h32v4H64z"/>
 <path fill="#e2ae6f" d="M24 180h112v4H24z"/>
 <g className="machine-capsule"><path fill="#80d4b4" d="M72 162h16v4h4v16h-4v4H72v-4h-4v-16h4z"/><path fill="#f5dca5" d="M68 174h24v8h-4v4H72v-4h-4z"/><path fill="#172639" d="M68 172h24v4H68z"/></g>
 </svg>}
export function CapsulePanel({s,act,videoAvailable=false,videoBusy=false}:{s:GameState;act:(name:string,...args:any[])=>void;videoAvailable?:boolean;videoBusy?:boolean}){
 const de=s.settings.language==='de',q=capsuleQuote(s),[details,setDetails]=useState(false),[spinning,setSpinning]=useState(false),lastSeen=useRef(s.capsuleMachine.draws),receipt=s.capsuleMachine.last;
 useEffect(()=>{if(lastSeen.current===s.capsuleMachine.draws)return;lastSeen.current=s.capsuleMachine.draws;if(!s.settings.effects||matchMedia('(prefers-reduced-motion: reduce)').matches)return;setSpinning(true);const timer=setTimeout(()=>setSpinning(false),1200);return()=>{clearTimeout(timer);setSpinning(false)}},[s.capsuleMachine.draws,s.settings.effects]);
 const locked=q.reason==='prestige',busy=spinning||videoBusy;
 return <section className={`capsule-panel ${spinning?'is-spinning':''}`} data-capsule-draws={s.capsuleMachine.draws}>
  <header><b>{de?'KI-KAPSELN':'AI CAPSULES'}</b><button aria-label={de?'Chancen anzeigen':'Show odds'} onClick={()=>setDetails(true)}>?</button></header>
  <div className="capsule-stage"><span className="machine-sign">{de?'BAUTEILE & ITEMS':'PARTS & ITEMS'}</span><CapsuleMachineArt/><span className="machine-odds">1% ITEM · 99% {de?'BAUTEILE':'PARTS'}</span></div>
  <div className={`capsule-result ${spinning?'is-hidden':''}`} role="status" aria-live="polite">{receipt?<>{receipt.kind==='item'&&receipt.item?<><ItemArt type={receipt.item.type}/><b>{de?'Item erhalten!':'Item received!'}</b><small>{itemText(receipt.item.type,s.settings.language)} · {receipt.rarity}</small></>:Object.entries(receipt.components).map(([id,n])=><span key={id} aria-label={`${n} ${componentText(id as ComponentId,s.settings.language).name}`} title={componentText(id as ComponentId,s.settings.language).name}><ComponentArt id={id as ComponentId}/><b>×{n}</b></span>)}</>:<small>{de?'Jede Kapsel enthält Beute.':'Every capsule contains loot.'}</small>}</div>
  {locked?<p className="capsule-locked">{de?'Nach deinem ersten Prestige':'After your first prestige'}</p>:q.reason?<p>{de?'Während einer Challenge deaktiviert':'Disabled during a challenge'}</p>:<div className="capsule-actions"><button data-capsule-gems disabled={!q.allowed||busy} onClick={()=>act('capsule-gem',q.next)}><span>{de?'Ziehen':'Draw'}</span><GemAmount value={q.cost}/></button><button data-capsule-video disabled={!videoAvailable||!q.videoAllowed||busy} onClick={()=>act('capsule-video')}><span aria-hidden="true">▶</span><span>{videoBusy?(de?'Video läuft…':'Playing…'):'Video'}</span><small>{q.videoRemaining}/{BALANCE.adLimits.capsule}</small></button></div>}
  {!locked&&!videoAvailable&&<small className="capsule-video-note">{de?'Video derzeit nicht verfügbar':'Video currently unavailable'}</small>}
  {details&&<MobileDetailSheet title={de?'Kapsel-Chancen':'Capsule odds'} closeLabel={de?'Schließen':'Close'} onClose={()=>setDetails(false)}><p>{de?'Jeder Zug: 1% Item, 99% Komponenten. Keine garantierten Items.':'Each draw: 1% item, 99% components. No guaranteed items.'}</p><p>{de?'Nur regulär freigeschaltete Beute.':'Only normally unlocked loot.'}</p><div className="capsule-odds-list">{q.materials.map(row=>{const tier=capsuleMaterialTier(row.chance),range=BALANCE.capsuleMachine.componentRanges[tier];return <span key={row.id} aria-label={componentText(row.id,s.settings.language).name} title={componentText(row.id,s.settings.language).name}><ComponentArt id={row.id}/><b>{range[0]}–{range[1]}</b><small>{(row.chance*99).toFixed(2)}%</small></span>})}</div><p>{de?'Item-Seltenheit innerhalb des 1%-Pools:':'Item rarity within the 1% pool:'}</p><div className="capsule-item-odds">{Object.entries(BALANCE.rarity).map(([rarity,value])=><span key={rarity}>{rarity} · {(value.chance*100).toFixed(2)}%</span>)}</div><p>{de?'Itemtypen im verfügbaren Pool haben die gleiche Chance.':'Available item types have equal chances.'}</p></MobileDetailSheet>}
 </section>;
}
