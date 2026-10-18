import {BALANCE,type GameState} from './economy';
import {adFree,rewardQuote,commerceState} from './commerce';
import {ResourceArt} from './GameArt';
export function CoreVideoOffer({s,act,videoAvailable=false,videoBusy=false}:{s:GameState;act:(name:string,...args:any[])=>void;videoAvailable?:boolean;videoBusy?:boolean}){
 const q=rewardQuote(s,'gems'),de=s.settings.language==='de',count=commerceState(s).gemVideos??0,bonus=(count+1)%BALANCE.seasonV2.droneEvery===0;
 if(s.retention.activeRun||s.challengeSession)return null;
 return <aside className={`core-video-offer ${bonus?'is-bonus':''}`} aria-label={de?'Video-Belohnung':'Video reward'}>
 <button disabled={videoBusy||!q.allowed||(!videoAvailable&&!adFree(s))} onClick={()=>act('commerce-video','gems')} title={!videoAvailable&&!adFree(s)?(de?'Videos derzeit nicht verfügbar':'Videos currently unavailable'):de?'Freiwilliges Video ansehen':'Watch optional video'}><ResourceArt id="gems"/><span><b>+{q.amount.toNumber()}</b><small>{adFree(s)?(de?'Abholen':'Claim'):videoBusy?'…':'▶ VIDEO'}</small></span></button><small>{bonus?(de?'BONUSDROHNE':'BONUS DRONE'):`${count%BALANCE.seasonV2.droneEvery}/${BALANCE.seasonV2.droneEvery}`} · {q.remaining} {de?'übrig':'left'}</small>
 </aside>;
}
