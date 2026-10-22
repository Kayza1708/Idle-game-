import {MAX_MEMBERS,RESEARCH_NODES,researchBonuses,researchCost,validateCompanyInput,validCompanyId} from './rules.mjs';
import {socialRoute} from './social.mjs';
import {validateName,validatePlayerName,normalizeModerationText,containsBlockedName} from '../../../src/namePolicy.ts';
import {vouchersRoute} from './vouchers.mjs';

// Public read routes deliberately expose no private inventory, gems or session identifiers.
// This is a guest-account MVP. Apple/Google account linking is required before commercial release.
class ApiError extends Error {
  constructor(status,code,message=code){super(message);this.status=status;this.code=code;}
}
function reply(value,status=200) {
  return new Response(JSON.stringify(value),{status,headers:{
    'content-type':'application/json; charset=utf-8',
    'cache-control':'no-store','x-content-type-options':'nosniff'
  }});
}
function time(){return Math.floor(Date.now()/1000);}
function newToken() {
  const bytes=crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
async function digest(token){
  const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));
  return Array.from(new Uint8Array(hash),byte=>byte.toString(16).padStart(2,'0')).join('');
}
async function payload(request){
  const raw=await request.text();
  if(raw.length>2048)throw new ApiError(413,'payload_too_large');
  try{const data=JSON.parse(raw);if(!data||typeof data!=='object'||Array.isArray(data))throw 0;return data;}
  catch{throw new ApiError(400,'invalid_json');}
}
async function authenticated(request,db,now){
  const authorization=request.headers.get('authorization')||'';
  const match=/^Bearer ([A-Za-z0-9_-]{43})$/.exec(authorization);
  if(!match)throw new ApiError(401,'auth_required');
  const hash=await digest(match[1]);
  const user=await db.prepare(
    'SELECT p.id,p.display_name,p.created_at,s.token_hash FROM sessions s '+
    'JOIN players p ON p.id=s.player_id WHERE s.token_hash=? AND s.expires_at>?'
  ).bind(hash,now).first();
  if(!user)throw new ApiError(401,'invalid_session');
  return user;
}
async function membership(db,playerId){
  return db.prepare('SELECT m.*,c.name AS company_name,c.tag AS company_tag FROM company_members m JOIN companies c ON c.id=m.company_id WHERE m.player_id=?').bind(playerId).first();
}
async function requiredMember(db,playerId){
  const m=await membership(db,playerId);
  if(!m)throw new ApiError(409,'not_in_company');
  return m;
}
function databaseError(error){
  const message=String(error?.message||'');
  if(/company_full/i.test(message))return new ApiError(409,'company_full');
  if(/insufficient_verified_vouchers|invalid_voucher_|voucher_capacity|voucher_trade_already_closed/i.test(message))
    return new ApiError(409,'verified_voucher_trade_rejected');
  if(/idx_players_unique_name|players.name_key|idx_company_unique_name_key|companies.name_key/i.test(message))return new ApiError(409,'name_taken');
  if(/seller_not_company_member|insufficient_trade_inventory/i.test(message))return new ApiError(409,'insufficient_trade_inventory');
  if(/invalid_trade_membership/i.test(message))return new ApiError(409,'invalid_trade_membership');
  if(/trade_already_closed/i.test(message))return new ApiError(409,'offer_unavailable');
  if(/leader_must_be_member|transfer_leadership_first/i.test(message))return new ApiError(409,'leadership_action_rejected');
  if(/not_enough_rp/i.test(message))return new ApiError(409,'insufficient_company_rp');
  if(/UNIQUE constraint failed|constraint failed|FOREIGN KEY constraint failed/i.test(message))return new ApiError(409,'conflict');
  return error;
}
async function createGuest(db,now){
  const id=crypto.randomUUID();
  const token=newToken();
  await db.batch([
    db.prepare('INSERT INTO players(id,display_name,created_at) VALUES(?,?,?)').bind(id,'Agent-'+id.slice(0,8),now),
    db.prepare('INSERT INTO sessions(token_hash,player_id,created_at,expires_at) VALUES(?,?,?,?)')
      .bind(await digest(token),id,now,now+30*86400)
  ]);
  return reply({player:{id,displayName:'Agent-'+id.slice(0,8)},accessToken:token,expiresAt:now+30*86400},201);
}
async function myCompany(db,playerId){
  const m=await requiredMember(db,playerId);
  const [company,members,research]=await Promise.all([
    db.prepare('SELECT id,name,tag,visibility,member_count,rp_balance,rp_lifetime,created_at FROM companies WHERE id=?').bind(m.company_id).first(),
    db.prepare('SELECT p.id,p.display_name,m.role,m.joined_at,m.contributed_rp FROM company_members m JOIN players p ON p.id=m.player_id WHERE m.company_id=? ORDER BY m.contributed_rp DESC').bind(m.company_id).all(),
    db.prepare('SELECT node_id,level FROM company_research WHERE company_id=? ORDER BY node_id').bind(m.company_id).all()
  ]);
  const levels=Object.fromEntries(research.results.map(item=>[item.node_id,item.level]));
  return reply({company,membership:{role:m.role,tokens:m.tokens,contributedRP:m.contributed_rp,lastClaimAt:m.last_claim_at},members:members.results,research:research.results.map(item=>({...item,nextCost:item.level<10?researchCost(item.level+1):null})),bonuses:researchBonuses(levels)});
}
const claimSql =
  'UPDATE company_members SET '+
  'contributed_rp=contributed_rp+MIN(MAX(CAST((? - last_claim_at)/3600 AS INTEGER),0),24)*100*'+
  '(100+2*COALESCE((SELECT level FROM company_research WHERE company_id=company_members.company_id AND node_id=\'infrastructure\'),0))/100,'+
  'tokens=tokens+MIN(MAX(CAST((? - last_claim_at)/3600 AS INTEGER),0),24)*10,'+
  'last_claim_at=CASE WHEN (? - last_claim_at)>=3600 THEN ? ELSE last_claim_at END '+
  'WHERE player_id=? RETURNING company_id,contributed_rp,tokens,last_claim_at';
