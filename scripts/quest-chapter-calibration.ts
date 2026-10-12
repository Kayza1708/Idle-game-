import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {performance} from 'node:perf_hooks';
import {runNaturalProfile,summarizeNaturalProfile} from './natural-progression-profile';
import {newGame,achievementSynergyScientific} from '../src/economy';
const output=process.argv[2];if(!output)throw Error('Output required');
const prior=JSON.parse(readFileSync('docs/build-quest-progression-profiles.json','utf8')) as {profiles:ReturnType<typeof summarizeNaturalProfile>[];sourceHashes:Record<string,string>};
const scenarios=[{play:'continuous',tapsPerSecond:0},{play:'continuous',tapsPerSecond:1},{play:'continuous',tapsPerSecond:3},{play:'short-sessions',tapsPerSecond:1}] as const;
const start=performance.now(),profiles=[];
for(const seed of [1708,2026])for(const scenario of scenarios){
 if(performance.now()-start>120000)throw Error('Shared 120-second measurement budget exhausted');
 const config={seed,...scenario,build:'chip',priority:'model-first',claimRewards:true,seconds:7200,budgetMs:30000} as const;
 const current=summarizeNaturalProfile(runNaturalProfile(config)),previous=prior.profiles.find(p=>p.config.seed===seed&&p.config.build==='chip'&&p.config.play===scenario.play&&p.config.tapsPerSecond===scenario.tapsPerSecond&&!p.config.sessions);
 if(!previous)throw Error('Missing matched predecessor');
 const quote=(p:typeof current)=>({firstINT:p.first.claimableINT1,prestige:p.first.prestige,chip:p.first['crafted:quantum-chip'],gems:p.rewards!.gems,xp:p.rewards!.seasonXP,points:p.rewards!.points,productionMultiplier:achievementSynergyScientific({...newGame(0),achievementPoints:p.rewards!.points}).toJSON(),quests:Object.fromEntries(Object.entries(p.rewards!.missions).map(([kind,period])=>[kind,{completed:period.tasks.filter(t=>t.progress>=t.goal).length,claimed:period.tasks.filter(t=>t.claimed).length,total:period.tasks.length,bonus:period.bonusClaimed}]))});
 profiles.push({profile:current,comparison:{previous:{...quote(previous),productionMultiplier:null},current:quote(current)}});console.log(JSON.stringify({seed,...scenario,comparison:profiles.at(-1)!.comparison}));
}
const files=['src/economy.ts','src/missions.ts','src/achievements.ts','src/simulation.ts','src/storage.ts','src/season.ts','src/i18n.ts','src/prestige.ts','src/inventory.ts','src/blueprints.ts','src/blueprintResearchReward.ts','src/materialEconomy.ts','src/scientificNumber.ts','src/deviceEffects.ts','src/researchAreas.ts','scripts/natural-progression-profile.ts','scripts/quest-chapter-calibration.ts'];
const curveQuotes=[0,25,100,208,244,260,1000,3000].map(points=>({points,old:1.10**Math.floor(points/25)*1.25**Math.floor(points/100),current:achievementSynergyScientific({...newGame(0),achievementPoints:points}).toNumber(),scope:'Counterfactual quote at fixed points, not an earned natural run; research bonus and all other factors unchanged.'}));
const {profiles:unused,...metadata}={profiles,sourceHashes:Object.fromEntries(files.map(file=>[file,execFileSync('git',['hash-object',file],{encoding:'utf8'}).trim()])),predecessorArtifactHash:execFileSync('git',['hash-object','docs/build-quest-progression-profiles.json'],{encoding:'utf8'}).trim(),baseCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),runtimeMilliseconds:performance.now()-start,curveQuotes,policy:{profiles:8,horizon:7200,build:'Fixed chip; core research cap identical to matched predecessor. Real paid crafting/learning, same reward-claim/input/node/one-prestige policies.',limits:'Simultaneous quest and production-curve change; full-run differences are combined effects, not attribution to one source. Two seeds, one Calendarstart, two-hour window, no week/month timing proof or third-build claim.',precision:'Manual actions exact at ten-second decisions/returns, readiness up to ten seconds.'}};
writeFileSync(output,JSON.stringify(metadata,null,2).slice(0,-2)+',\n "profiles": [\n'+profiles.map(p=>'  '+JSON.stringify(p)).join(',\n')+'\n ]\n}\n');console.log(JSON.stringify({profiles:profiles.length,runtimeMilliseconds:metadata.runtimeMilliseconds}));
