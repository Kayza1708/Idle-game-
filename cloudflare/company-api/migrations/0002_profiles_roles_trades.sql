-- Company social features without messaging. Strictly minimal, opt-in profile fields.
-- Never persist email, IP address, raw identity-provider token or arbitrary save data.
ALTER TABLE companies ADD COLUMN leader_id TEXT;
UPDATE companies SET leader_id=COALESCE(
  (SELECT player_id FROM company_members m WHERE m.company_id=companies.id AND m.role='ceo' LIMIT 1),
  founder_id
);
DROP TRIGGER company_capacity;
DROP TRIGGER company_count_added;
DROP TRIGGER company_count_removed;
DROP TRIGGER company_rp_awarded;

CREATE TABLE company_members_v2 (
  player_id TEXT PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK(role IN ('ceo','executive','manager','member')),
  joined_at INTEGER NOT NULL,
  last_claim_at INTEGER NOT NULL,
  contributed_rp INTEGER NOT NULL DEFAULT 0 CHECK(contributed_rp>=0),
  tokens INTEGER NOT NULL DEFAULT 0 CHECK(tokens>=0)
);
INSERT INTO company_members_v2 SELECT * FROM company_members;
DROP TABLE company_members;
ALTER TABLE company_members_v2 RENAME TO company_members;
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
CREATE TRIGGER company_no_ceo_exit BEFORE DELETE ON company_members
WHEN OLD.role='ceo' BEGIN
  SELECT RAISE(ABORT,'transfer_leadership_first');
END;
CREATE TRIGGER company_no_ceo_demote BEFORE UPDATE OF role ON company_members
WHEN OLD.role='ceo' AND NEW.role!='ceo' AND
  (SELECT leader_id FROM companies WHERE id=OLD.company_id)=OLD.player_id
BEGIN SELECT RAISE(ABORT,'transfer_leadership_first'); END;
CREATE TRIGGER company_leader_target BEFORE UPDATE OF leader_id ON companies
WHEN NEW.leader_id!=OLD.leader_id BEGIN
  SELECT CASE WHEN NOT EXISTS(
    SELECT 1 FROM company_members WHERE company_id=NEW.id AND player_id=NEW.leader_id
  ) THEN RAISE(ABORT,'leader_must_be_member') END;
END;
CREATE TRIGGER company_leader_transfer AFTER UPDATE OF leader_id ON companies
WHEN NEW.leader_id!=OLD.leader_id BEGIN
  UPDATE company_members
    SET role=CASE WHEN player_id=NEW.leader_id THEN 'ceo' ELSE 'executive' END
    WHERE company_id=NEW.id AND player_id IN (OLD.leader_id,NEW.leader_id);
END;
CREATE TRIGGER company_rp_awarded AFTER UPDATE OF contributed_rp ON company_members
WHEN NEW.contributed_rp>OLD.contributed_rp BEGIN
  UPDATE companies SET
    rp_balance=rp_balance+(NEW.contributed_rp-OLD.contributed_rp),
    rp_lifetime=rp_lifetime+(NEW.contributed_rp-OLD.contributed_rp)
    WHERE id=NEW.company_id;
END;

-- Public profiles store presentation and opt-in switches; NO player statistics by default.
CREATE TABLE player_profiles (
  player_id TEXT PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
  frame_id TEXT NOT NULL DEFAULT 'basic',
  show_badges INTEGER NOT NULL DEFAULT 0 CHECK(show_badges IN (0,1)),
  show_playtime INTEGER NOT NULL DEFAULT 0 CHECK(show_playtime IN (0,1)),
  show_max_compute INTEGER NOT NULL DEFAULT 0 CHECK(show_max_compute IN (0,1)),
  show_prestiges INTEGER NOT NULL DEFAULT 0 CHECK(show_prestiges IN (0,1)),
  show_int INTEGER NOT NULL DEFAULT 0 CHECK(show_int IN (0,1)),
  show_rank INTEGER NOT NULL DEFAULT 0 CHECK(show_rank IN (0,1))
);
CREATE TABLE player_badges (
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  family TEXT NOT NULL CHECK(family IN ('company-contributor','company-founder','company-trader','prestige','challenge','achievement','hardware')),
  tier INTEGER NOT NULL CHECK(tier BETWEEN 1 AND 3),
  earned_at INTEGER NOT NULL,
  PRIMARY KEY(player_id,family,tier)
);
CREATE TABLE profile_badge_showcase (
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  slot INTEGER NOT NULL CHECK(slot BETWEEN 1 AND 3),
  family TEXT NOT NULL,
  tier INTEGER NOT NULL,
  PRIMARY KEY(player_id,slot),
  FOREIGN KEY(player_id,family,tier) REFERENCES player_badges(player_id,family,tier) ON DELETE CASCADE
);
CREATE TABLE owned_profile_frames (
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  frame_id TEXT NOT NULL CHECK(frame_id IN ('basic','founder','bronze-lab','silver-lab','gold-lab','neon','quantum','singularity')),
  acquired_at INTEGER NOT NULL,
  PRIMARY KEY(player_id,frame_id)
);
-- Verified player stats are optional and server-only; never accept client-submitted numbers.
CREATE TABLE public_player_stats (
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  stat_key TEXT NOT NULL CHECK(stat_key IN ('playtime','max_compute','prestiges','int','rank')),
  stat_value TEXT NOT NULL CHECK(length(stat_value) BETWEEN 1 AND 64),
  verified_at INTEGER NOT NULL,
  PRIMARY KEY(player_id,stat_key)
);
CREATE TRIGGER player_profile_initialize AFTER INSERT ON players BEGIN
  INSERT INTO player_profiles(player_id) VALUES(NEW.id);
  INSERT INTO owned_profile_frames(player_id,frame_id,acquired_at) VALUES(NEW.id,'basic',NEW.created_at);
