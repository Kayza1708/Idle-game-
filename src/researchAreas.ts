import {BALANCE,hasNode,type GameState,type ResearchId,type PrestigeUpgradeId} from './economy';
export const initialResearchIds:ResearchId[]=['dataGeneration','modelArchitecture','blueprints'];
export const researchAreas={
 data:{node:'dataArchive1',ids:['dataGeneration','syntheticData','dataFlywheel','dataPipeline']},
 architecture:{node:'computeNet1',ids:['computeOptimization','userScaling','hardwareIntegration','parallelArchitecture','hardwareCoDesign','distributedInference']},
 model:{node:'computeNet1',ids:['modelArchitecture','commercialization','alignment','networkEffects','recursiveLearning','tapAmplification','modelTransfer']},
 materials:{node:'analysis1',ids:['blueprints','materialAnalysis','blueprintAnalysis','dropProtocols','materialRecycling']},
 automation:{node:'labs1',ids:['operations','labAutomation','autonomousScience','researchScheduling']},
} as const;
export type ResearchAreaId=keyof typeof researchAreas;
export const researchAreaOrder:ResearchAreaId[]=['data','architecture','model','materials','automation'];
export const researchNodeAccess:Partial<Record<ResearchId,PrestigeUpgradeId>>={syntheticData:'dataArchive1',dataFlywheel:'dataArchive2',dataPipeline:'dataArchive4',computeOptimization:'computeNet1',userScaling:'computeNet1',hardwareIntegration:'computeNet2',parallelArchitecture:'computeNet2',hardwareCoDesign:'computeNet4',distributedInference:'computeNet4',commercialization:'computeNet1',alignment:'computeNet1',networkEffects:'computeNet2',recursiveLearning:'computeNet2',tapAmplification:'computeNet4',modelTransfer:'computeNet4',materialAnalysis:'analysis1',blueprintAnalysis:'analysis2',dropProtocols:'analysis2',materialRecycling:'analysis4',operations:'labs1',labAutomation:'labs1',autonomousScience:'labs2',researchScheduling:'labs4'};
export const researchAreaFor=(id:ResearchId)=>Object.entries(researchAreas).find(([,a])=>(a.ids as readonly string[]).includes(id))?.[0] as keyof typeof researchAreas|undefined;
/** Acquisition is persisted on node purchase; live nodes also prove access in prepared domain states. */
export const researchAccess=(s:GameState,id:ResearchId)=>{const area=researchAreaFor(id),node=researchNodeAccess[id]??null;return{area:area??null,node,allowed:!!area&&(initialResearchIds.includes(id)||(s.researchAccessIds??[]).includes(id)||!!node&&hasNode(s,node,1))};};
export const visibleResearchIds=(s:GameState)=>[...initialResearchIds,...(Object.values(researchAreas).flatMap(a=>a.ids) as ResearchId[]).filter(id=>!initialResearchIds.includes(id))].filter(id=>researchAccess(s,id).allowed);
export const nextResearchStage=(s:GameState,area:ResearchAreaId)=>{const id=researchAreas[area].ids.find(id=>!researchAccess(s,id).allowed);return id?researchNodeAccess[id]??null:null;};
export const nextResearchArea=(s:GameState)=>researchAreaOrder.find(a=>nextResearchStage(s,a))??null;
export function unlockResearchAreaForNode(s:GameState,node:PrestigeUpgradeId){const ids=Object.entries(researchNodeAccess).filter(([,n])=>n===node).map(([id])=>id as ResearchId);if(!ids.length)return s;return{...s,researchAccessIds:[...new Set([...s.researchAccessIds,...ids])],researchAreas:[...new Set([...(s.researchAreas??[]),...ids.map(researchAreaFor).filter(a=>a) as ResearchAreaId[]])]};}
/** Legacy area metadata stays compatible. Project ownership is migrated before validation. */
export function migrateResearchAreas(s:GameState,_original:unknown):GameState{return s;}
export function assertResearchAreaCatalog(){const ids=Object.values(researchAreas).flatMap(a=>a.ids) as string[],catalog=[...Object.keys(BALANCE.researchProjects),...Object.keys(BALANCE.repeatableResearch)];if(new Set(ids).size!==ids.length||ids.length!==catalog.length||catalog.some(id=>!ids.includes(id)))throw Error('Research matrix must contain every ID exactly once');}

export const preservedResearchAccess=(s:GameState)=>[...new Set([...(s.researchAccessIds??[]),...Object.entries(researchNodeAccess).filter(([,node])=>!!node&&hasNode(s,node,1)).map(([id])=>id as ResearchId)])];
