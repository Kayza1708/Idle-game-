import type {TelemetryEvent} from '../src/telemetry';
/** Bounded observations of the real domain; no grants, debug stocks or free unlocks. */
import {performance} from 'node:perf_hooks';
import {BALANCE,researchQuote,newGame,registerTap,startTraining,startResearchProject,buyHardwareClass,hardwareIds,hardwarePurchasePreview,exactEconomyValue,newINTScientific,creditRateScientific,computeRateScientific,dataRateScientific,tapCreditsScientific,specialItemEffectQuote,toggleHardwareAutobuyer,queueTraining,offlineTimeLimit,type GameState,type TrainingTrack,type ItemTypeId,type ResearchId} from '../src/economy';
import {ScientificNumber} from '../src/scientificNumber';
import {queueExperiment,analysisQuote} from '../src/experiments';
import {craft,craftModule,craftAffordability,claimLootDrop,equip} from '../src/inventory';
import {learnBlueprint,blueprintQuote} from '../src/blueprints';
import {advance,advanceTo} from '../src/simulation';
import {prestige,buyNode,prestigePreview} from '../src/prestige';
import {achievements,claimAchievement} from '../src/achievements';
import {rollPeriods,claimMission,claimMissionBonus,missionProgress} from '../src/missions';
import {serialize,restore} from '../src/storage';
export type ProfileConfig={play:'continuous'|'short-sessions';priority:'model-first'|'materials-first';seed:number;seconds:number;budgetMs?:number;tapsPerSecond?:0|1|3;build?:'relay'|'chip'|'researcher';claimRewards?:boolean;sessions?:readonly (readonly [number,number])[];absenceMode?:'single-return';maxPrestiges?:1|2;firstPrestigeINT?:1|3;nodePolicy?:'factory-first'|'queue-first'};
export const onlineAt=(play:ProfileConfig['play'],second:number)=>play==='continuous'||second<600||(second>=3600&&second<3900);
export const profileOnlineAt=(config:ProfileConfig,second:number)=>config.sessions?config.sessions.some(([start,end])=>second>=start&&second<end):onlineAt(config.play,second);
export function runNaturalProfile(config:ProfileConfig){
 const horizon=config.absenceMode==='single-return'?54000:7200;
 if(!Number.isSafeInteger(config.seconds)||config.seconds<1||config.seconds>horizon)throw Error(`Profile horizon must be 1..${horizon} seconds`);
 if(config.absenceMode&&(!config.sessions||config.play!=='short-sessions'||config.sessions.reduce((sum,[a,b])=>sum+b-a,0)>1800))throw Error('Single-return requires explicit short sessions with at most 1800 online seconds');
 if(config.firstPrestigeINT!==undefined&&![1,3].includes(config.firstPrestigeINT))throw Error('Invalid first prestige target');
 if(config.maxPrestiges!==undefined&&![1,2].includes(config.maxPrestiges))throw Error('Invalid prestige limit');
 if(config.nodePolicy&&!['factory-first','queue-first'].includes(config.nodePolicy))throw Error('Invalid node policy');
 if(config.tapsPerSecond!==undefined&&![0,1,3].includes(config.tapsPerSecond))throw Error('Invalid tap cadence');
 if(config.sessions&&config.sessions.some(([a,b],i)=>!Number.isSafeInteger(a)||!Number.isSafeInteger(b)||a<0||b<=a||b>horizon||(i>0&&a<config.sessions![i-1][1])))throw Error('Invalid session windows');
 const wallStart=performance.now(),budget=config.budgetMs??60_000;
 let s=newGame(0,`natural-${config.play}-${config.priority}-${config.seed}`),random=config.seed,track:TrainingTrack='quality',onlineSeconds=0,offlineSeconds=0;
 const rng=()=>{random=(Math.imul(random,1664525)+1013904223)>>>0;return random/4294967296;};
 let earnedBuildComparison:unknown=null;
 const achievementReadyAt:Record<string,number>={},missionReadyAt:Record<string,number>={},bonusReadyAt:Record<string,number>={};
 let tapBase=ScientificNumber.zero(),relayBursts=ScientificNumber.zero(),relayBurstCount=0,paidTapCredits=ScientificNumber.zero();
 const equippedTimeline:{at:number;type:string}[]=[];
 const initial={credits:exactEconomyValue(s,'credits').toJSON(),hardware:s.hardware,data:s.data,components:s.components,gems:s.gems};
 const first:Record<string,number>={},blocks:Record<string,Record<string,number>>={},actions:{at:number;family:string;detail:string;credits:ReturnType<ScientificNumber['toJSON']>;data:ReturnType<ScientificNumber['toJSON']>}[]=[];
 const seenEvents=new WeakSet<TelemetryEvent>(),bookedCosts:Record<string,{credits:ScientificNumber;data:ScientificNumber;events:number}>={};
 let dropData=ScientificNumber.zero(),dropCredits=ScientificNumber.zero(),resetData=ScientificNumber.zero();
 const returns:unknown[]=[];
 const spending:Record<string,{credits:ScientificNumber;data:ScientificNumber}>={},checkpoints:unknown[]=[],resets:unknown[]=[],seenHardware=new Set<string>();
 function capturePaidEvents(state:Readonly<GameState>){
  for(const event of [...state.telemetry.recentEvents,...state.telemetry.permanentEvents]){
   if(seenEvents.has(event))continue;seenEvents.add(event);
   if(!['hardware-purchase','training-start','research-start','experiment-start','crafting_queued'].includes(event.type))continue;
   const d=event.details,credits=event.type==='hardware-purchase'?ScientificNumber.fromString(String(d.exactCost??d.cost)):ScientificNumber.zero();
   const data=event.type==='hardware-purchase'?ScientificNumber.zero():d.exactDataCost?ScientificNumber.fromString(String(d.exactDataCost)):ScientificNumber.from(Number(d.dataCost??0));
   const sum=bookedCosts[event.type]??{credits:ScientificNumber.zero(),data:ScientificNumber.zero(),events:0};bookedCosts[event.type]={credits:sum.credits.add(credits),data:sum.data.add(data),events:sum.events+1};
  }
 }
 function observe(){
  const at=s.savedAt/1000;
  if(config.claimRewards&&at%10===0){for(const a of achievements){const progress=a.progress(s);a.thresholds.forEach((target,tier)=>{if(progress>=target)achievementReadyAt[`${a.id}:${tier}`]??=at;});}
   for(const kind of ['daily','weekly','monthly'] as const){const period=s.missions[kind];for(const task of period.tasks)if(missionProgress(s,task)>=task.goal)missionReadyAt[`${kind}:${task.id}`]??=at;if(period.tasks.filter(t=>missionProgress(s,t)>=t.goal).length>=period.required&&period.tasks.length)bonusReadyAt[kind]??=at;}
  }
  capturePaidEvents(s);
  if(s.activeTraining)first.trainingStart??=s.activeTraining.startedAt!/1000;
  for(const lab of s.researchLabs)if(lab)first.researchStart??=lab.startedAt/1000;
  if(s.experiments.active)first.analysisStart??=s.experiments.active.startedAt/1000;
  if(s.crafting.active?.startedAt!==null&&s.crafting.active)first[s.crafting.active.kind==='module'?'moduleStart':'craftStart']??=s.crafting.active.startedAt/1000;
  for(const id of hardwareIds)if(s.hardwareCounts[id]&&!seenHardware.has(id)){seenHardware.add(id);first[`hardware:${id}`]??=at;}
  for(const f of s.materials.families)first[`family:${f}`]??=at;
  if(newINTScientific(s).compare(ScientificNumber.from(1))>=0)first.claimableINT1??=at;
  if(newINTScientific(s).compare(ScientificNumber.from(3))>=0)first.claimableINT3??=at;
  for(const item of s.inventory)first[`item:${item.type}`]??=at;
  for(const id of s.craftedItemTypes)first[`crafted:${id}`]??=at;
  if(s.completedResearch.includes('blueprints'))first.blueprintsResearchComplete??=at;
  if(s.blueprintResearchReward==='consumed')first.blueprintRewardConsumed??=at;
  const chip=s.inventory.find(item=>item.type==='quantum-chip'),relay=s.inventory.find(item=>item.type==='impulse-relay');
  if(!earnedBuildComparison&&s.prestigeCount&&s.hardware>0&&chip&&relay){const chipBuild=equip(s,chip.id),relayBuild=equip(s,relay.id);const quote=(build:GameState)=>({compute:computeRateScientific(build.hardware,build).toJSON(),credits:creditRateScientific(build.hardware,build.level,build).toJSON(),data:dataRateScientific(build).toJSON(),tap:tapCreditsScientific(build).toJSON()});const chipRates=quote(chipBuild),relayRates=quote(relayBuild);earnedBuildComparison={at,actualRegularlyCraftedItems:true,scope:'Instant same-hardware/equal-account equipment contrast; separate copies only, no changes to controller. Relay burst behavior remains in its actual special-effect quote.',chip:chipRates,relay:relayRates,chipEffects:specialItemEffectQuote(chipBuild,chip),relayEffects:specialItemEffectQuote(relayBuild,relay)};}
  if(s.lifetime.researchCompleted)first.researchComplete??=at;
  if(s.lifetime.trainingCompleted)first.trainingComplete??=at;
  if(s.experiments.completedIds.length)first.analysisComplete??=at;
  if(s.materials.knownBlueprints.length)first.extendedBlueprint??=at;
 }
 function act(family:string,detail:string,fn:(state:GameState)=>GameState){
  const before=s;s=fn(s);if(s===before)return false;
  if(family==='drop'){dropData=dropData.add(exactEconomyValue(s,'data').subtract(exactEconomyValue(before,'data')));dropCredits=dropCredits.add(exactEconomyValue(s,'credits').subtract(exactEconomyValue(before,'credits')));}
  const credits=exactEconomyValue(before,'credits').subtract(exactEconomyValue(s,'credits')),data=exactEconomyValue(before,'data').subtract(exactEconomyValue(s,'data'));
  const sum=spending[family]??{credits:ScientificNumber.zero(),data:ScientificNumber.zero()};spending[family]={credits:sum.credits.add(credits),data:sum.data.add(data)};
  actions.push({at:s.savedAt/1000,family,detail,credits:credits.toJSON(),data:data.toJSON()});first[`${family}Action`]??=s.savedAt/1000;observe();return true;
 }
 function blocked(family:string,reasons:string[]){for(const reason of reasons){blocks[family]??={};blocks[family][reason]=(blocks[family][reason]??0)+1;}}
 function factory(){
  if(s.crafting.active||s.crafting.queue.length)return;
  const target:ItemTypeId|undefined=!s.craftedItemCounts['impulse-relay']?'impulse-relay':!s.craftedItemCounts['quantum-chip']?'quantum-chip':s.materials.knownBlueprints.find(id=>!s.craftedItemCounts[id]);
  if(!target)return;
  const blueprint=blueprintQuote(s,target);if(blueprint.canLearn)act('blueprint',target,state=>learnBlueprint(state,target));
  const quote=craftAffordability(s,target);blocked(`craft:${target}`,quote.reasons);
  if(quote.unlocked){const missing=Object.entries(quote.missingModules).find(([,n])=>n>0);if(missing){act('module',missing[0],state=>craftModule(state,missing[0] as 'computeBus'|'dataLattice',1));return;}}
  act('craft',target,state=>craft(state,target));
 }
 function model(){
  if(!s.activeTraining&&!s.trainingQueue.length&&act('training',track,state=>startTraining(state,track)))track=track==='quality'?'efficiency':'quality';
  if(config.nodePolicy&&s.nodes.includes('trainingPlan')){for(let slot=s.trainingQueue.length;slot<2;slot++){if(!act('training-queue',track,state=>queueTraining(state,track)))break;track=track==='quality'?'efficiency':'quality';}}
  const research:ResearchId|undefined=s.researchLevels.dataGeneration<2?'dataGeneration':s.researchLevels.modelArchitecture<1?'modelArchitecture':!s.completedResearch.includes('blueprints')?'blueprints':undefined;
  if(research)act('research',research,state=>startResearchProject(state,research));
  else if(config.build==='researcher'){
   const portfolio:ResearchId[]=['operations','dataGeneration','modelArchitecture','computeOptimization','userScaling','materialAnalysis','blueprintAnalysis','tapAmplification'];
   const desired=portfolio.find(id=>!(id in BALANCE.repeatableResearch)||s.researchLevels[id as keyof typeof s.researchLevels]<3);
   // Skip locked/running/full/too expensive quotes; never fabricate access or pay a free job.
   const pick=portfolio.find(id=>(!(id in BALANCE.repeatableResearch)||s.researchLevels[id as keyof typeof s.researchLevels]<3)&&researchQuote(s,id)?.reason===null);
   if(pick)act('research',pick,state=>startResearchProject(state,pick));else if(desired)blocked('expanded-research',[researchQuote(s,desired)?.reason??'unknown']);
  }
 }
 function analysis(){if(analysisQuote(s,'hardware','short').allowed&&(!s.craftedItemCounts['quantum-chip']||!s.materials.knownBlueprints.length))act('analysis','hardware:short',state=>queueExperiment(state,'hardware',state.savedAt,'short'));}
 function decisions(){
  // Claim once at >=3 INT, between analyses. Running research/crafting continue;
  // any cancelled training is explicitly reported through the real reset preview.
  if(s.prestigeCount<(config.maxPrestiges??1)&&newINTScientific(s).compare(ScientificNumber.from(s.prestigeCount===0?(config.firstPrestigeINT??3):3))>=0&&!s.experiments.active&&(s.prestigeCount===0||s.savedAt-(s.telemetry.runStartedAt??s.savedAt)>=900000)){const before=s,preview=prestigePreview(s);s=prestige(s);if(s!==before){first.prestige??=s.savedAt/1000;resetData=resetData.add(exactEconomyValue(before,'data'));resets.push({at:s.savedAt/1000,gain:preview.claimableINT,reset:preview.reset,jobs:preview.jobs});}}
  const nodeOrder=config.nodePolicy==='queue-first'?['shoppingAgent','trainingPlan','dataArchive1','analysis1','manufacturing1','labs1'] as const:config.nodePolicy==='factory-first'?['shoppingAgent','dataArchive1','analysis1','manufacturing1','labs1','trainingPlan'] as const:['shoppingAgent','dataArchive1','analysis1','manufacturing1','labs1'] as const;
  if(s.prestigeCount){for(const node of nodeOrder){if(!s.nodes.includes(node)){act('node',node,state=>buyNode(state,node));break;}}
   for(const id of ['calculator','sbc'] as const)if(!s.hardwareAutoBuyers[id])act('automation',id,state=>toggleHardwareAutobuyer(state,id));
   const desired=config.build?(config.build==='relay'?'impulse-relay':s.inventory.some(i=>i.type==='quantum-chip')?'quantum-chip':'impulse-relay'):undefined;
   const item=s.inventory.find(item=>!Object.values(s.equipped).includes(item.id)&&(!desired||item.type===desired));if(item&&act('equip',item.type,state=>equip(state,item.id)))equippedTimeline.push({at:s.savedAt/1000,type:item.type});}
  if(config.claimRewards){for(const a of achievements)for(let tier=0;tier<a.thresholds.length;tier++)if(a.progress(s)>=a.thresholds[tier]&&!s.achievementClaims.includes(`${a.id}:${tier}`))act('achievement',`${a.id}:${tier}`,state=>claimAchievement(state,a.id,tier));for(const period of ['daily','weekly','monthly'] as const){for(const task of s.missions[period].tasks)if(!task.claimed&&missionProgress(s,task)>=task.goal)act('mission',`${period}:${task.id}`,state=>claimMission(state,period,task.id));act('mission-bonus',period,state=>claimMissionBonus(state,period));}}
  if(config.priority==='model-first'){model();factory();analysis();}else{factory();analysis();if(s.experiments.active||s.experiments.completedIds.length)model();}
  const pick=hardwareIds.map(id=>hardwarePurchasePreview(s,id)).filter(q=>q.allowed&&!q.creditGain.isZero()).sort((a,b)=>b.creditGain.divide(b.cost).compare(a.creditGain.divide(a.cost))||hardwareIds.indexOf(a.id)-hardwareIds.indexOf(b.id))[0];
  if(pick)act('hardware',pick.id,state=>buyHardwareClass(state,pick.id));
 }
 if(config.claimRewards)s=rollPeriods(s,s.savedAt);observe();if(profileOnlineAt(config,0))decisions();
 for(let elapsed=0;elapsed<config.seconds;){
  if(performance.now()-wallStart>budget)throw Error(`Profile ${config.play}/${config.priority}/${config.seed} exceeded ${budget}ms`);
  const online=profileOnlineAt(config,elapsed),step=online?1:Math.min(config.absenceMode?Infinity:10,config.seconds-elapsed,...(config.sessions??(config.play==='short-sessions'?[[0,600],[3600,3900]]:[])).flatMap(([a,b])=>[a,b]).filter(boundary=>boundary>elapsed).map(boundary=>boundary-elapsed));
  if(online){onlineSeconds+=step;for(let tap=0;tap<(config.tapsPerSecond??1);tap++){const before=s,base=tapCreditsScientific(before),relay=before.inventory.find(i=>i.id===before.equipped.processor&&i.type==='impulse-relay'),q=relay?specialItemEffectQuote(before,relay):null;
    const burst=q?.active&&((relay!.relayTaps??0)+1)%(q.triggerInterval as number)===0?creditRateScientific(before.hardware,before.level,before,before.savedAt,false).multiplyNumber(q.appliedBonusSeconds):ScientificNumber.zero();
    s=registerTap(s,s.savedAt);tapBase=tapBase.add(base);relayBursts=relayBursts.add(burst);paidTapCredits=paidTapCredits.add(exactEconomyValue(s,'credits').subtract(exactEconomyValue(before,'credits')));if(!burst.isZero())relayBurstCount++;
   }if(s.lootDrops.length)act('drop',s.lootDrops[0].id,state=>claimLootDrop(state,state.lootDrops[0].id,rng));}else offlineSeconds+=step;
  if(!online&&config.absenceMode){const before=s,limit=offlineTimeLimit(s),result=advanceTo(s,(elapsed+step)*1000,false,rng,capturePaidEvents);s=result.state;returns.push({departure:{nodes:[...before.nodes],prestiges:before.prestigeCount,hardware:{...before.hardwareCounts},quality:before.qualityLevel,efficiency:before.efficiencyLevel,activeTraining:before.activeTraining?.track??null,credits:exactEconomyValue(before,'credits').toJSON(),data:exactEconomyValue(before,'data').toJSON()},departed:elapsed,returned:elapsed+step,limit,elapsed:result.report.elapsedSeconds,credited:result.report.seconds,lost:result.report.lostSeconds,hardwareBought:result.report.hardware,trainingCompleted:s.lifetime.trainingCompleted-before.lifetime.trainingCompleted,queuedBefore:before.trainingQueue.length,queuedAfter:s.trainingQueue.length,prestiges:s.prestigeCount,claimableINT:newINTScientific(s).toJSON(),credits:exactEconomyValue(s,'credits').toJSON(),data:exactEconomyValue(s,'data').toJSON()});}else s=advance(s,step,online,rng).state;elapsed+=step;
  if(!(config.build||config.claimRewards)||elapsed%10===0||elapsed===config.seconds)observe();if(profileOnlineAt(config,elapsed)&&(elapsed%10===0||!profileOnlineAt(config,elapsed-1))&&elapsed<config.seconds)decisions();
  if(elapsed%600===0||elapsed===config.seconds)checkpoints.push({second:elapsed,credits:exactEconomyValue(s,'credits').toJSON(),data:exactEconomyValue(s,'data').toJSON(),generatedData:exactEconomyValue(s,'lifetimeDataGenerated').toJSON(),claimableINT:newINTScientific(s).toJSON(),prestiges:s.prestigeCount,hardware:{...s.hardwareCounts},families:[...s.materials.families],crafted:{...s.craftedItemCounts},components:{...s.componentInventory},fragments:s.blueprintFragments});
 }
 const loaded=restore(serialize(s),s.savedAt);if(loaded.error)throw Error(loaded.error);
 const gameplay=(state:GameState)=>({credits:exactEconomyValue(state,'credits').toJSON(),data:exactEconomyValue(state,'data').toJSON(),hardware:state.hardwareCounts,components:state.componentInventory,modules:state.modules,materials:state.materials,crafted:state.craftedItemCounts,learned:state.learnedRecipes,nodes:state.nodes,research:state.researchLevels,completed:state.completedResearch,prestiges:state.prestigeCount,blueprintResearchReward:state.blueprintResearchReward,...(config.claimRewards?{missions:state.missions,achievementClaims:state.achievementClaims,gems:state.gems,seasonXP:state.season.xp,gemLedger:state.gemLedger}:{}),equipped:state.equipped,...(config.nodePolicy?{trainingQueue:state.trainingQueue,activeTraining:state.activeTraining,hardwareAutoBuyers:state.hardwareAutoBuyers}: {})});
 if(JSON.stringify(gameplay(s))!==JSON.stringify(gameplay(loaded.state)))throw Error('Profile reload changed gameplay');
 const unmet=['claimableINT1','claimableINT3','prestige','family:semiconductor','family:photonic','family:frontier','family:quantum','crafted:impulse-relay','crafted:quantum-chip','extendedBlueprint'].filter(id=>first[id]===undefined);
 const dataSpent=Object.values(bookedCosts).reduce((sum,cost)=>sum.add(cost.data),ScientificNumber.zero()),generated=exactEconomyValue(s,'lifetimeDataGenerated'),accounted=exactEconomyValue(s,'data').add(resetData).add(dataSpent);
 const relativeDataError=Math.abs(accounted.toNumber()-generated.toNumber())/Math.max(1,generated.toNumber());
 if(relativeDataError>1e-10)throw Error(`Profile Data ledger incomplete: ${relativeDataError}`);
 const balances={allBookedData:generated.toJSON(),dropData:dropData.toJSON(),passivelyProducedData:generated.subtract(dropData).toJSON(),dropCredits:dropCredits.toJSON(),spentData:dataSpent.toJSON(),resetData:resetData.toJSON(),relativeDataError};
 const tapQuoted=tapBase.add(relayBursts),tapError=Math.abs(tapQuoted.toNumber()-paidTapCredits.toNumber())/Math.max(1,tapQuoted.toNumber());if(tapError>1e-9)throw Error(`Tap ledger mismatch ${tapError}`);
 const rewards=config.claimRewards?{achievementReadyAt,missionReadyAt,bonusReadyAt,achievementClaims:[...s.achievementClaims],points:s.achievementPoints,gems:s.gems,seasonXP:s.season.xp,gemIncomeBySource:Object.fromEntries(s.gemLedger.filter(x=>x.amount>0).reduce((map,x)=>map.set(x.source,(map.get(x.source)??0)+x.amount),new Map<string,number>())),missions:Object.fromEntries((['daily','weekly','monthly'] as const).map(kind=>[kind,{...s.missions[kind],tasks:s.missions[kind].tasks.map(task=>({...task,progress:missionProgress(s,task)}))}]))}:null;
 const finalCraft=craftAffordability(s,'quantum-chip'),learning=blueprintQuote(s,'quantum-chip');
 return{config,initial,first,unmet,rewards,equippedTimeline,tapIncome:{base:tapBase.toJSON(),relayBursts:relayBursts.toJSON(),relayBurstCount,total:paidTapCredits.toJSON(),relativeError:tapError},earnedBuildComparison,balances,bookedCosts:Object.fromEntries(Object.entries(bookedCosts).map(([type,cost])=>[type,{credits:cost.credits.toJSON(),data:cost.data.toJSON(),events:cost.events}])),finalChipBlock:{blueprint:learning,reasons:finalCraft.reasons,missingComponents:finalCraft.missingComponents,missingModules:finalCraft.missingModules,missingData:finalCraft.data.missingExact.toJSON()},onlineSeconds,offlineSeconds,taps:s.lifetime.taps,resets,returns,manualActionDebits:Object.fromEntries(Object.entries(spending).map(([family,sum])=>[family,{credits:sum.credits.toJSON(),data:sum.data.toJSON()}])),blocks,actions,checkpoints,final:{...gameplay(s),items:s.inventory.map(i=>({type:i.type,rarity:i.rarity,level:i.level,forge:i.forge??0})),equipped:Object.values(s.equipped).map(id=>s.inventory.find(i=>i.id===id)?.type),trainingCompleted:s.lifetime.trainingCompleted,researchCompleted:s.lifetime.researchCompleted,fragments:s.blueprintFragments,knownBlueprints:s.materials.knownBlueprints,claimableINT:newINTScientific(s).toJSON()},reload:true};
}
/** Persist bounded trace samples; costs and session assertions use the complete trace. */
export function summarizeNaturalProfile({actions,...profile}:ReturnType<typeof runNaturalProfile>){
 const counts:Record<string,number>={};for(const action of actions)counts[action.family]=(counts[action.family]??0)+1;
 const outsideSessions=actions.filter(action=>!profileOnlineAt(profile.config,action.at)).length;
 if(outsideSessions)throw Error('Manual actions outside the declared sessions');
 return{...profile,manualActionSummary:{total:actions.length,byFamily:counts,outsideSessions,omittedTraceActions:Math.max(0,actions.length-30)},sampledManualActions:actions.length<=30?actions:[...actions.slice(0,20),...actions.slice(-10)]};
}
