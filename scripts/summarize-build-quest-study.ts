import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {questSeasonXP} from '../src/season';
import type {summarizeNaturalProfile} from './natural-progression-profile';
const input=process.argv[2],output=process.argv[3];if(!input||!output)throw Error('Input and output paths required');
const raw=JSON.parse(readFileSync(input,'utf8')) as {profiles:ReturnType<typeof summarizeNaturalProfile>[];sourceHashes:Record<string,string>;runtimeMilliseconds:number;policy:{limits:string}};
for(const [file,hash] of Object.entries(raw.sourceHashes))if(execFileSync('git',['hash-object',file],{encoding:'utf8'}).trim()!==hash)throw Error(`Source changed: ${file}`);
const profiles=raw.profiles.map(p=>{
 const c=p.config,rw=p.rewards;if(!rw)throw Error('Missing reward observation');
 if(p.manualActionSummary.outsideSessions!==0||p.onlineSeconds!==(c.play==='short-sessions'?900:7200))throw Error('Session mismatch');
 let chipSeen=false;for(const e of p.equippedTimeline){if(c.build==='relay'&&e.type!=='impulse-relay')throw Error('Relay replaced');if(e.type==='quantum-chip')chipSeen=true;if(c.build!=='relay'&&chipSeen&&e.type!=='quantum-chip')throw Error('Chip replaced');}
 const quests=Object.fromEntries(Object.entries(rw.missions).map(([kind,v])=>[kind,{completed:v.tasks.filter(t=>t.progress>=t.goal).length,claimed:v.tasks.filter(t=>t.claimed).length,total:v.tasks.length,bonus:v.bonusClaimed,readyAt:rw.bonusReadyAt[kind],claimedByMetric:Object.fromEntries([...new Set(v.tasks.map(t=>t.metric))].map(metric=>[metric,v.tasks.filter(t=>t.metric===metric&&t.claimed).length]))}]));
 const xp=Object.entries(rw.missions).reduce((sum,[kind,v])=>sum+v.tasks.filter(t=>t.claimed).reduce((n,t)=>n+questSeasonXP(kind as 'daily'|'weekly'|'monthly',t.rewardTier??1),0)+(v.bonusClaimed?questSeasonXP(kind as 'daily'|'weekly'|'monthly',2):0),0);
 if(xp!==rw.seasonXP)throw Error(`Unaccounted Season XP ${xp}/${rw.seasonXP}`);
 const earned=Object.values(rw.gemIncomeBySource).reduce((n,v)=>n+v,0);if(p.initial.gems+earned!==rw.gems)throw Error('Gem ledger mismatch');
 return{seed:c.seed,play:c.play,taps:c.tapsPerSecond,sessions:c.sessions,build:c.build,firstINT:p.first.claimableINT1,prestige:p.first.prestige,chip:p.first['crafted:quantum-chip'],server:p.first['hardware:server'],farm:p.first['hardware:farm'],gems:rw.gems,gemSources:rw.gemIncomeBySource,achievementPoints:rw.points,xp:rw.seasonXP,quests,bursts:p.tapIncome.relayBurstCount,burstCredits:p.tapIncome.relayBursts,tapCredits:p.tapIncome.total,finalINT:p.final.claimableINT,researchCompletions:p.final.researchCompleted,researchLevels:p.final.research,equippedTimeline:p.equippedTimeline,online:p.onlineSeconds,dataError:p.balances.relativeDataError,tapError:p.tapIncome.relativeError};
});
writeFileSync(output,JSON.stringify({rawArtifact:input,runtimeMilliseconds:raw.runtimeMilliseconds,profiles,sourceHashVerification:true,outsideSessionActions:0,seasonXPReconciled:true,gemLedgerReconciled:true,maximumDataError:Math.max(...profiles.map(p=>p.dataError)),maximumTapError:Math.max(...profiles.map(p=>p.tapError)),limits:raw.policy.limits},null,2)+'\n');console.log(JSON.stringify({profiles:profiles.length,verified:true}));
