import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import panels from './Panels.tsx?raw';
import meta from './MetaHub.tsx?raw';

// Avoid overlapping Vite asset-URL and SSR import.meta rewrites; read real CSS.
const css=readFileSync(resolve('src/style.css'),'utf8');


describe('mobile prestige confirmation',()=>{
 it('uses one dominant full-width action followed by secondary cancellation',()=>{const confirmation=panels.slice(panels.indexOf('{confirming&&'),panels.indexOf('<div className="tree-heading'));expect(confirmation).toContain('className="prestige-confirm-hero"');expect(confirmation.indexOf('prestige-confirm-primary')).toBeLessThan(confirmation.indexOf('prestige-confirm-cancel'));expect(css).toMatch(/\.prestige-confirm\.compact \.prestige-confirm-actions\{[^}]*display:flex[^}]*flex-direction:column/);expect(css).toMatch(/\.prestige-confirm-primary\{[^}]*order:1/);expect(css).toMatch(/\.prestige-confirm-cancel\{[^}]*order:2/);});
 it('keeps the repaired BottomNav and safe-area overlay reserve',()=>{expect(css).toContain('--overlay-bottom-reserve:calc(var(--nav-height) + env(safe-area-inset-bottom))');expect(css).toMatch(/\.prestige-confirm-backdrop\{[^}]*var\(--overlay-bottom-reserve\)/);});
});

describe('full-width resource header',()=>{
 it('allocates all remaining width to four equal cells before the menu',()=>{const resource=panels.slice(panels.indexOf('export function ResourceBar'),panels.indexOf('function TapSurface'));expect(resource.match(/<ResourceCell /g)).toHaveLength(4);expect(resource).not.toContain('resource-bar-balance');expect(css).toMatch(/\.resource-bar\{[^}]*grid-template-columns:minmax\(0,1fr\) 44px/);expect(css).toMatch(/\.resource-grid\{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);expect(css).toMatch(/\.menu-button\{[^}]*width:44px[^}]*height:44px/);});
 it.each([375,390,393,402,430])('uses the same equal-width path at %ipx',(width:number)=>{expect(width).toBeGreaterThanOrEqual(375);expect(css).toContain('min-width:0;height:48px');});
});

describe('season reward presentation',()=>{
 it('renders independent free and premium rewards from each tier',()=>{expect(meta).toContain('seasonRewardTiers.map(tier=>');expect(meta).toContain('const reward=tier.free,premium=tier.premium');expect(meta).toContain('rewardArt(premium)');expect(meta).toContain('rewardLabel(premium)');});
 it('marks milestones without changing the existing free claim action',()=>{expect(meta).toContain("tier.milestone?'milestone':''");expect(meta).toContain("act('season-claim',tier.level)");expect(css).toContain('.reward-tier.milestone');expect(css).toContain('.reward-tier.milestone .reward-card.premium');});
});
