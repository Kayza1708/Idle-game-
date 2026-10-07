/** One deterministic parameter derivation, real claims and one genuine restart. */
import {performance} from 'node:perf_hooks';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {BALANCE,newGame,registerTap,buyHardwareClass,newINTScientific,exactEconomyValue,creditMultiplierFromINT,toggleHardwareAutobuyer,type GameState,type TrainingTrack} from '../src/economy';
import {ScientificNumber} from '../src/scientificNumber';
import {prestige,buyNode} from '../src/prestige';
import {advance} from '../src/simulation';
import {prepareEarlyHardwareDecision} from './early-hardware-profile';
const started=performance.now(),budgetPath='node_modules/.cache/first-prestige-budget.json';
const previous=existsSync(budgetPath)?JSON.parse(readFileSync(budgetPath,'utf8')).milliseconds:0;
const guard=()=>{if(previous+performance.now()-started>300000)throw Error('Five-minute cumulative measurement budget exceeded');};
process.once('exit',()=>writeFileSync(budgetPath,JSON.stringify({milliseconds:previous+performance.now()-started})));
const out=process.argv[2];if(!out)throw Error('Output JSON path required');
function run(strategy:'A'|'B',restart=false){
 let s=newGame(0,'first-prestige-8c'),track:TrainingTrack='quality',weightedAt60:ScientificNumber|null=null,firstOne:number|null=null,firstThree:number|null=null,resetAt:number|null=null,resetProof:unknown=null;
 const purchases:unknown[]=[],seen=new Set<string>();
 function observe(state:GameState,source:string){for(const event of state.telemetry.recentEvents){if(event.type!=='hardware-purchase'||event.at!==state.savedAt)continue;const key=`${event.run}:${event.at}:${event.details.id}:${event.details.ownedAfter}`;if(seen.has(key))continue;seen.add(key);if(event.details.ownedAfter===1||event.details.ownedAfter===10)purchases.push({second:state.savedAt/1000,run:state.prestigeCount,runSecond:resetAt===null?state.savedAt/1000:state.savedAt/1000-resetAt,source,...event.details});}}
 const checkpoints:unknown[]=[];
 for(let t=0;t<=10800;t++){
  guard();if(t){s=advance(s,1,true,()=>.5).state;observe(s,'regular-autobuyer');s=registerTap(s,s.savedAt);}
  const claim=newINTScientific(s);if(firstOne===null&&claim.compare(ScientificNumber.from(1))>=0)firstOne=t;if(firstThree===null&&claim.compare(ScientificNumber.from(3))>=0)firstThree=t;
  if(t===3600)weightedAt60=exactEconomyValue(s,'cycleEligibleCredits');
  if(restart&&resetAt===null&&claim.compare(ScientificNumber.from(3))>=0){
   if(t<2700||t>4500)throw Error('Actual first prestige outside the requested 45–75 minute window');
   const before=s,reset=prestige(s);if(reset===s||reset.credits!==50||reset.hardware!==0||prestige(reset)!==reset)throw Error('Normal reset/start/idempotence contract failed');
   const bonus=creditMultiplierFromINT(reset),bought=buyNode(reset,'shoppingAgent');if(bought===reset||exactEconomyValue(reset,'unspentINT').subtract(exactEconomyValue(bought,'unspentINT')).compare(ScientificNumber.from(1))!==0||creditMultiplierFromINT(bought)!==bonus)throw Error('Regular shopping node cost/earned bonus failed');
   s=toggleHardwareAutobuyer(toggleHardwareAutobuyer(bought,'calculator'),'sbc');s={...s,automation:{...s.automation,reservePercent:.25}};
   resetAt=t;track='quality';resetProof={second:t,claimedINT:claim.toJSON(),beforeWeightedRevenue:exactEconomyValue(before,'cycleEligibleCredits').toJSON(),start:{credits:reset.credits,ledger:reset.exactEconomy.credits,hardware:reset.hardware,counts:reset.hardwareCounts,runCreditsEarned:reset.runCreditsEarned,regularCreditsBefore:before.lifetime.regularCredits,regularCreditsAfter:reset.lifetime.regularCredits,claimImmediatelyAfterReset:newINTScientific(reset).toJSON()},nodeCost:1,unspentAfter:exactEconomyValue(s,'unspentINT').toJSON(),earnedINT:exactEconomyValue(s,'cycleINTEarned').toJSON(),bonusBeforeNode:bonus,bonusAfterNode:creditMultiplierFromINT(s),reservePercent:.25,researchLevelsKept:reset.researchLevels,masteryKept:reset.retention.hardwareMasteryXp};
   // No hardware purchase at reset; the regular 10-second simulation path acts first.
  }else if(t%10===0){const prepared=prepareEarlyHardwareDecision(s,track,strategy);s=prepared.state;track=prepared.track;if(prepared.pick){s=buyHardwareClass(s,prepared.pick);observe(s,'profile-decision');}}
  if(t%300===0)checkpoints.push({second:t,run:s.prestigeCount,weightedRevenue:exactEconomyValue(s,'cycleEligibleCredits').toScientificString(16),claim:newINTScientific(s).toScientificString(16),counts:s.hardwareCounts});
  if(restart&&resetAt!==null&&t>=resetAt+600)break;
 }
 return{strategy,restart,observedThrough:s.savedAt/1000,firstOne,firstThree,weightedAt60:weightedAt60!.toJSON(),resetAt,resetProof,purchases,checkpoints,final:{prestiges:s.prestigeCount,counts:s.hardwareCounts,earnedINT:exactEconomyValue(s,'cycleINTEarned').toJSON(),claim:newINTScientific(s).toJSON(),taps:s.lifetime.taps}};
}
if(process.argv.includes('--restart-only')){const output=JSON.parse(readFileSync(out,'utf8'));if(output.newParameter!==BALANCE.prestigeBaseRevenue)throw Error('Previously measured parameter must match the central value');output.restartA=run('A',true);output.followupRuntimeMilliseconds=performance.now()-started;output.cumulativeRuntimeMilliseconds=previous+performance.now()-started;writeFileSync(out,JSON.stringify(output,null,2)+'\n');console.log(JSON.stringify({resetAt:output.restartA.resetAt,observedThrough:output.restartA.observedThrough,cumulativeRuntime:output.cumulativeRuntimeMilliseconds}));}else{
const oldParameter=BALANCE.prestigeBaseRevenue,oldA=run('A'),weighted=ScientificNumber.fromJSON(oldA.weightedAt60),parameterExact=weighted.divideNumber(9);
if(parameterExact.isZero()||parameterExact.compare(ScientificNumber.from(Number.MAX_VALUE))>0)throw Error('Derived central Number parameter is not representable');
const newParameter=parameterExact.toNumber(Number.MAX_VALUE);if(!Number.isFinite(newParameter)||newParameter<=0)throw Error('Invalid central parameter');
(BALANCE as {prestigeBaseRevenue:number}).prestigeBaseRevenue=newParameter;
const newA=run('A'),newB=run('B'),restartA=run('A',true);
if(ScientificNumber.fromJSON(newA.weightedAt60).compare(weighted)!==0)throw Error('Changing the prestige parameter altered the no-reset production profile');
const output={oldParameter,newParameter,weightedAt60:weighted.toJSON(),parameterExact:parameterExact.toJSON(),formula:'cycleEligibleCredits at second 3600 divided by 9; all claim timestamps use newINTScientific',oldA,newA,newB,restartA,runtimeMilliseconds:performance.now()-started,cumulativeRuntimeMilliseconds:previous+performance.now()-started};writeFileSync(out,JSON.stringify(output,null,2)+'\n');console.log(JSON.stringify({oldParameter,newParameter,weightedAt60:weighted.toScientificString(16),oldA:[oldA.firstOne,oldA.firstThree],newA:[newA.firstOne,newA.firstThree],newB:[newB.firstOne,newB.firstThree],resetAt:restartA.resetAt,runtime:output.runtimeMilliseconds}));

}
