/** Equal prepared account snapshots; real production/cost quotes, not natural progression or retention evidence. */
import {writeFileSync} from 'node:fs';
import {newGame,hardwareIds,addCredits,addData,creditRateScientific,tapCreditsScientific,trainingCostQuote,researchQuote,type GameState,type ItemTypeId} from '../src/economy';
import {createItem,equip} from '../src/inventory';
import {analysisQuote} from '../src/experiments';
const base=newGame(0,'prepared-three-build-comparison');
const common:GameState={...addData(addCredits(base,1e12,false),1e8),prestigeCount:1,unlockedEquipmentSlots:3,hardware:213,hardwareCounts:{...base.hardwareCounts,calculator:100,sbc:100,pc:10,gpu:1,rig:1,server:1},discovered:hardwareIds.slice(0,6),level:10,qualityLevel:5,efficiencyLevel:5,completedResearch:['blueprints','distributedInference'],researchLevels:{...base.researchLevels,dataGeneration:5,modelArchitecture:5,computeOptimization:5,userScaling:5},researchAccessIds:['dataGeneration','modelArchitecture','computeOptimization','userScaling'],deviceProgress:{qualityCompletions:5,efficiencyCompletions:5,lastTrack:'quality',lastResearchArea:null}};
const builds:Record<string,ItemTypeId[]>={burst:['impulse-relay','tensor-core','lab-drone'],infrastructure:['quantum-chip','tensor-core','long-term-memory'],materials:['legacy-controller','memory-crystal','field-scanner']};
const rows=Object.entries(builds).flatMap(([name,types])=>{
 let s=common;for(const type of types){s=createItem(s,type,'rare');s=equip(s,s.inventory.at(-1)!.id);}
 return [false,true].map(overclock=>{const state={...s,savedAt:3600000,overclock:{...s.overclock,activeUntil:overclock?3615000:0}},analysis=analysisQuote(state,'hardware','long');
 return {name,items:types,overclock,creditsPerSecond:creditRateScientific(state.hardware,state.level,state,state.savedAt).toJSON(),tap:tapCreditsScientific(state,state.savedAt).toJSON(),nextEfficiencyData:trainingCostQuote(state,'efficiency').cost.toJSON(),nextArchitectureSeconds:researchQuote(state,'modelArchitecture')!.duration,hardwareAnalysisSeconds:analysis.duration,hardwareAnalysisExpectedBaseComponents:analysis.rewards.components.whole,analysisCombination:analysis.additional.combinationFactor};});
});
writeFileSync('docs/challenge-correction-build-comparison.json',JSON.stringify({policy:'Equal explicitly prepared account/resources and three Rare level-0 Forge-0 items per build. Inactive/active Overclock quotes at one hour. No elapsed production, grants, natural unlock claims or dominance assertion.',rows},null,2)+'\n');
console.log(JSON.stringify(rows));
