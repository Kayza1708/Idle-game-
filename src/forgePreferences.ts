import {BALANCE,type GameState,type ItemTypeId,type ModuleId} from './economy';
import {blueprintQuote} from './blueprints';
export type ForgeSelection={kind:'item'|'module';id:ItemTypeId|ModuleId};
const key=(s:GameState)=>`ai-singularity.ui.forge.${s.telemetry.campaignId}.${s.retention.activeRun?.runId??'main'}`;
export function validForgeSelection(s:GameState,value:unknown):value is ForgeSelection{const v=value as ForgeSelection;return !!v&&(v.kind==='item'?Object.hasOwn(BALANCE.itemRecipes,v.id)&&!!blueprintQuote(s,v.id).accessible:v.kind==='module'&&Object.hasOwn(BALANCE.modules,v.id)&&s.completedResearch.includes('blueprints'));}
export function readForgeSelection(s:GameState):ForgeSelection|null{try{if(typeof localStorage==='undefined')return null;const value=JSON.parse(localStorage.getItem(key(s))??'null');return validForgeSelection(s,value)?value:null}catch{return null}}
export function rememberForgeSelection(s:GameState,selection:ForgeSelection){try{if(typeof localStorage!=='undefined'&&validForgeSelection(s,selection))localStorage.setItem(key(s),JSON.stringify(selection))}catch{/* UI preference never blocks a paid action. */}}
