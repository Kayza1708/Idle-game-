import {ItemArt} from './GameArt';
import {type ItemTypeId} from './economy';
import {RewardParticles} from './RewardReveal';
/** Mounted only after a successful inventory mutation, never on button press. */
export function ForgeVfx({kind,type}:{kind:'craft'|'fusion'|'recycle';type:ItemTypeId}){
 return <div className={`forge-vfx vfx-${kind}`} aria-hidden="true"><RewardParticles/>{kind==='fusion'&&[0,1,2].map(i=><div className={`fusion-traveler traveler-${i}`} key={i}><ItemArt type={type}/></div>)}<div className="forge-result-burst"/><div className="forge-result-ring"/></div>;
}
