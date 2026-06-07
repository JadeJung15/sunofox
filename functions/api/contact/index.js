function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...(init.headers || {})
    }
  });
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function cleanText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

async function readPayload(request) {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return request.json().catch(() => ({}));
  }

  const formData = await request.formData().catch(() => null);
  return formData ? Object.fromEntries(formData.entries()) : {};
}

export async function onRequestPost({ request, env }) {
  const payload = await readPayload(request);
  const email = normalizeEmail(payload.email);
  const message = cleanText(payload.message, 4000);
  const page = cleanText(payload.page || '/', 160);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, message: '이메일 주소를 확인해 주세요.' }, { status: 400 });
  }

  if (message.length < 5) {
    return json({ ok: false, message: '문의 내용을 5자 이상 입력해 주세요.' }, { status: 400 });
  }

  const db = env.SF_COMMUNITY_DB || env.SUNOFOX_DB || env.CONTACT_DB;
  if (!db) {
    return json({ ok: false, message: '문의 저장소가 아직 연결되지 않았습니다.' }, { status: 503 });
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const userAgent = cleanText(request.headers.get('user-agent'), 300);

  await db.prepare(`
    INSERT INTO contact_messages (id, email, message, page, user_agent, status, created_at, updated_at)
    VALUES (?1, ?2, ?3, ?4, ?5, 'new', ?6, ?6)
  `).bind(id, email, message, page, userAgent, now).run();

  return json({ ok: true, message: '문의가 저장되었습니다. 확인 후 연락드리겠습니다.' }, { status: 201 });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}
