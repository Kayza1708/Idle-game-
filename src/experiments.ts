import {usesItemV3,itemV3Has,itemAnalysisFactorV3} from './itemSystemV3';
import {choosePhaseModel} from './progressionAutomation';
import {hasProgressionNode,modelFactor,secondary} from './progression';
import {automaticCanSpendData} from './progressionWork';
import {automationFeatureUnlocked} from './economy';
import {materialTable,materialAnalysisContract,drawMaterials,materialFamily} from './materialEconomy';
import {experimentText} from './gameplayI18n';
import { BALANCE, researchModifiers, itemCombinationQuote, ComponentId, equippedBonus, deepPrestigeBonus, ExperimentId, ExperimentLength, GameState, grantComponents, hasNode, validEconomyValues, dataAffordability, formatScientific, spendScientificResources } from './economy';
import {ScientificNumber} from './scientificNumber';
import { randomItem } from './inventory';
import { addEvent } from './telemetry';

export const experimentNames:Record<ExperimentId,string>={hardware:'Hardwareanalyse',architecture:'Architekturstudie',artifact:'Artefaktsuche'};
export function experimentBaseSpeed(s:GameState){if(s.progression?.version===2)return(1+equippedBonus(s,'experiment'))*(1+BALANCE.repeatableResearch.labAutomation.effectPerLevel*s.researchLevels.labAutomation)*modelFactor(s,'analysis')*ScientificNumber.fromJSON(s.progression.legacyCycle.analysis??{m:1,e:0}).multiply(ScientificNumber.fromJSON(s.progression.legacyPermanent.analysis??{m:1,e:0})).toNumber()*(secondary(s,'K05')?BALANCE.progression.effects.D06speed:1);return 1+(hasNode(s,'labLink',1)?.1:0)+(hasNode(s,'labLink',3)?.2:0)+(s.breakthroughs.includes('planning')?.2:0)+equippedBonus(s,'experiment')+deepPrestigeBonus(s,'analysis')+s.researchLevels.labAutomation*BALANCE.repeatableResearch.labAutomation.effectPerLevel;}
export const experimentSpeed=(s:GameState)=>experimentBaseSpeed(s)*itemAnalysisFactorV3(s).toNumber();
/** Scanner changes analyses only; synthesis retains its own existing base. */
export const synthesisSpeed=(s:GameState)=>experimentBaseSpeed(s);
export const experimentDuration=(type:ExperimentId,length:ExperimentLength)=>length==='intro'?0:BALANCE.analysisCosts[type][length].duration;
export function analysisCost(type:ExperimentId,length:Exclude<ExperimentLength,'intro'>){return BALANCE.analysisCosts[type][length]}
export const analysisRewardFactor=(type:ExperimentId,length:ExperimentLength,s?:GameState)=>length==='short'?(s?.progression?.version===2?BALANCE.progression.analyses[`${type}-short`].units/BALANCE.progression.analyses[`${type}-long`].units:experimentDuration(type,'short')/experimentDuration(type,'long')):1;
export function analysisQuote(s:GameState,type:ExperimentId,length:Exclude<ExperimentLength,'intro'>){
 const baseCost=s.progression?.version===2?{data:BALANCE.progression.analyses[`${type}-${length}`].cost,duration:BALANCE.progression.analyses[`${type}-${length}`].work}:analysisCost(type,length),dataFactor=researchModifiers(s).analysisCost,cost={...baseCost,data:Math.ceil(baseCost.data*dataFactor)},resources=dataAffordability(s,cost.data),access=s.progression?.version===2?(type==='hardware'||type==='architecture'&&s.completedResearch.includes('blueprints')||type==='artifact'&&s.researchLevels.blueprintAnalysis>=3):s.discovered.includes('sbc'),slotAvailable=!s.experiments.active&&!s.progression?.synthesis;
 const factor=analysisRewardFactor(type,length,s),reward=BALANCE.experimentRewards[type],quantityBonus=analysisDropTable(s,type)[0].findBonus,rewards=analysisRewardQuote(s,type,factor);
 const reason=!validEconomyValues(s,['credits','data'])?'invalid-resources':!access?'access':!slotAvailable?'slot':!resources.affordable?'data':null;
 return{...resources,access,slotAvailable,allowed:reason===null,reason,baseCost,cost,dataFactor,balance:{data:s.data},missing:{data:resources.missing},secondsToData:resources.secondsToAfford,baseDuration:baseCost.duration,duration:baseCost.duration/experimentSpeed(s),savedStartDuration:s.experiments.active?.durationSeconds??null,rewardFactor:factor,baseRewards:reward,rewards,materialPossibilities:analysisDropTable(s,type),additional:{quantityBonus,rareGuarantee:analysisGuaranteesRare(s),combinationFactor:itemCombinationQuote(s,'material-mapping').contribution},itemChance:reward.itemChance*factor,longPriceFactor:analysisCost(type,'long').data/(analysisCost(type,'short').data/analysisRewardFactor(type,'short')),materialContract:materialAnalysisContract(s,type),contractVersion:3 as const};
}
export const analysisAffordability=analysisQuote;
/** Same deterministic fractional ledger calculation for preview and actual completion. */
export function analysisRewardQuote(s:GameState,type:ExperimentId,factor:number){if(s.progression?.version===2){const c=BALANCE.progression.analyses[`${type}-${factor<1?'short':'long'}`],f=c.fragments.split('/').map(Number);return{components:splitMaterialReward(c.units*(1+BALANCE.progression.researchEffects.materialAnalysis*s.researchLevels.materialAnalysis)+s.componentRemainder),research:splitMaterialReward((type==='architecture'?f[0]/(f[1]??1):0)+s.researchRemainder),blueprints:splitMaterialReward(f[0]/(f[1]??1)*(1+.1*s.researchLevels.blueprintAnalysis)+s.blueprintRemainder)};}const reward=BALANCE.experimentRewards[type],quantityBonus=analysisDropTable(s,type)[0].findBonus;return{components:splitMaterialReward(reward.components*factor*quantityBonus+s.componentRemainder),research:splitMaterialReward(reward.research*factor+s.researchRemainder),blueprints:splitMaterialReward((s.progression?.version===2?(()=>{const f=BALANCE.progression.analyses[`${type}-${factor<1?'short':'long'}`].fragments.split('/').map(Number);return f[0]/(f[1]??1);})():reward.blueprints*factor)*(1+s.researchLevels.blueprintAnalysis*(s.progression?.version===2?.10:BALANCE.repeatableResearch.blueprintAnalysis.effectPerLevel))+s.blueprintRemainder)};}


