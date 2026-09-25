import { BALANCE, addCredits, GameState, trainingRate, creditRate, dataRate, researchRate, researchLabCount, hardwareCost, classCompute, buyHardwareClass, hasNode, isRepeatableResearch, milestoneBonus, startResearchProject,computeRate,usersRate,newINT } from './economy';
import { completeExperiment } from './experiments';
import { rollPeriods } from './missions';
import { updateOnboarding } from './onboarding';
import { addEvent, addMetrics,addSnapshot } from './telemetry';

export type AdvanceReport = { credits:number; data:number; research:number; levels:number; experiments:number; hardware:number; seconds:number };
export type ResearchCompletionStep = 'project-complete'|'reward-applied'|'unlock-applied'|'queue-checked'|'missions-achievements-ready'|'state-ready-for-save-render';

/** Convert wall time to the save's explicit simulation timeline. */
export const simulationNow = (state:GameState, wallNow=Date.now()) => wallNow + state.clockOffsetMs;

function cloneForSimulation(state:GameState):GameState {
  return {
    ...state,
    nodes:[...state.nodes],scannerRewards:[...state.scannerRewards],runRecyclingRewards:[...state.runRecyclingRewards],runMilestoneClasses:[...state.runMilestoneClasses],lifetime:{...state.lifetime,hardwareClasses:[...state.lifetime.hardwareClasses],itemTypes:[...state.lifetime.itemTypes]},gemLedger:[...state.gemLedger],processedGemPurchases:[...state.processedGemPurchases], completedResearch:[...state.completedResearch],researchLevels:{...state.researchLevels}, breakthroughs:[...state.breakthroughs], inventory:state.inventory.map(item=>({...item})), equipped:{...state.equipped}, pity:{...state.pity},
    researchLabs:state.researchLabs.map(lab=>lab?{...lab}:null),
    experiments:{...state.experiments,active:state.experiments.active?{...state.experiments.active}:null,queue:[...state.experiments.queue],completedIds:[...state.experiments.completedIds]},
    automation:{...state.automation},
    missions:{daily:{...state.missions.daily,tasks:state.missions.daily.tasks.map(task=>({...task}))},weekly:{...state.missions.weekly,tasks:state.missions.weekly.tasks.map(task=>({...task}))},monthly:{...state.missions.monthly,tasks:state.missions.monthly.tasks.map(task=>({...task}))},mailbox:state.missions.mailbox.map(entry=>({...entry}))},
    achievementClaims:[...state.achievementClaims], ads:{...state.ads,counts:{...state.ads.counts},transactions:[...state.ads.transactions]}, settings:{...state.settings},
    telemetry:{...state.telemetry,recentEvents:[...state.telemetry.recentEvents],permanentEvents:[...state.telemetry.permanentEvents],metrics:state.telemetry.metrics.map(bucket=>({...bucket,income:{...bucket.income},offlineRewards:{...bucket.offlineRewards}})),snapshots:[...state.telemetry.snapshots],diagnostics:{...state.telemetry.diagnostics},archivedMetrics:{...state.telemetry.archivedMetrics,income:{...state.telemetry.archivedMetrics.income},offlineRewards:{...state.telemetry.archivedMetrics.offlineRewards}},prestigeHistory:[...state.telemetry.prestigeHistory]},
    story:{...state.story,queue:[...state.story.queue],seen:[...state.story.seen]},
  };
}

function autobuy(state:GameState) {
  if ((!hasNode(state,'shoppingAgent',1)&&!milestoneBonus(state,'automation')) || !state.automation.enabled) return state;
  const planned=hasNode(state,'shoppingPlan',1),targets=planned?(state.automation.target?[state.automation.target]:state.discovered):(['calculator'] as const),candidates=targets.map(id=>{const cost=hardwareCost(id,state.hardwareCounts[id],state);const gain=classCompute(state,id,state.hardwareCounts[id]+1)-classCompute(state,id);return{id,cost,score:gain/cost}}).sort((a,b)=>b.score-a.score);
  const pick=candidates.find(x=>state.credits-x.cost>=state.automation.reserve);
  return pick?buyHardwareClass(state,pick.id,1):state;
}

