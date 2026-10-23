import {tradeLimit} from './trade-limits.mjs';
// Cloudflare D1 owns these balances. A local Unity save is NEVER an issuer.
export function voucherPayload(value,max=10){
 if(!Number.isSafeInteger(value)||value<1||value>max)throw new RangeError('invalid_voucher_quantity');
 return value;
}
export function voucherRequestId(value){
 if(typeof value!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value))
   throw new RangeError('invalid_idempotency_key');
 return value;
}
function validateWant(want){
 if(!want||!['component','item','blueprint'].includes(want.kind)||typeof want.assetId!=='string'||
 !/^[A-Za-z0-9_-]{2,72}$/.test(want.assetId)||!Number.isSafeInteger(want.quantity)||
 want.quantity<1||want.quantity>100||(want.kind==='item'&&want.quantity!==1))
  throw new RangeError('invalid_trade_request');
 return want;
}
export async function vouchersRoute(ctx){
 const {request,db,player,path,method,now,reply,ApiError,payload,requiredMember}=ctx;
 const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
 if(method==='GET'&&path==='/v1/vouchers/me'){
  const [wallet,milestones]=await Promise.all([
    db.prepare('SELECT balance FROM player_voucher_balances WHERE player_id=?').bind(player.id).first(),
    db.prepare('SELECT tier FROM player_voucher_milestones WHERE player_id=? ORDER BY tier').bind(player.id).all()
  ]);
  return reply({verifiedBalance:wallet?.balance??0,claimSources:milestones.results.map(m=>m.tier),
    tradeLimit:await tradeLimit(db,player.id,now),localVouchersTransferable:false,note:'This balance excludes unverified local chest and Season vouchers'});
 }
 if(method==='POST'&&path==='/v1/vouchers/gifts'){
  const m=await requiredMember(db,player.id),data=await payload(request);
  let quantity,id;
  try{quantity=voucherPayload(data.quantity,5);id=voucherRequestId(data.requestId);}
  catch(e){throw new ApiError(400,e.message);}
  if(!uuid.test(data.recipientId)||data.recipientId===player.id)throw new ApiError(400,'invalid_recipient');
  const prior=await db.prepare('SELECT id,recipient_id,quantity FROM company_voucher_gifts WHERE id=? AND sender_id=?')
    .bind(id,player.id).first();
  if(prior){if(prior.recipient_id!==data.recipientId||prior.quantity!==quantity)throw new ApiError(409,'voucher_receipt_collision');return reply({transferId:id,alreadyProcessed:true});}
  await db.prepare(
    'INSERT INTO company_voucher_gifts(id,company_id,sender_id,recipient_id,quantity,created_at) VALUES(?,?,?,?,?,?)'
  ).bind(id,m.company_id,player.id,data.recipientId,quantity,now).run();
  return reply({transferId:id,quantity,recipientId:data.recipientId,completed:true},201);
 }
 if(method==='GET'&&path==='/v1/vouchers/offers'){
  const m=await requiredMember(db,player.id);
  const results=await db.prepare(
    "SELECT id,seller_id,quantity,want_kind,want_id,want_qty,created_at,expires_at "+
    "FROM company_voucher_offers WHERE company_id=? AND status='open' AND expires_at>? "+
    "ORDER BY created_at DESC LIMIT 40"
  ).bind(m.company_id,now).all();
  return reply({offers:results.results,tradeLimit:await tradeLimit(db,player.id,now)});
 }
 if(method==='POST'&&path==='/v1/vouchers/offers'){
  const m=await requiredMember(db,player.id),data=await payload(request);
  let quantity,want;
  try{quantity=voucherPayload(data.quantity);want=validateWant(data.want);}
  catch(e){throw new ApiError(400,e.message);}
  const open=await db.prepare(
    "SELECT COUNT(*) AS n FROM company_voucher_offers WHERE seller_id=? AND status='open'"
  ).bind(player.id).first();
  if(open.n>=10)throw new ApiError(429,'too_many_voucher_offers');
  const id=crypto.randomUUID(),expires=now+259200;
  await db.prepare(
    'INSERT INTO company_voucher_offers(id,company_id,seller_id,quantity,want_kind,want_id,want_qty,created_at,expires_at) VALUES(?,?,?,?,?,?,?,?,?)'
  ).bind(id,m.company_id,player.id,quantity,want.kind,want.assetId,want.quantity,now,expires).run();
  return reply({offerId:id,status:'open',quantity,want,expiresAt:expires},201);
 }
 const accept=/^\/v1\/vouchers\/offers\/([0-9a-f-]{36})\/accept$/i.exec(path);
 if(method==='POST'&&accept){
  const m=await requiredMember(db,player.id);
  const trade=await db.prepare(
    "UPDATE company_voucher_offers SET status='accepted',buyer_id=?,closed_at=? "+
    "WHERE id=? AND company_id=? AND seller_id!=? AND status='open' AND expires_at>? "+
    "RETURNING id,seller_id,buyer_id,quantity,status"
  ).bind(player.id,now,accept[1],m.company_id,player.id,now).first();
  if(!trade)throw new ApiError(409,'voucher_offer_unavailable');
  return reply({trade});
 }
 const cancel=/^\/v1\/vouchers\/offers\/([0-9a-f-]{36})\/cancel$/i.exec(path);
 if(method==='POST'&&cancel){
  const trade=await db.prepare(
    "UPDATE company_voucher_offers SET status='cancelled',closed_at=? "+
    "WHERE id=? AND seller_id=? AND status='open' RETURNING id,status"
  ).bind(now,cancel[1],player.id).first();
  if(!trade)throw new ApiError(409,'voucher_offer_unavailable');
  return reply({trade});
 }
 if(method==='POST'&&path==='/v1/vouchers/redeem'){
  const data=await payload(request);
  let id;try{id=voucherRequestId(data.requestId);}catch(e){throw new ApiError(400,e.message);}
  const prior=await db.prepare('SELECT player_id,redeemed_at FROM player_voucher_redemptions WHERE id=?')
    .bind(id).first();
  if(prior){
   if(prior.player_id!==player.id)throw new ApiError(409,'voucher_receipt_collision');
   return reply({receiptId:id,redeemedAt:prior.redeemed_at,alreadyProcessed:true});
  }
  await db.prepare(
    'INSERT INTO player_voucher_redemptions(id,player_id,redeemed_at) VALUES(?,?,?)'
  ).bind(id,player.id,now).run();
  return reply({receiptId:id,redeemedAt:now,alreadyProcessed:false},201);
 }
 if(method==='GET'&&path==='/v1/vouchers/redemptions'){
  const results=await db.prepare(
    'SELECT id,redeemed_at FROM player_voucher_redemptions WHERE player_id=? ORDER BY redeemed_at DESC LIMIT 40'
  ).bind(player.id).all();
  return reply({receipts:results.results});
 }
 return null;
}