END;
INSERT INTO player_profiles(player_id) SELECT id FROM players;
INSERT INTO owned_profile_frames(player_id,frame_id,acquired_at)
  SELECT id,'basic',created_at FROM players;
CREATE TRIGGER company_founder_badge AFTER INSERT ON company_members
WHEN NEW.role='ceo' BEGIN
  INSERT OR IGNORE INTO player_badges(player_id,family,tier,earned_at)
  VALUES(NEW.player_id,'company-founder',1,NEW.joined_at);
  INSERT OR IGNORE INTO owned_profile_frames(player_id,frame_id,acquired_at)
  VALUES(NEW.player_id,'founder',NEW.joined_at);
END;
CREATE TRIGGER company_contributor_badges AFTER UPDATE OF contributed_rp ON company_members
WHEN NEW.contributed_rp>OLD.contributed_rp BEGIN
  INSERT OR IGNORE INTO player_badges(player_id,family,tier,earned_at)
    SELECT NEW.player_id,'company-contributor',1,NEW.last_claim_at WHERE NEW.contributed_rp>=1000;
  INSERT OR IGNORE INTO player_badges(player_id,family,tier,earned_at)
    SELECT NEW.player_id,'company-contributor',2,NEW.last_claim_at WHERE NEW.contributed_rp>=10000;
  INSERT OR IGNORE INTO player_badges(player_id,family,tier,earned_at)
    SELECT NEW.player_id,'company-contributor',3,NEW.last_claim_at WHERE NEW.contributed_rp>=50000;
  INSERT OR IGNORE INTO owned_profile_frames(player_id,frame_id,acquired_at)
    SELECT NEW.player_id,'bronze-lab',NEW.last_claim_at WHERE NEW.contributed_rp>=1000;
  INSERT OR IGNORE INTO owned_profile_frames(player_id,frame_id,acquired_at)
    SELECT NEW.player_id,'silver-lab',NEW.last_claim_at WHERE NEW.contributed_rp>=10000;
  INSERT OR IGNORE INTO owned_profile_frames(player_id,frame_id,acquired_at)
    SELECT NEW.player_id,'gold-lab',NEW.last_claim_at WHERE NEW.contributed_rp>=50000;
END;
-- Founder badges for previously created companies.
INSERT OR IGNORE INTO player_badges(player_id,family,tier,earned_at)
  SELECT player_id,'company-founder',1,joined_at FROM company_members WHERE role='ceo';
INSERT OR IGNORE INTO owned_profile_frames(player_id,frame_id,acquired_at)
  SELECT player_id,'founder',joined_at FROM company_members WHERE role='ceo';

-- Only SERVER-minted assets are transferable. Local Unity saves are not accepted as stock.
CREATE TABLE trade_inventory (
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK(kind IN ('component','item','blueprint')),
  asset_id TEXT NOT NULL CHECK(length(asset_id) BETWEEN 2 AND 72),
  quantity INTEGER NOT NULL CHECK(quantity BETWEEN 0 AND 1000000),
  PRIMARY KEY(player_id,kind,asset_id)
);
CREATE TABLE company_trade_offers (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id),
  seller_id TEXT NOT NULL REFERENCES players(id),
  buyer_id TEXT REFERENCES players(id),
  give_kind TEXT NOT NULL CHECK(give_kind IN ('component','item','blueprint')),
  give_id TEXT NOT NULL CHECK(length(give_id) BETWEEN 2 AND 72),
  give_qty INTEGER NOT NULL CHECK(give_qty BETWEEN 1 AND 100),
  want_kind TEXT NOT NULL CHECK(want_kind IN ('component','item','blueprint')),
  want_id TEXT NOT NULL CHECK(length(want_id) BETWEEN 2 AND 72),
  want_qty INTEGER NOT NULL CHECK(want_qty BETWEEN 1 AND 100),
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','accepted','cancelled','expired')),
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL CHECK(expires_at>created_at AND expires_at<=created_at+604800),
  closed_at INTEGER
);
CREATE INDEX idx_company_trades ON company_trade_offers(company_id,status,created_at DESC);

