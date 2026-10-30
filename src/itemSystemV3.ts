/** V3 domain implementation. Normal saves remain on their original rules until
 * the complete versioned migration is ready. No clocks, RNG, IO or UI here. */
import {BALANCE,equippedItems,hardwareIds,itemTypes,classComputeTerms,
  type GameState,type Item,type ItemFamily,type Rarity,type ComponentId} from './economy';
import {itemAmplifier,legacyItemFactorScientific,integrationLevel,modelCore,modelFactor,axiomLevel,progressionResearchSpeed} from './progression';
import {dataRateScientific,creditRateScientific} from './economy';
import {challengeNetworkLinkAllowed,challengeFamilyBonus} from './challengeStages';
import type {WorkContract} from './progressionWork';
import {ScientificNumber as S,type ScientificJSON} from './scientificNumber';

export type ItemSystemV3State={
  version:3;
  dataProduced:ScientificJSON;
  knowledgeProduced:ScientificJSON;
  componentsProduced:ScientificJSON;
  runMinutes:number;
  nextTrainingSequence:number;
  lastCompletedTrainingSequence:number;
  lastTrainingCompletionCause:'regular'|'bonus'|'intro'|null;
  learningStreak:number;
  lastLearningTrack:'quality'|'efficiency'|null;
  scannerAnalyses:number;
  recyclingFragmentProgress:number;
  automaticResearchStarts:number;
  overdrive:{startedAt:number;burstUntil:number;creditFactor:number;dataFactor:number}|null;
  synthesisRemainders:Partial<Record<ComponentId,number>>;
  synthesisContract:{id:string;component:ComponentId;multiplier:number}|null;
  archiveBlueprintRight:boolean;
  axiomDiscovered:boolean;
  axiomDiscoveryAt:number|null;
};
export function newItemSystemV3():ItemSystemV3State{return{version:3,dataProduced:S.zero().toJSON(),knowledgeProduced:S.zero().toJSON(),componentsProduced:S.zero().toJSON(),runMinutes:0,nextTrainingSequence:1,lastCompletedTrainingSequence:0,lastTrainingCompletionCause:null,learningStreak:0,lastLearningTrack:null,scannerAnalyses:0,recyclingFragmentProgress:0,automaticResearchStarts:0,overdrive:null,synthesisRemainders:{},synthesisContract:null,archiveBlueprintRight:false,axiomDiscovered:false,axiomDiscoveryAt:null};}
export const usesItemV3=(s:GameState)=>s.itemSystemV3?.version===3;
const c=()=>BALANCE.itemV3;
const one=()=>S.from(1);
const nonnegative=(n:number,name:string)=>{if(!Number.isFinite(n)||n<0)throw new RangeError(name);return n;};
export function itemStrengthV3(item:Pick<Item,'rarity'|'level'|'forge'>){
 const rank=(Object.keys(BALANCE.rarity) as Rarity[]).indexOf(item.rarity),forge=item.forge??0;
 if(rank<0||!Number.isInteger(item.level)||item.level<1||item.level>c().levelMax||!Number.isInteger(forge)||forge<0||forge>c().forgeMax)throw new RangeError('Invalid V3 item strength');
 const P=c().rarityFactors[rank]*(1+c().levelStep*(item.level-1))*(1+c().forgeStep*forge);
 return{P,Q:Math.sqrt(P)};
}
/** Explicit W10 exception. Never feed these strengthened values back into the
 * common base value, raw P/Q, combination strengths or another amplifier. */
export function itemAbilityStrengthV3(s:GameState,item:Item){const raw=itemStrengthV3(item);const active=s.nodes.includes('W10');return{P:raw.P*(active?BALANCE.prestigeV3.items.W10ability:1),Q:raw.Q*(active?BALANCE.prestigeV3.items.W10exponent:1)};}
/** Stable scientific softcap; neither a large stock nor x-k passes through Number. */
export function itemSoftcapV3(x:S,k:number):S{
 if(!Number.isFinite(k)||k<=0)throw new RangeError('Invalid softcap threshold');
 const threshold=S.from(k);return x.compare(threshold)<=0?x:threshold.add(x.subtract(threshold).multiply(threshold).sqrt());
}
export function itemV3Equipped(s:GameState):Item[]{
 if(s.retention.activeRun?.id==='no-items')return[];
 const types=new Set<string>();return equippedItems(s).filter(item=>{if(types.has(item.type))return false;types.add(item.type);return true;});
}
/** Pure next manual-tap bonus. Outside the normal tap softcap and crit
 * multiplier; active temporary production cannot leak through item Compute. */
