import { BALANCE, addCredits,addData,addCreditsScientific,addDataScientific,addResearchScientific, averageDataSynergy, GameState, trainingRate,trainingDataCost, creditRate,creditRateScientific, dataRate,dataRateScientific, researchRate,researchRateScientific, researchLabCount, hardwareCost, classCompute, buyHardwareClass, maxAffordable, hasNode, isRepeatableResearch, milestoneBonus,tapDropMultiplier, startResearchProject,startQueuedTrainingIfAffordable,rollPassiveComponent,computeRate,computeRateScientific,usersRate,newINT,newINTScientific,newGame,tapCredits,startTraining,queueTraining,selectScannerTarget,passiveCircuitRate,grantComponents,safeEconomyAdd,MAX_ECONOMY_VALUE,hardwareIds,registerTap,permanentFactor,creditMultiplierFromINT,creditMultiplierFromAxioms,hardwareCostScientific,canAffordScientificCreditCost,hardwareAutobuyerUnlocked,shoppingAgentUnlocked,exactEconomyValue,repeatableResearchIds,repeatableResearchDataCost,researchProjectDataCost,PrestigeUpgradeId,ItemTypeId,ComponentId,ExperimentId,Rarity,prestigeUpgradeCost,upgradeLevel,dataSynergyScientific,intSynergyScientific,productionBreakdown } from './economy';
import { completeExperiment, queueExperiment,runAnalysisPlanner } from './experiments';
import { rollPeriods,claimMission,claimMissionBonus,missionRewardClaimable,MissionKind } from './missions';
import { achievements,claimAchievement } from './achievements';
import { claimSeasonReward,seasonClaimable,seasonLevel } from './season';
import { challenges,claimChallenge,prestigeGate,totalMastery } from './retention';
import { craft,craftModule,craftAffordability,equip,forgeItem,fuseItems,claimLootDrop,settleCrafting,runCraftingPlanner } from './inventory';
import { buyNode } from './prestige';
import { updateOnboarding } from './onboarding';
import { addEvent, addMetrics,addSnapshot } from './telemetry';
import {ScientificNumber,type ScientificJSON} from './scientificNumber';
import {resolvePinnedGoal} from './nextGoal';

export type AdvanceReport = { credits:number; data:number; research:number; exactCredits:ScientificJSON;exactData:ScientificJSON;levels:number;researchCompleted:number;experiments:number;craftingCompleted:number;hardware:number;seconds:number;elapsedSeconds:number;lostSeconds:number;components:Partial<GameState['componentInventory']>;newQuestRewards:number;newSeasonRewards:number; analysisResults:NonNullable<GameState['experiments']['lastResult']>[] };
const emptyReport=():AdvanceReport=>({credits:0,data:0,research:0,exactCredits:{m:0,e:0},exactData:{m:0,e:0},levels:0,researchCompleted:0,experiments:0,craftingCompleted:0,hardware:0,seconds:0,elapsedSeconds:0,lostSeconds:0,components:{},newQuestRewards:0,newSeasonRewards:0,analysisResults:[]});
export type ResearchCompletionStep = 'project-complete'|'reward-applied'|'unlock-applied'|'queue-checked'|'missions-achievements-ready'|'state-ready-for-save-render';

/** Convert wall time to the save's explicit simulation timeline. */
export const simulationNow = (state:GameState, wallNow=Date.now()) => wallNow + state.clockOffsetMs;

function cloneForSimulation(state:GameState):GameState {
  return {
    ...state,
    nodes:[...state.nodes],axiomUpgrades:[...state.axiomUpgrades],analysisPlanner:{...state.analysisPlanner},craftingPlanner:{...state.craftingPlanner},prestigeAgent:{...state.prestigeAgent},runMilestoneEdges:[...state.runMilestoneEdges],scannerRewards:[...state.scannerRewards],runRecyclingRewards:[...state.runRecyclingRewards],runMilestoneClasses:[...state.runMilestoneClasses],lifetime:{...state.lifetime,hardwareClasses:[...state.lifetime.hardwareClasses],itemTypes:[...state.lifetime.itemTypes]},gemLedger:[...state.gemLedger],processedGemPurchases:[...state.processedGemPurchases], completedResearch:[...state.completedResearch],researchLevels:{...state.researchLevels}, breakthroughs:[...state.breakthroughs], inventory:state.inventory.map(item=>({...item})), lootDrops:(state.lootDrops??[]).map(drop=>({...drop})), equipped:{...state.equipped}, pity:{...state.pity},
    researchLabs:state.researchLabs.map(lab=>lab?{...lab}:null),trainingQueue:state.trainingQueue.map(job=>({...job})),
    experiments:{...state.experiments,active:state.experiments.active?{...state.experiments.active}:null,lastResult:state.experiments.lastResult?{...state.experiments.lastResult,components:{...state.experiments.lastResult.components}}:null,queue:[...state.experiments.queue],completedIds:[...state.experiments.completedIds]},
    automation:{...state.automation},
    missions:{daily:{...state.missions.daily,tasks:state.missions.daily.tasks.map(task=>({...task}))},weekly:{...state.missions.weekly,tasks:state.missions.weekly.tasks.map(task=>({...task}))},monthly:{...state.missions.monthly,tasks:state.missions.monthly.tasks.map(task=>({...task}))},mailbox:state.missions.mailbox.map(entry=>({...entry}))},
    achievementClaims:[...state.achievementClaims], ads:{...state.ads,counts:{...state.ads.counts},transactions:[...state.ads.transactions]}, settings:{...state.settings},
    telemetry:{...state.telemetry,recentEvents:[...state.telemetry.recentEvents],permanentEvents:[...state.telemetry.permanentEvents],metrics:state.telemetry.metrics.map(bucket=>({...bucket,income:{...bucket.income},offlineRewards:{...bucket.offlineRewards}})),snapshots:[...state.telemetry.snapshots],diagnostics:{...state.telemetry.diagnostics},archivedMetrics:{...state.telemetry.archivedMetrics,income:{...state.telemetry.archivedMetrics.income},offlineRewards:{...state.telemetry.archivedMetrics.offlineRewards}},prestigeHistory:[...state.telemetry.prestigeHistory]},
    story:{...state.story,queue:[...state.story.queue],seen:[...state.story.seen]},
  };
}

function autobuy(state:GameState,shoppingDue:boolean,otherDue:boolean) {
  let next=state;
  const targets=hardwareIds.filter(id=>hardwareAutobuyerUnlocked(next,id)&&next.hardwareAutoBuyers[id]&&(shoppingAgentUnlocked(next)&&(id==='calculator'||id==='sbc')?shoppingDue:otherDue));
  for(const id of targets){
    const cost=hardwareCostScientific(id,next.hardwareCounts[id],next),reserve=shoppingAgentUnlocked(next)&&(id==='calculator'||id==='sbc')?exactEconomyValue(next,'credits').multiplyNumber((next.automation.reservePercent??0)):ScientificNumber.from(next.automation.reserve);
    if(exactEconomyValue(next,'credits').subtract(cost).compare(reserve)>=0)next=buyHardwareClass(next,id,1);
  }
  if(!otherDue||shoppingAgentUnlocked(next)||!next.automation.enabled||!milestoneBonus(next,'automation'))return next;
  const targetsLegacy=next.automation.target?[next.automation.target]:next.discovered,candidates=targetsLegacy.map(id=>{const cost=hardwareCost(id,next.hardwareCounts[id],next);const gain=classCompute(next,id,next.hardwareCounts[id]+1)-classCompute(next,id);return{id,cost,score:gain/cost}}).sort((a,b)=>b.score-a.score),pick=candidates.find(x=>canAffordScientificCreditCost(next,hardwareCostScientific(x.id,next.hardwareCounts[x.id],next),next.automation.reserve));
  return pick?buyHardwareClass(next,pick.id,1):next;
}

/**
 * Settles every lab that ended at or before the current simulation time.
 *
 * Keep removal and reward on the same newly-created state. Assigning the result of
 * `labs.map()` to `next.researchLabs` while reassigning `next` inside that callback
 * writes the mapped array to the stale object (the assignment target is evaluated
 * before the callback). The completed lab then survives and is completed forever.
 */
/** Starts the oldest queued project as soon as Labore III can actually pay and a lab is free. */
export function startQueuedResearchIfAffordable(state:GameState):GameState {
  if(!hasNode(state,'labs3',1)||state.researchQueue.length===0)return state;
  const queued=state.researchQueue[0],started=startResearchProject(state,queued);
  const didStart=started.researchLabs.some(lab=>lab?.id===queued)&&!state.researchLabs.some(lab=>lab?.id===queued);
  return didStart?{...started,researchQueue:started.researchQueue.slice(1)}:state;
}

