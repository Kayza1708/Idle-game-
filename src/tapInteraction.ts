import {BALANCE,exactEconomyValue,registerTap,tapCreditsScientific,type GameState} from './economy';
import type {ScientificNumber} from './scientificNumber';

export type TapReceipt={credits:ScientificNumber;at:number};
/** Preview the next eligible tap, never the temporary input cooldown. No RNG/state mutation. */
export function tapPreview(s:GameState){
 const nextAt=s.progression?.version===2&&s.progression.lastTap!==null?Math.max(s.savedAt,s.progression.lastTap+BALANCE.progression.tapGap):s.savedAt;
 return tapCreditsScientific(s,nextAt);
}
/** Settle once and return the exact credited amount for presentation, excluding passive tick income. */
export function settleTap(s:GameState,now:number):{state:GameState;receipt?:TapReceipt}{
 const state=registerTap(s,now);
 if(state.lifetime.taps===s.lifetime.taps)return{state};
 return{state,receipt:{credits:exactEconomyValue(state,'runCreditsEarned').subtract(exactEconomyValue(s,'runCreditsEarned')),at:now}};
}
