import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {identityRoute,verifyIdentityToken,nonceClaim,nonceDigest,validChallenge} from '../src/identity-auth.mjs';
const now=1793350000,challenge='C'.repeat(43);
const env={APPLE_CLIENT_IDS:'com.example.idleintelligence',GOOGLE_CLIENT_IDS:'game-client.apps.googleusercontent.com',
 IDENTITY_HASH_PEPPER:'a-strong-server-only-pepper-for-unit-tests',
 AUTH_RATE_LIMIT:{async limit(){return {success:true};}}};
const digest=nonceDigest;
const token='e'.repeat(30)+'.'+'e'.repeat(30)+'.'+'e'.repeat(30);
function database(){
 const sql=new DatabaseSync(':memory:');
 sql.exec('PRAGMA foreign_keys=ON');
 const folder=new URL('../migrations/',import.meta.url);
 for(const name of readdirSync(folder).filter(x=>x.endsWith('.sql')).sort())
  sql.exec(readFileSync(new URL(name,folder),'utf8'));
 const db={
  prepare(q){const stmt=sql.prepare(q);let values=[];
   return {bind(...args){values=args;return this;},
    async first(){return stmt.get(...values)||null;},
    async run(){return stmt.run(...values);},
    async all(){return {results:stmt.all(...values)}}};
  },
  async batch(stmts){const out=[];sql.exec('BEGIN IMMEDIATE');try{
   for(const item of stmts)out.push(await item.run());sql.exec('COMMIT');return out;
  }catch(e){sql.exec('ROLLBACK');throw e;}}
 };
 return {sql,db};
}
const fakeVerifier=async(jwt,_keys,options)=>{assert.deepEqual(options.algorithms,['RS256']);
 assert.ok(options.audience.includes('com.example.idleintelligence'));
 return {payload:{sub:'apple-user-immutable-subject',iat:now-10,exp:now+600,
  nonce:await nonceClaim(challenge)}};
};
test('provider verification requires configured audience, strong pepper and exact nonce',async()=>{
 const identity=await verifyIdentityToken({provider:'apple',idToken:token,
  expectedNonce:await nonceClaim(challenge),env,now,verifier:fakeVerifier});
 assert.equal(identity.provider,'apple');assert.match(identity.subjectHash,/^[a-f0-9]{64}$/);
 await assert.rejects(verifyIdentityToken({provider:'apple',idToken:token,
  expectedNonce:'wrong',env,now,verifier:fakeVerifier}),/invalid_identity_claims/);
 await assert.rejects(verifyIdentityToken({provider:'apple',idToken:token,
  expectedNonce:'anything',env:{},now,verifier:fakeVerifier}),/identity_provider_not_configured/);
 assert.equal(validChallenge(challenge),true);
 assert.equal(validChallenge('../etc/passwd'),false);
});
test('one-time signed identity creates account, prevents replay and preserves identity on re-login',async()=>{
 const {sql,db}=database();
 try {
  let issued=0;
  const reply=(value,status=200)=>({value,status});
  const ApiError=class extends Error{constructor(status,code){super(code);this.status=status;this.code=code;}};
  const call=(path,body={})=>identityRoute({request:new Request('https://localhost'+path,{method:'POST',
     body:JSON.stringify(body),headers:{'CF-Connecting-IP':'127.0.0.1'}}),
    path,method:'POST',env,db,now,reply,ApiError,newToken:()=>issued++===0?challenge:'D'.repeat(43),
    digest,authenticated:async()=>{throw Error('requires account');},verifier:fakeVerifier});
  const requested=await call('/v1/auth/challenge');
  assert.equal(requested.status,201);assert.equal(requested.value.challenge,challenge);
  assert.equal(requested.value.nonceHash,await nonceClaim(challenge));
  const signed=await call('/v1/auth/apple',{challenge,idToken:token});
  assert.equal(signed.status,201);assert.equal(signed.value.serverProgressVerified,false);
  assert.equal(signed.value.accessToken.length,43);
  assert.equal(sql.prepare('SELECT count(*) AS n FROM players').get().n,1);
  assert.equal(sql.prepare('SELECT count(*) AS n FROM account_identities').get().n,1);
  await assert.rejects(call('/v1/auth/apple',{challenge,idToken:token}),/challenge_expired_or_replayed/);
  const other='D'.repeat(43);
  const second=await call('/v1/auth/apple',{challenge:other,idToken:token})
   .catch(e=>e);
  assert.equal(second.code,'challenge_expired_or_replayed'); // No unused challenge issued.
  assert.equal(sql.prepare('SELECT count(*) AS n FROM sessions').get().n,1);
 }finally{sql.close();}
});
