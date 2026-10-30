import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {validateTelemetryBatch,publicLiveOps,ingestTelemetry,adminTelemetry,eventTypes,onlineCohortRetention} from '../src/liveops-telemetry.mjs';
import {normalizeModerationText,validateName,containsBlockedName} from '../src/name-policy.mjs';
const player='11111111-1111-4111-8111-111111111111',now=1793350000;
const validId=(n)=>'f0000000-0000-4000-8000-'+n.toString().padStart(12,'0');
function fixture(){
 const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON');
 const folder=new URL('../migrations/',import.meta.url);
 for(const f of readdirSync(folder).filter(x=>x.endsWith('.sql')).sort())
  sql.exec(readFileSync(new URL(f,folder),'utf8'));
 sql.prepare('INSERT INTO players(id,display_name,created_at) VALUES(?,?,?)').run(player,'TestAgent',100);
 const db={prepare(query){
  const statement=sql.prepare(query);let params=[];
  return {bind(...args){params=args;return this;},
   async first(){return statement.get(...params)||null;},
   async all(){return {results:statement.all(...params)};},
   async run(){return statement.run(...params)}};
 }};
 const reply=(value,status=200)=>({value,status});
 const ApiError=class extends Error{constructor(status,code){super(code);this.status=status;this.code=code;}};
 const env={TELEMETRY_RATE_LIMIT:{async limit(){return{success:true}}},ANALYTICS_ADMIN_TOKEN:'a-long-admin-token-known-only-on-the-server'};
 const send=events=>ingestTelemetry({request:new Request('https://test.invalid/v1/analytics/events',{method:'POST',
  body:JSON.stringify({events})}),db,player:{id:player},now,reply,ApiError,
  payload:async req=>req.json(),env});
 return {sql,db,reply,ApiError,env,send};
}
test('Worker moderation policy is independent of the old TypeScript game',()=>{
 assert.ok(normalizeModerationText('N3UR4L'));
 assert.equal(validateName('Neural Labs').ok,true);
 assert.equal(containsBlockedName('h1tl3r'),true);
 assert.equal(validateName('x').ok,false);
});
test('Analytics accept only bounded numeric allowlisted events, no logs, identity or save JSON',()=>{
 assert.equal(eventTypes.length,18);
 assert.equal(validateTelemetryBatch({events:[{id:validId(1),type:'prestige',metric:1}]}).length,1);
 for(const event of [
  {id:validId(2),type:'game_cheat',metric:100},
  {id:validId(3),type:'prestige',metric:99999999999},
  {id:validId(4),type:'app_crash',metric:0,stack:'private trace'},
  {id:validId(5),type:'session_start',metric:0,email:'do-not-collect'}
 ])assert.throws(()=>validateTelemetryBatch({events:[event]}),/invalid_telemetry_event/);
 assert.throws(()=>validateTelemetryBatch({events:[{id:validId(1),type:'prestige',metric:1},
  {id:validId(1),type:'prestige',metric:1}]}),/invalid_telemetry_event/);
});
test('Telemetry receipt is idempotent, per-account limited and erased on account deletion',async()=>{
 const{sql,send}=fixture();
 try{
  assert.deepEqual((await send([{id:validId(1),type:'session_start',metric:0}])).value,
   {accepted:1,duplicates:0,serverTime:now});
  assert.equal((await send([{id:validId(1),type:'session_start',metric:0}])).value.duplicates,1);
  for(let n=2;n<=200;n++)await send([{id:validId(n),type:'screen_view',metric:0}]);
  await assert.rejects(send([{id:validId(201),type:'screen_view',metric:0}]),/telemetry_daily_limit/);
  assert.equal(sql.prepare('SELECT count(*) AS n FROM analytics_events').get().n,200);
  sql.prepare('DELETE FROM players WHERE id=?').run(player);
  assert.equal(sql.prepare('SELECT count(*) AS n FROM analytics_events').get().n,0);
 }finally{sql.close();}
});
test('LiveOps season and non-tracking aggregate dashboard use UTC from server only',async()=>{
 const{sql,db,reply,env,ApiError,send}=fixture();
 try{
  sql.prepare('INSERT INTO liveops_seasons(id,label,starts_at,ends_at) VALUES(?,?,?,?)')
    .run('test-2026-10','Season 1',now-3600,now+3600);
  const live=(await publicLiveOps({db,now,reply})).value;
  assert.equal(live.season.id,'test-2026-10');assert.equal(live.serverTime,now);
  assert.equal(live.maintenance,false);
  await send([{id:validId(91),type:'session_start',metric:0},
   {id:validId(92),type:'first_purchase',metric:1}]);
  const request=new Request('https://test.invalid/v1/admin/analytics?days=7',{headers:{
   Authorization:'Bearer '+env.ANALYTICS_ADMIN_TOKEN}});
  const digest=async s=>s;
  const result=(await adminTelemetry({request,db,now,env,reply,ApiError,digest})).value;
  assert.equal(result.events,2);assert.equal(result.consentingPlayers,1);
  assert.ok(!JSON.stringify(result).includes(player)); // never raw user-level data
  await assert.rejects(adminTelemetry({request:new Request('https://test.invalid/v1/admin/analytics'),
   db,now,env,reply,ApiError,digest}),/admin_auth_required/);
 }finally{sql.close();}
});

test('D1/D7 cohorts count only consented signup-day sessions after full UTC return days',async()=>{
 const {sql,db}=fixture();
 try{
  const day=Math.floor(now/86400);
  const register=(n,age)=>{
   const id='22222222-2222-4222-8222-'+n.toString().padStart(12,'0');
   const first=(day-age)*86400+100;
   sql.prepare('INSERT INTO players(id,display_name,created_at) VALUES(?,?,?)')
    .run(id,'Cohort-'+n,first);
   return {id,cohort:day-age};
  };
  const a=register(1,10),b=register(2,10),recent=register(3,2),
    immature=register(4,1),noConsent=register(5,10);
  let seq=1000;
  const event=(person,dayOffset)=>{
   const at=(person.cohort+dayOffset)*86400+200;
   sql.prepare('INSERT INTO analytics_events(event_id,player_id,event_type,metric,received_at) VALUES(?,?,?,?,?)')
    .run(validId(seq++),person.id,'session_start',0,at);
  };
  event(a,0);event(a,1);event(a,7);
  event(b,0);event(b,1);
  event(recent,0);
  event(immature,0); // next UTC day has not completed
  event(noConsent,1); // did not opt in on registration day
  const report=await onlineCohortRetention({db,now,days:21});
  assert.deepEqual(report.day1,{eligible:3,returned:2,rate:66.67});
  assert.deepEqual(report.day7,{eligible:2,returned:1,rate:50});
  assert.ok(report.definition.includes('Not install retention'));
  const short=await onlineCohortRetention({db,now,days:7});
  assert.deepEqual(short.day7,{eligible:0,returned:0,rate:null});
  // No individual user identity is exposed by the aggregate.
  assert.ok(!JSON.stringify(report).includes(a.id));
 }finally{sql.close();}
});
