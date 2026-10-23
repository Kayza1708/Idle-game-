-- Daily completed transfers; generated policy bound to BALANCE.companyTradeDailyLimit=5.
-- D1/SQLite writes serialize. BEFORE triggers and escrow/balances share ONE SQL statement:
-- a failure for either participant aborts ALL counter, inventory and badge changes.
CREATE TABLE player_trade_days (
 player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
 utc_day INTEGER NOT NULL CHECK(utc_day>=0),
 completed INTEGER NOT NULL CHECK(completed BETWEEN 0 AND 5),
 PRIMARY KEY(player_id,utc_day)
);
-- Preserve completed transactions from before this migration. More than five historical
-- completions consume today's entire allowance rather than resetting it on deployment.
-- D1 limits compound SELECT to five terms; accumulate six source/party totals without UNION.
INSERT INTO player_trade_days(player_id,utc_day,completed)
 SELECT seller_id,CAST(closed_at/86400 AS INTEGER),MIN(COUNT(*),5) FROM company_trade_offers
 WHERE status='accepted' AND seller_id IS NOT NULL AND closed_at IS NOT NULL
 GROUP BY seller_id,CAST(closed_at/86400 AS INTEGER)
 ON CONFLICT(player_id,utc_day) DO UPDATE SET completed=MIN(5,player_trade_days.completed+excluded.completed);
INSERT INTO player_trade_days(player_id,utc_day,completed)
 SELECT buyer_id,CAST(closed_at/86400 AS INTEGER),MIN(COUNT(*),5) FROM company_trade_offers
 WHERE status='accepted' AND buyer_id IS NOT NULL AND closed_at IS NOT NULL
 GROUP BY buyer_id,CAST(closed_at/86400 AS INTEGER)
 ON CONFLICT(player_id,utc_day) DO UPDATE SET completed=MIN(5,player_trade_days.completed+excluded.completed);
INSERT INTO player_trade_days(player_id,utc_day,completed)
 SELECT seller_id,CAST(closed_at/86400 AS INTEGER),MIN(COUNT(*),5) FROM company_voucher_offers
 WHERE status='accepted' AND seller_id IS NOT NULL AND closed_at IS NOT NULL
 GROUP BY seller_id,CAST(closed_at/86400 AS INTEGER)
 ON CONFLICT(player_id,utc_day) DO UPDATE SET completed=MIN(5,player_trade_days.completed+excluded.completed);
INSERT INTO player_trade_days(player_id,utc_day,completed)
 SELECT buyer_id,CAST(closed_at/86400 AS INTEGER),MIN(COUNT(*),5) FROM company_voucher_offers
 WHERE status='accepted' AND buyer_id IS NOT NULL AND closed_at IS NOT NULL
 GROUP BY buyer_id,CAST(closed_at/86400 AS INTEGER)
 ON CONFLICT(player_id,utc_day) DO UPDATE SET completed=MIN(5,player_trade_days.completed+excluded.completed);
INSERT INTO player_trade_days(player_id,utc_day,completed)
 SELECT sender_id,CAST(created_at/86400 AS INTEGER),MIN(COUNT(*),5) FROM company_voucher_gifts
 WHERE 1=1 AND sender_id IS NOT NULL AND created_at IS NOT NULL
 GROUP BY sender_id,CAST(created_at/86400 AS INTEGER)
 ON CONFLICT(player_id,utc_day) DO UPDATE SET completed=MIN(5,player_trade_days.completed+excluded.completed);
INSERT INTO player_trade_days(player_id,utc_day,completed)
 SELECT recipient_id,CAST(created_at/86400 AS INTEGER),MIN(COUNT(*),5) FROM company_voucher_gifts
 WHERE 1=1 AND recipient_id IS NOT NULL AND created_at IS NOT NULL
 GROUP BY recipient_id,CAST(created_at/86400 AS INTEGER)
 ON CONFLICT(player_id,utc_day) DO UPDATE SET completed=MIN(5,player_trade_days.completed+excluded.completed);