export function analysisDropTable(s:GameState,type:ExperimentId){
 const findBonus=materialAnalysisContract(s,type).findBonus;return materialTable(s,type,s.materials.focus).map(row=>({...row,findBonus,source:BALANCE.components[row.id].source}));
}
export function analysisBlockReason(s:GameState,type:ExperimentId,length:Exclude<ExperimentLength,'intro'>,language:'de'|'en'='de'){
  const q=analysisQuote(s,type,length);
  if(q.reason==='invalid-resources')return language==='de'?'Ungültige Ressourcenwerte.':'Invalid resource values.';
  if(q.reason==='access')return language==='de'?'Einplatinencomputer noch nicht entdeckt.':'Single-board computer not discovered yet.';
  if(q.reason==='slot')return language==='de'?`Analyseslot belegt durch ${experimentText(s.experiments.active!.type,language)}.`:`Analysis slot occupied by ${experimentText(s.experiments.active!.type,language)}.`;
  if(q.reason==='data')return language==='de'?`${formatScientific(q.missingExact,1)} Daten fehlen.`:`${formatScientific(q.missingExact,1)} Data missing.`;
  return null;
}
/** Split accumulated fractional rewards without losing values infinitesimally below an integer. */
export function splitMaterialReward(value:number){
  const nearest=Math.round(value),tolerance=Number.EPSILON*Math.max(1,Math.abs(value))*16;
  const normalized=Math.abs(value-nearest)<=tolerance?nearest:value,whole=Math.floor(normalized);
  return {whole,remainder:normalized-whole};
}
function componentGrant(_s:GameState,type:ExperimentId,count:number,rng=Math.random){const source=BALANCE.componentSources[type],entries=Object.entries(source).filter(([,weight])=>weight>0) as [ComponentId,number][],total=entries.reduce((n,[,w])=>n+w,0),grant:Partial<Record<ComponentId,number>>={};for(let i=0;i<count;i++){let roll=rng()*total,id=entries[entries.length-1][0];for(const [candidate,w] of entries){roll-=w;if(roll<=0){id=candidate;break}}grant[id]=(grant[id]??0)+1;}return grant;}
export function guaranteeRare(found:Partial<Record<ComponentId,number>>){
  const hasRare=(Object.keys(BALANCE.components) as ComponentId[]).some(id=>!['häufig','ungewöhnlich'].includes(BALANCE.components[id].rarity)&&(found[id]??0)>0);
  if(!hasRare)found.graphene=(found.graphene??0)+1;
}
/** Boost final guaranteed per-component quantities after original draws/rare guarantee. No extra RNG. */
export function analysisCombinationGrant(found:Partial<Record<ComponentId,number>>,factor:number){return Object.fromEntries(Object.entries(found).map(([id,n])=>[id,n&&n>0?Math.floor(n*factor):0])) as Partial<Record<ComponentId,number>>;}
export const analysisGuaranteesRare=(s:GameState)=>hasProgressionNode(s,'W03')||hasNode(s,'analysis3',1);
const start=(s:GameState,type:ExperimentId,now:number,length:ExperimentLength)=>{const preview=length==='intro'?null:analysisAffordability(s,type,length),durationSeconds=preview?.duration??0,cost=preview?.cost??{data:0},dataCost=ScientificNumber.from(cost.data),combinationFactor=itemCombinationQuote(s,'material-mapping').contribution,paid=spendScientificResources(s,ScientificNumber.zero(),dataCost);if(paid===s)return s;return addEvent({...paid,experiments:{...s.experiments,active:{id:length==='intro'?'intro':`exp-${s.nextId}`,type,length,startedAt:now,endsAt:now+durationSeconds*1000,durationSeconds,creditCost:0,dataCost:cost.data,combinationFactor,rewardFactor:analysisRewardFactor(type,length,s),materialContract:materialAnalysisContract(s,type),contractVersion:3,...(s.progression?.version===2?{progressionRare:hasProgressionNode(s,'W03'),progressionWorkRequired:preview?.baseDuration??0,progressionUnits:BALANCE.progression.analyses[`${type}-${length==='intro'?'short':length}`].units*(1+BALANCE.progression.researchEffects.materialAnalysis*s.researchLevels.materialAnalysis)*materialAnalysisContract(s,type).quantityFactor,progressionBlueprints:preview?.rewards.blueprints.whole!==undefined?preview.rewards.blueprints.whole+preview.rewards.blueprints.remainder-s.blueprintRemainder:0}:{})}},nextId:s.nextId+1},'experiment-start',now,{id:length==='intro'?'intro':`exp-${s.nextId}`,type,length,combinationFactor,creditCost:0,dataCost:cost.data,durationSeconds,startedAt:now,endsAt:now+durationSeconds*1000});};
export function queueExperiment(s:GameState,type:ExperimentId,now:number,length:ExperimentLength='long'){const original=s;s=choosePhaseModel(s,'material');
  if(length==='intro'||!validEconomyValues(s,['credits','data']))return original; // removed legacy tutorial experiment; never start a new one
  const reason=analysisBlockReason(s,type,length);
  if(reason)return addEvent(original,'action-blocked',now,{action:'experiment-start',type,length,reason});
  return start(s,type,now,length);
}
/** Unpaid FIFO. Invalid/blocked first entries wait; never skip or charge twice. */
export function enqueueAnalysis(s:GameState,type:ExperimentId,length:Exclude<ExperimentLength,'intro'>):GameState{
 if(s.progression?.resetIntent||!hasProgressionNode(s,'F02')||s.experiments.queue.length>=BALANCE.progression.analysisQueueCapacity||!analysisQuote(s,type,length).access)return s;
 return {...s,experiments:{...s.experiments,queue:[...s.experiments.queue,`${type}-${length}`]}};
}
export function removeAnalysis(s:GameState,index:number){if(!Number.isInteger(index)||index<0||index>=s.experiments.queue.length)return s;return {...s,experiments:{...s.experiments,queue:s.experiments.queue.filter((_,n)=>n!==index)}};}
export function runAnalysisQueue(s:GameState){
 if(s.progression?.resetIntent||!s.experiments.queue.length||s.experiments.active||s.progression?.synthesis)return s;
 const [type,part]=s.experiments.queue[0].split('-'),length=part??'long';
 const next=queueExperiment(s,type as ExperimentId,s.savedAt,length as Exclude<ExperimentLength,'intro'>);
 return next.experiments.active?{...next,experiments:{...next.experiments,queue:next.experiments.queue.slice(1)}}:s;
}
export function runAnalysisPlanner(s:GameState,now=s.savedAt){if(s.progression?.resetIntent||s.progression?.version===2&&!automaticCanSpendData(s,ScientificNumber.from(analysisQuote(s,s.analysisPlanner.type,s.analysisPlanner.length).cost.data),'analysis')||!automationFeatureUnlocked(s,'analysisPlanner')||!s.analysisPlanner.enabled||s.experiments.queue.length>0||s.experiments.active||analysisBlockReason(s,s.analysisPlanner.type,s.analysisPlanner.length,'en'))return s;return queueExperiment(s,s.analysisPlanner.type,now,s.analysisPlanner.length);}
export function cancelExperiment(s:GameState,now=s.savedAt){const active=s.experiments.active;if(!active)return s;return addEvent({...s,experiments:{...s.experiments,active:null}},'experiment-cancel',now,{id:active.id,type:active.type,length:active.length,refundCredits:0,refundData:0});}
/** Persist only fractional amplification; every reward is settled once by job ID. */
export function amplifyAnalysisMaterials(s:GameState,found:Partial<Record<ComponentId,number>>,factor:number,familyFactors?:Record<import('./materialEconomy').MaterialFamily,number>){
 const remainders={...s.materials.analysisRemainders},components:Partial<Record<ComponentId,number>>={};
 for(const id of Object.keys(found) as ComponentId[]){const value=(found[id]??0)*factor*(familyFactors?.[materialFamily(id,s)]??1)+(remainders[id]??0),nearest=Math.round(value),normalized=Math.abs(value-nearest)<=Number.EPSILON*16?nearest:value;components[id]=Math.floor(normalized);remainders[id]=normalized-components[id]!;}
 return{components,remainders};
}
export function completeExperiment(s:GameState,now:number,rng=Math.random,mode:'active'|'offline'='active'):GameState{
  const active=s.experiments.active;if(!active||active.endsAt>now)return s;
  if(s.experiments.completedIds.includes(active.id))return {...s,experiments:{...s.experiments,active:null}};
  if(active.length==='intro'){
    // Migration safety for old saves: retire an already-running legacy intro without reward or progression gate.
    const next={...s,experiments:{...s.experiments,active:null,completedIds:[...s.experiments.completedIds,active.id]}};
    return addEvent(next,'experiment-complete',now,{id:active.id,type:active.type,length:active.length,legacy:true});
  }
  const reward=BALANCE.experimentRewards[active.type],scale=active.rewardFactor??(active.length==='short'?1/24:1),{components,research,blueprints:dynamicBlueprints}=analysisRewardQuote(s,active.type,scale);const blueprints=active.progressionBlueprints===undefined?dynamicBlueprints:splitMaterialReward(active.progressionBlueprints+s.blueprintRemainder);
  const contract=active.contractVersion===3?active.materialContract:null,baseCount=active.progressionUnits!==undefined?splitMaterialReward(active.progressionUnits+s.componentRemainder):contract?splitMaterialReward(reward.components*scale*contract.findBonus*contract.quantityFactor+s.componentRemainder):components;const regularFound=contract?drawMaterials(contract.weights,baseCount.whole,rng):componentGrant(s,active.type,components.whole,rng);if(active.progressionRare===true||active.progressionRare===undefined&&analysisGuaranteesRare(s))guaranteeRare(regularFound);const w=s.progression?.work[active.id],weighted=w&&w.required>0?w.quantityIntegral/w.required:1;const familyFactors=w?.familyIntegral?{...contract?.familyFactors,base:1,semiconductor:1,frontier:1,photonic:w.familyIntegral.photonic/w.required/weighted,quantum:w.familyIntegral.quantum/w.required/weighted}:contract?.familyFactors;const combinationFactor=(active.combinationFactor??1)*weighted,amplified=contract?.fractionalYield?amplifyAnalysisMaterials(s,regularFound,combinationFactor,familyFactors):{components:Object.fromEntries(Object.entries(analysisCombinationGrant(regularFound,combinationFactor)).map(([id,n])=>[id,Math.floor(Number(n)*(contract?.familyFactors[materialFamily(id as ComponentId)]??1))])) as Partial<Record<ComponentId,number>>,remainders:s.materials.analysisRemainders},found=amplified.components;const result={id:active.id,type:active.type,length:active.length,at:now,mode,components:{...found},blueprintFragments:blueprints.whole,researchFragments:research.whole} as const;let next:GameState=grantComponents({...s,materials:{...s.materials,analysisRemainders:amplified.remainders},impulseRelayBlueprint:s.impulseRelayBlueprint||active.type==='hardware',componentRemainder:baseCount.remainder,researchFragments:s.researchFragments+research.whole,researchRemainder:research.remainder,blueprintFragments:s.blueprintFragments+blueprints.whole,blueprintRemainder:blueprints.remainder,experiments:{...s.experiments,active:null,completedIds:[...s.experiments.completedIds,active.id],firstReward:true,lastResult:result}},found,'analysis');
  if(usesItemV3(s)&&itemV3Has(s,'field-scanner')){const count=s.itemSystemV3!.scannerAnalyses;if(!Number.isSafeInteger(count)||count<0||count>=Number.MAX_SAFE_INTEGER)throw new RangeError('Invalid scanner analysis receipt');next={...next,itemSystemV3:{...next.itemSystemV3!,scannerAnalyses:count+1}};}
  if(s.retention.activeRun?.id!=='closed-supply-chain'&&reward.itemChance*scale&&rng()<reward.itemChance*scale)next=randomItem(next,rng);
  // The simulation starts the next affordable, validated contract at its exact boundary.
  const total=Object.values(found).reduce((sum,n)=>sum+(n??0),0);next=addEvent(next,'component-found',now,{source:`experiment:${active.type}`,jobId:active.id,mode,components:JSON.stringify(found),total});return addEvent(next,'experiment-complete',now,{id:active.id,type:active.type,length:active.length,mode,combinationFactor,rewardFactor:scale,contractVersion:active.contractVersion??1,regularComponents:JSON.stringify(regularFound),components:JSON.stringify(found),total,blueprintFragments:blueprints.whole,researchFragments:research.whole});
}
