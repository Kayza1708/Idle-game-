/** Two genuine fresh profiles, together <=300 seconds; no prepared resource grants here. */
import {writeFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {newGame,registerTap,startTraining,startResearchProject,buyHardwareClass,hardwareIds,hardwarePurchasePreview,exactEconomyValue,dataRateScientific,type GameState,type TrainingTrack} from '../src/economy';
import {queueExperiment} from '../src/experiments';
import {craft,craftAffordability,claimLootDrop} from '../src/inventory';
import {advance} from '../src/simulation';
import {serialize,restore} from '../src/storage';
const started=performance.now();if(!process.argv[2])throw Error('output path required');
function run(priority:'A'|'B'){
 let s=newGame(0,`item-grind-profile-${priority}`),track:TrainingTrack='quality',seed=1708;
 const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const spending={training:0,research:0,analysis:0,crafting:0},first:Record<string,number>={},checkpoints:unknown[]=[];
 function paid(family:keyof typeof spending,action:(state:GameState)=>GameState){const before=s;s=action(s);const delta=exactEconomyValue(before,'data').subtract(exactEconomyValue(s,'data')).toNumber();if(delta>0)spending[family]+=delta;if(s!==before){if(family==='training'&&s.activeTraining!==before.activeTraining)first.trainingStart??=s.savedAt/1000;if(family==='research'&&s.lifetime.researchStarted>before.lifetime.researchStarted)first.researchStart??=s.savedAt/1000;if(family==='analysis'&&s.experiments.active!==before.experiments.active)first.analysisStart??=s.savedAt/1000;if(family==='crafting'&&s.crafting.active!==before.crafting.active)first.craftStart??=s.savedAt/1000;}}
 for(let second=0;second<=7200;second++){
  if(performance.now()-started>300000)throw Error('Shared profile budget exhausted');
  if(second){const next=advance(s,1,true,rng);s=next.state;if(next.report.experiments)first.analysisComplete??=second;if(next.report.craftingCompleted)first.craftComplete??=second;s=registerTap(s,s.savedAt);if(s.lootDrops.length)s=claimLootDrop(s,s.lootDrops[0].id,rng);}
  if(second%10===0){
   const model=()=>{paid('training',state=>startTraining(state,track));if(s.activeTraining?.track===track)track=track==='quality'?'efficiency':'quality';paid('research',state=>startResearchProject(state,state.researchLevels.dataGeneration<2?'dataGeneration':'modelArchitecture'));};
   const analysis=()=>{if(!s.experiments.active&&!s.experiments.completedIds.length)paid('analysis',state=>queueExperiment(state,'hardware',state.savedAt,'short'));};
   const manufacturing=()=>{if(!s.craftedItemCounts['impulse-relay']&&!s.crafting.active)paid('crafting',state=>craft(state,'impulse-relay'));};
   if(priority==='A'){model();analysis();manufacturing();}else{analysis();manufacturing();if(s.experiments.active||s.experiments.completedIds.length)model();}
   const pick=hardwareIds.map(id=>hardwarePurchasePreview(s,id)).filter(q=>q.allowed&&!q.creditGain.isZero()).sort((a,b)=>b.creditGain.divide(b.cost).compare(a.creditGain.divide(a.cost))||hardwareIds.indexOf(a.id)-hardwareIds.indexOf(b.id))[0];if(pick)s=buyHardwareClass(s,pick.id);
  }
  if(second%600===0)checkpoints.push({second,data:exactEconomyValue(s,'data').toJSON(),generated:exactEconomyValue(s,'lifetimeDataGenerated').toJSON(),spending:{...spending},inventory:s.inventory.length,crafted:s.craftedItemCounts['impulse-relay'],analysis:s.experiments.completedIds.length});
 }
 const loaded=restore(serialize(s),s.savedAt);if(loaded.error)throw Error(loaded.error);
 const q=craftAffordability(s,'impulse-relay');return{priority,first,spending,checkpoints,final:{data:exactEconomyValue(s,'data').toJSON(),generated:exactEconomyValue(s,'lifetimeDataGenerated').toJSON(),rate:dataRateScientific(s).toJSON(),components:s.componentInventory,fragments:s.blueprintFragments,crafted:s.craftedItemCounts,mastery:s.blueprintMastery,trainingCompleted:s.lifetime.trainingCompleted,researchCompleted:s.lifetime.researchCompleted,hardware:s.hardwareCounts,taps:s.lifetime.taps},craftBlock:{reasons:q.reasons,components:q.missingComponents,modules:q.missingModules,data:q.data.missingExact.toJSON()},reload:true};
}
const profiles=[run('A'),run('B')],result={runtimeMilliseconds:performance.now()-started,budgetMilliseconds:300000,policy:'Exactly two newGame profiles, 120 active minutes each. Same 50 starting Credits, zero hardware, seed 1708, one actual tap and at most one actual world-drop collection per second. Every 10s at most one check per action family; hardware maximizes marginal Credit/s per Credit. A trains/researches before first short hardware analysis/craft; B waits for first short hardware analysis then prioritizes first impulse-relay craft before training/research. No grants, claims, resets, free unlocks, prepared inventory or parameter tuning. Random draw streams diverge with genuine actions.',profiles};writeFileSync(process.argv[2],JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
