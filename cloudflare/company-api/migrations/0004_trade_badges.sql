-- Preserve only minimal accumulated trade count after dated trade details expire.
-- All counts come from atomic, completed D1 escrow transactions (never from Unity).
CREATE TABLE player_trade_counters (
  player_id TEXT PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
  completed_trades INTEGER NOT NULL DEFAULT 0 CHECK(completed_trades >= 0)
);
CREATE TRIGGER company_trade_badges AFTER UPDATE OF status ON company_trade_offers
WHEN OLD.status='open' AND NEW.status='accepted' BEGIN
  INSERT INTO player_trade_counters(player_id,completed_trades)
    VALUES(NEW.seller_id,1)
    ON CONFLICT(player_id) DO UPDATE SET completed_trades=completed_trades+1;
  INSERT INTO player_trade_counters(player_id,completed_trades)
    VALUES(NEW.buyer_id,1)
    ON CONFLICT(player_id) DO UPDATE SET completed_trades=completed_trades+1;

  INSERT OR IGNORE INTO player_badges(player_id,family,tier,earned_at)
    SELECT player_id,'company-trader',1,NEW.closed_at FROM player_trade_counters
    WHERE player_id IN (NEW.seller_id,NEW.buyer_id) AND completed_trades>=1;
  INSERT OR IGNORE INTO player_badges(player_id,family,tier,earned_at)
    SELECT player_id,'company-trader',2,NEW.closed_at FROM player_trade_counters
    WHERE player_id IN (NEW.seller_id,NEW.buyer_id) AND completed_trades>=10;
  INSERT OR IGNORE INTO player_badges(player_id,family,tier,earned_at)
    SELECT player_id,'company-trader',3,NEW.closed_at FROM player_trade_counters
    WHERE player_id IN (NEW.seller_id,NEW.buyer_id) AND completed_trades>=100;
END;
