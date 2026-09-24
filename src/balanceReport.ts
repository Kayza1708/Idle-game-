import type { GameState } from './economy';
import { creditRate,computeRate,dataRate,newINT,researchRate } from './economy';
import { SAVE_VERSION } from './storage';

export const REPORT_VERSION=1;
export const EXPORT_VERSION=2;
export const GAME_VERSION='0.1.0';

function safeValue(value:unknown):unknown{
  if(typeof value==='number')return Number.isFinite(value)?value:null;
  if(Array.isArray(value))return value.map(safeValue);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,safeValue(item)]));
  return value;
}

export function createBalanceReport(state:GameState,exportedAt=Date.now()){
  const telemetry=state.telemetry,campaignDuration=telemetry.campaignStartedAt===null?null:Math.max(0,(exportedAt-telemetry.campaignStartedAt)/1000),runDuration=telemetry.runStartedAt===null?null:Math.max(0,(exportedAt-telemetry.runStartedAt)/1000);
  const allEvents=[...telemetry.permanentEvents,...telemetry.recentEvents],eventCount=(type:string)=>allEvents.filter(event=>event.type===type).length,researchSpent=allEvents.filter(event=>event.type==='research-start').reduce((sum,event)=>sum+Number(event.details.researchPointCost??0),0);
  const report={
    reportVersion:REPORT_VERSION,gameVersion:GAME_VERSION,saveVersion:SAVE_VERSION,exportedAt,
    privacy:{localExport:true,automaticUpload:false,accountOrDeviceDataIncluded:false},
    campaign:{id:telemetry.campaignId,startedAt:telemetry.campaignStartedAt,durationSeconds:campaignDuration,historicalDataAvailable:telemetry.historicalDataAvailable},
    currentRun:{number:state.prestigeCount+1,startedAt:telemetry.runStartedAt,durationSeconds:runDuration,creditsEarned:state.runCreditsEarned},
    currentState:{
      resources:{credits:state.credits,data:state.data,researchPoints:state.researchPoints,components:state.components,researchFragments:state.researchFragments,blueprintFragments:state.blueprintFragments,gems:state.gems,axioms:state.axioms},
      hardware:{total:state.hardware,counts:{...state.hardwareCounts},classUpgrades:[...state.classUpgrades],discovered:[...state.discovered]},
      model:{level:state.level,qualityLevel:state.qualityLevel,efficiencyLevel:state.efficiencyLevel,training:state.training,activeTraining:state.activeTraining},
      research:{completedProjects:[...state.completedResearch],breakthroughs:[...state.breakthroughs],experiments:{active:state.experiments.active,queued:[...state.experiments.queue],completedCount:state.experiments.completedIds.length}},
      items:{inventory:state.inventory.map(item=>({...item})),equipped:{...state.equipped}},
      int:{totalEarned:state.totalINTEarned,unspent:state.unspentINT,spent:state.spentINT,prestigeCount:state.prestigeCount,nodes:[...state.nodes]},
      achievements:{claimed:[...state.achievementClaims],points:state.achievementPoints,lifetime:{...state.lifetime}},gemEconomy:{ledger:state.gemLedger.map(x=>({...x})),earned:state.gemLedger.filter(x=>x.amount>0).reduce((n,x)=>n+x.amount,0),spent:-state.gemLedger.filter(x=>x.amount<0).reduce((n,x)=>n+x.amount,0),firstExtraLabAt:state.gemLedger.find(x=>x.source==='lab-slot-1')?.at??null,timeToFirstExtraLabSeconds:state.gemLedger.find(x=>x.source==='lab-slot-1')&&state.telemetry.campaignStartedAt!==null?(state.gemLedger.find(x=>x.source==='lab-slot-1')!.at-state.telemetry.campaignStartedAt)/1000:null},diagnostics:{researchPoints:{current:state.researchPoints,spentOnProjects:researchSpent,source:'Passiv aus dem Forschungsanteil des gewählten Betriebsprofils; Ausgabe beim Projektstart.'},eventCounts:{hardwarePurchases:eventCount('hardware-purchase'),trainingStarts:eventCount('training-start'),trainingCompletions:eventCount('training-complete'),researchStarts:eventCount('research-start'),researchCompletions:eventCount('research-complete'),achievements:eventCount('achievement'),prestiges:eventCount('prestige')}},missions:{daily:state.missions.daily,weekly:state.missions.weekly,monthly:state.missions.monthly},
    },
    prestigeHistory:telemetry.prestigeHistory,
    events:{permanent:telemetry.permanentEvents,recent:telemetry.recentEvents},
    aggregates:{archived:telemetry.archivedMetrics,windows:telemetry.metrics},
    unavailable:telemetry.historicalDataAvailable?[]:['campaign duration before telemetry','current run start before telemetry','events before telemetry','income sources before telemetry','offline periods before telemetry'],
  };
  return safeValue(report) as typeof report;
}

