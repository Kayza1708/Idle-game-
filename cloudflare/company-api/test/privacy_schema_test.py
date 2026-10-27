import unittest
import sqlite3
import social_schema_test as previous
class PrivacySchemaTests(unittest.TestCase):
 def setUp(self):
  old=previous.SocialSchemaTests();old.setUp();self.db=old.db
  self.db.executescript((previous.ROOT/'0009_daily_trade_limit.sql').read_text())
  self.db.executescript((previous.ROOT/'0010_account_privacy.sql').read_text())
 def scalar(self,sql):return self.db.execute(sql).fetchone()[0]
 def test_delete_leader_transfers_company_and_removes_personal_records(self):
  self.db.execute("INSERT INTO sessions VALUES('hash','alice',100,999999)")
  self.db.execute("INSERT INTO player_trade_days VALUES('alice',2,4)")
  self.db.execute("INSERT INTO player_trade_days VALUES('bob',2,4)")
  self.db.execute("DELETE FROM players WHERE id='alice'")
  self.assertEqual(self.scalar("SELECT leader_id FROM companies WHERE id='company'"),'bob')
  self.assertEqual(self.scalar("SELECT founder_id FROM companies WHERE id='company'"),'bob')
  for table,column in [('players','id'),('sessions','player_id'),('player_profiles','player_id'),('player_badges','player_id'),('player_voucher_balances','player_id'),('player_trade_days','player_id')]:self.assertEqual(self.scalar(f"SELECT COUNT(*) FROM {table} WHERE {column}='alice'"),0)
  self.assertEqual(self.scalar("SELECT completed FROM player_trade_days WHERE player_id='bob'"),4)
  self.assertEqual(self.db.execute('PRAGMA foreign_key_check').fetchall(),[])
 def test_sole_founder_can_delete_account_and_company(self):
  self.db.execute("DELETE FROM players WHERE id='bob'");self.db.execute("DELETE FROM players WHERE id='alice'")
  self.assertEqual(self.scalar('SELECT COUNT(*) FROM companies'),0);self.assertEqual(self.scalar('SELECT COUNT(*) FROM players'),0)
  self.assertEqual(self.db.execute('PRAGMA foreign_key_check').fetchall(),[])
 def test_regular_ceo_exit_stays_protected(self):
  with self.assertRaisesRegex(sqlite3.IntegrityError,'transfer_leadership_first'):self.db.execute("DELETE FROM company_members WHERE player_id='alice'")
 def test_blocked_gift_cannot_consume_allowance_or_balance(self):
  self.db.execute("UPDATE player_voucher_balances SET balance=10")
  self.db.execute("INSERT INTO player_blocks VALUES('bob','alice')")
  with self.assertRaisesRegex(sqlite3.IntegrityError,'player_blocked'):self.db.execute("INSERT INTO company_voucher_gifts VALUES('g','company','alice','bob',1,200000)")
  self.assertEqual(self.scalar('SELECT COUNT(*) FROM player_trade_days'),0)
  self.assertEqual(self.scalar("SELECT balance FROM player_voucher_balances WHERE player_id='alice'"),10)
 def test_deleting_seller_releases_open_escrow_and_preserves_other_wallet(self):
  self.db.execute("INSERT INTO trade_inventory VALUES('alice','component','circuits',10)")
  self.db.execute("INSERT INTO trade_inventory VALUES('bob','component','graphene',10)")
  self.db.execute("INSERT INTO company_trade_offers(id,company_id,seller_id,give_kind,give_id,give_qty,want_kind,want_id,want_qty,created_at,expires_at) VALUES('o','company','alice','component','circuits',3,'component','graphene',2,200000,250000)")
  self.db.execute("DELETE FROM players WHERE id='alice'")
  self.assertEqual(self.scalar("SELECT quantity FROM trade_inventory WHERE player_id='bob'"),10)
  self.assertEqual(self.scalar('SELECT COUNT(*) FROM company_trade_offers'),0)
  self.assertEqual(self.scalar('SELECT COUNT(*) FROM player_trade_days'),0)
 def test_reports_have_fixed_codes_and_are_removed_with_account(self):
  self.db.execute("INSERT INTO moderation_reports VALUES('r','bob','player','alice','name',200000)")
  with self.assertRaises(sqlite3.IntegrityError):self.db.execute("INSERT INTO moderation_reports VALUES('bad','bob','player','alice','free text',200000)")
  self.db.execute("DELETE FROM players WHERE id='alice'");self.assertEqual(self.scalar('SELECT COUNT(*) FROM moderation_reports'),0)
if __name__=='__main__':unittest.main()
