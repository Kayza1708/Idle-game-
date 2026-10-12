import {writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {performance} from 'node:perf_hooks';
import {runNaturalProfile,summarizeNaturalProfile} from './natural-progression-profile';
const output=process.argv[2];if(!output)throw Error('Output required');
const start=performance.now(),profiles=[];
const schedules={frequent:[[0,600],[3600,3900],[10800,11100],[21600,21900]],overnight:[[0,600],[3600,3900],[10800,11100],[43200,43500],[53700,54000]]} as const;
for(const seed of [1708,2026])for(const [schedule,sessions] of Object.entries(schedules))for(const nodePolicy of ['factory-first','queue-first'] as const){
 if(performance.now()-start>120000)throw Error('Shared 120-second measurement budget exhausted');
 const profile=summarizeNaturalProfile(runNaturalProfile({play:'short-sessions',priority:'model-first',seed,seconds:sessions.at(-1)![1],sessions,absenceMode:'single-return',maxPrestiges:2,nodePolicy,build:'chip',claimRewards:true,tapsPerSecond:1,budgetMs:30000}));
 profiles.push({schedule,profile});console.log(JSON.stringify({seed,schedule,nodePolicy,first:profile.first,resets:profile.resets,nodes:profile.final.nodes,training:profile.final.trainingCompleted,returns:profile.returns,dataError:profile.balances.relativeDataError}));
}
// Bounded active contrast: actual second resets, no synthetic starting prestige or stocks.
for(const seed of [1708,2026])for(const nodePolicy of ['factory-first','queue-first'] as const){
 if(performance.now()-start>120000)throw Error('Shared 120-second measurement budget exhausted');
 const profile=summarizeNaturalProfile(runNaturalProfile({play:'continuous',priority:'model-first',seed,seconds:7200,maxPrestiges:2,nodePolicy,build:'chip',claimRewards:true,tapsPerSecond:1,budgetMs:30000}));
 profiles.push({schedule:'active-contrast',profile});console.log(JSON.stringify({seed,nodePolicy,schedule:'active-contrast',resets:profile.resets,nodes:profile.final.nodes,training:profile.final.trainingCompleted,dataError:profile.balances.relativeDataError}));
}
const files=['src/economy.ts','src/simulation.ts','src/missions.ts','src/prestige.ts','src/storage.ts','scripts/natural-progression-profile.ts','scripts/passive-return-study.ts'];
writeFileSync(output,JSON.stringify({baseCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sourceHashes:Object.fromEntries(files.map(file=>[file,execFileSync('git',['hash-object',file],{encoding:'utf8'}).trim()])),runtimeMilliseconds:performance.now()-start,policy:{horizonSeconds:54000,maxOnlineSeconds:{returnProfiles:1800,activeContrast:7200},maxPrestiges:2,secondReset:'At least 3 claimable INT, 15-minute run and no active analysis; same controller policy for both node orders.',absence:'One advanceTo call per actual absence, departure cap applied once. Paid boundary receipts captured before bounded telemetry eviction.',scope:'Twelve deterministic profiles: eight return profiles and four two-hour active contrasts, two seeds and two paid node priorities. No grants, passive taps, automatic claims, infinite queue replenishment or month-scale campaign. Return times are sampled session observations, not exact offline unlock times.'},profiles},null,2)+'\n');
console.log(JSON.stringify({profiles:profiles.length,runtimeMilliseconds:performance.now()-start}));
