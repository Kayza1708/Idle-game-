import {jwtVerify,createRemoteJWKSet} from 'jose';
import {normalizeModerationText} from './name-policy.mjs';
import {verifyPlayGamesCode} from './playgames-auth.mjs';

// Identity credentials are verified against provider JWKS and the configured
// first-party audience. No local save, name, e-mail or self-reported INT
// can establish server ownership. Never log identity tokens or raw subjects.
const jwks={
 apple:createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys')),
 google:createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'))
};
const issuers={apple:['https://appleid.apple.com'],google:['accounts.google.com','https://accounts.google.com']};
const tokenPattern=/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
export const identityMethods=Object.freeze(['apple','google']);
export const validChallenge=(v)=>typeof v==='string'&&/^[A-Za-z0-9_-]{43}$/.test(v);
export const allowedAudiences=(env,provider)=>{
 const raw=provider==='apple'?env.APPLE_CLIENT_IDS:env.GOOGLE_CLIENT_IDS;
 return typeof raw==='string'?raw.split(',').map(s=>s.trim()).filter(Boolean):[];
};
export async function nonceDigest(nonce){
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(nonce));
 return Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('');
}
export async function nonceClaim(nonce){
 const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(nonce)));
 return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
export async function verifyIdentityToken({provider,idToken,expectedNonce,env,now,verifier=jwtVerify}){
 if(!identityMethods.includes(provider))throw new Error('unknown_provider');
 const audiences=allowedAudiences(env,provider);
 if(!audiences.length||typeof env.IDENTITY_HASH_PEPPER!=='string'||env.IDENTITY_HASH_PEPPER.length<32)
  throw new Error('identity_provider_not_configured');
 if(typeof idToken!=='string'||idToken.length<64||idToken.length>6000||!tokenPattern.test(idToken))
  throw new Error('invalid_identity_token');
 const options={issuer:issuers[provider],audience:audiences,algorithms:['RS256'],clockTolerance:'30s',maxTokenAge:'10m'};
 const {payload}=await verifier(idToken,jwks[provider],options);
 if(!payload||typeof payload.sub!=='string'||payload.sub.length<3||payload.sub.length>256||
    !Number.isSafeInteger(payload.exp)||payload.exp<=now||
    !Number.isSafeInteger(payload.iat)||payload.iat>now+30||
    typeof payload.nonce!=='string'||payload.nonce!==expectedNonce)
  throw new Error('invalid_identity_claims');
 const subjectHash=await nonceDigest(provider+':'+payload.sub+':'+env.IDENTITY_HASH_PEPPER);
 return {provider,subjectHash};
}
async function readRequest(request,ApiError){
 const raw=await request.text();
 if(raw.length>8192)throw new ApiError(413,'payload_too_large');
 let value;
 try{value=JSON.parse(raw);}catch{throw new ApiError(400,'invalid_json');}
 if(!value||typeof value!=='object'||Array.isArray(value)||
    Object.keys(value).some(k=>!['challenge','idToken','serverAuthCode'].includes(k)))
  throw new ApiError(400,'invalid_auth_request');
 return value;
}
function rateKey(request){
 // Edge-only ephemeral key for rate limit; never persisted or returned.
 return request.headers.get('CF-Connecting-IP')||'missing-edge-ip';
}
async function limited(env,request,ApiError){
 if(!env.AUTH_RATE_LIMIT)throw new ApiError(503,'auth_rate_protection_unavailable');
 const result=await env.AUTH_RATE_LIMIT.limit({key:rateKey(request)});
 if(!result.success)throw new ApiError(429,'auth_rate_limited');
}
export async function identityRoute({request,path,method,env,db,now,reply,ApiError,newToken,digest,
  authenticated,verifier}){
 if(method==='POST'&&path==='/v1/auth/challenge'){
  await limited(env,request,ApiError);
  const challenge=newToken();
  const hash=await digest(challenge);
  await db.prepare('INSERT INTO auth_challenges(challenge_hash,created_at,expires_at) VALUES(?,?,?)')
    .bind(hash,now,now+300).run();
  return reply({challenge,nonceHash:await nonceClaim(challenge),expiresAt:now+300},201);
 }
 const route=/^\/v1\/auth\/(apple|google|playgames|link\/(apple|google|playgames))$/.exec(path);
 if(method!=='POST'||!route)return null;
 await limited(env,request,ApiError);
 const provider=route[2]||route[1],link=!!route[2];
 const requestData=await readRequest(request,ApiError);
 if(!validChallenge(requestData.challenge))throw new ApiError(400,'invalid_challenge');
 const current=link?await authenticated(request,db,now):null;
 const challengeHash=await digest(requestData.challenge);
 const active=await db.prepare(
  'SELECT challenge_hash FROM auth_challenges WHERE challenge_hash=? AND expires_at>? AND used=0'
 ).bind(challengeHash,now).first();
 if(!active)throw new ApiError(401,'challenge_expired_or_replayed');
 let identity;
 try{
  if(provider==='playgames'){
   if(typeof env.IDENTITY_HASH_PEPPER!=='string'||env.IDENTITY_HASH_PEPPER.length<32)
    throw new Error('identity_provider_not_configured');
   const subject=await verifyPlayGamesCode({authCode:requestData.serverAuthCode,env});
   identity={provider,subjectHash:await nonceDigest(
    'playgames:'+subject+':'+env.IDENTITY_HASH_PEPPER)};
  }else{
   identity=await verifyIdentityToken({provider,idToken:requestData.idToken,
    expectedNonce:await nonceClaim(requestData.challenge),env,now,verifier});
  }
 }catch(error){
  if(error.message==='identity_provider_not_configured')
   throw new ApiError(503,'identity_provider_not_configured');
  throw new ApiError(401,'identity_token_rejected');
 }
 // Atomic one-time nonce claim. A parallel valid login cannot consume it twice.
 const consumed=await db.prepare(
  'UPDATE auth_challenges SET used=1 WHERE challenge_hash=? AND expires_at>? AND used=0 RETURNING challenge_hash'
 ).bind(challengeHash,now).first();
 if(!consumed)throw new ApiError(401,'challenge_expired_or_replayed');
 const existing=await db.prepare('SELECT player_id FROM account_identities WHERE provider=? AND subject_hash=?')
   .bind(provider,identity.subjectHash).first();
 if(link){
  if(existing&&existing.player_id!==current.id)throw new ApiError(409,'identity_already_linked');
  const other=await db.prepare('SELECT subject_hash FROM account_identities WHERE provider=? AND player_id=?')
    .bind(provider,current.id).first();
  if(other&&other.subject_hash!==identity.subjectHash)throw new ApiError(409,'provider_already_linked');
  if(!existing){
   await db.prepare('INSERT INTO account_identities(provider,subject_hash,player_id,linked_at) VALUES(?,?,?,?)')
     .bind(provider,identity.subjectHash,current.id,now).run();
  }
  return reply({linked:true,provider,playerId:current.id,serverProgressVerified:false});
 }
 const playerId=existing?.player_id||crypto.randomUUID();
 const accessToken=newToken();
 const sessionHash=await digest(accessToken);
 if(!existing){
  const name='Agent-'+playerId.slice(0,8);
  // DB batch rolls back on conflicting provider identities/unique names.
  await db.batch([
   db.prepare('INSERT INTO players(id,display_name,name_key,created_at) VALUES(?,?,?,?)')
     .bind(playerId,name,normalizeModerationText(name),now),
   db.prepare('INSERT INTO account_identities(provider,subject_hash,player_id,linked_at) VALUES(?,?,?,?)')
     .bind(provider,identity.subjectHash,playerId,now),
   db.prepare('INSERT INTO sessions(token_hash,player_id,created_at,expires_at) VALUES(?,?,?,?)')
     .bind(sessionHash,playerId,now,now+30*86400)
  ]);
 }else{
  await db.prepare('INSERT INTO sessions(token_hash,player_id,created_at,expires_at) VALUES(?,?,?,?)')
    .bind(sessionHash,playerId,now,now+30*86400).run();
 }
 return reply({player:{id:playerId},provider,accessToken,
   expiresAt:now+30*86400,serverProgressVerified:false},existing?200:201);
}
