import {it,expect} from 'vitest';
import {BALANCE} from './economy';
it('protects the current first research and analysis base prices',()=>{expect(BALANCE.researchCategories.data.baseData).toBe(363);expect(BALANCE.analysisCosts.hardware.short.data).toBe(250);});
