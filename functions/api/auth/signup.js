import { getAdminEmail, getUser, json, normalizeEmail, saveUser } from '../../_shared/auth.js';

export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ ok: false, message: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  const name = String(body.name || '').trim();
  const note = String(body.note || '').trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, message: '이메일 형식을 확인해 주세요.' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const existing = await getUser(context.env, email);
  if (existing) {
    return json({
      ok: true,
      status: existing.status,
      message: existing.status === 'approved'
        ? '이미 승인된 이메일입니다. 로그인해 주세요.'
        : '이미 신청된 이메일입니다. 승인 상태를 기다려 주세요.'
    });
  }

  const adminEmail = getAdminEmail(context.env);
  const status = email === adminEmail ? 'approved' : 'pending';
  await saveUser(context.env, {
    email,
    name,
    note,
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
      : '가입 신청이 접수되었습니다. 승인 안내를 받은 뒤 로그인해 주세요.'
  });
}
