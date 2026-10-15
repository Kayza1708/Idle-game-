import type {CSSProperties} from 'react';
export type MobileSprite='chest-closed'|'chest-open'|'capsule-closed'|'capsule-open'|'socket-circle'|'socket-triangle'|'socket-square'|'prestige-hub';
const cells:Record<MobileSprite,[number,number]>={'chest-closed':[0,0],'chest-open':[1,0],'capsule-closed':[2,0],'capsule-open':[3,0],'socket-circle':[0,1],'socket-triangle':[1,1],'socket-square':[2,1],'prestige-hub':[3,1]};
export function MobileArt({sprite,className=''}:{sprite:MobileSprite;className?:string}){const [x,y]=cells[sprite];return <span className={`mobile-sprite ${className}`} data-mobile-sprite={sprite} aria-hidden="true" style={{backgroundPosition:`${x*100/3}% ${y*100}%`} as CSSProperties}/>}
