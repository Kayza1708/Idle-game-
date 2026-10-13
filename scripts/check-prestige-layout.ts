import {prestigeLayout,prestigeMapScale,PRESTIGE_CANVAS} from '../src/prestigeTree';
const entries=Object.entries(prestigeLayout);let min=Infinity,pair:string[]=[];
for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++){const d=Math.hypot(entries[i][1].x-entries[j][1].x,entries[i][1].y-entries[j][1].y);if(d<min){min=d;pair=[entries[i][0],entries[j][0]]}}
const outside=entries.filter(([,p])=>p.x<44||p.y<44||p.x>PRESTIGE_CANVAS.width-44||p.y>PRESTIGE_CANVAS.height-44);
console.log(JSON.stringify({nodes:entries.length,minimumCenterDistance:min,closest:pair,outside:outside.map(([id])=>id),canvas:PRESTIGE_CANVAS}));
if(min<98||outside.length)process.exitCode=1;

for(const width of [340,370,410]){const scale=prestigeMapScale(Math.min((width-20)/PRESTIGE_CANVAS.width,310/PRESTIGE_CANVAS.height));if(PRESTIGE_CANVAS.width*scale>width-20+1e-6)throw new Error(`Fit exceeds ${width}px viewport`);}