CREATE TRIGGER trade_daily_accept BEFORE UPDATE OF status ON company_trade_offers
WHEN OLD.status='open' AND NEW.status='accepted'
BEGIN
 SELECT CASE WHEN NEW.closed_at IS NULL OR NEW.closed_at<0 THEN RAISE(ABORT,'invalid_trade_time') END;
 SELECT CASE WHEN COALESCE((SELECT completed FROM player_trade_days WHERE player_id=OLD.seller_id AND utc_day=CAST(NEW.closed_at/86400 AS INTEGER)),0)>=5 THEN RAISE(ABORT,'daily_trade_limit') END;
 INSERT INTO player_trade_days(player_id,utc_day,completed) VALUES(OLD.seller_id,CAST(NEW.closed_at/86400 AS INTEGER),1) ON CONFLICT(player_id,utc_day) DO UPDATE SET completed=completed+1;
 SELECT CASE WHEN COALESCE((SELECT completed FROM player_trade_days WHERE player_id=NEW.buyer_id AND utc_day=CAST(NEW.closed_at/86400 AS INTEGER)),0)>=5 THEN RAISE(ABORT,'daily_trade_limit') END;
 INSERT INTO player_trade_days(player_id,utc_day,completed) VALUES(NEW.buyer_id,CAST(NEW.closed_at/86400 AS INTEGER),1) ON CONFLICT(player_id,utc_day) DO UPDATE SET completed=completed+1;
END;

CREATE TRIGGER voucher_daily_accept BEFORE UPDATE OF status ON company_voucher_offers
WHEN OLD.status='open' AND NEW.status='accepted'
BEGIN
 SELECT CASE WHEN NEW.closed_at IS NULL OR NEW.closed_at<0 THEN RAISE(ABORT,'invalid_trade_time') END;
 SELECT CASE WHEN COALESCE((SELECT completed FROM player_trade_days WHERE player_id=OLD.seller_id AND utc_day=CAST(NEW.closed_at/86400 AS INTEGER)),0)>=5 THEN RAISE(ABORT,'daily_trade_limit') END;
 INSERT INTO player_trade_days(player_id,utc_day,completed) VALUES(OLD.seller_id,CAST(NEW.closed_at/86400 AS INTEGER),1) ON CONFLICT(player_id,utc_day) DO UPDATE SET completed=completed+1;
 SELECT CASE WHEN COALESCE((SELECT completed FROM player_trade_days WHERE player_id=NEW.buyer_id AND utc_day=CAST(NEW.closed_at/86400 AS INTEGER)),0)>=5 THEN RAISE(ABORT,'daily_trade_limit') END;
 INSERT INTO player_trade_days(player_id,utc_day,completed) VALUES(NEW.buyer_id,CAST(NEW.closed_at/86400 AS INTEGER),1) ON CONFLICT(player_id,utc_day) DO UPDATE SET completed=completed+1;
END;

CREATE TRIGGER voucher_daily_gift BEFORE INSERT ON company_voucher_gifts
BEGIN
 SELECT CASE WHEN NEW.created_at IS NULL OR NEW.created_at<0 THEN RAISE(ABORT,'invalid_trade_time') END;
 SELECT CASE WHEN COALESCE((SELECT completed FROM player_trade_days WHERE player_id=NEW.sender_id AND utc_day=CAST(NEW.created_at/86400 AS INTEGER)),0)>=5 THEN RAISE(ABORT,'daily_trade_limit') END;
 INSERT INTO player_trade_days(player_id,utc_day,completed) VALUES(NEW.sender_id,CAST(NEW.created_at/86400 AS INTEGER),1) ON CONFLICT(player_id,utc_day) DO UPDATE SET completed=completed+1;
 SELECT CASE WHEN COALESCE((SELECT completed FROM player_trade_days WHERE player_id=NEW.recipient_id AND utc_day=CAST(NEW.created_at/86400 AS INTEGER)),0)>=5 THEN RAISE(ABORT,'daily_trade_limit') END;
 INSERT INTO player_trade_days(player_id,utc_day,completed) VALUES(NEW.recipient_id,CAST(NEW.created_at/86400 AS INTEGER),1) ON CONFLICT(player_id,utc_day) DO UPDATE SET completed=completed+1;
END;
