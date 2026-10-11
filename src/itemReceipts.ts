import type {GameState,Item} from './economy';
export type ItemReceiptGroup={item:Item;count:number};
export function receivedItems(before:GameState,after:GameState){if(before.inventory===after.inventory)return [];if(!!before.challengeSession!==!!after.challengeSession)return [];const previous=new Map(before.inventory.map(item=>[item.id,item]));return after.inventory.filter(item=>{const old=previous.get(item.id);return !old||old.rarity!==item.rarity||old.level!==item.level||(old.forge??0)!==(item.forge??0);});}
/** Bounded visual groups. Totals/completion counters remain authoritative beyond this display. */
export function mergeItemBundles(...sources:ItemReceiptGroup[][]){const groups:ItemReceiptGroup[]=[];for(const source of sources)for(const g of source){const same=groups.find(old=>old.item.type===g.item.type&&old.item.rarity===g.item.rarity&&old.item.level===g.item.level&&(old.item.forge??0)===(g.item.forge??0));if(same)same.count+=g.count;else if(groups.length<100)groups.push({...g});}return groups;}
export function bundleItems(items:Item[]){return mergeItemBundles(items.map(item=>({item,count:1})));}
