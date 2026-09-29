declare const process: { env: Record<string, string | undefined> };
import {describe,expect,it} from 'vitest';
import {diagnoseLongTermSuite,formatLongTermReport,simulateDiagnosticSuite,SimulationMode} from './simulation';

describe('long-term deterministic balance',()=>{
  it('runs deterministic FAST/DEEP V10 balance diagnostics',()=>{
    const mode:SimulationMode=process.env.SIM_MODE==='DEEP'?'DEEP':'FAST';
    const suite=simulateDiagnosticSuite(mode,1708);
    const horizons=mode==='DEEP'?[1,3,7,14,30,60,90,180,365]:[1,7,30,60,90];

    // Technical validity is asserted. Balance failures are reported, not thrown.
    expect(suite.runs.map(run=>run.days)).toEqual(horizons.flatMap(day=>[day,day]));
    expect(suite.runs.every(run=>!run.invalid)).toBe(true);
    for(const run of suite.runs){
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
    }

    const diagnosis=diagnoseLongTermSuite(suite);
    expect(['PASS','WARNING','FAIL']).toContain(diagnosis.overall);
    expect(Object.keys(diagnosis.scorecard).length).toBeGreaterThan(0);
    console.log(`SIMULATION MODE: ${mode}`);
    console.log(formatLongTermReport(suite));
    if(process.env.BALANCE_STRICT==='1')expect(diagnosis.overall,'V10 balance diagnosis must not FAIL in strict mode').not.toBe('FAIL');
  },0);
});
