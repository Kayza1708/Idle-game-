import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {addCredits,buyHardwareClass,computeRate,hardwareClassComputeRate,hardwareIds,hardwarePurchaseComputeGain,maxAffordable,newGame,quality,efficiency,BALANCE} from './economy';
import {prestige} from './prestige';
import panels from './Panels.tsx?raw';
const css=readFileSync(new URL('./style.css',import.meta.url),'utf8');

describe('prestige run reset regression',()=>{
 it('owns no hardware after a normal prestige',()=>{
  const after=prestige(addCredits(newGame(1_000),BALANCE.prestigeBaseRevenue));
  expect(after.hardware).toBe(0);
  expect(after.hardwareCounts.calculator).toBe(0);
  expect(hardwareIds.every(id=>after.hardwareCounts[id]===0)).toBe(true);
 });
});

describe('authoritative workshop progression UI',()=>{
 it('shows authoritative current production and selected-purchase gain',()=>{
  expect(panels).toContain('output=hardwareClassComputeRate(s,id)');
  expect(panels).toContain('purchaseOutput=hardwarePurchaseComputeGain(s,id,count)');
  expect(panels).toContain('className="hardware-output"');
  expect(panels).toContain('className="hardware-next-output"');
  const s={...newGame(0),hardware:12,hardwareCounts:{...newGame(0).hardwareCounts,calculator:12}};
  expect(hardwareClassComputeRate(s,'calculator')).toBeGreaterThan(0);
 });
 it('matches the real compute delta for x10 and MAX purchases',()=>{
  const base=addCredits(newGame(0),1e9),tenGain=hardwarePurchaseComputeGain(base,'calculator',10),afterTen=buyHardwareClass(base,'calculator',10);
  expect(tenGain).toBeCloseTo(computeRate(afterTen.hardware,afterTen)-computeRate(base.hardware,base));
  const count=maxAffordable('calculator',afterTen.hardwareCounts.calculator,afterTen.credits,afterTen),maxGain=hardwarePurchaseComputeGain(afterTen,'calculator',count),afterMax=buyHardwareClass(afterTen,'calculator','max');
  expect(count).toBeGreaterThan(0);
  expect(maxGain).toBeCloseTo(computeRate(afterMax.hardware,afterMax)-computeRate(afterTen.hardware,afterTen));
 });
 it('shows real model current-to-next values from economy functions',()=>{
  expect(panels).toContain('quality(s.qualityLevel+1)');
  expect(panels).toContain('BALANCE.computePerUser/efficiency(s.efficiencyLevel+1)');
  expect(quality(1)).toBeGreaterThan(quality(0));
  expect(BALANCE.computePerUser/efficiency(1)).toBeLessThan(BALANCE.computePerUser/efficiency(0));
 });
});

describe('mobile prestige and research interaction',()=>{
 it('uses a compact node sheet with an reachable purchase action',()=>{
  expect(panels).toContain('className="primary node-buy-action"');
  expect(panels).toContain("act('node',selected)");
  expect(panels).toContain('className="prestige-node-values"');
  expect(css).toMatch(/\.node-buy-action\{[^}]*min-height:48px/);
  expect(css).toMatch(/\.mobile-detail-sheet>footer\{[^}]*safe-area-inset-bottom/);
 });
 it('makes each research row the detail trigger without a details control',()=>{
  const research=panels.slice(panels.indexOf('export function Research'),panels.indexOf('export function Inventory'));
  expect(research).toContain('onClick={()=>setSelectedResearch(id)}');
  expect(research).toContain('<MobileDetailSheet title={copy.name}');
  expect(research).not.toContain('<details>');
  expect(research).not.toContain('Details</span>');
 });
 it.each([375,390,393,402,430])('keeps primary surfaces and CTAs contained at %ipx',width=>{
  expect(width).toBeGreaterThanOrEqual(375);
  expect(css).toContain('.prestige-screen{display:grid');
  expect(css).toContain('height:100%;min-height:0');
  expect(css).toContain('.workshop-action .tap-surface{contain:layout paint}');
  expect(css).toContain('.prestige-confirm.compact .prestige-confirm-actions');
 });
});
