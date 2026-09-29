import { BALANCE, addCredits,addData,addCreditsScientific,addDataScientific,addResearchScientific, averageDataSynergy, GameState, trainingRate, creditRate,creditRateScientific, dataRate,dataRateScientific, researchRate,researchRateScientific, researchLabCount, hardwareCost, classCompute, buyHardwareClass, maxAffordable, hasNode, isRepeatableResearch, milestoneBonus,tapDropMultiplier, startResearchProject,computeRate,usersRate,newINT,newGame,tapCredits,startTraining,passiveCircuitRate,grantComponents,safeEconomyAdd,MAX_ECONOMY_VALUE,hardwareIds,hardwareCostScientific,canAffordScientificCreditCost,hardwareAutobuyerUnlocked,repeatableResearchIds,PrestigeUpgradeId,ItemTypeId,Rarity,prestigeUpgradeCost,upgradeLevel,dataSynergyScientific } from './economy';
import { completeExperiment, queueExperiment } from './experiments';
import { rollPeriods,claimMission,claimMissionBonus,MissionKind } from './missions';
import { achievements,claimAchievement } from './achievements';
import { claimSeasonReward,seasonLevel } from './season';
import { challenges,claimChallenge,prestigeGate,totalMastery } from './retention';
import { craft,craftModule,craftAffordability,equip,forgeItem,fuseItems,claimLootDrop,settleCrafting } from './inventory';
import { buyNode } from './prestige';
import { updateOnboarding } from './onboarding';
import { addEvent, addMetrics,addSnapshot } from './telemetry';

export type AdvanceReport = { credits:number; data:number; research:number; levels:number; experiments:number; hardware:number; seconds:number; components:Partial<GameState['componentInventory']>; analysisResults:NonNullable<GameState['experiments']['lastResult']>[] };
export type ResearchCompletionStep = 'project-complete'|'reward-applied'|'unlock-applied'|'queue-checked'|'missions-achievements-ready'|'state-ready-for-save-render';

/** Convert wall time to the save's explicit simulation timeline. */
export const simulationNow = (state:GameState, wallNow=Date.now()) => wallNow + state.clockOffsetMs;

function cloneForSimulation(state:GameState):GameState {
  return {
    ...state,
    nodes:[...state.nodes],scannerRewards:[...state.scannerRewards],runRecyclingRewards:[...state.runRecyclingRewards],runMilestoneClasses:[...state.runMilestoneClasses],lifetime:{...state.lifetime,hardwareClasses:[...state.lifetime.hardwareClasses],itemTypes:[...state.lifetime.itemTypes]},gemLedger:[...state.gemLedger],processedGemPurchases:[...state.processedGemPurchases], completedResearch:[...state.completedResearch],researchLevels:{...state.researchLevels}, breakthroughs:[...state.breakthroughs], inventory:state.inventory.map(item=>({...item})), lootDrops:(state.lootDrops??[]).map(drop=>({...drop})), equipped:{...state.equipped}, pity:{...state.pity},
    researchLabs:state.researchLabs.map(lab=>lab?{...lab}:null),
    experiments:{...state.experiments,active:state.experiments.active?{...state.experiments.active}:null,lastResult:state.experiments.lastResult?{...state.experiments.lastResult,components:{...state.experiments.lastResult.components}}:null,queue:[...state.experiments.queue],completedIds:[...state.experiments.completedIds]},
    automation:{...state.automation},
    missions:{daily:{...state.missions.daily,tasks:state.missions.daily.tasks.map(task=>({...task}))},weekly:{...state.missions.weekly,tasks:state.missions.weekly.tasks.map(task=>({...task}))},monthly:{...state.missions.monthly,tasks:state.missions.monthly.tasks.map(task=>({...task}))},mailbox:state.missions.mailbox.map(entry=>({...entry}))},
    achievementClaims:[...state.achievementClaims], ads:{...state.ads,counts:{...state.ads.counts},transactions:[...state.ads.transactions]}, settings:{...state.settings},
    telemetry:{...state.telemetry,recentEvents:[...state.telemetry.recentEvents],permanentEvents:[...state.telemetry.permanentEvents],metrics:state.telemetry.metrics.map(bucket=>({...bucket,income:{...bucket.income},offlineRewards:{...bucket.offlineRewards}})),snapshots:[...state.telemetry.snapshots],diagnostics:{...state.telemetry.diagnostics},archivedMetrics:{...state.telemetry.archivedMetrics,income:{...state.telemetry.archivedMetrics.income},offlineRewards:{...state.telemetry.archivedMetrics.offlineRewards}},prestigeHistory:[...state.telemetry.prestigeHistory]},
    story:{...state.story,queue:[...state.story.queue],seen:[...state.story.seen]},
  };
}

