import {describe,expect,it} from 'vitest';
import {simulateLongTermSuite} from './simulation';
describe('long-term deterministic balance',()=>{it('covers 7/30/90/180 day active and passive horizons without invalid numbers',()=>{const suite=simulateLongTermSuite(1708);expect(suite.runs.map(r=>r.days)).toEqual([7,7,30,30,90,90,180,180]);expect(suite.runs.every(r=>!r.invalid)).toBe(true);});});
