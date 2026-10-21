import type {GameState} from '../src/economy';import {unityAdState} from './unity-ads-wire';
export const unitySettings=(s:GameState)=>({schema:1,initialized:true,...s.settings,buyMode:String(s.settings.buyMode)});
export function unitySettingsState(s:GameState){const d={...unityAdState(s),settings:unitySettings(s)};if(s.challengeSession)d.challengeMain=unitySettingsState(s.challengeSession.main);return d;}
