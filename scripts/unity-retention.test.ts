import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {achievements} from '../src/achievements';
import {challenges} from '../src/retention';
import {onboardingSteps} from '../src/onboarding';
describe('Unity permanent rewards and profile contracts',()=>{
 it('reproduces current catalogues, transactions and JavaScript Unicode data',()=>{for(const name of ['export-unity-retention.ts','export-unity-unicode.ts','export-unity-retention-cases.ts'])expect(execFileSync(process.execPath,['node_modules/vite-node/vite-node.mjs','scripts/'+name,'--check'],{encoding:'utf8'})).toContain('Unity');},60000);
 it('exercises actual eligible claims and duplicate guards instead of unready no-ops',()=>{const f=JSON.parse(readFileSync('IdleIntelligence/Assets/IdleIntelligence/Tests/EditMode/RetentionReferenceCases.json','utf8'));const find=(name:string)=>f.cases.find((c:any)=>c.name===name);for(const a of achievements){const c=find('achievement-funded-'+a.id+'-0');expect(c.expected.achievementClaims).toContain(a.id+':0');expect(c.expected.points).toBeGreaterThan(c.before.retention.points);const duplicate=find('achievement-duplicate-'+a.id+'-0');expect(duplicate.expected).toEqual(duplicate.before.retention);}for(const c of challenges)expect(find('static-funded-'+c.id).expected.challengeClaims).toContain(c.id);for(const step of onboardingSteps)expect(find('intro-ready-'+step.id).expected.onboardingClaimed).toContain(step.id);expect(find('choose-ai-again').expected.aiName).toBe('AURA');expect(find('challenge-restores-wallet').expected).toEqual(find('challenge-with-wallet').before.retention);expect(f.policy.length).toBeGreaterThan(300);});
});