export function settleResearchCompletions(state:GameState,trace:((step:ResearchCompletionStep)=>void)=()=>{}):GameState {
  const finished=state.researchLabs.filter((lab):lab is NonNullable<typeof lab>=>!!lab&&lab.endsAt<=state.savedAt+.1);
  if(!finished.length)return state;
  const finishedIds=new Set(finished.map(lab=>lab.id));
  let next:GameState={...state,researchLabs:state.researchLabs.map(lab=>lab&&finishedIds.has(lab.id)?null:lab)};
  const phases={...state.telemetry.diagnostics.researchCompletionPhases};const mark=(step:ResearchCompletionStep)=>{trace(step);phases[step]=(phases[step]??0)+1;};
  for(const lab of finished){
    mark('project-complete');
    if(isRepeatableResearch(lab.id)){if(next.researchLevels[lab.id]>=lab.level)continue;next={...next,researchLevels:{...next.researchLevels,[lab.id]:lab.level},lifetime:{...next.lifetime,researchCompleted:next.lifetime.researchCompleted+1},runResearchCompleted:next.runResearchCompleted+1};}else{if(next.completedResearch.includes(lab.id))continue;next={...next,completedResearch:[...next.completedResearch,lab.id],lifetime:{...next.lifetime,researchCompleted:next.lifetime.researchCompleted+1},runResearchCompleted:next.runResearchCompleted+1};}
    mark('reward-applied');
    mark('unlock-applied');
    next=addEvent(next,'research-complete',next.savedAt,{id:lab.id,level:lab.level,dataCost:lab.dataCost,durationSeconds:lab.durationSeconds,startedAt:lab.startedAt,endsAt:lab.endsAt,actualDurationSeconds:(lab.endsAt-lab.startedAt)/1000});
  }
  mark('queue-checked');
  next=startQueuedResearchIfAffordable(next);
  mark('missions-achievements-ready');
  mark('state-ready-for-save-render');
  return {...next,telemetry:{...next.telemetry,diagnostics:{...next.telemetry.diagnostics,researchCompletionPhases:phases}}};
}

function autoStartModelTraining(state:GameState):GameState {
  const queued=startQueuedTrainingIfAffordable(state);if(queued!==state)return queued;
  if(!hasNode(state,'labs5',1)||state.activeTraining||state.trainingQueue.length)return state;
  const track=state.qualityLevel<=state.efficiencyLevel?'quality':'efficiency';
  return startTraining(state,track);
}

export function advance(state:GameState,seconds:number,active=false,rng=Math.random):{state:GameState;report:AdvanceReport} {
  if(!Number.isFinite(seconds)||seconds<=0)return{state,report:emptyReport()};
  const limit=Math.min(BALANCE.maxOfflineSeconds,Math.max(state.offlineCapacitySeconds,BALANCE.baseOfflineSeconds*(1+milestoneBonus(state,'offline')))),total=Math.max(0,Math.min(seconds,limit));
  const pinnedReachedBefore=state.pinnedGoal?resolvePinnedGoal(state,state.pinnedGoal)?.reached??false:false,questReadyBefore=(['daily','weekly','monthly'] as MissionKind[]).filter(k=>missionRewardClaimable(state,k)).length,seasonReadyBefore=seasonClaimable(state);let left=total,iterations=0,levels=0,experiments=0,craftingCompleted=0,hardware=0,generatedCredits=0,generatedData=0,generatedResearch=0,generatedCreditsExact=ScientificNumber.zero(),generatedDataExact=ScientificNumber.zero(),components:Partial<GameState['componentInventory']>={},analysisResults:NonNullable<GameState['experiments']['lastResult']>[]=[],next=rollPeriods(cloneForSimulation(state),state.savedAt);
  while(left>1e-9&&iterations++<200_000) {
    next=autoStartModelTraining(next);
    const now=next.savedAt,goal=next.activeTraining?.workRequired??Infinity,rate=next.activeTraining?trainingRate(next.hardware,next,now):0;
    const toLevel=next.activeTraining?(goal-next.training)/rate:Infinity;
    const shoppingActive=shoppingAgentUnlocked(next)&&(['calculator','sbc'] as const).some(id=>next.hardwareAutoBuyers[id]),otherAutoActive=next.automation.enabled||hardwareIds.some(id=>next.hardwareAutoBuyers[id]&&!(shoppingAgentUnlocked(next)&&(id==='calculator'||id==='sbc'))),autoActive=shoppingActive||otherAutoActive,autoInterval=otherAutoActive?(Object.values(next.hardwareAutoBuyers).some(Boolean)?BALANCE.hardwareAutobuyerInterval:BALANCE.simulationStep):Infinity,toAuto=Math.min(otherAutoActive?autoInterval-next.automation.elapsed:Infinity,shoppingActive?10-(next.automation.shoppingElapsed??0):Infinity);
    const plannerActive=false,toPlanner=plannerActive?Math.min(10-next.analysisPlanner.elapsed,10-next.craftingPlanner.elapsed):Infinity,prestigeAgentActive=(next.axiomUpgradeLevels.axiomAutomation??0)>0&&next.prestigeAgent.enabled,toPrestigeAgent=prestigeAgentActive?10-next.prestigeAgent.elapsed:Infinity;
    const toCrafting=next.crafting.active?.endsAt===null?Infinity:next.crafting.active?Math.max(0,(next.crafting.active.endsAt-now)/1000):Infinity;
    const toExperiment=next.experiments.active?Math.max(0,(next.experiments.active.endsAt-now)/1000):Infinity;
    const toResearch=Math.min(...next.researchLabs.map(lab=>lab?Math.max(0,(lab.endsAt-now)/1000):Infinity));
    const toPeriod=Math.min(...(['daily','weekly','monthly'] as const).map(kind=>Math.max(0,(next.missions[kind].endsAt-now)/1000)));
    const toBoost=Math.min(next.creditBoostUntil>now?(next.creditBoostUntil-now)/1000:Infinity,next.overclock.activeUntil>now?(next.overclock.activeUntil-now)/1000:Infinity,next.overclock.cooldownUntil>now?(next.overclock.cooldownUntil-now)/1000:Infinity);
    // Keep integration boundaries on the persistent timeline. Otherwise an
    // external save/advance split creates a new Euler step and changes rates
    // that depend on resources produced during the preceding step.
    const stepMs=30_000,msToStep=stepMs-(Math.max(0,next.savedAt)%stepMs),toStep=msToStep/1000;
    let slice=Math.min(left,toStep,toLevel,toAuto,toPlanner,toPrestigeAgent,toCrafting,toExperiment,toResearch,toPeriod,toBoost);
    if(slice<1e-8) slice=Math.min(left,1e-6);
    const dataExact=dataRateScientific(next).multiplyNumber(slice),data=dataExact.toNumber(MAX_ECONOMY_VALUE),currentDataSynergy=dataSynergyScientific(next),meanDataSynergy=averageDataSynergy(next,data,currentDataSynergy),creditsExact=creditRateScientific(next.hardware,next.level,next,now).divide(currentDataSynergy).multiplyNumber(meanDataSynergy*slice),researchExact=researchRateScientific(next,now).multiplyNumber(slice);const credits=creditsExact.toNumber(MAX_ECONOMY_VALUE),research=researchExact.toNumber(MAX_ECONOMY_VALUE);if(![slice,rate].every(Number.isFinite))return{state,report:emptyReport()};generatedCredits=safeEconomyAdd(generatedCredits,credits);generatedData=safeEconomyAdd(generatedData,data);generatedResearch=safeEconomyAdd(generatedResearch,research);generatedCreditsExact=generatedCreditsExact.add(creditsExact);generatedDataExact=generatedDataExact.add(dataExact);
    next=startQueuedResearchIfAffordable(addResearchScientific(addDataScientific(addCreditsScientific(next,creditsExact),dataExact),researchExact));const circuitProgress=next.passiveCircuitProgress+passiveCircuitRate(next)*slice,circuits=Math.floor(circuitProgress);next={...next,passiveCircuitProgress:circuitProgress-circuits};if(circuits>0){const found:Partial<GameState['componentInventory']>={};let archiveProgress=next.componentRemainder;for(let i=0;i<circuits;i++){const id=rollPassiveComponent(next,rng),bonus=(next.axiomUpgradeLevels.axiomArchive??0)>0&&(archiveProgress+=.25)>=1?1:0;if(bonus)archiveProgress-=1;found[id]=(found[id]??0)+1+bonus;components[id]=(components[id]??0)+1+bonus;}next={...next,componentRemainder:archiveProgress};next=addEvent(grantComponents(next,found),'component-found',now,{source:'passive-hardware',mode:active?'active':'offline',components:JSON.stringify(found),total:Object.values(found).reduce((a,b)=>a+(b??0),0)});}const activeLabs=next.researchLabs.filter(Boolean).length;next.lifetime.labSeconds+=activeLabs*slice;
    const trainingWork=rate*slice;next.training+=trainingWork;if(next.activeTraining){const key=active?'onlineWork':'offlineWork';next.activeTraining={...next.activeTraining,[key]:(next.activeTraining[key]??0)+trainingWork};} next.savedAt+=slice*1000;next=rollPeriods(next,next.savedAt); next.automation.elapsed+=slice;next.automation.shoppingElapsed=(next.automation.shoppingElapsed??0)+slice;next.analysisPlanner.elapsed+=slice;next.craftingPlanner.elapsed+=slice;if(prestigeAgentActive)next.prestigeAgent.elapsed+=slice; left-=slice;
    if(next.activeTraining&&next.training+1e-7>=goal){const completed=next.activeTraining,track=completed.track,actualDuration=completed.startedAt===undefined?null:(next.savedAt-completed.startedAt)/1000;next.training=0;next.activeTraining=null;next.level++;next.lifetime.trainingCompleted++;next.runTrainingCompleted++;if(track==='quality')next.qualityLevel++;else next.efficiencyLevel++;levels++;next=addEvent(next,'training-complete',next.savedAt,{track,level:next.level,creditCost:completed.creditCost,dataCost:completed.dataCost??0,baseDuration:completed.baseDuration??completed.workRequired,effectiveRate:completed.startingRate??0,expectedDuration:(completed.baseDuration??completed.workRequired)/(completed.startingRate??1),actualDuration,onlineWork:completed.onlineWork??0,offlineWork:completed.offlineWork??0});}
    if(autoActive){const shoppingDue=shoppingActive&&(next.automation.shoppingElapsed??0)+1e-7>=10,otherDue=otherAutoActive&&next.automation.elapsed+1e-7>=autoInterval;if(shoppingDue||otherDue){if(shoppingDue)next.automation.shoppingElapsed=(next.automation.shoppingElapsed??0)%10;if(otherDue)next.automation.elapsed%=autoInterval;const before=next.hardware;next=autobuy(next,shoppingDue,otherDue);hardware+=next.hardware-before;}}
    if(prestigeAgentActive&&next.prestigeAgent.elapsed+1e-7>=10){next.prestigeAgent.elapsed%=10;next=simulationRunPrestigeAgent(next)}
    if(plannerActive&&(next.analysisPlanner.elapsed+1e-7>=10||next.craftingPlanner.elapsed+1e-7>=10)){if(next.analysisPlanner.elapsed+1e-7>=10){next.analysisPlanner.elapsed%=10;next=runAnalysisPlanner(next,next.savedAt)}if(next.craftingPlanner.elapsed+1e-7>=10){next.craftingPlanner.elapsed%=10;next=runCraftingPlanner(next)}}
    if(next.experiments.active&&next.experiments.active.endsAt<=next.savedAt+.1){const id=next.experiments.active.id;next=completeExperiment(next,next.savedAt,rng,active?'active':'offline');if(!next.experiments.active||next.experiments.active.id!==id){experiments++;const result=next.experiments.lastResult;if(result&&result.id===id){analysisResults.push(result);for(const [component,amount] of Object.entries(result.components))components[component as keyof typeof components]=(components[component as keyof typeof components]??0)+(amount??0);}}}
    const craftedBefore=next.lifetime.itemsCrafted+Object.values(next.modules).reduce((a,b)=>a+b,0);next=settleCrafting(next);craftingCompleted+=next.lifetime.itemsCrafted+Object.values(next.modules).reduce((a,b)=>a+b,0)-craftedBefore;
    next=settleResearchCompletions(next);
    if(next.researchQueue.length>0&&hasNode(next,'labs3',1)&&next.researchLabs.some((lab,index)=>index<researchLabCount(next)&&!lab)){const queued=next.researchQueue[0],started=startResearchProject(next,queued),didStart=started.researchLabs.some(lab=>lab?.id===queued)&&!next.researchLabs.some(lab=>lab?.id===queued);next=didStart?{...started,researchQueue:started.researchQueue.slice(1)}:started;}
    next=addSnapshot(next,{at:next.savedAt,runSeconds:Math.max(0,(next.savedAt-(next.telemetry.runStartedAt??next.savedAt))/1000),credits:next.credits,creditsPerSecond:creditRate(next.hardware,next.level,next,next.savedAt),compute:computeRate(next.hardware,next),computePerSecond:computeRate(next.hardware,next),users:usersRate(next),data:next.data,dataPerSecond:dataRate(next),research:next.researchPoints,researchPerSecond:researchRate(next),gems:next.gems,hardwareCounts:{...next.hardwareCounts},modelLevel:next.level,qualityLevel:next.qualityLevel,efficiencyLevel:next.efficiencyLevel,activeTraining:next.activeTraining?.track??null,activeResearch:next.researchLabs.filter(Boolean).map(x=>x!.id).join('|'),prestigeClaim:newINT(next),activeLabs:next.researchLabs.filter(Boolean).length});
  }
  if(left>1e-9)return{state,report:emptyReport()};
  next=updateOnboarding(rollPeriods(next,next.savedAt));
  if(active){next.lifetime.activeSeconds+=total;const dropMult=tapDropMultiplier(next);const interval=Math.max(8,BALANCE.worldDropSeconds/dropMult);const progress=(next.worldDropProgress??0)+total;const spawn=Math.floor(progress/interval);next.worldDropProgress=progress-spawn*interval;next.lootDrops=(next.lootDrops??[]).filter(d=>d.expiresAt>next.savedAt);for(let i=0;i<spawn&&next.lootDrops.length<3;i++){const seed=next.nextId++;next.lootDrops.push({id:`drop-${seed}`,spawnedAt:next.savedAt,expiresAt:next.savedAt+8000,x:8+(seed*37)%84,y:12+(seed*53)%68,variant:seed%17===0?'core':seed%5===0?'cache':'coin'});}}
  const offline=!active&&total>10;
  next=addMetrics(next,next.savedAt,{activeSeconds:active?total:0,offlineSeconds:offline?total:0,passive:offline?0:generatedCredits,offline:offline?generatedCredits:0,offlineCredits:offline?generatedCredits:0,offlineData:offline?generatedData:0,offlineResearch:offline?generatedResearch:0});
  const pinnedReachedAfter=next.pinnedGoal?resolvePinnedGoal(next,next.pinnedGoal)?.reached??false:false;if(!pinnedReachedBefore&&pinnedReachedAfter)next=addEvent(next,'goal-completed',next.savedAt,{goal:JSON.stringify(next.pinnedGoal)});
  if(seconds>=60)next=addEvent(next,'offline-return',next.savedAt,{elapsedSeconds:seconds,creditedSeconds:total,lostSeconds:Math.max(0,seconds-total)});return {state:next,report:{credits:generatedCredits,data:generatedData,research:generatedResearch,exactCredits:generatedCreditsExact.toJSON(),exactData:generatedDataExact.toJSON(),levels,researchCompleted:next.lifetime.researchCompleted-state.lifetime.researchCompleted,experiments,craftingCompleted,hardware,seconds:total,elapsedSeconds:seconds,lostSeconds:Math.max(0,seconds-total),components,newQuestRewards:Math.max(0,(['daily','weekly','monthly'] as MissionKind[]).filter(k=>missionRewardClaimable(next,k)).length-questReadyBefore),newSeasonRewards:Number(seasonClaimable(next)&&!seasonReadyBefore),analysisResults}};
}

