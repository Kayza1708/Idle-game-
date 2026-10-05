import {describe,expect,it} from 'vitest';
import {BALANCE,buyHardwareClass,creditRate,hardwareCost,newGame,registerTap} from './economy';
import {rollPeriods} from './missions';
import appSource from './App.tsx?raw';
import panelSource from './Panels.tsx?raw';
import {readFileSync} from 'node:fs';
const cssSource=readFileSync(new URL('./style.css',import.meta.url),'utf8');

describe('active-first mobile opening',()=>{
 it('starts without hardware or passive Credits',()=>{
  const state=newGame(0);
  expect(state.hardware).toBe(0);
  expect(Object.values(state.hardwareCounts).every(count=>count===0)).toBe(true);
  expect(creditRate(state.hardware,state.level,state)).toBe(0);
 });
 it('earns the first Calculator entirely from core impulses, then starts passive production',()=>{
  let state=newGame(0);
  expect(registerTap(state,0).credits).toBeGreaterThan(0);
  while(state.credits<hardwareCost('calculator',0,state))state=registerTap(state,state.savedAt);
  const purchased=buyHardwareClass(state,'calculator',1);
  expect(purchased.hardwareCounts.calculator).toBe(1);
  expect(creditRate(purchased.hardware,purchased.level,purchased)).toBeGreaterThan(0);
 });
 it('automatically triggers and resets Overclock on every hundredth impulse',()=>{
  let state=newGame(1);
  for(let tap=0;tap<BALANCE.overclockTaps-1;tap++)state=registerTap(state,1);
  expect(state.overclock.activeUntil).toBe(0);
  state=registerTap(state,1);
  expect(BALANCE.overclockTaps).toBe(100);
  expect(state.overclock.taps).toBe(0);
  expect(state.overclock.activeUntil).toBeGreaterThan(1);
  expect(state.lifetime.overclocks).toBe(1);
 });
 it('keeps generated Overclock missions compatible with automatic triggers',()=>{
  const state=rollPeriods(newGame(Date.UTC(2026,0,2)),Date.UTC(2026,0,2));
  const overclock=Object.values(state.missions).flatMap(period=>'tasks'in period?period.tasks:[]).find(task=>task.metric==='overclocks');
  if(overclock)expect(overclock.de).toContain('auslösen');
 });
});

describe('final mobile presentation contracts',()=>{
 it('keeps drops in the action field without dismissible reward modal markup',()=>{
  expect(appSource).not.toContain('<RewardFeedback');
  expect(panelSource).toContain('core-finds');
  expect(panelSource).toContain("act('loot-drop',drop.id)");
 });
 it('renders every hardware class through one list and no later-hardware section',()=>{
  expect(panelSource).toContain('hardwareIds.map((id,index)');
  expect(panelSource).not.toContain('Spätere Hardwareklassen');
  expect(panelSource).not.toContain('hardware-late');
 });
 it('does not expose technical controls in the gameplay shell',()=>{
  const shell=appSource.slice(appSource.indexOf(' return <main'));
  expect(shell).not.toContain('className="debug"');
  expect(shell).not.toContain('<footer>');
 });
 it('uses compact resource values instead of ellipsis',()=>{
  expect(panelSource).toContain('compactHeaderValue');
  expect(cssSource).toContain('.resource-bar b{font-size:clamp(11px,3.2vw,15px);text-overflow:clip');
 });
 it('keeps the prestige network inside three bounded columns',()=>{
  expect(cssSource).toContain('grid-template-columns:repeat(3,minmax(0,1fr))!important');
  expect(cssSource).toContain('width:min(100%,92px)!important');
 });
});
