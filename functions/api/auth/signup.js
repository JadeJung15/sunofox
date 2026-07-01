import {
  getAdminEmail,
  getUser,
  hashPassword,
  json,
  normalizeEmail,
  normalizeNickname,
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
  const adminEmail = getAdminEmail(context.env);
  const isAdminEmail = email === adminEmail;
  const existing = await getUser(context.env, email);
  if (existing) {
    if (existing.status === 'rejected') {
      return json({ ok: false, status: 'rejected', message: '이메일 계정 이용이 제한되어 있습니다.' }, { status: 403 });
    }
    const status = existing.status === 'approved' || isAdminEmail ? 'approved' : 'pending';
    if (!existing.password) {
      await saveUser(context.env, {
        ...existing,
        name: existing.name || name,
        nickname: existing.nickname || nickname,
        provider: existing.provider || 'email',
        providers: Array.from(new Set([...(existing.providers || []), 'email'])),
        password: await hashPassword(password),
        status,
        approvedAt: status === 'approved' ? existing.approvedAt || now : existing.approvedAt || null,
        approvedBy: status === 'approved' ? existing.approvedBy || (isAdminEmail ? 'system' : null) : existing.approvedBy || null,
        updatedAt: now
      });
    } else if (existing.status !== status) {
      await saveUser(context.env, {
        ...existing,
        status,
        approvedAt: status === 'approved' ? existing.approvedAt || now : existing.approvedAt || null,
        approvedBy: status === 'approved' ? existing.approvedBy || (isAdminEmail ? 'system' : null) : existing.approvedBy || null,
        updatedAt: now
      });
    }
    return json({
      ok: true,
      status,
      message: status === 'approved'
        ? '이미 승인된 계정입니다. 이메일 비밀번호로 로그인해 주세요.'
        : '가입 신청이 접수되어 있습니다. 승인 안내와 입장 코드를 받은 뒤 로그인해 주세요.'
    });
  }

  const status = isAdminEmail ? 'approved' : 'pending';
  await saveUser(context.env, {
    email,
    name,
    nickname,
    note,
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
      ? '회원가입이 완료되었습니다. 로그인 후 닉네임을 언제든 수정할 수 있습니다.'
      : '가입 신청이 접수되었습니다. 승인 안내와 입장 코드를 받은 뒤 로그인해 주세요.'
  });
}
