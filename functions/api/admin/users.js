import { getAdminEmail, getUser, json, kvListUsers, normalizeEmail, requireAdminAccess, saveUser } from '../../_shared/auth.js';

function sortUsers(users) {
  return users.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
}

export async function onRequestGet(context) {
  if (!(await requireAdminAccess(context.request, context.env))) {
    return json({ ok: false, message: '소유자 로그인 또는 관리자 키가 필요합니다.' }, { status: 401 });
  }

  const users = sortUsers(await kvListUsers(context.env));
  return json({ ok: true, users });
}

export async function onRequestPost(context) {
  if (!(await requireAdminAccess(context.request, context.env))) {
    return json({ ok: false, message: '소유자 로그인 또는 관리자 키가 필요합니다.' }, { status: 401 });
  }

  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ ok: false, message: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  const action = String(body.action || '').trim();
  if (!email || !['approve', 'reject', 'pending'].includes(action)) {
    return json({ ok: false, message: '이메일과 처리 상태를 확인해 주세요.' }, { status: 400 });
  }

  const user = await getUser(context.env, email);
  if (!user) {
    return json({ ok: false, message: '사용자를 찾을 수 없습니다.' }, { status: 404 });
  }

  const now = new Date().toISOString();
  const status = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'pending';
  await saveUser(context.env, {
    ...user,
    status,
    updatedAt: now,
    approvedAt: status === 'approved' ? now : user.approvedAt || null,
    approvedBy: status === 'approved' ? getAdminEmail(context.env) : user.approvedBy || null
  });

  return json({ ok: true, user: await getUser(context.env, email) });
}
