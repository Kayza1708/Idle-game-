import { BALANCE, ComponentId, equippedBonus, deepPrestigeBonus, ExperimentId, ExperimentLength, GameState, grantComponents, hasNode, validEconomyValues, dataRate, dataAffordability, formatScientific, exactEconomyValue, spendScientificResources } from './economy';
import {ScientificNumber} from './scientificNumber';
import { randomItem } from './inventory';
import { addEvent } from './telemetry';

export const experimentNames:Record<ExperimentId,string>={hardware:'Hardwareanalyse',architecture:'Architekturstudie',artifact:'Artefaktsuche'};
export function experimentSpeed(s:GameState){return 1+(hasNode(s,'labLink',1)?.1:0)+(hasNode(s,'labLink',3)?.2:0)+(s.breakthroughs.includes('planning')?.2:0)+equippedBonus(s,'experiment')+deepPrestigeBonus(s,'analysis')+s.researchLevels.labAutomation*BALANCE.repeatableResearch.labAutomation.effectPerLevel;}
export const experimentDuration=(type:ExperimentId,length:ExperimentLength)=>length==='intro'?0:BALANCE.analysisCosts[type][length].duration;
export function analysisCost(type:ExperimentId,length:Exclude<ExperimentLength,'intro'>){return BALANCE.analysisCosts[type][length]}
export function analysisAffordability(s:GameState,type:ExperimentId,length:Exclude<ExperimentLength,'intro'>){const cost=analysisCost(type,length),resources=dataAffordability(s,cost.data);return{...resources,cost,balance:{data:s.data},missing:{data:resources.missing},secondsToData:resources.secondsToAfford,duration:experimentDuration(type,length)/experimentSpeed(s)};}

