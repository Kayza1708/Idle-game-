"""Real SQLite trigger transactions; prepared server stock, never a client mint."""
import concurrent.futures
import pathlib
import sqlite3
import tempfile
import unittest
import social_schema_test as previous

MIGRATION=previous.ROOT/'0009_daily_trade_limit.sql'
class TradeLimitTests(unittest.TestCase):
 def setUp(self):
  old=previous.SocialSchemaTests();old.setUp();self.db=old.db;self.db.executescript(MIGRATION.read_text())
  self.db.execute("INSERT INTO trade_inventory VALUES('alice','component','circuits',100)")
  self.db.execute("INSERT INTO trade_inventory VALUES('bob','component','copperCoils',100)")
  self.db.execute("UPDATE player_voucher_balances SET balance=100")
 def test_migration_obeys_actual_d1_compound_select_limit(self):
  old=previous.SocialSchemaTests();old.setUp()
  try:
   old.db.setlimit(sqlite3.SQLITE_LIMIT_COMPOUND_SELECT,5)
   old.db.executescript(MIGRATION.read_text())
   self.assertEqual(old.db.execute('PRAGMA foreign_key_check').fetchall(),[])
  finally:old.db.close()
 def offer(self,id='offer',at=200000):
  self.db.execute("INSERT INTO company_trade_offers(id,company_id,seller_id,give_kind,give_id,give_qty,want_kind,want_id,want_qty,created_at,expires_at) VALUES(?,'company','alice','component','circuits',1,'component','copperCoils',1,?,?)",(id,at,at+86400))
 def accept(self,id,at=200001):
  self.db.execute("UPDATE company_trade_offers SET status='accepted',buyer_id='bob',closed_at=? WHERE id=? AND status='open'",(at,id))
 def count(self,p='alice',day=2):
  row=self.db.execute('SELECT completed FROM player_trade_days WHERE player_id=? AND utc_day=?',(p,day)).fetchone();return row[0] if row else 0
 def gift(self,id,at=200001):
  self.db.execute("INSERT INTO company_voucher_gifts VALUES(?,'company','alice','bob',1,?)",(id,at))
 def test_five_counts_both_and_sixth_is_wholly_rolled_back(self):
  for i in range(5):self.offer(str(i));self.accept(str(i))
  self.assertEqual((self.count(),self.count('bob')),(5,5));self.offer('six')
  snapshot=list(self.db.execute('SELECT * FROM trade_inventory ORDER BY player_id,asset_id'))
  with self.assertRaisesRegex(sqlite3.IntegrityError,'daily_trade_limit'):self.accept('six')
  self.assertEqual(snapshot,list(self.db.execute('SELECT * FROM trade_inventory ORDER BY player_id,asset_id')))
  self.assertEqual(self.db.execute("SELECT status FROM company_trade_offers WHERE id='six'").fetchone()[0],'open')
 def test_offers_cancellations_expiry_and_replay_do_not_spend(self):
  self.offer('cancel');self.db.execute("UPDATE company_trade_offers SET status='cancelled',closed_at=200002 WHERE id='cancel'")
  self.offer('expire');self.db.execute("UPDATE company_trade_offers SET status='expired',closed_at=300000 WHERE id='expire'")
  self.assertEqual(self.count(),0);self.offer('paid');self.accept('paid');self.accept('paid');self.assertEqual(self.count(),1)
  with self.assertRaises(sqlite3.IntegrityError):self.db.execute("UPDATE company_trade_offers SET status='accepted' WHERE id='paid'")
  self.assertEqual(self.count('bob'),1)
 def test_gifts_and_voucher_trades_share_the_same_allowance(self):
  self.gift('gift');self.offer('normal');self.accept('normal')
  self.db.execute("INSERT INTO company_voucher_offers(id,company_id,seller_id,quantity,want_kind,want_id,want_qty,created_at,expires_at) VALUES('voucher','company','alice',1,'component','copperCoils',1,200000,250000)")
  self.db.execute("UPDATE company_voucher_offers SET status='accepted',buyer_id='bob',closed_at=200003 WHERE id='voucher'")
  self.assertEqual((self.count(),self.count('bob')),(3,3));self.gift('g2');self.gift('g3')
  wallets=list(self.db.execute('SELECT * FROM player_voucher_balances ORDER BY player_id'))
  with self.assertRaisesRegex(sqlite3.IntegrityError,'daily_trade_limit'):self.gift('blocked')
  self.assertEqual(wallets,list(self.db.execute('SELECT * FROM player_voucher_balances ORDER BY player_id')))
 def test_recipient_limit_rolls_back_sender_counter_and_balance(self):
  self.db.execute("INSERT INTO player_trade_days VALUES('bob',2,5)")
  with self.assertRaisesRegex(sqlite3.IntegrityError,'daily_trade_limit'):self.gift('blocked')
  self.assertEqual(self.count(),0);self.assertEqual(self.db.execute("SELECT balance FROM player_voucher_balances WHERE player_id='alice'").fetchone()[0],100)
 def test_failed_payment_does_not_consume_and_duplicate_gift_cannot_replay(self):
  self.db.execute("UPDATE trade_inventory SET quantity=0 WHERE player_id='bob'");self.offer('empty')
  with self.assertRaises(sqlite3.IntegrityError):self.accept('empty')
  self.assertEqual(self.count(),0);self.gift('same')
  with self.assertRaises(sqlite3.IntegrityError):self.gift('same')
  self.assertEqual(self.count(),1)
 def test_exact_utc_midnight_resets_for_both_without_clearing_history(self):
  for i in range(5):self.gift(str(i),259199)
  self.gift('next',259200)
  self.assertEqual((self.count(day=2),self.count(day=3),self.count('bob',3)),(5,1,1))
 def test_two_concurrent_accepts_compete_for_the_last_slot(self):
  for i in range(4):self.offer(str(i));self.accept(str(i))
  self.offer('race-a');self.offer('race-b');self.db.commit()
  with tempfile.TemporaryDirectory() as directory:
   path=str(pathlib.Path(directory)/'d1.sqlite');connection=sqlite3.connect(path);self.db.backup(connection);connection.close()
   def submit(id):
    db=sqlite3.connect(path,timeout=15);db.execute('PRAGMA foreign_keys=ON')
    try:
     db.execute("UPDATE company_trade_offers SET status='accepted',buyer_id='bob',closed_at=200005 WHERE id=? AND status='open'",(id,));db.commit();return True
    except sqlite3.IntegrityError as e:db.rollback();self.assertIn('daily_trade_limit',str(e));return False
    finally:db.close()
   with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:results=list(pool.map(submit,['race-a','race-b']))
   self.assertEqual(sorted(results),[False,True]);check=sqlite3.connect(path)
   self.assertEqual(check.execute('SELECT completed FROM player_trade_days ORDER BY player_id').fetchall(),[(5,),(5,)])
   self.assertEqual(check.execute("SELECT COUNT(*) FROM company_trade_offers WHERE status='accepted'").fetchone()[0],5);check.close()
 def test_backfill_existing_transfers_preserves_todays_limit(self):
  self.db.executescript('DROP TRIGGER trade_daily_accept; DROP TRIGGER voucher_daily_accept; DROP TRIGGER voucher_daily_gift; DROP TABLE player_trade_days;')
  for i in range(6):self.gift(str(i))
  self.db.executescript(MIGRATION.read_text());self.assertEqual(self.count(),5)
  with self.assertRaisesRegex(sqlite3.IntegrityError,'daily_trade_limit'):self.gift('seventh')
if __name__=='__main__':unittest.main()
