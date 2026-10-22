import assert from 'node:assert/strict';

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
const first=await http('POST','/v1/session/guest');
assert.equal(first.status,201);
assert.equal(first.body.accessToken.length,43);
const alice=first.body.accessToken;
assert.equal((await http('GET','/v1/me',alice)).status,200);
const create=await http('POST','/v1/companies',alice,{name:'Neural Labs',tag:'NLS'});
assert.equal(create.status,201,JSON.stringify(create.body));
const companyId=create.body.companyId;
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
assert.equal((await http('POST','/v1/companies/'+companyId+'/join',bob,{})).status,201);
assert.equal((await http('POST','/v1/companies/'+companyId+'/join',bob,{})).status,409);
assert.equal((await http('POST','/v1/company/leave',bob,{})).status,200);
assert.equal((await http('POST','/v1/company/leave',alice,{})).status,409);
const rank=await http('GET','/v1/leaderboards/companies',alice);
assert.equal(rank.status,200);
assert.equal(rank.body.companies[0].name,'Neural Labs');
const rotated=await http('POST','/v1/session/rotate',alice,{});
assert.equal(rotated.status,200);
assert.equal((await http('GET','/v1/me',alice)).status,401);
assert.equal((await http('GET','/v1/me',rotated.body.accessToken)).status,200);
console.log('Cloudflare Company API smoke tests passed');
