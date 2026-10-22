import {describe,it,expect} from 'vitest';
import {badgeTierForClaims,localBadgeShowcase,localProfileBadges,profileBadgeFamily} from './profileBadges';
describe('local visual badges never mint server rewards',()=>{
 it('uses 1/4/8 claimed milestones for bronze, silver and gold',()=>{
  expect([0,1,3,4,7,8,10].map(badgeTierForClaims)).toEqual([1,1,1,2,2,3,3]);
 });
 it('only shows eligible earned family badges',()=>{
  expect(localBadgeShowcase(['prestiges:0','prestiges:1','hack:99','hardware:0'])).toEqual([
   {achievementId:'prestiges',family:'prestige',tier:1,claims:2},
   {achievementId:'hardware',family:'hardware',tier:1,claims:1}
  ]);
 });
 it('rejects duplicate claims and fabricated unrecognized categories from presentation',()=>{
  expect(localProfileBadges(['prestiges:0','prestiges:0','prestiges:-1','prestiges:25','unknown:0'])[0]).toMatchObject({achievementId:'prestiges',claims:1});
  expect(localProfileBadges(['unknown:0','fake-input'])).toEqual([]);
 });
 it('limits showcase to three, without changing the source list',()=>{
  const claims=['prestiges:0','hardware:0','research:0','items:0'];
  expect(localBadgeShowcase(claims)).toHaveLength(3);
  expect(claims).toHaveLength(4);
  expect(profileBadgeFamily('challenge-stages')).toBe('challenge');
 });
});
