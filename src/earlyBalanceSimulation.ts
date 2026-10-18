import {BALANCE,newGame,exactEconomyValue,registerTap,hardwareIds,hardwareCostScientific,buyHardwareClass,milestoneFactor,creditRateScientific,trainingPreview,startTraining,researchQuote,startResearchProject,newINT,type GameState,type ResearchId,type HardwareId} from './economy';
import {advance} from './simulation';
import {craft,craftAffordability,equip} from './inventory';
import {queueExperiment} from './experiments';
import {prestige,buyNode} from './prestige';

export type EarlyPlayStyle='engaged'|'casual'|'returning';
export type EarlyBalanceOptions={style:EarlyPlayStyle;horizonSeconds?:number;resetAtINT?:number;maxResets?:number;initial?:GameState};
const researchIds:ResearchId[]=['operations','blueprints','alignment','dataGeneration','modelArchitecture','commercialization','computeOptimization','userScaling','materialAnalysis','blueprintAnalysis','hardwareIntegration'];
/** Measurement policy, not in-game automation: actual paid transactions, no ads/IAP/quest bonuses. */
export function simulateEarlyBalance({style,horizonSeconds=10800,resetAtINT=3,maxResets=2,initial}:EarlyBalanceOptions){
 let state=initial??newGame(0,'early-balance-measurement'),firstINT:number|null=null,firstThreeINT:number|null=null,firstItem:number|null=null,lastReset=0;
 const decisionSeconds=style==='engaged'?10:style==='casual'?30:300;
 const purchases:{at:number;id:HardwareId;cost:number;paybackSeconds:number;run:number}[]=[],actions:{at:number;kind:string;run:number}[]=[],resets:{at:number;durationSeconds:number;gain:number;ownedNodes:string[]}[]=[],firstHardware:Partial<Record<HardwareId,number>>={},checkpoints:{at:number;rate:number;int:number;quality:number;efficiency:number;items:number}[]=[];
 const hardwareByRun:Record<number,Partial<Record<HardwareId,number>>>={},productionSteps:{at:number;rate:number;run:number}[]=[];let lastProduction=0;
 const action=(at:number,kind:string)=>{actions.push({at,kind,run:state.prestigeCount})};
 for(let at=5;at<=horizonSeconds;at+=5){
  const start=state.savedAt;state=advance(state,5,style!=='returning'||at%decisionSeconds===0,()=>.5).state;
  for(let sec=1;sec<=5;sec++)if(style==='engaged'||at<=60||(style==='casual'&&(at-5+sec)%30===0))state=registerTap(state,start+sec*1000);
  if(firstINT===null&&newINT(state)>=1)firstINT=at;if(firstThreeINT===null&&newINT(state)>=3)firstThreeINT=at;
  if(at%decisionSeconds!==0)continue;
  if(!state.activeTraining){
   const track=state.qualityLevel<=state.efficiencyLevel?'quality':'efficiency',q=trainingPreview(state,track);
   if(q.allowed&&q.cost.toNumber()<=Math.max(50,state.credits*.5)){state=startTraining(state,track);action(at,'training')}
  }
  const sorted=researchIds.slice().sort((a,b)=>((state.researchLevels[a as keyof typeof state.researchLevels]??0)-(state.researchLevels[b as keyof typeof state.researchLevels]??0))||researchIds.indexOf(a)-researchIds.indexOf(b));
  for(const id of sorted){
   if((state.researchLevels[id as keyof typeof state.researchLevels]??0)>=5)continue;
   const q=researchQuote(state,id);if(q?.allowed){state=startResearchProject(state,id);action(at,'research');break}
  }
  if(!state.experiments.active&&state.inventory.length<3){const next=queueExperiment(state,'hardware',state.savedAt,'short');if(next!==state){state=next;action(at,'analysis')}}
  for(const id of ['impulse-relay','memory-crystal','lab-drone'] as const){
   if(state.inventory.some(i=>i.type===id)||!craftAffordability(state,id).affordable)continue;
   const before=state.inventory.length,next=craft(state,id);if(next!==state){state=next;action(at,'craft');if(firstItem===null&&state.inventory.length>before)firstItem=at}
  }
  for(const item of state.inventory){const next=equip(state,item.id);if(next!==state&&Object.values(next.equipped).filter(Boolean).length>Object.values(state.equipped).filter(Boolean).length){state=next;action(at,'equip')}}
  // Choose an affordable marginal hardware improvement by raw compute per credit.
  // Real purchase APIs determine payment, unlocks, milestones and resulting production.
  for(let n=0;n<10;n++){
   const choices=hardwareIds.map(id=>{const owned=state.hardwareCounts[id],cost=hardwareCostScientific(id,owned,state),gain=BALANCE.hardware[id].compute*((owned+1)*milestoneFactor(id,owned+1)-owned*milestoneFactor(id,owned));return{id,cost,score:cost.toNumber()/gain}}).filter(q=>q.cost.compare(exactEconomyValue(state,'credits'))<=0).sort((a,b)=>a.score-b.score||hardwareIds.indexOf(a.id)-hardwareIds.indexOf(b.id));
   if(!choices.length)break;const {id,cost}=choices[0],rate=creditRateScientific(state.hardware,state.level,state).toNumber(),next=buyHardwareClass(state,id,1);if(next===state)break;
   if(!state.hardwareCounts[id]){if(firstHardware[id]===undefined)firstHardware[id]=at;(hardwareByRun[state.prestigeCount]??={})[id]=at-lastReset;}
   const gain=creditRateScientific(next.hardware,next.level,next).toNumber()-rate;
   state=next;purchases.push({at,id,cost:cost.toNumber(),paybackSeconds:cost.toNumber()/gain,run:state.prestigeCount});action(at,'hardware');
  }
  const permanentRate=creditRateScientific(state.hardware,state.level,state,state.savedAt,false).toNumber();
  if(permanentRate>0&&(lastProduction===0||permanentRate>=lastProduction*1.05)){productionSteps.push({at,rate:permanentRate,run:state.prestigeCount});lastProduction=permanentRate}
  if(newINT(state)>=resetAtINT&&resets.length<maxResets){
   const gain=newINT(state),next=prestige(state);if(next!==state){state=next;for(const id of ['T01','H01'] as const)state=buyNode(state,id);resets.push({at,durationSeconds:at-lastReset,gain,ownedNodes:[...state.progression.known]});lastReset=at;lastProduction=0;action(at,'prestige')}
  }
  if(at%300===0)checkpoints.push({at,rate:creditRateScientific(state.hardware,state.level,state).toNumber(),int:newINT(state),quality:state.qualityLevel,efficiency:state.efficiencyLevel,items:state.inventory.length});
  if(resets.length>=maxResets&&maxResets>0)break;
 }
 const firstRun=actions.filter(a=>a.run===0),gaps=firstRun.map((a,i)=>a.at-(firstRun[i-1]?.at??0));
 return{style,decisionSeconds,firstINT,firstThreeINT,firstItem,firstHardware,hardwareByRun,productionSteps,resets,purchases,actions:actions.length,maxFirstRunActionGap:Math.max(0,...gaps),checkpoints,final:{credits:state.credits,data:state.data,rate:creditRateScientific(state.hardware,state.level,state).toNumber(),prestiges:state.prestigeCount,quality:state.qualityLevel,efficiency:state.efficiencyLevel,hardware:{...state.hardwareCounts},items:state.inventory.length},invalid:![state.credits,state.data,state.runCreditsEarned].every(v=>Number.isFinite(v)&&v>=0)};
}