export function itemRelayBonusV3(s:GameState,critical:boolean){
 if(!usesItemV3(s))return S.zero();
 const item=itemV3Equipped(s).find(i=>i.type==='impulse-relay');if(!item)return S.zero();
 const count=item.relayTaps??0;if(!Number.isSafeInteger(count)||count<0)throw new RangeError('Invalid relay counter');
 if((count+1)%c().relay.interval!==0)return S.zero();
 const regular={...s,overclock:{...s.overclock,activeUntil:0}};
 return creditRateScientific(regular.hardware,regular.level,regular,regular.savedAt,false).multiplyNumber(c().relay.seconds*itemAbilityStrengthV3(s,item).P*(critical?c().relay.critical:1));
}
/** Start-only contract. Equipping later never reconstructs a window. */
export function itemOverdriveStartV3(s:GameState,now:number,baseDuration:number){
 if(!usesItemV3(s)||!Number.isFinite(now)||now<s.savedAt||!Number.isFinite(baseDuration)||baseDuration<=0)throw new RangeError('Invalid V3 overdrive start');
 const items=itemV3Equipped(s),burst=items.find(i=>i.type==='burst-processor'),cryo=items.find(i=>i.type==='cryocontroller'),pair=!!burst&&!!cryo,trio=pair&&items.some(i=>i.type==='photonic-analyzer');
 const duration=baseDuration*(1+(cryo?c().cryo.duration*itemAbilityStrengthV3(s,cryo).P:0));
 return{duration,contract:{startedAt:now,burstUntil:now+Math.min(duration,pair?c().combinations.energy.seconds:c().burst.seconds)*1000,creditFactor:burst?(1+c().burst.coefficient*itemAbilityStrengthV3(s,burst).P)*(pair?c().combinations.energy.credits:1):1,dataFactor:trio?c().combinations.energy.data:1}};
}
export function itemBurstFactorV3(s:GameState,kind:'credits'|'data',now=s.savedAt){
 const v=s.itemSystemV3?.overdrive;if(!usesItemV3(s)||s.retention.activeRun?.id==='no-items'||!v||now<v.startedAt||now>=v.burstUntil||now>=s.overclock.activeUntil)return 1;
 return kind==='credits'?v.creditFactor:v.dataFactor;
}
export function itemOverdriveFractionV3(s:GameState){const remaining=Math.max(0,s.overclock.activeUntil-s.savedAt),duration=usesItemV3(s)&&s.itemSystemV3?.overdrive?s.overclock.activeUntil-s.itemSystemV3.overdrive.startedAt:BALANCE.progression.overdriveMaxSeconds*1000;return duration<=0?0:Math.min(1,remaining/duration);}
export function itemBurstBoundaryV3(s:GameState){const v=s.itemSystemV3?.overdrive;return usesItemV3(s)&&v&&v.burstUntil>s.savedAt?(v.burstUntil-s.savedAt)/1000:Infinity;}
export const itemV3Has=(s:GameState,id:string)=>itemV3Equipped(s).some(item=>item.type===id);
/** Deliberately removes all old primary, secondary, tertiary and combination
 * contributions while preserving the non-item game state and challenge rules. */
export function withoutItemV3Equipment(s:GameState):GameState{return{...s,itemSystemV3:undefined,equipped:{}};}
export function itemV3Snapshot(s:GameState){
 const state=s.itemSystemV3;if(!state||state.version!==3)throw new TypeError('V3 state required');
 nonnegative(state.runMinutes,'Invalid run time');validateItemTrainingCountersV3(state);
 let H=S.zero();for(const id of hardwareIds)H=H.add(S.from(nonnegative(s.hardwareCounts[id],'Invalid hardware')));
 const M=S.from(s.qualityLevel).add(S.from(s.efficiencyLevel)).add(S.from(integrationLevel(s)));
 // A project present in both old fields is still a single research, not two.
 const researchIds=new Set([...Object.keys(s.researchLevels),...s.completedResearch]);let F=S.zero();
 for(const id of researchIds)F=F.add(S.from(Math.max((s.researchLevels as Record<string,number>)[id]??0,s.completedResearch.includes(id as never)?1:0)));
 // Owned model upgrade levels only; undeveloped models never contribute.
 const U=Object.entries(s.progression.models).filter(([id,level])=>Object.hasOwn(BALANCE.progression.models,id)&&typeof level==='number'&&level>=0).reduce((sum,[,level])=>sum.add(S.from(level!)),S.zero());
 const N=new Set(s.nodes.filter(id=>Object.hasOwn(BALANCE.progression.nodes,id))).size;
 return{H,M,F,U,N,Z:s.axiomResetCount,D:S.fromJSON(state.dataProduced),E:S.fromJSON(state.knowledgeProduced),K:S.fromJSON(state.componentsProduced),T:S.from(state.runMinutes)};
}
export function itemBaseBonusScientificV3(s:GameState,item:Item,family:ItemFamily):S{
 if(itemTypes[item.type].slot!==family)return S.zero();
 const effect=family==='processor'?'compute':family==='core'?'credits':'research';
 // Legacy purchased factors stay scientific. They amplify only the additive
 // base bonus, never raw P/Q or the item's unique ability.
 return S.from(c().baseValue*itemStrengthV3(item).P*itemAmplifier(s)).multiply(legacyItemFactorScientific(s,effect));
}
export function itemBaseBonusV3(s:GameState,item:Item,family:ItemFamily){return itemBaseBonusScientificV3(s,item,family).toNumber();}
export function itemBaseFactorScientificV3(s:GameState,family:ItemFamily){return itemV3Equipped(s).reduce((sum,item)=>sum.add(itemBaseBonusScientificV3(s,item,family)),one());}
export function itemBaseFactorV3(s:GameState,family:ItemFamily){return itemBaseFactorScientificV3(s,family).toNumber();}
export function itemQuantumFactorV3(hardware:S,item:Item,extraExponent=0,context?:GameState){const {P,Q}=context?itemAbilityStrengthV3(context,item):itemStrengthV3(item);return S.from(c().quantum.base).pow(P).multiply(one().add(hardware.divide(S.from(c().quantum.hardwareScale))).pow(c().quantum.exponent*Q+extraExponent));}
export function itemNeuralFactorV3(training:S,item:Item,extraExponent=0,context?:GameState){const {P,Q}=context?itemAbilityStrengthV3(context,item):itemStrengthV3(item);return S.from(c().neural.base).pow(P).multiply(one().add(training.divide(S.from(c().neural.trainingScale))).pow(c().neural.exponent*Q+extraExponent));}
export function itemTensorFactorV3(training:S,item:Item,context?:GameState){const{P,Q}=context?itemAbilityStrengthV3(context,item):itemStrengthV3(item);return S.from(c().tensor.base).pow(P).multiply(one().add(training.divide(S.from(c().tensor.trainingScale))).pow(Q));}
export function itemLensFactorV3(rawCompute:S,item:Item,combination=false,context?:GameState){const{Q}=context?itemAbilityStrengthV3(context,item):itemStrengthV3(item);return(rawCompute.compare(one())<0?one():rawCompute).pow(c().lens.exponent*Q*(combination?c().combinations.industrial.lensExponent:1));}
/** Fleet bonus: the V counter counts currently held classes with >=100 units. */
export function itemFleetFactorV3(s:GameState,item:Item):S{
 const P=itemAbilityStrengthV3(s,item).P;
 const owned=hardwareIds.filter(id=>s.hardwareCounts[id]>=c().fleet.minimumOwned).length;
 return S.from(c().fleet.base).pow(P).multiplyNumber(1+c().fleet.perClass*P*owned);
}
/** K counts real self-produced components, not purchases or recycled parts. */
export function itemSynthesisCoordinatorFactorV3(s:GameState,item:Item):number{
 const{P,Q}=itemAbilityStrengthV3(s,item),K=S.fromJSON(s.itemSystemV3!.componentsProduced);
 return Math.pow(c().synthesis.base,P)*Math.pow(1+K.add(one()).log10()/c().synthesis.componentLogScale,c().synthesis.exponent*Q);
}
export function itemSynthesisSpeedFactorV3(s:GameState):number{
 if(!usesItemV3(s))return 1;
 const item=itemV3Equipped(s).find(i=>i.type==='synthesis-coordinator');
 return item?itemSynthesisCoordinatorFactorV3(s,item):1;
}


