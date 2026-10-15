import {ItemPortrait,ItemIdentity} from './ItemPresentation';
import type {GameState,Item} from './economy';
/** Compact received-instance identity; full effects live in the item detail sheet. */
export function ItemReceipt({s,item,count=1}:{s:GameState;item:Item;count?:number}){return <article className="item-receipt"><ItemPortrait item={item} size="mini" count={count}/><div><ItemIdentity item={item} language={s.settings.language} count={count}/></div></article>}
