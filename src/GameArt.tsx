import type { CSSProperties } from 'react';
import { BALANCE, type ComponentId, type HardwareId, type ItemTypeId, type PrestigeUpgradeId } from './economy';

type SpriteStyle = CSSProperties & {'--sprite-x': string; '--sprite-y': string};

const hardwareCells: Record<HardwareId, [number, number]> = {
  calculator: [0, 0], sbc: [1, 0], pc: [2, 0], gpu: [3, 0],
  rig: [0, 1], server: [1, 1], farm: [2, 1], campus: [3, 1],
  cloud: [0, 2], liquid: [1, 2], subsea: [2, 2], orbital: [3, 2],
  lunar: [0, 3], dyson: [1, 3], matrioshka: [2, 3],
};

const itemCells: Record<ItemTypeId, [number, number]> = {
  'quantum-chip': [0, 0], 'neural-asic': [1, 0], 'photonic-array': [2, 0],
  'memory-crystal': [3, 0], 'logic-seed': [0, 1], 'tensor-core': [1, 1],
  'field-scanner': [2, 1], 'lab-drone': [3, 1], 'data-prism': [0, 2],
};

const prestigeCells: Record<PrestigeUpgradeId, [number, number]> = {
dataArchive1: [0, 0], computeNet1: [1, 0], analysis1: [2, 0], labs1: [3, 0], manufacturing1: [0, 1], dataArchive2: [1, 1], computeNet2: [2, 1], analysis2: [3, 1], labs2: [0, 2], manufacturing2: [1, 2], dataArchive3: [2, 2], computeNet3: [3, 2], analysis3: [0, 3], labs3: [1, 3], manufacturing3: [2, 3]
};

export type ResourceArtId = 'credits' | 'gems' | 'compute' | 'int' | 'research' | 'blueprints' | 'components' | 'data';
const resourceCells: Record<ResourceArtId, [number, number]> = {
  credits: [0, 0], gems: [1, 0], compute: [2, 0], int: [3, 0],
  research: [0, 1], blueprints: [1, 1], components: [2, 1], data: [3, 1],
};

function cellStyle(cell: [number, number] | undefined, lastRow: number): SpriteStyle {
  const [column, row] = cell ?? [0, 0];
  return {'--sprite-x': `${column * 100 / 3}%`, '--sprite-y': `${row * 100 / lastRow}%`};
}

function prestigeCell(id: PrestigeUpgradeId): [number, number] {
  const configured=prestigeCells[id];
  if(configured)return configured;
  const node=BALANCE.prestigeUpgrades[id];
  return [node.branch % 4, Math.min(3, Math.max(0, (node.depth - 1) % 4))];
}

export function HardwareArt({id}:{id:HardwareId}) {
  return <span className="atlas-sprite hardware-art" style={cellStyle(hardwareCells[id], 3)} aria-hidden="true"/>;
}

export function ItemArt({type}:{type:ItemTypeId}) {
  return <span className="atlas-sprite item-art" style={cellStyle(itemCells[type], 2)} aria-hidden="true"/>;
}

export function PrestigeArt({id}:{id:PrestigeUpgradeId}) {
  return <span className="atlas-sprite prestige-art" style={cellStyle(prestigeCell(id), 3)} aria-hidden="true"/>;
}

export function ResourceArt({id}:{id:ResourceArtId}) {
  return <span className="atlas-sprite resource-art" style={cellStyle(resourceCells[id], 1)} aria-hidden="true"/>;
}
export function ComponentArt({id}:{id:ComponentId}){const [column,row]=BALANCE.components[id].atlasCell;return <span className="atlas-sprite component-art" style={{'--sprite-x':`${column*50}%`,'--sprite-y':`${row*100}%`} as SpriteStyle} aria-hidden="true"/>;}
