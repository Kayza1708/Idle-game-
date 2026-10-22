-- Server-verified Gumball vouchers. NEVER bridge unverified local chest or Season vouchers.
-- Three lifetime RP milestones mint tickets exactly once per account, even after changing Company.
CREATE TABLE player_voucher_balances (
 player_id TEXT PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
 balance INTEGER NOT NULL DEFAULT 0 CHECK(balance BETWEEN 0 AND 999)
);
INSERT INTO player_voucher_balances(player_id) SELECT id FROM players;
CREATE TRIGGER new_player_voucher_wallet AFTER INSERT ON players BEGIN
 INSERT INTO player_voucher_balances(player_id) VALUES(NEW.id);
END;
CREATE TABLE player_voucher_milestones (
 player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
 tier INTEGER NOT NULL CHECK(tier IN (1000,10000,50000)),
 earned_at INTEGER NOT NULL,
 PRIMARY KEY(player_id,tier)
);
CREATE TRIGGER company_voucher_1000 AFTER UPDATE OF contributed_rp ON company_members
WHEN NEW.contributed_rp>=1000 AND OLD.contributed_rp<1000 AND NOT EXISTS(
 SELECT 1 FROM player_voucher_milestones WHERE player_id=NEW.player_id AND tier=1000
) BEGIN
 INSERT INTO player_voucher_milestones VALUES(NEW.player_id,1000,NEW.last_claim_at);
 UPDATE player_voucher_balances SET balance=balance+1 WHERE player_id=NEW.player_id;
END;
CREATE TRIGGER company_voucher_10000 AFTER UPDATE OF contributed_rp ON company_members
WHEN NEW.contributed_rp>=10000 AND OLD.contributed_rp<10000 AND NOT EXISTS(
 SELECT 1 FROM player_voucher_milestones WHERE player_id=NEW.player_id AND tier=10000
) BEGIN
 INSERT INTO player_voucher_milestones VALUES(NEW.player_id,10000,NEW.last_claim_at);
 UPDATE player_voucher_balances SET balance=balance+1 WHERE player_id=NEW.player_id;
END;
CREATE TRIGGER company_voucher_50000 AFTER UPDATE OF contributed_rp ON company_members
WHEN NEW.contributed_rp>=50000 AND OLD.contributed_rp<50000 AND NOT EXISTS(
 SELECT 1 FROM player_voucher_milestones WHERE player_id=NEW.player_id AND tier=50000
) BEGIN
 INSERT INTO player_voucher_milestones VALUES(NEW.player_id,50000,NEW.last_claim_at);
 UPDATE player_voucher_balances SET balance=balance+1 WHERE player_id=NEW.player_id;
END;
-- Backfill existing verified Company lifetime milestones, never import client-side saves.
INSERT OR IGNORE INTO player_voucher_milestones(player_id,tier,earned_at)
 SELECT player_id,1000,last_claim_at FROM company_members WHERE contributed_rp>=1000;
INSERT OR IGNORE INTO player_voucher_milestones(player_id,tier,earned_at)
 SELECT player_id,10000,last_claim_at FROM company_members WHERE contributed_rp>=10000;
INSERT OR IGNORE INTO player_voucher_milestones(player_id,tier,earned_at)
 SELECT player_id,50000,last_claim_at FROM company_members WHERE contributed_rp>=50000;
UPDATE player_voucher_balances SET balance=(
 SELECT COUNT(*) FROM player_voucher_milestones m WHERE m.player_id=player_voucher_balances.player_id
);

