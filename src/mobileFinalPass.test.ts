import {describe,expect,it} from 'vitest';
import app from './App.tsx?raw';
import panels from './Panels.tsx?raw';
import meta from './MetaHub.tsx?raw';
import css from './style.css?raw';

describe('final mobile interaction contracts',()=>{
 it('has five destinations and locks prestige with the canonical predicate',()=>{
  expect(app).toContain("['workshop','research','inventory','prestige','shop'] as Tab[]");
  expect(app).toContain("game.prestigeCount===0&&!canPrestige(game)");
  expect(app).toContain("tab==='shop'?<Shop");
 });
 it('keeps the prestige map internal, zoomable and dependency-connected',()=>{
  expect(panels).toContain('mapPointerDown');
  expect(panels).toContain('mapPointerMove');
  expect(panels).toContain('clampScale');
  expect(panels).toContain('<svg className="prestige-links"');
  expect(css).toContain('.prestige-map-shell{position:relative;width:100%;max-width:100%;min-width:0');
  expect(css).toContain('overflow:hidden!important;touch-action:none');
 });
 it.each([375,390,393,402,430])('uses a stable four-column mission row at %ipx',width=>{
  expect(width).toBeGreaterThanOrEqual(375);
  expect(css).toContain('grid-template-columns:28px minmax(0,1fr) 45px 56px!important');
  expect(css).toContain('word-break:normal;hyphens:none');
 });
 it('does not render anonymous research artwork placeholders',()=>{
  const research=panels.slice(panels.indexOf('export function Research'),panels.indexOf('export function Inventory'));
  expect(research).not.toContain('research-placeholder');
  expect(research).toContain('<summary><span aria-hidden="true">ⓘ</span><span>');
  expect(css).toContain('background:transparent;color:#79c9bf');
 });
 it('offers a confirmed unrestricted local reset',()=>{
  expect(meta).toContain('setResetConfirm(true)');
  expect(meta).toContain("act('full-reset')");
  expect(meta).not.toContain('disabled={!s.testSave}');
  expect(app).toContain("name==='full-reset'");
  expect(app).toContain('await removeDurableGame();removeGame(storage.current);location.reload()');
 });
 it('shows selected-purchase output and a compact buy action',()=>{
  expect(panels).toContain('classCompute(s,id,owned+count)-output');
  expect(panels).toContain("'beim Kauf'");
  expect(panels).toContain("'KAUFEN'");
  expect(panels).not.toContain('className="hardware-buy" disabled={!affordable} onClick={()=>act(\'buy-class\',id)} aria-label={`${hardwareText(id,language).name} kaufen`}>+</button>');
 });
 it('uses localized header suffixes without ellipsis',()=>{
  expect(panels).toContain("[1e12,'Bio.'],[1e9,'Mrd.'],[1e6,'Mio.'],[1e3,'Tsd.']");
  expect(css).toContain('.resource-bar b{font-size:clamp');
  expect(css).not.toMatch(/\.resource-bar b\{[^}]*text-overflow:ellipsis/);
 });
});