function autobuy(state:GameState) {
  let next=state;
  const masteryTargets=hardwareIds.filter(id=>hardwareAutobuyerUnlocked(next,id)&&next.hardwareAutoBuyers[id]);
  for(const id of masteryTargets){const cost=hardwareCostScientific(id,next.hardwareCounts[id],next);if(canAffordScientificCreditCost(next,cost,next.automation.reserve))next=buyHardwareClass(next,id,1);}
  if ((!hasNode(next,'shoppingAgent',1)&&!milestoneBonus(next,'automation')) || !next.automation.enabled) return next;
  const planned=hasNode(next,'shoppingPlan',1),targets=planned?(next.automation.target?[next.automation.target]:next.discovered):(['calculator'] as const),candidates=targets.map(id=>{const cost=hardwareCost(id,next.hardwareCounts[id],next);const gain=classCompute(next,id,next.hardwareCounts[id]+1)-classCompute(next,id);return{id,cost,score:gain/cost}}).sort((a,b)=>b.score-a.score);
  const pick=candidates.find(x=>canAffordScientificCreditCost(next,hardwareCostScientific(x.id,next.hardwareCounts[x.id],next),next.automation.reserve));
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
    if(isRepeatableResearch(lab.id)){if(next.researchLevels[lab.id]>=lab.level)continue;next={...next,researchLevels:{...next.researchLevels,[lab.id]:lab.level},lifetime:{...next.lifetime,researchCompleted:next.lifetime.researchCompleted+1}};}else{if(next.completedResearch.includes(lab.id))continue;next={...next,completedResearch:[...next.completedResearch,lab.id],lifetime:{...next.lifetime,researchCompleted:next.lifetime.researchCompleted+1}};}
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
  if(!hasNode(state,'labs5',1)||state.activeTraining)return state;
  const track=state.qualityLevel<=state.efficiencyLevel?'quality':'efficiency';
  return startTraining(state,track);
}

