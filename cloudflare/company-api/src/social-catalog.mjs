// Static, public catalog only. No personal progress or claims accepted from Unity.
export const BADGE_FAMILIES=Object.freeze([
 {id:'company-founder',name:'Company Founder',source:'Create a Company',tiers:[1]},
 {id:'company-contributor',name:'Research Contributor',source:'Server-verified RP contribution',tiers:[1000,10000,50000]},
 {id:'company-trader',name:'Exchange Expert',source:'Completed verified trades',tiers:[1,10,100]},
 {id:'prestige',name:'Prestige Veteran',source:'Personal game achievements: secure sync pending',tiers:[1,2,3]},
 {id:'challenge',name:'Challenge Master',source:'Personal game challenges: secure sync pending',tiers:[1,2,3]},
 {id:'achievement',name:'Achievement Hunter',source:'Personal game achievements: secure sync pending',tiers:[1,2,3]},
 {id:'hardware',name:'Hardware Pioneer',source:'Personal game milestones: secure sync pending',tiers:[1,2,3]}
]);
export const TIERS=Object.freeze({1:'bronze',2:'silver',3:'gold'});
export const PROFILE_FRAMES=Object.freeze([
 {id:'basic',rarity:'common',acquire:'free',gemCost:0},
 {id:'founder',rarity:'uncommon',acquire:'company-founder',gemCost:null},
 {id:'bronze-lab',rarity:'rare',acquire:'company-contributor-1000rp',gemCost:null},
 {id:'silver-lab',rarity:'epic',acquire:'company-contributor-10000rp',gemCost:null},
 {id:'gold-lab',rarity:'legendary',acquire:'company-contributor-50000rp',gemCost:null},
 {id:'neon',rarity:'rare',acquire:'gems',gemCost:60},
 {id:'quantum',rarity:'epic',acquire:'gems',gemCost:150},
 {id:'singularity',rarity:'mythic',acquire:'limited-event',gemCost:null}
]);
export const PRIVACY_KEYS=Object.freeze(['badges','playtime','maxCompute','prestiges','int','rank']);
export const SOCIAL_ROLES=Object.freeze(['ceo','executive','manager','member']);

export function validatePrivacy(input) {
 if(!input||typeof input!=='object'||Array.isArray(input))throw new RangeError('Invalid privacy settings');
 if(Object.keys(input).some(k=>!PRIVACY_KEYS.includes(k)))throw new RangeError('Unknown privacy setting');
 if(Object.values(input).some(x=>typeof x!=='boolean'))throw new RangeError('Privacy settings must be booleans');
 return input;
}
export function validateShowcase(badges){
 if(!Array.isArray(badges)||badges.length>3)throw new RangeError('Only three showcase badges');
 const keys=new Set();
 for(const item of badges){
  if(!item||!BADGE_FAMILIES.some(f=>f.id===item.family&&f.tiers.length>=item.tier)||!Number.isInteger(item.tier)||item.tier<1||item.tier>3)throw new RangeError('Invalid badge');
  const key=item.family+':'+item.tier;
  if(keys.has(key))throw new RangeError('Duplicate badge');keys.add(key);
 }
 return badges;
}
export function maySetRole(actorRole,targetRole,newRole){
 if(targetRole==='ceo'||targetRole===newRole||!['executive','manager','member'].includes(newRole))return false;
 if(actorRole==='ceo')return true;
 return actorRole==='executive'&&['manager','member'].includes(targetRole)&&['manager','member'].includes(newRole);
}
export function mayKick(actorRole,targetRole){
 if(targetRole==='ceo')return false;
 return actorRole==='ceo'||actorRole==='executive'&&['manager','member'].includes(targetRole)||
        actorRole==='manager'&&targetRole==='member';
}
export function validateTradePart(part){
 if(!part||!['component','item','blueprint'].includes(part.kind)||
    typeof part.assetId!=='string'||!/^[A-Za-z0-9_-]{2,72}$/.test(part.assetId)||
    !Number.isInteger(part.quantity)||part.quantity<1||part.quantity>100||
    part.kind==='item'&&part.quantity!==1)throw new RangeError('Invalid asset');
 return {kind:part.kind,assetId:part.assetId,quantity:part.quantity};
}
