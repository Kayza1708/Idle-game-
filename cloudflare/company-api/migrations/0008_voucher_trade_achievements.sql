-- Reuse the existing 3-tier Company trader badge for verified voucher exchanges.
-- Purely server-confirmed receipt transitions, never from local chest saves.
CREATE TRIGGER voucher_trade_achievements AFTER UPDATE OF status ON company_voucher_offers
WHEN OLD.status='open' AND NEW.status='accepted' BEGIN
  INSERT INTO player_trade_counters(player_id,completed_trades) VALUES(NEW.seller_id,1)
    ON CONFLICT(player_id) DO UPDATE SET completed_trades=completed_trades+1;
  INSERT INTO player_trade_counters(player_id,completed_trades) VALUES(NEW.buyer_id,1)
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
