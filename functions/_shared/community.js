import {
  getAdminEmail,
  getUser,
  json,
  kvListPrefix,
  normalizeEmail,
  requireAdminAccess,
  verifySession
} from './auth.js';

const BOARDS = new Set(['notice', 'free', 'media', 'event']);
const MAX_TITLE_LENGTH = 90;
const MAX_BODY_LENGTH = 5000;
const MAX_COMMENT_LENGTH = 1200;
const MAX_LIST_LIMIT = 50;
const DEFAULT_LIST_LIMIT = 30;
const LEGACY_MIGRATION_FLAG = '__sfCommunityLegacyMigrated';

function getDb(env) {
  return env.SF_COMMUNITY_DB;
}

function cleanText(value, maxLength) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim()
    .slice(0, maxLength);
}

function getDisplayName(user, email) {
  const name = cleanText(user?.name, 30);
  if (name) return name;
  return normalizeEmail(email).split('@')[0] || 'fan';
}

function parseJsonBody(request) {
  return request.json().catch(() => null);
}

function clampLimit(value) {
  const limit = Number.parseInt(value || DEFAULT_LIST_LIMIT, 10);
  if (!Number.isFinite(limit)) return DEFAULT_LIST_LIMIT;
  return Math.max(1, Math.min(MAX_LIST_LIMIT, limit));
}

