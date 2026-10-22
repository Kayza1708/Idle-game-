import sqlite3
import pathlib
import unittest

ROOT=pathlib.Path(__file__).resolve().parents[1] / "migrations"
V1=(ROOT/"0001_companies.sql").read_text()
V2=(ROOT/"0002_profiles_roles_trades.sql").read_text()

class SocialSchemaTests(unittest.TestCase):
    def setUp(self):
        self.db=sqlite3.connect(":memory:")
        self.db.execute("PRAGMA foreign_keys=ON")
        self.db.executescript(V1)
        self.db.execute("INSERT INTO players VALUES('alice','Alice',100)")
        self.db.execute("INSERT INTO players VALUES('bob','Bob',100)")
        self.db.execute("INSERT INTO companies(id,founder_id,name,tag,created_at) VALUES('company','alice','Neural Research','NRL',100)")
        self.db.execute("INSERT INTO company_members(player_id,company_id,role,joined_at,last_claim_at) VALUES('alice','company','ceo',100,100)")
        self.db.execute("INSERT INTO company_members(player_id,company_id,role,joined_at,last_claim_at) VALUES('bob','company','member',100,100)")
        self.db.executescript(V2)

    def scalar(self,sql,args=()):
        return self.db.execute(sql,args).fetchone()[0]

    def test_migration_retains_members_and_makes_profiles_private(self):
        self.assertEqual(self.scalar("SELECT member_count FROM companies WHERE id='company'"),2)
        self.assertEqual(self.scalar("SELECT leader_id FROM companies WHERE id='company'"),"alice")
        self.assertEqual(self.scalar("SELECT show_int FROM player_profiles WHERE player_id='alice'"),0)
        self.assertEqual(self.scalar("SELECT count(*) FROM public_player_stats"),0)
        self.assertEqual(self.scalar("SELECT count(*) FROM player_badges WHERE family='company-founder' AND player_id='alice'"),1)
        self.assertEqual(self.scalar("SELECT count(*) FROM owned_profile_frames WHERE player_id='bob' AND frame_id='basic'"),1)

    def test_leadership_transfer_is_atomic_and_ceo_cannot_delete(self):
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("DELETE FROM company_members WHERE player_id='alice'")
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("UPDATE company_members SET role='member' WHERE player_id='alice'")
        self.db.execute("UPDATE companies SET leader_id='bob' WHERE id='company' AND leader_id='alice'")
        self.assertEqual(self.scalar("SELECT role FROM company_members WHERE player_id='bob'"),'ceo')
        self.assertEqual(self.scalar("SELECT role FROM company_members WHERE player_id='alice'"),'executive')
        self.db.execute("DELETE FROM company_members WHERE player_id='alice'")
        self.assertEqual(self.scalar("SELECT member_count FROM companies WHERE id='company'"),1)

    def test_company_contribution_grants_bounded_badges_frames(self):
        self.db.execute("UPDATE company_members SET contributed_rp=10000,last_claim_at=3600 WHERE player_id='bob'")
        self.assertEqual(self.scalar("SELECT rp_balance FROM companies WHERE id='company'"),10000)
        tiers=[x[0] for x in self.db.execute(
            "SELECT tier FROM player_badges WHERE player_id='bob' AND family='company-contributor' ORDER BY tier")]
        self.assertEqual(tiers,[1,2])
        self.assertEqual(self.scalar("SELECT count(*) FROM owned_profile_frames WHERE player_id='bob' AND frame_id='silver-lab'"),1)
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("INSERT INTO profile_badge_showcase(player_id,slot,family,tier) VALUES('bob',1,'prestige',3)")
        self.db.execute("INSERT INTO profile_badge_showcase(player_id,slot,family,tier) VALUES('bob',1,'company-contributor',2)")
        self.assertEqual(self.scalar("SELECT count(*) FROM profile_badge_showcase"),1)

    def test_escrow_accept_and_replay_protection(self):
        self.db.execute("INSERT INTO trade_inventory VALUES('alice','component','graphene',6)")
        self.db.execute("INSERT INTO trade_inventory VALUES('bob','component','quantumCores',3)")
        self.db.execute("""
          INSERT INTO company_trade_offers
          (id,company_id,seller_id,give_kind,give_id,give_qty,want_kind,want_id,want_qty,created_at,expires_at)
          VALUES('trade1','company','alice','component','graphene',4,'component','quantumCores',2,100,1000)
        """)
        self.assertEqual(self.scalar("SELECT quantity FROM trade_inventory WHERE player_id='alice' AND asset_id='graphene'"),2)
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("""
              INSERT INTO company_trade_offers
              (id,company_id,seller_id,give_kind,give_id,give_qty,want_kind,want_id,want_qty,created_at,expires_at)
              VALUES('trade2','company','alice','component','graphene',4,'component','quantumCores',2,100,1000)
            """)
        self.db.execute("UPDATE company_trade_offers SET status='accepted',buyer_id='bob',closed_at=200 WHERE id='trade1'")
        self.assertEqual(self.scalar("SELECT quantity FROM trade_inventory WHERE player_id='bob' AND asset_id='graphene'"),4)
        self.assertEqual(self.scalar("SELECT quantity FROM trade_inventory WHERE player_id='alice' AND asset_id='quantumCores'"),2)
        self.assertEqual(self.scalar("SELECT quantity FROM trade_inventory WHERE player_id='bob' AND asset_id='quantumCores'"),1)
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("UPDATE company_trade_offers SET status='accepted',buyer_id='bob' WHERE id='trade1'")

    def test_cancel_and_exit_return_escrow(self):
        self.db.execute("INSERT INTO trade_inventory VALUES('bob','blueprint','testBlueprint',3)")
        self.db.execute("""
          INSERT INTO company_trade_offers
          (id,company_id,seller_id,give_kind,give_id,give_qty,want_kind,want_id,want_qty,created_at,expires_at)
          VALUES('trade3','company','bob','blueprint','testBlueprint',2,'component','graphene',5,100,1000)
        """)
        self.assertEqual(self.scalar("SELECT quantity FROM trade_inventory WHERE player_id='bob' AND asset_id='testBlueprint'"),1)
        self.db.execute("DELETE FROM company_members WHERE player_id='bob'")
        self.assertEqual(self.scalar("SELECT quantity FROM trade_inventory WHERE player_id='bob' AND asset_id='testBlueprint'"),3)
        self.assertEqual(self.scalar("SELECT status FROM company_trade_offers WHERE id='trade3'"),'cancelled')

if __name__=="__main__": unittest.main()
