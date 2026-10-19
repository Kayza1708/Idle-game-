import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {BALANCE} from '../src/economy';
describe('Unity INT migration reference contract',()=>{
 it('exports all sixty current nodes and reproducible funded references',()=>{
  for(const script of ['export-unity-prestige.ts','export-unity-prestige-cases.ts'])expect(execFileSync(process.execPath,['node_modules/vite-node/vite-node.mjs','scripts/'+script,'--check'],{encoding:'utf8'})).toContain('Unity prestige');
  const f=JSON.parse(readFileSync('IdleIntelligence/Assets/IdleIntelligence/Tests/EditMode/PrestigeReferenceCases.json','utf8'));
  expect(Object.keys(BALANCE.progression.nodes)).toHaveLength(60);
  for(const id of Object.keys(BALANCE.progression.nodes)){expect(f.cases.some((c:any)=>c.name==='buy-'+id)).toBe(true);expect(f.cases.some((c:any)=>c.name==='item-effects-'+id)).toBe(true);}
 },30000);
 it('keeps a separate fresh first-prestige trace without grants',()=>{
  expect(execFileSync(process.execPath,['node_modules/vite-node/vite-node.mjs','scripts/export-unity-natural-prestige.ts','--check'],{encoding:'utf8'})).toContain('Natural first prestige:');
  const f=JSON.parse(readFileSync('IdleIntelligence/Assets/IdleIntelligence/Tests/EditMode/NaturalPrestigeRun.json','utf8'));
  expect(f.initial.credits).toMatchObject({m:5,e:1});expect(f.initial.hardware.every((n:number)=>n===0)).toBe(true);expect(f.actions.every((a:any)=>['advance','tap','buy','train','research','reset'].includes(a.kind))).toBe(true);expect(f.actions.filter((a:any)=>a.kind==='reset')).toHaveLength(1);expect(f.checks.at(-1).state.prestige.resets).toBe(1);
 },30000);
});
