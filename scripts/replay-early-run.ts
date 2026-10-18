import {writeFileSync} from 'node:fs';
import {earlyReportedState} from '../src/testSupport/earlyReportedState';
import {simulateEarlyBalance} from '../src/earlyBalanceSimulation';
const result=simulateEarlyBalance({style:'casual',horizonSeconds:7200,resetAtINT:1,maxResets:1,initial:earlyReportedState()});
writeFileSync(process.argv[2]??'/tmp/early-report-replay.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({firstINT:result.firstINT,firstReset:result.resets[0],invalid:result.invalid}));
