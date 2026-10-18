import type {GameState} from './economy';
import {validatePlayerName} from './namePolicy';

/** The action boundary also validates; UI checks alone must never mutate a forbidden name. */
export function setPlayerName(s:GameState,input:string):GameState{
 const result=validatePlayerName(input);
 return result.ok&&result.name!==s.profile.playerName?{...s,profile:{...s.profile,playerName:result.name}}:s;
}
