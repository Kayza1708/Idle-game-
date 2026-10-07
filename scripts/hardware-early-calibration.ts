/** Bounded active 180-minute hardware comparison. No grants, claims or resets. */
import {writeFileSync,readFileSync,existsSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {BALANCE,newGame,registerTap,startTraining,startResearchProject,hardwareIds,hardwarePurchasePreview,buyHardwareClass,creditRateScientific,newINTScientific,exactEconomyValue,type HardwareId,type TrainingTrack} from '../src/economy';
import {advance} from '../src/simulation';
const started=performance.now(),path=process.argv[2];
if(!path)throw Error('Output JSON path required');
const budgetPath='node_modules/.cache/hardware-8b-calibration-budget.json';
const budget=existsSync(budgetPath)?JSON.parse(readFileSync(budgetPath,'utf8')):{milliseconds:0,rounds:0};
const override=process.argv[3]?JSON.parse(process.argv[3]):null;
if(override&&process.argv.includes('--remeasure')){const previous=existsSync(path)?JSON.parse(readFileSync(path,'utf8')):null;if(!previous||!['server','farm'].every(id=>previous.parameters[id]===override[id]))throw Error('Remeasure requires exactly the already recorded prices');}
if(override){if(!process.argv.includes('--remeasure')&&budget.rounds>=3)throw Error('Three calibration rounds already used');for(const [id,cost] of Object.entries(override)){if(!['server','farm'].includes(id)||!Number.isFinite(cost)||Number(cost)<=0)throw Error('Invalid price override');(BALANCE.hardware[id as HardwareId] as {baseCost:number}).baseCost=Number(cost);}if(!process.argv.includes('--remeasure'))budget.rounds++;}
if(!hardwareIds.every((id,i)=>!i||BALANCE.hardware[id].baseCost>BALANCE.hardware[hardwareIds[i-1]].baseCost))throw Error('Prices must increase strictly');
function run(strategy:'A'|'B'){
 let s=newGame(0,'hardware-8b'),track:TrainingTrack='quality',lastBuy=0,firstPrestige:number|null=null,firstThreeINT:number|null=null,waitingTarget:HardwareId|null=null,waitingAt:number|null=null;
 const targetSelectionWaits:Record<string,{startedAt:number;endedAt:number;seconds:number}[]>={server:[],farm:[]};
 const firstBuys:Record<string,number>={},events:unknown[]=[],checkpoints:unknown[]=[];
 const saving=Object.fromEntries((['server','farm'] as const).map(id=>[id,{goalStartedAt:null as number|null,firstAffordableAt:null as number|null,unaffordableSeconds:0,boughtAt:null as number|null,goalWindowSeconds:null as number|null}]));
 for(let t=0;t<=10800;t++){
  if(performance.now()-started+budget.milliseconds>300000)throw Error('Five-minute cumulative calibration runtime exceeded');
  if(t){s=advance(s,1,true,()=>.5).state;s=registerTap(s,s.savedAt);}
  if(newINTScientific(s).compare(ScientificNumber.from(1))>=0&&firstPrestige===null)firstPrestige=t;
  if(newINTScientific(s).compare(ScientificNumber.from(3))>=0&&firstThreeINT===null)firstThreeINT=t;
  for(const id of ['server','farm'] as const){const goal=saving[id],previous=hardwareIds[hardwareIds.indexOf(id)-1];if(goal.boughtAt===null&&s.hardwareCounts[previous]>0){if(goal.goalStartedAt===null)goal.goalStartedAt=t;const q=hardwarePurchasePreview(s,id);if(q.allowed&&goal.firstAffordableAt===null)goal.firstAffordableAt=t;else if(!q.allowed&&t>goal.goalStartedAt)goal.unaffordableSeconds++;}}
  if(t%10===0){
   const trained=startTraining(s,track);if(trained!==s){s=trained;track=track==='quality'?'efficiency':'quality';}
   if(s.researchLevels.dataGeneration<2)s=startResearchProject(s,'dataGeneration');
   let pick:HardwareId|undefined;
   if(strategy==='A'){
    const quotes=hardwareIds.map(id=>hardwarePurchasePreview(s,id));
    pick=quotes.filter(q=>q.allowed&&!q.creditGain.isZero()).sort((a,b)=>b.creditGain.divide(b.cost).compare(a.creditGain.divide(a.cost))||hardwareIds.indexOf(a.id)-hardwareIds.indexOf(b.id))[0]?.id;
   }else{
    const index=hardwareIds.findLastIndex(id=>s.hardwareCounts[id]>0);
    if(index<0)pick='calculator';else{const id=hardwareIds[index],threshold=[10,25,50].find(n=>n>s.hardwareCounts[id]),next=hardwareIds[index+1];
     if(!threshold)pick=next;else{const remaining=hardwarePurchasePreview(s,id,threshold-s.hardwareCounts[id]);pick=next&&hardwarePurchasePreview(s,next).cost.compare(remaining.cost)<0?next:id;}}
   }
   if(strategy==='B'){const blocked=pick&&(pick==='server'||pick==='farm')&&!hardwarePurchasePreview(s,pick).allowed?pick:null;if(waitingTarget&&blocked!==waitingTarget){targetSelectionWaits[waitingTarget].push({startedAt:waitingAt!,endedAt:t,seconds:t-waitingAt!});waitingTarget=null;waitingAt=null;}if(blocked&&!waitingTarget){waitingTarget=blocked;waitingAt=t;}}
   if(pick){const before=s,quote=hardwarePurchasePreview(s,pick);s=buyHardwareClass(s,pick);if(s!==before){const owned=s.hardwareCounts[pick],milestone=BALANCE.hardware[pick].milestones.find(m=>m.threshold===owned);if(owned===1){firstBuys[pick]=t;if(pick==='server'||pick==='farm'){const goal=saving[pick];goal.boughtAt=t;goal.goalWindowSeconds=goal.goalStartedAt===null?null:t-goal.goalStartedAt;}}if(owned===1||milestone)events.push({second:t,id:pick,owned,cost:quote.cost.toScientificString(16),creditRate:creditRateScientific(s.hardware,s.level,s,s.savedAt).toScientificString(16),creditRateBefore:creditRateScientific(before.hardware,before.level,before,before.savedAt).toScientificString(16),creditRateGain:quote.creditGain.toScientificString(16),milestonesBeforeSwitch:before.runMilestoneEdges,sinceLastPurchaseSeconds:t-lastBuy,milestone:milestone?.threshold??null});lastBuy=t;}}
  }
  if(t%300===0)checkpoints.push({second:t,counts:s.hardwareCounts,credits:exactEconomyValue(s,'credits').toScientificString(16),creditRate:creditRateScientific(s.hardware,s.level,s,s.savedAt).toScientificString(16)});
 }
 return{strategy,firstBuys,firstPrestige,firstThreeINT,saving,targetSelectionWaits:strategy==='B'?targetSelectionWaits:null,unfinishedTargetWait:waitingTarget?{id:waitingTarget,startedAt:waitingAt,observedUntil:10800}:null,events,checkpoints,final:{credits:exactEconomyValue(s,'credits').toScientificString(16),counts:s.hardwareCounts,quality:s.qualityLevel,efficiency:s.efficiencyLevel,dataGeneration:s.researchLevels.dataGeneration,taps:s.lifetime.taps,prestiges:s.prestigeCount}};
}
// SCI constant, never used as a native purchase projection.
import {ScientificNumber} from '../src/scientificNumber';
const results=[run('A'),run('B')],runtime=performance.now()-started;
budget.milliseconds+=runtime;writeFileSync(budgetPath,JSON.stringify(budget));
const output={parameters:Object.fromEntries(hardwareIds.map(id=>[id,BALANCE.hardware[id].baseCost])),runtimeMilliseconds:runtime,cumulativeRuntimeMilliseconds:budget.milliseconds,priceRoundsUsed:budget.rounds,profile:'t=0 decision; 10800 one-second active advances and taps; decisions every 10s; alternating affordable Q/E then dataGeneration<=2; fixed RNG=.5; no claims/items/analyses/resets',results};
writeFileSync(path,JSON.stringify(output,null,2)+'\n');console.log(JSON.stringify({runtime,budget,firstBuys:results.map(r=>({strategy:r.strategy,...r.firstBuys}))}));
