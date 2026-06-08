CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  page TEXT NOT NULL DEFAULT '/',
  user_agent TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status_created ON contact_messages (status, created_at DESC);
