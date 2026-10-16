import {completeCommerceReward,commerceBlocked} from './commerce';
import {addCreditsScientific,creditRateScientific} from './economy';
import {completeShopVideo} from './shop';
import {rewardCapsuleVideo} from './capsuleMachine';
import { BALANCE, dayKey, GameState, grantComponents } from './economy';
import { addEvent, addMetrics } from './telemetry';
export type AdOffer=keyof typeof BALANCE.adLimits;export type AdResult='success'|'cancel'|'error';
export interface RewardedAdProvider{readonly available?:boolean;show(offer:AdOffer,transactionId:string):Promise<AdResult>}
export const unavailableRewardedAdProvider:RewardedAdProvider={available:false,show:async()=> 'error'};
export class MockAdProvider implements RewardedAdProvider{readonly available=true;constructor(private result:AdResult='success'){}show(){return Promise.resolve(this.result)}}
export function rewardAd(s:GameState,offer:AdOffer,tx:string,result:AdResult,now:number){if(commerceBlocked(s))return s;if(offer==='gems'||offer==='research'||offer==='creditDrop'&&s.commerce?.pending?.id===tx)return completeCommerceReward(s,tx,result);if(offer==='shopChest')return completeShopVideo(s,tx,result);if(offer==='capsule')return rewardCapsuleVideo(s,tx,result,now);if(result!=='success'||s.ads.transactions.includes(tx)||(offer==='components'&&!s.prestigeCount))return s;const day=dayKey(now),ads=s.ads.day===day?s.ads:{day,counts:{},transactions:s.ads.transactions};if((ads.counts[offer]??0)>=BALANCE.adLimits[offer])return s;let n={...s,ads:{...ads,counts:{...ads.counts,[offer]:(ads.counts[offer]??0)+1},transactions:[...ads.transactions,tx]}};if(offer==='creditBoost')n.creditBoostUntil=Math.max(now,n.creditBoostUntil)+1800000;if(offer==='components')n=addEvent(grantComponents(n,{circuits:2}),'component-found',now,{source:'rewarded-ad-test',component:'circuits',amount:2});if(offer==='creditDrop'){const gain=creditRateScientific(n.hardware,n.level,n,now,false).multiplyNumber(BALANCE.commerce.droneSeconds);n=addMetrics(addCreditsScientific(n,gain,false,false),now,{other:gain.toNumber()});}return n;}
