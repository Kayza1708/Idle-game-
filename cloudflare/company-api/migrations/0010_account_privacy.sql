-- No free-text communication. Reports contain only fixed reason codes and verified IDs.
CREATE TABLE moderation_reports (
 id TEXT PRIMARY KEY,
 reporter_id TEXT REFERENCES players(id) ON DELETE SET NULL,
 target_type TEXT NOT NULL CHECK(target_type IN ('player','company')),
 target_id TEXT NOT NULL,
 reason TEXT NOT NULL CHECK(reason IN ('name','fraud','harassment','other')),
 created_at INTEGER NOT NULL
);
CREATE INDEX idx_reports_time ON moderation_reports(created_at);
CREATE TABLE player_blocks (
 owner_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
 blocked_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
 PRIMARY KEY(owner_id,blocked_id),CHECK(owner_id!=blocked_id)
);
CREATE TRIGGER block_trade_accept BEFORE UPDATE OF status ON company_trade_offers
WHEN NEW.status='accepted' AND OLD.status='open' BEGIN
 SELECT CASE WHEN EXISTS(SELECT 1 FROM player_blocks WHERE
 (owner_id=NEW.buyer_id AND blocked_id=OLD.seller_id) OR (owner_id=OLD.seller_id AND blocked_id=NEW.buyer_id)) THEN RAISE(ABORT,'player_blocked') END;
END;
CREATE TRIGGER block_voucher_accept BEFORE UPDATE OF status ON company_voucher_offers
WHEN NEW.status='accepted' AND OLD.status='open' BEGIN
 SELECT CASE WHEN EXISTS(SELECT 1 FROM player_blocks WHERE
 (owner_id=NEW.buyer_id AND blocked_id=OLD.seller_id) OR (owner_id=OLD.seller_id AND blocked_id=NEW.buyer_id)) THEN RAISE(ABORT,'player_blocked') END;
END;
CREATE TRIGGER block_voucher_gift BEFORE INSERT ON company_voucher_gifts BEGIN
 SELECT CASE WHEN EXISTS(SELECT 1 FROM player_blocks WHERE
 (owner_id=NEW.sender_id AND blocked_id=NEW.recipient_id) OR (owner_id=NEW.recipient_id AND blocked_id=NEW.sender_id)) THEN RAISE(ABORT,'player_blocked') END;
END;
CREATE TRIGGER block_invitation BEFORE INSERT ON company_invitations BEGIN
 SELECT CASE WHEN EXISTS(SELECT 1 FROM player_blocks WHERE
 (owner_id=NEW.invited_player_id AND blocked_id=NEW.invited_by_player_id) OR (owner_id=NEW.invited_by_player_id AND blocked_id=NEW.invited_player_id)) THEN RAISE(ABORT,'player_blocked') END;
END;
-- Keep the ordinary CEO-exit guard. Permit only deletion of an already removed parent
-- company (the cascade of deleting a sole founder's account).
DROP TRIGGER company_no_ceo_exit;
CREATE TRIGGER company_no_ceo_exit BEFORE DELETE ON company_members
WHEN OLD.role='ceo' AND EXISTS(SELECT 1 FROM companies WHERE id=OLD.company_id)
BEGIN SELECT RAISE(ABORT,'transfer_leadership_first'); END;
CREATE TRIGGER erase_player_account BEFORE DELETE ON players BEGIN
 -- Release open escrow before erasing identifying histories. No new daily trade is counted.
 UPDATE company_trade_offers SET status='cancelled',closed_at=MAX(created_at,CAST(strftime('%s','now') AS INTEGER)) WHERE seller_id=OLD.id AND status='open';
 UPDATE company_voucher_offers SET status='cancelled',closed_at=MAX(created_at,CAST(strftime('%s','now') AS INTEGER)) WHERE seller_id=OLD.id AND status='open';
 -- Existing members keep their Company: transfer to oldest eligible member atomically.
 UPDATE companies SET leader_id=(SELECT m.player_id FROM company_members m WHERE m.company_id=companies.id AND m.player_id!=OLD.id ORDER BY CASE m.role WHEN 'executive' THEN 0 WHEN 'manager' THEN 1 ELSE 2 END,m.joined_at,m.player_id LIMIT 1)
 WHERE leader_id=OLD.id AND EXISTS(SELECT 1 FROM company_members m WHERE m.company_id=companies.id AND m.player_id!=OLD.id);
 DELETE FROM company_trade_offers WHERE seller_id=OLD.id OR buyer_id=OLD.id OR company_id IN (SELECT id FROM companies WHERE leader_id=OLD.id);
 DELETE FROM company_voucher_offers WHERE seller_id=OLD.id OR buyer_id=OLD.id OR company_id IN (SELECT id FROM companies WHERE leader_id=OLD.id);
 DELETE FROM company_voucher_gifts WHERE sender_id=OLD.id OR recipient_id=OLD.id OR company_id IN (SELECT id FROM companies WHERE leader_id=OLD.id);
 DELETE FROM company_invitations WHERE invited_by_player_id=OLD.id;
 UPDATE companies SET founder_id=leader_id WHERE founder_id=OLD.id AND leader_id!=OLD.id;
 DELETE FROM moderation_reports WHERE target_type='company' AND target_id IN (SELECT id FROM companies WHERE leader_id=OLD.id);
 DELETE FROM companies WHERE leader_id=OLD.id;
 -- Fixed ID-only reports need no copy of a deleted profile or Company identifier.
 DELETE FROM moderation_reports WHERE reporter_id=OLD.id OR (target_type='player' AND target_id=OLD.id);
 -- Sessions, profile, showcase, statistics, inventories, blocks and own daily counters
 -- follow their existing ON DELETE CASCADE contracts. Others' daily counters remain.
END;
