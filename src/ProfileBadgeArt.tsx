import './profile-art.css';
import type {ProfileBadgeFamily} from './profileBadges';
type Metal='bronze'|'silver'|'gold';
export function ProfileBadgeArt({family,tier=1,size=54}:{family:ProfileBadgeFamily;tier?:number;size?:number}){
 const metal:Metal=tier>=3?'gold':tier===2?'silver':'bronze';
 return <img className="profile-badge-art"
   src={'/assets/game/profile/badges/'+family+'-'+metal+'.svg'}
   width={size} height={size} alt="" aria-hidden="true" loading="lazy" draggable={false}/>;
}
export function ProfileAvatarArt({size=76,frameId='basic'}:{size?:number;frameId?:string}){
 const available=['basic','founder','bronze-lab','silver-lab','gold-lab','neon','quantum','singularity'];
 const id=available.includes(frameId)?frameId:'basic';
 return <span className="profile-avatar-art" data-frame={id} style={{width:size,height:size}} aria-hidden="true">
    <span className="profile-avatar-core"><span className="profile-avatar-eye"/><span className="profile-avatar-eye"/></span>
    <img src={'/assets/game/profile/frames/'+id+'.svg'} width={size} height={size} alt="" draggable={false}/>
  </span>;
}
