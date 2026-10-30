-- Keep one unambiguous server-owned active season at any UTC timestamp.
-- Adjacent seasons [start,end) are allowed; overlapping intervals are not.
-- This migration does not change existing stored seasons or grant rewards.
CREATE TRIGGER IF NOT EXISTS liveops_season_no_overlap_insert
BEFORE INSERT ON liveops_seasons
WHEN EXISTS (
 SELECT 1 FROM liveops_seasons old
 WHERE NEW.starts_at < old.ends_at AND NEW.ends_at > old.starts_at
)
BEGIN SELECT RAISE(ABORT,'liveops_season_overlap'); END;

CREATE TRIGGER IF NOT EXISTS liveops_season_no_overlap_update
BEFORE UPDATE OF starts_at,ends_at ON liveops_seasons
WHEN EXISTS (
 SELECT 1 FROM liveops_seasons old
 WHERE old.id <> NEW.id
   AND NEW.starts_at < old.ends_at AND NEW.ends_at > old.starts_at
)
BEGIN SELECT RAISE(ABORT,'liveops_season_overlap'); END;
