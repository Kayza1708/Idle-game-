import {describe,expect,it} from 'vitest';
import panels from './Panels.tsx?raw';
import css from './style.css?raw';
describe('tutorial UI contract',()=>{
 it.each(['tutorial-tap','tutorial-buy-calculator','tutorial-production','tutorial-credits','tutorial-quality-training','tutorial-data-generation','tutorial-hardware-analysis','tutorial-recipe-','tutorial-prestige-action'])('renders target %s in the real UI',(id:string)=>expect(panels).toContain(id));
 it('keeps the mobile guide clear of navigation and disables motion when requested',()=>{expect(css).toMatch(/@media\(max-width:520px\)\{\.tutorial-helper/);expect(css).toMatch(/bottom:calc\(72px/);expect(css).toMatch(/@media\(prefers-reduced-motion:reduce\).*\.tutorial-focus::after\{animation:none\}/s);expect(css).toContain("content:'➜'")});
});
