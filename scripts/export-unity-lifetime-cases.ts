import {verifyReference} from './unity-reference-check';
import {readFileSync,writeFileSync} from 'node:fs';
import {BALANCE,newGame,addCreditsScientific,addDataScientific,grantComponents,componentIds,hardwareIds,buyHardwareClass,startTraining,startResearchProject,registerTap,type GameState} from '../src/economy';
import {advanceTo} from '../src/simulation';
import {discoverProgression} from '../src/progression';
import {createItem,craft,fuseItems,salvage} from '../src/inventory';
import {startSynthesis} from '../src/progressionWork';
import {queueForge} from '../src/foundries';
import {queueExperiment} from '../src/experiments';
import {prestige,axiomReset} from '../src/prestige';
import {startRunChallenge,abortRunChallenge} from '../src/retention';
import {ScientificNumber as S} from '../src/scientificNumber';
import {unityState} from './unity-prestige-wire';
const lifetime=(s:GameState)=>({schema:1,initialized:true,historicalUnavailable:false,since:0,...s.lifetime,discoveredComponents:s.discoveredComponents,runMilestoneClasses:s.runMilestoneClasses,hardwareMasteryXp:hardwareIds.map(id=>s.retention.hardwareMasteryXp[id]),analysesCompleted:s.experiments.completedIds.length});
const state=(s:GameState)=>{const d={...unityState(s),lifetime:lifetime(s)};if(s.challengeSession)d.challengeMain.lifetime=lifetime(s.challengeSession.main);return d;};
const cases:any[]=[];
function fresh(){let s=newGame(1000000);s=addCreditsScientific(s,S.fromString('1e80'),false);s=addDataScientific(s,S.fromString('1e60'));s=grantComponents(s,Object.fromEntries(componentIds.map(id=>[id,1e8])));s.completedResearch=Object.keys(BALANCE.researchProjects) as any;s=discoverProgression(s);s.learnedRecipes=Object.keys(BALANCE.itemRecipes) as any;s.impulseRelayBlueprint=true;s.modules={computeBus:100,dataLattice:100};s.materials.families=Object.keys(BALANCE.materialFamilies) as any;s.researchLevels.materialAnalysis=10;s.researchLevels.blueprintAnalysis=5;return s;}
function add(name:string,s:GameState,action:string,id='',amount=1,at=s.savedAt,active=false){let n=s;switch(action){case 'hardware':n=buyHardwareClass(s,id as any,amount);break;case 'train':n=startTraining(s,id as any);break;case 'research':n=startResearchProject(s,id as any);break;case 'tap':n=registerTap(s,at);break;case 'advance':n=advanceTo(s,at,active,()=>.99).state;break;case 'craft':n=craft(s,id as any);break;case 'fuse':n=fuseItems(s,s.inventory.slice(-3).map(i=>i.id));break;case 'salvage':n=salvage(s,id,()=>.99);break;case 'synthesis':n=startSynthesis(s,id as any);break;case 'forge':n=queueForge(s,0,id);break;case 'analysis':n=queueExperiment(s,'hardware',s.savedAt,'short');break;case 'reset':n=prestige(s);break;case 'axiom-reset':n=axiomReset(s);break;case 'start':n=startRunChallenge(s,'no-taps',1);if(n.retention.activeRun)n.retention.activeRun.runId='lifetime-test';break;case 'abort':n=abortRunChallenge(s);break;}
cases.push({name,action,id,amount,at,active,before:state(s),expected:lifetime(n),hasMain:!!n.challengeSession,main:n.challengeSession?lifetime(n.challengeSession.main):null});return n;}
let s=fresh();for(let i=0;i<hardwareIds.length;i++)s=add('hardware-'+hardwareIds[i],s,'hardware',hardwareIds[i],510);add('rejected-negative-hardware',s,'hardware','calculator',-1);add('additional-hardware-mastery',s,'hardware','calculator',250);
s=add('training-start',s,'train','quality');s=add('research-start',s,'research','dataGeneration');s=add('parallel-paid-work-offline',s,'advance','',1,s.savedAt+2000000);s=add('active-work',s,'advance','',1,s.savedAt+3000,true);add('duplicate-time',s,'advance','',1,s.savedAt,true);s=add('offline-does-not-count-active',s,'advance','',1,s.savedAt+3000,false);
s=add('tap-excludes-regular-income',s,'tap');add('tap-too-fast-rejected',s,'tap');
for(const track of ['quality','efficiency','integration']){let n=fresh();n.nodes=['T04'];n=add('training-'+track,n,'train',track);add('complete-'+track,n,'advance','',1,n.savedAt+2000000);}
for(const type of ['quantum-chip','neural-asic','impulse-relay']){let n=fresh();for(let k=0;k<3;k++)n=add('craft-'+type+'-'+k,n,'craft',type);n=add('fusion-'+type,n,'fuse');add('salvage-'+type,n,'salvage',n.inventory.at(-1)!.id);}
for(const component of componentIds){let n=add('synthesis-start-'+component,fresh(),'synthesis',component);add('synthesis-finish-'+component,n,'advance','',1,n.savedAt+8000000);}
let n=createItem(fresh(),'quantum-chip','common');n=add('forge-start',n,'forge',n.inventory[0].id);add('forge-finish',n,'advance','',1,n.savedAt+2000000);n=add('analysis-start',fresh(),'analysis');add('analysis-finish',n,'advance','',1,n.savedAt+2000000);
n=add('entry-hardware-acquired',fresh(),'hardware','sbc',1);n.progression.entitlement=S.from(1e20).toJSON();n=add('prestige-records-gain',n,'reset');add('axiom-keeps-history',n,'axiom-reset');n.prestigeCount=1;n.discovered=['calculator','sbc'];n=add('challenge-starter-local',n,'start');n=add('challenge-offline-main-paused',n,'advance','',1,n.savedAt+2000000);add('challenge-abort-restores-history',n,'abort');
let starter=newGame(1000000);starter=addCreditsScientific(starter,S.from(10000),false);starter=add('starter-buy',starter,'hardware','calculator');add('starter-gift-recorded',starter,'advance','',1,starter.savedAt+1000);
const text=JSON.stringify({scope:'Current TypeScript lifetime producers; funded technical cases, no fabricated pre-migration history',cases},null,2)+'\n',path='IdleIntelligence/Assets/IdleIntelligence/Tests/EditMode/LifetimeReferenceCases.json';if(process.argv.includes('--check')){verifyReference(path,text,'Stale lifetime reference cases');}else writeFileSync(path,text);console.log('Unity lifetime producer reference cases: '+cases.length);
