-- Idle Intelligence Companies V1: server-owned state. Run via Wrangler migrations.
PRAGMA foreign_keys = ON;
CREATE TABLE players (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL CHECK(length(display_name) BETWEEN 3 AND 24),
  created_at INTEGER NOT NULL
);
CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX idx_sessions_player ON sessions(player_id);
CREATE TABLE companies (
  id TEXT PRIMARY KEY,
  founder_id TEXT NOT NULL REFERENCES players(id),
  name TEXT NOT NULL COLLATE NOCASE UNIQUE,
  tag TEXT NOT NULL COLLATE NOCASE UNIQUE,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK(visibility='public'),
  member_count INTEGER NOT NULL DEFAULT 0 CHECK(member_count BETWEEN 0 AND 50),
  rp_balance INTEGER NOT NULL DEFAULT 0 CHECK(rp_balance>=0),
  rp_lifetime INTEGER NOT NULL DEFAULT 0 CHECK(rp_lifetime>=0),
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_company_rank ON companies(rp_lifetime DESC);
CREATE TABLE company_members (
  player_id TEXT PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK(role IN ('ceo','manager','member')),
  joined_at INTEGER NOT NULL,
  last_claim_at INTEGER NOT NULL,
  contributed_rp INTEGER NOT NULL DEFAULT 0 CHECK(contributed_rp>=0),
  tokens INTEGER NOT NULL DEFAULT 0 CHECK(tokens>=0)
);
CREATE INDEX idx_members_company ON company_members(company_id);
CREATE TRIGGER company_capacity BEFORE INSERT ON company_members BEGIN
  SELECT CASE WHEN (SELECT member_count FROM companies WHERE id=NEW.company_id)>=50
    THEN RAISE(ABORT,'company_full') END;
END;
CREATE TRIGGER company_count_added AFTER INSERT ON company_members BEGIN
  UPDATE companies SET member_count=member_count+1 WHERE id=NEW.company_id;
END;
CREATE TRIGGER company_count_removed AFTER DELETE ON company_members BEGIN
  UPDATE companies SET member_count=member_count-1 WHERE id=OLD.company_id;
END;
CREATE TRIGGER company_rp_awarded AFTER UPDATE OF contributed_rp ON company_members
WHEN NEW.contributed_rp>OLD.contributed_rp BEGIN
  UPDATE companies SET
    rp_balance=rp_balance+(NEW.contributed_rp-OLD.contributed_rp),
    rp_lifetime=rp_lifetime+(NEW.contributed_rp-OLD.contributed_rp)
  WHERE id=NEW.company_id;
END;
CREATE TABLE company_research (
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL CHECK(node_id IN ('computing','research','drops','infrastructure')),
  level INTEGER NOT NULL DEFAULT 0 CHECK(level BETWEEN 0 AND 10),
  PRIMARY KEY(company_id,node_id)
);
CREATE TRIGGER company_seed_research AFTER INSERT ON companies BEGIN
  INSERT INTO company_research(company_id,node_id) VALUES
    (NEW.id,'computing'),(NEW.id,'research'),(NEW.id,'drops'),(NEW.id,'infrastructure');
END;
CREATE TRIGGER company_research_spend BEFORE UPDATE OF level ON company_research BEGIN
  SELECT CASE WHEN NEW.level!=OLD.level+1 OR NEW.level>10
    THEN RAISE(ABORT,'invalid_research_level') END;
  SELECT CASE WHEN (SELECT rp_balance FROM companies WHERE id=NEW.company_id)<1000*NEW.level*NEW.level
    THEN RAISE(ABORT,'not_enough_rp') END;
  UPDATE companies SET rp_balance=rp_balance-1000*NEW.level*NEW.level WHERE id=NEW.company_id;
END;
