import {describe,it,expect} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {BALANCE,componentIds,hardwareIds,itemTypes,type ItemTypeId,type PrestigeUpgradeId} from './economy';
import {ComponentArt,ItemArt,HardwareArt,PrestigeArt,componentCells,itemV1Cells,itemV2Cells,prestigeCells,itemReworkCells,metaItemCells,materialExtensionCells,itemArtBounds,newV3ItemMotifs} from './GameArt';
import {materialIcons,deviceIcons,prestigeIcon} from './artIconCatalog';
import {VectorIcon,iconPaths} from './VectorIcon';
import {PixelIcon} from './PixelIcon';
const render=(component:any,props:any)=>renderToStaticMarkup(createElement(component,props));
describe('real atlas coverage and SVG fallback motifs',()=>{
 it('keeps all 15 existing hardware sprite mappings',()=>{for(const id of hardwareIds){const html=render(HardwareArt,{id});expect(html).toContain('atlas-sprite');expect(html).toContain('hardware-classes-atlas.png');expect(html).toContain('preserveAspectRatio="xMidYMid meet"')}});
 it('covers all 20 actual material IDs with a mapped raster or specific vector motif',()=>{expect(componentIds).toHaveLength(20);for(const id of componentIds){expect(materialIcons[id]||componentCells[id]).toBeTruthy();const html=render(ComponentArt,{id});expect(html).not.toContain('neutral-material-art');expect(html).not.toContain('⬡');expect(html).toContain('aria-hidden="true"')}});
 it('replaces the inaccurate crystal with a memristor-array icon while retaining the nine matching old motifs',()=>{expect(materialIcons.neuralCrystals).toBe('memristor');expect(Object.keys(materialIcons)).toHaveLength(11);expect(render(ComponentArt,{id:'neuralCrystals'})).toContain('component-art-extension');expect(render(ComponentArt,{id:'quantumCores'})).toContain('atlas-sprite')});
 it('maps all 30 old and new items to their unique reworked atlas cell',()=>{const ids=Object.keys(itemReworkCells) as ItemTypeId[];expect(Object.keys(itemTypes)).toHaveLength(42);expect(ids).toHaveLength(30);expect(Object.keys(deviceIcons)).toHaveLength(21);for(const type of ids){expect(deviceIcons[type]||itemV2Cells[type]||itemV1Cells[type]).toBeTruthy();const html=render(ItemArt,{type});expect(html).not.toContain('neutral-device-art');expect(html).not.toContain('◇')}expect(render(ItemArt,{type:'lab-drone'})).toContain('item-art-rework');expect(render(ItemArt,{type:'quantum-chip'})).toContain('item-art-rework');expect(Object.keys(itemReworkCells).sort()).toEqual(ids.sort());expect(new Set(Object.values(itemReworkCells).map(cell=>cell.join(','))).size).toBe(30);expect(Object.keys(materialExtensionCells)).toHaveLength(11)});
 it('gives every new/special device a different silhouette instead of one generic diamond',()=>{const motifs=Object.values(deviceIcons);expect(new Set(motifs).size).toBe(motifs.length);for(const motif of motifs)expect(iconPaths[motif]).toBeTruthy()});
 it('uses existing early prestige motifs and semantic branch/special icons for every later node',()=>{for(const id of Object.keys(BALANCE.prestigeUpgrades) as PrestigeUpgradeId[]){expect(iconPaths[prestigeIcon(id)]).toBeTruthy();const html=render(PrestigeArt,{id});expect(html.includes('<svg')).toBe(!prestigeCells[id]);}expect(prestigeIcon('trainingPlan')).toBe('training');expect(prestigeIcon('shoppingAgent')).toBe('hardware')});
 it('keeps decorative icons hidden and explicitly named UI icons accessible without font glyphs',()=>{const named=render(PixelIcon,{name:'box',label:'Bonuskiste'}),decorative=render(PixelIcon,{name:'box'});expect(named).toContain('role="img"');expect(named).toContain('aria-label="Bonuskiste"');expect(decorative).toContain('aria-hidden="true"');expect(named).toContain('<svg');expect(named).not.toContain('▣')});
 it('provides static currentColor SVGs without animations, external images or interactive targets',()=>{for(const name of Object.keys(iconPaths)){const html=render(VectorIcon,{name});expect(html).toContain('viewBox="0 0 32 32"');expect(html).toContain('currentColor');expect(html).toContain('focusable="false"');expect(html).not.toMatch(/<animate|<image|href=/)}});
});

it('uses reviewed original atlas viewports for every item without stretching or neighbour cells',()=>{for(const type of Object.keys(itemArtBounds) as ItemTypeId[]){const [x,y,w,h]=itemArtBounds[type]!;expect(x).toBeGreaterThanOrEqual(0);expect(y).toBeGreaterThanOrEqual(0);expect(w).toBeGreaterThan(0);expect(h).toBeGreaterThan(0);const meta=Object.hasOwn(metaItemCells,type);expect(x+w).toBeLessThanOrEqual(meta?1536:1374);expect(y+h).toBeLessThanOrEqual(meta?1024:1145);const html=render(ItemArt,{type});expect(html).toContain(`viewBox="${x} ${y} ${w} ${h}"`);expect(html).toContain('preserveAspectRatio="xMidYMid meet"');expect(html).toContain(meta?'meta-items-v1.png':'items-complete-rework-atlas-v1.png');}});

it("gives all six meta devices a unique new sprite without changing the original thirty cells",()=>{expect(Object.keys(metaItemCells)).toHaveLength(6);expect(new Set(Object.values(metaItemCells).map(c=>c.join(","))).size).toBe(6);for(const type of Object.keys(metaItemCells) as ItemTypeId[]){expect(itemTypes[type]).toBeTruthy();expect(render(ItemArt,{type})).toContain("meta-items-v1.png");expect(Object.hasOwn(itemReworkCells,type)).toBe(false);}});

it('renders all six new V3 identities as intentionally distinct vector art until the new atlas is painted',()=>{
 expect(Object.keys(itemArtBounds)).toHaveLength(36);
 const ids=Object.keys(newV3ItemMotifs) as ItemTypeId[];
 expect(ids).toHaveLength(6);
 expect(new Set(Object.values(newV3ItemMotifs)).size).toBe(6);
 for(const type of ids){
  const html=render(ItemArt,{type});
  expect(itemTypes[type]).toBeTruthy();
  expect(html).toContain('item-v3-vector-art');
  expect(html).toContain('<svg');
  expect(html).toContain(`data-art-id="${type}"`);
  expect(html).not.toContain('png');
 }
});