export function advanceTo(state:GameState,wallNow:number,active=false,rng=Math.random) {
  const now=simulationNow(state,wallNow);
  const elapsed=Math.max(0,(now-state.savedAt)/1000),result=advance(state,elapsed,active,rng);
  result.report.elapsedSeconds=elapsed;result.report.lostSeconds=Math.max(0,elapsed-result.report.seconds);
  if(!active&&elapsed>10&&elapsed>result.report.seconds)result.state=addMetrics(result.state,result.state.savedAt,{offlineSeconds:elapsed-result.report.seconds});
  const limit=Math.min(BALANCE.maxOfflineSeconds,Math.max(state.offlineCapacitySeconds,BALANCE.baseOfflineSeconds*(1+milestoneBonus(state,'offline'))));if(now>state.savedAt&&now-state.savedAt>limit*1000) result.state.savedAt=now;
  return result;
}

/** Fast-forward on the same persistent timeline; subsequent wall seconds remain immediately productive. */
export function debugAdvance(state:GameState,seconds:number,wallNow=Date.now()) {
  const synchronized=advanceTo(state,wallNow).state;
  const result=advance(synchronized,seconds);
  result.state.clockOffsetMs+=result.report.seconds*1000;
  return result;
}


export type BalanceCheckpoint = {
  elapsed:number;
  credits:number;
  data:number;
  researchPoints:number;
  totalINT:number;
  unspentINT:number;
  prestiges:number;
  hardware:number;
  discoveredHardware:number;
  modelLevel:number;
  qualityLevel:number;
  efficiencyLevel:number;
  completedResearch:number;
  repeatableResearchLevels:number;
  researchStarted:number;
  researchCompleted:number;
  inventory:number;
  itemTypes:number;
  itemsCrafted:number;
  itemsFused:number;
  forgeUpgrades:number;
  componentsEarned:number;
  componentTypesOwned:number;
  componentTotal:number;
  experimentsCompleted:number;
  creditsPerSecond:number;
  dataPerSecond:number;
  researchPerSecond:number;
  computePerSecond:number;
  gems:number;
  achievementPoints:number;
};


export type SimulationDiagnostic = {severity:'INFO'|'WARN'|'CRITICAL';code:string;message:string};
export type PrestigeDiagnostic = {id:PrestigeUpgradeId;depth:number;cost:number;bought:boolean;reason:string};
export type CraftDiagnostic = {type:ItemTypeId;craftable:boolean;missingData:number;missingBlueprints:number;missingModules:Record<string,number>;missingComponents:Record<string,number>};
export type BalanceDiagnostics = {
  warnings:SimulationDiagnostic[];
  prestige:PrestigeDiagnostic[];
  crafting:CraftDiagnostic[];
  components:Record<string,number>;
  hardwareCounts:Record<string,number>;
  totalMastery:number;
  seasonLevel:number;
};

