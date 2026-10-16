import {newGame} from './legacyContractFixture';
import {createElement,isValidElement,type ReactNode} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Workshop,num} from './Panels';
import {ResearchCatalog} from './ResearchCatalog';
import {researchPreview,type ResearchId} from './economy';
import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {addCredits,buyHardwareClass,computeRate,hardwareClassComputeRate,hardwareIds,hardwarePurchaseComputeGain,maxAffordable,quality,efficiency,BALANCE} from './economy';
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
 it('shows authoritative production without next-purchase clutter',()=>{
  const base=addCredits(newGame(0),1e9),s={...base,settings:{...base.settings,buyMode:10 as const},hardware:12,hardwareCounts:{...base.hardwareCounts,calculator:12}};
  const html=renderToStaticMarkup(createElement(Workshop,{s,act:()=>{}}));
  const row=html.slice(html.indexOf('id="hardware-calculator"'),html.indexOf('id="hardware-sbc"'));
  expect(row).toContain(`<span class="hardware-output">${num(hardwareClassComputeRate(s,'calculator'),1)} Compute/s</span>`);
  expect(row).not.toContain('Nächster Kauf');
  expect(html).not.toContain('hardware-savings-goals');
 });
 it('matches the real compute delta for x10 and MAX purchases',()=>{
  const base=addCredits(newGame(0),1e9),tenGain=hardwarePurchaseComputeGain(base,'calculator',10),afterTen=buyHardwareClass(base,'calculator',10);
  expect(tenGain).toBeCloseTo(computeRate(afterTen.hardware,afterTen)-computeRate(base.hardware,base));
  const count=maxAffordable('calculator',afterTen.hardwareCounts.calculator,afterTen.credits,afterTen),maxGain=hardwarePurchaseComputeGain(afterTen,'calculator',count),afterMax=buyHardwareClass(afterTen,'calculator','max');
  expect(count).toBeGreaterThan(0);
  expect(maxGain).toBeCloseTo(computeRate(afterMax.hardware,afterMax)-computeRate(afterTen.hardware,afterTen));
 });
 it('shows real model current-to-next values from economy functions',()=>{
  expect(panels).toContain("trainingPreview(s,track)");
  expect(panels).toContain('q.effect');
  expect(quality(1)).toBeGreaterThan(quality(0));
  expect(BALANCE.computePerUser/efficiency(1)).toBeLessThan(BALANCE.computePerUser/efficiency(0));
 });
});

describe('mobile prestige and research interaction',()=>{
 it('uses a compact node sheet with an reachable purchase action',()=>{
  expect(panels).toContain('className="primary node-buy-action"');
  expect(panels).toContain("act('node',selected)");
  expect(panels).toContain('className="node-effect-summary"');
  expect(css).toMatch(/\.node-buy-action\{[^}]*min-height:48px/);
  expect(css).toMatch(/--overlay-bottom-reserve:calc\(var\(--nav-height\) \+ env\(safe-area-inset-bottom\)\)/);
 });
 it('makes each visible research card open its own details without starting a job',()=>{
  const s=newGame(0),selected:ResearchId[]=[],actions:string[]=[];
  const tree=ResearchCatalog({s,act:name=>actions.push(name),onSelect:id=>selected.push(id),block:q=>q.reason});
  const cards:any[]=[];
  const visit=(node:ReactNode)=>{if(Array.isArray(node)){node.forEach(visit);return;}if(!isValidElement<{children?:ReactNode;className?:string}>(node))return;if(node.props.className?.startsWith('research-card '))cards.push(node);visit(node.props.children);};
  visit(tree);expect(cards).toHaveLength(3);
  for(const card of cards)card.props.onClick();
  expect(selected).toEqual(['dataGeneration','modelArchitecture','blueprints']);expect(actions).toEqual([]);
  expect(s.researchLabs.every(job=>!job)).toBe(true);
 });
 it.each([375,390,393,402,430])('keeps primary surfaces and CTAs contained at %ipx',width=>{
  expect(width).toBeGreaterThanOrEqual(375);
  expect(css).toContain('.prestige-screen{display:grid');
  expect(css).toContain('height:100%;min-height:0');
  expect(css).toContain('.workshop-action .tap-surface{contain:layout paint}');
  expect(css).toContain('.prestige-confirm.compact .prestige-confirm-actions');
 });
});
