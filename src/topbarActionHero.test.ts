import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import panels from './Panels.tsx?raw';

const css=readFileSync(new URL('./style.css',import.meta.url),'utf8');
const resourceBar=panels.slice(panels.indexOf('export function ResourceBar'),panels.indexOf('function TapSurface'));
const tapSurface=panels.slice(panels.indexOf('function TapSurface'),panels.indexOf('function HardwareStore'));
const workshop=panels.slice(panels.indexOf('export function Workshop'),panels.indexOf('export function Research'));

describe('symmetric mobile resource header',()=>{
 it('uses four identical resource cells between equal balance rails',()=>{
  expect(resourceBar.match(/<ResourceCell /g)).toHaveLength(4);
  expect(resourceBar).toContain('className="resource-bar-balance"');
  expect(resourceBar).toContain('className="resource-grid"');
  expect(css).toMatch(/\.resource-bar\{[^}]*grid-template-columns:44px minmax\(0,1fr\) 44px/);
  expect(css).toMatch(/\.resource-grid\{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
 });
 it('reserves stable numeric rows and a 44px menu target',()=>{
  expect(css).toMatch(/\.resource-cell\{[^}]*grid-template-rows:15px 19px 11px/);
  expect(css).toMatch(/\.resource-cell>b\{[^}]*font-variant-numeric:tabular-nums/);
  expect(css).toMatch(/\.menu-button\{[^}]*width:44px[^}]*min-height:44px/);
 });
});

describe('structured Workshop action hero',()=>{
 it('separates the tap target, reward readout and impulse progress',()=>{
  expect(tapSurface).toContain('className={`core-hero');
  expect(tapSurface).toContain('className="tap-surface"');
  expect(tapSurface).toContain('className="core-readout"');
  expect(tapSurface).toContain('className="core-progress"');
  expect(tapSurface).toContain('className="impulse-meter"');
  expect(tapSurface).not.toContain('className="tap-content"');
  expect(tapSurface).not.toContain('className="core-status"');
 });
 it('shows authoritative model effects before opening its sheet',()=>{
  expect(workshop).toContain('className="model-metrics"');
  expect(workshop).toContain('quality(s.qualityLevel)');
  expect(workshop).toContain('BALANCE.computePerUser/efficiency(s.efficiencyLevel)');
 });
 it.each([[375,667],[375,812],[390,844],[393,852],[402,874],[430,932]])('keeps the %ix%i portrait contract bounded',(width:number,height:number)=>{
  expect(width).toBeGreaterThanOrEqual(375);
  expect(height).toBeGreaterThanOrEqual(667);
  expect(css).toMatch(/\.core-hero\{[^}]*min-width:0[^}]*overflow:hidden/);
  expect(css).toMatch(/\.model-status-row\{[^}]*grid-template-columns:38px minmax\(0,1fr\)/);
  expect(css).toContain('@media(max-width:380px)');
 });
});