export type ItemV3Combination={id:string;items:readonly string[];pair:boolean;complete:boolean;missing:string[]};
const combinationItems={
 'compute-network':['quantum-chip','tensor-core','inference-router'],
 'bootstrapping':['legacy-controller','diagnostic-adapter','memory-crystal'],
 'learning-spiral':['photonic-array','logic-seed','lab-drone'],
 'distilled-intelligence':['neural-asic','distillation-module','darklab-resonator'],
 'energy-surplus':['burst-processor','cryocontroller','photonic-analyzer'],
 'autonomous-laboratory':['lab-drone','protocol-controller','experiment-controller'],
 'closed-loop':['manufacturing-controller','recycling-probe','diagnostic-adapter'],
 'photonic-architecture':['photonic-matrix','photonic-analyzer','cryocontroller'],
 'insight-loop':['darklab-resonator','entropy-sink','model-echo-core'],
 'axiom-memory':['axiom-lattice','cycle-observatory','axiom-anchor'],
 'scientific-library':['blueprint-archive','data-prism','field-scanner'],
 'industrial-singularity':['fleet-coordinator','synthesis-coordinator','singularity-lens'],
} as const;
export function itemCombinationsV3(s:GameState):ItemV3Combination[]{const types=new Set(itemV3Equipped(s).map(i=>i.type as string));return Object.entries(combinationItems).map(([id,items])=>({id,items,pair:items.slice(0,2).every(type=>types.has(type)),complete:items.every(type=>types.has(type)),missing:items.filter(type=>!types.has(type))}));}
export function itemCombinationV3(s:GameState,id:keyof typeof combinationItems){return itemCombinationsV3(s).find(row=>row.id===id)!;}

/** Production stage only. Other event-based abilities are accepted separately;
 * this quote never grants resources or manufactures completion events. */
export function itemComputeFactorV3(s:GameState){
 const snapshot=itemV3Snapshot(s),combo=itemCombinationV3(s,'compute-network');let result=one();
 const distilled=itemCombinationV3(s,'distilled-intelligence');
 for(const item of itemV3Equipped(s)){
  if(item.type==='quantum-chip')result=result.multiply(itemQuantumFactorV3(snapshot.H,item,combo.complete?c().combinations.compute.quantumExponent:0,s));
  if(item.type==='tensor-core')result=result.multiply(itemTensorFactorV3(distilled.complete?snapshot.M.add(snapshot.U.multiplyNumber(c().combinations.distilled.upgrades)):snapshot.M,item,s));
  if(item.type==='entropy-sink'){const{P,Q}=itemAbilityStrengthV3(s,item);result=result.multiply(S.from(c().entropy.base).pow(P).multiply(S.from(1+snapshot.E.add(one()).log10()).pow(c().entropy.exponent*Q)));}
  if(item.type==='inference-router')result=result.multiplyNumber(1+c().router.perLink*itemAbilityStrengthV3(s,item).P*activeHardwareLinksV3(s));
  if(item.type==='photonic-matrix'&&s.overclock.activeUntil>s.savedAt)result=result.multiplyNumber(1+c().photonic.coefficient*itemAbilityStrengthV3(s,item).P);
  if(item.type==='fleet-coordinator')result=result.multiply(itemFleetFactorV3(s,item));
  if(item.type==='singularity-lens'&&s.axiomResetCount>=c().lens.minimumCycles)
   result=result.multiply(itemLensFactorV3(unmodifiedHardwareComputeV3(s),item,itemCombinationV3(s,'industrial-singularity').complete,s));
 }
 if(combo.pair)result=result.multiplyNumber(c().combinations.compute.factor);
 return result.multiply(itemBaseFactorScientificV3(s,'processor'));
}
/** Only variable regular paid milestone components; fixed extras and class
 * upgrade packages retain their distinct existing contracts. */
export function itemFocusFactorV3(s:GameState){if(!usesItemV3(s))return 1;const item=itemV3Equipped(s).find(i=>i.type==='precision-scanner');return 1+(item?c().focus.coefficient*itemAbilityStrengthV3(s,item).P:0);}
export function itemFocusQuantityV3(s:GameState){return usesItemV3(s)?1-(1-BALANCE.materialFocusQuantity)/itemFocusFactorV3(s):BALANCE.materialFocusQuantity;}
export function itemHardwarePackageFactorV3(s:GameState){
 if(!usesItemV3(s))return 1;const diagnostic=itemV3Equipped(s).find(i=>i.type==='diagnostic-adapter');return(1+(diagnostic?c().diagnostic.coefficient*itemAbilityStrengthV3(s,diagnostic).P:0))*(itemCombinationV3(s,'bootstrapping').pair?c().combinations.boot.components:1);
}
/** Family-specific yield for paid analyses/regular hardware packets only.
 * Quantum architecture requires existing access; no family is unlocked here. */
