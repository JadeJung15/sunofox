import {
  createSessionCookie,
  getAdminEmail,
  getLoginCode,
  getUser,
  json,
  normalizeEmail,
  saveUser
} from '../../_shared/auth.js';

export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ ok: false, message: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  const code = String(body.code || '').trim();
  const next = String(body.next || '/');
  const adminEmail = getAdminEmail(context.env);

  if (!email || !code) {
    return json({ ok: false, message: '이메일과 입장 코드를 입력해 주세요.' }, { status: 400 });
  }

  if (code !== getLoginCode(context.env)) {
    return json({ ok: false, message: '입장 코드가 올바르지 않습니다.' }, { status: 401 });
  }

  let user = await getUser(context.env, email);
  const now = new Date().toISOString();
  if (!user && email === adminEmail) {
    user = {
      email,
      name: 'Owner',
      note: '',
      status: 'approved',
      createdAt: now,
      updatedAt: now,
      approvedAt: now,
      approvedBy: 'system'
    };
    await saveUser(context.env, user);
  }

  if (!user) {
    return json({ ok: false, message: '가입 신청 후 승인을 받아 주세요.' }, { status: 403 });
  }

  if (user.status !== 'approved') {
    return json({
      ok: false,
      status: user.status,
      message: user.status === 'rejected' ? '승인되지 않은 이메일입니다.' : '아직 승인 대기 중입니다.'
    }, { status: 403 });
  }

  const cookie = await createSessionCookie(context.request, context.env, {
    email,
    role: email === adminEmail ? 'owner' : 'member'
  });

  return json({ ok: true, next }, { headers: { 'set-cookie': cookie } });
}