function diagnoseBalanceState(s:GameState):BalanceDiagnostics{
  const prestige=(Object.keys(BALANCE.prestigeUpgrades) as PrestigeUpgradeId[]).map(id=>{
    const d=BALANCE.prestigeUpgrades[id],level=upgradeLevel(s,id),cost=prestigeUpgradeCost(id,level),gate=prestigeGate(s,d.depth);
    let reason='available';
    if(level)reason='bought';
    else if(!d.requires.every(required=>upgradeLevel(s,required as PrestigeUpgradeId)>=1))reason=`missing prerequisite: ${d.requires.filter(required=>upgradeLevel(s,required as PrestigeUpgradeId)<1).join(', ')}`;
    else if(gate&&!gate.ok)reason=`gate: ${gate.label}`;
    else if(s.unspentINT<cost)reason=`need ${Math.max(0,cost-s.unspentINT).toFixed(0)} more INT`;
    return{id,depth:d.depth,cost,bought:level>0,reason};
  });
  const crafting=(Object.keys(BALANCE.itemRecipes) as ItemTypeId[]).map(type=>{
    const q=craftAffordability(s,type);
    const missingModules=Object.fromEntries(Object.entries(q.missingModules).map(([k,v])=>[k,Number(v)]));
    const missingComponents=Object.fromEntries(Object.entries(q.missingComponents).map(([k,v])=>[k,Number(v)]));
    return{type,craftable:q.data.missing<=0&&q.missingBlueprints<=0&&Object.keys(missingModules).length===0&&Object.keys(missingComponents).length===0,missingData:q.data.missing,missingBlueprints:q.missingBlueprints,missingModules,missingComponents};
  });
  const warnings:SimulationDiagnostic[]=[];
  if(s.lifetime.itemsCrafted===0)warnings.push({severity:'CRITICAL',code:'CRAFTING_DEAD',message:'No item was crafted during this run.'});
  if(s.nodes.length<=4)warnings.push({severity:'CRITICAL',code:'PRESTIGE_TREE_STALLED',message:`Prestige tree stalled at ${s.nodes.length}/${Object.keys(BALANCE.prestigeUpgrades).length} nodes.`});
  if(s.lifetime.researchCompleted>300)warnings.push({severity:'WARN',code:'RESEARCH_FLOOD',message:`${s.lifetime.researchCompleted} research completions indicate very high repeatable-research throughput.`});
  if(s.experiments.completedIds.length>10000)warnings.push({severity:'WARN',code:'EXPERIMENT_FLOOD',message:`${s.experiments.completedIds.length} experiments completed; verify intended interaction cadence.`});
  if(s.gems>5000)warnings.push({severity:'WARN',code:'GEM_INFLATION',message:`Unspent gem balance reached ${s.gems}.`});
  return{warnings,prestige,crafting,components:{...s.componentInventory},hardwareCounts:{...s.hardwareCounts},totalMastery:totalMastery(s),seasonLevel:seasonLevel(s)};
}

export type PrestigeEconomyTrace={at:number;eligibleRevenue:ScientificJSON;weightedEligibleRevenue:ScientificJSON;claimableINT:ScientificJSON;cycleINTBefore:ScientificJSON;cycleINTAfter:ScientificJSON;creditRateBefore:ScientificJSON;creditRateAfter:ScientificJSON;intCreditMultiplierBefore:number;intCreditMultiplierAfter:number;axiomCreditMultiplier:number;legacyIntSynergyBefore:ScientificJSON;legacyIntSynergyAfter:ScientificJSON;multipliersBefore?:ReturnType<typeof productionBreakdown>;multipliersAfter?:ReturnType<typeof productionBreakdown>};

export type BalanceSimulationResult={
  days:number;
  active:boolean;
  prestiges:number;
  final:GameState;
  milestones:{
    firstResearch:number|null;
    firstAnalysis:number|null;
    firstImpulseBlueprint:number|null;
    firstImpulseEquipped:number|null;
    firstCraftable:number|null;
    firstResearchCompleted:number|null;
    firstItem:number|null;
    firstCraft:number|null;
    firstPrestige:number|null;
    prestiges:number[];
    hardware:Partial<Record<import('./economy').HardwareId,number>>;
    researchCompleted:{at:number;total:number}[];
    modelLevels:{at:number;level:number;quality:number;efficiency:number}[];
    items:{at:number;count:number}[];
    componentDiscoveries:{at:number;type:string}[];
  };
  checkpoints:BalanceCheckpoint[];
  invalid:boolean;
  diagnostics:BalanceDiagnostics;
  evaluation?:SimulationEvaluation;
  exactFinal?:ReturnType<typeof simulationScientificSnapshot>;prestigeEconomyTrace:PrestigeEconomyTrace[];prestigeEconomyTraceOmitted:number;
  axiom?:{strategy:1|2;availability:number[];resets:{at:number;reward:number;cycleINT:number;normalPrestiges:number;creditsBefore:number;creditRateBefore:number;creditRateAfter:number;axiomBonusBefore:number;axiomBonusAfter:number;nextHardwareMilestoneAt:number|null;historicalRevenue:number;cycleRevenueAfter:number;claimAfter:number;nodesAfter:number;retained:{research:boolean;collection:boolean;crafting:boolean}}[]};
};

function seededRandom(seed:number){
  let value=seed>>>0;
  return()=>{
    value=(value*1664525+1013904223)>>>0;
    return value/4294967296;
  };
}

function simulationComponentTotal(state:GameState){
  return Object.values(state.componentInventory).reduce((sum,value)=>sum+value,0);
}

function simulationComponentTypesOwned(state:GameState){
  return Object.values(state.componentInventory).filter(value=>value>0).length;
}

function simulationRepeatableResearchTotal(state:GameState){
  return Object.values(state.researchLevels).reduce((sum,value)=>sum+value,0);
}

function makeBalanceCheckpoint(state:GameState,elapsed:number):BalanceCheckpoint{
  return{
    elapsed,
    credits:state.credits,
    data:state.data,
    researchPoints:state.researchPoints,
    totalINT:state.totalINTEarned,
    unspentINT:state.unspentINT,
    prestiges:state.prestigeCount,
    hardware:state.hardware,
    discoveredHardware:state.discovered.length,
    modelLevel:state.level,
    qualityLevel:state.qualityLevel,
    efficiencyLevel:state.efficiencyLevel,
    completedResearch:state.completedResearch.length,
    repeatableResearchLevels:simulationRepeatableResearchTotal(state),
    researchStarted:state.lifetime.researchStarted,
    researchCompleted:state.lifetime.researchCompleted,
    inventory:state.inventory.length,
    itemTypes:state.lifetime.itemTypes.length,
    itemsCrafted:state.lifetime.itemsCrafted,
    itemsFused:state.lifetime.itemsFused,
    forgeUpgrades:state.lifetime.forgeUpgrades,
    componentsEarned:state.lifetime.componentsEarned,
    componentTypesOwned:simulationComponentTypesOwned(state),
    componentTotal:simulationComponentTotal(state),
    experimentsCompleted:state.experiments.completedIds.length,
    creditsPerSecond:creditRate(state.hardware,state.level,state,state.savedAt),
    dataPerSecond:dataRate(state),
    researchPerSecond:researchRate(state,state.savedAt),
    computePerSecond:computeRate(state.hardware,state),
    gems:state.gems,
    achievementPoints:state.achievementPoints
  };
}

export type SimulationProfile='active'|'passive';
export type SimulationWaits={credits:number;data:number;materials:number;slots:number};
export type SimulationTiming={scheduledSeconds:number;onlineSeconds:number;offlineSeconds:number;creditedOfflineSeconds:number;lostOfflineSeconds:number;manualActionsOutsideSessions:number;taps:number;decisionTicks:number};
export type DataDecision={at:number;category:'training'|'research'|'analysis';action:string;accepted:boolean;dataBefore:number;dataAfter:number;cost:number;missing:number;secondsToAfford:number|null};
export type SimulationActivity={at:number;kind:'training-complete'|'research-complete'|'analysis-complete'|'crafting-complete';detail:string};
export type SimulationEvaluation={firstPrestigeAvailable:number|null;waits:SimulationWaits;timing:SimulationTiming;componentsBySource:Record<string,number>;firstIntermediate:number|null;hardwareClasses:Partial<Record<import('./economy').HardwareId,number>>;hardwareMilestones:Record<string,number>;dataDecisions:DataDecision[];activity:SimulationActivity[];timeout:string|null};

function claimVisibleDrops(state:GameState,rng:()=>number){let next=state;for(const drop of [...next.lootDrops])next=claimLootDrop(next,drop.id,rng);return next;}
function claimSessionRewards(state:GameState,rng:()=>number){
 let next=claimVisibleDrops(state,rng);
 for(const kind of ['daily','weekly','monthly'] as MissionKind[]){for(const task of next.missions[kind].tasks)next=claimMission(next,kind,task.id);next=claimMissionBonus(next,kind);}
 for(const achievement of achievements)for(let tier=0;tier<achievement.thresholds.length;tier++)next=claimAchievement(next,achievement.id,tier);
 for(const challenge of challenges)next=claimChallenge(next,challenge.id);
 for(let level=1;level<=seasonLevel(next);level++)next=claimSeasonReward(next,level);
 return next;
}

