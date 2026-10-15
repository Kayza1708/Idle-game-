import type {CSSProperties} from 'react';
import {ItemArt} from './GameArt';
import {itemTypes,type Item,type GameState} from './economy';
import {itemText,rarityText} from './gameplayI18n';
export const rarityColors={common:'#b4c9cf',uncommon:'#94e0b5',rare:'#8acbff',epic:'#d3a5ff',legendary:'#ffda8c',mythic:'#ff9cbd'};
/** The same actual sprite, rarity treatment and family mark in every item surface. */
export function ItemPortrait({item,size='tile',count=1,level=true}:{item:Item;size?:'mini'|'tile'|'hero';count?:number;level?:boolean}){
 const family=itemTypes[item.type].slot;
 return <span className={`item-portrait portrait-${size} portrait-${item.rarity}`} data-item-rarity={item.rarity} data-item-family={family} style={{'--item-color':rarityColors[item.rarity]} as CSSProperties} aria-hidden="true"><span className="item-portrait-well"/><ItemArt type={item.type}/><span className={`item-family-mark family-${family}`}/>{level&&<span className="item-portrait-level">{item.level}</span>}{count>1&&<span className="item-portrait-count">×{count}</span>}</span>;
}
export function ItemIdentity({item,language,count=1}:{item:Item;language:GameState['settings']['language'];count?:number}){
 return <div className="item-identity"><span style={{color:rarityColors[item.rarity]}}>{rarityText(item.rarity,language)} · Lv {item.level}{(item.forge??0)>0?` · Forge ${item.forge}`:''}</span><h3>{itemText(item.type,language)}{count>1&&<b> ×{count}</b>}</h3></div>;
}
export function ItemHero({item,language,stats}:{item:Item;language:GameState['settings']['language'];stats?:string[]}){
 return <div className="item-hero" style={{'--item-color':rarityColors[item.rarity]} as CSSProperties}><ItemPortrait item={item} size="hero"/><ItemIdentity item={item} language={language}/>{stats&&<ul>{stats.map(line=><li key={line}>{line}</li>)}</ul>}</div>;
}