function parsePage(value) {
  const page = Number.parseInt(value || 1, 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function normalizeBoard(value) {
  const board = String(value || 'all').trim();
  return board === 'all' || BOARDS.has(board) ? board : 'all';
}

function publicPost(row) {
  return {
    id: row.id,
    board: row.board_slug || 'free',
    boardName: row.board_name || '자유',
    title: row.title || '',
    body: row.body || '',
    authorName: row.author_name || 'fan',
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || '',
    pinned: Boolean(row.pinned),
    views: Number(row.views || 0),
    likeCount: Number(row.like_count || 0),
    dislikeCount: Number(row.dislike_count || 0),
    commentCount: Number(row.comment_count || 0),
    status: row.status || 'published'
  };
}

function adminPost(row) {
  return {
    ...publicPost(row),
    authorEmail: row.author_email || '',
    deletedAt: row.deleted_at || null
  };
}

function publicComment(row) {
  return {
    id: row.id,
    postId: row.post_id,
    body: row.body || '',
    authorName: row.author_name || 'fan',
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || '',
    status: row.status || 'published'
  };
}

function adminComment(row) {
  return {
    ...publicComment(row),
    authorEmail: row.author_email || '',
    postTitle: row.post_title || '',
    deletedAt: row.deleted_at || null
  };
}

async function requireApprovedUser(request, env) {
  const session = await verifySession(request, env);
  if (!session) {
    return { error: json({ ok: false, message: '로그인 후 이용할 수 있습니다.' }, { status: 401 }) };
  }

  const email = normalizeEmail(session.email);
  const user = await getUser(env, email);
  if (!user || user.status !== 'approved') {
    return { error: json({ ok: false, message: '승인된 계정만 이용할 수 있습니다.' }, { status: 403 }) };
  }

  return { email, user, authorName: getDisplayName(user, email) };
}

async function requireAdminPostActor(request, env) {
  if (!(await requireAdminAccess(request, env))) {
    return { error: json({ ok: false, message: '소유자 로그인 또는 관리자 키가 필요합니다.' }, { status: 401 }) };
  }

  const session = await verifySession(request, env);
  const email = normalizeEmail(session?.email || getAdminEmail(env));
  return { email, authorName: 'SunoFox 운영' };
}

async function migrateLegacyPosts(env) {
  const db = getDb(env);
  if (!db || globalThis[LEGACY_MIGRATION_FLAG]) return;

  const legacyPosts = await kvListPrefix(env, 'post:').catch(() => []);
  for (const legacy of legacyPosts) {
    if (!legacy?.id || !legacy.title || !legacy.body) continue;
    const createdAt = legacy.createdAt || new Date().toISOString();
    await db.prepare(`
      INSERT OR IGNORE INTO posts (
        id, board_slug, title, body, author_email, author_name, status, pinned,
        views, like_count, dislike_count, created_at, updated_at, deleted_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      legacy.id,
      'free',
      cleanText(legacy.title, MAX_TITLE_LENGTH),
      cleanText(legacy.body, MAX_BODY_LENGTH),
      normalizeEmail(legacy.authorEmail || ''),
      cleanText(legacy.authorName || 'fan', 30),
      legacy.status || 'published',
      legacy.pinned ? 1 : 0,
      0,
      0,
      0,
      createdAt,
      legacy.updatedAt || createdAt,
      legacy.deletedAt || null
    ).run();
  }

  globalThis[LEGACY_MIGRATION_FLAG] = true;
}

async function getBoards(env) {
  const db = getDb(env);
  const { results } = await db.prepare('SELECT slug, name, description FROM boards ORDER BY sort_order ASC').all();
  return results || [];
}

async function getPostRow(env, id, options = {}) {
  const db = getDb(env);
  const row = await db.prepare(`
    SELECT p.*, b.name AS board_name,
      (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.status = 'published') AS comment_count
    FROM posts p
    LEFT JOIN boards b ON b.slug = p.board_slug
    WHERE p.id = ?
  `).bind(id).first();

  if (!row) return null;
  if (!options.admin && row.status !== 'published') return null;
  return row;
}

export async function handleCommunityPostsGet(context) {
  const db = getDb(context.env);
  if (!db) return json({ ok: false, message: '커뮤니티 데이터베이스가 연결되지 않았습니다.' }, { status: 500 });
  await migrateLegacyPosts(context.env);

  const url = new URL(context.request.url);
  const admin = url.searchParams.get('admin') === '1';
  const id = String(url.searchParams.get('id') || '').trim();

  if (admin && !(await requireAdminAccess(context.request, context.env))) {
    return json({ ok: false, message: '소유자 로그인 또는 관리자 키가 필요합니다.' }, { status: 401 });
  }

  if (id) {
    if (!admin && url.searchParams.get('view') === '1') {
      await db.prepare('UPDATE posts SET views = views + 1 WHERE id = ? AND status = ?').bind(id, 'published').run();
    }
    const row = await getPostRow(context.env, id, { admin });
    if (!row) return json({ ok: false, message: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    return json({ ok: true, post: admin ? adminPost(row) : publicPost(row) });
  }

  const board = normalizeBoard(url.searchParams.get('board'));
  const search = cleanText(url.searchParams.get('q'), 80);
  const page = parsePage(url.searchParams.get('page'));
  const limit = clampLimit(url.searchParams.get('limit'));
  const offset = (page - 1) * limit;

  const where = [];
  const params = [];

  if (admin) {
    const status = String(url.searchParams.get('status') || '').trim();
    if (['published', 'hidden', 'deleted'].includes(status)) {
      where.push('p.status = ?');
      params.push(status);
    } else {
      where.push("p.status != 'deleted'");
    }
  } else {
    where.push("p.status = 'published'");
  }

  if (board !== 'all') {
    where.push('p.board_slug = ?');
    params.push(board);
  }

  if (search) {
    where.push('(p.title LIKE ? OR p.body LIKE ? OR p.author_name LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const countRow = await db.prepare(`SELECT COUNT(*) AS total FROM posts p ${whereSql}`).bind(...params).first();
  const { results } = await db.prepare(`
    SELECT p.*, b.name AS board_name,
      (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.status = 'published') AS comment_count
    FROM posts p
    LEFT JOIN boards b ON b.slug = p.board_slug
    ${whereSql}
    ORDER BY p.pinned DESC, p.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(...params, limit, offset).all();

  return json({
    ok: true,
    boards: await getBoards(context.env),
    posts: (results || []).map(admin ? adminPost : publicPost),
    page,
    limit,
    total: Number(countRow?.total || 0)
  });
}

export async function handleCommunityPostsPost(context) {
  const db = getDb(context.env);
  if (!db) return json({ ok: false, message: '커뮤니티 데이터베이스가 연결되지 않았습니다.' }, { status: 500 });

  const body = await parseJsonBody(context.request);
  if (!body) return json({ ok: false, message: '요청 형식이 올바르지 않습니다.' }, { status: 400 });

  const board = normalizeBoard(body.board);
  if (board === 'all') return json({ ok: false, message: '게시판을 선택해 주세요.' }, { status: 400 });
  const pinned = Boolean(body.pinned);
  const needsAdmin = board === 'notice' || pinned || body.admin === true;
  const actor = needsAdmin
    ? await requireAdminPostActor(context.request, context.env)
    : await requireApprovedUser(context.request, context.env);
  if (actor.error) return actor.error;

  const title = cleanText(body.title, MAX_TITLE_LENGTH);
  const content = cleanText(body.body, MAX_BODY_LENGTH);
  if (title.length < 2) return json({ ok: false, message: '제목을 2자 이상 입력해 주세요.' }, { status: 400 });
  if (content.length < 5) return json({ ok: false, message: '내용을 5자 이상 입력해 주세요.' }, { status: 400 });

  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  await db.prepare(`
    INSERT INTO posts (
      id, board_slug, title, body, author_email, author_name, status,
      pinned, views, like_count, dislike_count, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, 'published', ?, 0, 0, 0, ?, ?)
  `).bind(id, board, title, content, actor.email, actor.authorName, pinned ? 1 : 0, now, now).run();

  const row = await getPostRow(context.env, id, { admin: false });
  return json({ ok: true, post: publicPost(row) }, { status: 201 });
}

export async function handleCommunityPostsPatch(context) {
  const db = getDb(context.env);
  if (!db) return json({ ok: false, message: '커뮤니티 데이터베이스가 연결되지 않았습니다.' }, { status: 500 });
  if (!(await requireAdminAccess(context.request, context.env))) {
    return json({ ok: false, message: '소유자 로그인 또는 관리자 키가 필요합니다.' }, { status: 401 });
  }

  const body = await parseJsonBody(context.request);
  if (!body) return json({ ok: false, message: '요청 형식이 올바르지 않습니다.' }, { status: 400 });

  const id = String(body.id || '').trim();
  const action = String(body.action || '').trim();
  if (!id || !['publish', 'hide', 'pin', 'unpin', 'delete'].includes(action)) {
    return json({ ok: false, message: '게시글과 처리 상태를 확인해 주세요.' }, { status: 400 });
  }

  const row = await getPostRow(context.env, id, { admin: true });
  if (!row) return json({ ok: false, message: '게시글을 찾을 수 없습니다.' }, { status: 404 });

  const now = new Date().toISOString();
  if (action === 'publish') {
    await db.prepare('UPDATE posts SET status = ?, updated_at = ?, deleted_at = NULL WHERE id = ?').bind('published', now, id).run();
  }
  if (action === 'hide') {
    await db.prepare('UPDATE posts SET status = ?, updated_at = ? WHERE id = ?').bind('hidden', now, id).run();
  }
  if (action === 'pin') {
    await db.prepare('UPDATE posts SET pinned = 1, updated_at = ? WHERE id = ?').bind(now, id).run();
  }
  if (action === 'unpin') {
    await db.prepare('UPDATE posts SET pinned = 0, updated_at = ? WHERE id = ?').bind(now, id).run();
  }
  if (action === 'delete') {
    await db.prepare('UPDATE posts SET status = ?, pinned = 0, updated_at = ?, deleted_at = ? WHERE id = ?').bind('deleted', now, now, id).run();
  }

  const updated = await getPostRow(context.env, id, { admin: true });
  return json({ ok: true, post: adminPost(updated) });
}

export async function handleCommunityCommentsGet(context) {
  const db = getDb(context.env);
  if (!db) return json({ ok: false, message: '커뮤니티 데이터베이스가 연결되지 않았습니다.' }, { status: 500 });

  const url = new URL(context.request.url);
  const admin = url.searchParams.get('admin') === '1';
  if (admin) {
    if (!(await requireAdminAccess(context.request, context.env))) {
      return json({ ok: false, message: '소유자 로그인 또는 관리자 키가 필요합니다.' }, { status: 401 });
    }
    const status = String(url.searchParams.get('status') || '').trim();
    const search = cleanText(url.searchParams.get('q'), 80);
    const limit = clampLimit(url.searchParams.get('limit'));
    const where = [];
    const params = [];

    if (['published', 'hidden', 'deleted'].includes(status)) {
      where.push('c.status = ?');
      params.push(status);
    } else {
      where.push("c.status != 'deleted'");
    }

    if (search) {
      where.push('(c.body LIKE ? OR c.author_name LIKE ? OR c.author_email LIKE ? OR p.title LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { results } = await db.prepare(`
      SELECT c.*, p.title AS post_title
      FROM comments c
      LEFT JOIN posts p ON p.id = c.post_id
      ${whereSql}
      ORDER BY c.created_at DESC
      LIMIT ?
    `).bind(...params, limit).all();
    return json({ ok: true, comments: (results || []).map(adminComment) });
  }

  const postId = String(url.searchParams.get('postId') || '').trim();
  if (!postId) return json({ ok: false, message: '게시글을 확인해 주세요.' }, { status: 400 });

  const { results } = await db.prepare(`
    SELECT * FROM comments
    WHERE post_id = ? AND status = 'published'
    ORDER BY created_at ASC
  `).bind(postId).all();
  return json({ ok: true, comments: (results || []).map(publicComment) });
}

export async function handleCommunityCommentsPost(context) {
  const db = getDb(context.env);
  if (!db) return json({ ok: false, message: '커뮤니티 데이터베이스가 연결되지 않았습니다.' }, { status: 500 });

  const actor = await requireApprovedUser(context.request, context.env);
  if (actor.error) return actor.error;

  const body = await parseJsonBody(context.request);
  if (!body) return json({ ok: false, message: '요청 형식이 올바르지 않습니다.' }, { status: 400 });

  const postId = String(body.postId || '').trim();
  const post = await getPostRow(context.env, postId, { admin: false });
  if (!post) return json({ ok: false, message: '댓글을 작성할 게시글을 찾을 수 없습니다.' }, { status: 404 });

  const content = cleanText(body.body, MAX_COMMENT_LENGTH);
  if (content.length < 2) return json({ ok: false, message: '댓글을 2자 이상 입력해 주세요.' }, { status: 400 });

  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  await db.prepare(`
    INSERT INTO comments (id, post_id, body, author_email, author_name, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'published', ?, ?)
  `).bind(id, postId, content, actor.email, actor.authorName, now, now).run();

  const row = await db.prepare('SELECT * FROM comments WHERE id = ?').bind(id).first();
  return json({ ok: true, comment: publicComment(row) }, { status: 201 });
}

export async function handleCommunityCommentsPatch(context) {
  const db = getDb(context.env);
  if (!db) return json({ ok: false, message: '커뮤니티 데이터베이스가 연결되지 않았습니다.' }, { status: 500 });
  if (!(await requireAdminAccess(context.request, context.env))) {
    return json({ ok: false, message: '소유자 로그인 또는 관리자 키가 필요합니다.' }, { status: 401 });
  }

  const body = await parseJsonBody(context.request);
  if (!body) return json({ ok: false, message: '요청 형식이 올바르지 않습니다.' }, { status: 400 });

  const id = String(body.id || '').trim();
  const action = String(body.action || '').trim();
  if (!id || !['publish', 'hide', 'delete'].includes(action)) {
    return json({ ok: false, message: '댓글과 처리 상태를 확인해 주세요.' }, { status: 400 });
  }

  const existing = await db.prepare('SELECT * FROM comments WHERE id = ?').bind(id).first();
  if (!existing) return json({ ok: false, message: '댓글을 찾을 수 없습니다.' }, { status: 404 });

  const now = new Date().toISOString();
  if (action === 'publish') {
    await db.prepare('UPDATE comments SET status = ?, updated_at = ?, deleted_at = NULL WHERE id = ?').bind('published', now, id).run();
  }
  if (action === 'hide') {
    await db.prepare('UPDATE comments SET status = ?, updated_at = ? WHERE id = ?').bind('hidden', now, id).run();
  }
  if (action === 'delete') {
    await db.prepare('UPDATE comments SET status = ?, updated_at = ?, deleted_at = ? WHERE id = ?').bind('deleted', now, now, id).run();
  }

  const row = await db.prepare('SELECT c.*, p.title AS post_title FROM comments c LEFT JOIN posts p ON p.id = c.post_id WHERE c.id = ?').bind(id).first();
  return json({ ok: true, comment: adminComment(row) });
}

export async function handleCommunityReactionPost(context) {
  const db = getDb(context.env);
  if (!db) return json({ ok: false, message: '커뮤니티 데이터베이스가 연결되지 않았습니다.' }, { status: 500 });

  const actor = await requireApprovedUser(context.request, context.env);
  if (actor.error) return actor.error;

  const body = await parseJsonBody(context.request);
  if (!body) return json({ ok: false, message: '요청 형식이 올바르지 않습니다.' }, { status: 400 });

  const postId = String(body.postId || '').trim();
  const value = Number(body.value) === -1 ? -1 : 1;
  const post = await getPostRow(context.env, postId, { admin: false });
  if (!post) return json({ ok: false, message: '추천할 게시글을 찾을 수 없습니다.' }, { status: 404 });

  const now = new Date().toISOString();
  const existing = await db.prepare('SELECT value FROM post_reactions WHERE post_id = ? AND actor_email = ?').bind(postId, actor.email).first();
  let activeValue = value;

  if (existing && Number(existing.value) === value) {
    await db.prepare('DELETE FROM post_reactions WHERE post_id = ? AND actor_email = ?').bind(postId, actor.email).run();
    await db.prepare(value === 1
      ? 'UPDATE posts SET like_count = CASE WHEN like_count > 0 THEN like_count - 1 ELSE 0 END WHERE id = ?'
      : 'UPDATE posts SET dislike_count = CASE WHEN dislike_count > 0 THEN dislike_count - 1 ELSE 0 END WHERE id = ?'
    ).bind(postId).run();
    activeValue = 0;
  } else if (existing) {
    await db.prepare('UPDATE post_reactions SET value = ?, updated_at = ? WHERE post_id = ? AND actor_email = ?').bind(value, now, postId, actor.email).run();
    await db.prepare(value === 1
      ? 'UPDATE posts SET like_count = like_count + 1, dislike_count = CASE WHEN dislike_count > 0 THEN dislike_count - 1 ELSE 0 END WHERE id = ?'
      : 'UPDATE posts SET dislike_count = dislike_count + 1, like_count = CASE WHEN like_count > 0 THEN like_count - 1 ELSE 0 END WHERE id = ?'
    ).bind(postId).run();
  } else {
    await db.prepare('INSERT INTO post_reactions (post_id, actor_email, value, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').bind(postId, actor.email, value, now, now).run();
    await db.prepare(value === 1
      ? 'UPDATE posts SET like_count = like_count + 1 WHERE id = ?'
      : 'UPDATE posts SET dislike_count = dislike_count + 1 WHERE id = ?'
    ).bind(postId).run();
  }

  const updated = await getPostRow(context.env, postId, { admin: false });
  return json({ ok: true, activeValue, post: publicPost(updated) });
}
