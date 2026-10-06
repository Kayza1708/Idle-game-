import { Worker } from 'node:worker_threads';
import { resolve } from 'node:path';
import type { BalanceSimulationResult, simulateBalance } from '../simulation';

export function runSimulationWorker(args:Parameters<typeof simulateBalance>,onStarted?:()=>void):Promise<BalanceSimulationResult>{
  return new Promise((resolveResult,reject)=>{
    const worker=new Worker(resolve(process.cwd(),'scripts/test-simulation-worker.mjs'),{
      workerData:{root:process.cwd(),args},
    });
    let settled=false;
    worker.on('message',(message:{phase?:string;result?:BalanceSimulationResult;error?:{message:string;stack?:string}})=>{
      if(message.phase==='simulation-start'){onStarted?.();return;}
      if(message.error){const error=new Error(message.error.message);error.stack=message.error.stack;reject(error);}
      else if(message.result)resolveResult(message.result);
      else reject(new Error('Simulation worker returned no result'));
      settled=true;
    });
    worker.on('error',error=>{settled=true;reject(error);});
    worker.on('exit',code=>{if(!settled)reject(new Error(`Simulation worker exited without a result (code ${code})`));});
  });
}