/** Applies one manual decision tick. Every operation delegates to the same gameplay function as the UI. */
function runSessionDecisions(state:GameState,rng:()=>number,trainingTrack:'quality'|'efficiency',waits:SimulationWaits,decisions:DataDecision[],elapsed:number,priority:'training-first'|'analysis-first'='training-first',earlyUnlock?:'none'|'shopping'|'training'|'scanner'){
 let next=claimSessionRewards(state,rng),nextTrack=trainingTrack;
 if(earlyUnlock===undefined){const nodeIds=(Object.keys(BALANCE.prestigeUpgrades) as PrestigeUpgradeId[]).sort((a,b)=>BALANCE.prestigeUpgrades[a].depth-BALANCE.prestigeUpgrades[b].depth||a.localeCompare(b));for(const id of nodeIds){const candidate=buyNode(next,id);if(candidate!==next){next=candidate;break;}}}
 if(next.prestigeCount>0&&earlyUnlock&&earlyUnlock!=='none'){const id=earlyUnlock==='shopping'?'shoppingAgent':earlyUnlock==='training'?'trainingPlan':'componentScanner';next=buyNode(next,id);if(earlyUnlock==='shopping'&&next.nodes.includes(id))next={...next,hardwareAutoBuyers:{...next.hardwareAutoBuyers,calculator:true,sbc:true},automation:{...next.automation,reservePercent:.25}};if(earlyUnlock==='training'&&next.nodes.includes(id)){while(next.trainingQueue.length<2)next=queueTraining(next,next.trainingQueue.length%2?'efficiency':'quality');}if(earlyUnlock==='scanner'&&next.nodes.includes(id))next=selectScannerTarget(next,'circuits');}
 const log=(category:DataDecision['category'],action:string,before:number,after:GameState,cost:number,accepted=after!==next)=>{const missing=Math.max(0,cost-before),rate=dataRate(next);decisions.push({at:elapsed,category,action,accepted,dataBefore:before,dataAfter:after.data,cost,missing,secondsToAfford:missing<=0?0:rate>0?missing/rate:null});};
 const train=()=>{if(next.activeTraining)return;const before=next.data,cost=trainingDataCost(next,nextTrack),started=startTraining(next,nextTrack);log('training',nextTrack,before,started,cost);if(started!==next){next=started;nextTrack=nextTrack==='quality'?'efficiency':'quality';}else waits.data+=10;};
 const research=()=>{if(!next.researchLabs.some((lab,index)=>index<researchLabCount(next)&&!lab)){waits.slots+=10;return;}const catalog=['dataGeneration',...'operations blueprints alignment'.split(' '),...repeatableResearchIds.filter(id=>id!=='dataGeneration')] as import('./economy').ResearchId[];for(const id of catalog){if(next.researchLabs.some(x=>x?.id===id)||(!isRepeatableResearch(id)&&next.completedResearch.includes(id)))continue;const level=isRepeatableResearch(id)?next.researchLevels[id]+1:1,cost=isRepeatableResearch(id)?repeatableResearchDataCost(id,level):researchProjectDataCost(id),before=next.data,candidate=startResearchProject(next,id);log('research',id,before,candidate,cost);if(candidate!==next)next=candidate;else waits.data+=10;return;}};
 const analysis=()=>{if(next.experiments.active){waits.slots+=10;return;}const recipe=BALANCE.itemRecipes['quantum-chip'],missing=(Object.keys(recipe.ingredients) as ComponentId[]).filter(id=>next.componentInventory[id]<(recipe.ingredients[id]??0));const types:ExperimentId[]=['hardware','architecture','artifact'],type=!next.impulseRelayBlueprint?'hardware':next.blueprintFragments<recipe.blueprints?'artifact':types.sort((a,b)=>missing.reduce((n,id)=>n+(BALANCE.componentSources[b][id]??0),0)-missing.reduce((n,id)=>n+(BALANCE.componentSources[a][id]??0),0))[0],length=!next.impulseRelayBlueprint?'short':next.data>=BALANCE.analysisCosts[type].long.data?'long':'short',cost=BALANCE.analysisCosts[type][length].data,before=next.data,candidate=queueExperiment(next,type,next.savedAt,length),accepted=candidate.experiments.active!==null;log('analysis',`${type}:${length}`,before,candidate,cost,accepted);if(accepted)next=candidate;else waits.data+=10;};
 if(priority==='training-first')train();
 if(next.discovered.includes('sbc')){if(priority==='analysis-first'){analysis();research();}else{research();analysis();}}
 if(priority==='analysis-first')train();
 const candidates=hardwareIds.map(id=>{const before=creditRate(next.hardware,next.level,next,next.savedAt),cost=hardwareCost(id,next.hardwareCounts[id],next),afterState=buyHardwareClass(next,id,1),after=afterState===next?before:creditRate(afterState.hardware,afterState.level,afterState,afterState.savedAt);return{id,cost,payback:after>before?cost/(after-before):Infinity,afterState};}).filter(x=>x.afterState!==next).sort((a,b)=>a.payback-b.payback||hardwareIds.indexOf(a.id)-hardwareIds.indexOf(b.id));
 if(candidates[0])next=candidates[0].afterState;else waits.data+=10;
 if(!next.crafting.active&&next.crafting.queue.length===0){
   const type=(Object.keys(BALANCE.itemRecipes) as (keyof typeof BALANCE.itemRecipes)[])[0],quote=craftAffordability(next,type),requiredModules=BALANCE.itemRecipes[type].modules as Partial<typeof next.modules>,missingModule=(Object.keys(requiredModules) as (keyof typeof next.modules)[]).find(id=>next.modules[id]<(requiredModules[id]??0));
   const candidate=missingModule?craftModule(next,missingModule):craft(next,type,'common');
   if(candidate!==next)next=candidate;else if(quote.data.missing>0)waits.data+=10;else waits.materials+=10;
 }
 for(const item of next.inventory){const equipped=equip(next,item.id);if(equipped!==next){next=equipped;break;}}
 return{state:next,trainingTrack:nextTrack};
}

export type SimulationWindow={start:number;end:number};
const sessionWindows=(profile:SimulationProfile,day:number)=>profile==='active'?[0,8*3600,13*3600,20*3600].map(start=>({start:day*86400+start,end:day*86400+start+20*60})):[0,8*3600,20*3600].map(start=>({start:day*86400+start,end:day*86400+start+5*60}));
export const simulationScientificSnapshot=(s:GameState)=>({credits:{...s.exactEconomy.credits},data:{...s.exactEconomy.data},researchPoints:{...s.exactEconomy.researchPoints},creditsPerSecond:creditRateScientific(s.hardware,s.level,s,s.savedAt).toJSON(),dataPerSecond:dataRateScientific(s).toJSON(),computePerSecond:computeRateScientific(s.hardware,s).toJSON()});