export function itemMaterialFamilyYieldV3(s:GameState,family:keyof typeof BALANCE.progression.materials,quantumUnlocked:boolean,at=s.savedAt){
 if(!usesItemV3(s)||family!=='photonic'&&family!=='quantum')return 1;
 const type=family==='photonic'?'photonic-analyzer':'quantum-diagnostic-module',item=itemV3Equipped(s).find(i=>i.type===type),combo=itemCombinationV3(s,'photonic-architecture');
 return(1+(item?c().familyYield.coefficient*itemAbilityStrengthV3(s,item).P:0))*(s.overclock.activeUntil>at&&(family==='photonic'?combo.pair:combo.complete&&quantumUnlocked)?c().combinations.photonic.yield:1);
}
export function itemMaximumFamilyYieldV3(){const maxP=Math.max(...c().rarityFactors)*(1+c().levelStep*(c().levelMax-1))*(1+c().forgeStep*c().forgeMax)*BALANCE.prestigeV3.items.W10ability;return BALANCE.prestigeV3.items.W03focus*(1+c().familyYield.coefficient*maxP)*c().combinations.photonic.yield;}
/** One combined refund account: the item replaces a lower existing refund,
 * rather than issuing a second grant for the same paid materials. */
export function itemCraftRecoveryFractionV3(s:GameState,existing:number){const item=itemV3Equipped(s).find(i=>i.type==='manufacturing-controller');return Math.min(BALANCE.recoveryFraction,Math.max(existing,item?Math.min(c().manufacturing.cap,c().manufacturing.rate*itemAbilityStrengthV3(s,item).P):0));}
export function itemAnalysisCombinationYieldV3(s:GameState){return usesItemV3(s)&&itemCombinationV3(s,'closed-loop').complete?c().combinations.recycling.materials:1;}
export function itemSalvageFragmentsV3(s:GameState,item:Item){
 if(!usesItemV3(s))return{gained:0,remainder:0,progress:0};const remainder=s.itemSystemV3!.recyclingFragmentProgress;if(!Number.isFinite(remainder)||remainder<0||remainder>=1)throw new RangeError('Invalid V3 fragment progress');
 const probe=itemV3Equipped(s).find(i=>i.type==='recycling-probe'),rare=(Object.keys(BALANCE.rarity) as Rarity[]).indexOf(item.rarity)>=(Object.keys(BALANCE.rarity) as Rarity[]).indexOf('rare'),progress=rare&&probe?c().recycling.fragment*itemAbilityStrengthV3(s,probe).P*(itemCombinationV3(s,'closed-loop').pair?c().combinations.recycling.fragments:1):0;
 if(progress===0)return{gained:0,remainder,progress};const value=remainder+progress,nearest=Math.round(value),total=Math.abs(value-nearest)<=Number.EPSILON*Math.max(1,value)*16?nearest:value,gained=Math.floor(total);return{gained,remainder:total-gained,progress};
}
export function itemCreditFactorV3(s:GameState){
 const snapshot=itemV3Snapshot(s),distilled=itemCombinationV3(s,'distilled-intelligence');let result=one();
 for(const item of itemV3Equipped(s)){
  const{P,Q}=itemAbilityStrengthV3(s,item);
  if(item.type==='neural-asic')result=result.multiply(itemNeuralFactorV3(distilled.complete?snapshot.M.add(snapshot.U.multiplyNumber(c().combinations.distilled.upgrades)):snapshot.M,item,distilled.complete?c().combinations.distilled.neuralExponent:0,s));
  if(item.type==='memory-crystal')result=result.multiply(S.from(c().memoryCrystal.base).pow(P).multiply(S.from(1+snapshot.D.add(one()).log10()/c().memoryCrystal.dataLogScale).pow(Q)));
  if(item.type==='long-term-memory')result=result.multiply(S.from(c().longMemory.base).pow(P).multiply(one().add(itemSoftcapV3(snapshot.T,c().longMemory.threshold).divide(S.from(c().longMemory.minuteScale))).pow(c().longMemory.exponent*Q)));
 }
 if(distilled.pair)result=result.multiplyNumber(c().combinations.distilled.credits);
 const boot=itemCombinationV3(s,'bootstrapping');if(boot.complete)result=result.multiply(S.from(c().combinations.boot.creditsPerClass).pow(hardwareIds.slice(0,c().combinations.boot.classes).filter(id=>s.hardwareCounts[id]>=c().combinations.boot.threshold).length));
 return result.multiply(itemBaseFactorScientificV3(s,'core')).multiply(itemModelEchoV3(s));
}
export function itemModelEchoV3(s:GameState){
 const echo=itemV3Equipped(s).find(i=>i.type==='model-echo-core');if(!echo||!s.progression.active)return one();
 // Exactly the original common model core and original primary revenue factor.
 // Return only the additional power: the existing revenue consumer pays power 1.
 return S.from(modelCore(s)).multiply(S.from(modelFactor(s,'revenue'))).pow(c().echo.exponent*itemAbilityStrengthV3(s,echo).Q);
}
export function itemWorkFactorV3(s:GameState,research:boolean){
 if(!usesItemV3(s))return 1;const snapshot=itemV3Snapshot(s);let result=one();
 for(const item of itemV3Equipped(s)){
  const {P,Q}=itemAbilityStrengthV3(s,item);
  if(!research&&item.type==='logic-seed')result=result.multiply(S.from(c().logic.base).pow(P).multiplyNumber(1+c().logic.perStreak*P*s.itemSystemV3!.learningStreak));
  if(!research&&item.type==='mnemonic-anchor')result=result.multiply(S.from(c().anchorMemory.base).pow(P).multiply(one().add(snapshot.U.divide(S.from(c().anchorMemory.upgradeScale))).pow(c().anchorMemory.exponent*Q)));
  if(research&&item.type==='blueprint-archive')result=result.multiply(S.from(c().blueprint.base).pow(P).multiplyNumber(1+c().blueprint.perBlueprint*P*Object.keys(BALANCE.itemRecipes).filter(id=>Object.hasOwn(s.blueprintMastery,id)&&s.blueprintMastery[id as Item['type']]>=1).length));
  if(research&&item.type==='cycle-observatory')result=result.multiply(S.from(c().cycle.base).pow(P).multiply(S.from(1+snapshot.Z).pow(c().cycle.exponent*Q)));
 }
 if(itemCombinationV3(s,'learning-spiral').pair)result=result.multiplyNumber(c().combinations.learning.speed);
 if(research&&itemCombinationV3(s,'scientific-library').pair)result=result.multiplyNumber(c().combinations.library.research);
 return result.multiply(research?itemBaseFactorScientificV3(s,'research'):one()).toNumber();
}
export function itemKnowledgeFactorV3(s:GameState){
 if(!usesItemV3(s))return one();let result=one();
 const resonator=itemV3Equipped(s).find(i=>i.type==='darklab-resonator');
 if(resonator){const{P,Q}=itemAbilityStrengthV3(s,resonator);const regular={...s,overclock:{...s.overclock,activeUntil:0},creditBoostUntil:0,labBoostUntil:0};const R=dataRateScientific(regular);result=result.multiply(S.from(c().resonator.base).pow(P).multiply(S.from(1+R.add(one()).log10()/c().resonator.dataLogScale).pow(c().resonator.exponent*Q)));}
 const combo=itemCombinationV3(s,'insight-loop');if(combo.pair)result=result.multiplyNumber(c().combinations.insight.factor);
 if(combo.complete&&s.progression.active)result=result.multiply(S.from(1+(s.progression.models[s.progression.active]??0)/c().combinations.insight.upgradeScale).pow(c().combinations.insight.exponent));
 return result;
}
export function itemAxiomFactorV3(s:GameState){
 if(!usesItemV3(s))return one();const snapshot=itemV3Snapshot(s);let result=one();
 for(const item of itemV3Equipped(s))if(item.type==='axiom-lattice'){const{P,Q}=itemAbilityStrengthV3(s,item);result=result.multiply(S.from(c().lattice.base).pow(P).multiply(S.from(1+snapshot.N/c().lattice.nodeScale).pow(c().lattice.exponent*Q)));}
 if(itemCombinationV3(s,'axiom-memory').pair)result=result.multiplyNumber(c().combinations.axiom.factor);return result;
}
export function itemDataFactorV3(s:GameState){
 const snapshot=itemV3Snapshot(s);let result=one();for(const item of itemV3Equipped(s)){
  if(item.type==='data-prism'){const{P,Q}=itemAbilityStrengthV3(s,item);result=result.multiply(S.from(c().prism.base).pow(P).multiply(one().add(snapshot.F.divide(S.from(c().prism.researchScale))).pow(Q)));}
  if(item.type==='photonic-matrix'&&s.overclock.activeUntil>s.savedAt)result=result.multiplyNumber(1+c().photonic.coefficient*itemAbilityStrengthV3(s,item).P);
 }return result.multiplyNumber(itemBurstFactorV3(s,'data'));
}
function validLink(s:GameState,index:number){return index>0&&s.completedResearch.includes('distributedInference')&&s.hardwareCounts[hardwareIds[index]]>0&&s.hardwareCounts[hardwareIds[index-1]]>=BALANCE.itemV3.link.previous&&challengeNetworkLinkAllowed(s,index);}
export function activeHardwareLinksV3(s:GameState){return hardwareIds.filter((_,index)=>validLink(s,index)).length;}
/** One class pass; Sparse ranks the pre-Sparse local results with stable ties. */
export function itemHardwareClassesV3(s:GameState){
 const plain=withoutItemV3Equipment(s),items=itemV3Equipped(s),legacy=items.find(i=>i.type==='legacy-controller'),coupler=items.find(i=>i.type==='quantum-coupler'),sparse=items.find(i=>i.type==='sparse-decoder');
 const classes=hardwareIds.map((id,index)=>{
  const t=classComputeTerms(plain,id),n=s.hardwareCounts[id];let linked=S.from(t.linkedCompute);
  if(coupler&&validLink(s,index))linked=S.from(Math.min(n,c().link.maximum*(1+itemAbilityStrengthV3(s,coupler).P))).multiplyNumber(BALANCE.hardware[id].compute*c().link.factor*(1+challengeFamilyBonus(s,'fragmented-network')));
  let value=S.from(t.ownedCompute).add(linked).multiplyNumber(t.milestone*t.classUpgrade*t.mastery);
  if(legacy&&index<c().legacy.classes){const{P,Q}=itemAbilityStrengthV3(s,legacy);value=value.multiply(S.from(c().legacy.base).pow(P).multiply(one().add(S.from(n).divide(S.from(c().legacy.countScale))).pow(Q)));}
  return value;
 });
 if(sparse){const selected=classes.map((value,index)=>({value,index})).filter(row=>s.hardwareCounts[hardwareIds[row.index]]>0).sort((a,b)=>b.value.compare(a.value)||a.index-b.index).slice(0,c().sparse.classes);const coefficient=hardwareIds.filter(id=>s.hardwareCounts[id]>0).length<=c().sparse.classes?c().sparse.few:c().sparse.normal;for(const row of selected)classes[row.index]=classes[row.index].multiplyNumber(1+coefficient*itemAbilityStrengthV3(s,sparse).P);}
 return classes;
}
/** Existing logarithmic curve g(d) is geometrically interpolated toward d.
 * rho stays below 1, both positive factors are monotone, and g(d)/d -> 1
 * at d -> 0. Therefore value and first derivative match at the threshold. */
