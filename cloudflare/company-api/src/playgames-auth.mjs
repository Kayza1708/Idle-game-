// Google Play Games Services v2/v11 authenticates a Player ID using a
// single-use server authorization code. An Android package identity or
// a locally reported Games ID is NEVER sufficient. This route is separate
// from Google's OpenID JWT login (different credentials and verification).
const validCode=v=>typeof v==='string'&&v.length>=10&&v.length<=4096&&
 /^[A-Za-z0-9_.\/~+-]+$/.test(v);
export async function verifyPlayGamesCode({authCode,env,fetcher=fetch}){
 const clientId=env.GOOGLE_PLAY_GAMES_SERVER_CLIENT_ID;
 const clientSecret=env.GOOGLE_PLAY_GAMES_SERVER_CLIENT_SECRET;
 if(typeof clientId!=='string'||!clientId.endsWith('.apps.googleusercontent.com')||
    typeof clientSecret!=='string'||clientSecret.length<16)
   throw new Error('play_games_server_not_configured');
 if(!validCode(authCode))throw new Error('invalid_play_games_auth_code');
 const form=new URLSearchParams({client_id:clientId,client_secret:clientSecret,
  code:authCode,grant_type:'authorization_code',redirect_uri:''});
 const response=await fetcher('https://oauth2.googleapis.com/token',{
  method:'POST',
  headers:{'content-type':'application/x-www-form-urlencoded',
   'cache-control':'no-store'},body:form.toString(),redirect:'error'
 });
 if(!response.ok)throw new Error('play_games_code_rejected');
 const token=await response.json();
 if(typeof token.access_token!=='string'||token.access_token.length<20||
    token.token_type?.toLowerCase()!=='bearer'||!Number.isFinite(token.expires_in)||
    token.expires_in<=0)throw new Error('invalid_google_oauth_token');
 const identity=await fetcher('https://www.googleapis.com/games/v1/players/me',{
  method:'GET',headers:{authorization:'Bearer '+token.access_token,
   accept:'application/json'},redirect:'error'
 });
 if(!identity.ok)throw new Error('play_games_player_not_verified');
 const player=await identity.json();
 if(typeof player.playerId!=='string'||player.playerId.length<3||player.playerId.length>256||
    !/^[A-Za-z0-9_-]+$/.test(player.playerId))
  throw new Error('invalid_play_games_identity');
 // OAuth access tokens, refresh tokens and raw Player IDs are not persisted.
 return player.playerId;
}
