import {useId} from 'react';

/** A viewport into an unchanged bitmap atlas; no extra DOM frame and no substitute vector artwork. */
export function RasterMotif({className,bounds,clip,source,atlasWidth,atlasHeight,artId,shopIcon}:{
 className:string;bounds:readonly[number,number,number,number];clip:string;source:string;
 atlasWidth:number;atlasHeight:number;artId?:string;shopIcon?:string;
}){
 const id=useId();
 return <svg className={className} data-art-id={artId} data-shop-icon={shopIcon} viewBox={bounds.join(' ')} preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
  <defs><clipPath id={id}><path d={clip}/></clipPath></defs>
  <image href={source} width={atlasWidth} height={atlasHeight} clipPath={`url(#${id})`}/>
 </svg>;
}
