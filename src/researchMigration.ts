import {newGame,newResearchKeys,type GameState,type ResearchId} from './economy';
import {researchAreas,researchNodeAccess,researchAreaFor,initialResearchIds} from './researchAreas';
/** Preserve old broad area access, never extend it to new keys. Do not infer missing historical bonuses. */
export function migrateResearchSave(old:GameState):GameState{
 if(!old||typeof old!=='object')return old;
 const base=newGame(old.savedAt),areas=Array.isArray(old.researchAreas)?old.researchAreas:[],nodes=Array.isArray(old.nodes)?old.nodes:[];
 const evidence=[...Object.entries(old.researchLevels??{}).filter(([,v])=>v>0).map(([id])=>id),...(old.completedResearch??[]),...(old.researchQueue??[]),...(old.researchLabs??[]).filter(Boolean).map(j=>j!.id)];
 const oldNodeForArea={data:'dataArchive1',architecture:'computeNet1',materials:'analysis1',automation:'labs1'};
 const inferred=Object.entries(oldNodeForArea).filter(([area,node])=>nodes.some(n=>n===node||n===node+':1')||evidence.some(id=>{if(initialResearchIds.includes(id as ResearchId))return false;const theme=researchAreaFor(id as ResearchId);return(theme==='model'?'architecture':theme)===area})).map(([area])=>area);
 const legacyAreas=Object.hasOwn(old,'researchAreas')?areas:inferred;
 const oldIds=Object.values(researchAreas).flatMap(a=>a.ids).filter(id=>!(newResearchKeys as readonly string[]).includes(id));
 const access=oldIds.filter(id=>{const area=researchAreaFor(id),legacyArea=area==='model'?'architecture':area;return initialResearchIds.includes(id)||!!legacyArea&&(legacyAreas.includes(legacyArea)||nodes.some(n=>n===(oldNodeForArea as Record<string,string>)[legacyArea]||n===(oldNodeForArea as Record<string,string>)[legacyArea]+':1'))||evidence.includes(id);});
 // A previously purchased stage node is direct evidence for its new projects, not a broad area grant.
 const keys=newResearchKeys.filter(id=>nodes.some(n=>n===researchNodeAccess[id]||n===researchNodeAccess[id]+':1'));
 return{...old,researchAreas:old.researchAreas??inferred as GameState['researchAreas'],researchAccessIds:old.researchAccessIds??[...new Set([...access,...keys])] as ResearchId[],researchRepeat:old.researchRepeat??base.researchRepeat,researchDirector:old.researchDirector??base.researchDirector,runTrainingStarted:old.runTrainingStarted??0,craftingRecycleRemainders:old.craftingRecycleRemainders??base.craftingRecycleRemainders,...(old.challengeSession?{challengeSession:{...old.challengeSession,main:migrateResearchSave(old.challengeSession.main)}}:{})};
}
