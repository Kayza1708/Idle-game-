import {describe,it,expect} from 'vitest';
import {newGame,BALANCE,creditRateScientific,exactEconomyValue,type GameState} from './economy';
import {newItemSystemV3} from './itemSystemV3';
import {prestigeCreditRateV3,prestigeCreditFactorV3,prestigeGainExponentV3} from './prestigeV3';
import {buyProgressionNode,normalResetV2,axiomResetV2} from './progressionReset';
import {prestigeV3Description} from './prestigeV3Copy';
import {languages} from './i18n';
import {ScientificNumber as S} from './scientificNumber';
const prepared=(INT:string,nodes:string[]=[]):GameState=>{const s=newGame(1000,'prepared-linear-INT');const value=S.fromString(INT);return{...s,itemSystemV3:newItemSystemV3(),nodes,hardware:1,hardwareCounts:{...s.hardwareCounts,calculator:1},cycleINTEarned:value.toNumber(),totalINTEarned:value.toNumber(),unspentINT:value.toNumber(),prestigeEntitlementClaimed:value.toNumber(),exactEconomy:{...s.exactEconomy,cycleINTEarned:value.toJSON(),totalINTEarned:value.toJSON(),unspentINT:value.toJSON(),prestigeEntitlementClaimed:value.toJSON()},progression:{...s.progression,entitlement:value.toJSON()}};};
describe('User-approved linear earned INT income',()=>{
 it('stacks 10/16/22 percent additively and stays scientific for huge INT',()=>{
  for(const [nodes,rate] of [[[],.10],[['I05'],.16],[['I10'],.16],[['I05','I10'],.22]] as const){for(const INT of ['0','1','10','100','1e1000']){const s=prepared(INT,[...nodes]);expect(prestigeCreditRateV3(s)).toBeCloseTo(rate,14);expect(prestigeCreditFactorV3(s).compare(S.from(1).add(S.fromString(INT).multiplyNumber(rate)))).toBe(0);const bare=prepared('0',[...nodes]);expect(creditRateScientific(s.hardware,s.level,s).divide(creditRateScientific(bare.hardware,bare.level,bare)).divide(prestigeCreditFactorV3(s)).toNumber()).toBeCloseTo(1,10);}}
  expect(prestigeCreditFactorV3(prepared('10')).toNumber()).toBe(2);expect(prestigeCreditFactorV3(prepared('100')).toNumber()).toBe(11);
 });
 it('keeps spent INT in the income ledger and preserves the I10 gain effect',()=>{
  const s=prepared('10000'),bought=buyProgressionNode(s,'I05');expect(bought).not.toBe(s);expect(exactEconomyValue(bought,'unspentINT').toNumber()).toBe(5000);expect(exactEconomyValue(bought,'cycleINTEarned').toNumber()).toBe(10000);expect(prestigeCreditFactorV3(bought).toNumber()).toBe(1601);
  expect(prestigeGainExponentV3(prepared('1',['I10']))).toBeCloseTo(BALANCE.progression.formula.intBaseExponent+BALANCE.prestigeV3.int.I10gain,14);
 });
 it('retains earned INT at real prestige and removes the income ledger only at real axiom reset',()=>{
  const initial=prepared('10000',['I05','I10']),normal=normalResetV2({...initial,progression:{...initial.progression,entitlement:S.from(10100).toJSON()}});expect(normal.prestigeCount).toBe(1);expect(exactEconomyValue(normal,'cycleINTEarned').toNumber()).toBe(10100);expect(prestigeCreditFactorV3(normal).toNumber()).toBeCloseTo(2223,10);
  const cycle=S.fromString('1e12').toJSON();const ready={...normal,cycleINTEarned:1e12,unspentINT:1e12,totalINTEarned:1e12,prestigeEntitlementClaimed:1e12,exactEconomy:{...normal.exactEconomy,cycleINTEarned:cycle,unspentINT:cycle,totalINTEarned:cycle,prestigeEntitlementClaimed:cycle},progression:{...normal.progression,entitlement:cycle,known:Object.keys(BALANCE.progression.nodes).slice(0,30)},itemSystemV3:{...normal.itemSystemV3!,axiomDiscovered:true,axiomDiscoveryAt:1000}};const reset=axiomResetV2(ready);expect(reset.axiomResetCount).toBe(1);expect(prestigeCreditFactorV3(reset).toNumber()).toBe(1);expect(exactEconomyValue(reset,'totalINTEarned').toNumber()).toBe(1e12);
 });
 it('uses explicit localized node text without silently changing pre-migration saves',()=>{
  for(const language of languages)for(const node of ['I05','I10']){const copy=prestigeV3Description(node,language)!;expect(copy).toContain('6');expect(copy).not.toContain('{');}
  const s=prepared('100');const old={...s,itemSystemV3:undefined};const baseOld={...prepared('0'),itemSystemV3:undefined};expect(creditRateScientific(old.hardware,old.level,old).divide(creditRateScientific(baseOld.hardware,baseOld.level,baseOld)).toNumber()).toBeCloseTo(101**.1,12);
 });
});