export function itemTrainingStrengthV3(s:GameState,level:number){
 nonnegative(level,'Invalid training level');const items=itemV3Equipped(s),curriculum=items.find(i=>i.type==='curriculum-module'),distillation=items.find(i=>i.type==='distillation-module');
 const threshold=BALANCE.progression.formula.trainingSoftStart*(curriculum?1+c().curriculum.threshold*itemAbilityStrengthV3(s,curriculum).P:1),scale=BALANCE.progression.formula.trainingSoftScale;
 if(level<=threshold)return level;const delta=level-threshold,curve=scale*Math.log1p(delta/scale);
 if(!distillation)return threshold+curve;const strength=c().distillation.strength*itemAbilityStrengthV3(s,distillation).Q,rho=strength/(1+strength);
 return threshold+Math.exp((1-rho)*Math.log(curve)+rho*Math.log(delta));
}
/** Explicit raw C is available for the later lens consumer; no global effects. */
export function unmodifiedHardwareComputeV3(s:GameState){const plain=withoutItemV3Equipment(s);let result=S.zero();for(const id of hardwareIds){const t=classComputeTerms(plain,id);result=result.add(S.from(t.ownedCompute).add(S.from(t.linkedCompute)).multiplyNumber(t.milestone*t.classUpgrade*t.mastery));}return result;}

