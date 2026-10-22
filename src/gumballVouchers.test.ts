import {describe,it,expect} from 'vitest';
import {BALANCE,newGame,type GameState} from './economy';
import {earnGumballVoucher,spendGumballVoucher,vouchersAvailable,validVoucherWallet} from './gumballVouchers';
import {capsuleQuote,drawVoucherCapsule} from './capsuleMachine';
import {claimSeasonReward,seasonProduct,getSeasonTiers} from './season';
import {restore,serialize} from './storage';
import {bonusBoxRoll} from './bonusBoxes';

describe('Gumball vouchers: earning, spending, storage',()=>{
 const unlocked=()=>({...newGame(0,'ticket-tests'),prestigeCount:1});
 it('starts with no vouchers and never awards one on login',()=>{
  const s=unlocked();expect(vouchersAvailable(s)).toBe(0);
  expect(capsuleQuote(s).voucherAllowed).toBe(false);
  expect(spendGumballVoucher(s)).toBe(s);
 });
 it('uses exactly one ticket and a normal Gumball prize with no Gem or ad debit',()=>{
  const s=earnGumballVoucher(unlocked());const n=drawVoucherCapsule(s,1,()=>.95);
  expect(n).not.toBe(s);expect(n.capsuleMachine.last?.payment).toBe('voucher');
  expect(n.gems).toBe(s.gems+n.capsuleMachine.last!.resource!.amount.m*10**n.capsuleMachine.last!.resource!.amount.e);
  expect(vouchersAvailable(n)).toBe(0);
  expect(n.ads).toEqual(s.ads);
  expect(drawVoucherCapsule(n,1)).toBe(n);
  expect(restore(serialize(n),0).state.vouchers).toEqual(n.vouchers);
 });
 it('does not pay or consume vouchers if Gumball feature is locked',()=>{
  const s=earnGumballVoucher(newGame(0,'ticket-locked'));
  expect(drawVoucherCapsule(s,1)).toBe(s);
  expect(vouchersAvailable(s)).toBe(1);
 });
 it('rejects dishonest counters and caps the local-only inventory',()=>{
  expect(validVoucherWallet({earned:0,spent:1})).toBe(false);
  expect(validVoucherWallet({earned:-1,spent:0})).toBe(false);
  expect(validVoucherWallet({earned:1.4,spent:0})).toBe(false);
  const s:GameState={...unlocked(),vouchers:{earned:999,spent:0}};
  expect(earnGumballVoucher(s)).toBe(s);
  expect(vouchersAvailable(spendGumballVoucher(s))).toBe(998);
 });
 it('gives exactly one additional voucher at sparse free/premium Season levels',()=>{
  const a=getSeasonTiers('season-01');
  expect(a.filter(x=>x.free.vouchers)).toHaveLength(1);
  expect(a.filter(x=>x.premium.vouchers)).toHaveLength(1);
  expect(a[29].free.vouchers).toBe(1);
  expect(a[39].premium.vouchers).toBe(1);
  let s:GameState={...unlocked(),season:{...unlocked().season,xp:50000}};
  const free=claimSeasonReward(s,30);
  expect(vouchersAvailable(free)).toBe(1);
  expect(claimSeasonReward(free,30)).toBe(free);
  const premiumReady={...free,commerce:{...free.commerce!,owned:[seasonProduct(free.season.id)]}};
  const premium=claimSeasonReward(premiumReady,40,'season-01','premium');
  expect(vouchersAvailable(premium)).toBe(2);
  expect(claimSeasonReward(premium,40,'season-01','premium')).toBe(premium);
 });
 it('makes low probability odds explicit and deterministic per draw/receipt',()=>{
  expect(BALANCE.gumballVouchers.chestChances).toEqual({common:.005,rare:.01,epic:.015,legendary:.02});
  expect(BALANCE.gumballVouchers.dailyBoxChance).toBe(.0025);
  const seed=bonusBoxRoll('ticket-tests','gumball-voucher:chest:2:free-common');
  expect(seed).toBe(bonusBoxRoll('ticket-tests','gumball-voucher:chest:2:free-common'));
 });
});
