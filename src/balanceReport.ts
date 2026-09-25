import type { GameState } from './economy';
import { BALANCE, creditRate,computeRate,dataRate,itemTypes,newINT,researchRate,exactEconomyJSON } from './economy';
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
      resources:{credits:state.credits,data:state.data,researchPoints:state.researchPoints,components:{total:state.components,inventory:{...state.componentInventory}},researchFragments:state.researchFragments,blueprintFragments:state.blueprintFragments,gems:state.gems,axioms:state.axioms},
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
  const report=createBalanceReport(state,exportedAt),events=[...state.telemetry.permanentEvents,...state.telemetry.recentEvents].sort((a,b)=>a.at-b.at);
  const timeline=events.map(event=>({utc:new Date(event.at).toISOString(),runId:`${state.telemetry.campaignId}:${event.run}`,sessionId:`local-${state.telemetry.campaignId}`,eventType:event.type,values:event.details,resourcesAfter:event.resources}));
  const eventRows=timeline.map(x=>[x.utc,x.runId,x.sessionId,x.eventType,JSON.stringify(x.values),JSON.stringify(x.resourcesAfter)]);
  const purchases=events.filter(x=>x.type==='hardware-purchase').map(x=>[new Date(x.at).toISOString(),x.details.id,x.details.amount,x.details.unitCost??'',x.details.cost??'',x.details.creditsBefore??'',x.details.creditsAfter??'',x.details.computeBefore??'',x.details.computeAfter??'',x.details.rateBefore??'',x.details.rateAfter??'',x.details.nextMilestone??'',x.details.paybackSeconds??'']);
  const milestones=events.filter(x=>x.type==='hardware-milestone').map(x=>[new Date(x.at).toISOString(),x.run,x.details.id,x.details.threshold,x.details.effect??'',x.details.computeBefore??'',x.details.computeAfter??'']);
  const training=events.filter(x=>x.type==='training-start'||x.type==='training-complete').map(x=>[new Date(x.at).toISOString(),x.type,x.details.track,x.details.level??'',x.details.creditCost??'',x.details.dataCost??'',x.details.baseDuration??'',x.details.effectiveRate??'',x.details.expectedDuration??'',x.details.actualDuration??'',x.details.onlineWork??'',x.details.offlineWork??'']);
  const research=events.filter(x=>x.type==='research-start'||x.type==='research-complete').map(x=>[new Date(x.at).toISOString(),x.type,x.details.id??'',x.details.labId??'',x.details.durationSeconds??'',x.details.startedAt??'',x.details.endsAt??'',x.details.actualDurationSeconds??'',x.details.creditCost??'',x.details.dataCost??'',x.details.researchPointCost??'',x.details.materials??'',x.details.breakthrough??'']);
  const analyses=events.filter(x=>x.type==='experiment-start'||x.type==='experiment-complete'||x.type==='experiment-cancel').map(x=>[new Date(x.at).toISOString(),x.type,x.details.type??'',x.details.length??'',x.details.creditCost??'',x.details.dataCost??'',x.details.durationSeconds??'',x.details.total??'',x.details.components??'',x.details.mode??'']);
  const components=events.filter(x=>x.type==='component-found').map(x=>[new Date(x.at).toISOString(),x.details.source??'',x.details.mode??'',x.details.total??'',x.details.components??'',x.details.component??'',x.details.circuits??'',x.details.laser??'',x.details.titaniumBolts??'']);
  const crafting=events.filter(x=>x.type==='module-craft'||x.type==='item-craft'||x.type==='item-upgrade'||x.type==='item-equip').map(x=>[new Date(x.at).toISOString(),x.type,x.details.id??x.details.itemId??'',x.details.blueprint??x.details.type??'',x.details.rarity??'',x.details.dataCost??'',x.details.ingredients??'',x.details.component??'',x.details.componentCost??'',x.details.itemEffect??'']);
  const nodePurchases=events.filter(x=>x.type==='prestige-node-buy').map(x=>[new Date(x.at).toISOString(),x.details.id??'',x.details.cost??'',x.details.branch??'',x.details.depth??'',x.details.effect??'']);
  const prestigeRows=state.telemetry.prestigeHistory.map(x=>[new Date(x.at).toISOString(),x.run,x.durationSeconds,x.before.runCreditsEarned,x.intEarned,JSON.stringify(x.before.hardwareCounts),x.before.level,x.before.completedResearch.length,x.before.breakthroughs.join('|')]);
  const snapshotRows=state.telemetry.snapshots.map(x=>[x.runSeconds,x.credits,x.creditsPerSecond,x.compute,x.computePerSecond,x.users,x.data,x.dataPerSecond,x.research,x.researchPerSecond,x.gems,...Object.values(x.hardwareCounts),x.modelLevel,x.qualityLevel,x.efficiencyLevel,x.activeTraining,x.activeResearch,x.prestigeClaim,x.activeLabs]);
  const activeSeconds=state.telemetry.archivedMetrics.activeSeconds+state.telemetry.metrics.reduce((n,x)=>n+x.activeSeconds,0),offlineSeconds=state.telemetry.archivedMetrics.offlineSeconds+state.telemetry.metrics.reduce((n,x)=>n+x.offlineSeconds,0),componentSources=events.filter(x=>x.type==='component-found').reduce<Record<string,number>>((out,event)=>{const source=String(event.details.source);out[source]=(out[source]??0)+Number(event.details.total??0);return out},{});
  const diagnostics={...state.telemetry.diagnostics,build:GAME_VERSION};
  const manifest={format:'ai-singularity-local-balance',exportVersion:EXPORT_VERSION,gameVersion:GAME_VERSION,economyVersion:SAVE_VERSION,saveVersion:SAVE_VERSION,createdAt:new Date(exportedAt).toISOString(),runDurationSeconds:report.currentRun.durationSeconds,configuration:{simulationStep:BALANCE.simulationStep,offlineCap:BALANCE.maxOfflineSeconds},privacy:'local-only; no full save, player name, account, device fingerprint or automatic upload',limits:{recentEvents:500,snapshots:300}};
  const economy={formulas:{repeatableResearchDuration:'min(baseSeconds * 1.22^(level - 1), 259200)',repeatableResearchDataCost:'ceil(baseDataCost * 1.28^(level - 1))',fixedAtStart:true},hardware:BALANCE.hardware,operatingProfiles:BALANCE.operatingProfiles,researchProjects:BALANCE.researchProjects,repeatableResearch:BALANCE.repeatableResearch,components:BALANCE.components,componentSources:BALANCE.componentSources,analysisCosts:BALANCE.analysisCosts,itemRecipes:BALANCE.itemRecipes,itemTypes};
  return{
    'manifest.json':JSON.stringify(manifest,null,2),'economy.json':JSON.stringify(economy,null,2),
    'summary.json':JSON.stringify({...report,exportVersion:EXPORT_VERSION,runId:`${state.telemetry.campaignId}:${state.prestigeCount}`,time:{activeSeconds,offlineSeconds},progress:{trainingCompletions:state.lifetime.trainingCompleted,researchCompletions:state.lifetime.researchCompleted,prestiges:state.prestigeCount},production:{creditsPerSecond:creditRate(state.hardware,state.level,state,state.savedAt),dataPerSecond:dataRate(state),researchPerSecond:researchRate(state)},dataSaving:{currentData:state.data,exactEconomy:exactEconomyJSON(state),nextResearchCosts:Object.fromEntries(Object.entries(BALANCE.researchProjects).map(([id,p])=>[id,p.data]))},componentSources,researchLevels:{...state.researchLevels},bottlenecks:events.filter(event=>event.type==='action-blocked').map(event=>event.details)},null,2),
    'events.csv':csv(['utc','runId','sessionId','eventType','values','resourcesAfter'],eventRows),'events.jsonl':timeline.map(event=>JSON.stringify(event)).join('\n'),
    'timeline.json':JSON.stringify(timeline,null,2),'timeline.csv':csv(['utc','runId','sessionId','eventType','values','resourcesAfter'],eventRows),
    'snapshots.csv':csv(['relativeRunSeconds','credits','creditsPerSecond','compute','computePerSecond','users','data','dataPerSecond','research','researchPerSecond','gems',...Object.keys(state.hardwareCounts),'modelLevel','quality','efficiency','activeTraining','activeResearch','prestigeClaim','activeLabs'],snapshotRows),
    'purchases.csv':csv(['utc','class','quantity','unitPrice','bulkCost','creditsBefore','creditsAfter','computeBefore','computeAfter','creditsPerSecondBefore','creditsPerSecondAfter','nextMilestone','paybackSeconds'],purchases),
    'milestones.csv':csv(['utc','run','class','owned','effect','computeBefore','computeAfter'],milestones),
    'training.csv':csv(['utc','event','track','modelLevel','creditCost','dataCost','baseDuration','effectiveRate','expectedDuration','actualDuration','onlineWork','offlineWork'],training),
    'research.csv':csv(['utc','event','project','labId','durationSeconds','startedAt','endsAt','actualDurationSeconds','creditCost','dataCost','researchPoints','materials','breakthrough'],research),
    'analyses.csv':csv(['utc','event','type','length','creditCost','dataCost','durationSeconds','foundTotal','components','mode'],analyses),
    'components.csv':csv(['utc','source','mode','total','components','component','circuits','laser','titaniumBolts'],components),
    'crafting.csv':csv(['utc','event','id','type','rarity','dataCost','ingredients','upgradeComponent','upgradeComponentCost','itemEffect'],crafting),
    'prestige-nodes.csv':csv(['utc','node','cost','branch','depth','effect'],nodePurchases),
    'prestige.csv':csv(['utc','run','runDuration','lifetimeCredits','intClaimed','hardware','modelLevel','researchCount','nodes'],prestigeRows),
    'sessions.csv':csv(['sessionStart','sessionEnd','activeSeconds','offlineSeconds','taps','purchases','trainings','research','prestige'],[[state.telemetry.campaignStartedAt?new Date(state.telemetry.campaignStartedAt).toISOString():'',new Date(exportedAt).toISOString(),state.lifetime.activeSeconds,state.telemetry.metrics.reduce((n,x)=>n+x.offlineSeconds,0),state.lifetime.taps,purchases.length,state.lifetime.trainingCompleted,state.lifetime.researchCompleted,state.prestigeCount]]),
    'diagnostics.json':JSON.stringify({...diagnostics,exactEconomy:exactEconomyJSON(state),currentRates:{credits:creditRate(state.hardware,state.level,state,state.savedAt),compute:computeRate(state.hardware,state),data:dataRate(state),research:researchRate(state),prestigeClaim:newINT(state)}},null,2)
  };
}

