import {describe,expect,it} from 'vitest';
import panels from './Panels.tsx?raw';
import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('./style.css',import.meta.url),'utf8');
describe('tutorial UI contract',()=>{
 it.each(['tutorial-tap','tutorial-buy-calculator','tutorial-production','tutorial-credits','tutorial-quality-training','tutorial-data-generation','tutorial-hardware-analysis','tutorial-recipe-','tutorial-prestige-action'])('renders target %s in the real UI',(id:string)=>expect(panels).toContain(id));
 it('keeps the mobile guide clear of navigation and disables motion when requested',()=>{expect(css).toContain('.tutorial-helper{top:auto');expect(css).toContain('bottom:calc(var(--nav-height)');expect(css).toMatch(/@media\(prefers-reduced-motion:reduce\).*\.tutorial-focus::after\{animation:none\}/s);expect(css).toContain("content:'➜'")});
});
