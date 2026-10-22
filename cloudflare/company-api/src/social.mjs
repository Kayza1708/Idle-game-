import {BADGE_FAMILIES,TIERS,PROFILE_FRAMES,PRIVACY_KEYS,validatePrivacy,validateShowcase,maySetRole,mayKick,validateTradePart} from './social-catalog.mjs';

// Every route is authenticated by the parent Worker. This module does not implement chat/DMs.
// Public profile displays only opted-in, server-verified fields. No local save uploads.
export async function socialRoute(ctx) {
 const {request,db,player,now,path,method,reply,ApiError,payload,membership,requiredMember}=ctx;
 const invalid=(error)=>{if(error instanceof RangeError)throw new ApiError(400,'invalid_request',error.message);throw error;};
 const member=()=>requiredMember(db,player.id);
 const profileRoute=/^\/v1\/players\/([0-9a-f-]{36})\/profile$/i.exec(path);
 if(method==='GET'&&profileRoute){
   const id=profileRoute[1];
   const base=await db.prepare(
     'SELECT p.id,p.display_name,pr.frame_id,pr.show_badges,pr.show_playtime,pr.show_max_compute,pr.show_prestiges,pr.show_int,pr.show_rank,'+
     'c.id AS company_id,c.name AS company_name,c.tag AS company_tag '+
     'FROM players p JOIN player_profiles pr ON pr.player_id=p.id '+
     'LEFT JOIN company_members m ON m.player_id=p.id LEFT JOIN companies c ON c.id=m.company_id WHERE p.id=?'
   ).bind(id).first();
   if(!base)throw new ApiError(404,'player_not_found');
   const [badges,stats]=await Promise.all([
     base.show_badges ? db.prepare(
       'SELECT s.slot,s.family,s.tier,b.earned_at FROM profile_badge_showcase s '+
       'JOIN player_badges b ON b.player_id=s.player_id AND b.family=s.family AND b.tier=s.tier '+
       'WHERE s.player_id=? ORDER BY s.slot'
     ).bind(id).all() : Promise.resolve({results:[]}),
     db.prepare('SELECT stat_key,stat_value FROM public_player_stats WHERE player_id=?').bind(id).all()
   ]);
   const statsByKey=Object.fromEntries(stats.results.map(s=>[s.stat_key,s.stat_value]));
   const visibleStats={};
   const flags=[['playtime','show_playtime','playtime'],['maxCompute','show_max_compute','max_compute'],['prestiges','show_prestiges','prestiges'],['int','show_int','int'],['rank','show_rank','rank']];
   for(const [key,field,dbKey] of flags)if(base[field]===1&&statsByKey[dbKey]!=null)visibleStats[key]=statsByKey[dbKey];
   return reply({player:{id:base.id,displayName:base.display_name,frameId:base.frame_id,company:base.company_id?{id:base.company_id,name:base.company_name,tag:base.company_tag}:null},badges:badges.results.map(b=>({...b,metal:TIERS[b.tier]})),stats:visibleStats});
 }
 if(method==='GET'&&path==='/v1/profile'){
   const [profile,badges,showcase,frames]=await Promise.all([
     db.prepare('SELECT * FROM player_profiles WHERE player_id=?').bind(player.id).first(),
     db.prepare('SELECT family,tier,earned_at FROM player_badges WHERE player_id=? ORDER BY family,tier').bind(player.id).all(),
     db.prepare('SELECT slot,family,tier FROM profile_badge_showcase WHERE player_id=? ORDER BY slot').bind(player.id).all(),
     db.prepare('SELECT frame_id,acquired_at FROM owned_profile_frames WHERE player_id=?').bind(player.id).all()
   ]);
   return reply({playerId:player.id,privacy:{
     badges:!!profile.show_badges,playtime:!!profile.show_playtime,maxCompute:!!profile.show_max_compute,
     prestiges:!!profile.show_prestiges,int:!!profile.show_int,rank:!!profile.show_rank
   },frameId:profile.frame_id,badges:badges.results,showcase:showcase.results,
   ownedFrames:frames.results.map(f=>f.frame_id),badgeCatalog:BADGE_FAMILIES,frameCatalog:PROFILE_FRAMES});
 }
 if(method==='PATCH'&&path==='/v1/profile/privacy'){
   let privacy;try{privacy=validatePrivacy(await payload(request));}catch(e){invalid(e);}
   const current=await db.prepare('SELECT * FROM player_profiles WHERE player_id=?').bind(player.id).first();
   if(!current)throw new ApiError(404,'profile_not_found');
   const flag=k=>privacy[k]===undefined?current['show_'+(k==='maxCompute'?'max_compute':k)]:(privacy[k]?1:0);
   await db.prepare(
     'UPDATE player_profiles SET show_badges=?,show_playtime=?,show_max_compute=?,show_prestiges=?,show_int=?,show_rank=? WHERE player_id=?'
   ).bind(flag('badges'),flag('playtime'),flag('maxCompute'),flag('prestiges'),flag('int'),flag('rank'),player.id).run();
   // Minimize persisted data: revoke shared statistics when visibility is switched off.
   for(const key of PRIVACY_KEYS.filter(k=>k!=='badges'&&privacy[k]===false))
     await db.prepare('DELETE FROM public_player_stats WHERE player_id=? AND stat_key=?').bind(player.id,key==='maxCompute'?'max_compute':key).run();
   return reply({saved:true});
 }
 if(method==='PUT'&&path==='/v1/profile/showcase'){
   let showcase;try{showcase=validateShowcase((await payload(request)).badges);}catch(e){invalid(e);}
   const statements=[db.prepare('DELETE FROM profile_badge_showcase WHERE player_id=?').bind(player.id)];
   for(let i=0;i<showcase.length;i++){
     const b=showcase[i];
     statements.push(db.prepare(
       'INSERT INTO profile_badge_showcase(player_id,slot,family,tier) '+
       'SELECT ?,?,?,? WHERE EXISTS(SELECT 1 FROM player_badges WHERE player_id=? AND family=? AND tier=?)'
     ).bind(player.id,i+1,b.family,b.tier,player.id,b.family,b.tier));
   }
   // A user cannot equip a badge they have not earned; check before modification.
   for(const badge of showcase){
     if(!await db.prepare('SELECT 1 FROM player_badges WHERE player_id=? AND family=? AND tier=?')
       .bind(player.id,badge.family,badge.tier).first())throw new ApiError(409,'badge_not_owned');
   }
   await db.batch(statements);
   return reply({showcase:showcase.map((b,i)=>({slot:i+1,...b}))});
 }
 if(method==='POST'&&path==='/v1/profile/frame'){
   const data=await payload(request),id=data.frameId;
   if(typeof id!=='string'||!PROFILE_FRAMES.some(f=>f.id===id))throw new ApiError(400,'invalid_frame');
   const updated=await db.prepare(
     'UPDATE player_profiles SET frame_id=? WHERE player_id=? AND EXISTS '+
     '(SELECT 1 FROM owned_profile_frames WHERE player_id=? AND frame_id=?) RETURNING frame_id'
   ).bind(id,player.id,player.id,id).first();
   if(!updated)throw new ApiError(409,'frame_not_owned');
   return reply({frameId:id});
 }
 if(method==='POST'&&path==='/v1/profile/frames/purchase'){
   // The personal Gems wallet remains local; do not debit a forged client balance.
   throw new ApiError(409,'server_verified_gems_required');
 }
 const roleMatch=/^\/v1\/company\/members\/([0-9a-f-]{36})\/role$/i.exec(path);
 if(method==='POST'&&roleMatch){
   const self=await member(),data=await payload(request),targetId=roleMatch[1],role=data.role;
   if(targetId===player.id)throw new ApiError(403,'cannot_manage_self');
   const target=await db.prepare('SELECT role FROM company_members WHERE player_id=? AND company_id=?').bind(targetId,self.company_id).first();
   if(!target)throw new ApiError(404,'member_not_found');
   if(!maySetRole(self.role,target.role,role))throw new ApiError(403,'role_not_allowed');
   const updated=await db.prepare(
     "UPDATE company_members SET role=? WHERE player_id=? AND company_id=? AND role=? AND EXISTS ("+
     "SELECT 1 FROM company_members a WHERE a.player_id=? AND a.company_id=? AND "+
     "(a.role='ceo' OR (a.role='executive' AND ? IN ('manager','member') AND ? IN ('manager','member')))) RETURNING role"
   ).bind(role,targetId,self.company_id,target.role,player.id,self.company_id,target.role,role).first();
   if(!updated)throw new ApiError(409,'role_changed_retry');
   return reply({playerId:targetId,role:updated.role});
 }
 const kick=/^\/v1\/company\/members\/([0-9a-f-]{36})\/kick$/i.exec(path);
 if(method==='POST'&&kick){
   const self=await member(),targetId=kick[1];
   if(targetId===player.id)throw new ApiError(403,'cannot_kick_self');
   const target=await db.prepare('SELECT role FROM company_members WHERE company_id=? AND player_id=?').bind(self.company_id,targetId).first();
   if(!target)throw new ApiError(404,'member_not_found');
   if(!mayKick(self.role,target.role))throw new ApiError(403,'role_not_allowed');
   const result=await db.prepare(
     "DELETE FROM company_members WHERE player_id=? AND company_id=? AND role=? AND EXISTS ("+
     "SELECT 1 FROM company_members actor WHERE actor.player_id=? AND actor.company_id=? AND ("+
     "actor.role='ceo' OR actor.role='executive' AND ? IN ('manager','member') OR "+
     "actor.role='manager' AND ?='member')) RETURNING player_id"
   ).bind(targetId,self.company_id,target.role,player.id,self.company_id,target.role,target.role).first();
   if(!result)throw new ApiError(409,'role_changed_retry');
   return reply({removedPlayerId:result.player_id});
 }
 if(method==='POST'&&path==='/v1/company/leadership/transfer'){
   const self=await member();
   if(self.role!=='ceo')throw new ApiError(403,'ceo_only');
   const data=await payload(request),targetId=data.playerId;
   if(typeof targetId!=='string'||targetId===player.id)throw new ApiError(400,'invalid_successor');
   const target=await db.prepare('SELECT role FROM company_members WHERE company_id=? AND player_id=?')
     .bind(self.company_id,targetId).first();
   if(!target)throw new ApiError(404,'successor_not_found');
   // The D1 trigger changes both member roles in the SAME atomic statement.
   const row=await db.prepare(
     'UPDATE companies SET leader_id=? WHERE id=? AND leader_id=? RETURNING leader_id'
   ).bind(targetId,self.company_id,player.id).first();
   if(!row)throw new ApiError(409,'leadership_changed_retry');
   return reply({newLeaderId:row.leader_id,yourNewRole:'executive'});
 }
 // Invite flows use IDs only; no invitation text, chat or direct messages.
 if(method==='GET'&&path==='/v1/me/invitations'){
   const list=await db.prepare(
     "SELECT i.id,i.company_id,c.name AS company_name,c.tag AS company_tag,i.created_at,i.expires_at "+
     "FROM company_invitations i JOIN companies c ON c.id=i.company_id "+
     "WHERE i.invited_player_id=? AND i.status='pending' AND i.expires_at>? "+
     "ORDER BY i.created_at DESC LIMIT 30"
   ).bind(player.id,now).all();
   return reply({invitations:list.results});
 }
 if(method==='POST'&&path==='/v1/company/invitations'){
   const self=await member();
   if(!['ceo','executive','manager'].includes(self.role))throw new ApiError(403,'role_not_allowed');
   const data=await payload(request),targetId=data.playerId;
   if(typeof targetId!=='string'||!/^[0-9a-f-]{36}$/i.test(targetId)||targetId===player.id)
     throw new ApiError(400,'invalid_invitation_target');
   if(await membership(db,targetId))throw new ApiError(409,'target_already_in_company');
   const count=await db.prepare(
     "SELECT COUNT(*) AS n FROM company_invitations WHERE company_id=? AND status='pending' AND expires_at>?"
   ).bind(self.company_id,now).first();
   if(count.n>=20)throw new ApiError(429,'invitation_limit');
   const id=crypto.randomUUID(),expiresAt=now+604800;
   // Close stale invites to allow a new invitation after expiration.
   await db.prepare(
     "UPDATE company_invitations SET status='revoked',decided_at=? WHERE company_id=? AND invited_player_id=? AND status='pending' AND expires_at<=?"
   ).bind(now,self.company_id,targetId,now).run();
   const exists=await db.prepare('SELECT 1 FROM players WHERE id=?').bind(targetId).first();
   if(!exists)throw new ApiError(404,'player_not_found');
   await db.prepare(
     'INSERT INTO company_invitations(id,company_id,invited_player_id,invited_by_player_id,created_at,expires_at) VALUES(?,?,?,?,?,?)'
   ).bind(id,self.company_id,targetId,player.id,now,expiresAt).run();
   return reply({invitationId:id,playerId:targetId,expiresAt},201);
 }
 const acceptInvite=/^\/v1\/me\/invitations\/([0-9a-f-]{36})\/accept$/i.exec(path);
 if(method==='POST'&&acceptInvite){
   if(await membership(db,player.id))throw new ApiError(409,'already_in_company');
   const accepted=await db.prepare(
     "UPDATE company_invitations SET status='accepted',decided_at=? "+
     "WHERE id=? AND invited_player_id=? AND status='pending' AND expires_at>? "+
     "RETURNING company_id"
   ).bind(now,acceptInvite[1],player.id,now).first();
   if(!accepted)throw new ApiError(409,'invitation_unavailable');
   return reply({companyId:accepted.company_id,role:'member'});
 }
 const declineInvite=/^\/v1\/me\/invitations\/([0-9a-f-]{36})\/decline$/i.exec(path);
 if(method==='POST'&&declineInvite){
   const declined=await db.prepare(
     "UPDATE company_invitations SET status='declined',decided_at=? WHERE id=? AND invited_player_id=? AND status='pending' RETURNING id"
   ).bind(now,declineInvite[1],player.id).first();
   if(!declined)throw new ApiError(409,'invitation_unavailable');
   return reply({declinedInvitationId:declined.id});
 }
 const revokeInvite=/^\/v1\/company\/invitations\/([0-9a-f-]{36})\/revoke$/i.exec(path);
 if(method==='POST'&&revokeInvite){
   const self=await member();
   if(!['ceo','executive','manager'].includes(self.role))throw new ApiError(403,'role_not_allowed');
   const revoked=await db.prepare(
     "UPDATE company_invitations SET status='revoked',decided_at=? WHERE id=? AND company_id=? AND status='pending' "+
     "AND EXISTS(SELECT 1 FROM company_members m WHERE m.player_id=? AND m.company_id=? AND m.role IN ('ceo','executive','manager')) "+
     "RETURNING id"
   ).bind(now,revokeInvite[1],self.company_id,player.id,self.company_id).first();
   if(!revoked)throw new ApiError(409,'invitation_unavailable');
   return reply({revokedInvitationId:revoked.id});
 }
 // Do not introduce any messaging route. Trading uses strict fixed fields, never free-form text.
 if(method==='GET'&&path==='/v1/trades/inventory'){
   const assets=await db.prepare('SELECT kind,asset_id,quantity FROM trade_inventory WHERE player_id=? AND quantity>0 ORDER BY kind,asset_id LIMIT 200')
     .bind(player.id).all();
   return reply({assets:assets.results,source:'server_issued_only'});
 }
 if(method==='GET'&&path==='/v1/trades/offers'){
   const self=await member();
   const results=await db.prepare(
     "SELECT o.id,o.seller_id,p.display_name AS seller_name,o.give_kind,o.give_id,o.give_qty,"+
     "o.want_kind,o.want_id,o.want_qty,o.created_at,o.expires_at FROM company_trade_offers o "+
     "JOIN players p ON p.id=o.seller_id WHERE o.company_id=? AND o.status='open' AND o.expires_at>? "+
     "ORDER BY o.created_at DESC LIMIT 50"
   ).bind(self.company_id,now).all();
   return reply({offers:results.results});
 }
 if(method==='POST'&&path==='/v1/trades/offers'){
   const self=await member();
   const data=await payload(request);
   let give,want;try{give=validateTradePart(data.give);want=validateTradePart(data.want);}catch(e){invalid(e);}
   if(give.kind===want.kind&&give.assetId===want.assetId)throw new ApiError(400,'identical_trade_assets');
   const count=await db.prepare("SELECT count(*) AS n FROM company_trade_offers WHERE seller_id=? AND status='open'").bind(player.id).first();
   if(count.n>=10)throw new ApiError(429,'open_trade_limit');
   const id=crypto.randomUUID(),expiresAt=now+259200;
   await db.prepare(
     'INSERT INTO company_trade_offers(id,company_id,seller_id,give_kind,give_id,give_qty,want_kind,want_id,want_qty,created_at,expires_at) '+
     'VALUES(?,?,?,?,?,?,?,?,?,?,?)'
   ).bind(id,self.company_id,player.id,give.kind,give.assetId,give.quantity,want.kind,want.assetId,want.quantity,now,expiresAt).run();
   return reply({offerId:id,status:'open',expiresAt},201);
 }
 const tradeAccept=/^\/v1\/trades\/([0-9a-f-]{36})\/accept$/i.exec(path);
 if(method==='POST'&&tradeAccept){
   const self=await member();
   const result=await db.prepare(
     "UPDATE company_trade_offers SET status='accepted',buyer_id=?,closed_at=? "+
     "WHERE id=? AND company_id=? AND status='open' AND expires_at>? AND seller_id!=? "+
     "RETURNING id,status,seller_id,buyer_id"
   ).bind(player.id,now,tradeAccept[1],self.company_id,now,player.id).first();
   if(!result)throw new ApiError(409,'offer_unavailable');
   return reply({trade:result});
 }
 const tradeCancel=/^\/v1\/trades\/([0-9a-f-]{36})\/cancel$/i.exec(path);
 if(method==='POST'&&tradeCancel){
   const result=await db.prepare(
     "UPDATE company_trade_offers SET status='cancelled',closed_at=? WHERE id=? AND seller_id=? AND status='open' RETURNING id,status"
   ).bind(now,tradeCancel[1],player.id).first();
   if(!result)throw new ApiError(409,'offer_unavailable');
   return reply({trade:result});
 }
 return null;
}
