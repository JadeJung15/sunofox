CREATE TABLE IF NOT EXISTS community_reports (
  id TEXT PRIMARY KEY,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  post_id TEXT,
  reason TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  reporter_email TEXT NOT NULL,
  reporter_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  resolved_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_community_reports_unique_reporter
  ON community_reports (target_type, target_id, reporter_email);

CREATE INDEX IF NOT EXISTS idx_community_reports_status_created
  ON community_reports (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_reports_target
  ON community_reports (target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_community_reports_post
  ON community_reports (post_id, created_at DESC);