/** Called once for the actual regular production interval, after all rates were
 * quoted from its start snapshot. Claims, spending and imports never call this. */
export function recordItemProductionV3(s:GameState,seconds:number,data:S,knowledge:S):GameState{
 if(!usesItemV3(s))return s;nonnegative(seconds,'Invalid credited time');
 const v=s.itemSystemV3!;return{...s,itemSystemV3:{...v,dataProduced:S.fromJSON(v.dataProduced).add(data).toJSON(),knowledgeProduced:S.fromJSON(v.knowledgeProduced).add(knowledge).toJSON(),runMinutes:v.runMinutes+seconds/60}};
}
const itemComponentSourcesV3=new Set(['analysis','synthesis','passive-hardware','paid-hardware-package','paid-class-upgrade']);
export type ItemComponentProductionV3='analysis'|'synthesis'|'passive-hardware'|'paid-hardware-package'|'paid-class-upgrade';
/** Explicit producer receipts only. Default grants (shop, drops, gifts,
 * salvage, recovery, import and trade) never become self-production. */
export function recordItemComponentsV3(s:GameState,grant:Partial<GameState['componentInventory']>,source?:ItemComponentProductionV3):GameState{
 if(!usesItemV3(s)||!source||!itemComponentSourcesV3.has(source))return s;
 let amount=S.zero();for(const [id,value]of Object.entries(grant)){if(!Object.hasOwn(BALANCE.components,id))continue;const n=value??0;if(!Number.isSafeInteger(n)||n<0)throw new RangeError('Invalid V3 produced components');amount=amount.add(S.from(n));}
 if(amount.isZero())return s;const v=s.itemSystemV3!;return{...s,itemSystemV3:{...v,componentsProduced:S.fromJSON(v.componentsProduced).add(amount).toJSON()}};
}
/** Run data/time/series reset at ordinary prestige; independently produced
 * knowledge/components survive until the actual axiom-cycle boundary. */
export function resetItemProductionV3(s:GameState,kind:'prestige'|'axiom'):GameState{
 if(!usesItemV3(s))return s;const v=s.itemSystemV3!;
 return{...s,itemSystemV3:{...v,dataProduced:S.zero().toJSON(),runMinutes:0,learningStreak:0,lastLearningTrack:null,scannerAnalyses:0,automaticResearchStarts:0,overdrive:null,...(kind==='axiom'?{knowledgeProduced:S.zero().toJSON(),componentsProduced:S.zero().toJSON()}:{} )}};
}

/** Restores the old researchArchive -> I04 acquisition right. Learning stays an
 * explicit one-time action; this grants neither fragments nor a free item. */
export function archiveBlueprintRightV3(s:GameState){return usesItemV3(s)&&(s.itemSystemV3!.archiveBlueprintRight||s.insightArchiveBlueprint||s.nodes.includes('I04')||s.progression.known.includes('I04')||(s.learnedRecipes??[]).includes('insight-archive'));}

function validateItemTrainingCountersV3(v:ItemSystemV3State){
 if(!Number.isFinite(v.recyclingFragmentProgress)||v.recyclingFragmentProgress<0||v.recyclingFragmentProgress>=1)throw new RangeError('Invalid V3 fragment progress');
 const maxP=Math.max(...c().rarityFactors)*(1+c().levelStep*(c().levelMax-1))*(1+c().forgeStep*c().forgeMax)*BALANCE.prestigeV3.items.W10ability;
 const od=v.overdrive;if(od!==null&&(!od||![od.startedAt,od.burstUntil,od.creditFactor,od.dataFactor].every(Number.isFinite)||od.startedAt<0||od.burstUntil<od.startedAt||od.burstUntil-od.startedAt>c().combinations.energy.seconds*1000+.001||od.creditFactor<1||od.creditFactor>(1+c().burst.coefficient*maxP)*c().combinations.energy.credits+1e-10||![1,c().combinations.energy.data].includes(od.dataFactor)))throw new RangeError('Invalid V3 overdrive contract');
 if(!v.synthesisRemainders||Object.entries(v.synthesisRemainders).some(([id,n])=>!Object.hasOwn(BALANCE.components,id)||!Number.isFinite(n)||n!<0||n!>=1)||v.synthesisContract!==null&&(!v.synthesisContract||!v.synthesisContract.id||!Object.hasOwn(BALANCE.components,v.synthesisContract.component)||!Number.isFinite(v.synthesisContract.multiplier)||v.synthesisContract.multiplier<1))throw new RangeError('Invalid V3 synthesis receipt');
 if(!Number.isSafeInteger(v.automaticResearchStarts)||v.automaticResearchStarts<0)throw new RangeError('Invalid automatic research count');
 if(!Number.isSafeInteger(v.scannerAnalyses)||v.scannerAnalyses<0||!Number.isSafeInteger(v.nextTrainingSequence)||v.nextTrainingSequence<1||!Number.isSafeInteger(v.lastCompletedTrainingSequence)||v.lastCompletedTrainingSequence<0||v.lastCompletedTrainingSequence>=v.nextTrainingSequence||!Number.isSafeInteger(v.learningStreak)||v.learningStreak<0||v.learningStreak>c().logic.maxStreak||![null,'quality','efficiency'].includes(v.lastLearningTrack)||![null,'regular','bonus','intro'].includes(v.lastTrainingCompletionCause))throw new RangeError('Invalid V3 training counters');
}
/** Serial training IDs are assigned only after the existing start/payment
 * succeeds. Sequence/settlement markers survive resets; personal counters are
 * never serialized onto a traded item. Legacy unknown jobs grant no new effect. */