const crcTable=Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;return c>>>0});
const crc32=(bytes:Uint8Array)=>{let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0};
const concat=(chunks:Uint8Array[])=>{const out=new Uint8Array(chunks.reduce((n,x)=>n+x.length,0));let offset=0;for(const chunk of chunks){out.set(chunk,offset);offset+=chunk.length;}return out;};
const header=(size:number,write:(view:DataView)=>void)=>{const bytes=new Uint8Array(size);write(new DataView(bytes.buffer));return bytes;};
export function createBalanceZip(state:GameState,exportedAt=Date.now()){const encoder=new TextEncoder(),locals:Uint8Array[]=[],central:Uint8Array[]=[],files=Object.entries(createBalanceExportFiles(state,exportedAt));let offset=0;for(const[name,content]of files){const fileName=encoder.encode(name),data=encoder.encode(content),crc=crc32(data),localHeader=header(30,v=>{v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x0800,true);v.setUint16(8,0,true);v.setUint32(14,crc,true);v.setUint32(18,data.length,true);v.setUint32(22,data.length,true);v.setUint16(26,fileName.length,true);}),centralHeader=header(46,v=>{v.setUint32(0,0x02014b50,true);v.setUint16(4,20,true);v.setUint16(6,20,true);v.setUint16(8,0x0800,true);v.setUint16(10,0,true);v.setUint32(16,crc,true);v.setUint32(20,data.length,true);v.setUint32(24,data.length,true);v.setUint16(28,fileName.length,true);v.setUint32(42,offset,true);});locals.push(localHeader,fileName,data);central.push(centralHeader,fileName);offset+=localHeader.length+fileName.length+data.length;}const centralData=concat(central),end=header(22,v=>{v.setUint32(0,0x06054b50,true);v.setUint16(8,files.length,true);v.setUint16(10,files.length,true);v.setUint32(12,centralData.length,true);v.setUint32(16,offset,true);});return concat([...locals,centralData,end]);}

