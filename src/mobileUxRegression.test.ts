import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import app from './App.tsx?raw';
import panels from './Panels.tsx?raw';
import tutorial from './TutorialFocus.tsx?raw';
import shop from './GemShopPanel.tsx?raw';
const css=readFileSync(new URL('./style.css',import.meta.url),'utf8');

describe('mobile gameplay shell and information architecture',()=>{
 it('freezes resources, action area and navigation around one workshop scroller',()=>{
  expect(app).toContain('game-shell');
  expect(app).toContain("tab==='workshop'?'workshop-content':'screen-content'");
  expect(panels).toContain('className="workshop-action"');
  expect(panels).toContain('className="workshop-scroll" data-scroll-region="workshop-content"');
  expect(css).toContain('grid-template-rows:calc(var(--top-height) + env(safe-area-inset-top)) minmax(0,1fr) calc(var(--nav-height) + env(safe-area-inset-bottom))');
  expect(css).toMatch(/\.workshop-scroll\{[^}]*min-height:0[^}]*overflow-y:auto/);
 });
 it('keeps the core compact and independent of the old lab image',()=>{
  expect(panels).not.toContain('early-lab-pixel-art.png');
  expect(css).toMatch(/\.core-hero \.tap-surface\{[^}]*height:214px/);
  expect(css).toContain('repeating-radial-gradient');
 });
 it('removes the permanent next-goal panel and uses the Mira coach',()=>{
  const workshop=panels.slice(panels.indexOf('export function Workshop'),panels.indexOf('export function Research'));
  expect(workshop).not.toContain('next-goal-onboarding');
  expect(workshop).not.toContain('className="card quest"');
  expect(tutorial).toContain('className="tutorial-helper"');
 });
 it('offers only the next locked laboratory inline with its existing price',()=>{
  expect(panels).toContain('data-lab-unlock="next"');
  expect(panels).toContain("offer=next===3?'lab-slot-1':next===4?'lab-slot-2':null");
  expect(panels).toContain('BALANCE.gemShop.labSlots[next-3]');
  expect(panels).not.toContain('className="locked-labs"');
 });
 it('uses compact shop offers without developer or native-store prose',()=>{
  expect(shop).not.toContain('Garantierte Inhalte, keine Lootboxen');
  expect(shop).not.toContain('Store-Integration ist vorbereitet');
  expect(panels).not.toContain('Optionale Angebote – keine neue Kaufmechanik.');
  expect(css).toContain('grid-template-columns:repeat(2,minmax(0,1fr))');
 });
 it('moves prestige reset prose into a detail sheet',()=>{
  expect(panels).toContain('className="prestige-summary"');
  expect(panels).toContain("title={de?'Prestige-Details':'Prestige details'}");
  expect(panels).not.toContain('className="int-strip"');
 });
});

describe('mission row structure and portrait containment',()=>{
 it('owns explicit icon, flexible content, reward and claim regions',()=>{
  expect(panels).toContain('className="mission-icon"');
  expect(panels).toContain('className="mission-content"');
  expect(panels).toContain('className="mission-title"');
  expect(panels).toContain('className="mission-progress"');
  expect(panels).toContain('className="mission-reward"');
  expect(panels).toContain('className="mission-claim"');
  expect(css).toMatch(/\.mission-content\{[^}]*flex:1 1 auto[^}]*min-width:0/);
 });
 it('does not absolutely position mission anatomy',()=>{
  for(const selector of ['mission-icon','mission-content','mission-reward','mission-claim']){
   const rules=[...css.matchAll(new RegExp(`\\.${selector}\\{([^}]*)\\}`,'g'))];
   expect(rules.length).toBeGreaterThan(0);
   expect(rules.every(rule=>!rule[1].includes('position:absolute'))).toBe(true);
  }
 });
 it.each([375,390,393,402,430])('keeps a flexible mission content path at %ipx',width=>{
  expect(width).toBeGreaterThanOrEqual(375);
  expect(css).toContain('display:flex;align-items:center');
  expect(css).toContain('flex:1 1 auto;min-width:0');
  expect(css).not.toContain('word-break:break-all');
 });
 it('bounds mobile rows without legacy mini-column templates',()=>{
  expect(css).toMatch(/\.mobile-mission-list \.mission-row\{[^}]*min-height:64px[^}]*max-height:72px/);
  expect(css).not.toContain('grid-template-columns:28px minmax(0,1fr) 45px 56px!important');
 });
});
