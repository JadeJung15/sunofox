import {
  getUser,
  json,
  normalizeNickname,
  normalizeUserIconId,
  publicUser,
  saveUser,
  verifySession
} from '../../_shared/auth.js';

async function requireProfile(context) {
  const session = await verifySession(context.request, context.env);
  if (!session) {
    return { error: json({ ok: false, message: '로그인 후 이용할 수 있습니다.' }, { status: 401 }) };
  }
  const user = await getUser(context.env, session.email);
  if (!user) {
    return { error: json({ ok: false, message: '계정 정보를 찾을 수 없습니다.' }, { status: 404 }) };
  }
  return { session, user };
}

export async function onRequestGet(context) {
  const resolved = await requireProfile(context);
  if (resolved.error) return resolved.error;
  return json({ ok: true, user: publicUser(resolved.user, { role: resolved.session.role }) });
}

export async function onRequestPatch(context) {
  const resolved = await requireProfile(context);
  if (resolved.error) return resolved.error;

  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ ok: false, message: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  const nickname = normalizeNickname(body.nickname, resolved.user.email);
  const iconId = normalizeUserIconId(body.iconId || resolved.user.iconId || 1);
  const updated = {
    ...resolved.user,
    nickname,
    name: resolved.user.name || nickname,
    iconId,
    updatedAt: new Date().toISOString()
  };
  await saveUser(context.env, updated);
  return json({ ok: true, user: publicUser(updated, { role: resolved.session.role }) });
}
