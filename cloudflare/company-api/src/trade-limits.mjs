// The immutable D1 migration enforces this policy in the same statement as escrow.
// Keep the public quote in sync with BALANCE.companyTradeDailyLimit (contract tested).
import {DAILY_TRADE_LIMIT} from './trade-policy.g.mjs';
export {DAILY_TRADE_LIMIT};
export async function tradeLimit(db,playerId,now){
 const day=Math.floor(now/86400);
 const row=await db.prepare('SELECT completed FROM player_trade_days WHERE player_id=? AND utc_day=?').bind(playerId,day).first();
 return {used:row?.completed??0,limit:DAILY_TRADE_LIMIT,resetAt:(day+1)*86400};
}