export function advance(state:GameState,seconds:number,active=false,rng=Math.random):{state:GameState;report:AdvanceReport} {
  if(!Number.isFinite(seconds)||seconds<=0)return{state,report:{credits:0,data:0,research:0,levels:0,experiments:0,hardware:0,seconds:0,components:{},analysisResults:[]}};
  const limit=Math.min(BALANCE.maxOfflineSeconds,BALANCE.baseOfflineSeconds*(1+milestoneBonus(state,'offline'))),total=Math.max(0,Math.min(seconds,limit));
  let left=total,iterations=0,levels=0,experiments=0,hardware=0,generatedCredits=0,generatedData=0,generatedResearch=0,components:Partial<GameState['componentInventory']>={},analysisResults:NonNullable<GameState['experiments']['lastResult']>[]=[],next=rollPeriods(cloneForSimulation(state),state.savedAt);
  while(left>1e-9&&iterations++<200_000) {
    next=autoStartModelTraining(next);
    const now=next.savedAt,goal=next.activeTraining?.workRequired??Infinity,rate=next.activeTraining?trainingRate(next.hardware,next,now):0;
    const toLevel=next.activeTraining?(goal-next.training)/rate:Infinity;
    const autoActive=next.automation.enabled||Object.values(next.hardwareAutoBuyers).some(Boolean);const autoInterval=Object.values(next.hardwareAutoBuyers).some(Boolean)?BALANCE.hardwareAutobuyerInterval:BALANCE.simulationStep;const toAuto=autoActive?autoInterval-next.automation.elapsed:Infinity;
    const toCrafting=next.crafting.active?.endsAt===null?Infinity:next.crafting.active?Math.max(0,(next.crafting.active.endsAt-now)/1000):Infinity;
    const toExperiment=next.experiments.active?Math.max(0,(next.experiments.active.endsAt-now)/1000):Infinity;
    const toResearch=Math.min(...next.researchLabs.map(lab=>lab?Math.max(0,(lab.endsAt-now)/1000):Infinity));
    const toPeriod=Math.min(...(['daily','weekly','monthly'] as const).map(kind=>Math.max(0,(next.missions[kind].endsAt-now)/1000)));
    const toBoost=Math.min(next.trainingBoostUntil>now?(next.trainingBoostUntil-now)/1000:Infinity,next.creditBoostUntil>now?(next.creditBoostUntil-now)/1000:Infinity,next.overclock.activeUntil>now?(next.overclock.activeUntil-now)/1000:Infinity,next.overclock.cooldownUntil>now?(next.overclock.cooldownUntil-now)/1000:Infinity);
    // Keep integration boundaries on the persistent timeline. Otherwise an
    // external save/advance split creates a new Euler step and changes rates
    // that depend on resources produced during the preceding step.
    const stepMs=30_000,msToStep=stepMs-(Math.max(0,next.savedAt)%stepMs),toStep=msToStep/1000;
    let slice=Math.min(left,toStep,toLevel,toAuto,toCrafting,toExperiment,toResearch,toPeriod,toBoost);
    if(slice<1e-8) slice=Math.min(left,1e-6);
    const dataExact=dataRateScientific(next).multiplyNumber(slice),data=dataExact.toNumber(MAX_ECONOMY_VALUE),currentDataSynergy=dataSynergyScientific(next),meanDataSynergy=averageDataSynergy(next,data,currentDataSynergy),creditsExact=creditRateScientific(next.hardware,next.level,next,now).divide(currentDataSynergy).multiplyNumber(meanDataSynergy*slice),researchExact=researchRateScientific(next,now).multiplyNumber(slice);const credits=creditsExact.toNumber(MAX_ECONOMY_VALUE),research=researchExact.toNumber(MAX_ECONOMY_VALUE);if(![slice,rate].every(Number.isFinite))return{state,report:{credits:0,data:0,research:0,levels:0,experiments:0,hardware:0,seconds:0,components:{},analysisResults:[]}};generatedCredits=safeEconomyAdd(generatedCredits,credits);generatedData=safeEconomyAdd(generatedData,data);generatedResearch=safeEconomyAdd(generatedResearch,research);
    next=startQueuedResearchIfAffordable(addResearchScientific(addDataScientific(addCreditsScientific(next,creditsExact),dataExact),researchExact));const circuitProgress=next.passiveCircuitProgress+passiveCircuitRate(next)*slice,circuits=Math.floor(circuitProgress);next={...next,passiveCircuitProgress:circuitProgress-circuits};if(circuits>0){components.circuits=(components.circuits??0)+circuits;next=addEvent(grantComponents(next,{circuits}),'component-found',now,{source:'passive-hardware',mode:active?'active':'offline',component:'circuits',total:circuits});}const activeLabs=next.researchLabs.filter(Boolean).length;next.lifetime.labSeconds+=activeLabs*slice;if(next.labBoostUntil>now)next.researchLabs=next.researchLabs.map(lab=>lab?{...lab,endsAt:lab.endsAt-slice*1000}:null);
    const trainingWork=rate*slice;next.training+=trainingWork;if(next.activeTraining){const key=active?'onlineWork':'offlineWork';next.activeTraining={...next.activeTraining,[key]:(next.activeTraining[key]??0)+trainingWork};} next.savedAt+=slice*1000;next=rollPeriods(next,next.savedAt); next.automation.elapsed+=slice; left-=slice;
    if(next.activeTraining&&next.training+1e-7>=goal){const completed=next.activeTraining,track=completed.track,actualDuration=completed.startedAt===undefined?null:(next.savedAt-completed.startedAt)/1000;next.training=0;next.activeTraining=null;next.level++;next.lifetime.trainingCompleted++;if(track==='quality')next.qualityLevel++;else next.efficiencyLevel++;levels++;next=addEvent(next,'training-complete',next.savedAt,{track,level:next.level,creditCost:completed.creditCost,dataCost:completed.dataCost??0,baseDuration:completed.baseDuration??completed.workRequired,effectiveRate:completed.startingRate??0,expectedDuration:(completed.baseDuration??completed.workRequired)/(completed.startingRate??1),actualDuration,onlineWork:completed.onlineWork??0,offlineWork:completed.offlineWork??0});}
    if(autoActive&&next.automation.elapsed+1e-7>=autoInterval){next.automation.elapsed%=autoInterval;const before=next.hardware;next=autobuy(next);hardware+=next.hardware-before;}
    if(next.experiments.active&&next.experiments.active.endsAt<=next.savedAt+.1){const id=next.experiments.active.id;next=completeExperiment(next,next.savedAt,rng,active?'active':'offline');if(!next.experiments.active||next.experiments.active.id!==id){experiments++;const result=next.experiments.lastResult;if(result&&result.id===id){analysisResults.push(result);for(const [component,amount] of Object.entries(result.components))components[component as keyof typeof components]=(components[component as keyof typeof components]??0)+(amount??0);}}}
    next=settleCrafting(next);
    next=settleResearchCompletions(next);
    if(next.researchQueue.length>0&&hasNode(next,'labs3',1)&&next.researchLabs.some((lab,index)=>index<researchLabCount(next)&&!lab)){const queued=next.researchQueue[0],started=startResearchProject(next,queued),didStart=started.researchLabs.some(lab=>lab?.id===queued)&&!next.researchLabs.some(lab=>lab?.id===queued);next=didStart?{...started,researchQueue:started.researchQueue.slice(1)}:started;}
    next=addSnapshot(next,{at:next.savedAt,runSeconds:Math.max(0,(next.savedAt-(next.telemetry.runStartedAt??next.savedAt))/1000),credits:next.credits,creditsPerSecond:creditRate(next.hardware,next.level,next,next.savedAt),compute:computeRate(next.hardware,next),computePerSecond:computeRate(next.hardware,next),users:usersRate(next),data:next.data,dataPerSecond:dataRate(next),research:next.researchPoints,researchPerSecond:researchRate(next),gems:next.gems,hardwareCounts:{...next.hardwareCounts},modelLevel:next.level,qualityLevel:next.qualityLevel,efficiencyLevel:next.efficiencyLevel,activeTraining:next.activeTraining?.track??null,activeResearch:next.researchLabs.filter(Boolean).map(x=>x!.id).join('|'),prestigeClaim:newINT(next),activeLabs:next.researchLabs.filter(Boolean).length});
  }
  if(left>1e-9)return{state,report:{credits:0,data:0,research:0,levels:0,experiments:0,hardware:0,seconds:0,components:{},analysisResults:[]}};
  next=updateOnboarding(rollPeriods(next,next.savedAt));
  if(active){next.lifetime.activeSeconds+=total;const dropMult=tapDropMultiplier(next);const interval=Math.max(8,BALANCE.worldDropSeconds/dropMult);const progress=(next.worldDropProgress??0)+total;const spawn=Math.floor(progress/interval);next.worldDropProgress=progress-spawn*interval;next.lootDrops=(next.lootDrops??[]).filter(d=>d.expiresAt>next.savedAt);for(let i=0;i<spawn&&next.lootDrops.length<3;i++){const seed=next.nextId++;next.lootDrops.push({id:`drop-${seed}`,spawnedAt:next.savedAt,expiresAt:next.savedAt+8000,x:8+(seed*37)%84,y:12+(seed*53)%68,variant:seed%17===0?'core':seed%5===0?'cache':'coin'});}}
  const offline=!active&&total>10;
  next=addMetrics(next,next.savedAt,{activeSeconds:active?total:0,offlineSeconds:offline?total:0,passive:offline?0:generatedCredits,offline:offline?generatedCredits:0,offlineCredits:offline?generatedCredits:0,offlineData:offline?generatedData:0,offlineResearch:offline?generatedResearch:0});
  return {state:next,report:{credits:next.credits-state.credits,data:next.data-state.data,research:next.researchPoints-state.researchPoints,levels,experiments,hardware,seconds:total,components,analysisResults}};
}

