import {withChallengeAccess} from './testSupport/challengeAccount';
import progressionBaseline from './testSupport/progressionBaseline.json';
import {predecessorProjection} from './testSupport/protectedProgression';
import itemGrindBaseline from './testSupport/itemGrindBaseline.json';
import {createHash} from 'node:crypto';
import baseline from './testSupport/itemBuildsBaseline.json';
import {describe,it,expect,vi} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {BALANCE,newGame,addData,addCredits,computeRateScientific,usersRateScientific,creditRateScientific,dataRateScientific,dataBonusTerms,computeFactors,creditFactors,trainingCostQuote,trainingCombinationComparison,startTraining,exactEconomyValue,productionBreakdown,itemCombinationQuote,itemCombinationQuotes,itemCombinationBonus,itemEffectProfile,equippedBonus,type GameState,type ItemCombinationId,type ItemTypeId} from './economy';
import {createItem,equip,unequip,claimLootDrop} from './inventory';
import {queueExperiment,completeExperiment,analysisCombinationGrant} from './experiments';
import {advance} from './simulation';
import {restore,serialize,importGame,SAVE_VERSION} from './storage';
import {startRunChallenge,abortRunChallenge} from './retention';
import {balanceContexts,balanceEvents} from './balanceSnapshot';
import {createBalanceExportFiles} from './balanceReport';
import {ItemCombinations} from './ItemCombinations';
const ids=['parallel-architecture','learning-pipeline','material-mapping'] as const;
const pairs:Record<typeof ids[number],[ItemTypeId,ItemTypeId]>={'parallel-architecture':['quantum-chip','tensor-core'],'learning-pipeline':['photonic-array','logic-seed'],'material-mapping':['field-scanner','memory-crystal']};
const prepared=():GameState=>({...addCredits(addData(newGame(0,'9d-tests'),1e6),1e21),prestigeCount:1,purchasedEquipmentSlots:2,discovered:['calculator','sbc'],hardwareCounts:{...newGame(0).hardwareCounts,calculator:1},hardware:1});
const stocked=(id:typeof ids[number])=>pairs[id].reduce((s,type)=>createItem(s,type,'common'),prepared());
const complete=(s:GameState)=>s.inventory.reduce((state,item)=>equip(state,item.id),s);
const reload=(s:GameState)=>{const r=restore(serialize(s),s.savedAt);expect(r.error).toBeUndefined();return r.state;};
const ratio=(a:ReturnType<typeof computeRateScientific>,b:typeof a)=>a.divide(b).toNumber();
describe('9D central equipment build quote',()=>{
 it('preserves predecessor economic values and original build registry while catalogs expand',()=>{expect(predecessorProjection(BALANCE,progressionBaseline.parameters)).toEqual({...progressionBaseline.parameters,worldDropSeconds:90});});
 it('registers five stable unique IDs and retains existing combination values',()=>{expect(Object.keys(BALANCE.itemCombinations)).toEqual(['compute-credit-link','training-research-link',...ids]);expect(BALANCE.itemCombinations['compute-credit-link'].value).toBe(.08);expect(BALANCE.itemCombinations['training-research-link'].value).toBe(.12);});
 it.each(ids)('%s requires matching equipped instances in unlocked compatible slots, never mere inventory',id=>{
  const s=stocked(id),before=structuredClone(s),spy=vi.spyOn(Math,'random');expect(itemCombinationQuote(s,id).active).toBe(false);expect(itemCombinationQuote(s,id).missingEquipment).toHaveLength(2);expect(spy).not.toHaveBeenCalled();spy.mockRestore();expect(s).toEqual(before);
  const first=equip(s,s.inventory[0].id);expect(itemCombinationQuote(first,id).missingEquipment).toHaveLength(1);const active=complete(s);expect(itemCombinationQuote(active,id)).toMatchObject({active:true,missingEquipment:[],contribution:BALANCE.itemCombinations[id].value});
  const wrong={...active,equipped:{processor:active.equipped.core,core:active.equipped.processor,research:active.equipped.core}};expect(itemCombinationQuote(wrong,id).active).toBe(false);
  expect(itemCombinationQuote({...active,inventory:active.inventory.slice(0,1)},id).active).toBe(false);
  const noItems={...active,retention:{...active.retention,activeRun:{id:'no-items',runId:'fixture',startedAt:0,eligibleAtStart:{m:0,e:0}}}};expect(itemCombinationQuote(noItems,id)).toMatchObject({active:false,disabled:true,contribution:id==='learning-pipeline'?0:1});
  const upgraded={...active,inventory:active.inventory.map(item=>({...item,rarity:'legendary' as const,level:10,forge:20}))};expect(itemCombinationQuote(upgraded,id).contribution).toBe(BALANCE.itemCombinations[id].value);
  const duplicates=createItem(active,pairs[id][0],'common');expect(itemCombinationQuote(duplicates,id).contribution).toBe(BALANCE.itemCombinations[id].value);
 });
 it('retains original effect-based matching, including both effects on a single rare item',()=>{
  let credits=createItem(prepared(),'neural-asic','rare');credits=equip(credits,credits.inventory[0].id);expect(itemCombinationBonus(credits,'credits')).toBe(.08);expect(itemCombinationQuote(credits,'compute-credit-link').active).toBe(true);
  let research=createItem(createItem(prepared(),'photonic-array','common'),'lab-drone','common');research=complete(research);expect(itemCombinationBonus(research,'research')).toBe(.12);
  expect(itemEffectProfile(research.inventory[0])).toEqual(['training']);expect(itemEffectProfile(research.inventory[1])).toEqual(['research']);expect(equippedBonus(research,'research')).toBeGreaterThan(0);
  for(const s of [credits,research])for(const e of ['credits','research'] as const){const effects=Object.values(s.equipped).flatMap(id=>itemEffectProfile(s.inventory.find(i=>i.id===id)!)),old=e==='credits'&&effects.includes('compute')&&effects.includes('credits')?.08:e==='research'&&effects.includes('training')&&effects.includes('research')?.12:0;expect(itemCombinationBonus(s,e)).toBe(old);}
 });
});
describe('9D applied production and training',()=>{
 it('applies Compute x1.20 once on top of unchanged singles, and Users/Credits only follow the core loop',()=>{
  const inventory=stocked('parallel-architecture'),single=equip(inventory,inventory.inventory[0].id),pair=equip(single,single.inventory[1].id),q=itemCombinationQuote(pair,'parallel-architecture');
  const additiveRatio=computeFactors(pair).itemAndMilestoneAdditive/computeFactors(single).itemAndMilestoneAdditive;
  expect(ratio(computeRateScientific(pair.hardware,pair),computeRateScientific(single.hardware,single))).toBeCloseTo(additiveRatio*1.2,12);
  expect(ratio(usersRateScientific(pair),usersRateScientific(single))).toBeCloseTo(additiveRatio*1.2,12);
  expect(ratio(creditRateScientific(pair.hardware,pair.level,pair),creditRateScientific(single.hardware,single.level,single))).toBeCloseTo(additiveRatio*1.2,12);
  expect(dataBonusTerms(pair)).toEqual(dataBonusTerms(single));expect(creditFactors(pair).items.toJSON()).toEqual(creditFactors(single).items.toJSON());
  expect(computeRateScientific(pair.hardware,pair).toNumber()/baseline.compute.compute).toBeCloseTo(1.2,12);expect(usersRateScientific(pair).toNumber()/baseline.compute.users).toBeCloseTo(1.2,12);expect(creditRateScientific(pair.hardware,pair.level,pair).toNumber()/baseline.compute.credits).toBeCloseTo(1.2,12);
  expect(productionBreakdown(pair).factors.compute.itemCombination).toBe(q.contribution);expect(productionBreakdown(pair).itemCombinations).toEqual(itemCombinationQuotes(pair));
  for(const [k,v] of Object.entries(computeFactors(single)))if(!['itemCombination','itemAndMilestoneAdditive'].includes(k))expect(computeFactors(pair)[k as keyof ReturnType<typeof computeFactors>]).toEqual(v);
  const perClass=productionBreakdown(pair);expect(perClass.computeGlobal).toBeCloseTo(computeRateScientific(pair.hardware,pair).toNumber()/perClass.rawCompute,12);
 });
 it.each(['quality','efficiency'] as const)('adds exactly 0.50 to B and charges the rounded %s quote, with unchanged running costs/duration',track=>{
  const s=complete(stocked('learning-pipeline')),comparison=trainingCombinationComparison(s,track),quote=trainingCostQuote(s,track);expect(quote.bonusTotal-comparison.before.bonusTotal).toBeCloseTo(.5,12);expect(quote.sources['combination:learning-pipeline']).toBe(.5);expect(quote.factor).toBeCloseTo(1/(1+quote.bonusTotal),12);
  const started=startTraining(s,track);expect(ratio(exactEconomyValue(s,'data').subtract(exactEconomyValue(started,'data')),quote.cost)).toBeCloseTo(1,9);expect(started.activeTraining!.dataCostExact).toEqual(quote.cost.toJSON());expect(started.activeTraining!.costBasis!.bonusTotal).toBe(quote.bonusTotal);
  const swapped=unequip(started,'processor');expect(swapped.activeTraining).toEqual(started.activeTraining);expect(reload(swapped).activeTraining).toEqual(started.activeTraining);
  expect(startTraining(unequip(s,'processor'),track).activeTraining!.workRequired).toBe(started.activeTraining!.workRequired);
  const capped={...s,trainingBoostUntil:1000},c=trainingCombinationComparison(capped,track);expect(c.before.factor).toBe(.5);expect(c.after.factor).toBe(.5);expect(c.after.capped).toBe(true);expect(c.after.cost.toJSON()).toEqual(c.before.cost.toJSON());
 });
});
describe('9D analysis reward contract',()=>{
 it('rounds each positive final guaranteed component separately; zero and absent entries stay zero/absent',()=>{expect(analysisCombinationGrant({circuits:1,copperCoils:3,siliconWafers:4,graphene:7,quantumCores:0,ceramicCapacitors:0,ferriteCores:0,goldContacts:0,ceramicSubstrates:0,opticalFibers:0,thermalInterface:0,diamondSubstrates:0,spintronicDevices:0,photonicCircuits:0,cryogenicResonators:0},1.25)).toEqual({circuits:1,copperCoils:3,siliconWafers:5,graphene:8,quantumCores:0,ceramicCapacitors:0,ferriteCores:0,goldContacts:0,ceramicSubstrates:0,opticalFibers:0,thermalInterface:0,diamondSubstrates:0,spintronicDevices:0,photonicCircuits:0,cryogenicResonators:0});});
 it.each(['hardware','architecture','artifact'] as const)('freezes %s start factor; RNG calls, fragments, items and remainders are unchanged',type=>{
  const s=complete(stocked('material-mapping')),plain=unequip(s,'core'),a=queueExperiment(plain,type,0,'long'),b=queueExperiment(s,type,0,'long');expect(a.experiments.active!.combinationFactor).toBe(1);expect(b.experiments.active!.combinationFactor).toBe(1.25);
  const ra=vi.fn(()=>.25),rb=vi.fn(()=>.25),end=b.experiments.active!.endsAt,doneA=completeExperiment(a,end,ra),doneB=completeExperiment(unequip(b,'core'),end,rb);
  expect(doneB.experiments.lastResult!.components).toEqual(analysisCombinationGrant(doneA.experiments.lastResult!.components,1.25));expect(rb.mock.calls.length).toBe(ra.mock.calls.length);
  expect(doneB.blueprintFragments).toBe(doneA.blueprintFragments);expect(doneB.researchFragments).toBe(doneA.researchFragments);expect(doneB.componentRemainder).toBe(doneA.componentRemainder);expect(doneB.inventory).toEqual(doneA.inventory);
  const denied=queueExperiment(b,type==='hardware'?'artifact':'hardware',0,'short');expect(denied.experiments.active).toEqual(b.experiments.active);
 });
 it('preserves actual random item finds and passive hardware components',()=>{
  const pair=complete(stocked('material-mapping')),plain=unequip(pair,'research'),a=queueExperiment(plain,'artifact',0,'long'),b=queueExperiment(pair,'artifact',0,'long'),end=Math.max(a.experiments.active!.endsAt,b.experiments.active!.endsAt),ra=vi.fn(()=>.01),rb=vi.fn(()=>.01),da=completeExperiment(a,end,ra),db=completeExperiment(b,end,rb);expect(da.inventory).toHaveLength(3);expect(db.inventory).toEqual(da.inventory);expect(ra.mock.calls.length).toBe(rb.mock.calls.length);
  const passiveA=advance(plain,1800,false,()=>.25).state,passiveB=advance(pair,1800,false,()=>.25).state;expect(passiveB.componentInventory).toEqual(passiveA.componentInventory);expect(passiveB.componentInventory.circuits).toBeGreaterThan(0);
 });
 it('preserves the factor across reload and offline completion exactly once, also after equipment replacement',()=>{
  const s=complete(stocked('material-mapping')),started=queueExperiment(s,'hardware',0,'long'),swapped=unequip(started,'research'),loaded=reload(swapped);expect(loaded.experiments.active!.combinationFactor).toBe(1.25);
  const end=loaded.experiments.active!.endsAt,done=advance(loaded,end/1000,false,()=>.25).state;expect(done.experiments.lastResult!.components.circuits).toBe(56);expect(done.experiments.completedIds).toEqual([started.experiments.active!.id]);const again=reload(done);expect(completeExperiment(again,end,()=>.25)).toBe(again);
  const next=queueExperiment(again,'architecture',again.savedAt,'long');expect(next.experiments.active!.combinationFactor).toBe(1);
 });
 it('old jobs without a factor receive 1 even if the build is equipped later; malformed factors are protected',()=>{
  const pair=complete(stocked('material-mapping')),s=queueExperiment(unequip(pair,'core'),'hardware',0,'long');delete s.experiments.active!.combinationFactor;const later=equip(s,s.inventory[1].id),done=completeExperiment(reload(later),later.experiments.active!.endsAt,()=>.25);expect(done.experiments.lastResult!.components.circuits).toBe(45);
  for(const factor of [0,1.2,2,NaN,Infinity,'1.25',null]){const bad=structuredClone(s);bad.experiments.active!.combinationFactor=factor as number;expect(()=>importGame(JSON.stringify({version:SAVE_VERSION,state:bad}))).toThrow();}
 });
 it('does not boost independent world-drop draws or item rewards',()=>{
  const pair=complete(stocked('material-mapping')),plain=unequip(pair,'research'),drop={id:`drop-${pair.nextId}`,spawnedAt:0,expiresAt:10000,variant:'core' as const};
  const ready=(s:GameState)=>({...s,nextId:s.nextId+1,lootDrops:[drop]});const a=claimLootDrop(ready(plain),drop.id,()=>.01),b=claimLootDrop(ready(pair),drop.id,()=>.01);expect(b.componentInventory).toEqual(a.componentInventory);expect(b.inventory).toEqual(a.inventory);expect(b.inventory).toHaveLength(3);
 });
});
describe('9D contexts, disclosure and export',()=>{
 it('quotes and exports main/challenge independently, with No-Items disabling all three new builds',()=>{
  const main=complete(stocked('parallel-architecture')),challenge=startRunChallenge(withChallengeAccess(main),'no-items');expect(challenge.challengeSession).toBeDefined();expect(itemCombinationQuote(challenge,'parallel-architecture').active).toBe(false);expect(itemCombinationQuote(challenge.challengeSession!.main,'parallel-architecture').active).toBe(true);
  const contexts=balanceContexts(reload(challenge));expect(contexts[0].itemCombinations.find(q=>q.id==='parallel-architecture')!.contribution).toBe(1.2);expect(contexts[1].itemCombinations.find(q=>q.id==='parallel-architecture')!.contribution).toBe(1);expect(abortRunChallenge(reload(challenge)).equipped).toEqual(main.equipped);
  const exported=JSON.parse(createBalanceExportFiles(challenge,0)['economy.json']);expect(exported.itemCombinations).toEqual(BALANCE.itemCombinations);expect(exported.itemCombinationContexts[0].itemCombinations).toEqual(contexts[0].itemCombinations);
 });
 it('exports current quotes, future training prices, actual start factor and regular/final analysis quantities',()=>{
  const pair=complete(stocked('material-mapping')),started=queueExperiment(pair,'hardware',0,'long'),done=completeExperiment(started,started.experiments.active!.endsAt,()=>.25),files=createBalanceExportFiles(done,0);
  expect(files['analyses.csv']).toContain('combinationFactor');expect(files['analyses.csv']).toContain('regularComponents');expect(files['analyses.csv']).toContain('1.25');expect(balanceEvents(done).find(e=>e.type==='experiment-complete')!.details).toMatchObject({combinationFactor:1.25,regularComponents:'{"circuits":45}',components:'{"circuits":56}'});
 });
 it.each(['de','en'] as const)('renders existing/new combinations, compatible items, actual prices and cap in %s',language=>{
  const s={...complete(stocked('learning-pipeline')),settings:{...prepared().settings,language},trainingBoostUntil:1000};const html=renderToStaticMarkup(createElement(ItemCombinations,{s}));expect(html).toContain(language==='de'?'Kombinationen':'Combinations');expect(html).toContain('data-combination="learning-pipeline" data-active="true"');expect(html).toContain(language==='de'?'Rabattdeckel 50 % erreicht':'Discount cap 50% reached');expect(html).toContain(language==='de'?'Bei Analysestart festgelegt':'Fixed at analysis start');expect(html).toContain('compute-credit-link');expect(html).toContain('training-research-link');expect(html).toContain('item-art');
 });
});
