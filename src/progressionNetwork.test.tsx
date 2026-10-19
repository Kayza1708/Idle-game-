import {describe,it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {BALANCE,newGame,exactEconomyValue} from './economy';
import {ScientificNumber} from './scientificNumber';
import {buyNode} from './prestige';
import {ProgressionPanel} from './ProgressionPanel';
import {buildProgressionNetwork,zoomCamera,networkZoom,NETWORK_ZOOM} from './progressionNetworkLayout';
describe('connected V2 prestige presentation',()=>{
 it.each(['int','axiom'] as const)('lays out every %s node once, with a connection to the same core',kind=>{
  const catalog=kind==='int'?BALANCE.progression.nodes:BALANCE.progression.axioms,ids=Object.keys(catalog),map=buildProgressionNetwork(ids.map((id,index)=>({id,order:index})));
  expect(new Set(map.nodes.map(n=>n.id))).toEqual(new Set(ids));expect(map.links).toHaveLength(ids.length);
  for(const node of map.nodes){expect(node.x).toBeGreaterThan(60);expect(node.y).toBeGreaterThan(60);expect(node.x).toBeLessThan(map.width-60);expect(node.y).toBeLessThan(map.height-60);let id=node.id;const visited=new Set<string>();while(id!=='core'){expect(visited.has(id)).toBe(false);visited.add(id);const edge=map.links.find(e=>e.to===id)!;expect(edge).toBeTruthy();id=edge.from;}}
  for(let i=0;i<map.nodes.length;i++)for(const b of map.nodes.slice(i+1)){const a=map.nodes[i];expect(Math.abs(a.x-b.x)>=108||Math.abs(a.y-b.y)>=116).toBe(true)}
 });
 it('zooms around the same world point and keeps nodes above the minimum touch size',()=>{
  const c={x:-300,y:-400,z:.82},p={x:170,y:230},zoomed=zoomCamera(c,1.4,p);
  expect((p.x-zoomed.x)/zoomed.z).toBeCloseTo((p.x-c.x)/c.z);expect((p.y-zoomed.y)/zoomed.z).toBeCloseTo((p.y-c.y)/c.z);expect(networkZoom(.1)).toBe(NETWORK_ZOOM.min);expect(68*NETWORK_ZOOM.min).toBeGreaterThanOrEqual(44);
 });
 it('keeps visual links independent from actual INT-only purchases',()=>{
  let s=newGame(0);s={...s,unspentINT:10000,exactEconomy:{...s.exactEconomy,unspentINT:ScientificNumber.from(10000).toJSON()}};
  const after=buyNode(s,'H06');expect(after).not.toBe(s);expect(after.nodes).toContain('H06');expect(after.nodes).not.toContain('H01');expect(exactEconomyValue(s,'unspentINT').subtract(exactEconomyValue(after,'unspentINT')).toNumber()).toBe(BALANCE.progression.nodes.H06.cost);
 });
 it('keeps all nodes inspectable with zero INT, artwork, prices and stable tutorial IDs',()=>{
  const html=renderToStaticMarkup(<ProgressionPanel s={newGame(0)} act={()=>{}}/>);
  for(const id of Object.keys(BALANCE.progression.nodes))expect(html).toContain(`id="prestige-node-${id}"`);
  expect((html.match(/data-network-node=/g)??[])).toHaveLength(60);expect((html.match(/data-link-to=/g)??[])).toHaveLength(60);expect(html).toContain('network-core');expect(html).not.toContain('v2-node-grid');
 });
});