export function serializeBalanceReport(state:GameState,exportedAt=Date.now()){return JSON.stringify(createBalanceReport(state,exportedAt),null,2);}

const csvCell=(value:unknown)=>`"${String(value??'').replaceAll('"','""')}"`;
const csv=(headers:string[],rows:unknown[][])=>[headers.map(csvCell).join(','),...rows.map(row=>row.map(csvCell).join(','))].join('\r\n');
export function createBalanceExportFiles(state:GameState,exportedAt=Date.now()):Record<string,string>{
  const report=createBalanceReport(state,exportedAt),events=[...state.telemetry.permanentEvents,...state.telemetry.recentEvents].sort((a,b)=>a.at-b.at),resources=(at:number)=>({credits:state.credits,data:state.data,research:state.researchPoints,gems:state.gems,at});
  const timeline=events.map(event=>({utc:new Date(event.at).toISOString(),runId:`${state.telemetry.campaignId}:${event.run}`,sessionId:`local-${state.telemetry.campaignId}`,eventType:event.type,values:event.details,resourcesAfter:resources(event.at)}));
  const eventRows=timeline.map(x=>[x.utc,x.runId,x.sessionId,x.eventType,JSON.stringify(x.values),JSON.stringify(x.resourcesAfter)]);
  const purchases=events.filter(x=>x.type==='hardware-purchase').map(x=>[new Date(x.at).toISOString(),x.details.id,x.details.count,x.details.unitCost??'',x.details.cost??'',x.details.creditsBefore??'',x.details.creditsAfter??'',x.details.computeBefore??'',x.details.computeAfter??'',x.details.rateBefore??'',x.details.rateAfter??'',x.details.nextMilestone??'',x.details.paybackSeconds??'']);
  const milestones=events.filter(x=>x.type==='hardware-milestone').map(x=>[new Date(x.at).toISOString(),x.run,x.details.id,x.details.threshold,x.details.effect??'',x.details.computeBefore??'',x.details.computeAfter??'']);
  const training=events.filter(x=>x.type==='training-start'||x.type==='training-complete').map(x=>[new Date(x.at).toISOString(),x.type,x.details.track,x.details.level??'',x.details.creditCost??'',x.details.dataCost??'',x.details.baseDuration??'',x.details.trainingRate??'',JSON.stringify(x.details)]);
  const research=events.filter(x=>x.type==='research-start'||x.type==='research-complete').map(x=>[new Date(x.at).toISOString(),x.type,x.details.id??'',x.details.labId??'',x.details.duration??'',x.details.creditCost??'',x.details.researchPointCost??'',x.details.materials??'',x.details.breakthrough??'']);
  const prestigeRows=state.telemetry.prestigeHistory.map(x=>[new Date(x.at).toISOString(),x.run,x.durationSeconds,x.before.runCreditsEarned,x.intEarned,JSON.stringify(x.before.hardwareCounts),x.before.level,x.before.completedResearch.length,x.before.breakthroughs.join('|')]);
  const metricRows=state.telemetry.metrics.map(m=>[(m.end-(state.telemetry.runStartedAt??m.start))/1000,m.income.passive/(Math.max(1,m.activeSeconds)),m.offlineRewards.credits,m.offlineRewards.data,m.offlineRewards.research,m.activeSeconds,m.offlineSeconds,m.taps]);
  const diagnostics={saveErrors:0,recoveries:0,longTicks:0,discardedTicks:0,nonFiniteWarnings:0,freezeWatchdogEvents:0,browser:typeof navigator==='undefined'?null:navigator.userAgent,build:GAME_VERSION};
  return{
    'summary.json':JSON.stringify({...report,exportVersion:EXPORT_VERSION,runId:`${state.telemetry.campaignId}:${state.prestigeCount}`,anonymousInstallationId:state.telemetry.campaignId,locale:typeof navigator==='undefined'?'unknown':navigator.language,timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone},null,2),
    'timeline.json':JSON.stringify(timeline,null,2),'timeline.csv':csv(['utc','runId','sessionId','eventType','values','resourcesAfter'],eventRows),
    'snapshots.csv':csv(['relativeRunSeconds','creditsPerSecond','offlineCredits','offlineData','offlineResearch','activeSeconds','offlineSeconds','taps'],metricRows),
    'purchases.csv':csv(['utc','class','quantity','unitPrice','bulkCost','creditsBefore','creditsAfter','computeBefore','computeAfter','creditsPerSecondBefore','creditsPerSecondAfter','nextMilestone','paybackSeconds'],purchases),
    'milestones.csv':csv(['utc','run','class','owned','effect','computeBefore','computeAfter'],milestones),
    'training.csv':csv(['utc','event','track','modelLevel','creditCost','dataCost','baseDuration','trainingRate','bonuses'],training),
    'research.csv':csv(['utc','event','project','labId','duration','creditCost','researchPoints','materials','breakthrough'],research),
    'prestige.csv':csv(['utc','run','runDuration','lifetimeCredits','intClaimed','hardware','modelLevel','researchCount','nodes'],prestigeRows),
    'sessions.csv':csv(['sessionStart','sessionEnd','activeSeconds','offlineSeconds','taps','purchases','trainings','research','prestige'],[[state.telemetry.campaignStartedAt?new Date(state.telemetry.campaignStartedAt).toISOString():'',new Date(exportedAt).toISOString(),state.lifetime.activeSeconds,state.telemetry.metrics.reduce((n,x)=>n+x.offlineSeconds,0),state.lifetime.taps,purchases.length,state.lifetime.trainingCompleted,state.lifetime.researchCompleted,state.prestigeCount]]),
    'diagnostics.json':JSON.stringify({...diagnostics,currentRates:{credits:creditRate(state.hardware,state.level,state,state.savedAt),compute:computeRate(state.hardware,state),data:dataRate(state),research:researchRate(state),prestigeClaim:newINT(state)}},null,2)
  };
}