CREATE TRIGGER escrow_offer_check BEFORE INSERT ON company_trade_offers BEGIN
  SELECT CASE WHEN NOT EXISTS(
    SELECT 1 FROM company_members m WHERE m.player_id=NEW.seller_id AND m.company_id=NEW.company_id
  ) THEN RAISE(ABORT,'seller_not_company_member') END;
  SELECT CASE WHEN NOT EXISTS(
    SELECT 1 FROM trade_inventory i WHERE i.player_id=NEW.seller_id AND i.kind=NEW.give_kind
      AND i.asset_id=NEW.give_id AND i.quantity>=NEW.give_qty
  ) THEN RAISE(ABORT,'insufficient_trade_inventory') END;
END;
CREATE TRIGGER escrow_offer_lock AFTER INSERT ON company_trade_offers BEGIN
  UPDATE trade_inventory SET quantity=quantity-NEW.give_qty
    WHERE player_id=NEW.seller_id AND kind=NEW.give_kind AND asset_id=NEW.give_id;
END;
CREATE TRIGGER escrow_accept_guard BEFORE UPDATE OF status ON company_trade_offers
WHEN OLD.status='open' AND NEW.status='accepted' BEGIN
  SELECT CASE WHEN NEW.buyer_id IS NULL OR NEW.buyer_id=OLD.seller_id OR NOT EXISTS(
    SELECT 1 FROM company_members b JOIN company_members s ON s.company_id=b.company_id
      WHERE b.player_id=NEW.buyer_id AND s.player_id=OLD.seller_id AND s.company_id=OLD.company_id
  ) THEN RAISE(ABORT,'invalid_trade_membership') END;
  SELECT CASE WHEN NOT EXISTS(
    SELECT 1 FROM trade_inventory WHERE player_id=NEW.buyer_id AND kind=OLD.want_kind
      AND asset_id=OLD.want_id AND quantity>=OLD.want_qty
  ) THEN RAISE(ABORT,'insufficient_trade_inventory') END;
END;
CREATE TRIGGER escrow_accept AFTER UPDATE OF status ON company_trade_offers
WHEN OLD.status='open' AND NEW.status='accepted' BEGIN
  UPDATE trade_inventory SET quantity=quantity-OLD.want_qty
    WHERE player_id=NEW.buyer_id AND kind=OLD.want_kind AND asset_id=OLD.want_id;
  INSERT INTO trade_inventory(player_id,kind,asset_id,quantity)
    VALUES(NEW.buyer_id,OLD.give_kind,OLD.give_id,OLD.give_qty)
    ON CONFLICT(player_id,kind,asset_id) DO UPDATE SET quantity=quantity+excluded.quantity;
  INSERT INTO trade_inventory(player_id,kind,asset_id,quantity)
    VALUES(OLD.seller_id,OLD.want_kind,OLD.want_id,OLD.want_qty)
    ON CONFLICT(player_id,kind,asset_id) DO UPDATE SET quantity=quantity+excluded.quantity;
END;
CREATE TRIGGER escrow_cancel AFTER UPDATE OF status ON company_trade_offers
WHEN OLD.status='open' AND NEW.status IN ('cancelled','expired') BEGIN
  INSERT INTO trade_inventory(player_id,kind,asset_id,quantity)
    VALUES(OLD.seller_id,OLD.give_kind,OLD.give_id,OLD.give_qty)
    ON CONFLICT(player_id,kind,asset_id) DO UPDATE SET quantity=quantity+excluded.quantity;
END;
CREATE TRIGGER escrow_no_reopen BEFORE UPDATE OF status ON company_trade_offers
WHEN OLD.status!='open' OR NEW.status NOT IN ('accepted','cancelled','expired') BEGIN
  SELECT RAISE(ABORT,'trade_already_closed');
END;
CREATE TRIGGER escrow_leaving_company BEFORE DELETE ON company_members BEGIN
  UPDATE company_trade_offers SET status='cancelled',closed_at=OLD.last_claim_at
    WHERE company_id=OLD.company_id AND seller_id=OLD.player_id AND status='open';
END;
-- Closed trades can be pruned after a short retention window, subject to legal needs.
