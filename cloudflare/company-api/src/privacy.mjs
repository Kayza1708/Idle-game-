const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function privacyRoute({request,db,player,path,method,now,reply,ApiError,payload}){
 if(method==='DELETE'&&path==='/v1/me'){
  const data=await payload(request);
  if(data.confirmation!=='delete-online-account')throw new ApiError(400,'account_deletion_confirmation_required');
  const row=await db.prepare('DELETE FROM players WHERE id=? RETURNING id').bind(player.id).first();
  return reply({deleted:!!row,localSaveAffected:false,sessionsRevoked:true});
 }
 if(method==='POST'&&path==='/v1/reports'){
  const data=await payload(request);
  if(!['player','company'].includes(data.targetType)||!uuid.test(data.targetId)||!['name','fraud','harassment','other'].includes(data.reason)||Object.keys(data).some(k=>!['targetType','targetId','reason'].includes(k)))throw new ApiError(400,'invalid_report');
  const target=await db.prepare(data.targetType==='player'?'SELECT id FROM players WHERE id=?':'SELECT id FROM companies WHERE id=?').bind(data.targetId).first();
  if(!target)throw new ApiError(404,'report_target_not_found');
  const id=crypto.randomUUID();
  const inserted=await db.prepare('INSERT INTO moderation_reports(id,reporter_id,target_type,target_id,reason,created_at) SELECT ?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM moderation_reports WHERE reporter_id=? AND created_at>=?)<20 RETURNING id').bind(id,player.id,data.targetType,data.targetId,data.reason,now,player.id,Math.floor(now/86400)*86400).first();
  if(!inserted)throw new ApiError(429,'report_daily_limit');return reply({reportId:id,received:true},201);
 }
 if(path==='/v1/blocks'&&method==='GET'){
  const rows=await db.prepare('SELECT b.blocked_id,p.display_name FROM player_blocks b JOIN players p ON p.id=b.blocked_id WHERE b.owner_id=? ORDER BY p.display_name').bind(player.id).all();return reply({blocked:rows.results});
 }
 if(path==='/v1/blocks'&&(method==='POST'||method==='DELETE')){
  const data=await payload(request);if(!uuid.test(data.playerId)||data.playerId===player.id)throw new ApiError(400,'invalid_block_target');
  if(method==='POST')await db.prepare('INSERT OR IGNORE INTO player_blocks(owner_id,blocked_id) SELECT ?,id FROM players WHERE id=?').bind(player.id,data.playerId).run();
  else await db.prepare('DELETE FROM player_blocks WHERE owner_id=? AND blocked_id=?').bind(player.id,data.playerId).run();
  return reply({blocked:method==='POST'});
 }
 return null;
}
