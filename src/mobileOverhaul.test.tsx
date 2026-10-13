import {describe,it,expect} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Workshop,Research} from './Panels';
import {newGame,hardwareIds} from './economy';
import {readFileSync} from 'node:fs';
const render=(Component:any,s:any)=>renderToStaticMarkup(createElement(Component,{s,act:()=>{}}));
describe('compact mobile overview with reachable detail',()=>{
 it.each(['de','en'] as const)('preserves all paid hardware actions without goal cards in %s',language=>{const base=newGame(0),s={...base,settings:{...base.settings,language}},html=render(Workshop,s);expect(html).not.toMatch(/hardware-savings-goals|hardware-next-output|core-loop-note|core-construct/);expect(html).toContain('core-machine');expect(html).toContain('training-entry');expect(html).toContain('tutorial-equipment');for(const id of hardwareIds)expect(html.match(new RegExp(`id="hardware-${id}"`,'g'))).toHaveLength(1);expect(html.match(/class="hardware-buy"/g)).toHaveLength(15);expect(s).toEqual({...base,settings:{...base.settings,language}});});
 it('keeps three initial research actions and all next-area links behind disclosures',()=>{const html=render(Research,newGame(0));expect(html.match(/class="research-card /g)).toHaveLength(3);expect(html.match(/data-research-area-preview=/g)).toHaveLength(5);expect(html).toContain('Forschungsautomation');expect(html).toContain('Gebiete freischalten');expect(html).toContain('<details class="research-area-group"');});
 it('loads the shared mobile theme after legacy styles',()=>{const main=readFileSync(new URL('./main.tsx',import.meta.url),'utf8');expect(main.indexOf("import './mobile-ui.css'")).toBeGreaterThan(main.indexOf("import './style.css'"));});
});
