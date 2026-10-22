import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
function provisionLocalTestAccount(playerId,founderGems=0){
  assert.match(playerId,/^[0-9a-f-]{36}$/i);
  // Local CI fixture only. There is intentionally no server HTTP endpoint to mint paid Gems.
  const sql="UPDATE players SET company_access_verified=1 WHERE id='"+playerId+"'; "+
    "UPDATE verified_gem_wallet SET balance="+founderGems+" WHERE player_id='"+playerId+"';";
  execFileSync('npx',['wrangler','d1','execute','idle-intelligence-companies','--local','--command',sql],
    {encoding:'utf8',timeout:45000});
}


const base='http://127.0.0.1:8787';
async function http(method,path,token,body) {
  const response=await fetch(base+path,{
    method,
    headers:{...(token?{Authorization:'Bearer '+token}:{}),...(body?{'Content-Type':'application/json'}:{})},
    body:body?JSON.stringify(body):undefined
  });
  return {status:response.status,body:await response.json()};
}
async function ready() {
  for(let attempt=0;attempt<40;attempt++){
    try{const health=await http('GET','/v1/health');if(health.status===200)return;}
    catch{}
    await new Promise(resolve=>setTimeout(resolve,500));
  }
  throw Error('Wrangler development Worker not ready');
}
await ready();
// Public leaderboards do not create accounts, sessions or personal data.
assert.equal((await http('GET','/v1/leaderboards/companies')).status,200);
assert.equal((await http('GET','/v1/leaderboards/companies?scope=monthly')).status,200);
assert.equal((await http('GET','/v1/leaderboards/players')).status,200);
assert.equal((await http('GET','/v1/companies?q=Neural')).status,200);
assert.equal((await http('POST','/v1/companies',null,{name:'Intruder',tag:'BAD'})).status,401);
const first=await http('POST','/v1/session/guest');
assert.equal(first.status,201);
assert.equal(first.body.accessToken.length,43);
const alice=first.body.accessToken;
assert.equal((await http('GET','/v1/me',alice)).status,200);
assert.equal((await http('GET','/v1/company/access',alice)).body.serverVerified,false);
assert.equal((await http('POST','/v1/companies',alice,{name:'Neural Labs',tag:'NLS'})).status,403);
provisionLocalTestAccount(first.body.player.id,500);
assert.equal((await http('GET','/v1/company/access',alice)).body.verifiedGemBalance,500);
assert.equal((await http('GET','/v1/names/check?name=Agent-'+first.body.player.id.slice(0,8),alice)).body.available,true);
assert.equal((await http('GET','/v1/names/check?name=h1tl3r',alice)).body.available,false);
const create=await http('POST','/v1/companies',alice,{name:'Neural Labs',tag:'NLS'});
assert.equal(create.status,201,JSON.stringify(create.body));
const companyId=create.body.companyId;
assert.equal((await http('GET','/v1/company/access',alice)).body.verifiedGemBalance,0);
assert.equal((await http('POST','/v1/companies',alice,{name:'Another Company',tag:'ACT'})).status,409);
const detail=await http('GET','/v1/company',alice);
assert.equal(detail.status,200);
assert.equal(detail.body.company.member_count,1);
assert.equal(detail.body.research.length,4);
assert.equal((await http('POST','/v1/company/research',alice,{nodeId:'computing'})).status,409);
const claim=await http('POST','/v1/company/claim',alice);
assert.equal(claim.status,200);
assert.equal(claim.body.contributedRP,0);
const second=await http('POST','/v1/session/guest');
assert.equal(second.status,201);
const bob=second.body.accessToken;
provisionLocalTestAccount(second.body.player.id,0);
assert.equal((await http('GET','/v1/leaderboards/companies?scope=monthly',bob)).status,200);
assert.equal((await http('POST','/v1/companies/'+companyId+'/join',bob,{})).status,201);
assert.equal((await http('POST','/v1/companies/'+companyId+'/join',bob,{})).status,409);
const profileId=first.body.player.id,bobId=second.body.player.id;
const privateProfile=await http('GET','/v1/profile',alice);
assert.equal(privateProfile.status,200,JSON.stringify(privateProfile.body));
assert.equal(privateProfile.body.privacy.int,false);
assert.ok(privateProfile.body.ownedFrames.includes('founder'));
const privatePublic=await http('GET','/v1/players/'+profileId+'/profile',bob);
assert.equal(privatePublic.status,200);
assert.deepEqual(privatePublic.body.stats,{});
assert.deepEqual(privatePublic.body.badges,[]);
assert.equal((await http('PUT','/v1/profile/showcase',alice,{badges:[{family:'company-founder',tier:1}]})).status,200);
assert.equal((await http('PATCH','/v1/profile/privacy',alice,{badges:true,int:true,rank:true})).status,200);
assert.equal((await http('POST','/v1/profile/frame',alice,{frameId:'founder'})).status,200);
assert.equal((await http('POST','/v1/profile/frame',bob,{frameId:'gold-lab'})).status,409);
const published=await http('GET','/v1/players/'+profileId+'/profile',bob);
assert.equal(published.body.badges.length,1);
const playerRanks=await http('GET','/v1/leaderboards/players',bob);
assert.equal(playerRanks.status,200);
assert.ok(playerRanks.body.players.some(p=>p.id===profileId));
const nameless=await http('GET','/v1/names/check?name=Neural%20Labs',bob);
assert.equal(nameless.status,200);
assert.equal(typeof published.body.stats.rank,'string');
assert.ok(Number(published.body.stats.rank)>=1);
assert.equal(published.body.stats.int,undefined); // Visibility cannot invent unverified personal INT.
assert.equal((await http('POST','/v1/trades/offers',alice,{
  give:{kind:'component',assetId:'graphene',quantity:5},
  want:{kind:'component',assetId:'quantumCores',quantity:1}
})).status,409); // Client inventory cannot be used to mint trade stock.
assert.equal((await http('GET','/v1/trades/offers',bob)).status,200);
const voucherAccount=await http('GET','/v1/vouchers/me',bob);
assert.equal(voucherAccount.status,200);
assert.equal(voucherAccount.body.verifiedBalance,0);
assert.equal(voucherAccount.body.localVouchersTransferable,false);
assert.equal((await http('GET','/v1/vouchers/offers',bob)).status,200);
assert.equal((await http('POST','/v1/vouchers/gifts',bob,{requestId:'00000000-0000-4000-8000-000000000001',recipientId:profileId,quantity:1})).status,409);
assert.equal((await http('POST','/v1/company/members/'+bobId+'/role',alice,{role:'executive'})).status,200);
assert.equal((await http('POST','/v1/company/members/'+profileId+'/kick',bob,{})).status,403);
assert.equal((await http('POST','/v1/company/leave',alice,{})).status,409);
assert.equal((await http('POST','/v1/company/leadership/transfer',alice,{playerId:bobId})).status,200);
assert.equal((await http('POST','/v1/company/leave',bob,{})).status,409);
const third=await http('POST','/v1/session/guest');
assert.equal(third.status,201);
const charlie=third.body.accessToken;
provisionLocalTestAccount(third.body.player.id,0);
const invitation=await http('POST','/v1/company/invitations',bob,{playerId:third.body.player.id});
assert.equal(invitation.status,201,JSON.stringify(invitation.body));
const charlieInvites=await http('GET','/v1/me/invitations',charlie);
assert.equal(charlieInvites.status,200);
assert.equal(charlieInvites.body.invitations.length,1);
assert.equal((await http('POST','/v1/me/invitations/'+invitation.body.invitationId+'/accept',charlie,{})).status,200);
assert.equal((await http('POST','/v1/me/invitations/'+invitation.body.invitationId+'/accept',charlie,{})).status,409);
assert.equal((await http('POST','/v1/company/leave',charlie,{})).status,200);
assert.equal((await http('POST','/v1/company/leave',alice,{})).status,200);
assert.equal((await http('POST','/v1/company/leave',alice,{})).status,409);
assert.equal((await http('GET','/v1/players/'+profileId+'/profile',bob)).status,200);
assert.equal((await http('POST','/v1/no-chat',bob,{})).status,404);
const rank=await http('GET','/v1/leaderboards/companies',alice);
assert.equal(rank.status,200);
assert.equal(rank.body.companies[0].name,'Neural Labs');
const rotated=await http('POST','/v1/session/rotate',alice,{});
assert.equal(rotated.status,200);
assert.equal((await http('GET','/v1/me',alice)).status,401);
assert.equal((await http('GET','/v1/me',rotated.body.accessToken)).status,200);
console.log('Cloudflare Company API smoke tests passed');
