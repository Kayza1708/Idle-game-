import type {CSSProperties} from 'react';
export const shopIconCells={profile:[0,0],season:[1,0],missions:[2,0],challenge:[3,0],trophy:[0,1],settings:[1,1],lab:[2,1],offline:[3,1],researchBoost:[0,2],craftBoost:[1,2],trainingBoost:[2,2],gem:[3,2]} as const;
export type ShopIconName=keyof typeof shopIconCells;
export function ShopIcon({name,className=''}:{name:ShopIconName;className?:string}){const [x,y]=shopIconCells[name];return <span className={`shop-pixel-icon ${className}`} data-shop-icon={name} aria-hidden="true" style={{backgroundPosition:`${x*100/3}% ${y*50}%`} as CSSProperties}/>}
export const gemBundleCount=(gems:number)=>gems<=100?1:gems<=550?2:3;
export function GemBundleArt({gems}:{gems:number}){const count=gemBundleCount(gems);return <div className={`market-gem-stack gem-count-${count}`} data-gem-count={count} aria-hidden="true">{Array.from({length:count},(_,i)=><ShopIcon name="gem" key={i}/>)}</div>}
