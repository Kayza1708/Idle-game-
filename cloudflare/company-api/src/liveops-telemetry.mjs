// All telemetry is opt-in at the Unity client, allowlisted on the server,
// and never accepts arbitrary messages, raw crash logs, local balances or IDs.
// The Worker does not collect device identifiers or IP addresses into D1.
export const eventTypes=Object.freeze([
 'session_start','session_end','screen_view','first_purchase','training_complete',
 'research_complete','prestige','axiom_reset','item_craft','quest_claim',
 'ad_request','ad_reward','ad_failed','iap_attempt','iap_verified',
 'season_open','company_open','app_crash'
]);
const ids=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
export function validateTelemetryBatch(body){
 if(!body||!Array.isArray(body.events)||body.events.length<1||body.events.length>20||
   Object.keys(body).some(k=>k!=='events'))throw new RangeError('invalid_telemetry_batch');
 const used=new Set();
 return body.events.map(e=>{
  if(!e||typeof e!=='object'||Array.isArray(e)||
     Object.keys(e).some(k=>!['id','type','metric'].includes(k))||
     !ids.test(e.id)||!eventTypes.includes(e.type)||
     !Number.isSafeInteger(e.metric)||e.metric<0||e.metric>1000000000||
     used.has(e.id))throw new RangeError('invalid_telemetry_event');
  used.add(e.id);
  return {id:e.id,type:e.type,metric:e.metric};
 });
}
export async function publicLiveOps({db,now,reply}){
 const [settings,season]=await Promise.all([
  db.prepare('SELECT maintenance,min_client_version,bulletin,updated_at FROM liveops_state WHERE id=1').first(),
  db.prepare('SELECT id,label,starts_at,ends_at FROM liveops_seasons WHERE starts_at<=? AND ends_at>? ORDER BY starts_at DESC LIMIT 1')
    .bind(now,now).first()
 ]);
 return reply({serverTime:now,maintenance:settings?.maintenance===1,
  minClientVersion:settings?.min_client_version??1,bulletin:settings?.bulletin??'',
  season:season?{id:season.id,label:season.label,startsAt:season.starts_at,endsAt:season.ends_at}:null,
  rewardsAuthority:'server_policy_only',schema:1});
}
export async function ingestTelemetry({request,db,player,now,reply,ApiError,payload,env}){
 if(!env.TELEMETRY_RATE_LIMIT)throw new ApiError(503,'telemetry_rate_protection_unavailable');
 const permitted=await env.TELEMETRY_RATE_LIMIT.limit({key:player.id});
 if(!permitted.success)throw new ApiError(429,'telemetry_rate_limited');
 let events;
 try{events=validateTelemetryBatch(await payload(request));}
 catch(error){if(error instanceof RangeError)throw new ApiError(400,'invalid_telemetry');throw error;}
 let accepted=0,duplicates=0;
 for(const event of events){
  let result;
  try{
   result=await db.prepare(
    'INSERT OR IGNORE INTO analytics_events(event_id,player_id,event_type,metric,received_at) VALUES(?,?,?,?,?)'
   ).bind(event.id,player.id,event.type,event.metric,now).run();
  }catch(error){
   if(/telemetry_daily_limit/i.test(String(error)))throw new ApiError(429,'telemetry_daily_limit');
   throw error;
  }
  if((result.meta?.changes??result.changes??0)>0)accepted++;
  else duplicates++;
 }
 return reply({accepted,duplicates,serverTime:now});
}
// Explicit admin-only, aggregate-only read. No raw player/session IDs returned.
export async function adminTelemetry({request,db,now,env,reply,ApiError,digest}){
 if(typeof env.ANALYTICS_ADMIN_TOKEN!=='string'||env.ANALYTICS_ADMIN_TOKEN.length<32)
  throw new ApiError(503,'analytics_admin_disabled');
 const candidate=request.headers.get('authorization')||'';
 if(!/^Bearer [A-Za-z0-9_-]{32,128}$/.test(candidate)||
   await digest(candidate.slice(7))!==await digest(env.ANALYTICS_ADMIN_TOKEN))
  throw new ApiError(401,'admin_auth_required');
 const url=new URL(request.url),days=Number(url.searchParams.get('days')||7);
 if(!Number.isInteger(days)||days<1||days>30)throw new ApiError(400,'invalid_days');
 const since=now-days*86400;
 const [summary,perType,perDay]=await Promise.all([
  db.prepare('SELECT COUNT(*) AS events, COUNT(DISTINCT player_id) AS players FROM analytics_events WHERE received_at>=?')
    .bind(since).first(),
  db.prepare('SELECT event_type AS type,COUNT(*) AS count FROM analytics_events WHERE received_at>=? GROUP BY event_type ORDER BY count DESC')
    .bind(since).all(),
  db.prepare('SELECT CAST(received_at/86400 AS INTEGER) AS day,COUNT(DISTINCT player_id) AS active_players FROM analytics_events WHERE event_type=\'session_start\' AND received_at>=? GROUP BY day ORDER BY day')
    .bind(since).all()
 ]);
 return reply({windowDays:days,events:summary?.events??0,consentingPlayers:summary?.players??0,
  eventsByType:perType.results,uniqueSessionStartsByUtcDay:perDay.results,
  retentionNote:'D1/D7 cohort retention requires repeated consented session starts; do not infer retention from total installs.'});
}
