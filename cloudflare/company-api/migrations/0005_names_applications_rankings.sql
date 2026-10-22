-- Strict pseudonymous names and server-derived Company / player leaderboards.
-- No email, client-provided rank, IP, contact or chat data.
ALTER TABLE players ADD COLUMN name_key TEXT;
ALTER TABLE players ADD COLUMN last_name_change_at INTEGER NOT NULL DEFAULT 0;
UPDATE players SET name_key=lower(replace(replace(replace(display_name,' ',''),'-',''),'_',''));
CREATE UNIQUE INDEX idx_players_unique_name ON players(name_key) WHERE name_key IS NOT NULL;

ALTER TABLE companies ADD COLUMN name_key TEXT;
UPDATE companies SET name_key=lower(replace(replace(replace(name,' ',''),'-',''),'_',''));
CREATE UNIQUE INDEX idx_company_unique_name_key ON companies(name_key) WHERE name_key IS NOT NULL;
ALTER TABLE companies ADD COLUMN join_policy TEXT NOT NULL DEFAULT 'open'
  CHECK(join_policy IN ('open','invite','apply'));

CREATE TABLE company_applications (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  state TEXT NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','accepted','rejected','withdrawn')),
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL CHECK(expires_at>created_at AND expires_at<=created_at+604800),
  decided_at INTEGER
);
CREATE UNIQUE INDEX idx_one_pending_application ON company_applications(company_id,player_id)
  WHERE state='pending';
CREATE INDEX idx_applications_company ON company_applications(company_id,state,created_at);

CREATE TRIGGER company_application_accept_guard BEFORE UPDATE OF state ON company_applications
WHEN NEW.state='accepted' BEGIN
  SELECT CASE WHEN OLD.state!='pending' OR NEW.decided_at IS NULL OR
    NEW.decided_at>OLD.expires_at OR NEW.decided_at<OLD.created_at
    THEN RAISE(ABORT,'invalid_application') END;
  SELECT CASE WHEN EXISTS(SELECT 1 FROM company_members WHERE player_id=OLD.player_id)
    THEN RAISE(ABORT,'already_in_company') END;
END;
CREATE TRIGGER company_application_join AFTER UPDATE OF state ON company_applications
WHEN NEW.state='accepted' BEGIN
 INSERT INTO company_members(player_id,company_id,role,joined_at,last_claim_at)
   VALUES(NEW.player_id,NEW.company_id,'member',NEW.decided_at,NEW.decided_at);
END;
CREATE TRIGGER company_application_no_reopen BEFORE UPDATE OF state ON company_applications
WHEN OLD.state!='pending' BEGIN SELECT RAISE(ABORT,'application_already_handled'); END;

-- Month-based Company league; always sourced from server-computed RP increments.
CREATE TABLE company_monthly_scores (
 company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
 season_id TEXT NOT NULL CHECK(length(season_id)=7),
 rp INTEGER NOT NULL DEFAULT 0 CHECK(rp>=0),
 PRIMARY KEY(company_id,season_id)
);
CREATE INDEX idx_monthly_rank ON company_monthly_scores(season_id,rp DESC,company_id);
CREATE TRIGGER company_monthly_score AFTER UPDATE OF contributed_rp ON company_members
WHEN NEW.contributed_rp>OLD.contributed_rp BEGIN
 INSERT INTO company_monthly_scores(company_id,season_id,rp)
   VALUES(NEW.company_id,strftime('%Y-%m','now'),NEW.contributed_rp-OLD.contributed_rp)
   ON CONFLICT(company_id,season_id) DO UPDATE SET rp=rp+excluded.rp;
END;

CREATE TRIGGER player_guest_key AFTER INSERT ON players WHEN NEW.name_key IS NULL BEGIN
 UPDATE players SET name_key=lower(replace(replace(replace(NEW.display_name,' ',''),'-',''),'_','')) WHERE id=NEW.id;
END;
CREATE TRIGGER company_default_key AFTER INSERT ON companies WHEN NEW.name_key IS NULL BEGIN
 UPDATE companies SET name_key=lower(replace(replace(replace(NEW.name,' ',''),'-',''),'_','')) WHERE id=NEW.id;
END;
