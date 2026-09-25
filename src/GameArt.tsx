import type { CSSProperties } from 'react';
import type { ComponentId, HardwareId, ItemTypeId, PrestigeUpgradeId } from './economy';

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
impulseNetwork: [0, 0], hardwareAtlas: [1, 0], parallelLab: [2, 0], shoppingAgent: [3, 0], componentScanner: [0, 1], overclockSwitch: [1, 1], computeNetwork: [2, 1], labQueue: [3, 1], shoppingPlan: [0, 2], feedback: [1, 2], milestoneRecycling: [2, 2], labAssistant: [3, 2], secondSocket: [0, 3]
};

export type ResourceArtId = 'credits' | 'gems' | 'compute' | 'int' | 'research' | 'blueprints' | 'components' | 'data';
const resourceCells: Record<ResourceArtId, [number, number]> = {
  credits: [0, 0], gems: [1, 0], compute: [2, 0], int: [3, 0],
  research: [0, 1], blueprints: [1, 1], components: [2, 1], data: [3, 1],
};

function cellStyle([column, row]: [number, number], lastRow: number): SpriteStyle {
  return {'--sprite-x': `${column * 100 / 3}%`, '--sprite-y': `${row * 100 / lastRow}%`};
}

export function HardwareArt({id}:{id:HardwareId}) {
  return <span className="atlas-sprite hardware-art" style={cellStyle(hardwareCells[id], 3)} aria-hidden="true"/>;
}

export function ItemArt({type}:{type:ItemTypeId}) {
  return <span className="atlas-sprite item-art" style={cellStyle(itemCells[type], 2)} aria-hidden="true"/>;
}

export function PrestigeArt({id}:{id:PrestigeUpgradeId}) {
  return <span className="atlas-sprite prestige-art" style={cellStyle(prestigeCells[id], 3)} aria-hidden="true"/>;
}

export function ResourceArt({id}:{id:ResourceArtId}) {
  return <span className="atlas-sprite resource-art" style={cellStyle(resourceCells[id], 1)} aria-hidden="true"/>;
}
const componentCells:Record<ComponentId,[number,number]>={circuits:[0,0],laser:[1,0],graphene:[2,0],titaniumBolts:[0,1],nanotubes:[1,1],quantumCores:[2,1]};
export function ComponentArt({id}:{id:ComponentId}){const [column,row]=componentCells[id];return <span className="atlas-sprite component-art" style={{'--sprite-x':`${column*50}%`,'--sprite-y':`${row*100}%`} as SpriteStyle} aria-hidden="true"/>;}
