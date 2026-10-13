import {BALANCE,exactEconomyValue,prestigeUpgradeCostScientific,type GameState,type PrestigeUpgradeId} from './economy';
import {prestigeGate} from './retention';

export type PrestigeNodeState='locked'|'ready'|'affordable'|'owned';
export type PrestigePoint={x:number;y:number};

const ids=Object.keys(BALANCE.prestigeUpgrades) as PrestigeUpgradeId[];
const maximumDepth=Math.max(...ids.map(id=>BALANCE.prestigeUpgrades[id].depth));
const extent=320+maximumDepth*115+100;
export const PRESTIGE_CANVAS={width:extent*2,height:extent*2,nodeWidth:88,nodeHeight:88,core:{x:extent,y:extent}};
/** Six radial sectors. Shared positions drive nodes and actual prerequisite links. */
export const prestigeLayout=Object.fromEntries(ids.map(id=>{
 const node=BALANCE.prestigeUpgrades[id];
 if(node.branch>=6){const specials=ids.filter(other=>BALANCE.prestigeUpgrades[other].branch>=6),angle=(-60+specials.indexOf(id)*360/specials.length)*Math.PI/180;return [id,{x:extent+Math.cos(angle)*160,y:extent+Math.sin(angle)*160}];}
 const peers=ids.filter(other=>BALANCE.prestigeUpgrades[other].branch===node.branch&&BALANCE.prestigeUpgrades[other].depth===node.depth),index=peers.indexOf(id);
 const offset=peers.length>1?(index/(peers.length-1)-.5)*44:0;
 const angle=(-90+node.branch*60+offset)*Math.PI/180,radius=280+(node.depth-1)*115;
 return [id,{x:extent+Math.cos(angle)*radius,y:extent+Math.sin(angle)*radius}];
})) as Record<PrestigeUpgradeId,PrestigePoint>;
export const prestigeMapScale=(value:number)=>Math.max(.1,Math.min(1.5,value));
export function prestigeConnector(from:PrestigePoint,to:PrestigePoint){
 const distance=Math.hypot(to.x-from.x,to.y-from.y),inset=Math.min(PRESTIGE_CANVAS.nodeWidth/2,distance/3),ux=(to.x-from.x)/(distance||1),uy=(to.y-from.y)/(distance||1);
 return `M ${from.x+ux*inset} ${from.y+uy*inset} L ${to.x-ux*inset} ${to.y-uy*inset}`;
}

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
  const gate=prestigeGate(s,node.depth);
  if(node.requires.some(requirement=>!s.nodes.includes(requirement as PrestigeUpgradeId))||('requiresPrestige'in node&&node.requiresPrestige&&s.prestigeCount<1)||(gate&&!gate.ok))return'locked';
  return exactEconomyValue(s,'unspentINT').compare(prestigeUpgradeCostScientific(id))>=0?'affordable':'ready';
}
