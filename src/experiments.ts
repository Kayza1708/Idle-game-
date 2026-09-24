import { BALANCE, ExperimentId, ExperimentLength, GameState, hasNode } from './economy';
import { createItem, randomItem } from './inventory';

export const experimentNames:Record<ExperimentId,string>={hardware:'Hardwareanalyse',architecture:'Architekturstudie',artifact:'Artefaktsuche'};
export function experimentSpeed(s:GameState){return 1+(hasNode(s,'labLink',1)?.1:0)+(hasNode(s,'labLink',3)?.2:0)+(s.breakthroughs.includes('planning')?.2:0);}
export const experimentDuration=(length:ExperimentLength)=>length==='intro'?BALANCE.introExperimentSeconds:length==='short'?BALANCE.shortExperimentSeconds:BALANCE.experimentSeconds;
/** Split accumulated fractional rewards without losing values infinitesimally below an integer. */
export function splitMaterialReward(value:number){
  const nearest=Math.round(value),tolerance=Number.EPSILON*Math.max(1,Math.abs(value))*16;
  const normalized=Math.abs(value-nearest)<=tolerance?nearest:value,whole=Math.floor(normalized);
  return {whole,remainder:normalized-whole};
}
const start=(s:GameState,type:ExperimentId,now:number,length:ExperimentLength)=>({...s,experiments:{...s.experiments,active:{id:length==='intro'?'intro':`exp-${s.nextId}`,type,length,startedAt:now,endsAt:now+experimentDuration(length)*1000/experimentSpeed(s)}},nextId:s.nextId+1});
export function queueExperiment(s:GameState,type:ExperimentId,now:number,length:ExperimentLength='long'){
  if(length==='intro'){if(s.onboarding.completed.includes('intro-experiment')||s.experiments.active)return s;return start(s,type,now,length);}
  const cap=1+(hasNode(s,'autoRoute',1)?1:0)+(hasNode(s,'autoRoute',2)?1:0);
  if(!s.discovered.includes('sbc')||s.experiments.queue.length+(s.experiments.active?1:0)>=cap)return s;
  return s.experiments.active?{...s,experiments:{...s.experiments,queue:[...s.experiments.queue,type]}}:start(s,type,now,length);
}
export function completeExperiment(s:GameState,now:number,rng=Math.random):GameState{
  const active=s.experiments.active;if(!active||active.endsAt>now||s.experiments.completedIds.includes(active.id))return s;
  if(active.length==='intro'){
    let next=createItem({...s,experiments:{...s.experiments,active:null,completedIds:[...s.experiments.completedIds,active.id],firstReward:true},onboarding:{...s.onboarding,completed:[...new Set([...s.onboarding.completed,'intro-experiment'])]}},'quantum-chip','common');
    return next;
  }
  const reward=BALANCE.experimentRewards[active.type],scale=active.length==='short'?1/24:1,components=splitMaterialReward(reward.components*scale*(1+(hasNode(s,'artifactBus',1)?.1:0))+s.componentRemainder),research=splitMaterialReward(reward.research*scale*(1+(hasNode(s,'labLink',2)?.1:0))+s.researchRemainder),blueprints=splitMaterialReward(reward.blueprints*scale+s.blueprintRemainder);
  let next:GameState={...s,components:s.components+components.whole,componentRemainder:components.remainder,researchFragments:s.researchFragments+research.whole,researchRemainder:research.remainder,blueprintFragments:s.blueprintFragments+blueprints.whole,blueprintRemainder:blueprints.remainder,experiments:{...s.experiments,active:null,completedIds:[...s.experiments.completedIds,active.id],firstReward:true}};
  if(reward.itemChance*scale&&rng()<reward.itemChance*scale)next=randomItem(next,rng);
  const queued=next.experiments.queue[0],type=queued??(hasNode(next,'autoRoute',3)?next.experiments.repeat??undefined:undefined),queue=next.experiments.queue.slice(queued?1:0);
  if(type)next=start({...next,experiments:{...next.experiments,queue}},type,active.endsAt,'long');
  return next;
}
