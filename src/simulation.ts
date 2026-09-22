import { BALANCE, addCredits, GameState, trainingGoal, trainingRate, creditRate, bulkCost, buyHardware } from './economy';
import { completeExperiment } from './experiments';
import { achievementCheck, rollPeriods } from './missions';

export type AdvanceReport = { credits:number; levels:number; experiments:number; hardware:number; seconds:number };

/** Convert wall time to the save's explicit simulation timeline. */
export const simulationNow = (state:GameState, wallNow=Date.now()) => wallNow + state.clockOffsetMs;

function cloneForSimulation(state:GameState):GameState {
  return {
    ...state,
    nodes:[...state.nodes], breakthroughs:[...state.breakthroughs], inventory:state.inventory.map(item=>({...item})), equipped:{...state.equipped}, pity:{...state.pity},
    experiments:{...state.experiments,active:state.experiments.active?{...state.experiments.active}:null,queue:[...state.experiments.queue],completedIds:[...state.experiments.completedIds]},
    automation:{...state.automation},
    missions:{daily:{...state.missions.daily,days:[...state.missions.daily.days],claims:[...state.missions.daily.claims]},weekly:{...state.missions.weekly,days:[...state.missions.weekly.days],claims:[...state.missions.weekly.claims]},mailbox:state.missions.mailbox.map(entry=>({...entry}))},
    achievementClaims:[...state.achievementClaims], ads:{...state.ads,counts:{...state.ads.counts},transactions:[...state.ads.transactions]}, settings:{...state.settings},
  };
}

function autobuy(state:GameState) {
  if (!state.prestigeCount || !state.automation.enabled) return state;
  let count=0;
  while(count<10000 && state.credits-bulkCost(state.hardware,count+1,state)>=state.automation.reserve) count++;
  return count ? buyHardware(state,count) : state;
}

export function advance(state:GameState,seconds:number,active=false,rng=Math.random):{state:GameState;report:AdvanceReport} {
  const total=Math.max(0,Math.min(seconds,BALANCE.maxOfflineSeconds));
  let left=total,levels=0,experiments=0,hardware=0,next=cloneForSimulation(state);
  while(left>1e-9) {
    const now=next.savedAt,goal=trainingGoal(next.level),rate=trainingRate(next.hardware,next,now);
    const toLevel=(goal-next.training)/rate;
    const toAuto=next.automation.enabled?BALANCE.simulationStep-next.automation.elapsed:Infinity;
    const toExperiment=next.experiments.active?Math.max(0,(next.experiments.active.endsAt-now)/1000):Infinity;
    const toBoost=Math.min(next.trainingBoostUntil>now?(next.trainingBoostUntil-now)/1000:Infinity,next.creditBoostUntil>now?(next.creditBoostUntil-now)/1000:Infinity);
    let slice=Math.min(left,toLevel,toAuto,toExperiment,toBoost);
    if(slice<1e-8) slice=Math.min(left,1e-6);
    next=addCredits(next,creditRate(next.hardware,next.level,next,now)*slice);
    next.training+=rate*slice; next.savedAt+=slice*1000; next.automation.elapsed+=slice; left-=slice;
    if(next.training+1e-7>=goal){next.training=Math.max(0,next.training-goal);next.level++;levels++;next.missions.daily.training++;next.missions.weekly.training++;}
    if(next.automation.elapsed+1e-7>=BALANCE.simulationStep){next.automation.elapsed%=BALANCE.simulationStep;const before=next.hardware;next=autobuy(next);hardware+=next.hardware-before;}
    if(next.experiments.active&&next.experiments.active.endsAt<=next.savedAt+.1){const id=next.experiments.active.id;next=completeExperiment(next,next.savedAt,rng);if(!next.experiments.active||next.experiments.active.id!==id)experiments++;}
  }
  next=achievementCheck(rollPeriods(next,next.savedAt));
  if(active){next.missions.daily.activeSeconds+=total;const day=new Date(next.savedAt).toISOString().slice(0,10);if(!next.missions.weekly.days.includes(day))next.missions.weekly.days.push(day);}
  return {state:next,report:{credits:next.credits-state.credits,levels,experiments,hardware,seconds:total}};
}

export function advanceTo(state:GameState,wallNow:number,active=false) {
  const now=simulationNow(state,wallNow);
  const result=advance(state,(now-state.savedAt)/1000,active);
  if(now>state.savedAt&&now-state.savedAt>BALANCE.maxOfflineSeconds*1000) result.state.savedAt=now;
  return result;
}

/** Fast-forward on the same persistent timeline; subsequent wall seconds remain immediately productive. */
export function debugAdvance(state:GameState,seconds:number,wallNow=Date.now()) {
  const synchronized=advanceTo(state,wallNow).state;
  const result=advance(synchronized,seconds);
  result.state.clockOffsetMs+=result.report.seconds*1000;
  return result;
}