/** Deterministic fixed-schedule balance simulator. Offline spans use advanceTo; online spans run at one-second resolution. */
export function simulateBalance(days:number,active:boolean,seed=1708,prestigeLimit=Number.POSITIVE_INFINITY,decisionPriority:'training-first'|'analysis-first'='training-first',customWindows?:SimulationWindow[],deferPrestigeUntilCraft=false,earlyUnlock?:'none'|'shopping'|'training'|'scanner',axiomStrategy?:1|2,prestigeStrategy:'comparison'|'automation'='comparison'):BalanceSimulationResult{
 const profile:SimulationProfile=active?'active':'passive',rng=seededRandom(seed),startAt=Date.UTC(2026,0,1),total=Math.max(0,Math.floor(days*86400));let state=newGame(startAt),elapsed=0,trainingTrack:'quality'|'efficiency'='quality',iterations=0;
 let firstResearch:number|null=null,firstAnalysis:number|null=null,firstImpulseBlueprint:number|null=null,firstImpulseEquipped:number|null=null,firstCraftable:number|null=null,firstResearchCompleted:number|null=null,firstItem:number|null=null,firstCraft:number|null=null,firstPrestige:number|null=null,firstPrestigeAvailable:number|null=null,firstIntermediate:number|null=null,invalid=false,timeout:string|null=null;
 const prestiges:number[]=[],hardware:Partial<Record<import('./economy').HardwareId,number>>={},researchCompleted:{at:number;total:number}[]=[],modelLevels:{at:number;level:number;quality:number;efficiency:number}[]=[],items:{at:number;count:number}[]=[],componentDiscoveries:{at:number;type:string}[]=[],prestigeEconomyTrace:PrestigeEconomyTrace[]=[],checkpoints:BalanceCheckpoint[]=[],axiomAvailability:number[]=[],axiomResets:NonNullable<BalanceSimulationResult['axiom']>['resets']=[];
 let prestigeEconomyTraceOmitted=0;
 const waits:SimulationWaits={credits:0,data:0,materials:0,slots:0},timing:SimulationTiming={scheduledSeconds:total,onlineSeconds:0,offlineSeconds:0,creditedOfflineSeconds:0,lostOfflineSeconds:0,manualActionsOutsideSessions:0,taps:0,decisionTicks:0},componentsBySource:Record<string,number>={},dataDecisions:DataDecision[]=[],activity:SimulationActivity[]=[];
 const logCompletions=(report:AdvanceReport)=>{if(report.levels)activity.push({at:elapsed,kind:'training-complete',detail:`${report.levels} Training`});if(report.researchCompleted)activity.push({at:elapsed,kind:'research-complete',detail:`${report.researchCompleted} Forschung`});for(const result of report.analysisResults)activity.push({at:elapsed,kind:'analysis-complete',detail:`${result.type}:${result.length} ${JSON.stringify(result.components)}`});if(report.craftingCompleted)activity.push({at:elapsed,kind:'crafting-complete',detail:`${report.craftingCompleted} Auftrag`});};
 let previousResearch=0,previousLevel=0,previousInventory=0,previousCraft=0,previousModules=0,nextCheckpoint=3600;const knownComponents=new Set<string>(),knownHardware=new Set(state.discovered),hardwareMilestones:Record<string,number>={};
 const record=()=>{for(const reset of axiomResets)if(reset.nextHardwareMilestoneAt===null&&Object.values(state.hardwareCounts).some(count=>count>=10))reset.nextHardwareMilestoneAt=elapsed;if(firstImpulseBlueprint===null&&state.impulseRelayBlueprint)firstImpulseBlueprint=elapsed;if(firstImpulseEquipped===null&&state.inventory.some(i=>i.type==='impulse-relay'&&Object.values(state.equipped).includes(i.id)))firstImpulseEquipped=elapsed;if(firstAnalysis===null&&(state.experiments.active||state.experiments.completedIds.length>0))firstAnalysis=elapsed;if(firstCraftable===null&&(state.crafting.active?.kind==='item'||state.completedResearch.includes('blueprints')&&(Object.keys(BALANCE.itemRecipes) as ItemTypeId[]).some(type=>{const q=craftAffordability(state,type);return q.data.missing<=0&&q.missingBlueprints<=0&&Object.keys(q.missingModules).length===0&&Object.keys(q.missingComponents).length===0;})))firstCraftable=elapsed;if(firstPrestigeAvailable===null&&newINT(state)>=1)firstPrestigeAvailable=elapsed;if(firstResearch===null&&state.lifetime.researchStarted>0)firstResearch=elapsed;if(state.lifetime.researchCompleted>previousResearch){if(firstResearchCompleted===null)firstResearchCompleted=elapsed;researchCompleted.push({at:elapsed,total:state.lifetime.researchCompleted});previousResearch=state.lifetime.researchCompleted;}if(state.level>previousLevel){modelLevels.push({at:elapsed,level:state.level,quality:state.qualityLevel,efficiency:state.efficiencyLevel});previousLevel=state.level;}if(state.inventory.length>previousInventory){if(firstItem===null)firstItem=elapsed;items.push({at:elapsed,count:state.inventory.length});previousInventory=state.inventory.length;}if(state.lifetime.itemsCrafted>previousCraft){if(firstCraft===null)firstCraft=elapsed;previousCraft=state.lifetime.itemsCrafted;}const moduleTotal=Object.values(state.modules).reduce((a,b)=>a+b,0);if(firstIntermediate===null&&moduleTotal>previousModules)firstIntermediate=elapsed;previousModules=moduleTotal;for(const [type,amount] of Object.entries(state.componentInventory))if(amount>0&&!knownComponents.has(type)){knownComponents.add(type);componentDiscoveries.push({at:elapsed,type});}for(const id of state.discovered)if(!knownHardware.has(id)){knownHardware.add(id);hardware[id]=elapsed;}for(const id of state.discovered)for(const milestone of BALANCE.hardware[id].milestones)if(state.hardwareCounts[id]>=milestone.threshold&&!hardwareMilestones[`${id}:${milestone.threshold}`])hardwareMilestones[`${id}:${milestone.threshold}`]=elapsed;};
 const windows=(customWindows??Array.from({length:Math.ceil(days)},(_,day)=>sessionWindows(profile,day)).flat()).filter(w=>w.start<total);
 for(const window of windows){
   if(iterations++>2_000_000){timeout=`iteration limit at ${elapsed}s`;break;}
   const offline=Math.max(0,Math.min(total,window.start)-elapsed);
   if(offline){const before=simulationComponentTotal(state),result=advanceTo(state,state.savedAt+offline*1000,false,rng);state=result.state;if(state.telemetry.snapshots.length>24)state={...state,telemetry:{...state.telemetry,snapshots:state.telemetry.snapshots.slice(-24)}};elapsed+=offline;logCompletions(result.report);timing.offlineSeconds+=offline;timing.creditedOfflineSeconds+=result.report.seconds;timing.lostOfflineSeconds+=offline-result.report.seconds;const analysisFound=result.report.analysisResults.reduce((sum,row)=>sum+Object.values(row.components).reduce((a,b)=>a+(b??0),0),0),gain=Math.max(0,simulationComponentTotal(state)-before);componentsBySource.analysis=(componentsBySource.analysis??0)+analysisFound;componentsBySource['passive-hardware']=(componentsBySource['passive-hardware']??0)+Math.max(0,gain-analysisFound);record();}
   const end=Math.min(total,window.end);
   while(elapsed<end){
     if(iterations++>2_000_000){timeout=`iteration limit at ${elapsed}s`;break;}
     const beforeDrops=state.lifetime.dropsClaimed,untilDecision=10-((elapsed-window.start)%10||10),slice=Math.min(5,end-elapsed,untilDecision||5),sliceStart=state.savedAt,advanced=advance(state,slice,true,rng);state=advanced.state;if(state.telemetry.snapshots.length>24)state={...state,telemetry:{...state.telemetry,snapshots:state.telemetry.snapshots.slice(-24)}};const analysisFound=advanced.report.analysisResults.reduce((sum,row)=>sum+Object.values(row.components).reduce((a,b)=>a+(b??0),0),0),reportedComponents=Object.values(advanced.report.components).reduce((a,b)=>a+(b??0),0);componentsBySource.analysis=(componentsBySource.analysis??0)+analysisFound;componentsBySource['passive-hardware']=(componentsBySource['passive-hardware']??0)+Math.max(0,reportedComponents-analysisFound);elapsed+=slice;logCompletions(advanced.report);timing.onlineSeconds+=slice;
     if(profile==='active')for(let second=1;second<=slice;second++){state=registerTap(state,sliceStart+second*1000);timing.taps++;}
     const beforeWorld=simulationComponentTotal(state);state=claimVisibleDrops(state,rng);if(state.lifetime.dropsClaimed>beforeDrops)componentsBySource['world-drop']=(componentsBySource['world-drop']??0)+Math.max(0,simulationComponentTotal(state)-beforeWorld);
     if((elapsed-window.start)%10===0){timing.decisionTicks++;const decision=runSessionDecisions(state,rng,trainingTrack,waits,dataDecisions,elapsed,decisionPriority,earlyUnlock);state=decision.state;trainingTrack=decision.trainingTrack;
       const gain=newINT(state);if((!deferPrestigeUntilCraft||state.lifetime.itemsCrafted>0)&&gain>=3&&state.savedAt-state.runStartedAt>=45*60_000&&prestiges.length<prestigeLimit&&!(prestigeStrategy==='automation'&&(state.axiomUpgradeLevels.axiomAutomation??0)>0)){const beforePrestige=state,claimableINT=newINTScientific(state),creditRateBefore=creditRateScientific(state.hardware,state.level,state,state.savedAt),detailed=prestigeEconomyTrace.length<8,multipliersBefore=detailed?productionBreakdown(state):undefined;state=simulationPrestige(state);if(prestigeEconomyTrace.length<256)prestigeEconomyTrace.push({at:elapsed,eligibleRevenue:{...beforePrestige.exactEconomy.lifetimeEligibleCredits},weightedEligibleRevenue:{...beforePrestige.exactEconomy.cycleEligibleCredits},claimableINT:claimableINT.toJSON(),cycleINTBefore:{...beforePrestige.exactEconomy.cycleINTEarned},cycleINTAfter:{...state.exactEconomy.cycleINTEarned},creditRateBefore:creditRateBefore.toJSON(),creditRateAfter:creditRateScientific(state.hardware,state.level,state,state.savedAt).toJSON(),intCreditMultiplierBefore:creditMultiplierFromINT(beforePrestige),intCreditMultiplierAfter:creditMultiplierFromINT(state),axiomCreditMultiplier:creditMultiplierFromAxioms(state),legacyIntSynergyBefore:intSynergyScientific(beforePrestige).toJSON(),legacyIntSynergyAfter:intSynergyScientific(state).toJSON(),multipliersBefore,multipliersAfter:detailed?productionBreakdown(state):undefined});else prestigeEconomyTraceOmitted++;prestiges.push(elapsed);if(firstPrestige===null)firstPrestige=elapsed;}if(axiomStrategy){const reward=simulationAxiomReward(state);if(reward>=1&&axiomAvailability.length===axiomResets.length)axiomAvailability.push(elapsed);if(reward>=axiomStrategy){const beforeReset=state,creditBefore=creditRate(beforeReset.hardware,beforeReset.level,beforeReset,beforeReset.savedAt),axiomBonusBefore=creditMultiplierFromAxioms(beforeReset),research=JSON.stringify(beforeReset.researchLabs),collection=JSON.stringify([beforeReset.componentInventory,beforeReset.modules,beforeReset.inventory,beforeReset.equipped]),crafting=JSON.stringify(beforeReset.crafting);state=simulationAxiomReset(state);if(prestigeStrategy==='automation'&&(state.axiomUpgradeLevels.axiomAutomation??0)<1&&state.availableAxioms>=BALANCE.axiom.automationCost){state=simulationBuyAxiomUpgrade(state,'axiomAutomation');state={...state,prestigeAgent:{...state.prestigeAgent,enabled:true,minimumReward:{m:3,e:0},minimumRunMinutes:60,waitForTraining:true,waitForAnalysis:true}}}const creditAfter=creditRate(state.hardware,state.level,state,state.savedAt);axiomResets.push({at:elapsed,reward,cycleINT:beforeReset.cycleINTEarned,normalPrestiges:beforeReset.lifetime.prestiges,creditsBefore:beforeReset.credits,creditRateBefore:creditBefore,creditRateAfter:creditAfter,axiomBonusBefore,axiomBonusAfter:creditMultiplierFromAxioms(state),nextHardwareMilestoneAt:null,historicalRevenue:state.lifetimeEligibleCredits,cycleRevenueAfter:state.cycleEligibleCredits,claimAfter:newINT(state),nodesAfter:state.nodes.length,retained:{research:research===JSON.stringify(state.researchLabs),collection:collection===JSON.stringify([state.componentInventory,state.modules,state.inventory,state.equipped]),crafting:crafting===JSON.stringify(state.crafting)}});}}
     }
     record();if(elapsed>=nextCheckpoint){checkpoints.push(makeBalanceCheckpoint(state,elapsed));nextCheckpoint+=3600;}
   }
   if(timeout)break;
 }
 if(!timeout&&elapsed<total){const offline=total-elapsed,result=advanceTo(state,state.savedAt+offline*1000,false,rng);state=result.state;elapsed=total;timing.offlineSeconds+=offline;timing.creditedOfflineSeconds+=result.report.seconds;timing.lostOfflineSeconds+=offline-result.report.seconds;record();}
 if(checkpoints.at(-1)?.elapsed!==elapsed)checkpoints.push(makeBalanceCheckpoint(state,elapsed));
 const numeric=[state.credits,state.data,state.researchPoints,state.totalINTEarned];invalid=!numeric.every(Number.isFinite)||numeric.some(n=>n<0)||!!timeout;
 const result={days,active,prestiges:prestiges.length,final:state,milestones:{firstResearch,firstAnalysis,firstImpulseBlueprint,firstImpulseEquipped,firstCraftable,firstResearchCompleted,firstItem,firstCraft,firstPrestige,prestiges,hardware,researchCompleted,modelLevels,items,componentDiscoveries},checkpoints,invalid,diagnostics:diagnoseBalanceState(state),evaluation:{firstPrestigeAvailable,waits,timing,componentsBySource,firstIntermediate,hardwareClasses:hardware,hardwareMilestones,dataDecisions,activity,timeout},prestigeEconomyTrace,prestigeEconomyTraceOmitted,axiom:axiomStrategy?{strategy:axiomStrategy,availability:axiomAvailability,resets:axiomResets}:undefined,exactFinal:simulationScientificSnapshot(state)};
 return result as BalanceSimulationResult;
}

