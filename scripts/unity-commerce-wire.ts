import type {GameState} from '../src/economy';import {unityGemState} from './unity-gem-features-wire';
export const unityCommerce=(s:GameState)=>({schema:1,initialized:true,hasLast:!!s.commerce.last,last:s.commerce.last});
export function unityCommerceState(s:GameState){const d={...unityGemState(s),commerce:unityCommerce(s)};if(s.challengeSession)d.challengeMain={...d.challengeMain,commerce:unityCommerce(s.challengeSession.main)};return d;}