export function analysisDropTable(s:GameState,type:ExperimentId){
 const source=BALANCE.componentSources[type],total=Object.values(source).reduce((n,v)=>n+v,0),findBonus=1+(hasNode(s,'analysis3',1)?.30:hasNode(s,'analysis2',1)?.20:hasNode(s,'analysis1',1)?.10:0)+s.researchLevels.materialAnalysis*BALANCE.repeatableResearch.materialAnalysis.effectPerLevel;
 return (Object.entries(source) as [ComponentId,number][]).map(([id,weight])=>({id,weight,chance:weight/total,findBonus,source:BALANCE.components[id].source}));
}
export function analysisBlockReason(s:GameState,type:ExperimentId,length:Exclude<ExperimentLength,'intro'>,language:'de'|'en'='de'){
  const cost=analysisCost(type,length);
  if(!validEconomyValues(s,['credits','data']))return language==='de'?'Ungültige Ressourcenwerte.':'Invalid resource values.';
  if(!s.discovered.includes('sbc'))return language==='de'?'Einplatinencomputer noch nicht entdeckt.':'Single-board computer not discovered yet.';
  if(s.experiments.active)return language==='de'?`Analyseslot belegt durch ${experimentNames[s.experiments.active.type]}.`:`Analysis slot occupied by ${experimentNames[s.experiments.active.type]}.`;
  const dataCost=ScientificNumber.from(cost.data);
  if(exactEconomyValue(s,'data').compare(dataCost)<0)return language==='de'?`${formatScientific(analysisAffordability(s,type,length).missingExact,1)} Daten fehlen.`:`${formatScientific(analysisAffordability(s,type,length).missingExact,1)} Data missing.`;
  return null;
}
/** Split accumulated fractional rewards without losing values infinitesimally below an integer. */
export function splitMaterialReward(value:number){
  const nearest=Math.round(value),tolerance=Number.EPSILON*Math.max(1,Math.abs(value))*16;
  const normalized=Math.abs(value-nearest)<=tolerance?nearest:value,whole=Math.floor(normalized);
  return {whole,remainder:normalized-whole};
}
function componentGrant(_s:GameState,type:ExperimentId,count:number,rng=Math.random){const source=BALANCE.componentSources[type],entries=Object.entries(source) as [ComponentId,number][],total=entries.reduce((n,[,w])=>n+w,0),grant:Partial<Record<ComponentId,number>>={};for(let i=0;i<count;i++){let roll=rng()*total,id=entries[entries.length-1][0];for(const [candidate,w] of entries){roll-=w;if(roll<=0){id=candidate;break}}grant[id]=(grant[id]??0)+1;}return grant;}
export function guaranteeRare(found:Partial<Record<ComponentId,number>>){
  const hasRare=(Object.keys(BALANCE.components) as ComponentId[]).some(id=>!['häufig','ungewöhnlich'].includes(BALANCE.components[id].rarity)&&(found[id]??0)>0);
  if(!hasRare)found.graphene=(found.graphene??0)+1;
}
export const analysisGuaranteesRare=(s:GameState)=>hasNode(s,'analysis3',1);
const start=(s:GameState,type:ExperimentId,now:number,length:ExperimentLength)=>{const preview=length==='intro'?null:analysisAffordability(s,type,length),durationSeconds=preview?.duration??0,cost=preview?.cost??{data:0},dataCost=ScientificNumber.from(cost.data),paid=spendScientificResources(s,ScientificNumber.zero(),dataCost);if(paid===s)return s;return addEvent({...paid,experiments:{...s.experiments,lastResult:null,active:{id:length==='intro'?'intro':`exp-${s.nextId}`,type,length,startedAt:now,endsAt:now+durationSeconds*1000,durationSeconds,creditCost:0,dataCost:cost.data}},nextId:s.nextId+1},'experiment-start',now,{id:length==='intro'?'intro':`exp-${s.nextId}`,type,length,creditCost:0,dataCost:cost.data,durationSeconds,startedAt:now,endsAt:now+durationSeconds*1000});};
export function queueExperiment(s:GameState,type:ExperimentId,now:number,length:ExperimentLength='long'){
  if(length==='intro'||!validEconomyValues(s,['credits','data']))return s; // removed legacy tutorial experiment; never start a new one
  const reason=analysisBlockReason(s,type,length);
  if(reason)return addEvent(s,'action-blocked',now,{action:'experiment-start',type,length,reason});
  return start(s,type,now,length);
}
export function runAnalysisPlanner(s:GameState,now=s.savedAt){if(!s.axiomUpgrades.includes('analysisPlanner')||!s.analysisPlanner.enabled||s.experiments.active||analysisBlockReason(s,s.analysisPlanner.type,s.analysisPlanner.length,'en'))return s;return queueExperiment(s,s.analysisPlanner.type,now,s.analysisPlanner.length);}
export function cancelExperiment(s:GameState,now=s.savedAt){const active=s.experiments.active;if(!active)return s;return addEvent({...s,experiments:{...s.experiments,active:null}},'experiment-cancel',now,{id:active.id,type:active.type,length:active.length,refundCredits:0,refundData:0});}
export function completeExperiment(s:GameState,now:number,rng=Math.random,mode:'active'|'offline'='active'):GameState{
  const active=s.experiments.active;if(!active||active.endsAt>now)return s;
  if(s.experiments.completedIds.includes(active.id))return {...s,experiments:{...s.experiments,active:null}};
  if(active.length==='intro'){
    // Migration safety for old saves: retire an already-running legacy intro without reward or progression gate.
    const next={...s,experiments:{...s.experiments,active:null,completedIds:[...s.experiments.completedIds,active.id]}};
    return addEvent(next,'experiment-complete',now,{id:active.id,type:active.type,length:active.length,legacy:true});
  }
  const reward=BALANCE.experimentRewards[active.type],scale=active.length==='short'?1/24:1,components=splitMaterialReward(reward.components*scale*(1+(hasNode(s,'analysis3',1)?.30:hasNode(s,'analysis2',1)?.20:hasNode(s,'analysis1',1)?.10:0)+s.researchLevels.materialAnalysis*BALANCE.repeatableResearch.materialAnalysis.effectPerLevel)+s.componentRemainder),research=splitMaterialReward(reward.research*scale+s.researchRemainder),blueprints=splitMaterialReward(reward.blueprints*scale*(1+s.researchLevels.blueprintAnalysis*BALANCE.repeatableResearch.blueprintAnalysis.effectPerLevel)+s.blueprintRemainder);
  const found=componentGrant(s,active.type,components.whole,rng);if(analysisGuaranteesRare(s))guaranteeRare(found);const result={id:active.id,type:active.type,length:active.length,at:now,mode,components:{...found},blueprintFragments:blueprints.whole,researchFragments:research.whole} as const;let next:GameState=grantComponents({...s,impulseRelayBlueprint:s.impulseRelayBlueprint||active.type==='hardware',componentRemainder:components.remainder,researchFragments:s.researchFragments+research.whole,researchRemainder:research.remainder,blueprintFragments:s.blueprintFragments+blueprints.whole,blueprintRemainder:blueprints.remainder,experiments:{...s.experiments,active:null,completedIds:[...s.experiments.completedIds,active.id],firstReward:true,lastResult:result}},found);
  if(reward.itemChance*scale&&rng()<reward.itemChance*scale)next=randomItem(next,rng);
  const queued=next.experiments.queue[0],type=queued??undefined,queue=next.experiments.queue.slice(queued?1:0);
  if(type)next=start({...next,experiments:{...next.experiments,queue}},type,active.endsAt,'long');
  const total=Object.values(found).reduce((sum,n)=>sum+(n??0),0);next=addEvent(next,'component-found',now,{source:`experiment:${active.type}`,jobId:active.id,mode,components:JSON.stringify(found),total});return addEvent(next,'experiment-complete',now,{id:active.id,type:active.type,length:active.length,mode,components:JSON.stringify(found),total,blueprintFragments:blueprints.whole,researchFragments:research.whole});
}