export function identifyItemTrainingV3(s:GameState):GameState{
 if(!usesItemV3(s)||!s.activeTraining||s.activeTraining.jobId)return s;
 const v=s.itemSystemV3!;validateItemTrainingCountersV3(v);const id=v.nextTrainingSequence;
 if(!Number.isSafeInteger(id)||id<1||id>=Number.MAX_SAFE_INTEGER)throw new RangeError('Invalid V3 training sequence');
 return{...s,itemSystemV3:{...v,nextTrainingSequence:id+1},activeTraining:{...s.activeTraining,jobId:'v3-training-'+id}};
}
export function completeItemTrainingV3(s:GameState,cause:'regular'|'bonus'):GameState{
 if(!usesItemV3(s)||!s.activeTraining)return s;
 const job=s.activeTraining,v=s.itemSystemV3!;validateItemTrainingCountersV3(v);if(!Number.isFinite(job.workRequired)||job.workRequired<=0||!Number.isFinite(s.training)||s.training<0||!['quality','efficiency','integration'].includes(job.track))return s;const match=/^v3-training-([1-9]\d*)$/.exec(job.jobId??'');if(!match)return s;
 const id=Number(match[1]);if(!Number.isSafeInteger(id)||id>=v.nextTrainingSequence||id<=v.lastCompletedTrainingSequence||s.training+1e-7<job.workRequired)return s;
 let learningStreak=v.learningStreak,lastLearningTrack=v.lastLearningTrack;
 if(cause==='regular'&&!job.intro&&job.track!=='integration'&&itemV3Has(s,'logic-seed')){
  if(!Number.isSafeInteger(learningStreak)||learningStreak<0||learningStreak>c().logic.maxStreak)throw new RangeError('Invalid V3 learning series');
  learningStreak=lastLearningTrack===job.track?Math.floor(learningStreak/c().logic.sameTrackDivisor):Math.min(c().logic.maxStreak,learningStreak+1);lastLearningTrack=job.track;
 }
 const next={...s,itemSystemV3:{...v,lastCompletedTrainingSequence:id,lastTrainingCompletionCause:job.intro?'intro' as const:cause,learningStreak,lastLearningTrack}};return cause==='regular'&&!job.intro?grantItemPhotonWorkV3(next):next;
}

/** Live scanner factor; regular completion increments are booked atomically
 * by completeExperiment, never by showing/claiming a reward. */
export function itemAnalysisFactorV3(s:GameState){
 if(!usesItemV3(s))return one();validateItemTrainingCountersV3(s.itemSystemV3!);
 const item=itemV3Equipped(s).find(i=>i.type==='field-scanner');if(!item)return one();
 const {P}=itemAbilityStrengthV3(s,item);return S.from(c().scanner.base).pow(P).multiply(one().add(itemSoftcapV3(S.from(s.itemSystemV3!.scannerAnalyses),c().scanner.threshold).multiplyNumber(c().scanner.perAnalysis*P)));
}

/** New paid jobs freeze their yield. Legacy jobs without a V3 receipt retain
 * their original one-component contract; later node purchases never revalue it. */
export function itemSynthesisYieldV3(s:GameState){
 if(!usesItemV3(s))return 1;const level=axiomLevel(s,'C06'),factor=level?BALANCE.prestigeV3.axioms.C06[level-1]:1;
 if(factor===undefined)throw new RangeError('Invalid C06 level');
 return factor*(itemCombinationV3(s,'industrial-singularity').pair?c().combinations.industrial.yield:1);
}
export function itemSynthesisOutputV3(s:GameState,component:ComponentId){
 const remainder=s.itemSystemV3?.synthesisRemainders[component]??0;
 if(!Number.isFinite(remainder)||remainder<0||remainder>=1)throw new RangeError('Invalid synthesis remainder');
 const total=remainder+itemSynthesisYieldV3(s),amount=Math.floor(total+1e-12);return{amount,remainder:Math.max(0,total-amount),multiplier:itemSynthesisYieldV3(s)};
}
export function identifyItemSynthesisV3(s:GameState):GameState{
 if(!usesItemV3(s)||!s.progression.synthesis)return s;const job=s.progression.synthesis;
 if(!Object.hasOwn(BALANCE.components,job.component))throw new RangeError('Unknown synthesis component');
 if(s.itemSystemV3!.synthesisContract)throw new RangeError('Existing paid synthesis receipt');
 return{...s,itemSystemV3:{...s.itemSystemV3!,synthesisContract:{id:job.id,component:job.component as ComponentId,multiplier:itemSynthesisYieldV3(s)}}};
}
export function settleItemSynthesisV3(s:GameState,job:NonNullable<GameState['progression']['synthesis']>){
 if(!usesItemV3(s)||!s.itemSystemV3!.synthesisContract)return{state:s,amount:1};
 const v=s.itemSystemV3!,receipt=v.synthesisContract!;
 if(receipt.id!==job.id||receipt.component!==job.component||!Number.isFinite(receipt.multiplier)||receipt.multiplier<1)throw new RangeError('Mismatched paid synthesis receipt');
 const remainder=v.synthesisRemainders[receipt.component]??0;if(!Number.isFinite(remainder)||remainder<0||remainder>=1)throw new RangeError('Invalid synthesis remainder');
 const total=remainder+receipt.multiplier,amount=Math.floor(total+1e-12);
 return{amount,state:{...s,itemSystemV3:{...v,synthesisContract:null,synthesisRemainders:{...v.synthesisRemainders,[receipt.component]:Math.max(0,total-amount)}}}};
}

