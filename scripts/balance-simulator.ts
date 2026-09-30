import {mkdir,writeFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {simulateBalance,type BalanceSimulationResult} from '../src/simulation';

const allowed=new Set([1,7,30,90]);
const arg=(name:string)=>process.argv.find(value=>value.startsWith(`--${name}=`))?.split('=')[1];
const days=(arg('days')??'1,7').split(',').map(Number);
if(days.some(day=>!allowed.has(day)))throw new Error('Supported --days values are 1,7,30,90. Example: --days=1,7');
const seeds=(arg('seeds')??'1708,42,2026').split(',').map(Number);
const output=resolve(arg('output')??'docs/balance-simulation.json'),reportPath=resolve(arg('report')??'docs/balance-simulation.md');
const started=Date.now(),timeoutMs=Number(arg('timeout-ms')??20*60_000),runs:BalanceSimulationResult[]=[];
for(const day of days)for(const active of [true,false])for(const seed of seeds){
 if(Date.now()-started>timeoutMs)throw new Error(`Balance simulation timeout after ${runs.length} runs (${Math.round((Date.now()-started)/1000)}s). Last request: ${day}d ${active?'active':'passive'} seed ${seed}.`);
 runs.push(simulateBalance(day,active,seed));
}
const value=(n:number|null)=>n===null?'nicht erreicht':n;
const summary=(values:(number|null)[])=>{const ordered=values.map(value=>value===null?'nicht erreicht' as const:value).sort((a,b)=>a==='nicht erreicht'?1:b==='nicht erreicht'?-1:a-b);return{min:ordered[0],median:ordered[Math.floor(ordered.length/2)],max:ordered.at(-1),reached:values.filter(value=>value!==null).length,total:values.length};};
const compact=(run:BalanceSimulationResult)=>({days:run.days,profile:run.active?'active':'passive',seed:run.final.telemetry.campaignId,firstPrestigeAvailable:value(run.evaluation?.firstPrestigeAvailable??null),prestiges:run.milestones.prestiges,hardwareClasses:run.milestones.hardware,researchLevels:run.final.researchLevels,training:{quality:run.final.qualityLevel,efficiency:run.final.efficiencyLevel},components:run.final.componentInventory,componentsBySource:run.evaluation?.componentsBySource,firstIntermediate:value(run.evaluation?.firstIntermediate??null),firstItem:value(run.milestones.firstItem),rates:run.exactFinal,waits:run.evaluation?.waits,timing:run.evaluation?.timing,timeout:run.evaluation?.timeout});
const groups=days.flatMap(day=>[true,false].map(active=>{const selected=runs.filter(run=>run.days===day&&run.active===active);return{days:day,profile:active?'active':'passive',firstPrestigeAvailable:summary(selected.map(run=>run.evaluation?.firstPrestigeAvailable??null)),prestiges:summary(selected.map(run=>run.prestiges)),firstItem:summary(selected.map(run=>run.milestones.firstItem)),firstIntermediate:summary(selected.map(run=>run.evaluation?.firstIntermediate??null)),creditsWait:summary(selected.map(run=>run.evaluation?.waits.credits??null)),dataWait:summary(selected.map(run=>run.evaluation?.waits.data??null)),materialsWait:summary(selected.map(run=>run.evaluation?.waits.materials??null)),slotWait:summary(selected.map(run=>run.evaluation?.waits.slots??null))};}));
const payload={version:1,generatedAt:new Date().toISOString(),configuration:{start:'2026-01-01T00:00:00.000Z',days,seeds,profiles:{active:'08:00/13:00/20:00 UTC, 20 min, 1 tap/s, decisions every 10s',passive:'08:00/20:00 UTC, 5 min, no taps, decisions every 10s'}},groups,runs:runs.map((run,index)=>({...compact(run),seed:seeds[index%seeds.length]}))};
const duration=(seconds:unknown)=>typeof seconds==='number'?`${(seconds/3600).toFixed(2)} h`:String(seconds);
const lines=['# Balance-Simulation','',`Gemessen: ${days.join('/')} Tage · Seeds ${seeds.join(', ')} · fester Start 2026-01-01 UTC.`,'','| Profil | Tage | Erste Prestige-Verfügbarkeit min/median/max | Prestiges min/median/max | Credit-Wartezeit | Daten-Wartezeit | Material-Wartezeit | Slot-Wartezeit |','|---|---:|---|---|---|---|---|---|',...groups.map(g=>`| ${g.profile} | ${g.days} | ${[g.firstPrestigeAvailable.min,g.firstPrestigeAvailable.median,g.firstPrestigeAvailable.max].map(duration).join(' / ')} | ${g.prestiges.min} / ${g.prestiges.median} / ${g.prestiges.max} | ${duration(g.creditsWait.median)} | ${duration(g.dataWait.median)} | ${duration(g.materialsWait.median)} | ${duration(g.slotWait.median)} |`),'','Nicht erreichte Einzelziele sind im JSON ausdrücklich als „nicht erreicht“ markiert. 30-/90-Tage-Läufe sind per CLI verfügbar, wurden aber nur ausgeführt, wenn sie in `configuration.days` stehen.'];
await mkdir(dirname(output),{recursive:true});await writeFile(output,JSON.stringify(payload,null,2)+'\n');await writeFile(reportPath,lines.join('\n')+'\n');
console.log(`Wrote ${runs.length} runs to ${output} and ${reportPath} in ${((Date.now()-started)/1000).toFixed(1)}s.`);
