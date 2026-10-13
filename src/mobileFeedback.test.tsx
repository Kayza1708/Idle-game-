import {describe,it,expect} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {newGame,addCredits,componentIds} from './economy';
import {Workshop} from './Panels';
import {InventoryScreen} from './InventoryScreen';
import {RecipeIngredient} from './RecipeIngredient';
import {TutorialFocus} from './TutorialFocus';
import {GemShop} from './GemShopPanel';
const render=(component:any,props:any)=>renderToStaticMarkup(createElement(component,props));
describe('concrete mobile feedback regressions',()=>{
 it('uses price-only hardware buttons while preserving affordability',()=>{const original=newGame(0),base={...original,credits:0,exactEconomy:{...original.exactEconomy,credits:{m:0,e:0}}},html=render(Workshop,{s:base,act:()=>{}}),row=html.slice(html.indexOf('id="hardware-calculator"'),html.indexOf('id="hardware-sbc"'));expect(row).toContain('hardware-price');expect(row).not.toContain('cost-badge');expect(row).toContain('class="hardware-buy" disabled=""');const rich=render(Workshop,{s:addCredits(base,1e8),act:()=>{}}),funded=rich.slice(rich.indexOf('id="hardware-calculator"'),rich.indexOf('id="hardware-sbc"'));expect(funded).not.toContain('class="hardware-buy" disabled=""');expect(html).toContain('core-lab-background');expect(html).not.toContain('core-machine');});
 it('shows every actual component count without reservation copy',()=>{const base=newGame(0),s={...base,componentInventory:{...base.componentInventory,circuits:3}},html=render(InventoryScreen,{s,act:()=>{}});expect(html.match(/class="component-tile"/g)).toHaveLength(componentIds.length);expect(html).toContain('×3');expect(html).not.toMatch(/Reserviert|Reserved/);expect(s.componentInventory.circuits).toBe(3);});
 it('omits a zero ingredient without touching its quote or invoking navigation',()=>{let calls=0;const props={name:'Unused',icon:'I',balance:3,required:0,missing:0,de:false,onClick:()=>{calls++}};expect(render(RecipeIngredient,props)).toBe('');expect(props.required).toBe(0);expect(calls).toBe(0);});
 it('starts the shop in one category and never buys during render',()=>{let calls=0;const s=newGame(0),gems=s.gems,html=render(GemShop,{s,act:()=>{calls++}});expect(html).toContain('Shopkategorien');expect(html.match(/role="tab"/g)).toHaveLength(4);expect(html).not.toContain('data-shop-offer="materials-circuits"');expect(html).toContain('capsule-machine-art');expect(html).toContain('Nach deinem ersten Prestige');expect(calls).toBe(0);expect(s.gems).toBe(gems);});
 it('retains tutorial copy and both actions in server rendering',()=>{const base=newGame(0),s={...base,story:{...base.story,tutorial:'active',target:'tap',open:null}},html=render(TutorialFocus,{state:s,onShow:()=>{},onSkip:()=>{}});expect(html).toContain('tutorial-helper');expect(html).toContain('Ziel zeigen');expect(html).toContain('Führung beenden');expect(html).toContain('Erster Impuls');});
});
