-- Invitation-only coordination: no message body, chat, or recipient email.
CREATE TABLE company_invitations (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  invited_player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  invited_by_player_id TEXT NOT NULL REFERENCES players(id),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK(status IN ('pending','accepted','declined','revoked')),
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL CHECK(expires_at>created_at AND expires_at<=created_at+604800),
  decided_at INTEGER
);
CREATE INDEX idx_invitations_recipient ON company_invitations(invited_player_id,status,expires_at);
CREATE UNIQUE INDEX idx_company_pending_invite ON company_invitations(company_id,invited_player_id)
  WHERE status='pending';
CREATE TRIGGER company_invite_accept_check BEFORE UPDATE OF status ON company_invitations
WHEN NEW.status='accepted' BEGIN
  SELECT CASE WHEN OLD.status!='pending' OR NEW.decided_at IS NULL OR
    NEW.decided_at>OLD.expires_at OR NEW.decided_at<OLD.created_at
    THEN RAISE(ABORT,'invalid_invitation') END;
  SELECT CASE WHEN EXISTS(
    SELECT 1 FROM company_members WHERE player_id=OLD.invited_player_id
    ) THEN RAISE(ABORT,'already_in_company') END;
END;
CREATE TRIGGER company_invite_accept AFTER UPDATE OF status ON company_invitations
WHEN NEW.status='accepted' BEGIN
  INSERT INTO company_members(player_id,company_id,role,joined_at,last_claim_at)
    VALUES(NEW.invited_player_id,NEW.company_id,'member',NEW.decided_at,NEW.decided_at);
END;
CREATE TRIGGER company_invite_only_pending BEFORE UPDATE OF status ON company_invitations
WHEN OLD.status!='pending' BEGIN SELECT RAISE(ABORT,'invitation_already_handled'); END;
