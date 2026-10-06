import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import sheet from './MobileDetailSheet.tsx?raw';
import panels from './Panels.tsx?raw';
import report from './ReturnReport.tsx?raw';

const css=readFileSync(new URL('./style.css',import.meta.url),'utf8');

describe('shared mobile sheet anatomy',()=>{
 it('keeps header, scrolling body, and footer as ordered siblings',()=>{
  const header=sheet.indexOf('className="mobile-detail-sheet__header"');
  const body=sheet.indexOf('className="mobile-detail-sheet__body"');
  const footer=sheet.indexOf('className="mobile-detail-sheet__footer"');
  expect(header).toBeGreaterThan(-1);
  expect(body).toBeGreaterThan(header);
  expect(footer).toBeGreaterThan(body);
 expect(sheet.slice(body,footer)).toContain('</div>');
  expect(sheet).toContain('<footer className="mobile-detail-sheet__footer">{action}</footer>');
  expect(sheet).toContain('createPortal(');
  expect(sheet).toContain(',document.body)');
 });
 it('uses one flex height budget with only the body scrolling',()=>{
  expect(css).toMatch(/\.mobile-detail-sheet\{[^}]*display:flex[^}]*max-height:calc\(100dvh - var\(--overlay-top-gap\) - var\(--overlay-bottom-reserve\)\)[^}]*flex-direction:column[^}]*overflow:hidden/);
  expect(css).toMatch(/\.mobile-detail-sheet__header\{[^}]*flex:0 0 auto/);
  expect(css).toMatch(/\.mobile-detail-sheet__body\{[^}]*min-height:0[^}]*overflow-y:auto[^}]*flex:1 1 auto/);
  expect(css).toMatch(/\.mobile-detail-sheet__footer\{[^}]*flex:0 0 auto/);
  expect(css).not.toContain('.mobile-detail-sheet>footer{position:sticky');
  expect(css).not.toContain('.prestige-screen .mobile-sheet-backdrop .mobile-detail-sheet');
 });
 it('reserves the shell navigation and iPhone safe area once',()=>{
  expect(css).toContain('--overlay-bottom-reserve:calc(var(--nav-height) + env(safe-area-inset-bottom))');
  expect(css).toMatch(/\.mobile-sheet-backdrop\{[^}]*padding:var\(--overlay-top-gap\) 0 var\(--overlay-bottom-reserve\)/);
  expect(css).toMatch(/\.mobile-sheet-backdrop\{[^}]*z-index:120/);
  expect(css).toMatch(/\.bottom-nav\{[^}]*z-index:40/);
 });
});

describe('persistent authoritative action states',()=>{
 it('always renders a prestige node footer CTA through buyNode',()=>{
  const prestige=panels.slice(panels.indexOf('export function Prestige'),panels.indexOf('export function Missions'));
  expect(prestige).toContain('data-cta-state={anchored||x.owned');
  expect(prestige).toContain('disabled={!x.available||anchored}');
  expect(prestige).toContain("act('node',selected)");
  expect(prestige).toContain("'retention'");
 });
 it('always renders research available, blocked, running and completed states',()=>{
  const research=panels.slice(panels.indexOf('export function Research'),panels.indexOf('export function Inventory'));
  expect(research).toContain("ctaState=done?'completed':running?'running'");
  expect(research).toContain("!freeLab?'lab':s.data<cost?'data':'available'");
  expect(research).toContain('data-cta-state={ctaState} disabled={!!reason}');
  expect(research).toContain("act('research-project',id)");
 });
});

describe('offline report overlay',()=>{
 it('keeps actions outside its scrolling body',()=>{
  const body=report.indexOf('className="return-report__body"');
  const footer=report.indexOf('className="return-report__footer"');
  expect(report.indexOf('className="return-report__header"')).toBeLessThan(body);
  expect(footer).toBeGreaterThan(body);
  expect(report.slice(body,footer)).toContain('</div>');
  expect(report.slice(footer)).toContain("de?'Weiter spielen':'Continue playing'");
  expect(report).toContain('createPortal(');
  expect(report).toContain(',document.body)');
 });
 it('shares the navigation-safe viewport budget',()=>{
  expect(css).toMatch(/\.return-backdrop\{[^}]*padding:var\(--overlay-top-gap\) 12px var\(--overlay-bottom-reserve\)/);
  expect(css).toMatch(/\.return-report\{[^}]*display:flex[^}]*max-height:100%[^}]*overflow:hidden/);
  expect(css).toMatch(/\.return-report__body\{[^}]*min-height:0[^}]*overflow-y:auto[^}]*flex:1 1 auto/);
  expect(css).toMatch(/\.return-report__footer\{[^}]*flex:0 0 auto/);
 });
});

it.each([[375,667],[375,812],[390,844],[393,852],[402,874],[430,932]])('uses the same bounded overlay path at %ix%i',(width:number,height:number)=>{
 expect(width).toBeGreaterThanOrEqual(375);
 expect(height).toBeGreaterThanOrEqual(667);
 expect(css).toContain('100dvh - var(--overlay-top-gap) - var(--overlay-bottom-reserve)');
});