-- Structured, no-message gifts. Server insertion verifies both player ownership and a shared Company.
CREATE TABLE company_voucher_gifts (
 id TEXT PRIMARY KEY,
 company_id TEXT NOT NULL REFERENCES companies(id),
 sender_id TEXT NOT NULL REFERENCES players(id),
 recipient_id TEXT NOT NULL REFERENCES players(id),
 quantity INTEGER NOT NULL CHECK(quantity BETWEEN 1 AND 5),
 created_at INTEGER NOT NULL
);
CREATE TRIGGER voucher_gift_guard BEFORE INSERT ON company_voucher_gifts BEGIN
 SELECT CASE WHEN NEW.sender_id=NEW.recipient_id OR NOT EXISTS(
  SELECT 1 FROM company_members a JOIN company_members b ON a.company_id=b.company_id
    WHERE a.player_id=NEW.sender_id AND b.player_id=NEW.recipient_id
    AND a.company_id=NEW.company_id
    AND a.joined_at<=NEW.created_at-172800 AND b.joined_at<=NEW.created_at-172800
 ) THEN RAISE(ABORT,'invalid_voucher_gift_membership') END;
 SELECT CASE WHEN NOT EXISTS(
  SELECT 1 FROM player_voucher_balances WHERE player_id=NEW.sender_id AND balance>=NEW.quantity
 ) THEN RAISE(ABORT,'insufficient_verified_vouchers') END;
 SELECT CASE WHEN NOT EXISTS(
  SELECT 1 FROM player_voucher_balances WHERE player_id=NEW.recipient_id AND balance<=999-NEW.quantity
 ) THEN RAISE(ABORT,'voucher_capacity') END;
END;
CREATE TRIGGER voucher_gift_transfer AFTER INSERT ON company_voucher_gifts BEGIN
 UPDATE player_voucher_balances SET balance=balance-NEW.quantity WHERE player_id=NEW.sender_id;
 UPDATE player_voucher_balances SET balance=balance+NEW.quantity WHERE player_id=NEW.recipient_id;
END;

-- Voucher exchange: seller escrows verified tickets; buyer escrows verified components/items
-- only when accepting. No free text, no Gems, no local save inputs.
CREATE TABLE company_voucher_offers (
 id TEXT PRIMARY KEY,
 company_id TEXT NOT NULL REFERENCES companies(id),
 seller_id TEXT NOT NULL REFERENCES players(id),
 buyer_id TEXT REFERENCES players(id),
 quantity INTEGER NOT NULL CHECK(quantity BETWEEN 1 AND 10),
 want_kind TEXT NOT NULL CHECK(want_kind IN ('component','item','blueprint')),
 want_id TEXT NOT NULL CHECK(length(want_id) BETWEEN 2 AND 72),
 want_qty INTEGER NOT NULL CHECK(want_qty BETWEEN 1 AND 100),
 status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','accepted','cancelled','expired')),
 created_at INTEGER NOT NULL,
 expires_at INTEGER NOT NULL CHECK(expires_at>created_at AND expires_at<=created_at+259200),
 closed_at INTEGER
);
CREATE INDEX idx_voucher_offers_company ON company_voucher_offers(company_id,status,created_at DESC);
CREATE TRIGGER voucher_offer_guard BEFORE INSERT ON company_voucher_offers BEGIN
 SELECT CASE WHEN NOT EXISTS(
  SELECT 1 FROM company_members WHERE player_id=NEW.seller_id AND company_id=NEW.company_id
    AND joined_at<=NEW.created_at-172800
 ) THEN RAISE(ABORT,'invalid_voucher_offer_membership') END;
 SELECT CASE WHEN NOT EXISTS(
  SELECT 1 FROM player_voucher_balances WHERE player_id=NEW.seller_id AND balance>=NEW.quantity
 ) THEN RAISE(ABORT,'insufficient_verified_vouchers') END;
END;
CREATE TRIGGER voucher_offer_escrow AFTER INSERT ON company_voucher_offers BEGIN
 UPDATE player_voucher_balances SET balance=balance-NEW.quantity WHERE player_id=NEW.seller_id;
