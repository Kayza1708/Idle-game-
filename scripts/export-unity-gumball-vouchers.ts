import {readFileSync,writeFileSync} from 'node:fs';
import {BALANCE} from '../src/economy';
// Single source of balance truth: src/economy.ts. No independently edited C# odds.
const v=BALANCE.gumballVouchers;
const cs='// Generated from BALANCE.gumballVouchers in src/economy.ts.\n'+
'namespace IdleIntelligence.Core {public static class VoucherBalance {\n'+
'public const int MaxOwned='+v.maxOwned+';\n'+
'public const int SeasonFreeLevel='+v.seasonFreeLevel+',SeasonPremiumLevel='+v.seasonPremiumLevel+';\n'+
'public const double CommonChance='+v.chestChances.common+'d,RareChance='+v.chestChances.rare+
'd,EpicChance='+v.chestChances.epic+'d,LegendaryChance='+v.chestChances.legendary+
'd,DailyBoxChance='+v.dailyBoxChance+'d;\n}}\n';
const path='IdleIntelligence/Assets/IdleIntelligence/Core/VoucherBalance.g.cs';
if(process.argv.includes('--check')){
 if(readFileSync(path,'utf8')!==cs)throw Error('Stale Unity Gumball-voucher balance export');
}else writeFileSync(path,cs);
console.log('Unity Gumball-voucher balance export is synchronized with TypeScript');
