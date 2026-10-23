import {readFileSync,writeFileSync} from 'node:fs';
import {newGame,hardwareIds,buyHardwareClass,registerTap,startTraining,startResearchProject,newINTScientific,researchQuote,hardwareCostScientific,exactEconomyValue,computeRateScientific,BALANCE} from '../src/economy';
import {advanceTo} from '../src/simulation';
import {advanceTutorial} from '../src/story';
import {normalResetV2} from '../src/progressionReset';
import {ScientificNumber as S} from '../src/scientificNumber';
import {unityState} from './unity-prestige-wire';
import {UNITY_RESEARCH_IDS} from './unity-research-ids';
const start=1000000;let state=newGame(start,'unity-natural-prestige');state={...state,aiName:'AURA',story:{...state.story,target:'tap'}};const initial=unityState(state),actions:any[]=[],checks:any[]=[];
function act(kind:string,id='',at=state.savedAt){const before=state;if(kind==='advance')state=advanceTo(state,at).state;if(kind==='tap')state=registerTap(state,at);if(kind==='buy')state=buyHardwareClass(state,id as any);if(kind==='train')state=startTraining(state,id as any);if(kind==='research')state=startResearchProject(state,id as any);if(kind==='reset')state=normalResetV2(state);if(state!==before){state=advanceTutorial(state);actions.push({kind,id,at});}}
const research=UNITY_RESEARCH_IDS.filter(id=>id!=='blueprints'&&id!=='materialRecycling'&&id!=='labAutomation');
let seconds=0;
for(seconds=0;seconds<14400;seconds++){
 for(let tap=0;tap<3;tap++){const at=start+seconds*1000+tap*1000/3;act('advance','',at);act('tap','',at);}act('advance','',start+(seconds+1)*1000);
 const candidates=hardwareIds.map(id=>{const price=hardwareCostScientific(id,state.hardwareCounts[id],state);return{id,price,score:Math.log10(BALANCE.hardware[id].compute)-price.log10()}}).filter(c=>exactEconomyValue(state,'credits').compare(c.price)>=0).sort((a,b)=>b.score-a.score);if(candidates.length)act('buy',candidates[0].id);
 if(!state.activeTraining){const track=state.qualityLevel<=state.efficiencyLevel?'quality':'efficiency';act('train',track);}
 if(!state.researchLabs.some(Boolean))for(const id of research){const quote=researchQuote(state,id)!;if(quote.allowed&&state.researchLevels[id as keyof typeof state.researchLevels]<10){act('research',id);break;}}
 if((seconds+1)%60===0)checks.push({action:actions.length-1,state:unityState(state)});
 if(newINTScientific(state).compare(S.from(1))>=0){checks.push({action:actions.length-1,state:unityState(state)});act('reset');checks.push({action:actions.length-1,state:unityState(state)});break;}
}
if(!state.prestigeCount)throw Error('No natural first prestige within four hours');
const result={scope:'Fresh natural deterministic policy: default 50 credits, no grants, three accepted taps/second, one affordable best compute/base-price hardware purchase/second, lower Q/E training and existing research up to level 10. Accelerated elapsed-time simulation, not a wall-clock playthrough.',seconds:seconds+1,initial,actions,checks};
const json=JSON.stringify(result)+'\n',path='IdleIntelligence/Assets/IdleIntelligence/Tests/EditMode/NaturalPrestigeRun.json';if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==json){
const old=JSON.parse(readFileSync(path,'utf8')),changes:string[]=[];
const inspect=(a:any,b:any,p:string)=>{if(changes.length>=12||JSON.stringify(a)===JSON.stringify(b))return;if(a&&b&&typeof a==='object'&&typeof b==='object'){for(const key of new Set([...Object.keys(a),...Object.keys(b)]))inspect(a[key],b[key],p+'.'+key)}else changes.push(`${p}: ${JSON.stringify(a)} -> ${JSON.stringify(b)}`)};
inspect(old,result,'replay');console.error(changes.join('\n'));throw Error('Stale natural prestige replay')}
}else writeFileSync(path,json);console.log('Natural first prestige:',seconds+1,'seconds;',actions.length,'real paid/tap/time actions;',checks.length,'checkpoints');