END;
CREATE TRIGGER voucher_offer_accept_guard BEFORE UPDATE OF status ON company_voucher_offers
WHEN OLD.status='open' AND NEW.status='accepted' BEGIN
 SELECT CASE WHEN NEW.buyer_id IS NULL OR NEW.buyer_id=OLD.seller_id OR
  NEW.closed_at IS NULL OR NEW.closed_at>OLD.expires_at OR NOT EXISTS(
  SELECT 1 FROM company_members a JOIN company_members b ON a.company_id=b.company_id
  WHERE a.player_id=NEW.buyer_id AND b.player_id=OLD.seller_id
   AND a.company_id=OLD.company_id AND a.joined_at<=NEW.closed_at-172800
   AND b.joined_at<=NEW.closed_at-172800
 ) THEN RAISE(ABORT,'invalid_voucher_trade_membership') END;
 SELECT CASE WHEN NOT EXISTS(
  SELECT 1 FROM trade_inventory i WHERE i.player_id=NEW.buyer_id
    AND i.kind=OLD.want_kind AND i.asset_id=OLD.want_id AND i.quantity>=OLD.want_qty
 ) THEN RAISE(ABORT,'insufficient_trade_inventory') END;
 SELECT CASE WHEN NOT EXISTS(
  SELECT 1 FROM player_voucher_balances WHERE player_id=NEW.buyer_id
    AND balance<=999-OLD.quantity
 ) THEN RAISE(ABORT,'voucher_capacity') END;
END;
CREATE TRIGGER voucher_offer_accept AFTER UPDATE OF status ON company_voucher_offers
WHEN OLD.status='open' AND NEW.status='accepted' BEGIN
 UPDATE trade_inventory SET quantity=quantity-OLD.want_qty
    WHERE player_id=NEW.buyer_id AND kind=OLD.want_kind AND asset_id=OLD.want_id;
 INSERT INTO trade_inventory(player_id,kind,asset_id,quantity)
    VALUES(OLD.seller_id,OLD.want_kind,OLD.want_id,OLD.want_qty)
    ON CONFLICT(player_id,kind,asset_id) DO UPDATE SET quantity=quantity+excluded.quantity;
 UPDATE player_voucher_balances SET balance=balance+OLD.quantity WHERE player_id=NEW.buyer_id;
END;
CREATE TRIGGER voucher_offer_restore AFTER UPDATE OF status ON company_voucher_offers
WHEN OLD.status='open' AND NEW.status IN ('cancelled','expired') BEGIN
 UPDATE player_voucher_balances SET balance=balance+OLD.quantity WHERE player_id=OLD.seller_id;
END;
CREATE TRIGGER voucher_offer_no_reopen BEFORE UPDATE OF status ON company_voucher_offers
WHEN OLD.status!='open' OR NEW.status NOT IN ('accepted','cancelled','expired') BEGIN
 SELECT RAISE(ABORT,'voucher_trade_already_closed');
END;
CREATE TRIGGER voucher_offer_company_departure BEFORE DELETE ON company_members BEGIN
 UPDATE company_voucher_offers SET status='cancelled',closed_at=OLD.last_claim_at
 WHERE seller_id=OLD.player_id AND company_id=OLD.company_id AND status='open';
END;
-- An online voucher can be consumed exactly once by a server authenticated identity.
-- Unity integration must atomically record the receipt locally before drawing.
CREATE TABLE player_voucher_redemptions (
 id TEXT PRIMARY KEY,
 player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
 redeemed_at INTEGER NOT NULL
);
CREATE TRIGGER voucher_redeem_guard BEFORE INSERT ON player_voucher_redemptions BEGIN
 SELECT CASE WHEN NOT EXISTS(
  SELECT 1 FROM player_voucher_balances WHERE player_id=NEW.player_id AND balance>=1
 ) THEN RAISE(ABORT,'insufficient_verified_vouchers') END;
END;
CREATE TRIGGER voucher_redeem_spend AFTER INSERT ON player_voucher_redemptions BEGIN
 UPDATE player_voucher_balances SET balance=balance-1 WHERE player_id=NEW.player_id;
END;
