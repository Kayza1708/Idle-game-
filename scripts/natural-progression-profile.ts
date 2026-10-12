import type {TelemetryEvent} from '../src/telemetry';
/** Bounded observations of the real domain; no grants, debug stocks or free unlocks. */
import {performance} from 'node:perf_hooks';
import {newGame,registerTap,startTraining,startResearchProject,buyHardwareClass,hardwareIds,hardwarePurchasePreview,exactEconomyValue,newINTScientific,toggleHardwareAutobuyer,type GameState,type TrainingTrack,type ItemTypeId,type ResearchId} from '../src/economy';
import {ScientificNumber} from '../src/scientificNumber';
import {queueExperiment,analysisQuote} from '../src/experiments';
import {craft,craftModule,craftAffordability,claimLootDrop,equip} from '../src/inventory';
import {learnBlueprint,blueprintQuote} from '../src/blueprints';
import {advance} from '../src/simulation';
import {prestige,buyNode,prestigePreview} from '../src/prestige';
import {serialize,restore} from '../src/storage';
export type ProfileConfig={play:'continuous'|'short-sessions';priority:'model-first'|'materials-first';seed:number;seconds:number;budgetMs?:number};
export const onlineAt=(play:ProfileConfig['play'],second:number)=>play==='continuous'||second<600||(second>=3600&&second<3900);
export function runNaturalProfile(config:ProfileConfig){
 if(!Number.isSafeInteger(config.seconds)||config.seconds<1||config.seconds>7200)throw Error('Profile horizon must be 1..7200 seconds');
 const wallStart=performance.now(),budget=config.budgetMs??60_000;
 let s=newGame(0,`natural-${config.play}-${config.priority}-${config.seed}`),random=config.seed,track:TrainingTrack='quality',onlineSeconds=0,offlineSeconds=0;
 const rng=()=>{random=(Math.imul(random,1664525)+1013904223)>>>0;return random/4294967296;};
 const initial={credits:exactEconomyValue(s,'credits').toJSON(),hardware:s.hardware,data:s.data,components:s.components,gems:s.gems};
 const first:Record<string,number>={},blocks:Record<string,Record<string,number>>={},actions:{at:number;family:string;detail:string;credits:ReturnType<ScientificNumber['toJSON']>;data:ReturnType<ScientificNumber['toJSON']>}[]=[];
 const seenEvents=new WeakSet<TelemetryEvent>(),bookedCosts:Record<string,{credits:ScientificNumber;data:ScientificNumber;events:number}>={};
 let dropData=ScientificNumber.zero(),dropCredits=ScientificNumber.zero(),resetData=ScientificNumber.zero();
 const spending:Record<string,{credits:ScientificNumber;data:ScientificNumber}>={},checkpoints:unknown[]=[],resets:unknown[]=[],seenHardware=new Set<string>();
 function observe(){
  const at=s.savedAt/1000;
  for(const event of [...s.telemetry.recentEvents,...s.telemetry.permanentEvents]){
   if(seenEvents.has(event))continue;seenEvents.add(event);
   if(!['hardware-purchase','training-start','research-start','experiment-start','crafting_queued'].includes(event.type))continue;
   const d=event.details,credits=event.type==='hardware-purchase'?ScientificNumber.fromString(String(d.exactCost??d.cost)):ScientificNumber.zero();
   const data=event.type==='hardware-purchase'?ScientificNumber.zero():d.exactDataCost?ScientificNumber.fromString(String(d.exactDataCost)):ScientificNumber.from(Number(d.dataCost??0));
   const sum=bookedCosts[event.type]??{credits:ScientificNumber.zero(),data:ScientificNumber.zero(),events:0};bookedCosts[event.type]={credits:sum.credits.add(credits),data:sum.data.add(data),events:sum.events+1};
  }
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
  if(!s.activeTraining&&act('training',track,state=>startTraining(state,track)))track=track==='quality'?'efficiency':'quality';
  const research:ResearchId|undefined=s.researchLevels.dataGeneration<2?'dataGeneration':s.researchLevels.modelArchitecture<1?'modelArchitecture':!s.completedResearch.includes('blueprints')?'blueprints':undefined;
  if(research)act('research',research,state=>startResearchProject(state,research));
 }
 function analysis(){if(analysisQuote(s,'hardware','short').allowed&&(!s.craftedItemCounts['quantum-chip']||!s.materials.knownBlueprints.length))act('analysis','hardware:short',state=>queueExperiment(state,'hardware',state.savedAt,'short'));}
 function decisions(){
  // Claim once at >=3 INT, between analyses. Running research/crafting continue;
  // any cancelled training is explicitly reported through the real reset preview.
  if(!s.prestigeCount&&newINTScientific(s).compare(ScientificNumber.from(3))>=0&&!s.experiments.active){const before=s,preview=prestigePreview(s);s=prestige(s);if(s!==before){first.prestige??=s.savedAt/1000;resetData=resetData.add(exactEconomyValue(before,'data'));resets.push({at:s.savedAt/1000,gain:preview.claimableINT,reset:preview.reset,jobs:preview.jobs});}}
  if(s.prestigeCount){for(const node of ['shoppingAgent','dataArchive1','analysis1','manufacturing1','labs1'] as const){if(!s.nodes.includes(node)){act('node',node,state=>buyNode(state,node));break;}}
   for(const id of ['calculator','sbc'] as const)if(!s.hardwareAutoBuyers[id])act('automation',id,state=>toggleHardwareAutobuyer(state,id));
   const item=s.inventory.find(item=>!Object.values(s.equipped).includes(item.id));if(item)act('equip',item.type,state=>equip(state,item.id));}
  if(config.priority==='model-first'){model();factory();analysis();}else{factory();analysis();if(s.experiments.active||s.experiments.completedIds.length)model();}
  const pick=hardwareIds.map(id=>hardwarePurchasePreview(s,id)).filter(q=>q.allowed&&!q.creditGain.isZero()).sort((a,b)=>b.creditGain.divide(b.cost).compare(a.creditGain.divide(a.cost))||hardwareIds.indexOf(a.id)-hardwareIds.indexOf(b.id))[0];
  if(pick)act('hardware',pick.id,state=>buyHardwareClass(state,pick.id));
 }
 observe();decisions();
 for(let elapsed=0;elapsed<config.seconds;){
  if(performance.now()-wallStart>budget)throw Error(`Profile ${config.play}/${config.priority}/${config.seed} exceeded ${budget}ms`);
  const online=onlineAt(config.play,elapsed),step=online?1:Math.min(10,config.seconds-elapsed);
  if(online){onlineSeconds+=step;s=registerTap(s,s.savedAt);if(s.lootDrops.length)act('drop',s.lootDrops[0].id,state=>claimLootDrop(state,state.lootDrops[0].id,rng));}else offlineSeconds+=step;
  s=advance(s,step,online,rng).state;elapsed+=step;
  observe();if(onlineAt(config.play,elapsed)&&elapsed%10===0&&elapsed<config.seconds)decisions();
  if(elapsed%600===0||elapsed===config.seconds)checkpoints.push({second:elapsed,credits:exactEconomyValue(s,'credits').toJSON(),data:exactEconomyValue(s,'data').toJSON(),generatedData:exactEconomyValue(s,'lifetimeDataGenerated').toJSON(),claimableINT:newINTScientific(s).toJSON(),prestiges:s.prestigeCount,hardware:{...s.hardwareCounts},families:[...s.materials.families],crafted:{...s.craftedItemCounts},components:{...s.componentInventory},fragments:s.blueprintFragments});
 }
 const loaded=restore(serialize(s),s.savedAt);if(loaded.error)throw Error(loaded.error);
 const gameplay=(state:GameState)=>({credits:exactEconomyValue(state,'credits').toJSON(),data:exactEconomyValue(state,'data').toJSON(),hardware:state.hardwareCounts,components:state.componentInventory,modules:state.modules,materials:state.materials,crafted:state.craftedItemCounts,learned:state.learnedRecipes,nodes:state.nodes,research:state.researchLevels,completed:state.completedResearch,prestiges:state.prestigeCount});
 if(JSON.stringify(gameplay(s))!==JSON.stringify(gameplay(loaded.state)))throw Error('Profile reload changed gameplay');
 const unmet=['claimableINT1','claimableINT3','prestige','family:semiconductor','family:photonic','family:frontier','family:quantum','crafted:impulse-relay','crafted:quantum-chip','extendedBlueprint'].filter(id=>first[id]===undefined);
 const dataSpent=Object.values(bookedCosts).reduce((sum,cost)=>sum.add(cost.data),ScientificNumber.zero()),generated=exactEconomyValue(s,'lifetimeDataGenerated'),accounted=exactEconomyValue(s,'data').add(resetData).add(dataSpent);
 const relativeDataError=Math.abs(accounted.toNumber()-generated.toNumber())/Math.max(1,generated.toNumber());
 if(relativeDataError>1e-10)throw Error(`Profile Data ledger incomplete: ${relativeDataError}`);
 const balances={allBookedData:generated.toJSON(),dropData:dropData.toJSON(),passivelyProducedData:generated.subtract(dropData).toJSON(),dropCredits:dropCredits.toJSON(),spentData:dataSpent.toJSON(),resetData:resetData.toJSON(),relativeDataError};
 const finalCraft=craftAffordability(s,'quantum-chip'),learning=blueprintQuote(s,'quantum-chip');
 return{config,initial,first,unmet,balances,bookedCosts:Object.fromEntries(Object.entries(bookedCosts).map(([type,cost])=>[type,{credits:cost.credits.toJSON(),data:cost.data.toJSON(),events:cost.events}])),finalChipBlock:{blueprint:learning,reasons:finalCraft.reasons,missingComponents:finalCraft.missingComponents,missingModules:finalCraft.missingModules,missingData:finalCraft.data.missingExact.toJSON()},onlineSeconds,offlineSeconds,taps:s.lifetime.taps,resets,manualActionDebits:Object.fromEntries(Object.entries(spending).map(([family,sum])=>[family,{credits:sum.credits.toJSON(),data:sum.data.toJSON()}])),blocks,actions,checkpoints,final:{...gameplay(s),items:s.inventory.map(i=>({type:i.type,rarity:i.rarity,level:i.level,forge:i.forge??0})),equipped:Object.values(s.equipped).map(id=>s.inventory.find(i=>i.id===id)?.type),trainingCompleted:s.lifetime.trainingCompleted,researchCompleted:s.lifetime.researchCompleted,fragments:s.blueprintFragments,knownBlueprints:s.materials.knownBlueprints,claimableINT:newINTScientific(s).toJSON()},reload:true};
}
/** Persist bounded trace samples; costs and session assertions use the complete trace. */
export function summarizeNaturalProfile({actions,...profile}:ReturnType<typeof runNaturalProfile>){
 const counts:Record<string,number>={};for(const action of actions)counts[action.family]=(counts[action.family]??0)+1;
 const outsideSessions=actions.filter(action=>!onlineAt(profile.config.play,action.at)).length;
 if(outsideSessions)throw Error('Manual actions outside the declared sessions');
 return{...profile,manualActionSummary:{total:actions.length,byFamily:counts,outsideSessions,omittedTraceActions:Math.max(0,actions.length-30)},sampledManualActions:actions.length<=30?actions:[...actions.slice(0,20),...actions.slice(-10)]};
}
