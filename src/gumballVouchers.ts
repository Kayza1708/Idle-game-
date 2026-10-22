import {BALANCE,type GameState} from './economy';

/** Non-transferable, local-only vouchers: one grants one regular Gumball pull. */
export type GumballVoucherWallet={earned:number;spent:number};
export const voucherWallet=(s:GameState):GumballVoucherWallet=>s.vouchers??{earned:0,spent:0};
export const vouchersAvailable=(s:GameState)=>voucherWallet(s).earned-voucherWallet(s).spent;
export function validVoucherWallet(wallet:unknown):wallet is GumballVoucherWallet {
 if(wallet===undefined)return true;const w=wallet as GumballVoucherWallet;
 return !!w&&Number.isSafeInteger(w.earned)&&Number.isSafeInteger(w.spent)&&
  w.earned>=0&&w.spent>=0&&w.earned>=w.spent&&w.earned-w.spent<=BALANCE.gumballVouchers.maxOwned;
}
export function earnGumballVoucher(s:GameState,amount=1):GameState {
 const wallet=voucherWallet(s);
 if(!Number.isSafeInteger(amount)||amount<1||!Number.isSafeInteger(wallet.earned+amount)||
     vouchersAvailable(s)+amount>BALANCE.gumballVouchers.maxOwned)return s;
 return {...s,vouchers:{earned:wallet.earned+amount,spent:wallet.spent}};
}
export function spendGumballVoucher(s:GameState):GameState{
 if(vouchersAvailable(s)<1)return s;
 const w=voucherWallet(s);
 return {...s,vouchers:{earned:w.earned,spent:w.spent+1}};
}
export function voucherChestChance(tier:keyof typeof BALANCE.gumballVouchers.chestChances){
 return BALANCE.gumballVouchers.chestChances[tier];
}
