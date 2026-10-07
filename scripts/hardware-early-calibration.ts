/** Bounded active 90-minute hardware comparison. No grants, claims or resets. */
import {writeFileSync,readFileSync,existsSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {BALANCE,newGame,registerTap,startTraining,startResearchProject,hardwareIds,hardwarePurchasePreview,buyHardwareClass,creditRateScientific,newINTScientific,exactEconomyValue,type HardwareId,type TrainingTrack} from '../src/economy';
import {advance} from '../src/simulation';
const started=performance.now(),path=process.argv[2];
if(!path)throw Error('Output JSON path required');
const budgetPath='node_modules/.cache/hardware-calibration-budget.json';
const budget=existsSync(budgetPath)?JSON.parse(readFileSync(budgetPath,'utf8')):{milliseconds:0,rounds:0};
const override=process.argv[3]?JSON.parse(process.argv[3]):null;
if(override){if(budget.rounds>=3)throw Error('Three calibration rounds already used');for(const [id,cost] of Object.entries(override)){if(!['sbc','pc','gpu','rig','server'].includes(id)||!Number.isFinite(cost)||Number(cost)<=0)throw Error('Invalid price override');(BALANCE.hardware[id as HardwareId] as {baseCost:number}).baseCost=Number(cost);}budget.rounds++;}
if(!hardwareIds.every((id,i)=>!i||BALANCE.hardware[id].baseCost>BALANCE.hardware[hardwareIds[i-1]].baseCost))throw Error('Prices must increase strictly');
function run(strategy:'A'|'B'){
 let s=newGame(0,'hardware-8a'),track:TrainingTrack='quality',lastBuy=0,firstPrestige:number|null=null;
 const firstBuys:Record<string,number>={},events:unknown[]=[],checkpoints:unknown[]=[];
 for(let t=0;t<=5400;t++){
  if(performance.now()-started+budget.milliseconds>300000)throw Error('Five-minute cumulative calibration runtime exceeded');
  if(t){s=advance(s,1,true,()=>.5).state;s=registerTap(s,s.savedAt);}
  if(newINTScientific(s).compare(ScientificNumber.from(1))>=0&&firstPrestige===null)firstPrestige=t;
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
   if(pick){const before=s,quote=hardwarePurchasePreview(s,pick);s=buyHardwareClass(s,pick);if(s!==before){const owned=s.hardwareCounts[pick],milestone=BALANCE.hardware[pick].milestones.find(m=>m.threshold===owned);if(owned===1)firstBuys[pick]=t;if(owned===1||milestone)events.push({second:t,id:pick,owned,cost:quote.cost.toScientificString(16),creditRate:creditRateScientific(s.hardware,s.level,s).toScientificString(16),sinceLastPurchaseSeconds:t-lastBuy,milestone:milestone?.threshold??null});lastBuy=t;}}
  }
  if(t%300===0)checkpoints.push({second:t,counts:s.hardwareCounts,credits:exactEconomyValue(s,'credits').toScientificString(16),creditRate:creditRateScientific(s.hardware,s.level,s).toScientificString(16)});
 }
 return{strategy,firstBuys,firstPrestige,events,checkpoints,final:{credits:exactEconomyValue(s,'credits').toScientificString(16),counts:s.hardwareCounts,quality:s.qualityLevel,efficiency:s.efficiencyLevel,dataGeneration:s.researchLevels.dataGeneration,taps:s.lifetime.taps,prestiges:s.prestigeCount}};
}
// SCI constant, never used as a native purchase projection.
import {ScientificNumber} from '../src/scientificNumber';
const results=[run('A'),run('B')],runtime=performance.now()-started;
budget.milliseconds+=runtime;writeFileSync(budgetPath,JSON.stringify(budget));
const output={parameters:Object.fromEntries(hardwareIds.map(id=>[id,BALANCE.hardware[id].baseCost])),runtimeMilliseconds:runtime,cumulativeRuntimeMilliseconds:budget.milliseconds,round:budget.rounds,profile:'t=0 decision; 5400 one-second active advances and taps; decisions every 10s; alternating affordable Q/E then dataGeneration<=2; fixed RNG=.5; no claims/items/analyses/resets',results};
writeFileSync(path,JSON.stringify(output,null,2)+'\n');console.log(JSON.stringify({runtime,budget,firstBuys:results.map(r=>({strategy:r.strategy,...r.firstBuys}))}));
