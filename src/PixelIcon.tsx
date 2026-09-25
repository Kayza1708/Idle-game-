import type {ReactNode} from 'react';
export type PixelIconName='tap'|'credits'|'data'|'compute'|'hardware'|'research'|'training'|'analysis'|'components'|'craft'|'item'|'prestige'|'time'|'season'|'challenge'|'profile'|'gem';
const glyph:Record<PixelIconName,ReactNode>={tap:'↖',credits:'¢',data:'▤',compute:'▦',hardware:'▣',research:'⌬',training:'⌁',analysis:'◎',components:'⚙',craft:'⌁',item:'◇',prestige:'∞',time:'◷',season:'★',challenge:'!',profile:'☺',gem:'◆'};
export function PixelIcon({name,label}:{name:PixelIconName;label?:string}){return <span className={`pixel-icon pixel-icon-${name}`} role={label?'img':undefined} aria-label={label}>{glyph[name]}</span>}
