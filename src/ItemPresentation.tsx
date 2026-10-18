import type {CSSProperties} from 'react';
import {MobileArt} from './MobileArt';
import {VectorIcon} from './VectorIcon';
import {ItemArt} from './GameArt';
import {itemTypes,type Item,type GameState} from './economy';
import {itemText,rarityText} from './gameplayI18n';
export const rarityColors={common:'#b7cad8',uncommon:'#35ef88',rare:'#36adff',epic:'#a965ff',legendary:'#ffba32',mythic:'#ff4c87'};
/** The same actual sprite, rarity treatment and family mark in every item surface. */
export function ItemPortrait({item,size='tile',count=1,level=true,surface='card',equipped=false}:{item:Item;size?:'mini'|'tile'|'hero';count?:number;level?:boolean;surface?:'card'|'inset';equipped?:boolean}){
 const family=itemTypes[item.type].slot;
 return <span className={`item-portrait portrait-${size} portrait-${item.rarity} portrait-${surface}`} data-item-rarity={item.rarity} data-item-family={family} style={{'--item-color':rarityColors[item.rarity]} as CSSProperties} aria-hidden="true"><span className="item-rarity-sweep"/><ItemArt type={item.type}/><span className={`item-family-mark family-${family}`}/>{level&&<span className="item-portrait-level">Lv {item.level}</span>}{count>1?<span className="item-portrait-count">×{count}</span>:equipped&&<span className="item-equipped-mark">✓</span>}</span>;
}
/** A physical socket owns its frame. Equipped art is inserted directly, without another card. */
export function ItemSocket({item,family,locked=false}:{item?:Item;family:'processor'|'core'|'research';locked?:boolean}){
 const shape=family==='processor'?'circle':family==='core'?'triangle':'square';
 return <span className={`item-socket socket-${shape} ${locked?'is-locked':''} ${item?'is-filled':''}`} data-item-rarity={item?.rarity} style={{'--item-color':item?rarityColors[item.rarity]:'#76cfc8'} as CSSProperties} aria-hidden="true"><MobileArt sprite={`socket-${shape}`} className="socket-art"/>{item?<ItemArt key={item.id} type={item.type}/>:<VectorIcon name={locked?'lock':'plus'}/>}<svg className="socket-rarity" viewBox="0 0 100 100" focusable="false">{shape==='circle'?<circle cx="50" cy="52" r="32"/>:shape==='triangle'?<path d="M50 22 79 78 21 78Z"/>:<path d="M25 22H75L81 28V75L75 81H25L19 75V28Z"/>}</svg>{item&&<span className="socket-level">Lv {item.level}</span>}</span>;
}
export function ItemIdentity({item,language,count=1}:{item:Item;language:GameState['settings']['language'];count?:number}){
 return <div className="item-identity"><span style={{color:rarityColors[item.rarity]}}>{rarityText(item.rarity,language)} · Lv {item.level}{(item.forge??0)>0?` · Forge ${item.forge}`:''}</span><h3>{itemText(item.type,language)}{count>1&&<b> ×{count}</b>}</h3></div>;
}
export function ItemHero({item,language,stats}:{item:Item;language:GameState['settings']['language'];stats?:string[]}){
 return <div className="item-hero" style={{'--item-color':rarityColors[item.rarity]} as CSSProperties}><ItemPortrait item={item} size="hero"/><ItemIdentity item={item} language={language}/>{stats&&<ul>{stats.map(line=><li key={line}>{line}</li>)}</ul>}</div>;
}
