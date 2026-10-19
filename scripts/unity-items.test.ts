import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {itemTypes,BALANCE} from '../src/economy';
describe('Unity item reference contract',()=>{
 it('regenerates item data and transaction results from current TypeScript',()=>{
  expect(execFileSync(process.execPath,['node_modules/vite-node/vite-node.mjs','scripts/export-unity-items.ts','--check'],{encoding:'utf8'})).toContain('Unity items:');
 },30000);
 it('covers the full item/rarity catalog, paid milestones and protected fusion',()=>{
  const f=JSON.parse(readFileSync('IdleIntelligence/Assets/IdleIntelligence/Tests/EditMode/ItemReferenceCases.json','utf8'));
  const names=f.cases.map((c:any)=>c.name);
  expect(f.itemIds).toEqual(Object.keys(itemTypes));
  for(const id of Object.keys(itemTypes))for(const rarity of Object.keys(BALANCE.rarity))expect(names).toContain(`effect-${id}-${rarity}`);
  for(const name of ['fusion-retains-strongest','fusion-rejects-duplicate-id','fusion-rejects-equipped','fusion-rejects-locked','slot-unlocks','gift-is-once'])expect(names).toContain(name);
  const fusion=f.cases.find((c:any)=>c.name==='fusion-retains-strongest');
  expect(fusion.expected.inventory.find((i:any)=>i.level===12)).toMatchObject({forge:4,rarity:1});
 });
});
