import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {newGame,type GameState} from '../src/economy';
import {changeQueuedPlan,queueSignature,type QueueKind,type QueueCommand} from '../src/queueControls';
const sourceHash=createHash('sha256').update(readFileSync('src/queueControls.ts')).digest('hex');
const cases:unknown[]=[];
const wire=(s:GameState)=>({training:s.trainingQueue.map(j=>({track:j.track,level:j.targetLevel})),research:s.researchQueue});
for(const kind of ['training','research'] as QueueKind[])for(const action of ['remove','earlier','later'] as QueueCommand['action'][])for(const index of [0,1,2]){
 const s:GameState={...newGame(1000),nodes:['T03','F02'],trainingQueue:[{track:'quality',targetLevel:1},{track:'efficiency',targetLevel:1}],researchQueue:['dataGeneration','computeOptimization','userScaling']};
 const signature=queueSignature(s,kind),after=changeQueuedPlan(s,{kind,signature,index,action});cases.push({name:`${kind}-${action}-${index}`,training:kind==='training',signature,index,action,before:wire(s),expected:wire(after),changed:s!==after});
}
const same:GameState={...newGame(1000),trainingQueue:[{track:'quality',targetLevel:1},{track:'quality',targetLevel:2}]};for(const action of ['earlier','remove'] as const){const signature=queueSignature(same,'training'),after=changeQueuedPlan(same,{kind:'training',signature,index:action==='earlier'?1:0,action});cases.push({name:'dependent-'+action,training:true,signature,index:action==='earlier'?1:0,action,before:wire(same),expected:wire(after),changed:same!==after});}
const path='IdleIntelligence/Assets/IdleIntelligence/Tests/EditMode/QueueControlCases.json',value=JSON.stringify({sourceHash,cases},null,2)+'\n';
if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==value)throw Error('Stale queue references');}else writeFileSync(path,value);
console.log(`Queue controls: ${cases.length} actual source cases (${sourceHash})`);
