import test from 'node:test';
import assert from 'node:assert/strict';
import {validatePrivacy,validateShowcase,maySetRole,mayKick,validateTradePart,PROFILE_FRAMES,BADGE_FAMILIES} from '../src/social-catalog.mjs';
test('privacy is opt-in and accepts only booleans',()=>{
 assert.deepEqual(validatePrivacy({int:true,maxCompute:false}),{int:true,maxCompute:false});
 assert.throws(()=>validatePrivacy({int:'yes'}));
 assert.throws(()=>validatePrivacy({email:true}));
});
test('display at most three valid earned-style bronze silver gold tiers',()=>{
 assert.equal(validateShowcase([{family:'company-founder',tier:1}]).length,1);
 assert.throws(()=>validateShowcase([{family:'company-founder',tier:3}]));
 assert.throws(()=>validateShowcase(Array(4).fill({family:'company-contributor',tier:1})));
 assert.ok(BADGE_FAMILIES.some(f=>f.id==='challenge'));
});
test('leadership power hierarchy',()=>{
 assert.equal(maySetRole('ceo','manager','executive'),true);
 assert.equal(maySetRole('executive','member','manager'),true);
 assert.equal(maySetRole('executive','executive','ceo'),false);
 assert.equal(maySetRole('manager','member','executive'),false);
 assert.equal(mayKick('manager','member'),true);
 assert.equal(mayKick('manager','executive'),false);
 assert.equal(mayKick('ceo','ceo'),false);
});
test('trade parts are fixed schema, not arbitrary messages',()=>{
 assert.deepEqual(validateTradePart({kind:'component',assetId:'graphene',quantity:10}),
   {kind:'component',assetId:'graphene',quantity:10});
 assert.throws(()=>validateTradePart({kind:'item',assetId:'rare',quantity:2}));
 assert.throws(()=>validateTradePart({kind:'gems',assetId:'gems',quantity:5}));
 assert.ok(PROFILE_FRAMES.some(f=>f.id==='neon'&&f.gemCost===60));
});
