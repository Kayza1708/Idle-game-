import {BALANCE,type GameState} from './economy';
import {grantRewardChest,type ChestTier} from './shop';
export type SeasonLoot={nextId:number;pending:{id:number;tier:ChestTier;seasonId:string}[]};
export const seasonLoot=(s:GameState):SeasonLoot=>s.seasonLoot??{nextId:1,pending:[]};
export function openSeasonChest(s:GameState,id:number){
 const loot=seasonLoot(s),chest=loot.pending.find(c=>c.id===id);if(!chest||s.retention.activeRun||s.challengeSession)return s;
 const n=grantRewardChest(s,chest.tier,`season-chest:${id}`);return n===s?s:{...n,seasonLoot:{...loot,pending:loot.pending.filter(c=>c.id!==id)}};
}
export function validSeasonLoot(x:unknown):x is SeasonLoot{
 const v=x as SeasonLoot;return !!v&&Number.isSafeInteger(v.nextId)&&v.nextId>0&&Array.isArray(v.pending)&&v.pending.length<=BALANCE.seasonV2.maxChests&&new Set(v.pending.map(c=>c.id)).size===v.pending.length&&v.pending.every(c=>Number.isSafeInteger(c.id)&&c.id>0&&c.id<v.nextId&&Object.hasOwn(BALANCE.shop.chests,c.tier)&&typeof c.seasonId==='string');
}
