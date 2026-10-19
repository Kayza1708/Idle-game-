import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {BALANCE} from '../src/economy';
import {UNITY_RESEARCH_IDS} from './unity-research-ids';
describe('Unity research and industry reference contract',()=>{
 it('exports the active V2 catalog and reproducible real TS transactions',()=>{for(const file of ['export-unity-industry.ts','export-unity-industry-cases.ts'])expect(execFileSync(process.execPath,['node_modules/vite-node/vite-node.mjs','scripts/'+file,'--check'],{encoding:'utf8'})).toContain('Unity industry');expect(UNITY_RESEARCH_IDS).toHaveLength(Object.keys(BALANCE.progression.research).length+Object.keys(BALANCE.progression.projects).length);const f=JSON.parse(readFileSync('IdleIntelligence/Assets/IdleIntelligence/Tests/EditMode/IndustryReferenceCases.json','utf8'));expect(f.scope).toContain('financed');for(const id of UNITY_RESEARCH_IDS)expect(f.cases.some((c:any)=>c.name==='research-'+id)).toBe(true);const once=f.cases.find((c:any)=>c.name==='conversion-once').expected;const twice=f.cases.find((c:any)=>c.name==='conversion-duplicate').expected;expect(twice.industry.conversionRevision).toBe(once.industry.conversionRevision);expect(twice.workshop.fragments).toBe(once.workshop.fragments);expect(f.cases.find((c:any)=>c.name==='first-foundry-without-affordability').expected.industry.foundries[0].hasActive).toBe(false);},30000);
});
