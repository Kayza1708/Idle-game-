import {useEffect,useRef,type ReactNode} from 'react';
import {createPortal} from 'react-dom';

export function MobileDetailSheet({title,onClose,art,children,action}:{title:string;onClose:()=>void;art?:ReactNode;children:ReactNode;action?:ReactNode}){
 const close=useRef<HTMLButtonElement>(null);
 useEffect(()=>{const overflow=document.body.style.overflow;document.body.style.overflow='hidden';close.current?.focus();const key=(event:KeyboardEvent)=>event.key==='Escape'&&onClose();window.addEventListener('keydown',key);return()=>{document.body.style.overflow=overflow;window.removeEventListener('keydown',key)}},[onClose]);
 return createPortal(<div className="mobile-sheet-backdrop" onPointerDown={event=>event.target===event.currentTarget&&onClose()}><section className="mobile-detail-sheet" role="dialog" aria-modal="true" aria-labelledby="mobile-sheet-title"><header className="mobile-detail-sheet__header">{art}<h2 id="mobile-sheet-title">{title}</h2><button ref={close} aria-label="Schließen" onClick={onClose}>×</button></header><div className="mobile-detail-sheet__body">{children}</div><footer className="mobile-detail-sheet__footer">{action}</footer></section></div>,document.body);
}
