import {describe,expect,it} from 'vitest';
import {shouldSaveAfterAction} from './savePolicy';
describe('durable action boundaries',()=>{
 it.each(['profile-name','ai-name','save-import','language','number-format','toggle-effects','toggle-haptics','toggle-music','toggle-sfx','music-volume','sfx-volume','craft','item-fuse','prestige','v2-model-upgrade','shop-buy'])('immediately schedules durable state for %s',action=>expect(shouldSaveAfterAction(action)).toBe(true));
 it.each([undefined,'','menu-open','view-goal','foreground-tick','tap'])('leaves view and high-frequency updates to the existing autosave: %s',action=>expect(shouldSaveAfterAction(action)).toBe(false));
});
