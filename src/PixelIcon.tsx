import {VectorIcon,type VectorIconName} from './VectorIcon';
export type PixelIconName='tap'|'credits'|'data'|'compute'|'hardware'|'research'|'training'|'analysis'|'components'|'craft'|'item'|'prestige'|'time'|'season'|'challenge'|'profile'|'gem'|'box'|'lock'|'plus';
export function PixelIcon({name,label}:{name:PixelIconName;label?:string}){return <span className={`pixel-icon pixel-icon-${name}`} role={label?'img':undefined} aria-label={label} aria-hidden={label?undefined:true}><VectorIcon name={name satisfies VectorIconName}/></span>}