export function advanceTo(state:GameState,wallNow:number,active=false) {
  const now=simulationNow(state,wallNow);
  const elapsed=Math.max(0,(now-state.savedAt)/1000),result=advance(state,elapsed,active);
  if(!active&&elapsed>10&&elapsed>result.report.seconds)result.state=addMetrics(result.state,result.state.savedAt,{offlineSeconds:elapsed-result.report.seconds});
  const limit=Math.min(BALANCE.maxOfflineSeconds,BALANCE.baseOfflineSeconds*(1+milestoneBonus(state,'offline')));if(now>state.savedAt&&now-state.savedAt>limit*1000) result.state.savedAt=now;
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

export type BalanceSimulationResult={
  days:number;
  active:boolean;
  prestiges:number;
  final:GameState;
  milestones:{
    firstResearch:number|null;
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

/** A deterministic player agent that exercises the real progression systems instead of only the core economy. */
function runSimulationPlayerActions(state:GameState,active:boolean,rng:()=>number):GameState{
  let next=state;

  // Active players collect every currently visible world drop.
  if(active){for(const drop of [...next.lootDrops])next=claimLootDrop(next,drop.id,rng);}

  // Claim progression rewards as soon as they are available.
  for(const kind of ['daily','weekly','monthly'] as MissionKind[]){
    for(const task of next.missions[kind].tasks)next=claimMission(next,kind,task.id);
    next=claimMissionBonus(next,kind);
  }
  for(const achievement of achievements){
    for(let tier=0;tier<achievement.thresholds.length;tier++)next=claimAchievement(next,achievement.id,tier);
  }
  for(const challenge of challenges)next=claimChallenge(next,challenge.id);
  for(let level=1;level<=seasonLevel(next);level++)next=claimSeasonReward(next,level);

  // Buy affordable prestige nodes in dependency/depth order. Gates in buyNode remain authoritative.
  const nodeIds=(Object.keys(BALANCE.prestigeUpgrades) as PrestigeUpgradeId[])
    .sort((a,b)=>BALANCE.prestigeUpgrades[a].depth-BALANCE.prestigeUpgrades[b].depth||BALANCE.prestigeUpgrades[a].cost-BALANCE.prestigeUpgrades[b].cost);
  let nodeProgress=true;
  while(nodeProgress){
    nodeProgress=false;
    for(const id of nodeIds){const bought=buyNode(next,id);if(bought!==next){next=bought;nodeProgress=true;}}
  }

  // Research: progression projects get first access to labs. Repeatables only use remaining slots.
  // V5 filled the only early lab with repeatables forever, so `blueprints` never completed and
  // manufacturing could never unlock even after weeks of simulated play.
  if(next.discovered.includes('sbc')){
    for(const id of ['operations','blueprints','alignment'] as const){
      if(!next.completedResearch.includes(id)&&!next.researchLabs.some(lab=>lab?.id===id))next=startResearchProject(next,id);
    }
    for(const id of repeatableResearchIds){
      if(!next.researchLabs.some(lab=>lab?.id===id))next=startResearchProject(next,id);
    }
  }

  // Manufacturing V7: modules are intermediates, not a resource sink.
  // V6 crafted 4 of every module on every agent tick before attempting an item. That produced
  // hundreds of unused modules (e.g. 786 Compute-Buses by day 30) and continuously consumed
  // the same components required by item recipes, so firstCraft could remain `never`.
  // V7 only manufactures the exact missing modules when the COMPLETE item can be funded.
  const craftable=Object.keys(BALANCE.itemRecipes) as ItemTypeId[];
  for(const type of craftable){
    const recipe=BALANCE.itemRecipes[type as keyof typeof BALANCE.itemRecipes];
    const quote=craftAffordability(next,type);
    if(quote.missingBlueprints>0)continue;

    const moduleNeeds=Object.entries(recipe.modules) as [keyof typeof next.modules,number][];
    const missingModuleCounts=moduleNeeds.map(([id,need])=>[id,Math.max(0,(need??0)-next.modules[id])] as const);
    let totalData=recipe.data;
    const totalComponents:Partial<Record<keyof typeof next.componentInventory,number>>={...recipe.ingredients};
    for(const [moduleId,count] of missingModuleCounts){
      const moduleRecipe=BALANCE.modules[moduleId];
      totalData+=moduleRecipe.data*count;
      for(const [component,amount] of Object.entries(moduleRecipe.ingredients)){
        const id=component as keyof typeof next.componentInventory;
        totalComponents[id]=(totalComponents[id]??0)+(amount??0)*count;
      }
    }
    if(next.data<totalData)continue;
    if(Object.entries(totalComponents).some(([id,need])=>next.componentInventory[id as keyof typeof next.componentInventory]<(need??0)))continue;

    for(const [moduleId,count] of missingModuleCounts){
      for(let i=0;i<count;i++)next=craftModule(next,moduleId);
    }
    next=craft(next,type,'common' as Rarity);
  }

  // Equip owned items, forge useful equipped items, then fuse spare triples.
  for(const item of next.inventory)next=equip(next,item.id);
  for(const id of Object.values(next.equipped).filter((x):x is string=>!!x))next=forgeItem(next,id);
  const rarityOrder:Rarity[]=['common','uncommon','rare','epic','legendary','mythic'];
  for(const type of [...new Set(next.inventory.map(i=>i.type))]){
    for(const rarity of rarityOrder.slice(0,-1)){
      const spare=next.inventory.filter(i=>i.type===type&&i.rarity===rarity&&!i.locked&&!Object.values(next.equipped).includes(i.id));
      while(spare.length>=3){const ids=spare.splice(0,3).map(i=>i.id);next=fuseItems(next,ids);}
    }
  }
  return next;
}

/**
 * Deterministic long-term simulator using the real production economy and a deterministic player agent.
 * Five-minute decisions are intentionally granular; production advance() remains the single source of truth.
 */
export function simulateBalance(days:number,active:boolean,seed=1708,prestigeLimit=Number.POSITIVE_INFINITY):BalanceSimulationResult{
  const rng=seededRandom(seed);let state=newGame(0),elapsed=0;
  let firstResearch:number|null=null,firstResearchCompleted:number|null=null,firstItem:number|null=null,firstCraft:number|null=null,firstPrestige:number|null=null;
  const prestiges:number[]=[],hardware:Partial<Record<import('./economy').HardwareId,number>>={},researchCompleted:{at:number;total:number}[]=[],modelLevels:{at:number;level:number;quality:number;efficiency:number}[]=[],items:{at:number;count:number}[]=[],componentDiscoveries:{at:number;type:string}[]=[],checkpoints:BalanceCheckpoint[]=[];
  let invalid=false,previousResearchCompleted=0,previousModelLevel=0,previousInventory=0,previousItemsCrafted=0,nextCheckpoint=3600;
  const knownComponents=new Set<string>(),step=300,total=days*86400;
  const checkpointInterval=(seconds:number)=>seconds<86400?3600:seconds<7*86400?21600:seconds<30*86400?86400:604800;

  while(elapsed<total){
    const slice=Math.min(step,total-elapsed);state=advance(state,slice,active,rng).state;elapsed+=slice;

    if(active){
      // Approximate one rewarded tap per second of active simulation time.
      state=addCredits(state,tapCredits(state,state.savedAt)*slice,false,true);
      if(!state.activeTraining){const track=state.qualityLevel<=state.efficiencyLevel?'quality':'efficiency';const started=startTraining(state,track);state=started===state?startTraining(state,track==='quality'?'efficiency':'quality'):started;}
    }

    state=runSimulationPlayerActions(state,active,rng);
    if(firstResearch===null&&state.lifetime.researchStarted>0)firstResearch=elapsed;

    if(!state.experiments.active&&state.discovered.includes('sbc')){
      const kinds=(['hardware','architecture','artifact'] as const),kind=kinds[Math.floor(elapsed/3600)%kinds.length];state=queueExperiment(state,kind,state.savedAt,'short');
    }

    // Spend available credits on the newest discovered hardware first.
    for(const id of [...state.discovered].reverse()){
      const amount=maxAffordable(id,state.hardwareCounts[id],state.credits,state);if(amount>0){const before=state.hardwareCounts[id];state=buyHardwareClass(state,id,amount);if(state.hardwareCounts[id]>before&&hardware[id]===undefined)hardware[id]=elapsed;}
    }

    if(state.lifetime.researchCompleted>previousResearchCompleted){researchCompleted.push({at:elapsed,total:state.lifetime.researchCompleted});if(firstResearchCompleted===null)firstResearchCompleted=elapsed;previousResearchCompleted=state.lifetime.researchCompleted;}
    if(state.level>previousModelLevel){modelLevels.push({at:elapsed,level:state.level,quality:state.qualityLevel,efficiency:state.efficiencyLevel});previousModelLevel=state.level;}
    if(state.inventory.length>previousInventory){items.push({at:elapsed,count:state.inventory.length});if(firstItem===null)firstItem=elapsed;previousInventory=state.inventory.length;}
    if(state.lifetime.itemsCrafted>previousItemsCrafted){if(firstCraft===null)firstCraft=elapsed;previousItemsCrafted=state.lifetime.itemsCrafted;}
    for(const [type,amount] of Object.entries(state.componentInventory))if(amount>0&&!knownComponents.has(type)){knownComponents.add(type);componentDiscoveries.push({at:elapsed,type});}

    // Avoid the old pathological "prestige every time 1 INT exists" behavior. Require a growing gain.
    const prestigeTargetRate=prestiges.length<7?0.10:prestiges.length<11?0.045:0.025;
    const prestigeTarget=Math.max(1,Math.ceil(Math.max(1,state.totalINTEarned)*prestigeTargetRate));
    const lastPrestige=prestiges.at(-1)??0;
    const minRunSeconds=prestiges.length===0?45*60:Math.min(24*3600,(4+prestiges.length*0.85)*3600);
    const prestigeCadenceReady=elapsed-lastPrestige>=minRunSeconds;
    if(prestigeCadenceReady&&newINT(state)>=prestigeTarget&&prestiges.length<prestigeLimit){state=simulationPrestige(state);prestiges.push(elapsed);if(firstPrestige===null)firstPrestige=elapsed;}

    if(elapsed>=nextCheckpoint||elapsed>=total){checkpoints.push(makeBalanceCheckpoint(state,elapsed));nextCheckpoint+=checkpointInterval(elapsed);}
    if(state.telemetry.snapshots.length>24)state={...state,telemetry:{...state.telemetry,snapshots:state.telemetry.snapshots.slice(-24)}};
    const numeric=[state.credits,state.data,state.researchPoints,state.lifetimeEligibleCredits,state.totalINTEarned,state.unspentINT,computeRate(state.hardware,state),creditRate(state.hardware,state.level,state,state.savedAt),dataRate(state),researchRate(state,state.savedAt)];
    if(!numeric.every(Number.isFinite)||numeric.some(value=>value<0)){invalid=true;break;}
  }
  if(checkpoints.length===0||checkpoints.at(-1)!.elapsed!==elapsed)checkpoints.push(makeBalanceCheckpoint(state,elapsed));
  return{days,active,prestiges:prestiges.length,final:state,milestones:{firstResearch,firstResearchCompleted,firstItem,firstCraft,firstPrestige,prestiges,hardware,researchCompleted,modelLevels,items,componentDiscoveries},checkpoints,invalid,diagnostics:diagnoseBalanceState(state)};
}

// Kept behind a tiny indirection so production simulation remains tree-shakeable.
import {prestige as simulationPrestige} from './prestige';

function requirePrestigeForSimulation(){
  return{prestige:simulationPrestige};
}

export type LongTermBalanceSuite={
  seed:number;
  runs:BalanceSimulationResult[];
};

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
