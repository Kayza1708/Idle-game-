import type {GameState} from './economy';
export const validIntro=(value:unknown):value is GameState['intro']=>!!value&&typeof value==='object'&&!Array.isArray(value)&&typeof (value as GameState['intro']).qualityUsed==='boolean'&&typeof (value as GameState['intro']).researchUsed==='boolean';
/** No refunds, no fabricated jobs. Existing progress conservatively consumes the relevant lesson. */
export function migrateIntro(value:any):any{
 if(!value||typeof value!=='object')return value;
 const reset=(value.prestigeCount??0)>0||(value.axiomResetCount??0)>0;
 const intro=value.intro??{qualityUsed:reset||(value.qualityLevel??0)>0||(value.lifetime?.trainingStarted??0)>0||!!value.activeTraining,researchUsed:reset||(value.researchLevels?.dataGeneration??0)>0||(value.lifetime?.researchStarted??0)>0||value.researchLabs?.some((lab:any)=>lab?.id==='dataGeneration')===true};
 return {...value,intro,...(value.challengeSession?{challengeSession:{...value.challengeSession,main:migrateIntro(value.challengeSession.main)}}:{})};
}