/** Challenge shadows use the same rules, but start with their own production,
 * event and paid-work ledgers. Only actual permanent discovery/recipe rights
 * and the next technical ID cross the entry boundary. */
export function itemChallengeStateV3(main:GameState):ItemSystemV3State|undefined{
 if(!usesItemV3(main))return undefined;const v=main.itemSystemV3!;validateItemTrainingCountersV3(v);
 return{...newItemSystemV3(),nextTrainingSequence:v.nextTrainingSequence,archiveBlueprintRight:archiveBlueprintRightV3(main),axiomDiscovered:v.axiomDiscovered,axiomDiscoveryAt:v.axiomDiscoveryAt};
}
export function restoreItemChallengeV3(main:GameState,shadow:GameState):GameState{
 if(!usesItemV3(main)||!usesItemV3(shadow))return main;const v=main.itemSystemV3!,other=shadow.itemSystemV3!;validateItemTrainingCountersV3(v);validateItemTrainingCountersV3(other);
 // Never merge the shadow completion marker: an older paid main job can still
 // be running. Only issued IDs must stay globally unique across both scopes.
 return{...main,itemSystemV3:{...v,nextTrainingSequence:Math.max(v.nextTrainingSequence,other.nextTrainingSequence)}};
}

/** Shares extra work among the longest remaining jobs. Equal jobs receive equal
 * shares; no frame-dependent rotating winner and no recursive transfers. */
export function distributeLongestResearchWorkV3(remaining:number[],budget:number){
 if(!Number.isFinite(budget)||budget<0||remaining.some(n=>!Number.isFinite(n)||n<0))throw new RangeError('Invalid research work allocation');
 const result=remaining.map(()=>0),order=remaining.map((_,i)=>i).sort((a,b)=>remaining[b]-remaining[a]||a-b);
 for(let count=1;count<=order.length&&budget>0;count++){const high=remaining[order[count-1]],low=count<order.length?remaining[order[count]]:0,cost=(high-low)*count,used=Math.min(budget,cost);for(let n=0;n<count;n++)result[order[n]]+=used/count;budget-=used;}return result;
}
function regularItemResearchWorkV3(s:GameState){return s.researchLabs.flatMap(lab=>{if(!lab||lab.intro)return[];const id=lab.jobId??`${lab.id}:${lab.startedAt}`,work=s.progression.work[id];if(work&&(!Number.isFinite(work.required)||work.required<=0||!Number.isFinite(work.done)||work.done<0||work.done>work.required+1e-6||!Number.isFinite(work.speed)||work.speed<=0||!Number.isFinite(work.eventWork??0)||(work.eventWork??0)<0||(work.eventWork??0)>work.done+1e-6))throw new RangeError('Invalid research work contract');return work&&work.required>work.done?[{lab,id,work}]:[];});}
export function itemResearchTransferFractionV3(s:GameState){if(!usesItemV3(s))return 0;const item=itemV3Equipped(s).find(i=>i.type==='lab-drone');return item?Math.min(c().drone.cap,c().drone.rate*itemAbilityStrengthV3(s,item).P):0;}
/** Exact first completion boundary: base work reduces every residual at the
 * same speed; extra work water-fills the longest residuals. */
export function itemResearchBoundaryV3(s:GameState){const fraction=itemResearchTransferFractionV3(s);if(!fraction)return Infinity;const jobs=regularItemResearchWorkV3(s);if(!jobs.length)return Infinity;const remaining=jobs.map(j=>Math.max(0,j.work.required-j.work.done)),speed=jobs[0].work.speed;if(!Number.isFinite(speed)||speed<=0)return Infinity;return Math.min(Math.min(...remaining)/speed,remaining.reduce((a,b)=>a+b,0)/(jobs.length*speed*(1+fraction)));}
export function applyItemResearchTransferV3(s:GameState,work:Record<string,WorkContract>){const fraction=itemResearchTransferFractionV3(s);if(!fraction)return work;const jobs=regularItemResearchWorkV3(s);if(!jobs.length)return work;const budget=jobs.reduce((sum,j)=>sum+Math.max(0,work[j.id].done-j.work.done),0)*fraction,extra=distributeLongestResearchWorkV3(jobs.map(j=>Math.max(0,work[j.id].required-work[j.id].done)),budget);const result={...work};jobs.forEach((j,i)=>{if(extra[i]>0)result[j.id]={...work[j.id],done:Math.min(work[j.id].required,work[j.id].done+extra[i]),eventWork:(work[j.id].eventWork??0)+extra[i]};});return result;}
function grantItemPhotonWorkV3(s:GameState){const item=itemV3Equipped(s).find(i=>i.type==='photonic-array'),jobs=regularItemResearchWorkV3(s);if(!item||!jobs.length)return s;const seconds=c().photon.seconds*itemAbilityStrengthV3(s,item).P*(itemCombinationV3(s,'learning-spiral').complete?c().combinations.learning.photonWork:1),speed=progressionResearchSpeed(s)*(s.labBoostUntil>s.savedAt?2:1),work={...s.progression.work};for(const j of jobs){const delta=Math.min(j.work.required-j.work.done,speed*seconds);work[j.id]={...j.work,done:j.work.done+delta,eventWork:(j.work.eventWork??0)+delta};}return synchronizeItemResearchEndsV3({...s,progression:{...s.progression,work}},s.savedAt);}
export function synchronizeItemResearchEndsV3(s:GameState,at:number){if(!usesItemV3(s))return s;return{...s,researchLabs:s.researchLabs.map(lab=>{if(!lab||lab.intro)return lab;const work=s.progression.work[lab.jobId??`${lab.id}:${lab.startedAt}`];return !work?lab:{...lab,endsAt:Math.max(lab.quoteBasis?.itemV3?.minimumBypassed?0:lab.quoteBasis?.itemV3?.minimumUntil??0,at+Math.max(0,work.required-work.done)/work.speed*1000)};})};}
