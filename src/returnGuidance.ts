import {equipmentEligibility} from './inventory';
import {trainingPreview,trainingQueueUnlocked,researchQuote,type GameState,type ResearchId,type PrestigeUpgradeId} from './economy';
import {visibleResearchIds,nextResearchArea,nextResearchStage} from './researchAreas';
export type ReturnAction={kind:'boxes'|'equipment'|'training'|'queue'}|{kind:'research';id:ResearchId}|{kind:'unlock';node:PrestigeUpgradeId};
/** Current-state navigation only. Never claims, resets, starts jobs or chooses a build. */
export function returnGuidance(s:GameState):ReturnAction[]{
 if(s.retention.activeRun||s.challengeSession)return [];
 const actions:ReturnAction[]=[];
 if(s.bonusBoxes.pending.length)actions.push({kind:'boxes'});
 if(s.inventory.some(item=>{const q=equipmentEligibility(s,item.id);return q.allowed&&q.slot&&!s.equipped[q.slot]}))actions.push({kind:'equipment'});
 if(trainingQueueUnlocked(s)&&!s.trainingQueue.length)actions.push({kind:'queue'});
 else if(!s.activeTraining&&!s.trainingQueue.length&&(['quality','efficiency'] as const).some(track=>trainingPreview(s,track).allowed))actions.push({kind:'training'});
 const research=visibleResearchIds(s).find(id=>researchQuote(s,id)?.allowed);
 if(research)actions.push({kind:'research',id:research});
 else{const area=nextResearchArea(s),node=area?nextResearchStage(s,area):null;if(node&&s.prestigeCount>0)actions.push({kind:'unlock',node});}
 return actions.slice(0,2);
}
