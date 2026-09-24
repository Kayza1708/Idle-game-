import type { GameState } from './economy';
import { SAVE_VERSION } from './storage';

export const REPORT_VERSION=1;
export const GAME_VERSION='0.1.0';

function safeValue(value:unknown):unknown{
  if(typeof value==='number')return Number.isFinite(value)?value:null;
  if(Array.isArray(value))return value.map(safeValue);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,safeValue(item)]));
  return value;
}

export function createBalanceReport(state:GameState,exportedAt=Date.now()){
  const telemetry=state.telemetry,campaignDuration=telemetry.campaignStartedAt===null?null:Math.max(0,(exportedAt-telemetry.campaignStartedAt)/1000),runDuration=telemetry.runStartedAt===null?null:Math.max(0,(exportedAt-telemetry.runStartedAt)/1000);
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
      achievements:{claimed:[...state.achievementClaims],points:state.achievementPoints},missions:{daily:state.missions.daily,weekly:state.missions.weekly},
    },
    prestigeHistory:telemetry.prestigeHistory,
    events:{permanent:telemetry.permanentEvents,recent:telemetry.recentEvents},
    aggregates:{archived:telemetry.archivedMetrics,windows:telemetry.metrics},
    unavailable:telemetry.historicalDataAvailable?[]:['campaign duration before telemetry','current run start before telemetry','events before telemetry','income sources before telemetry','offline periods before telemetry'],
  };
  return safeValue(report) as typeof report;
}

export function serializeBalanceReport(state:GameState,exportedAt=Date.now()){return JSON.stringify(createBalanceReport(state,exportedAt),null,2);}

export function downloadBalanceReport(state:GameState,exportedAt=Date.now()){
  const blob=new Blob([serializeBalanceReport(state,exportedAt)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=`ai-singularity-balance-${new Date(exportedAt).toISOString().replace(/[:.]/g,'-')}.json`;link.click();URL.revokeObjectURL(url);
}
