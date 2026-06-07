import {
  getUser,
  json,
  kvDelete,
  kvListPrefix,
  kvPut,
  normalizeEmail,
  requireAdminAccess,
  verifySession
} from '../../_shared/auth.js';

const MAX_TITLE_LENGTH = 80;
const MAX_BODY_LENGTH = 2000;
const MAX_POSTS = 50;
const MAX_ADMIN_POSTS = 120;

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

function toPublicPost(post) {
  return {
    id: post.id,
    title: post.title,
    body: post.body,
    authorName: post.authorName || 'fan',
    createdAt: post.createdAt,
    pinned: Boolean(post.pinned)
  };
}

function toAdminPost(record) {
  const post = record.value;
  return {
    ...toPublicPost(post),
    key: record.key,
    authorEmail: post.authorEmail || '',
    status: post.status || 'published',
    updatedAt: post.updatedAt || post.createdAt || '',
    deletedAt: post.deletedAt || null
  };
}

function sortPosts(a, b) {
  const pinnedDelta = Number(Boolean(b.pinned)) - Number(Boolean(a.pinned));
  if (pinnedDelta) return pinnedDelta;
  return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
}

async function listPostRecords(env) {
  return (await kvListPrefix(env, 'post:'))
    .filter(Boolean)
    .map((post) => ({
      key: post.key || `post:${post.createdAt || ''}:${post.id || ''}`,
      value: post
    }));
}

async function findPostRecord(env, id) {
  const records = await listPostRecords(env);
  return records.find((record) => record.value?.id === id) || null;
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const records = await listPostRecords(context.env);

  if (url.searchParams.get('admin') === '1') {
    if (!(await requireAdminAccess(context.request, context.env))) {
      return json({ ok: false, message: '소유자 로그인 또는 관리자 키가 필요합니다.' }, { status: 401 });
    }
    const posts = records
      .map(toAdminPost)
      .sort(sortPosts)
      .slice(0, MAX_ADMIN_POSTS);
    return json({ ok: true, posts });
  }

  const visiblePosts = records
    .map((record) => record.value)
    .filter((post) => post && post.status === 'published')
    .sort(sortPosts)
    .slice(0, MAX_POSTS)
    .map(toPublicPost);

  return json({ ok: true, posts: visiblePosts });
}

export async function onRequestPost(context) {
  const session = await verifySession(context.request, context.env);
  if (!session) {
    return json({ ok: false, message: '로그인 후 게시글을 작성할 수 있습니다.' }, { status: 401 });
  }

  const email = normalizeEmail(session.email);
  const user = await getUser(context.env, email);
  if (!user || user.status !== 'approved') {
    return json({ ok: false, message: '승인된 계정만 게시글을 작성할 수 있습니다.' }, { status: 403 });
  }

  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ ok: false, message: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  const title = cleanText(body.title, MAX_TITLE_LENGTH);
  const content = cleanText(body.body, MAX_BODY_LENGTH);
  if (title.length < 2) {
    return json({ ok: false, message: '제목을 2자 이상 입력해 주세요.' }, { status: 400 });
  }
  if (content.length < 5) {
    return json({ ok: false, message: '내용을 5자 이상 입력해 주세요.' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const post = {
    id,
    title,
    body: content,
    authorEmail: email,
    authorName: getDisplayName(user, email),
    status: 'published',
    createdAt: now,
    updatedAt: now
  };

  await kvPut(context.env, `post:${now}:${id}`, post);
  return json({ ok: true, post: toPublicPost(post) }, { status: 201 });
}

export async function onRequestPatch(context) {
  if (!(await requireAdminAccess(context.request, context.env))) {
    return json({ ok: false, message: '소유자 로그인 또는 관리자 키가 필요합니다.' }, { status: 401 });
  }

  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ ok: false, message: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  const id = String(body.id || '').trim();
  const action = String(body.action || '').trim();
  if (!id || !['publish', 'hide', 'pin', 'unpin', 'delete'].includes(action)) {
    return json({ ok: false, message: '게시글과 처리 상태를 확인해 주세요.' }, { status: 400 });
  }

  const record = await findPostRecord(context.env, id);
  if (!record) {
    return json({ ok: false, message: '게시글을 찾을 수 없습니다.' }, { status: 404 });
  }

  const now = new Date().toISOString();
  const post = {
    ...record.value,
    updatedAt: now
  };

  if (action === 'publish') post.status = 'published';
  if (action === 'hide') post.status = 'hidden';
  if (action === 'pin') post.pinned = true;
  if (action === 'unpin') post.pinned = false;
  if (action === 'delete') {
    post.status = 'deleted';
    post.pinned = false;
    post.deletedAt = now;
  }

  await kvPut(context.env, record.key, post);
  return json({ ok: true, post: toAdminPost({ key: record.key, value: post }) });
}

export async function onRequestDelete(context) {
  if (!(await requireAdminAccess(context.request, context.env))) {
    return json({ ok: false, message: '소유자 로그인 또는 관리자 키가 필요합니다.' }, { status: 401 });
  }

  const url = new URL(context.request.url);
  const id = String(url.searchParams.get('id') || '').trim();
  const record = id ? await findPostRecord(context.env, id) : null;
  if (!record) {
    return json({ ok: false, message: '게시글을 찾을 수 없습니다.' }, { status: 404 });
  }

  await kvDelete(context.env, record.key);
  return json({ ok: true, id });
}
