-- Awards are derived only from completed server-authoritative escrow trades.
-- No local Unity item claims or chat text.
CREATE INDEX idx_trades_seller_status ON company_trade_offers(seller_id,status);
CREATE INDEX idx_trades_buyer_status ON company_trade_offers(buyer_id,status);
CREATE TRIGGER company_trade_badges AFTER UPDATE OF status ON company_trade_offers
WHEN OLD.status='open' AND NEW.status='accepted' BEGIN
  INSERT OR IGNORE INTO player_badges(player_id,family,tier,earned_at)
    SELECT p.id,'company-trader',1,NEW.closed_at
    FROM (SELECT NEW.seller_id AS id UNION SELECT NEW.buyer_id AS id) p
    WHERE (SELECT COUNT(*) FROM company_trade_offers o WHERE o.status='accepted' AND (o.seller_id=p.id OR o.buyer_id=p.id))>=1;
  INSERT OR IGNORE INTO player_badges(player_id,family,tier,earned_at)
    SELECT p.id,'company-trader',2,NEW.closed_at
    FROM (SELECT NEW.seller_id AS id UNION SELECT NEW.buyer_id AS id) p
    WHERE (SELECT COUNT(*) FROM company_trade_offers o WHERE o.status='accepted' AND (o.seller_id=p.id OR o.buyer_id=p.id))>=10;
  INSERT OR IGNORE INTO player_badges(player_id,family,tier,earned_at)
    SELECT p.id,'company-trader',3,NEW.closed_at
    FROM (SELECT NEW.seller_id AS id UNION SELECT NEW.buyer_id AS id) p
    WHERE (SELECT COUNT(*) FROM company_trade_offers o WHERE o.status='accepted' AND (o.seller_id=p.id OR o.buyer_id=p.id))>=100;
END;