// Scheduled retention cleanup. Expiring open trades releases escrow in D1 triggers.
export default {
  async scheduled(_event,env,ctx) {
    if(!env.DB)throw new Error('database_not_configured');
    const nowSeconds=time();
    const cleanup=async()=>{
      // Only close an OPEN offer once; the D1 trigger returns locked assets exactly once.
      await env.DB.prepare(
        "UPDATE company_trade_offers SET status='expired',closed_at=? WHERE status='open' AND expires_at<=?"
      ).bind(nowSeconds,nowSeconds).run();
      // Non-financial, closed offers can be removed after 30 days; product purchases use a separate ledger.
      await env.DB.prepare(
        "DELETE FROM company_trade_offers WHERE status!='open' AND closed_at<?"
      ).bind(nowSeconds-30*86400).run();
      await env.DB.prepare(
        "UPDATE company_voucher_offers SET status='expired',closed_at=? WHERE status='open' AND expires_at<=?"
      ).bind(nowSeconds,nowSeconds).run();
      await env.DB.prepare(
        "DELETE FROM company_voucher_offers WHERE status!='open' AND closed_at<?"
      ).bind(nowSeconds-30*86400).run();
      await env.DB.prepare(
        "DELETE FROM company_applications WHERE state!='pending' AND decided_at<?"
      ).bind(nowSeconds-7*86400).run();
      await env.DB.prepare(
        "DELETE FROM company_applications WHERE state='pending' AND expires_at<?"
      ).bind(nowSeconds-7*86400).run();
      await env.DB.prepare(
        "DELETE FROM company_invitations WHERE status!='pending' AND decided_at<?"
      ).bind(nowSeconds-7*86400).run();
      await env.DB.prepare(
        "DELETE FROM company_invitations WHERE status='pending' AND expires_at<?"
      ).bind(nowSeconds-7*86400).run();
      await env.DB.prepare("DELETE FROM sessions WHERE expires_at<?").bind(nowSeconds-7*86400).run();
    };
    ctx.waitUntil(cleanup());
  },
  async fetch(request,env) {
    try{
      if(!env.DB)throw new ApiError(503,'database_not_configured');
      const url=new URL(request.url),path=url.pathname,method=request.method,now=time(),db=env.DB;
      if(method==='GET'&&path==='/v1/health')return reply({ok:true,service:'idle-intelligence-companies',version:1});
      if(method==='POST'&&path==='/v1/session/guest'){
        if (!env.GUEST_SIGNUP_LIMIT) throw new ApiError(503,'signup_protection_unavailable');
        // Use Cloudflare's edge IP header transiently; do not store it in D1 or application logs.
        const clientKey = request.headers.get('CF-Connecting-IP') || 'missing-edge-ip';
        const limit = await env.GUEST_SIGNUP_LIMIT.limit({key:clientKey});
        if (!limit.success) throw new ApiError(429,'signup_rate_limited');
        return createGuest(db,now);
      }
      const player=await authenticated(request,db,now);
      const voucher=await vouchersRoute({request,db,player,path,method,now,reply,ApiError,payload,requiredMember});
      if(voucher)return voucher;
      const social=await socialRoute({
        request,db,player,now,path,method,reply,ApiError,payload,membership,requiredMember
      });
      if(social)return social;
      if(method==='POST'&&path==='/v1/session/rotate'){
        const token=newToken(),hash=await digest(token);
        await db.prepare('UPDATE sessions SET token_hash=?,created_at=?,expires_at=? WHERE token_hash=?')
          .bind(hash,now,now+30*86400,player.token_hash).run();
        return reply({accessToken:token,expiresAt:now+30*86400});
      }
      // Name reservations are global and atomic: never rely on the local offline name form.
      if(method==='GET'&&path==='/v1/names/check'){
        const candidate=(url.searchParams.get('name')||'').slice(0,100);
        const check=validatePlayerName(candidate);
        if(!check.ok)return reply({available:false,reason:check.error});
        const key=normalizeModerationText(check.name);
        const existing=await db.prepare('SELECT id FROM players WHERE name_key=? AND id!=?')
          .bind(key,player.id).first();
        return reply({available:!existing,name:check.name,reason:existing?'taken':null});
      }
      if(method==='PUT'&&path==='/v1/me/name'){
        const data=await payload(request),check=validatePlayerName(data.name);
        if(!check.ok)throw new ApiError(400,'invalid_player_name',check.error);
        const key=normalizeModerationText(check.name);
        if(!key)throw new ApiError(400,'invalid_player_name');
        const result=await db.prepare(
          'UPDATE players SET display_name=?,name_key=?,last_name_change_at=? '+
          'WHERE id=? AND (last_name_change_at=0 OR last_name_change_at<=?) '+
          'RETURNING display_name'
        ).bind(check.name,key,now,player.id,now-86400).first();
        if(!result)throw new ApiError(429,'name_cooldown');
        return reply({name:result.display_name,checked:true});
      }
      if(method==='GET'&&path==='/v1/me'){
        const m=await membership(db,player.id);
        return reply({player:{id:player.id,displayName:player.display_name,createdAt:player.created_at},membership:m?{companyId:m.company_id,companyName:m.company_name,tag:m.company_tag,role:m.role,tokens:m.tokens}:null});
      }
      if(method==='GET'&&path==='/v1/companies'){
        const q=(url.searchParams.get('q')||'').slice(0,50);
        const results=await db.prepare('SELECT id,name,tag,member_count,rp_lifetime,join_policy FROM companies WHERE visibility=\'public\' AND (instr(lower(name),lower(?))>0 OR instr(lower(tag),lower(?))>0) ORDER BY rp_lifetime DESC LIMIT 30').bind(q,q).all();
        return reply({companies:results.results,maxMembers:MAX_MEMBERS});
      }
      if(method==='GET'&&path==='/v1/leaderboards/players'){
        // Rank is server-calculated from capped Company contributions, not local Credits/INT.
        // People who did not opt in are never included in the public list.
        const results=await db.prepare(
          'WITH positions AS (SELECT player_id,company_id,contributed_rp,'+
          'ROW_NUMBER() OVER(ORDER BY contributed_rp DESC,player_id) AS ranking '+
          'FROM company_members) SELECT p.id,p.display_name AS name,c.tag AS company_tag,'+
          'r.ranking AS rank,r.contributed_rp AS rp '+
          'FROM positions r JOIN player_profiles pr ON pr.player_id=r.player_id AND pr.show_rank=1 '+
          'JOIN players p ON p.id=r.player_id JOIN companies c ON c.id=r.company_id '+
          'ORDER BY r.ranking LIMIT 100'
        ).all();
        return reply({players:results.results,ranking:'verified_company_rp',optIn:true});
      }
      if(method==='GET'&&path==='/v1/leaderboards/companies'){
        const scope=url.searchParams.get('scope')==='monthly'?'monthly':'lifetime';
        const season=new Date(now*1000).toISOString().slice(0,7);
        if(scope==='monthly'){
          const results=await db.prepare(
            'SELECT c.id,c.name,c.tag,c.member_count,m.rp AS score,'+
            'ROW_NUMBER() OVER(ORDER BY m.rp DESC,c.id) AS rank '+
            'FROM company_monthly_scores m JOIN companies c ON c.id=m.company_id '+
            'WHERE m.season_id=? ORDER BY score DESC,c.id LIMIT 100'
          ).bind(season).all();
          return reply({companies:results.results,ranking:'monthly_verified_rp',season,seasonal:true});
        }
        const results=await db.prepare(
          'SELECT id,name,tag,member_count,rp_lifetime,'+
          'ROW_NUMBER() OVER(ORDER BY rp_lifetime DESC,id) AS rank '+
          'FROM companies ORDER BY rp_lifetime DESC,id LIMIT 100'
        ).all();
        return reply({companies:results.results,ranking:'lifetime_rp',seasonal:false});
      }
      if(method==='GET'&&path==='/v1/company')return myCompany(db,player.id);
      if(method==='POST'&&path==='/v1/companies'){
        if (!env.COMPANY_CREATE_LIMIT) throw new ApiError(503,'company_protection_unavailable');
        const limit = await env.COMPANY_CREATE_LIMIT.limit({key:player.id});
        if (!limit.success) throw new ApiError(429,'company_creation_rate_limited');
        if(await membership(db,player.id))throw new ApiError(409,'already_in_company');
        let company,policy;
        try{
          const input=await payload(request);
          company=validateCompanyInput(input);
          const nameCheck=validateName(company.name,32);
          if(!nameCheck.ok||containsBlockedName(company.tag))
            throw new RangeError('Company name or tag blocked by the shared name policy');
          policy=input.joinPolicy??'open';
          if(!['open','invite','apply'].includes(policy))throw new RangeError('Invalid admission policy');
        }
        catch(error){if(error instanceof RangeError)throw new ApiError(400,'invalid_company_data',error.message);throw error;}
        const id=crypto.randomUUID();
        await db.batch([
          db.prepare('INSERT INTO companies(id,founder_id,leader_id,name,tag,name_key,join_policy,created_at) VALUES(?,?,?,?,?,?,?,?)')
            .bind(id,player.id,player.id,company.name,company.tag,normalizeModerationText(company.name),policy,now),
          db.prepare('INSERT INTO company_members(player_id,company_id,role,joined_at,last_claim_at) VALUES(?,?,?,?,?)')
            .bind(player.id,id,'ceo',now,now)
        ]);
        return reply({companyId:id,...company,joinPolicy:policy,role:'ceo'},201);
      }
      const join=/^\/v1\/companies\/([^/]+)\/join$/.exec(path);
      if(method==='POST'&&join){
        if(!validCompanyId(join[1]))throw new ApiError(400,'invalid_company_id');
        if(await membership(db,player.id))throw new ApiError(409,'already_in_company');
        const result=await db.prepare(
          'INSERT INTO company_members(player_id,company_id,role,joined_at,last_claim_at) '+
          'SELECT ?,id,\'member\',?,? FROM companies WHERE id=? AND visibility=\'public\' AND join_policy=\'open\''
        ).bind(player.id,now,now,join[1]).run();
        if(!result.meta?.changes)throw new ApiError(404,'company_not_found');
        return reply({companyId:join[1],role:'member'},201);
      }
      if(method==='POST'&&path==='/v1/company/leave'){
        const m=await requiredMember(db,player.id);
        if(m.role==='ceo')throw new ApiError(409,'ceo_must_transfer_company_first');
        await db.prepare('DELETE FROM company_members WHERE player_id=?').bind(player.id).run();
        return reply({leftCompany:true});
      }
      if(method==='POST'&&path==='/v1/company/claim'){
        await requiredMember(db,player.id);
        const m=await db.prepare(claimSql).bind(now,now,now,now,player.id).first();
        // The D1 trigger atomically adds the RP delta to the Company account.
        return reply({companyId:m.company_id,contributedRP:m.contributed_rp,tokens:m.tokens,lastClaimAt:m.last_claim_at});
      }
      if(method==='POST'&&path==='/v1/company/research'){
        const m=await requiredMember(db,player.id);
        if(!['ceo','manager'].includes(m.role))throw new ApiError(403,'role_not_allowed');
        const data=await payload(request),nodeId=data.nodeId;
        if(!RESEARCH_NODES.includes(nodeId))throw new ApiError(400,'unknown_research');
        const changed=await db.prepare(
          'UPDATE company_research SET level=level+1 WHERE company_id=? AND node_id=? AND level<10 RETURNING level'
        ).bind(m.company_id,nodeId).first();
        if(!changed)throw new ApiError(409,'max_research_level');
        return reply({nodeId,level:changed.level,nextCost:changed.level<10?researchCost(changed.level+1):null});
      }
      throw new ApiError(404,'not_found');
    }catch(original){
      const error=databaseError(original);
      if(error instanceof ApiError)return reply({error:{code:error.code,message:error.message}},error.status);
      console.error('company-api failed',error);
      return reply({error:{code:'internal_error',message:'Internal server error'}},500);
    }
  }
};