// Kept behind a tiny indirection so production simulation remains tree-shakeable.
import {prestige as simulationPrestige,axiomReset as simulationAxiomReset,axiomReward as simulationAxiomReward,runPrestigeAgent as simulationRunPrestigeAgent,buyAxiomUpgrade as simulationBuyAxiomUpgrade} from './prestige';

function requirePrestigeForSimulation(){
  return{prestige:simulationPrestige};
}

export type LongTermBalanceSuite={
  seed:number;
  runs:BalanceSimulationResult[];
};

export type AxiomMeasurement={days:7|30;profile:'active'|'passive';seed:number;firstAxiomSeconds:number|null;normalPrestiges:number;cycleINT:number;projectedAxioms:number;restartCreditMultiplier:number|null;timeout:string|null};
/** Bounded measurement only: it never alters the configured threshold or claims unobserved progress. */
export function measureAxiomHorizons(seed=1708):AxiomMeasurement[]{
 return([7,30] as const).flatMap(days=>[true,false].map(active=>{const run=simulateBalance(days,active,seed),first=null,projected=simulationAxiomReward(run.final);return{days,profile:active?'active' as const:'passive' as const,seed,firstAxiomSeconds:first,normalPrestiges:run.prestiges,cycleINT:run.final.cycleINTEarned,projectedAxioms:projected,restartCreditMultiplier:projected>0?1+BALANCE.axiom.creditPerTotal*projected:null,timeout:run.evaluation?.timeout??null}}));
}

export function simulateLongTermSuite(seed=1708):LongTermBalanceSuite{
  const horizons=[1,3,7,14,30,60,90,180,365];

  return{
    seed,
    runs:horizons.flatMap(days=>[
      simulateBalance(days,true,seed),
      simulateBalance(days,false,seed)
    ])
  };
}

function formatSimulationDuration(seconds:number|null){
  if(seconds===null)return'never';

  const days=seconds/86400;
  if(days>=1)return`${days.toFixed(2)}d`;

  const hours=seconds/3600;
  if(hours>=1)return`${hours.toFixed(2)}h`;

  return`${(seconds/60).toFixed(1)}m`;
}

function compactSimulationNumber(value:number){
  if(!Number.isFinite(value))return String(value);
  if(value===0)return'0';

  const absolute=Math.abs(value);

  if(absolute>=1e6||absolute<0.001){
    return value.toExponential(3);
  }

  return value.toFixed(2);
}

export type SimulationMode='FAST'|'DEEP';
export function simulateDiagnosticSuite(mode:SimulationMode='FAST',seed=1708):LongTermBalanceSuite{
  const horizons=mode==='FAST'?[1,7,30,60,90]:[1,3,7,14,30,60,90,180,365];
  return{seed,runs:horizons.flatMap(days=>[simulateBalance(days,true,seed),simulateBalance(days,false,seed)])};
}

export function formatDiagnosticAppendix(run:BalanceSimulationResult){
  const d=run.diagnostics,lines:string[]=[];
  lines.push('DIAGNOSTICS');
  lines.push(`Warnings: ${d.warnings.length?d.warnings.map(w=>`${w.severity}:${w.code}`).join(', '):'none'}`);
  lines.push(`Mastery: ${d.totalMastery} · Season level: ${d.seasonLevel}`);
  lines.push('Prestige blockers:');
  for(const n of d.prestige.filter(x=>!x.bought))lines.push(`  ${n.id} [D${n.depth}] cost=${n.cost}: ${n.reason}`);
  lines.push('Crafting blockers:');
  for(const c of d.crafting)lines.push(`  ${c.type}: ${c.craftable?'CRAFTABLE':`data=${c.missingData}, blueprints=${c.missingBlueprints}, modules=${JSON.stringify(c.missingModules)}, components=${JSON.stringify(c.missingComponents)}`}`);
  lines.push(`Components: ${JSON.stringify(d.components)}`);
  lines.push(`Hardware counts: ${JSON.stringify(d.hardwareCounts)}`);
  return lines.join('\n');
}


export type BalanceVerdict='PASS'|'WARNING'|'FAIL';
export type SuiteBalanceFinding={severity:'PASS'|'WARNING'|'CRITICAL';code:string;system:string;message:string};
export type SuiteBalanceDiagnosis={overall:BalanceVerdict;findings:SuiteBalanceFinding[];scorecard:Record<string,BalanceVerdict>};

const runAt=(suite:LongTermBalanceSuite,days:number,active:boolean)=>suite.runs.find(run=>run.days===days&&run.active===active);
const finding=(severity:SuiteBalanceFinding['severity'],code:string,system:string,message:string):SuiteBalanceFinding=>({severity,code,system,message});
const inRange=(value:number,min:number,max:number)=>value>=min&&value<=max;

