/** Historical jobs retain paid costs/end times and the old short reward contract. */
export function migrateAnalysisSave(value:any):any{
 if(!value||typeof value!=='object')return value;
 const active=value.experiments?.active;
 return {...value,...(value.experiments?{experiments:{...value.experiments,active:active?{...active,rewardFactor:active.length==='short'?1/24:1,contractVersion:1}:null}}:{}),...(value.challengeSession?{challengeSession:{...value.challengeSession,main:migrateAnalysisSave(value.challengeSession.main)}}:{})};
}
