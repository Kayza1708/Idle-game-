import {writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {performance} from 'node:perf_hooks';
import {runNaturalProfile,summarizeNaturalProfile} from './natural-progression-profile';
const output=process.argv[2];if(!output)throw Error('Output required');
const start=performance.now(),profiles=[];
const loadouts={active:['impulse-relay','memory-crystal'],production:['quantum-chip','tensor-core'],learning:['photonic-array','logic-seed','lab-drone']} as const;
for(const tapsPerSecond of [0,3] as const)for(const [name,loadout] of Object.entries(loadouts)){
 if(performance.now()-start>90000)throw Error('Shared 90-second measurement budget exhausted');
 const p=summarizeNaturalProfile(runNaturalProfile({play:'continuous',priority:'model-first',seed:1708,seconds:7200,claimRewards:true,build:'chip',loadout,equalResearch:true,maxPrestiges:2,tapsPerSecond,budgetMs:20000}));
 profiles.push({name,profile:p});console.log(JSON.stringify({name,tapsPerSecond,first:p.first,equipped:p.final.equipped,research:p.final.research,nodes:p.final.nodes,training:p.final.trainingCompleted,resets:p.resets}));
}
const files=['src/economy.ts','src/inventory.ts','src/deviceEffects.ts','src/EquipmentDialog.tsx','src/simulation.ts','src/researchAreas.ts','scripts/natural-progression-profile.ts','scripts/three-build-integration-study.ts'];
const meta={baseCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sourceHashes:Object.fromEntries(files.map(f=>[f,execFileSync('git',['hash-object',f],{encoding:'utf8'}).trim()])),runtimeMilliseconds:performance.now()-start,policy:{seeds:[1708],horizon:7200,taps:[0,3],loadouts,research:'Identical visible/affordable portfolio, repeatables up to level 3, common node order. Paid craft priority differs only by target loadout. No item grants or acquired third-slot claim.',limits:'Early feasibility check, not mature three-slot comparison or long-term dominant-build proof. Equal research freedom, not identical realized research history; finite resources and job timing differ.'}};
writeFileSync(output,JSON.stringify(meta,null,2).slice(0,-2)+',\n "profiles": [\n'+profiles.map(p=>'  '+JSON.stringify(p)).join(',\n')+'\n ]\n}\n');console.log(JSON.stringify({profiles:6,runtimeMilliseconds:meta.runtimeMilliseconds}));
