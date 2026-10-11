import {specialItemEffectText} from './specialItemText';
import {itemEffectProfile,itemEffectFor,deepPrestigeBonus,type GameState,type Item} from './economy';
import {ItemArt} from './GameArt';
import {itemText,rarityText,effectText} from './gameplayI18n';
/** Render the received instance, never a hypothetical higher-rarity reward. */
export function ItemReceipt({s,item,count=1}:{s:GameState;item:Item;count?:number}){const de=s.settings.language==='de',special=specialItemEffectText(s,item);return <article className="item-receipt"><ItemArt type={item.type}/><div><b>{itemText(item.type,s.settings.language)} ×{count}</b><p>{rarityText(item.rarity,s.settings.language)} · Lv {item.level} · Forge {item.forge??0}</p><small>{de?'Beitrag bei Ausrüstung im passenden Slot':'Contribution when equipped in the matching slot'}</small>{itemEffectProfile(item).filter(effect=>!['relay','int-yield'].includes(effect)).map(effect=><p key={effect}>{effectText(effect,s.settings.language)}: +{(itemEffectFor(s,item,effect)*(1+deepPrestigeBonus(s,'manufacturing'))*100).toFixed(2)} %</p>)}{special&&<p>{special}</p>}</div></article>}
