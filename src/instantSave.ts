import type {GameState} from './economy';
import {settleLegacyItemOrdersInstant} from './inventory';
import {advanceFusion} from './progressionAutomation';
import {fabricationSpeed} from './progressionWork';
import {validSeasonLoot} from './seasonLoot';
export function assertSeasonExtensions(s:GameState,required=false){
 if((required&&s.progression?.version===2||s.seasonLoot!==undefined)&&!validSeasonLoot(s.seasonLoot))throw new TypeError('Ungültiges Season-Kisteninventar.');
 for(const season of [s.season,s.previousSeason].filter(Boolean)){const claims=season!.premiumClaimed;if(claims!==undefined&&(!Array.isArray(claims)||new Set(claims).size!==claims.length||claims.some(n=>!Number.isInteger(n)||n<1||n>50)))throw new TypeError('Ungültige Premium-Season-Belege.');}
 if(s.challengeSession)assertSeasonExtensions(s.challengeSession.main,required);
}
/** Only older envelopes cross this boundary. Paid item work settles; resources are never charged twice. */
export function migrateInstantSave(s:GameState):GameState{
 let n:GameState={...s,seasonLoot:s.seasonLoot??{nextId:1,pending:[]}};
 if(n.progression?.version===2){n=settleLegacyItemOrdersInstant(n);const f=n.progression.fusion;if(f)n=advanceFusion(n,Math.max(0,f.required-f.done)/fabricationSpeed(n)+1);}
 if(n.challengeSession)n={...n,challengeSession:{...n.challengeSession,main:migrateInstantSave(n.challengeSession.main)}};
 return n;
}
