import {
  getUser,
  json,
  kvListPrefix,
  kvPut,
  normalizeEmail,
  verifySession
} from '../../_shared/auth.js';

const MAX_TITLE_LENGTH = 80;
const MAX_BODY_LENGTH = 2000;
const MAX_POSTS = 50;

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
    createdAt: post.createdAt
  };
}

export async function onRequestGet(context) {
  const posts = await kvListPrefix(context.env, 'post:');
  const visiblePosts = posts
    .filter((post) => post && post.status === 'published')
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
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
