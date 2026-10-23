import {BALANCE} from '../src/economy';
import {readFileSync,writeFileSync} from 'node:fs';
const path='cloudflare/company-api/src/trade-policy.g.mjs';
const content='// Generated from BALANCE.companyTradeDailyLimit. Do not edit.\nexport const DAILY_TRADE_LIMIT='+BALANCE.companyTradeDailyLimit+';\n';
if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==content)throw Error('Stale company trade policy');}else writeFileSync(path,content);
