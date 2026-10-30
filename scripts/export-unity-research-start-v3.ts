import {readFileSync,writeFileSync} from 'node:fs';
import {unityItemV3SourceHash} from './unity-item-v3-source';
import {UNITY_RESEARCH_IDS} from './unity-research-ids';
import {BALANCE,newGame,startResearchProject,researchLevel,queueResearchProject,type GameState,type ItemTypeId} from '../src/economy';
import {newItemSystemV3} from '../src/itemSystemV3';
import {createItem,equip} from '../src/inventory';
import {prepareProgressionWork,pauseMain} from '../src/progressionWork';
import {startManualResearchQueue,configureResearchRepeat,runResearchAutomation} from '../src/researchAutomation';
import {advanceTo,settleResearchCompletions} from '../src/simulation';
import {researchSkipQuote,buyResearchSkip} from '../src/commerce';
import {normalResetV2,axiomResetV2} from '../src/progressionReset';
import {ScientificNumber as S} from '../src/scientificNumber';
function prepared(mode:string):GameState{let s:GameState={...newGame(1000,'prepared-research-start-reference'),...(mode==='normal'?{}:{itemSystemV3:newItemSystemV3()}),credits:1e12,data:1e12,gems:10000,purchasedResearchLabs:3,nodes:['W06','F02','F03',...(mode==='maximum'?['W10']:[])],completedResearch:Object.keys(BALANCE.researchProjects) as GameState['completedResearch'],researchAccessIds:[...Object.keys(BALANCE.researchProjects),...Object.keys(BALANCE.repeatableResearch)] as GameState['researchAccessIds']};s={...s,exactEconomy:{...s.exactEconomy,credits:S.from(1e12).toJSON(),data:S.from(1e12).toJSON()},researchLevels:Object.fromEntries(Object.keys(s.researchLevels).map(id=>[id,1])) as GameState['researchLevels'],progression:{...s.progression,lab:true,models:{K10:0},active:'K10'},deviceProgress:{...s.deviceProgress,lastResearchArea:'model'}};const types:ItemTypeId[]=mode==='none'?[]:mode==='controller'?['experiment-controller']:mode==='protocol'?['protocol-controller']:mode==='pair'?['lab-drone','protocol-controller']:['lab-drone','protocol-controller','experiment-controller'];for(const type of types){s=createItem(s,type,mode==='maximum'?'mythic':'common');if(mode==='maximum')s={...s,inventory:s.inventory.map(i=>({...i,level:BALANCE.itemV3.levelMax,forge:BALANCE.itemV3.forgeMax}))};s=equip(s,s.inventory.at(-1)!.id);}if(mode==='unequipped')s={...s,equipped:{}};return s;}
function fund(s:GameState,pending:boolean){const cycle=S.from(1e12),total=S.fromJSON(s.exactEconomy.totalINTEarned).add(cycle.subtract(S.fromJSON(s.exactEconomy.cycleINTEarned))),free=cycle.subtract(S.fromJSON(s.exactEconomy.cycleINTEarned).subtract(S.fromJSON(s.exactEconomy.unspentINT)));return{...s,cycleINTEarned:cycle.toNumber(),prestigeEntitlementClaimed:cycle.toNumber(),totalINTEarned:total.toNumber(),unspentINT:free.toNumber(),exactEconomy:{...s.exactEconomy,cycleINTEarned:cycle.toJSON(),prestigeEntitlementClaimed:cycle.toJSON(),totalINTEarned:total.toJSON(),unspentINT:free.toJSON()},progression:{...s.progression,known:Object.keys(BALANCE.progression.nodes).slice(0,30),entitlement:cycle.multiplyNumber(pending?2:1).toJSON()},itemSystemV3:{...s.itemSystemV3!,axiomDiscovered:true,axiomDiscoveryAt:1000}};}
const number=(n:S)=>{const j=n.toJSON();return{m:j.m,e:j.e,terms:j.terms?.map(([index,value])=>({index,value}))??null};};
function flow(name:string,mode:string,actions:string[]){let s=prepared(mode);const steps=actions.map(action=>{const before=s;let allowed=true;
 if(action==='manual'||action==='automatic')s=startResearchProject(s,'dataGeneration',action);
 else if(action==='queue'){s=queueResearchProject(s,'dataGeneration');s=startManualResearchQueue(s);}
 else if(action==='repeat'){s=runResearchAutomation(configureResearchRepeat(s,'dataGeneration',100,true));s={...s,researchRepeat:{...s.researchRepeat,enabled:false}};}
 else if(action==='finish'){const ready=prepareProgressionWork(s),end=Math.max(s.savedAt,...ready.researchLabs.filter(Boolean).map(j=>j!.endsAt));s=advanceTo(ready,end+1,false,()=>.5).state;}
 else if(action==='age')s=advanceTo(s,s.savedAt+60000,false,()=>.5).state;
 else if(action==='half-second')s=advanceTo(s,s.savedAt+500,false,()=>.5).state;
 else if(action==='unequip')s={...s,equipped:{}};
 else if(action==='ready-work'){s=prepareProgressionWork(s);s={...s,progression:{...s.progression,work:Object.fromEntries(Object.entries(s.progression.work).map(([id,w])=>[id,{...w,done:w.required}]))}};}
 else if(action==='settle')s=settleResearchCompletions(s);
 else if(action==='pause')s=pauseMain(s,s.savedAt+10000);
 else if(action==='skip'){const q=researchSkipQuote(s,0);s=buyResearchSkip(s,0,q.job!,q.cost);allowed=s!==before;}
 else if(action==='poor')s={...s,data:0,exactEconomy:{...s.exactEconomy,data:S.zero().toJSON()}};
 else if(action==='prestige'||action==='axiom'){s=fund(s,action==='prestige');const ready=s;s=action==='prestige'?normalResetV2(s):axiomResetV2(s);allowed=s!==ready;if(!allowed)throw Error('Prepared reset must actually execute');}
 else throw Error(action);
 if(['manual','automatic','queue','repeat'].includes(action))allowed=s!==before;
 const current=prepareProgressionWork(s);return{action,allowed,same:s===before,at:s.savedAt,credits:number(S.fromJSON(s.exactEconomy.credits)),data:number(S.fromJSON(s.exactEconomy.data)),gems:s.gems,automaticCount:s.itemSystemV3?.automaticResearchStarts??0,prestiges:s.prestigeCount,axioms:s.axiomResetCount,levels:UNITY_RESEARCH_IDS.map(id=>researchLevel(s,id)),jobs:current.researchLabs.flatMap(j=>{if(!j)return[];const w=current.progression.work[j.jobId!],c=j.quoteBasis?.itemV3;return[{id:j.id,startedAt:j.startedAt,required:w.required,done:w.done,eventWork:w.eventWork??0,remaining:(j.endsAt-current.savedAt)/1000,version:c?.version??0,cause:c?.cause??'',previousArea:c?.previousArea??'',area:c?.area??'',minimumSeconds:c?.minimumSeconds??0,minimumUntil:c?.minimumUntil??0,startingFraction:c?.startingFraction??0,automaticOrdinal:c?.automaticOrdinal??0,bypassed:!!c?.minimumBypassed,completionCause:c?.completionCause??''}];})};});return{name,mode,prepared:true,steps};}
