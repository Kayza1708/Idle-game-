import {describe,expect,it} from 'vitest';
import {BALANCE,newGame,exactEconomyValue,tapCreditsScientific} from './economy';
import {ScientificNumber} from './scientificNumber';
import {settleTap,tapPreview} from './tapInteraction';
import {createBalanceReport} from './balanceReport';
import {BUILD_VERSION} from './buildInfo';

describe('committed tap receipts',()=>{
 it('pays at zero hardware and retains a positive preview while the next input is throttled',()=>{
  const s=newGame(0),result=settleTap(s,0);expect(result.receipt?.credits.toNumber()).toBeGreaterThan(0);
  expect(tapCreditsScientific(result.state,0).isZero()).toBe(true);
  expect(tapPreview(result.state).toNumber()).toBeGreaterThan(0);
  expect(settleTap(result.state,199)).toEqual({state:result.state});
  expect(settleTap(result.state,BALANCE.progression.tapGap).receipt?.credits.toNumber()).toBeGreaterThan(0);
 });
 it('reports the actual credited amount, including deterministic critical taps and relay procs',()=>{
  let s=newGame(0);s={...s,hardware:82,hardwareCounts:{...s.hardwareCounts,calculator:50,sbc:25,pc:1,gpu:6},level:10,qualityLevel:6,efficiencyLevel:4,inventory:[{id:'relay',type:'impulse-relay',rarity:'uncommon',level:1,locked:false,forge:0,relayTaps:9}],equipped:{processor:'relay'},progression:{...s.progression,critRng:1972}};
  for(let n=0;n<50;n++){
   const now=n*333,quote=tapCreditsScientific(s,now),before=exactEconomyValue(s,'runCreditsEarned'),result=settleTap(s,now);
   expect(result.receipt!.credits.compare(quote)).toBe(0);expect(exactEconomyValue(result.state,'runCreditsEarned').subtract(before).compare(result.receipt!.credits)).toBe(0);s=result.state;
  }
 });
 it('retains tiny exact tap income against a much larger stored balance',()=>{
  let s=newGame(0);s={...s,credits:1e100,runCreditsEarned:1e100,exactEconomy:{...s.exactEconomy,credits:ScientificNumber.from(1e100).toJSON(),runCreditsEarned:ScientificNumber.from(1e100).toJSON()}};
  const result=settleTap(s,0);expect(result.receipt!.credits.toNumber()).toBeGreaterThan(0);expect(result.state.lifetime.taps).toBe(1);
 });
 it('returns no receipt and pays nothing during a no-taps challenge',()=>{
  const s={...newGame(0),retention:{...newGame(0).retention,activeRun:{id:'no-taps'} as any}};
  expect(tapPreview(s).isZero()).toBe(true);expect(settleTap(s,0)).toEqual({state:s});
 });
 it('exports the build and distinguishes input cooldown from next eligible income',()=>{
  const s=settleTap(newGame(0),0).state,report=createBalanceReport(s,0);
  expect(report.buildVersion).toBe(BUILD_VERSION);
  expect(report.tapDiagnostics).toMatchObject({reason:'cooldown',cooldownUntil:BALANCE.progression.tapGap,acceptedNowCredits:{m:0,e:0}});
  expect(ScientificNumber.fromJSON((report.tapDiagnostics as any).nextEligibleCredits).toNumber()).toBeGreaterThan(0);
 });
});
