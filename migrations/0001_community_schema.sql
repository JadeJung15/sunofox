CREATE TABLE IF NOT EXISTS boards (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO boards (slug, name, description, sort_order) VALUES
  ('notice', '공지', '운영자가 고정하는 공지 게시판입니다.', 1),
  ('free', '자유', '팬들이 자유롭게 이야기하는 기본 게시판입니다.', 2),
  ('media', '영상', '영상, 쇼츠, 썸네일 이야기를 모으는 게시판입니다.', 3),
  ('event', '이벤트', '팬 이벤트와 참여 안내를 모으는 게시판입니다.', 4);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  board_slug TEXT NOT NULL DEFAULT 'free',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  author_email TEXT NOT NULL,
  author_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published',
  pinned INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  dislike_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (board_slug) REFERENCES boards(slug)
);

CREATE INDEX IF NOT EXISTS idx_posts_board_status_created ON posts (board_slug, status, pinned DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_status_created ON posts (status, pinned DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts (created_at DESC);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  body TEXT NOT NULL,
  author_email TEXT NOT NULL,
  author_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (post_id) REFERENCES posts(id)
);

CREATE INDEX IF NOT EXISTS idx_comments_post_status_created ON comments (post_id, status, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_comments_status_created ON comments (status, created_at DESC);

CREATE TABLE IF NOT EXISTS post_reactions (
  post_id TEXT NOT NULL,
  actor_email TEXT NOT NULL,
  value INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (post_id, actor_email),
  FOREIGN KEY (post_id) REFERENCES posts(id)
);
