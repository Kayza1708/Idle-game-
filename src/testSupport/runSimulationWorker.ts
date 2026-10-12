import { Worker } from 'node:worker_threads';
import { resolve } from 'node:path';
import type { BalanceSimulationResult, simulateBalance } from '../simulation';

export function runSimulationWorker(args:Parameters<typeof simulateBalance>,onStarted?:()=>void,timeoutMs=30_000):Promise<BalanceSimulationResult>{
  if(!Number.isFinite(timeoutMs)||timeoutMs<=0)return Promise.reject(new Error('Simulation worker requires a positive finite budget'));
  return new Promise((resolveResult,reject)=>{
    const worker=new Worker(resolve(process.cwd(),'scripts/test-simulation-worker.mjs'),{
      workerData:{root:process.cwd(),args},
    });
    let settled=false;
    const finish=(error?:Error,result?:BalanceSimulationResult)=>{
      if(settled)return;
      settled=true;clearTimeout(budget);
      if(error)reject(error);else resolveResult(result!);
    };
    const budget=setTimeout(()=>{
      finish(new Error(`Simulation worker exceeded ${timeoutMs} ms budget`));
      void worker.terminate();
    },timeoutMs);
    worker.on('message',(message:{phase?:string;result?:BalanceSimulationResult;error?:{message:string;stack?:string}})=>{
      if(message.phase==='simulation-start'){onStarted?.();return;}
      if(message.error){const error=new Error(message.error.message);error.stack=message.error.stack;finish(error);}
      else if(message.result)finish(undefined,message.result);
      else finish(new Error('Simulation worker returned no result'));
    });
    worker.on('error',error=>finish(error instanceof Error?error:new Error(String(error))));
    worker.on('exit',code=>{if(!settled)finish(new Error(`Simulation worker exited without a result (code ${code})`));});
  });
}
