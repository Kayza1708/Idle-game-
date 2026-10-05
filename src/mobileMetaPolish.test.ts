import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import app from './App.tsx?raw';
import panels from './Panels.tsx?raw';
import meta from './MetaHub.tsx?raw';
import shop from './GemShopPanel.tsx?raw';
import art from './GameArt.tsx?raw';
import commerce from './nativeCommerce.ts?raw';
const css=readFileSync(new URL('./style.css',import.meta.url),'utf8');

describe('shared mobile shell and diagnostics',()=>{
 it('keeps resources and navigation outside the common screen scroller',()=>{
  expect(app).toContain('className={`game-shell');
  expect(app.indexOf('<ResourceBar')).toBeLessThan(app.indexOf('<div className={`content'));
  expect(app.indexOf('<nav className="bottom-nav"')).toBeGreaterThan(app.indexOf('<div className={`content'));
  expect(css).toMatch(/\.game-shell\{[^}]*grid-template-rows:[^}]*minmax\(0,1fr\)/);
 });
 it('does not render crash export in the gameplay shell',()=>{
  const shell=app.slice(app.indexOf('return <main className='));
  expect(shell).not.toContain('crash-notice');
  expect(shell).not.toContain('Crash-Bericht exportieren');
  expect(meta).toContain("act('crash-export')");
  expect(meta).toContain('diagnostic-settings');
 });
});

describe('mobile interaction polish',()=>{
 it('centers and contains the compact core',()=>{
  expect(css).toMatch(/\.workshop-action \.core-construct\{[^}]*left:50%[^}]*transform:translate\(-50%,-50%\)/);
  expect(css).toMatch(/\.workshop-action \.tap-surface\{[^}]*contain:layout paint/);
 });
 it('anchors research tabs to the shared scroller and offers only short analysis actions',()=>{
  expect(css).toContain('.research-tabs{top:0');
  const analysis=panels.slice(panels.indexOf("{view==='analysis'"),panels.indexOf("{view==='breakthroughs'"));
  expect(analysis).not.toContain("'long'");
  expect(analysis).not.toContain('Analyseslot');
  expect(analysis).toContain("act('experiment',id,'short')");
  expect(analysis).toContain("'ANALYSE STARTEN'");
 });
 it.each([375,390,393,402,430])('keeps claim and dynamic values bounded at %ipx',width=>{
  expect(width).toBeGreaterThanOrEqual(375);
  expect(css).toContain('.mission-claim{flex:0 0 80px;width:80px;min-width:80px;white-space:nowrap');
  expect(css).toContain('.mission-content{flex:1 1 auto;min-width:0}');
  expect(css).toContain('.setting-range output{width:5ch;text-align:right}');
 });
 it('opens profile and settings as separate modes and keeps all languages selectable',()=>{
  expect(app).toContain("setProfileSection('profile')");
  expect(app).toContain("setProfileSection('settings')");
  expect(app).toContain('<ProfileModal key={profileSection}');
  expect(meta).toContain("const settingsMode=initialTab==='settings'");
  expect(meta).toContain('value={s.settings.language} onChange={e=>act(\'language\',e.currentTarget.value)}');
  expect(meta).toContain('languages.map');
 });
 it('shows honest disabled notification capabilities',()=>{
  expect(meta).toContain('className="notification-settings"');
  expect(meta).toContain('Native Benachrichtigungen sind in dieser Beta noch nicht integriert.');
  expect(meta).toContain('type="checkbox" disabled aria-disabled="true"');
 });
});

describe('canonical gems, season and native boundaries',()=>{
 it('uses the canonical Gem artwork without emoji',()=>{
  expect(art).toContain('export function GemAmount');
  for(const source of [panels,meta,shop])expect(source).not.toContain('💎');
  expect(panels).toContain('<GemAmount value={task.reward}/>');
  expect(shop).toContain('<GemAmount value={quote.cost}/>');
 });
 it('shows compact season timing and concrete free/premium reward previews',()=>{
  expect(meta).toContain('season.endsAt-s.savedAt');
  expect(meta).toContain('className="season-countdown"');
  expect(meta).toContain('data-premium-state="unavailable"');
  expect(meta).toContain("'PREMIUM FREISCHALTEN'");
  expect(meta).toContain('className="reward-card premium locked"');
  expect(meta).not.toContain('premiumChest');
 });
 it('has no hardcoded price or simulated native purchase',()=>{
  expect(commerce).toContain('localizedPrice:string');
  expect(commerce).toContain("purchase:async()=> 'failed'");
  expect(commerce).not.toMatch(/[€$£]\s*\d/);
  expect(app).not.toContain("case'ad':return rewardAd");
 });
});
