/** Capture the unchanged production consumers before V3 is enabled.
 * Natural schedules use the existing campaign policy, never funded inventory.
 * Incremental output survives an interrupted long campaign. */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import { simulateBalance } from '../src/simulation';
const path=process.argv[2]??'docs/item-system-v3/baseline.json';
const frozen=process.env.ITEM_V3_BASELINE_FROZEN?JSON.parse(readFileSync(process.env.ITEM_V3_BASELINE_FROZEN,'utf8')) as {commit:string;sourceFiles:string[];sourceHash:string}:null;
const sourceFiles=frozen?.sourceFiles??execFileSync('git',['ls-files','src'],{encoding:'utf8'}).trim().split('\n').sort();
const hash=createHash('sha256');for(const file of sourceFiles)hash.update(file+'\0').update(readFileSync(file));
const sourceHash=hash.digest('hex');
if(frozen&&sourceHash!==frozen.sourceHash)throw Error('Frozen baseline fingerprint mismatch; do not simulate changed sources');
const seconds=[900,1800,3600,21600,86400,259200,604800,2592000,7776000];
const report={schema:1,sourceHash,commit:frozen?.commit??execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),startedAt:new Date().toISOString(),policy:'Existing simulateBalance, seed 1708, active/passive sessions, training-first, no purchased content, no resource injection; late build specialization not claimed.',requestedSeconds:seconds,runs:[] as unknown[]};
mkdirSync(path.slice(0,path.lastIndexOf('/')),{recursive:true});
function save(){writeFileSync(path+'.pending',JSON.stringify(report,null,2)+'\n');renameSync(path+'.pending',path);}
save();
for(const active of (process.argv.includes('--passive-only')?[false]:[true,false]))for(const elapsed of seconds){
 const start=Date.now();
 const r=simulateBalance(elapsed/86400,active,1708);
 report.runs.push({seconds:elapsed,profile:active?'active':'passive',elapsedMs:Date.now()-start,invalid:r.invalid,timeout:r.evaluation?.timeout,exact:r.exactFinal,milestones:r.milestones,prestiges:r.prestiges,axiomResets:r.final.axiomResetCount,slots:r.final.progression.permanentSlots,lab:r.final.progression.lab,models:r.final.progression.models,waits:r.evaluation?.waits,timing:r.evaluation?.timing,componentsBySource:r.evaluation?.componentsBySource,diagnostics:r.diagnostics});
 save();console.log(`${active?'active':'passive'} ${elapsed}s: ${Date.now()-start}ms; invalid=${r.invalid}; prestiges=${r.prestiges}`);
}
