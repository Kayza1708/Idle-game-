import pathlib
import sqlite3
import unittest

SCHEMA = pathlib.Path(__file__).resolve().parents[1] / "migrations" / "0001_companies.sql"

class SchemaTests(unittest.TestCase):
    def setUp(self):
        self.db = sqlite3.connect(":memory:")
        self.db.execute("PRAGMA foreign_keys=ON")
        self.db.executescript(SCHEMA.read_text())

    def player(self, value):
        self.db.execute("INSERT INTO players(id,display_name,created_at) VALUES(?,?,0)", (value, "Player-"+value[:8]))

    def company(self):
        self.player("founder")
        self.db.execute("INSERT INTO companies(id,founder_id,name,tag,created_at) VALUES('comp','founder','Neural Labs','NLS',0)")
        self.db.execute("INSERT INTO company_members(player_id,company_id,role,joined_at,last_claim_at) VALUES('founder','comp','ceo',0,0)")

    def test_research_is_seeded(self):
        self.company()
        self.assertEqual(self.db.execute("SELECT COUNT(*) FROM company_research WHERE company_id='comp'").fetchone()[0],4)

    def test_fifty_players_exactly(self):
        self.company()
        for i in range(49):
            p="player"+str(i)
            self.player(p)
            self.db.execute("INSERT INTO company_members(player_id,company_id,role,joined_at,last_claim_at) VALUES(?,'comp','member',0,0)",(p,))
        self.assertEqual(self.db.execute("SELECT member_count FROM companies WHERE id='comp'").fetchone()[0],50)
        self.player("extra")
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("INSERT INTO company_members(player_id,company_id,role,joined_at,last_claim_at) VALUES('extra','comp','member',0,0)")
        self.assertEqual(self.db.execute("SELECT member_count FROM companies WHERE id='comp'").fetchone()[0],50)

    def test_rp_credited_once_and_research_spent(self):
        self.company()
        sql = ("UPDATE company_members SET contributed_rp=contributed_rp+"
               "MIN(MAX(CAST((?-last_claim_at)/3600 AS INTEGER),0),24)*100,"
               "tokens=tokens+MIN(MAX(CAST((?-last_claim_at)/3600 AS INTEGER),0),24)*10,"
               "last_claim_at=CASE WHEN (?-last_claim_at)>=3600 THEN ? ELSE last_claim_at END "
               "WHERE player_id='founder'")
        self.db.execute(sql,(36000,36000,36000,36000))
        self.db.execute(sql,(36000,36000,36000,36000))
        self.assertEqual(self.db.execute("SELECT rp_balance FROM companies WHERE id='comp'").fetchone()[0],1000)
        self.assertEqual(self.db.execute("SELECT tokens FROM company_members WHERE player_id='founder'").fetchone()[0],100)
        self.db.execute("UPDATE company_research SET level=level+1 WHERE company_id='comp' AND node_id='computing'")
        self.assertEqual(self.db.execute("SELECT rp_balance FROM companies WHERE id='comp'").fetchone()[0],0)
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("UPDATE company_research SET level=level+1 WHERE company_id='comp' AND node_id='computing'")

if __name__ == "__main__": unittest.main()