export async function createBalanceZipAsync(state:GameState,exportedAt=Date.now(),signal?:AbortSignal,onProgress:(done:number,total:number)=>void=()=>{}){const snapshot=structuredClone(state),files=Object.entries(createBalanceExportFiles(snapshot,exportedAt)),encoder=new TextEncoder(),locals:Uint8Array[]=[],central:Uint8Array[]=[];let offset=0,done=0;for(const[name,content]of files){if(signal?.aborted)throw new DOMException('Export abgebrochen.','AbortError');await new Promise<void>(resolve=>setTimeout(resolve,0));const fileName=encoder.encode(name),data=encoder.encode(content),crc=crc32(data),localHeader=header(30,v=>{v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x0800,true);v.setUint16(8,0,true);v.setUint32(14,crc,true);v.setUint32(18,data.length,true);v.setUint32(22,data.length,true);v.setUint16(26,fileName.length,true);}),centralHeader=header(46,v=>{v.setUint32(0,0x02014b50,true);v.setUint16(4,20,true);v.setUint16(6,20,true);v.setUint16(8,0x0800,true);v.setUint16(10,0,true);v.setUint32(16,crc,true);v.setUint32(20,data.length,true);v.setUint32(24,data.length,true);v.setUint16(28,fileName.length,true);v.setUint32(42,offset,true);});locals.push(localHeader,fileName,data);central.push(centralHeader,fileName);offset+=localHeader.length+fileName.length+data.length;onProgress(++done,files.length);}if(signal?.aborted)throw new DOMException('Export abgebrochen.','AbortError');const centralData=concat(central),end=header(22,v=>{v.setUint32(0,0x06054b50,true);v.setUint16(8,files.length,true);v.setUint16(10,files.length,true);v.setUint32(12,centralData.length,true);v.setUint32(16,offset,true);});return concat([...locals,centralData,end]);}

export function downloadBalanceReport(state:GameState,exportedAt=Date.now()){
  const blob=new Blob([createBalanceZip(state,exportedAt) as BlobPart],{type:'application/zip'}),url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=`ai-singularity-balance-${new Date(exportedAt).toISOString().replace(/[:.]/g,'-')}.zip`;link.click();URL.revokeObjectURL(url);
}
export async function downloadBalanceReportAsync(state:GameState,signal?:AbortSignal,onProgress?:(done:number,total:number)=>void,exportedAt=Date.now()){const bytes=await createBalanceZipAsync(state,exportedAt,signal,onProgress),blob=new Blob([bytes as BlobPart],{type:'application/zip'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`ai-singularity-balance-${new Date(exportedAt).toISOString().replace(/[:.]/g,'-')}.zip`;link.click();URL.revokeObjectURL(url);}
