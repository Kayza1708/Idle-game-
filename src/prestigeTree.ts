import {BALANCE,exactEconomyValue,prestigeUpgradeCostScientific,type GameState,type PrestigeUpgradeId} from './economy';

export type PrestigeNodeState='locked'|'ready'|'affordable'|'owned';
export type PrestigePoint={x:number;y:number};

export const PRESTIGE_CANVAS={width:1120,height:1160,nodeWidth:112,nodeHeight:92,core:{x:560,y:48}} as const;

const branchX=[80,310,560,810,1040] as const;
const specialX:Partial<Record<PrestigeUpgradeId,number>>={shoppingAgent:430,trainingPlan:560,componentScanner:690,milestoneMemory:920,modelSynthesis:920,researchArchive:920};

/** One deterministic register is shared by rendering and connector geometry. */
export const prestigeLayout=Object.fromEntries((Object.keys(BALANCE.prestigeUpgrades) as PrestigeUpgradeId[]).map(id=>{
  const node=BALANCE.prestigeUpgrades[id];
  const special=specialX[id];
  const yieldNode=node.branch===5;
  return [id,{x:special??branchX[node.branch as 0|1|2|3|4],y:yieldNode?160+(node.depth-1)*116:special?160:300+(node.depth-1)*116}];
})) as Record<PrestigeUpgradeId,PrestigePoint>;

export function validatePrestigeCatalog(){
  const ids=new Set(Object.keys(BALANCE.prestigeUpgrades) as PrestigeUpgradeId[]),unknown:string[]=[];
  for(const node of Object.values(BALANCE.prestigeUpgrades))for(const requirement of node.requires)if(!ids.has(requirement as PrestigeUpgradeId))unknown.push(requirement);
  const visiting=new Set<PrestigeUpgradeId>(),visited=new Set<PrestigeUpgradeId>(),cycles:PrestigeUpgradeId[]=[];
  const visit=(id:PrestigeUpgradeId)=>{if(visiting.has(id)){cycles.push(id);return}if(visited.has(id))return;visiting.add(id);for(const requirement of BALANCE.prestigeUpgrades[id].requires)if(ids.has(requirement as PrestigeUpgradeId))visit(requirement as PrestigeUpgradeId);visiting.delete(id);visited.add(id)};
  ids.forEach(visit);
  return{unknown:[...new Set(unknown)],cycles:[...new Set(cycles)]};
}

export function prestigeNodeState(s:GameState,id:PrestigeUpgradeId):PrestigeNodeState{
  const node=BALANCE.prestigeUpgrades[id];
  if(s.nodes.includes(id))return'owned';
  if(node.requires.some(requirement=>!s.nodes.includes(requirement as PrestigeUpgradeId))||('requiresPrestige'in node&&node.requiresPrestige&&s.prestigeCount<1))return'locked';
  return exactEconomyValue(s,'unspentINT').compare(prestigeUpgradeCostScientific(id))>=0?'affordable':'ready';
}
