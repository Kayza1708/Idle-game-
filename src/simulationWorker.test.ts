import {expect,it} from 'vitest';
import {simulateBalance} from './simulation';
import {runSimulationWorker} from './testSupport/runSimulationWorker';

it('keeps the control event loop responsive during actual simulation and preserves all domain results',async()=>{
  const args:Parameters<typeof simulateBalance>=[10/1440,true,1708,0,'training-first',[{start:0,end:600}],true];
  let timer:ReturnType<typeof setInterval>|undefined,heartbeats=0;
  try{
    const threaded=await runSimulationWorker(args,()=>{timer=setInterval(()=>heartbeats++,10);});
    expect(heartbeats).toBeGreaterThan(0);
    expect(threaded).toEqual(simulateBalance(...args));
  }finally{clearInterval(timer);}
},15_000);

 it('terminates a worker after its explicit wall-clock budget',async()=>{
   await expect(runSimulationWorker([0,true,1708],undefined,1)).rejects.toThrow('exceeded 1 ms budget');
 },5000);

it.each([0,-1,Infinity,NaN])('rejects invalid simulation budget %s without launching a worker',async budget=>{await expect(runSimulationWorker([0,true,1708],undefined,budget)).rejects.toThrow('positive finite budget');});
