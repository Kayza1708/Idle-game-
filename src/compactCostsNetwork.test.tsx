import {describe,it,expect} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {CostBadge} from './CostBadge';
import {ScientificNumber} from './scientificNumber';
import {BALANCE} from './economy';
import {PRESTIGE_CANVAS,prestigeLayout,prestigeConnector} from './prestigeTree';
const render=(balance:number|ScientificNumber,required:number|ScientificNumber,missing?:number)=>renderToStaticMarkup(createElement(CostBadge,{name:'Data',icon:'D',balance,required,missing}));
describe('compact cost semantics and radial network geometry',()=>{
 it('marks enough and exact threshold green with a non-color status',()=>{for(const n of [10,11]){const html=render(n,10);expect(html).toContain('cost-badge sufficient');expect(html).toContain('sufficient');expect(html).toContain('✓');}});
 it('marks a shortfall red and never derives payment from rounded display',()=>{expect(render(9.99,10)).toContain('cost-badge insufficient');expect(render(100,10,1)).toContain('cost-badge insufficient');});
 it('compares huge scientific balances without converting to finite doubles',()=>{const cost=ScientificNumber.fromJSON({m:1,e:350}),higher=ScientificNumber.fromJSON({m:2,e:350});expect(render(higher,cost)).toContain('cost-badge sufficient');expect(render(cost,higher)).toContain('cost-badge insufficient');});
 it('keeps invalid values unavailable instead of displaying a free requirement',()=>{const html=render(NaN,Infinity);expect(html).toContain('Invalid / Invalid');expect(html).toContain('insufficient');});
 it('places every actual node once, inside the canvas, without overlap',()=>{expect(Object.keys(prestigeLayout).sort()).toEqual(Object.keys(BALANCE.prestigeUpgrades).sort());const points=Object.values(prestigeLayout);for(let i=0;i<points.length;i++){const p=points[i];expect(p.x).toBeGreaterThan(44);expect(p.y).toBeGreaterThan(44);expect(p.x).toBeLessThan(PRESTIGE_CANVAS.width-44);expect(p.y).toBeLessThan(PRESTIGE_CANVAS.height-44);for(let j=i+1;j<points.length;j++)expect(Math.hypot(p.x-points[j].x,p.y-points[j].y)).toBeGreaterThan(98);}});
 it('insets connectors at both node edges rather than crossing icon centers',()=>{expect(prestigeConnector({x:0,y:0},{x:200,y:0})).toBe('M 44 0 L 156 0');});
});
