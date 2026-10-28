import {readFileSync,writeFileSync} from 'node:fs';
import {newGame,type GameState} from '../src/economy';
import {migratedStory,syncStory,openAnalysisGuide,dialogues} from '../src/story';
const scenarios=[
 {name:'locked queue',node:'',axiom:false,automatic:false,guide:'analysis-queue'},
 {name:'queue unlock',node:'F02',axiom:false,automatic:true,guide:''},
 {name:'repeat unlock',node:'F03',axiom:false,automatic:true,guide:''},
 {name:'axiom repeat unlock',node:'',axiom:true,automatic:true,guide:''},
 {name:'existing queue manual help',node:'F02',axiom:false,automatic:false,guide:'analysis-queue'},
 {name:'existing repeat manual help',node:'F03',axiom:false,automatic:false,guide:'analysis-repeat'},
 {name:'existing queue offline help',node:'F02',axiom:false,automatic:false,guide:'analysis-budget'},
 {name:'locked repeat despite queue',node:'F02',axiom:false,automatic:false,guide:'analysis-repeat'},
];
const rows=scenarios.map(row=>{let before:GameState={...newGame(1000000),aiName:'AURA',story:migratedStory()};let s:GameState={...before,nodes:row.node?[row.node as any]:[],axiomUpgradeLevels:{...before.axiomUpgradeLevels,...(row.axiom?{C02:1}:{})}};if(row.automatic)s=syncStory(before,s);if(row.guide)s=openAnalysisGuide(s,row.guide);return{...row,story:s.story,credits:s.credits,data:s.data,items:s.inventory.length,text:s.story.open?dialogues[s.story.open].text(s):''};});
const output=JSON.stringify({note:'Prepared ownership states test only guidance; no free rewards or purchase eligibility is inferred.',rows},null,2)+'\n';
const path='IdleIntelligence/Assets/IdleIntelligence/Tests/EditMode/AnalysisGuideReference.json';
if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==output)throw Error('Stale analysis guide references');}else writeFileSync(path,output);
console.log('Unity analysis guidance: '+rows.length+' source cases');
