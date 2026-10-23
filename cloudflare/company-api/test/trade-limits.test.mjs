import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {tradeLimit,DAILY_TRADE_LIMIT} from '../src/trade-limits.mjs';
test('quota uses authenticated player and server UTC day, never local client time',async()=>{
 let values;
 const db={prepare(sql){assert.match(sql,/player_trade_days/);return{bind(...args){values=args;return{first:async()=>({completed:3})}}}}};
 assert.deepEqual(await tradeLimit(db,'verified-player',259199),{used:3,limit:5,resetAt:259200});assert.deepEqual(values,['verified-player',2]);
 assert.equal(DAILY_TRADE_LIMIT,5);
 const source=readFileSync(new URL('../../../src/economy.ts',import.meta.url),'utf8');assert.match(source,/companyTradeDailyLimit:\s*5/);
 const migration=readFileSync(new URL('../migrations/0009_daily_trade_limit.sql',import.meta.url),'utf8');assert.match(migration,/completed BETWEEN 0 AND 5/);
});
test('no history gives a fresh allowance only for that day',async()=>{
 const db={prepare(){return{bind(){return{first:async()=>null}}}}};assert.deepEqual(await tradeLimit(db,'p',259200),{used:0,limit:5,resetAt:345600});
});
