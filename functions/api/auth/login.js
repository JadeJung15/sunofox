import {
  createSessionCookie,
  getAdminEmail,
  getLoginCode,
  getUser,
  json,
  normalizeEmail,
  normalizeNickname,
  randomUserIconId,
  safeRedirectPath,
  saveUser,
  verifyPassword
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
  const password = String(body.password || '');
  const next = safeRedirectPath(body.next || '/');
  const adminEmail = getAdminEmail(context.env);

  if (!email || (!password && !code)) {
    return json({ ok: false, message: '이메일과 비밀번호를 입력해 주세요. 기존 승인 계정은 입장 코드도 사용할 수 있습니다.' }, { status: 400 });
  }

  let user = await getUser(context.env, email);
  const now = new Date().toISOString();
  if (!user && email === adminEmail) {
    user = {
      email,
      name: 'Owner',
      nickname: 'Owner',
      note: '',
      iconId: randomUserIconId(),
      provider: 'email',
      providers: ['email'],
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

  const passwordMatched = password ? await verifyPassword(password, user.password) : false;
  const codeMatched = code ? code === getLoginCode(context.env) : false;
  if (!passwordMatched && !codeMatched) {
    return json({
      ok: false,
      message: user.password ? '비밀번호가 올바르지 않습니다.' : '입장 코드가 올바르지 않습니다.'
    }, { status: 401 });
  }

  if (!user.nickname || !user.iconId || !user.provider) {
    user = {
      ...user,
      nickname: normalizeNickname(user.nickname || user.name, email),
      iconId: user.iconId || randomUserIconId(),
      provider: user.provider || 'email',
      providers: Array.isArray(user.providers) && user.providers.length ? user.providers : ['email'],
      updatedAt: now
    };
    await saveUser(context.env, user);
  }

  const cookie = await createSessionCookie(context.request, context.env, {
    email,
    role: email === adminEmail ? 'owner' : 'member'
  });

  return json({ ok: true, next }, { headers: { 'set-cookie': cookie } });
}
