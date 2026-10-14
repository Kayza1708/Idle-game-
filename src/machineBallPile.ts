/** Cosmetic, deterministic packing. Separate from gameplay RNG and saved rewards. */
export const machineBallPile=(()=>{let seed=92741;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};const balls:{x:number;y:number;r:number;color:number}[]=[];
 for(let i=0;i<62;i++){const r=29+random()*9;let best:{x:number;y:number}|null=null;for(let attempt=0;attempt<7;attempt++){const x=188+r+random()*(644-r*2);let y=735-r-22*Math.pow((x-512)/320,2);for(const ball of balls){const dx=Math.abs(x-ball.x),distance=r+ball.r-1;if(dx<distance)y=Math.min(y,ball.y-Math.sqrt(distance*distance-dx*dx));}if(y<235+r)continue;if(!best||y>best.y)best={x,y};}if(best)balls.push({...best,r,color:Math.floor(random()*5)});}
 return balls.sort((a,b)=>a.y-b.y);
})();
