import {writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {performance} from 'node:perf_hooks';
import {runNaturalProfile,summarizeNaturalProfile} from './natural-progression-profile';
const output=process.argv[2];if(!output)throw Error('Output required');
const start=performance.now(),profiles=[];
// Both first-reset windows are followed by exactly 300s online and 10500s offline.
const sessions=[[0,600],[3600,3900],[10800,11100],[21600,21900],[32400,32700]] as const;
for(const seed of [1708,2026])for(const firstPrestigeINT of [1,3] as const)for(const nodePolicy of ['factory-first','queue-first'] as const){
 if(performance.now()-start>60000)throw Error('Shared 60-second measurement budget exhausted');
 const profile=summarizeNaturalProfile(runNaturalProfile({play:'short-sessions',priority:'model-first',seed,seconds:32700,sessions,absenceMode:'single-return',maxPrestiges:2,firstPrestigeINT,nodePolicy,build:'chip',claimRewards:true,tapsPerSecond:1,budgetMs:15000}));
 const firstReset=profile.first.prestige,postReset=profile.returns.find(r=>(r as {departed:number}).departed===firstReset+300);
 if(!postReset||(postReset as {elapsed:number}).elapsed!==10500)throw Error('Missing matched first-reset absence');
 const rewards=profile.rewards!,gemIncome=profile.final.gemLedger!.reduce((sum,e)=>sum+e.amount,0);
 if(profile.initial.gems+gemIncome!==rewards.gems)throw Error('Gem ledger mismatch');
 const xp=Object.entries(rewards.missions).reduce((sum,[kind,p])=>{const base={daily:100,weekly:500,monthly:900}[kind as 'daily'|'weekly'|'monthly'];return sum+p.tasks.reduce((n,t,i)=>n+(t.claimed?base*(t.rewardTier??Math.floor(i/14)+1):0),0)+(p.bonusClaimed?base*2:0)},0);
 if(xp!==rewards.seasonXP)throw Error('Season XP mismatch');
 profiles.push({profile,postReset});console.log(JSON.stringify({seed,firstPrestigeINT,nodePolicy,resets:profile.resets,postReset,training:profile.final.trainingCompleted,nodes:profile.final.nodes,claimableINT:profile.final.claimableINT}));
}
const files=['src/economy.ts','src/simulation.ts','src/missions.ts','src/prestige.ts','src/storage.ts','src/inventory.ts','src/blueprints.ts','src/achievements.ts','src/experiments.ts','src/season.ts','src/scientificNumber.ts','scripts/natural-progression-profile.ts','scripts/first-prestige-return-study.ts'];
const metadata={baseCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sourceHashes:Object.fromEntries(files.map(file=>[file,execFileSync('git',['hash-object',file],{encoding:'utf8'}).trim()])),runtimeMilliseconds:performance.now()-start,policy:{profiles:8,seeds:[1708,2026],calendarSeconds:32700,onlineSeconds:1800,postFirstResetOnlineSeconds:300,postFirstResetOfflineSeconds:10500,firstPrestigeTargets:[1,3],secondPrestigeTarget:3,maxPrestiges:2,limits:'Same sessions/input, paid nodes/jobs and first-reset follow-up duration. First reset at different calendar times and earned account state; not an isolated INT multiplier quote. No cap-overflow, free unlocks, passive inputs or week/month timing claim.'},validation:{gems:true,seasonXP:true,reload:true,outsideSessionActions:0,maximumDataRelativeError:Math.max(...profiles.map(p=>p.profile.balances.relativeDataError)),maximumTapRelativeError:Math.max(...profiles.map(p=>p.profile.tapIncome.relativeError))}};
writeFileSync(output,JSON.stringify(metadata,null,2).slice(0,-2)+',\n "profiles": [\n'+profiles.map(p=>'  '+JSON.stringify(p)).join(',\n')+'\n ]\n}\n');console.log(JSON.stringify({profiles:8,runtimeMilliseconds:metadata.runtimeMilliseconds}));
