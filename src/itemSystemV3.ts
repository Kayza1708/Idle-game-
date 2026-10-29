/** V3 domain implementation. Normal saves remain on their original rules until
 * the complete versioned migration is ready. No clocks, RNG, IO or UI here. */
import {BALANCE,equippedItems,hardwareIds,itemTypes,classComputeTerms,
  type GameState,type Item,type ItemFamily,type Rarity} from './economy';
import {itemAmplifier,legacyItemFactorScientific,integrationLevel,modelCore,modelFactor} from './progression';
import {dataRateScientific} from './economy';
import {challengeNetworkLinkAllowed,challengeFamilyBonus} from './challengeStages';
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
  archiveBlueprintRight:boolean;
  axiomDiscovered:boolean;
  axiomDiscoveryAt:number|null;
};
export function newItemSystemV3():ItemSystemV3State{return{version:3,dataProduced:S.zero().toJSON(),knowledgeProduced:S.zero().toJSON(),componentsProduced:S.zero().toJSON(),runMinutes:0,nextTrainingSequence:1,lastCompletedTrainingSequence:0,lastTrainingCompletionCause:null,learningStreak:0,lastLearningTrack:null,scannerAnalyses:0,archiveBlueprintRight:false,axiomDiscovered:false,axiomDiscoveryAt:null};}
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
 }
 if(combo.pair)result=result.multiplyNumber(c().combinations.compute.factor);
 return result.multiply(itemBaseFactorScientificV3(s,'processor'));
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
  if(research&&item.type==='blueprint-archive')result=result.multiply(S.from(c().blueprint.base).pow(P).multiplyNumber(1+c().blueprint.perBlueprint*P*Object.values(s.blueprintMastery).filter(level=>level>=1).length));
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
 }return result;
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
/** Run data/time/series reset at ordinary prestige; independently produced
 * knowledge/components survive until the actual axiom-cycle boundary. */
export function resetItemProductionV3(s:GameState,kind:'prestige'|'axiom'):GameState{
 if(!usesItemV3(s))return s;const v=s.itemSystemV3!;
 return{...s,itemSystemV3:{...v,dataProduced:S.zero().toJSON(),runMinutes:0,learningStreak:0,lastLearningTrack:null,...(kind==='axiom'?{knowledgeProduced:S.zero().toJSON(),componentsProduced:S.zero().toJSON()}:{} )}};
}

/** Restores the old researchArchive -> I04 acquisition right. Learning stays an
 * explicit one-time action; this grants neither fragments nor a free item. */
export function archiveBlueprintRightV3(s:GameState){return usesItemV3(s)&&(s.itemSystemV3!.archiveBlueprintRight||s.insightArchiveBlueprint||s.nodes.includes('I04')||s.progression.known.includes('I04')||(s.learnedRecipes??[]).includes('insight-archive'));}

function validateItemTrainingCountersV3(v:ItemSystemV3State){
 if(!Number.isSafeInteger(v.nextTrainingSequence)||v.nextTrainingSequence<1||!Number.isSafeInteger(v.lastCompletedTrainingSequence)||v.lastCompletedTrainingSequence<0||v.lastCompletedTrainingSequence>=v.nextTrainingSequence||!Number.isSafeInteger(v.learningStreak)||v.learningStreak<0||v.learningStreak>c().logic.maxStreak||![null,'quality','efficiency'].includes(v.lastLearningTrack)||![null,'regular','bonus','intro'].includes(v.lastTrainingCompletionCause))throw new RangeError('Invalid V3 training counters');
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
 return{...s,itemSystemV3:{...v,lastCompletedTrainingSequence:id,lastTrainingCompletionCause:job.intro?'intro':cause,learningStreak,lastLearningTrack}};
}
