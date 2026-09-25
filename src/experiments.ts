import { BALANCE, ComponentId, equippedBonus, ExperimentId, ExperimentLength, GameState, grantComponents, hasNode, dataRate } from './economy';
import { createItem, randomItem } from './inventory';
import { addEvent } from './telemetry';

export const experimentNames:Record<ExperimentId,string>={hardware:'Hardwareanalyse',architecture:'Architekturstudie',artifact:'Artefaktsuche'};
export function experimentSpeed(s:GameState){return 1+(hasNode(s,'labLink',1)?.1:0)+(hasNode(s,'labLink',3)?.2:0)+(s.breakthroughs.includes('planning')?.2:0)+equippedBonus(s,'experiment')+s.researchLevels.labAutomation*BALANCE.repeatableResearch.labAutomation.effectPerLevel;}
export const experimentDuration=(length:ExperimentLength)=>length==='intro'?BALANCE.introExperimentSeconds:length==='short'?BALANCE.shortExperimentSeconds:BALANCE.experimentSeconds;
export function analysisCost(type:ExperimentId,length:Exclude<ExperimentLength,'intro'>){return BALANCE.analysisCosts[type][length]}
export function analysisAffordability(s:GameState,type:ExperimentId,length:Exclude<ExperimentLength,'intro'>){const cost=analysisCost(type,length),missingCredits=Math.max(0,cost.credits-s.credits),missingData=Math.max(0,cost.data-s.data),rate=dataRate(s);return{cost,balance:{credits:s.credits,data:s.data},missing:{credits:missingCredits,data:missingData},secondsToData:missingData<=0?0:rate>0?missingData/rate:Infinity};}
export function analysisBlockReason(s:GameState,type:ExperimentId,length:Exclude<ExperimentLength,'intro'>){
  const cost=analysisCost(type,length);
  if(!s.discovered.includes('sbc'))return 'Einplatinencomputer noch nicht entdeckt.';
  if(s.experiments.active)return `Analyseslot belegt durch ${experimentNames[s.experiments.active.type]}.`;
  if(s.credits<cost.credits)return `${Math.ceil(cost.credits-s.credits)} Credits fehlen.`;
  if(s.data<cost.data)return `${Math.ceil(cost.data-s.data)} Daten fehlen.`;
  return null;
}
/** Split accumulated fractional rewards without losing values infinitesimally below an integer. */
export function splitMaterialReward(value:number){
  const nearest=Math.round(value),tolerance=Number.EPSILON*Math.max(1,Math.abs(value))*16;
  const normalized=Math.abs(value-nearest)<=tolerance?nearest:value,whole=Math.floor(normalized);
  return {whole,remainder:normalized-whole};
}
function componentGrant(s:GameState,type:ExperimentId,count:number){const source=BALANCE.componentSources[type],sequence=(Object.entries(source) as [ComponentId,number][]).flatMap(([id,amount])=>Array(amount).fill(id) as ComponentId[]),prior=s.telemetry.recentEvents.filter(event=>event.type==='component-found'&&event.details.source===`experiment:${type}`).length,grant:Partial<Record<ComponentId,number>>={};for(let i=0;i<count;i++){const id=sequence[(prior+i)%sequence.length];grant[id]=(grant[id]??0)+1;}return grant;}
function guaranteeRare(found:Partial<Record<ComponentId,number>>,type:ExperimentId){if((found.graphene??0)+(found.nanotubes??0)+(found.quantumCores??0)>0)return;const id:ComponentId=type==='artifact'?'quantumCores':type==='architecture'?'graphene':'graphene';found[id]=(found[id]??0)+1;}
const start=(s:GameState,type:ExperimentId,now:number,length:ExperimentLength)=>{const durationSeconds=experimentDuration(length)/experimentSpeed(s),cost=length==='intro'?{credits:0,data:0}:analysisCost(type,length);return addEvent({...s,credits:s.credits-cost.credits,data:s.data-cost.data,experiments:{...s.experiments,active:{id:length==='intro'?'intro':`exp-${s.nextId}`,type,length,startedAt:now,endsAt:now+durationSeconds*1000,durationSeconds,creditCost:cost.credits,dataCost:cost.data}},nextId:s.nextId+1},'experiment-start',now,{type,length,creditCost:cost.credits,dataCost:cost.data,durationSeconds});};
export function queueExperiment(s:GameState,type:ExperimentId,now:number,length:ExperimentLength='long'){
  if(length==='intro'){if(s.onboarding.completed.includes('intro-experiment')||s.experiments.active)return s;return start(s,type,now,length);}
  const reason=analysisBlockReason(s,type,length);
  if(reason)return addEvent(s,'action-blocked',now,{action:'experiment-start',type,length,reason});
  return start(s,type,now,length);
}
export function cancelExperiment(s:GameState,now=s.savedAt){const active=s.experiments.active;if(!active)return s;return addEvent({...s,experiments:{...s.experiments,active:null}},'experiment-cancel',now,{id:active.id,type:active.type,length:active.length,refundCredits:0,refundData:0});}
export function completeExperiment(s:GameState,now:number,rng=Math.random,mode:'active'|'offline'='active'):GameState{
  const active=s.experiments.active;if(!active||active.endsAt>now)return s;
  if(s.experiments.completedIds.includes(active.id))return {...s,experiments:{...s.experiments,active:null}};
  if(active.length==='intro'){
    const next=createItem({...s,experiments:{...s.experiments,active:null,completedIds:[...s.experiments.completedIds,active.id],firstReward:true},onboarding:{...s.onboarding,completed:[...new Set([...s.onboarding.completed,'intro-experiment'])]}},'quantum-chip','common');
    return addEvent(next,'experiment-complete',now,{id:active.id,type:active.type,length:active.length});
  }
  const reward=BALANCE.experimentRewards[active.type],scale=active.length==='short'?1/24:1,components=splitMaterialReward(reward.components*scale*(1+(hasNode(s,'analysis3',1)?.30:hasNode(s,'analysis2',1)?.20:hasNode(s,'analysis1',1)?.10:0)+s.researchLevels.materialAnalysis*BALANCE.repeatableResearch.materialAnalysis.effectPerLevel)+s.componentRemainder),research=splitMaterialReward(reward.research*scale+s.researchRemainder),blueprints=splitMaterialReward(reward.blueprints*scale*(1+s.researchLevels.blueprintAnalysis*BALANCE.repeatableResearch.blueprintAnalysis.effectPerLevel)+s.blueprintRemainder);
  const found=componentGrant(s,active.type,components.whole);if(hasNode(s,'analysis3',1))guaranteeRare(found,active.type);let next:GameState=grantComponents({...s,componentRemainder:components.remainder,researchFragments:s.researchFragments+research.whole,researchRemainder:research.remainder,blueprintFragments:s.blueprintFragments+blueprints.whole,blueprintRemainder:blueprints.remainder,experiments:{...s.experiments,active:null,completedIds:[...s.experiments.completedIds,active.id],firstReward:true}},found);
  if(reward.itemChance*scale&&rng()<reward.itemChance*scale)next=randomItem(next,rng);
  const queued=next.experiments.queue[0],type=queued??undefined,queue=next.experiments.queue.slice(queued?1:0);
  if(type)next=start({...next,experiments:{...next.experiments,queue}},type,active.endsAt,'long');
  const total=Object.values(found).reduce((sum,n)=>sum+(n??0),0);next=addEvent(next,'component-found',now,{source:`experiment:${active.type}`,mode,components:JSON.stringify(found),total});return addEvent(next,'experiment-complete',now,{id:active.id,type:active.type,length:active.length,mode,components:JSON.stringify(found),total});
}
