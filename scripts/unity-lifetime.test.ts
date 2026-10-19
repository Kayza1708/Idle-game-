import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
describe('Unity lifetime reference contracts',()=>{
 it('regenerates original producer cases without changing source balance',()=>{for(const name of ['export-unity-lifetime.ts','export-unity-lifetime-cases.ts'])expect(execFileSync(process.execPath,['node_modules/vite-node/vite-node.mjs','scripts/'+name,'--check'],{encoding:'utf8'})).toContain('Unity lifetime');},30000);
 it('keeps taps separate from production, offline from active time, and challenge history isolated',()=>{
 const f=JSON.parse(readFileSync('IdleIntelligence/Assets/IdleIntelligence/Tests/EditMode/LifetimeReferenceCases.json','utf8'));
 expect(f.cases.length).toBeGreaterThan(90);for(const c of f.cases.filter((c:any)=>c.name.startsWith('synthesis-finish-')))expect(c.expected.componentsEarned-c.before.lifetime.componentsEarned).toBe(1);expect(f.cases.find((c:any)=>c.name==='forge-finish').expected.forgeUpgrades).toBe(1);expect(f.cases.find((c:any)=>c.name==='analysis-finish').expected.analysesCompleted).toBe(1);
 const find=(name:string)=>f.cases.find((c:any)=>c.name===name);
 const tap=find('tap-excludes-regular-income');expect(tap.expected.taps).toBe(tap.before.lifetime.taps+1);expect(tap.expected.regularCredits).toBe(tap.before.lifetime.regularCredits);
 const offline=find('offline-does-not-count-active');expect(offline.expected.activeSeconds).toBe(offline.before.lifetime.activeSeconds);
 const active=find('active-work');expect(active.expected.activeSeconds-active.before.lifetime.activeSeconds).toBeCloseTo(3,8);
 const run=find('challenge-offline-main-paused');expect(run.main).toEqual(run.before.challengeMain.lifetime);
 expect(find('additional-hardware-mastery').expected.hardwareMasteryXp[0]).toBe(find('additional-hardware-mastery').before.lifetime.hardwareMasteryXp[0]+250);
 });
});
