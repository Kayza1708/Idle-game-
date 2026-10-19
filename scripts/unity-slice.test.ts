import {execFileSync} from 'node:child_process';
import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {BALANCE, newGame, buyHardwareClass, registerTap, exactEconomyValue} from '../src/economy';
import {ScientificNumber} from '../src/scientificNumber';
const number=(v:any)=>ScientificNumber.fromJSON({m:v.m,e:v.e,...(v.terms?{terms:v.terms.map((p:any)=>[p.index,p.value])}:{})});
describe('Unity golden export contract',()=>{
 it('regenerates all balance data and golden results from the live TS implementation',()=>{
  expect(execFileSync(process.execPath,['node_modules/vite-node/vite-node.mjs','scripts/export-unity-slice.ts','--check'],{encoding:'utf8'})).toContain('Unity slice:');
 },30000);
 it('keeps the payable start and deterministic tap transaction in the shared cases',()=>{
  const fixture=JSON.parse(readFileSync('IdleIntelligence/Assets/IdleIntelligence/Tests/EditMode/ReferenceCases.json','utf8'));
  const first=fixture.cases.find((x:any)=>x.name==='first-calculator');
  expect(first.expected.hardware[0]).toBe(1);
  expect(number(first.expected.credits).toNumber()).toBe(BALANCE.runStartCredits-BALANCE.hardware.calculator.baseCost);
  const tap=fixture.cases.find((x:any)=>x.name==='first-tap');
  const state=registerTap(buyHardwareClass(newGame(1000000,'unity-parity'),'calculator'),1000000);
  expect(number(tap.expected.credits).compare(exactEconomyValue(state,'credits'))).toBe(0);
 });
});
