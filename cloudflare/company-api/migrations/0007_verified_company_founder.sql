-- A Company founder must spend 500 SERVER-VERIFIED Gems. Locally modifiable
-- GameState.Gems is never a valid payment or access credential.
ALTER TABLE players ADD COLUMN company_access_verified INTEGER NOT NULL DEFAULT 0
  CHECK(company_access_verified IN (0,1));
CREATE TABLE verified_gem_wallet (
 player_id TEXT PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
 balance INTEGER NOT NULL DEFAULT 0 CHECK(balance BETWEEN 0 AND 9007199254740991)
);
INSERT INTO verified_gem_wallet(player_id) SELECT id FROM players;
CREATE TRIGGER player_verified_wallet_initialize AFTER INSERT ON players BEGIN
 INSERT INTO verified_gem_wallet(player_id) VALUES(NEW.id);
END;
CREATE TRIGGER paid_company_founder_check BEFORE INSERT ON companies BEGIN
 SELECT CASE WHEN NOT EXISTS(
   SELECT 1 FROM players WHERE id=NEW.founder_id AND company_access_verified=1
 ) THEN RAISE(ABORT,'company_access_not_verified') END;
 SELECT CASE WHEN NOT EXISTS(
   SELECT 1 FROM verified_gem_wallet WHERE player_id=NEW.founder_id AND balance>=500
 ) THEN RAISE(ABORT,'insufficient_verified_gems') END;
END;
CREATE TRIGGER paid_company_founder_debit AFTER INSERT ON companies BEGIN
 UPDATE verified_gem_wallet SET balance=balance-500 WHERE player_id=NEW.founder_id;
END;
-- This is the only online admission permission: an unverified local progress
-- screenshot or self-submitted INT count never grants this flag.
