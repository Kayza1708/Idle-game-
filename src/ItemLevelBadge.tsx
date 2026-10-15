import {useEffect,useRef,useState} from 'react';
export function ItemLevelBadge({id,level,effects}:{id:string;level:number;effects:boolean}){
 const previous=useRef({id,level}),[pulse,setPulse]=useState(false);
 useEffect(()=>{const old=previous.current;previous.current={id,level};if(old.id!==id||level<=old.level){setPulse(false);return}setPulse(true);const timer=window.setTimeout(()=>setPulse(false),900);return()=>window.clearTimeout(timer)},[id,level]);
 return <strong className={`item-level-badge ${pulse&&effects?'level-up':''}`} aria-live="polite">Lv {level}<span>/69</span></strong>;
}
