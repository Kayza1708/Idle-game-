import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyPlayGamesCode} from '../src/playgames-auth.mjs';
const env={GOOGLE_PLAY_GAMES_SERVER_CLIENT_ID:'1234.apps.googleusercontent.com',
 GOOGLE_PLAY_GAMES_SERVER_CLIENT_SECRET:'private-test-only-oauth-client-secret'};
const validCode='4/0AX4XfWserverOneTimeCode123456';
test('Play Games identity verified with server secret and Games REST, not client ID claim',async()=>{
 const seen=[];
 const fetcher=async (url,args)=>{
  seen.push({url,args});
  if(seen.length===1)return{ok:true,json:async()=>({
   access_token:'ya29.access-token-long-enough-to-test',
   token_type:'Bearer',expires_in:3600})};
  assert.equal(args.headers.authorization,'Bearer ya29.access-token-long-enough-to-test');
  return {ok:true,json:async()=>({playerId:'g1234567890'})};
 };
 const id=await verifyPlayGamesCode({authCode:validCode,env,fetcher});
 assert.equal(id,'g1234567890');
 assert.equal(seen[0].url,'https://oauth2.googleapis.com/token');
 assert.equal(seen[1].url,'https://www.googleapis.com/games/v1/players/me');
 const params=new URLSearchParams(seen[0].args.body);
 assert.equal(params.get('client_secret'),env.GOOGLE_PLAY_GAMES_SERVER_CLIENT_SECRET);
 assert.equal(params.get('code'),validCode);
 assert.equal(params.get('redirect_uri'),'');
 assert.equal(seen[0].args.redirect,'error');
});
test('Play Games auth rejects missing secret, auth-code replay and user-controlled player identity',async()=>{
 await assert.rejects(verifyPlayGamesCode({authCode:validCode,env:{}}),/not_configured/);
 await assert.rejects(verifyPlayGamesCode({authCode:'../../fake',env,fetcher:()=>{throw Error('bad');}}),/invalid_play_games_auth_code/);
 await assert.rejects(verifyPlayGamesCode({authCode:validCode,env,
  fetcher:async()=>({ok:false})}),/play_games_code_rejected/);
 let calls=0;
 await assert.rejects(verifyPlayGamesCode({authCode:validCode,env,
  fetcher:async()=>++calls===1?
   {ok:true,json:async()=>({access_token:'ya29.access-token-long-enough-to-test',token_type:'Bearer',expires_in:3600})}:
   {ok:true,json:async()=>({playerId:'fake/attacker'})}}),/invalid_play_games_identity/);
});
