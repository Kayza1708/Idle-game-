import {useEffect,useRef,useState} from 'react';
import type {GameState} from './economy';
import {seasonLoot} from './seasonLoot';
import {ShopChestArt} from './ShopMarket';
import type {ShopReceipt} from './shop';
import {ComponentArt} from './GameArt';
import {ItemPortrait} from './ItemPresentation';
import {RewardReveal} from './RewardReveal';
import {componentText,itemText} from './gameplayI18n';
export function SeasonChestTray({s,act}:{s:GameState;act:(name:string,...args:any[])=>void}){
 const loot=seasonLoot(s),de=s.settings.language==='de',[receipt,setReceipt]=useState<ShopReceipt|null>(null),seen=useRef(s.shop.last?.id??0);
 useEffect(()=>{const r=s.shop.last;if(r&&r.id>seen.current&&r.offerId.startsWith('season-chest:'))setReceipt(structuredClone(r));seen.current=r?.id??0;},[s.shop.last?.id]);
 return <>{!!loot.pending.length&&<section className="season-chest-tray"><header><b>{de?'Deine Season-Kisten':'Your season chests'}</b><span>{loot.pending.length}</span></header><div>{loot.pending.map(c=><button key={c.id} onClick={()=>act('season-chest-open',c.id)}><ShopChestArt tier={c.tier}/><span>{c.tier}<small>{de?'Öffnen':'Open'} ›</small></span></button>)}</div></section>}{receipt&&<RewardReveal title={de?'Kiste geöffnet':'Chest opened'} closeLabel={de?'Weiter':'Continue'} effects={s.settings.effects} onClose={()=>setReceipt(null)} variant={`shop-reveal chest-${receipt.tier}`}>{receipt.item&&<div><ItemPortrait item={receipt.item}/><b>{itemText(receipt.item.type,s.settings.language)}</b></div>}{Object.entries(receipt.components).map(([id,n])=><div className="shop-reveal-material" key={id}><ComponentArt id={id as keyof GameState['componentInventory']}/><b>{componentText(id as keyof GameState['componentInventory'],s.settings.language).name}</b><strong>×{n}</strong></div>)}</RewardReveal>}</>;
}
