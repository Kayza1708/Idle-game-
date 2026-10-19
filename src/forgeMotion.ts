import type {ItemActionEvent} from './itemActionEvents';
export const FORGE_MOTION={craft:{reveal:620,duration:1050},fusion:{reveal:850,duration:1350}} as const;
export type ForgeFlight={id:string;x:number;y:number;slot:number;retained:boolean};
/** Cosmetic coordinates for the actual paid receipt, never inventory or reward logic. */
export function forgeFlights(event:ItemActionEvent,inputOrder:readonly string[]=[]):ForgeFlight[]{
 if(event.kind==='fusion')return event.inputs.map((item,index)=>{const original=inputOrder.indexOf(item.id),slot=original>=0?original:index;return{id:item.id,x:[26,50,75][slot]??50,y:79,slot,retained:item.id===event.item.id}});
 return Object.entries(event.components).filter(([,amount])=>Number(amount)>0).slice(0,4).map(([id],index)=>({id,x:[15,85,20,80][index],y:[28,28,80,80][index],slot:index,retained:false}));
}