const crcTable=Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;return c>>>0});
const crc32=(bytes:Uint8Array)=>{let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0};
const le=(n:number,size:number)=>Array.from({length:size},(_,i)=>(n>>>(i*8))&255);
export function createBalanceZip(state:GameState,exportedAt=Date.now()){const encoder=new TextEncoder(),locals:number[]=[],central:number[]=[],files=createBalanceExportFiles(state,exportedAt);let offset=0;for(const[name,content]of Object.entries(files)){const n=encoder.encode(name),data=encoder.encode(content),crc=crc32(data),local=[...le(0x04034b50,4),...le(20,2),0,0,0,0,0,0,...le(crc,4),...le(data.length,4),...le(data.length,4),...le(n.length,2),0,0,...n,...data];locals.push(...local);central.push(...le(0x02014b50,4),20,0,20,0,0,0,0,0,0,0,...le(crc,4),...le(data.length,4),...le(data.length,4),...le(n.length,2),0,0,0,0,0,0,0,0,0,0,0,0,...le(offset,4),...n);offset+=local.length;}const centralOffset=locals.length;return new Uint8Array([...locals,...central,...le(0x06054b50,4),0,0,0,0,...le(Object.keys(files).length,2),...le(Object.keys(files).length,2),...le(central.length,4),...le(centralOffset,4),0,0]);}

export function downloadBalanceReport(state:GameState,exportedAt=Date.now()){
  const blob=new Blob([createBalanceZip(state,exportedAt) as BlobPart],{type:'application/zip'}),url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=`ai-singularity-balance-${new Date(exportedAt).toISOString().replace(/[:.]/g,'-')}.zip`;link.click();URL.revokeObjectURL(url);
}
