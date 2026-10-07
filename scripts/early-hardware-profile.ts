import {BALANCE,startTraining,startResearchProject,hardwareIds,hardwarePurchasePreview,type GameState,type TrainingTrack,type HardwareId} from '../src/economy';
/** Shared genuine 8A/8B decision profile; no grants, claims or reset. */
export function prepareEarlyHardwareDecision(s:GameState,track:TrainingTrack,strategy:'A'|'B'){
   const trained=startTraining(s,track);if(trained!==s){s=trained;track=track==='quality'?'efficiency':'quality';}
   if(s.researchLevels.dataGeneration<2)s=startResearchProject(s,'dataGeneration');
   let pick:HardwareId|undefined;
   if(strategy==='A'){
    const quotes=hardwareIds.map(id=>hardwarePurchasePreview(s,id));
    pick=quotes.filter(q=>q.allowed&&!q.creditGain.isZero()).sort((a,b)=>b.creditGain.divide(b.cost).compare(a.creditGain.divide(a.cost))||hardwareIds.indexOf(a.id)-hardwareIds.indexOf(b.id))[0]?.id;
   }else{
    let index=hardwareIds.length-1;while(index>=0&&s.hardwareCounts[hardwareIds[index]]===0)index--;
    if(index<0)pick='calculator';else{const id=hardwareIds[index],threshold=[10,25,50].find(n=>n>s.hardwareCounts[id]),next=hardwareIds[index+1];
     if(!threshold)pick=next;else{const remaining=hardwarePurchasePreview(s,id,threshold-s.hardwareCounts[id]);pick=next&&hardwarePurchasePreview(s,next).cost.compare(remaining.cost)<0?next:id;}}
   }
 return{state:s,track,pick};
}
