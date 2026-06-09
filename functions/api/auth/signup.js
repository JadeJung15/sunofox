import {
  getAdminEmail,
  getUser,
  hashPassword,
  json,
  normalizeEmail,
  normalizeNickname,
  randomUserIconId,
  saveUser,
  validatePassword
} from '../../_shared/auth.js';

export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ ok: false, message: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  const nickname = normalizeNickname(body.nickname || body.name, email);
  const name = String(body.name || nickname).trim();
  const note = String(body.note || '').trim();
  const password = String(body.password || '');
  const passwordConfirm = String(body.passwordConfirm || '');

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, message: '이메일 형식을 확인해 주세요.' }, { status: 400 });
  }

  const passwordMessage = validatePassword(password, passwordConfirm);
  if (passwordMessage) {
    return json({ ok: false, message: passwordMessage }, { status: 400 });
  }

  const now = new Date().toISOString();
  const existing = await getUser(context.env, email);
  if (existing) {
    if (!existing.password) {
      await saveUser(context.env, {
        ...existing,
        name: existing.name || name,
        nickname: existing.nickname || nickname,
        iconId: existing.iconId || randomUserIconId(),
        provider: existing.provider || 'email',
        providers: Array.from(new Set([...(existing.providers || []), 'email'])),
        password: await hashPassword(password),
        updatedAt: now
      });
    }
    return json({
      ok: true,
      status: existing.status,
      message: existing.status === 'approved'
        ? '이미 승인된 이메일입니다. 비밀번호로 로그인해 주세요.'
        : '이미 신청된 이메일입니다. 승인 상태를 기다려 주세요.'
    });
  }

  const adminEmail = getAdminEmail(context.env);
  const status = email === adminEmail ? 'approved' : 'pending';
  await saveUser(context.env, {
    email,
    name,
    nickname,
    note,
    iconId: randomUserIconId(),
    provider: 'email',
    providers: ['email'],
    password: await hashPassword(password),
    status,
    createdAt: now,
    updatedAt: now,
    approvedAt: status === 'approved' ? now : null,
    approvedBy: status === 'approved' ? 'system' : null
  });

  return json({
    ok: true,
    status,
    message: status === 'approved'
      ? '관리자 이메일은 자동 승인되었습니다. 로그인해 주세요.'
      : '가입 신청이 접수되었습니다. 승인 후 이메일 비밀번호 또는 연결된 소셜 계정으로 로그인할 수 있습니다.'
  });
}
