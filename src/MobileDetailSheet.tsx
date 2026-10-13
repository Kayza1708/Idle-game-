import {useEffect,useRef,useId,type ReactNode} from 'react';
import {createPortal} from 'react-dom';

export function MobileDetailSheet({title,onClose,art,children,action,closeLabel='Schließen'}:{title:string;onClose:()=>void;art?:ReactNode;children:ReactNode;action?:ReactNode;closeLabel?:string}){
 const close=useRef<HTMLButtonElement>(null),dialog=useRef<HTMLElement>(null),heading=useId(),callback=useRef(onClose);callback.current=onClose;
 useEffect(()=>{
  const overflow=document.body.style.overflow,previous=document.activeElement as HTMLElement|null;document.body.style.overflow='hidden';close.current?.focus();
  const key=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){event.preventDefault();event.stopPropagation();callback.current();return}
   if(event.key!=='Tab')return;
   const items=[...(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href],[tabindex="0"]')??[])].filter(x=>x.getClientRects().length);
   const first=items[0],last=items.at(-1);if(!first||!last)return;
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  };
  document.addEventListener('keydown',key,true);
  return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',key,true);if(previous?.isConnected)previous.focus({preventScroll:true})};
 },[]);
 return createPortal(<div className="mobile-sheet-backdrop" onPointerDown={event=>event.target===event.currentTarget&&onClose()}><section ref={dialog} className="mobile-detail-sheet" role="dialog" aria-modal="true" aria-labelledby={heading}><header className="mobile-detail-sheet__header">{art}<h2 id={heading}>{title}</h2><button ref={close} aria-label={closeLabel} onClick={onClose}>×</button></header><div className="mobile-detail-sheet__body">{children}</div><footer className="mobile-detail-sheet__footer">{action}</footer></section></div>,document.body);
}
