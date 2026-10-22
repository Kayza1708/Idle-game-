import test from 'node:test';
import assert from 'node:assert/strict';
import {claimAmount,researchCost,researchBonuses,validateCompanyInput,validCompanyId,MAX_MEMBERS} from '../src/rules.mjs';
test('equal player RP and tokens regardless of main game',()=>assert.deepEqual(claimAmount(7200,0),{hours:2,rp:200,tokens:20}));
test('offline cap and clock backwards',()=>{
  assert.deepEqual(claimAmount(200000,0),{hours:24,rp:2400,tokens:240});
  assert.deepEqual(claimAmount(1000,2000),{hours:0,rp:0,tokens:0});
  assert.deepEqual(claimAmount(3599,0),{hours:0,rp:0,tokens:0});
});
test('research is bounded',()=>{
  assert.equal(researchCost(1),1000);assert.equal(researchCost(10),100000);
  assert.throws(()=>researchCost(11));
});
test('research bonuses capped',()=>assert.deepEqual(researchBonuses({computing:10,research:1,drops:25,infrastructure:0}),{credits:1.2,research:1.02,drops:1.2,companyRp:1}));
test('names and IDs validated',()=>{
  assert.deepEqual(validateCompanyInput({name:' Neural Labs  ',tag:' ai5 '}),{name:'Neural Labs',tag:'AI5'});
  assert.throws(()=>validateCompanyInput({name:'x',tag:'AI'}));
  assert.equal(MAX_MEMBERS,50);
  assert.equal(validCompanyId('f976c831-8071-4e37-8918-6c9758bcff35'),true);
  assert.equal(validCompanyId('bad'),false);
});
