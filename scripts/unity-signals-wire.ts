import {type GameState} from '../src/economy';import {unitySeasonState} from './unity-seasons-wire';
export const unitySignals=(s:GameState)=>({schema:1,initialized:true,progress:s.worldDropProgress??0,visible:s.lootDrops.map(d=>({...d,hasRewardFactor:d.rewardFactor!==undefined,rewardFactor:d.rewardFactor??0,variant:['coin','cache','core'].indexOf(d.variant??'coin')}))});
export function unitySignalState(s:GameState){const d={...unitySeasonState(s),signals:unitySignals(s)};if(s.challengeSession)d.challengeMain={...d.challengeMain,signals:unitySignals(s.challengeSession.main)};return d;}