/** V10 target corridors. These are design targets, not technical assertions. */
export function diagnoseLongTermSuite(suite:LongTermBalanceSuite):SuiteBalanceDiagnosis{
  const findings:SuiteBalanceFinding[]=[];
  const d1a=runAt(suite,1,true),d1p=runAt(suite,1,false),d7a=runAt(suite,7,true),d7p=runAt(suite,7,false),d30a=runAt(suite,30,true),d30p=runAt(suite,30,false),d60a=runAt(suite,60,true),d90a=runAt(suite,90,true),d365a=runAt(suite,365,true);
  const addRange=(value:number|null|undefined,min:number,max:number,code:string,system:string,label:string,unit='')=>{
    if(value==null){findings.push(finding('CRITICAL',code,system,`${label}: never; target ${min}-${max}${unit}.`));return;}
    findings.push(finding(inRange(value,min,max)?'PASS':'WARNING',code,system,`${label}: ${value.toFixed(2)}${unit}; target ${min}-${max}${unit}.`));
  };

  if(d1a)addRange(d1a.milestones.firstPrestige===null?null:d1a.milestones.firstPrestige/60,45,75,'FIRST_PRESTIGE_ACTIVE','Prestige','Active first prestige','m');
  if(d1p)addRange(d1p.milestones.firstPrestige===null?null:d1p.milestones.firstPrestige/60,60,120,'FIRST_PRESTIGE_PASSIVE','Prestige','Passive first prestige','m');
  if(d1a)addRange(d1a.prestiges,3,6,'PRESTIGE_DAY1','Prestige','Active prestiges day 1');
  if(d7a)addRange(d7a.prestiges,8,15,'PRESTIGE_DAY7','Prestige','Active prestiges day 7');
  if(d30a)addRange(d30a.prestiges,15,20,'PRESTIGE_DAY30','Prestige','Active prestiges day 30');
  if(d60a)addRange(d60a.prestiges,17,24,'PRESTIGE_DAY60','Prestige','Active prestiges day 60');
  if(d90a)addRange(d90a.prestiges,19,28,'PRESTIGE_DAY90','Prestige','Active prestiges day 90');
  if(d1a&&d30a&&d30a.prestiges-d1a.prestiges<6)findings.push(finding('CRITICAL','PRESTIGE_STALLED','Prestige',`Only ${d30a.prestiges-d1a.prestiges} additional active prestiges occurred from day 1 to day 30.`));

  if(d7a){const full=d7a.final.discovered.length>=hardwareIds.length;findings.push(finding(full?'CRITICAL':'PASS','HARDWARE_DAY7','Core Economy',full?'All hardware classes are already unlocked by day 7; target completion is roughly day 30-60.':'Hardware progression remains open at day 7.'));}
  if(d30a){const full=d30a.final.discovered.length>=hardwareIds.length;findings.push(finding(full?'WARNING':'PASS','HARDWARE_DAY30','Core Economy',full?'All hardware classes are unlocked by day 30; this is the earliest edge of the target corridor.':'Hardware progression remains open at day 30.'));}
  if(d60a){const count=d60a.final.discovered.length;findings.push(finding(count>=14?'PASS':'WARNING','HARDWARE_DAY60','Core Economy',`Hardware classes at day 60: ${count}/${hardwareIds.length}; target 14-15.`));}
  if(d90a){const count=d90a.final.discovered.length;findings.push(finding(count===hardwareIds.length?'PASS':'WARNING','HARDWARE_DAY90','Core Economy',`Hardware classes at day 90: ${count}/${hardwareIds.length}; target 15/15.`));}

  if(d1a)addRange(d1a.milestones.firstItem===null?null:d1a.milestones.firstItem/3600,6,24,'FIRST_ITEM','Items/Crafting','Active first item','h');
  const craftRun=[d1a,d7a,d30a,d90a,d365a].find(run=>run?.milestones.firstCraft!=null);
  if(craftRun?.milestones.firstCraft!=null){const hours=craftRun.milestones.firstCraft/3600;findings.push(finding(hours<=72?'PASS':'CRITICAL','FIRST_CRAFT','Items/Crafting',`First craft: ${hours.toFixed(2)}h; target <=72h.`));}
  else findings.push(finding('CRITICAL','CRAFTING_DEAD','Items/Crafting','No crafted item observed in available horizons; target first craft <=72h.'));
  if(d30a&&d30a.final.lifetime.itemsCrafted===0)findings.push(finding('CRITICAL','CRAFTING_DAY30','Items/Crafting','0 crafted items after 30 active days.'));
  if(d30a&&d30a.final.blueprintFragments>0&&d30a.final.lifetime.componentsEarned>1000&&d30a.final.lifetime.itemsCrafted===0)findings.push(finding('CRITICAL','CRAFTING_RESOURCES_UNUSED','Items/Crafting',`${d30a.final.blueprintFragments} blueprint fragments and ${d30a.final.lifetime.componentsEarned.toFixed(0)} earned components exist, but crafting is still 0.`));

  const nodeCheck=(run:BalanceSimulationResult|undefined,min:number,max:number,code:string)=>{if(!run)return;const n=run.final.nodes.length;findings.push(finding(inRange(n,min,max)?'PASS':n<min?'CRITICAL':'WARNING',code,'Prestige',`Prestige nodes at day ${run.days}: ${n}/40; target ${min}-${max}.`));};
  nodeCheck(d7a,5,10,'PRESTIGE_TREE_DAY7');nodeCheck(d30a,12,20,'PRESTIGE_TREE_DAY30');nodeCheck(d60a,16,24,'PRESTIGE_TREE_DAY60');nodeCheck(d90a,20,30,'PRESTIGE_TREE_DAY90');

  if(d1a){const r=d1a.final.lifetime.researchCompleted;findings.push(finding(r>100?'CRITICAL':r>60?'WARNING':'PASS','RESEARCH_DAY1','Research',`${r} research completions on active day 1; >100 is treated as flooding.`));}
  if(d30a&&d7a&&d30a.final.lifetime.researchCompleted<=d7a.final.lifetime.researchCompleted)findings.push(finding('CRITICAL','RESEARCH_STALLED','Research','Research completions did not increase between day 7 and day 30.'));

  if(d30a&&d30p){
    if(d30a.final.inventory.length<d30p.final.inventory.length)findings.push(finding('WARNING','ACTIVE_ITEM_UNDERPERFORMS','Active vs Passive',`Active inventory ${d30a.final.inventory.length} < passive ${d30p.final.inventory.length} at day 30.`));
    else findings.push(finding('PASS','ACTIVE_ITEM_PROGRESS','Active vs Passive',`Active inventory ${d30a.final.inventory.length} >= passive ${d30p.final.inventory.length} at day 30.`));
    findings.push(finding(d30a.final.gems>=d30p.final.gems?'PASS':'WARNING','ACTIVE_GEM_PROGRESS','Active vs Passive',`Day-30 gems active/passive: ${d30a.final.gems}/${d30p.final.gems}.`));
  }

  if(d30a){const level=seasonLevel(d30a.final);findings.push(finding(level<=5?'PASS':'WARNING','SEASON_ROLLOVER','Seasons',`Day 30 is ${d30a.final.season.id} level ${level}; rollover should reset the new season near level 0.`));}
  if(d30a&&d30a.final.gems>5000)findings.push(finding('WARNING','GEM_INFLATION','Core Economy',`Day-30 active gem balance is ${d30a.final.gems}.`));
  if(d30a&&d30a.final.lifetime.componentsEarned>100000)findings.push(finding('WARNING','COMPONENT_INFLATION','Items/Crafting',`Day-30 active components earned reached ${d30a.final.lifetime.componentsEarned.toFixed(0)}.`));
  if(d30a&&d30a.final.discovered.length===hardwareIds.length&&d30a.final.nodes.length<12&&d30a.final.lifetime.itemsCrafted===0)findings.push(finding('CRITICAL','NO_LONG_TERM_PROGRESSION','Long-term','Core hardware is exhausted while prestige-tree and crafting progression are stalled by day 30.'));
  if(d365a&&d365a.final.nodes.length<30)findings.push(finding('CRITICAL','CONTENT_STALLED_365','Long-term',`Only ${d365a.final.nodes.length}/40 prestige nodes after 365 active days.`));

  const systems=['Core Economy','Prestige','Research','Items/Crafting','Seasons','Active vs Passive','Long-term'];
  const scorecard:Record<string,BalanceVerdict>={};
  for(const system of systems){const fs=findings.filter(f=>f.system===system);scorecard[system]=fs.some(f=>f.severity==='CRITICAL')?'FAIL':fs.some(f=>f.severity==='WARNING')?'WARNING':'PASS';}
  const verdict:BalanceVerdict=Object.values(scorecard).includes('FAIL')?'FAIL':Object.values(scorecard).includes('WARNING')?'WARNING':'PASS';
  return{overall:verdict,findings,scorecard};
}

export function formatBalanceDiagnosis(suite:LongTermBalanceSuite){
  const diagnosis=diagnoseLongTermSuite(suite),lines:string[]=[];
  lines.push('==========================================');
  lines.push(' V10 BALANCE DIAGNOSIS');
  lines.push('==========================================');
  lines.push(`Overall: ${diagnosis.overall}`);
  for(const severity of ['CRITICAL','WARNING','PASS'] as const){
    const group=diagnosis.findings.filter(f=>f.severity===severity);if(!group.length)continue;
    lines.push('');lines.push(severity);
    for(const f of group)lines.push(`[${f.code}] ${f.message}`);
  }
  lines.push('');lines.push('------------------------------------------');lines.push('SCORECARD');
  for(const [system,status] of Object.entries(diagnosis.scorecard))lines.push(`${system.padEnd(20)} ${status}`);
  lines.push('==========================================');
  return lines.join('\n');
}

export function formatLongTermReport(suite:LongTermBalanceSuite){
  const lines:string[]=[];

  lines.push('');
  lines.push('==========================================');
  lines.push(' AI SINGULARITY LONG-TERM BALANCE REPORT');
  lines.push('==========================================');
  lines.push(`Seed: ${suite.seed}`);
  lines.push('');

  for(const run of suite.runs){
    const s=run.final;

    lines.push(
      `--- ${run.days} DAYS · ${run.active?'ACTIVE':'PASSIVE'} ---`
    );

    lines.push(`Invalid: ${run.invalid}`);
    lines.push(`Prestiges: ${run.prestiges}`);
    lines.push(`First prestige: ${formatSimulationDuration(run.milestones.firstPrestige)}`);
    lines.push(`First research: ${formatSimulationDuration(run.milestones.firstResearch)}`);
    lines.push(`First research completed: ${formatSimulationDuration(run.milestones.firstResearchCompleted)}`);
    lines.push(`First item: ${formatSimulationDuration(run.milestones.firstItem)}`);
    lines.push(`First craft: ${formatSimulationDuration(run.milestones.firstCraft)}`);

    lines.push(`Credits: ${compactSimulationNumber(s.credits)}`);
    lines.push(`Data: ${compactSimulationNumber(s.data)}`);
    lines.push(`Research points: ${compactSimulationNumber(s.researchPoints)}`);
    lines.push(`INT earned: ${compactSimulationNumber(s.totalINTEarned)}`);

    lines.push(`Hardware classes: ${s.discovered.length}/${hardwareIds.length}`);
    lines.push(`Model level: ${s.level} (Q${s.qualityLevel} / E${s.efficiencyLevel})`);

    lines.push(`Research completed: ${s.lifetime.researchCompleted}`);

    lines.push(`Items: ${s.inventory.length}`);
    lines.push(`Item types discovered: ${s.lifetime.itemTypes.length}`);
    lines.push(`Items crafted: ${s.lifetime.itemsCrafted}`);
    lines.push(`Items fused: ${s.lifetime.itemsFused}`);
    lines.push(`Forge upgrades: ${s.lifetime.forgeUpgrades}`);

    lines.push(`Components earned: ${compactSimulationNumber(s.lifetime.componentsEarned)}`);
    lines.push(`Component types owned: ${simulationComponentTypesOwned(s)}`);

    lines.push(`Experiments completed: ${s.experiments.completedIds.length}`);
    lines.push(`Gems: ${s.gems}`);
    lines.push(`Achievement points: ${s.achievementPoints}`);
    lines.push(`Prestige nodes: ${s.nodes.length}/${Object.keys(BALANCE.prestigeUpgrades).length}`);
    lines.push(`Challenge stars: ${s.retention.challengeStars}`);
    lines.push(`Season: ${s.season.id} · level ${seasonLevel(s)} · rewards ${s.season.claimed.length}`);
    lines.push(`Artifacts: ${s.profile.artifacts.length}`);
    lines.push(`Blueprint fragments: ${s.blueprintFragments}`);
    lines.push(`Modules: computeBus=${s.modules.computeBus}, dataLattice=${s.modules.dataLattice}`);

    lines.push(`Checkpoints recorded: ${run.checkpoints.length}`);
    if(run.active&&[30,60,90].includes(run.days)&&s.telemetry.prestigeHistory.length){
      lines.push('Prestige trace:');
      for(const p of s.telemetry.prestigeHistory)lines.push(`  #${p.run+1} @ ${formatSimulationDuration(p.at/1000)} · run ${formatSimulationDuration(p.durationSeconds)} · +${compactSimulationNumber(p.intEarned)} INT · credits ${compactSimulationNumber(p.before.credits)}`);
    }
    if(run.active&&[30,60,90].includes(run.days)){
      const unlocks=Object.entries(run.milestones.hardware).filter(([,at])=>at!==undefined).sort((a,b)=>(a[1]??0)-(b[1]??0));
      lines.push('Hardware unlock trace:');
      for(const [id,at] of unlocks)lines.push(`  ${id} @ ${formatSimulationDuration(at??null)}`);
    }
    if(run.days===365)lines.push(formatDiagnosticAppendix(run));
    lines.push('');
  }

  lines.push(formatBalanceDiagnosis(suite));
  return lines.join('\n');
}
