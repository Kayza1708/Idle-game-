import {startRunChallenge,abortRunChallenge} from './retention';
import {describe,it,expect,vi} from 'vitest';
import {BALANCE,newGame,addCredits,addData,buyHardwareClass,itemEffectFor,specialItemEffectQuote,registerTap,tapCreditsScientific,creditRateScientific,exactEconomyValue,addCreditsScientific,intYieldFactor,axiomThresholdScientific,type GameState,type Item} from './economy';
import {createItem,equip,unequip,upgrade,forgeItem,itemImprovementPreview,fuseItems} from './inventory';
import {grantComponents as components} from './economy';
import {prestige,axiomReset} from './prestige';
import {advance} from './simulation';
import {restore,serialize} from './storage';
import {ScientificNumber} from './scientificNumber';
import {createBalanceReport} from './balanceReport';
import {specialItemComparisonText} from './specialItemText';
const fixture=(type:'impulse-relay'|'insight-archive')=>{let s=prestige(addCredits(newGame(0),BALANCE.prestigeBaseRevenue*9));s=buyHardwareClass(s,'calculator');s=createItem(s,type,'common');return equip(s,s.inventory.at(-1)!.id);};
const item=(s:GameState)=>s.inventory[0];
describe('canonical Relay/Archive special effects',()=>{
 it.each(['impulse-relay','insight-archive'] as const)('uses Common basis and one canonical quality/level/forge ratio for %s',type=>{
  const s=fixture(type),i=item(s),q=specialItemEffectQuote(s,i)!;expect(q.scale).toBe(1);expect(q.bonusSeconds).toBe(type==='impulse-relay'?2:0);expect(q.intWeightContribution).toBe(type==='insight-archive'?.25:0);
  for(const next of [{...i,rarity:'rare' as const},{...i,level:2},{...i,forge:3}]){const quote=specialItemEffectQuote(s,next)!;expect(quote.scale).toBeCloseTo(itemEffectFor(s,next,q.effect)/itemEffectFor(s,{...next,rarity:'common',level:0,forge:0},q.effect),12);expect(quote.scale).toBeGreaterThan(q.scale);}
  const amplified={...s,nodes:['manufacturing4','manufacturing8','analysis6','analysis7']},rare={...i,rarity:'legendary' as const};expect(specialItemEffectQuote(amplified,rare)!.scale).toBeCloseTo(itemEffectFor(amplified,rare,q.effect)/itemEffectFor(amplified,{...rare,rarity:'common',level:0,forge:0},q.effect),12);
 });
 it.each(['impulse-relay','insight-archive'] as const)('preview, real paid upgrade/forge and export agree for %s',type=>{
  let s=components(addData(fixture(type),1e6),{circuits:10000});for(const action of ['upgrade','forge'] as const){const before=s,quote=itemImprovementPreview(s,item(s).id,action)!,snapshot=JSON.stringify(s),random=vi.spyOn(Math,'random');const q=specialItemEffectQuote(s,quote.result);expect(JSON.stringify(s)).toBe(snapshot);expect(random).not.toHaveBeenCalled();random.mockRestore();s=action==='upgrade'?upgrade(s,item(s).id):forgeItem(s,item(s).id);expect(s).not.toBe(before);expect(s.componentInventory.circuits).toBe(before.componentInventory.circuits-quote.componentCost);expect(exactEconomyValue(s,'data').toNumber()).toBeCloseTo(exactEconomyValue(before,'data').toNumber()-quote.dataCost,6);expect(specialItemEffectQuote(s,item(s))).toEqual(q);expect(createBalanceReport(s,0).specialItemEffects[0].quote).toEqual(q);}
 });
 it('triggers only once on each tenth actually paid manual tap using the regular passive rate',()=>{
  let s=fixture('impulse-relay');for(let n=1;n<=20;n++){const before=s,base=tapCreditsScientific(s,s.savedAt),bonus=n%10===0?creditRateScientific(s.hardware,s.level,s,s.savedAt,false).multiplyNumber(specialItemEffectQuote(s,item(s))!.bonusSeconds):ScientificNumber.zero();s=registerTap(s,s.savedAt);expect(exactEconomyValue(s,'credits').subtract(exactEconomyValue(before,'credits')).toNumber()).toBeCloseTo(base.add(bonus).toNumber(),9);expect(item(s).relayTaps).toBe(n);}
 });
 it('does not trigger for unequipped/No-Items/No-Taps, autobuyers, offline or income bookings',()=>{
  const equipped=fixture('impulse-relay'),off=unequip(equipped,'processor');expect(item(registerTap(off,0)).relayTaps).toBe(0);
  for(const id of ['no-items','no-taps'] as const){const s={...equipped,retention:{...equipped.retention,activeRun:{id,startedAt:0} as GameState['retention']['activeRun']}};expect(item(registerTap(s,0)).relayTaps).toBe(0);expect(specialItemEffectQuote(s,item(s))!.active).toBe(id!=='no-items');}
  const auto={...equipped,nodes:['shoppingAgent'],hardwareAutoBuyers:{calculator:true}};expect(item(advance(auto,30,true,()=>.5).state).relayTaps).toBe(0);expect(item(advance(equipped,30,false,()=>.5).state).relayTaps).toBe(0);expect(item(addCredits(equipped,1000)).relayTaps).toBe(0);
 });
 it('Archive weights new eligible bookings only; swaps never revalue already booked or claimed INT',()=>{
  let s=fixture('insight-archive');const initial=exactEconomyValue(s,'cycleEligibleCredits'),delta=ScientificNumber.from(1000);s=addCreditsScientific(s,delta);expect(exactEconomyValue(s,'cycleEligibleCredits').subtract(initial).toNumber()).toBeCloseTo(1250,6);
  const before=s,off=unequip(s,'research');expect(exactEconomyValue(off,'cycleEligibleCredits').compare(exactEconomyValue(before,'cycleEligibleCredits'))).toBe(0);expect(off.exactEconomy.prestigeEntitlementClaimed).toEqual(before.exactEconomy.prestigeEntitlementClaimed);const after=addCreditsScientific(off,delta);expect(exactEconomyValue(after,'cycleEligibleCredits').subtract(exactEconomyValue(off,'cycleEligibleCredits')).toNumber()).toBeCloseTo(1000,6);expect(intYieldFactor({...s,retention:{...s.retention,activeRun:{id:'no-items'} as GameState['retention']['activeRun']}})).toBe(1);expect(addCreditsScientific(s,delta,false,false).exactEconomy.cycleEligibleCredits).toEqual(s.exactEconomy.cycleEligibleCredits);
 });
 it('paid Archive improvement changes only future weighting, never Credit/Data rates or existing revenue',()=>{
  let s=components(addData(fixture('insight-archive'),1e6),{circuits:10000});s=addCreditsScientific(s,ScientificNumber.from(1000));const before=s,after=upgrade(s,item(s).id);expect(after.exactEconomy.cycleEligibleCredits).toEqual(before.exactEconomy.cycleEligibleCredits);expect(after.exactEconomy.prestigeEntitlementClaimed).toEqual(before.exactEconomy.prestigeEntitlementClaimed);expect(creditRateScientific(after.hardware,after.level,after,after.savedAt).compare(creditRateScientific(before.hardware,before.level,before,before.savedAt))).toBe(0);const booked=addCreditsScientific(after,ScientificNumber.from(1000));expect(exactEconomyValue(booked,'cycleEligibleCredits').subtract(exactEconomyValue(after,'cycleEligibleCredits')).toNumber()).toBeCloseTo(1000*(1+specialItemEffectQuote(after,item(after))!.appliedIntWeightContribution),5);
 });
 it('real No-Items challenge and reload preserve isolated main effects and export contexts',()=>{
  const main=fixture('insight-archive'),challenge=startRunChallenge(main,'no-items');expect(challenge.inventory).toEqual([]);const loaded=restore(serialize(challenge),challenge.savedAt);expect(loaded.error).toBeUndefined();const report=createBalanceReport(loaded.state,0);expect(report.contexts[0].specialItems.items[0].quote?.active).toBe(true);expect(report.contexts[1].specialItems.items).toEqual([]);const returned=abortRunChallenge(loaded.state);expect(specialItemEffectQuote(returned,item(returned))?.active).toBe(true);
 });
 it('preserves instance counter and effects through reload and normal reset; Axiom loses only normal node effects',()=>{
  let s=fixture('impulse-relay');for(let n=0;n<9;n++)s=registerTap(s,0);const loaded=restore(serialize(s),0);expect(loaded.error).toBeUndefined();expect(item(registerTap(loaded.state,0)).relayTaps).toBe(10);const reset=prestige(addCredits(s,BALANCE.prestigeBaseRevenue*100));expect(item(reset).relayTaps).toBe(9);expect(specialItemEffectQuote(reset,item(reset))!.active).toBe(true);
  const threshold=axiomThresholdScientific(),ready={...reset,cycleINTEarned:threshold.toNumber(),exactEconomy:{...reset.exactEconomy,cycleINTEarned:threshold.toJSON()}};const axiom=axiomReset(ready);expect(item(axiom).relayTaps).toBe(9);expect(specialItemEffectQuote(axiom,item(axiom))!.active).toBe(true);
 });
 it('preserves fusion consumption and reset-to-level-zero result, protecting equipped instances',()=>{
  let s=fixture('impulse-relay');for(let n=0;n<2;n++)s=createItem(s,'impulse-relay','common');const ids=s.inventory.map(i=>i.id);expect(fuseItems(s,ids)).toBe(s);s=unequip(s,'processor');const out=fuseItems(s,ids);expect(out.inventory).toHaveLength(1);expect(item(out).rarity).toBe('uncommon');expect(item(out).level).toBe(0);expect(item(out).relayTaps).toBe(0);expect(specialItemEffectQuote(out,item(out))!.scale).toBeGreaterThan(1);
 });
 it('does not claim a hidden increase for an unchanged rounded quote',()=>{const s=fixture('impulse-relay'),i=item(s);expect(specialItemComparisonText(s,i,i)).not.toContain('kleiner Zuwachs');});
});
