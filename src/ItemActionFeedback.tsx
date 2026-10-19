import {useEffect,useRef,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import {ComponentArt} from './GameArt';
import {ItemIdentity,ItemPortrait,rarityColors} from './ItemPresentation';
import type {ItemActionEvent,ItemActionKind} from './itemActionEvents';
import type {GameState,ComponentId} from './economy';
import {componentText} from './gameplayI18n';
const actionCopy:Record<ItemActionKind,[string,string]>={craft:['Item hergestellt','Item crafted'],fusion:['Fusion abgeschlossen','Fusion complete'],upgrade:['Aufgewertet','Level up'],refine:['Veredelt','Forging complete'],recycle:['Recycelt','Recycled'],equip:['Ausgerüstet','Equipped'],unequip:['Abgelegt','Unequipped'],lock:['Geschützt','Protected'],unlock:['Schutz entfernt','Protection removed']};
/** Off-stage actions use a receipt, never a second fullscreen crafting room. */
export function ItemActionFeedback({event,language,effects,onClose}:{event:ItemActionEvent;language:GameState['settings']['language'];effects:boolean;onClose:()=>void}){
 const callback=useRef(onClose);callback.current=onClose;const de=language==='de';
 useEffect(()=>{const timer=window.setTimeout(()=>callback.current(),2600),hide=()=>{if(document.hidden)callback.current()};document.addEventListener('visibilitychange',hide);return()=>{clearTimeout(timer);document.removeEventListener('visibilitychange',hide)}},[]);
 const components=Object.entries(event.components).filter(([,n])=>Number(n)>0);
 return createPortal(<aside className={`item-action-toast action-${event.kind} ${effects?'':'motion-off'}`} data-item-action={event.kind} role="status" aria-live="polite" style={{'--item-color':rarityColors[event.item.rarity]} as CSSProperties}>
  <div className="item-toast-portrait"><ItemPortrait item={event.item} size="mini"/>{effects&&<i/>}</div><div><b>{actionCopy[event.kind][de?0:1]}</b><ItemIdentity item={event.item} language={language} count={event.count}/>{event.kind==='upgrade'&&event.before&&<strong className="item-change">Lv {event.before.level} → {event.item.level}</strong>}{event.kind==='refine'&&event.before&&<strong className="item-change">Forge {event.before.forge??0} → {event.item.forge??0}</strong>}{event.kind==='recycle'&&<div className="item-returned">{components.map(([id,n])=><span key={id} title={componentText(id as ComponentId,language).name}><ComponentArt id={id as ComponentId}/><b>+{n}</b></span>)}</div>}</div><button onClick={()=>callback.current()} aria-label={de?'Meldung schließen':'Dismiss notification'}>×</button>
 </aside>,document.body);
}