const flows=[];for(const mode of ['none','controller','protocol','pair','trio','maximum','normal','unequipped'])for(const action of ['manual','queue','repeat'])flows.push(flow(mode+'-'+action,mode,[action,'unequip','finish']));
flows.push(flow('four-paid-auto-starts','trio',['automatic','finish','automatic','finish','automatic','finish','automatic']));
for(const mode of ['protocol','trio','maximum'])flows.push(flow('minimum-floor-'+mode,mode,['automatic','ready-work','settle','unequip','pause','settle','half-second']));
flows.push(flow('paid-Gem-floor-skip','trio',['automatic','ready-work','skip','skip']));flows.push(flow('failed-start-no-counter','trio',['poor','automatic','automatic']));
for(const reset of ['prestige','axiom'])flows.push(flow('actual-counter-reset-'+reset,'trio',['age','automatic',reset]));
const path='IdleIntelligence/Assets/IdleIntelligence/Tests/EditMode/ItemV3ResearchStartCases.json',output=JSON.stringify({sourceHash:unityItemV3SourceHash(),prepared:true,productionEnabled:false,flows},null,2)+'\n';if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==output)throw Error('Stale research start references');}else writeFileSync(path,output);console.log('V3 research starts:',flows.length,'prepared actual paid and reset flows');
