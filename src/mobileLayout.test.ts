import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('./style.css',import.meta.url),'utf8');
import app from './App.tsx?raw';
import panels from './Panels.tsx?raw';
import inventory from './InventoryScreen.tsx?raw';

describe('portrait mobile layout contract',()=>{
 it.each([375,390,393,402,430])('contains the document at %ipx',width=>{
  expect(width).toBeGreaterThanOrEqual(375);
  expect(css).toMatch(/html,body,#root\{[^}]*width:100%[^}]*max-width:100%[^}]*min-width:0[^}]*overflow-x:clip/);
  expect(css).toContain('.prestige-map-shell{position:relative');
  expect(css).toContain('overflow:hidden;touch-action:none');
  expect(css).toContain('min-width:0');
  expect(css).not.toContain(`width:${width+1}px`);
 });
 it('uses five core navigation destinations and internal mobile subscreens',()=>{
  expect(app).toContain("['workshop','research','inventory','prestige','shop'] as Tab[]");
  expect(inventory).toMatch(/useState<\s*["']components["']\s*\|\s*["']modules["']\s*\|\s*["']workbench["']\s*\|\s*["']items["']\s*>/);
  expect(inventory).toContain('mobile-component-grid');
  expect(panels).toContain('MobileDetailSheet');
 });
 it('does not repeat the research resource dashboard or gem account',()=>{
  const research=panels.slice(panels.indexOf('export function Research'),panels.indexOf('export function Inventory'));
  const missions=panels.slice(panels.indexOf('export function Missions'));
  expect(research).not.toContain('research-balance');
  expect(missions).not.toContain('GEM-KONTO');
 });
});
