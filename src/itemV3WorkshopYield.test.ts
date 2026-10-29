import {describe,it,expect} from 'vitest';
import {BALANCE,newGame,hardwareIds,componentIds,grantComponents,exactEconomyValue,type GameState} from './economy';
import {newItemSystemV3} from './itemSystemV3';
import {hardwareMaterialQuote,classUpgradePackageQuote} from './materialEconomy';
import {queueExperiment,completeExperiment,analysisQuote} from './experiments';
import {startSynthesis,fabricationSpeed} from './progressionWork';
import {advanceTo} from './simulation';
import {prestigeV3Description} from './prestigeV3Copy';
import {languages} from './i18n';
import {buyGemOffer} from './gemShop';
import {ScientificNumber as S} from './scientificNumber';
const prepared=(node=true):GameState=>{const s=newGame(1000,'prepared-v3-W08');return{...s,itemSystemV3:newItemSystemV3(),nodes:node?['W08']:[],gems:1000,data:1e12,exactEconomy:{...s.exactEconomy,data:S.from(1e12).toJSON()}};};
const total=(s:GameState)=>Object.values(s.experiments.lastResult!.components).reduce((n,v)=>n+(v??0),0);
function finish(s:GameState){return advanceTo(s,s.experiments.active!.endsAt+.01,false,()=>.5).state;}
describe('V3 workshop yield only from valid paid producers',()=>{
 it('freezes analysis yield when paid and keeps existing inputs and work unchanged',()=>{
  const base=queueExperiment(prepared(false),'hardware',1000,'short'),boost=queueExperiment(prepared(),'hardware',1000,'short');expect(boost.experiments.active!.combinationFactor).toBe(2);expect(boost.experiments.active!.progressionWorkRequired).toBe(base.experiments.active!.progressionWorkRequired);expect(exactEconomyValue(boost,'data').compare(exactEconomyValue(base,'data'))).toBe(0);expect(total(finish(boost))).toBe(2*total(finish(base)));expect(total(finish({...base,nodes:['W08']}))).toBe(total(finish(base)));expect(total(finish({...boost,nodes:[]}))).toBe(total(finish(boost)));expect(analysisQuote(prepared(),'hardware','short').additional.combinationFactor).toBe(2);
 });
 it('scales all regular milestone families before rounding without doubling old fraction balances',()=>{
  const base=prepared(false);base.materials={...base.materials,hardwareRemainders:Object.fromEntries(componentIds.map(id=>[id,.25])) as typeof base.materials.hardwareRemainders};
  for(const id of hardwareIds)for(const threshold of Object.keys(BALANCE.hardwareMaterialAmounts).map(Number)){const a=hardwareMaterialQuote(base,id,threshold),b=hardwareMaterialQuote({...base,nodes:['W08']},id,threshold);for(const component of componentIds){const original=(a.components[component]??0)+(a.remainders[component]??0),boost=(b.components[component]??0)+(b.remainders[component]??0);expect(boost,id+' '+threshold+' '+component).toBeCloseTo(original*2-.25,10);}}
  expect(base.materials.hardwareRemainders.circuits).toBe(.25);
 });
 it('excludes gifts, shop packs, synthesis and extra class-upgrade awards, and removes obsolete craft speed',()=>{
  const base=prepared(false),boost=prepared();expect(grantComponents(boost,{circuits:7}).componentInventory.circuits).toBe(7);expect(buyGemOffer(base,'materials-circuits').componentInventory).toEqual(buyGemOffer(boost,'materials-circuits').componentInventory);expect(classUpgradePackageQuote(base,'calculator').components).toEqual(classUpgradePackageQuote(boost,'calculator').components);
  const synthesis=startSynthesis(boost,'circuits');expect(synthesis.itemSystemV3!.synthesisContract!.multiplier).toBe(1);expect(fabricationSpeed(boost)).toBe(1);expect(fabricationSpeed({...boost,itemSystemV3:undefined})).toBe(BALANCE.progression.effects.W08);
 });
 it('refuses an analysis during actual paid synthesis without throwing or charging twice in either rule version',()=>{
  for(const v3 of [false,true]){const s=startSynthesis({...prepared(),...(v3?{}:{itemSystemV3:undefined})},'circuits'),refused=queueExperiment(s,'hardware',s.savedAt,'short');expect(refused.experiments.active).toBeNull();expect(refused.progression.synthesis).toEqual(s.progression.synthesis);expect(exactEconomyValue(refused,'data').compare(exactEconomyValue(s,'data'))).toBe(0);expect(completeExperiment(refused,refused.savedAt)).toBe(refused);}
 });
 it('uses shared seven-language descriptions instead of the old speed promise',()=>{
  for(const language of languages){const copy=prestigeV3Description('W08',language)!;expect(copy).toContain('×2');expect(copy).not.toContain('{');}
 });
});
