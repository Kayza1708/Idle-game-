/** Presentation geometry only. Connections never define purchase prerequisites. */
export type NetworkPoint={x:number;y:number};
export type NetworkLayoutNode=NetworkPoint&{id:string;branch:string};
export type NetworkLink={from:string;to:string;path:string};
export const NETWORK_ZOOM={min:.65,max:1.45,initial:.82};
export function networkZoom(value:number){return Math.max(NETWORK_ZOOM.min,Math.min(NETWORK_ZOOM.max,value))}
export function buildProgressionNetwork(nodes:readonly {id:string;order:number}[]){
 const branches=[...new Set(nodes.map(n=>n.id[0]))],groups=branches.map(branch=>nodes.filter(n=>n.id[0]===branch).sort((a,b)=>a.order-b.order||a.id.localeCompare(b.id)));
 const radius=150+(Math.max(1,...groups.map(g=>g.length))-1)*170,extent=radius+140,core={x:extent,y:extent},points:NetworkLayoutNode[]=[],links:NetworkLink[]=[];
 groups.forEach((group,branchIndex)=>{
  const angle=(-90+branchIndex*360/branches.length)*Math.PI/180;
  group.forEach((node,index)=>{
   const distance=150+index*170,offset=index===0?0:Math.sin(index*1.4)*.055;
   const point={id:node.id,branch:branches[branchIndex],x:core.x+Math.cos(angle+offset)*distance,y:core.y+Math.sin(angle+offset)*distance};points.push(point);
   const from=index===0?core:points.find(p=>p.id===group[index-1].id)!;
   const dx=point.x-from.x,dy=point.y-from.y,length=Math.hypot(dx,dy),ux=dx/length,uy=dy/length;
   links.push({from:index===0?'core':group[index-1].id,to:node.id,path:`M ${from.x+ux*42} ${from.y+uy*42} Q ${(from.x+point.x)/2-dy*.09} ${(from.y+point.y)/2+dx*.09} ${point.x-ux*42} ${point.y-uy*42}`});
  });
 });
 return {width:extent*2,height:extent*2,core,nodes:points,links,branches};
}
export function zoomCamera(camera:{x:number;y:number;z:number},zoom:number,point:NetworkPoint){
 const z=networkZoom(zoom),ratio=z/camera.z;return{x:point.x-(point.x-camera.x)*ratio,y:point.y-(point.y-camera.y)*ratio,z};
}
