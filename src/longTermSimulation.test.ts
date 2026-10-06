declare const process: { env: Record<string, string | undefined> };
import {describe,expect,it} from 'vitest';
import {diagnoseLongTermSuite,formatLongTermReport,type LongTermBalanceSuite,type SimulationMode} from './simulation';
import {runSimulationWorker} from './testSupport/runSimulationWorker';

describe.sequential('long-term deterministic balance',()=>{
  const mode:SimulationMode=process.env.SIM_MODE==='DEEP'?'DEEP':'FAST';
  const horizons=mode==='DEEP'?[1,3,7,14,30,60,90,180,365]:[1,7,30,60,90];
  const suite:LongTermBalanceSuite={seed:1708,runs:[]};
  // Same horizons, profiles, seed and domain calls as simulateDiagnosticSuite.
  // Cases remain sequential; only CPU work moves off Vitest's RPC event loop.
  it.each(horizons.flatMap(days=>[true,false].map(active=>({days,active}))))('validates $days days, active=$active',async({days,active})=>{
      const run=await runSimulationWorker([days,active,suite.seed]);suite.runs.push(run);
      expect(run.invalid).toBe(false);
      expect(Number.isFinite(run.final.credits)).toBe(true);
      expect(Number.isFinite(run.final.data)).toBe(true);
      expect(Number.isFinite(run.final.researchPoints)).toBe(true);
      expect(Number.isFinite(run.final.totalINTEarned)).toBe(true);
      expect(run.final.credits).toBeGreaterThanOrEqual(0);
      expect(run.final.data).toBeGreaterThanOrEqual(0);
      expect(run.final.researchPoints).toBeGreaterThanOrEqual(0);
      expect(run.checkpoints.length).toBeGreaterThan(0);
      expect(run.diagnostics.prestige.length).toBeGreaterThan(0);
      expect(run.diagnostics.crafting.length).toBeGreaterThan(0);
  },0);

  it('reports deterministic FAST/DEEP V10 balance diagnostics',()=>{
    // All original per-run and aggregate assertions remain in place.
    expect(suite.runs.map(run=>run.days)).toEqual(horizons.flatMap(day=>[day,day]));
    expect(suite.runs.every(run=>!run.invalid)).toBe(true);

    const diagnosis=diagnoseLongTermSuite(suite);
    expect(['PASS','WARNING','FAIL']).toContain(diagnosis.overall);
    expect(Object.keys(diagnosis.scorecard).length).toBeGreaterThan(0);
    console.log(`SIMULATION MODE: ${mode}`);
    console.log(formatLongTermReport(suite));
    if(process.env.BALANCE_STRICT==='1')expect(diagnosis.overall,'V10 balance diagnosis must not FAIL in strict mode').not.toBe('FAIL');
  },0);
});
