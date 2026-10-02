import type { CSSProperties } from 'react';
import { type ComponentId, type HardwareId, type ItemTypeId, type PrestigeUpgradeId } from './economy';

type SpriteStyle = CSSProperties & {'--sprite-x': string; '--sprite-y': string};
type Grid = {columns:number;rows:number};

const hardwareCells: Record<HardwareId, [number, number]> = {
  calculator:[0,0],sbc:[1,0],pc:[2,0],gpu:[3,0],rig:[0,1],server:[1,1],farm:[2,1],campus:[3,1],cloud:[0,2],liquid:[1,2],subsea:[2,2],orbital:[3,2],lunar:[0,3],dyson:[1,3],matrioshka:[2,3],
};
const componentCells:Record<ComponentId,[number,number]>={circuits:[0,0],copperCoils:[1,0],siliconWafers:[2,0],titaniumBolts:[3,0],photonicLenses:[4,0],graphene:[0,1],nanotubes:[1,1],superconductors:[2,1],neuralCrystals:[3,1],quantumCores:[4,1]};
// Only motifs that exactly represent an existing item use v2. All other item types retain v1.
const itemV2Cells:Partial<Record<ItemTypeId,[number,number]>>={'quantum-chip':[0,0],'neural-asic':[1,0],'field-scanner':[2,0],'data-prism':[0,1]};
const itemV1Cells:Record<Exclude<ItemTypeId,'impulse-relay'|'insight-archive'>,[number,number]>={'quantum-chip':[0,0],'neural-asic':[1,0],'photonic-array':[2,0],'memory-crystal':[3,0],'logic-seed':[0,1],'tensor-core':[1,1],'field-scanner':[2,1],'lab-drone':[3,1],'data-prism':[0,2]};
const prestigeCells:Partial<Record<PrestigeUpgradeId,[number,number]>>={dataArchive1:[0,0],computeNet1:[1,0],analysis1:[2,0],labs1:[3,0],manufacturing1:[0,1],dataArchive2:[1,1],computeNet2:[2,1],analysis2:[3,1],labs2:[0,2],manufacturing2:[1,2],dataArchive3:[2,2],computeNet3:[3,2],analysis3:[0,3],labs3:[1,3],manufacturing3:[2,3]};
export type ResourceArtId='credits'|'gems'|'compute'|'int'|'research'|'blueprints'|'components'|'data';
const resourceCells:Record<ResourceArtId,[number,number]>={credits:[0,0],gems:[1,0],compute:[2,0],int:[3,0],research:[0,1],blueprints:[1,1],components:[2,1],data:[3,1]};
export type MetaArtId='daily'|'weekly'|'monthly'|'season'|'profile'|'achievements';
const metaCells:Record<MetaArtId,[number,number]>={daily:[0,0],weekly:[1,0],monthly:[2,0],season:[0,1],profile:[1,1],achievements:[2,1]};
export type ActivityArtId='drop-closed'|'drop-open'|'hardware'|'architecture'|'artifact'|'workbench';
const activityCells:Record<ActivityArtId,[number,number]>={'drop-closed':[0,0],'drop-open':[1,0],hardware:[2,0],architecture:[0,1],artifact:[1,1],workbench:[2,1]};

const cellStyle=(cell:[number,number],grid:Grid):SpriteStyle=>({'--sprite-x':grid.columns===1?'0%':`${cell[0]*100/(grid.columns-1)}%`,'--sprite-y':grid.rows===1?'0%':`${cell[1]*100/(grid.rows-1)}%`});
// The atlas has no matching motif for later/special nodes. Cell 3/3 is the
// intentionally shared neutral node symbol; never infer artwork from an id.
const prestigeCell=(id:PrestigeUpgradeId):[number,number]=>prestigeCells[id]??[3,3];
export function HardwareArt({id}:{id:HardwareId}){return <span className="atlas-sprite hardware-art" style={cellStyle(hardwareCells[id],{columns:4,rows:4})} aria-hidden="true"/>}
export function ItemArt({type}:{type:ItemTypeId}){if(type==='insight-archive')return <span className="item-art insight-archive-art" aria-hidden="true">INT</span>;if(type==='impulse-relay')return <span className="item-art impulse-relay-art" aria-hidden="true">↯</span>;const v2=itemV2Cells[type];return <span className={`atlas-sprite item-art ${v2?'item-art-v2':'item-art-v1'}`} style={cellStyle(v2??itemV1Cells[type as Exclude<ItemTypeId,'impulse-relay'|'insight-archive'>],v2?{columns:3,rows:3}:{columns:4,rows:3})} aria-hidden="true"/>}
export function PrestigeArt({id}:{id:PrestigeUpgradeId}){return <span className="atlas-sprite prestige-art" style={cellStyle(prestigeCell(id),{columns:4,rows:4})} aria-hidden="true"/>}
export function ResourceArt({id}:{id:ResourceArtId}){return <span className="atlas-sprite resource-art" style={cellStyle(resourceCells[id],{columns:4,rows:2})} aria-hidden="true"/>}
export function ComponentArt({id}:{id:ComponentId}){return <span className="atlas-sprite component-art" style={cellStyle(componentCells[id],{columns:5,rows:2})} aria-hidden="true"/>}
export function MetaArt({id}:{id:MetaArtId}){return <span className="atlas-sprite meta-art" style={cellStyle(metaCells[id],{columns:3,rows:2})} aria-hidden="true"/>}
export function ActivityArt({id}:{id:ActivityArtId}){return <span className="atlas-sprite activity-art" style={cellStyle(activityCells[id],{columns:3,rows:2})} aria-hidden="true"/>}
