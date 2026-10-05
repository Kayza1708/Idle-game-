import {useEffect,useRef,type ReactNode} from 'react';

export function MobileDetailSheet({title,onClose,art,children,action}:{title:string;onClose:()=>void;art?:ReactNode;children:ReactNode;action?:ReactNode}){
 const close=useRef<HTMLButtonElement>(null);
 useEffect(()=>{const overflow=document.body.style.overflow;document.body.style.overflow='hidden';close.current?.focus();const key=(event:KeyboardEvent)=>event.key==='Escape'&&onClose();window.addEventListener('keydown',key);return()=>{document.body.style.overflow=overflow;window.removeEventListener('keydown',key)}},[onClose]);
 return <div className="mobile-sheet-backdrop" onPointerDown={event=>event.target===event.currentTarget&&onClose()}><section className="mobile-detail-sheet" role="dialog" aria-modal="true" aria-labelledby="mobile-sheet-title"><header>{art}<h2 id="mobile-sheet-title">{title}</h2><button ref={close} aria-label="Schließen" onClick={onClose}>×</button></header><div className="mobile-sheet-body">{children}</div>{action&&<footer>{action}</footer>}</section></div>;
}
