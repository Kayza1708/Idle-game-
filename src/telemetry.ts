import type { GameState, HardwareId } from './economy';

export type TelemetryEventType = 'hardware-purchase'|'hardware-milestone'|'training-start'|'training-complete'|'research-start'|'research-complete'|'experiment-complete'|'breakthrough'|'item-create'|'item-equip'|'item-upgrade'|'item-lock'|'item-salvage'|'achievement'|'mission-claim'|'prestige';
export type TelemetryEvent = { at:number; run:number; type:TelemetryEventType; details:Record<string,string|number|boolean|null> };
export type MetricBucket = { start:number; end:number; taps:number; activeSeconds:number; offlineSeconds:number; income:{tap:number;passive:number;offline:number;other:number}; offlineRewards:{credits:number;data:number;research:number} };
export type ArchivedMetrics = { through:number|null;taps:number;activeSeconds:number;offlineSeconds:number;income:{tap:number;passive:number;offline:number;other:number};offlineRewards:{credits:number;data:number;research:number} };
export type PrestigeSnapshot = { at:number; run:number; durationSeconds:number|null; intEarned:number; before:{credits:number;data:number;researchPoints:number;hardwareCounts:Record<HardwareId,number>;classUpgrades:HardwareId[];level:number;qualityLevel:number;efficiencyLevel:number;runCreditsEarned:number;inventoryCount:number;breakthroughs:string[];completedResearch:string[]}; };
export type LocalTelemetry = { campaignId:string;campaignStartedAt:number|null;runStartedAt:number|null;recentEvents:TelemetryEvent[];permanentEvents:TelemetryEvent[];metrics:MetricBucket[];archivedMetrics:ArchivedMetrics;prestigeHistory:PrestigeSnapshot[];historicalDataAvailable:boolean };

const WINDOW_MS=15*60*1000, MAX_BUCKETS=96*31, MAX_RECENT_EVENTS=500;
const finite=(n:number)=>Number.isFinite(n)?n:0;
export const anonymousCampaignId=()=>globalThis.crypto?.randomUUID?.()??`campaign-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
const emptyArchive=():ArchivedMetrics=>({through:null,taps:0,activeSeconds:0,offlineSeconds:0,income:{tap:0,passive:0,offline:0,other:0},offlineRewards:{credits:0,data:0,research:0}});
export const newTelemetry=(now:number,campaignId='unassigned'):LocalTelemetry=>({campaignId,campaignStartedAt:now,runStartedAt:now,recentEvents:[],permanentEvents:[],metrics:[],archivedMetrics:emptyArchive(),prestigeHistory:[],historicalDataAvailable:true});
export const migratedTelemetry=():LocalTelemetry=>({...newTelemetry(Date.now(),anonymousCampaignId()),campaignStartedAt:null,runStartedAt:null,historicalDataAvailable:false});

export function addEvent(s:GameState,type:TelemetryEventType,at:number,details:TelemetryEvent['details']={},permanent=false):GameState{
  const event={at,run:s.prestigeCount,type,details};
  return permanent?{...s,telemetry:{...s.telemetry,permanentEvents:[...s.telemetry.permanentEvents,event]}}:{...s,telemetry:{...s.telemetry,recentEvents:[...s.telemetry.recentEvents,event].slice(-MAX_RECENT_EVENTS)}};
}

type MetricDelta={taps?:number;activeSeconds?:number;offlineSeconds?:number;tap?:number;passive?:number;offline?:number;other?:number;offlineCredits?:number;offlineData?:number;offlineResearch?:number};
export function addMetrics(s:GameState,at:number,d:MetricDelta):GameState{
  const start=Math.floor(at/WINDOW_MS)*WINDOW_MS,metrics=[...s.telemetry.metrics],last=metrics.at(-1);
  const bucket=last?.start===start?{...last,income:{...last.income},offlineRewards:{...last.offlineRewards}}:{start,end:start+WINDOW_MS,taps:0,activeSeconds:0,offlineSeconds:0,income:{tap:0,passive:0,offline:0,other:0},offlineRewards:{credits:0,data:0,research:0}};
  bucket.taps+=d.taps??0;bucket.activeSeconds+=d.activeSeconds??0;bucket.offlineSeconds+=d.offlineSeconds??0;
  bucket.income.tap+=finite(d.tap??0);bucket.income.passive+=finite(d.passive??0);bucket.income.offline+=finite(d.offline??0);bucket.income.other+=finite(d.other??0);
  bucket.offlineRewards.credits+=finite(d.offlineCredits??0);bucket.offlineRewards.data+=finite(d.offlineData??0);bucket.offlineRewards.research+=finite(d.offlineResearch??0);
  if(last?.start===start)metrics[metrics.length-1]=bucket;else metrics.push(bucket);
  const dropped=metrics.length>MAX_BUCKETS?metrics.slice(0,-MAX_BUCKETS):[],archive={...s.telemetry.archivedMetrics,income:{...s.telemetry.archivedMetrics.income},offlineRewards:{...s.telemetry.archivedMetrics.offlineRewards}};
  for(const old of dropped){archive.through=old.end;archive.taps+=old.taps;archive.activeSeconds+=old.activeSeconds;archive.offlineSeconds+=old.offlineSeconds;archive.income.tap+=old.income.tap;archive.income.passive+=old.income.passive;archive.income.offline+=old.income.offline;archive.income.other+=old.income.other;archive.offlineRewards.credits+=old.offlineRewards.credits;archive.offlineRewards.data+=old.offlineRewards.data;archive.offlineRewards.research+=old.offlineRewards.research;}
  return {...s,telemetry:{...s.telemetry,metrics:metrics.slice(-MAX_BUCKETS),archivedMetrics:archive}};
}

export function recordPrestige(before:GameState,after:GameState,gain:number):GameState{
  const at=before.savedAt,duration=before.telemetry.runStartedAt===null?null:Math.max(0,(at-before.telemetry.runStartedAt)/1000);
  const snapshot:PrestigeSnapshot={at,run:before.prestigeCount,durationSeconds:duration,intEarned:gain,before:{credits:before.credits,data:before.data,researchPoints:before.researchPoints,hardwareCounts:{...before.hardwareCounts},classUpgrades:[...before.classUpgrades],level:before.level,qualityLevel:before.qualityLevel,efficiencyLevel:before.efficiencyLevel,runCreditsEarned:before.runCreditsEarned,inventoryCount:before.inventory.length,breakthroughs:[...before.breakthroughs],completedResearch:[...before.completedResearch]}};
  const event:TelemetryEvent={at,run:before.prestigeCount,type:'prestige',details:{intEarned:gain,durationSeconds:duration}};
  return {...after,telemetry:{...before.telemetry,runStartedAt:at,prestigeHistory:[...before.telemetry.prestigeHistory,snapshot],permanentEvents:[...before.telemetry.permanentEvents,event]}};
}
