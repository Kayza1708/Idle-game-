-- Server-only credentials, telemetry and UTC LiveOps controls. Never trust Unity saves.
CREATE TABLE IF NOT EXISTS account_identities (
  provider TEXT NOT NULL CHECK(provider IN ('apple','google','playgames')),
  subject_hash TEXT NOT NULL CHECK(length(subject_hash)=64),
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  linked_at INTEGER NOT NULL,
  PRIMARY KEY(provider,subject_hash),
  UNIQUE(player_id,provider)
);
CREATE INDEX IF NOT EXISTS idx_identity_player ON account_identities(player_id);
CREATE TABLE IF NOT EXISTS auth_challenges (
  challenge_hash TEXT PRIMARY KEY CHECK(length(challenge_hash)=64),
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  used INTEGER NOT NULL DEFAULT 0 CHECK(used IN (0,1))
);
CREATE INDEX IF NOT EXISTS idx_challenge_expiry ON auth_challenges(expires_at);

-- Only predeclared low-cardinality events. No free-text, IP, email, ID token,
-- raw crash stack or player-uploaded currency/INT values. Opt-in on the client.
CREATE TABLE IF NOT EXISTS analytics_events (
  event_id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK(event_type IN (
    'session_start','session_end','screen_view','first_purchase','training_complete',
    'research_complete','prestige','axiom_reset','item_craft','quest_claim',
    'ad_request','ad_reward','ad_failed','iap_attempt','iap_verified',
    'season_open','company_open','app_crash')),
  metric INTEGER NOT NULL CHECK(metric BETWEEN 0 AND 1000000000),
  received_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_analytics_received ON analytics_events(received_at);
CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics_events(event_type,received_at);
-- Account deletion cascades: all telemetry for that account is erased.
CREATE TRIGGER IF NOT EXISTS analytics_daily_limit BEFORE INSERT ON analytics_events
WHEN (SELECT COUNT(*) FROM analytics_events
  WHERE player_id=NEW.player_id AND received_at>=CAST(NEW.received_at/86400 AS INTEGER)*86400)>=200
BEGIN SELECT RAISE(ABORT,'telemetry_daily_limit'); END;

-- Only deployed Wrangler migrations / operators edit these values. No public mutation route.
CREATE TABLE IF NOT EXISTS liveops_state (
  id INTEGER PRIMARY KEY CHECK(id=1),
  maintenance INTEGER NOT NULL DEFAULT 0 CHECK(maintenance IN (0,1)),
  min_client_version INTEGER NOT NULL DEFAULT 1 CHECK(min_client_version>=1),
  bulletin TEXT NOT NULL DEFAULT '' CHECK(length(bulletin)<=160),
  updated_at INTEGER NOT NULL DEFAULT 0
);
INSERT OR IGNORE INTO liveops_state(id,maintenance,min_client_version,bulletin,updated_at)
 VALUES (1,0,1,'',0);
CREATE TABLE IF NOT EXISTS liveops_seasons (
  id TEXT PRIMARY KEY CHECK(length(id) BETWEEN 3 AND 48),
  label TEXT NOT NULL CHECK(length(label) BETWEEN 2 AND 80),
  starts_at INTEGER NOT NULL,
  ends_at INTEGER NOT NULL,
  CHECK(ends_at>starts_at)
);
CREATE INDEX IF NOT EXISTS idx_liveops_utc ON liveops_seasons(starts_at,ends_at);