/**
 * Settles every lab that ended at or before the current simulation time.
 *
 * Keep removal and reward on the same newly-created state. Assigning the result of
 * `labs.map()` to `next.researchLabs` while reassigning `next` inside that callback
 * writes the mapped array to the stale object (the assignment target is evaluated
 * before the callback). The completed lab then survives and is completed forever.
 */
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
  if(next.researchQueue.length>0&&(hasNode(next,'labs3',1)||next.researchLevels.labAutomation>0)){
    const queued=next.researchQueue[0],started=startResearchProject(next,queued);
    const didStart=started.researchLabs.some(lab=>lab?.id===queued)&&!next.researchLabs.some(lab=>lab?.id===queued);next=didStart?{...started,researchQueue:started.researchQueue.slice(1)}:started;
  }
  mark('missions-achievements-ready');
  mark('state-ready-for-save-render');
  return {...next,telemetry:{...next.telemetry,diagnostics:{...next.telemetry.diagnostics,researchCompletionPhases:phases}}};
}

export function advance(state:GameState,seconds:number,active=false,rng=Math.random):{state:GameState;report:AdvanceReport} {
  if(!Number.isFinite(seconds)||seconds<=0)return{state,report:{credits:0,data:0,research:0,levels:0,experiments:0,hardware:0,seconds:0}};
  const limit=Math.min(BALANCE.maxOfflineSeconds,BALANCE.baseOfflineSeconds*(1+milestoneBonus(state,'offline'))),total=Math.max(0,Math.min(seconds,limit));
  let left=total,iterations=0,levels=0,experiments=0,hardware=0,generatedCredits=0,generatedData=0,generatedResearch=0,next=rollPeriods(cloneForSimulation(state),state.savedAt);
  while(left>1e-9&&iterations++<200_000) {
    const now=next.savedAt,goal=next.activeTraining?.workRequired??Infinity,rate=next.activeTraining?trainingRate(next.hardware,next,now):0;
    const toLevel=next.activeTraining?(goal-next.training)/rate:Infinity;
    const toAuto=next.automation.enabled?BALANCE.simulationStep-next.automation.elapsed:Infinity;
    const toExperiment=next.experiments.active?Math.max(0,(next.experiments.active.endsAt-now)/1000):Infinity;
    const toResearch=Math.min(...next.researchLabs.map(lab=>lab?Math.max(0,(lab.endsAt-now)/1000):Infinity));
    const toPeriod=Math.min(...(['daily','weekly','monthly'] as const).map(kind=>Math.max(0,(next.missions[kind].endsAt-now)/1000)));
    const toBoost=Math.min(next.trainingBoostUntil>now?(next.trainingBoostUntil-now)/1000:Infinity,next.creditBoostUntil>now?(next.creditBoostUntil-now)/1000:Infinity,next.overclock.activeUntil>now?(next.overclock.activeUntil-now)/1000:Infinity,next.overclock.cooldownUntil>now?(next.overclock.cooldownUntil-now)/1000:Infinity);
    let slice=Math.min(left,30,toLevel,toAuto,toExperiment,toResearch,toPeriod,toBoost);
    if(slice<1e-8) slice=Math.min(left,1e-6);
    const credits=creditRate(next.hardware,next.level,next,now)*slice,data=dataRate(next)*slice,research=researchRate(next,now)*slice;if(![slice,credits,data,research,rate].every(Number.isFinite))return{state,report:{credits:0,data:0,research:0,levels:0,experiments:0,hardware:0,seconds:0}};generatedCredits+=credits;generatedData+=data;generatedResearch+=research;
    next=addCredits(next,credits);next.data+=data;next.researchPoints+=research;next.lifetime.regularData+=data;const activeLabs=next.researchLabs.filter(Boolean).length;next.lifetime.labSeconds+=activeLabs*slice;if(next.labBoostUntil>now)next.researchLabs=next.researchLabs.map(lab=>lab?{...lab,endsAt:lab.endsAt-slice*1000}:null);
    const trainingWork=rate*slice;next.training+=trainingWork;if(next.activeTraining){const key=active?'onlineWork':'offlineWork';next.activeTraining={...next.activeTraining,[key]:(next.activeTraining[key]??0)+trainingWork};} next.savedAt+=slice*1000;next=rollPeriods(next,next.savedAt); next.automation.elapsed+=slice; left-=slice;
    if(next.activeTraining&&next.training+1e-7>=goal){const completed=next.activeTraining,track=completed.track,actualDuration=completed.startedAt===undefined?null:(next.savedAt-completed.startedAt)/1000;next.training=0;next.activeTraining=null;next.level++;next.lifetime.trainingCompleted++;if(track==='quality')next.qualityLevel++;else next.efficiencyLevel++;levels++;next=addEvent(next,'training-complete',next.savedAt,{track,level:next.level,creditCost:completed.creditCost,dataCost:completed.dataCost??0,baseDuration:completed.baseDuration??completed.workRequired,effectiveRate:completed.startingRate??0,expectedDuration:(completed.baseDuration??completed.workRequired)/(completed.startingRate??1),actualDuration,onlineWork:completed.onlineWork??0,offlineWork:completed.offlineWork??0});}
    if(next.automation.elapsed+1e-7>=BALANCE.simulationStep){next.automation.elapsed%=BALANCE.simulationStep;const before=next.hardware;next=autobuy(next);hardware+=next.hardware-before;}
    if(next.experiments.active&&next.experiments.active.endsAt<=next.savedAt+.1){const id=next.experiments.active.id;next=completeExperiment(next,next.savedAt,rng,active?'active':'offline');if(!next.experiments.active||next.experiments.active.id!==id)experiments++;}
    next=settleResearchCompletions(next);
    if(next.researchQueue.length>0&&(hasNode(next,'labs3',1)||next.researchLevels.labAutomation>0)&&next.researchLabs.some((lab,index)=>index<researchLabCount(next)&&!lab)){const queued=next.researchQueue[0],started=startResearchProject(next,queued),didStart=started.researchLabs.some(lab=>lab?.id===queued)&&!next.researchLabs.some(lab=>lab?.id===queued);next=didStart?{...started,researchQueue:started.researchQueue.slice(1)}:started;}
    next=addSnapshot(next,{at:next.savedAt,runSeconds:Math.max(0,(next.savedAt-(next.telemetry.runStartedAt??next.savedAt))/1000),credits:next.credits,creditsPerSecond:creditRate(next.hardware,next.level,next,next.savedAt),compute:computeRate(next.hardware,next),computePerSecond:computeRate(next.hardware,next),users:usersRate(next),data:next.data,dataPerSecond:dataRate(next),research:next.researchPoints,researchPerSecond:researchRate(next),gems:next.gems,hardwareCounts:{...next.hardwareCounts},modelLevel:next.level,qualityLevel:next.qualityLevel,efficiencyLevel:next.efficiencyLevel,activeTraining:next.activeTraining?.track??null,activeResearch:next.researchLabs.filter(Boolean).map(x=>x!.id).join('|'),prestigeClaim:newINT(next),activeLabs:next.researchLabs.filter(Boolean).length});
  }
  if(left>1e-9)return{state,report:{credits:0,data:0,research:0,levels:0,experiments:0,hardware:0,seconds:0}};
  next=updateOnboarding(rollPeriods(next,next.savedAt));
  if(active)next.lifetime.activeSeconds+=total;
  const offline=!active&&total>10;
  next=addMetrics(next,next.savedAt,{activeSeconds:active?total:0,offlineSeconds:offline?total:0,passive:offline?0:generatedCredits,offline:offline?generatedCredits:0,offlineCredits:offline?generatedCredits:0,offlineData:offline?generatedData:0,offlineResearch:offline?generatedResearch:0});
  return {state:next,report:{credits:next.credits-state.credits,data:next.data-state.data,research:next.researchPoints-state.researchPoints,levels,experiments,hardware,seconds:total}};
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
