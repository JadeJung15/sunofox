const SESSION_COOKIE = 'sf_studio_session';
const OAUTH_STATE_COOKIE = 'sf_oauth_state';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const OAUTH_STATE_TTL_SECONDS = 60 * 10;
const PASSWORD_ITERATIONS = 100000;
const AUTH_KV_FALLBACK = '__sfStudioAuthMemoryStore';

export const ADMIN_EMAIL = 'jadejung15@gmail.com';

function getMemoryStore() {
  if (!globalThis[AUTH_KV_FALLBACK]) {
    globalThis[AUTH_KV_FALLBACK] = new Map();
  }
  return globalThis[AUTH_KV_FALLBACK];
}

export function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

export function normalizeNickname(value, fallback = '') {
  const cleaned = String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 24);
  if (cleaned) return cleaned;
  const fallbackText = String(fallback || '').trim();
  if (fallbackText.includes('@')) {
    return fallbackText.split('@')[0].slice(0, 24) || 'fan';
  }
  return fallbackText.slice(0, 24) || 'fan';
}

export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...(init.headers || {})
    }
  });
}

export function getAdminEmail(env) {
  return normalizeEmail(env.SF_STUDIO_ADMIN_EMAIL || ADMIN_EMAIL);
}

export function getLoginCode(env) {
  return String(env.SF_STUDIO_LOGIN_CODE || '4416').trim();
}

function getSessionSecret(env) {
  return String(env.SF_STUDIO_SESSION_SECRET || env.SF_STUDIO_ADMIN_KEY || 'local-dev-session-secret');
}

export function safeRedirectPath(value) {
  const next = String(value || '/').trim() || '/';
  if (!next.startsWith('/') || next.startsWith('//')) return '/';
  return next;
}

export function getAdminKey(env, request) {
  const configured = String(env.SF_STUDIO_ADMIN_KEY || '').trim();
  if (configured) return configured;
  if (request) {
    const hostname = new URL(request.url).hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'local-admin-key';
    }
  }
  return '';
}

export function requireAdmin(request, env) {
  const configured = getAdminKey(env, request);
  if (!configured) {
    return false;
  }
  const authHeader = request.headers.get('authorization') || '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const headerKey = request.headers.get('x-admin-key') || '';
  return bearer === configured || headerKey === configured;
}

export async function requireAdminAccess(request, env) {
  if (requireAdmin(request, env)) {
    return true;
  }

  const session = await verifySession(request, env);
  return normalizeEmail(session?.email) === getAdminEmail(env);
}

export async function kvGet(env, key) {
  if (env.SF_STUDIO_AUTH) {
    const raw = await env.SF_STUDIO_AUTH.get(key);
    return raw ? JSON.parse(raw) : null;
  }
  const store = getMemoryStore();
  return store.has(key) ? store.get(key) : null;
}

export async function kvPut(env, key, value) {
  if (env.SF_STUDIO_AUTH) {
    await env.SF_STUDIO_AUTH.put(key, JSON.stringify(value));
    return;
  }
  getMemoryStore().set(key, value);
}

export async function kvDelete(env, key) {
  if (env.SF_STUDIO_AUTH) {
    await env.SF_STUDIO_AUTH.delete(key);
    return;
  }
  getMemoryStore().delete(key);
}

export async function kvListPrefix(env, prefix) {
  if (env.SF_STUDIO_AUTH) {
    const listed = await env.SF_STUDIO_AUTH.list({ prefix });
    const values = [];
    for (const key of listed.keys) {
      const value = await kvGet(env, key.name);
      if (value) values.push(value);
    }
    return values;
  }

  return [...getMemoryStore().entries()]
    .filter(([key]) => key.startsWith(prefix))
    .map(([, value]) => value);
}

export async function kvListUsers(env) {
  return kvListPrefix(env, 'user:');
}

export async function getUser(env, email) {
  return kvGet(env, `user:${normalizeEmail(email)}`);
}

export async function saveUser(env, user) {
  await kvPut(env, `user:${normalizeEmail(user.email)}`, user);
}

export function publicUser(user, extra = {}) {
  return {
    email: normalizeEmail(user?.email),
    name: String(user?.name || ''),
    nickname: normalizeNickname(user?.nickname || user?.name || '', user?.email || ''),
    status: user?.status || 'pending',
    provider: user?.provider || 'email',
    providers: Array.isArray(user?.providers) ? user.providers : [user?.provider || 'email'],
    createdAt: user?.createdAt || '',
    updatedAt: user?.updatedAt || '',
    ...extra
  };
}

function validatePasswordValue(password) {
  const value = String(password || '');
  if (value.length < 8) {
    return '비밀번호는 8자 이상으로 입력해 주세요.';
  }
  if (value.length > 128) {
    return '비밀번호는 128자 이하로 입력해 주세요.';
  }
  return '';
}

export function validatePassword(password, passwordConfirm) {
  const message = validatePasswordValue(password);
  if (message) return message;
  if (passwordConfirm !== undefined && String(password || '') !== String(passwordConfirm || '')) {
    return '비밀번호 확인이 일치하지 않습니다.';
  }
  return '';
}

function base64UrlEncode(input) {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecode(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function getCookieValue(request, name) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return cookie ? cookie.slice(name.length + 1) : '';
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return base64UrlEncode(new Uint8Array(signature));
}

export async function hashPassword(password) {
  const message = validatePasswordValue(password);
  if (message) {
    throw new Error(message);
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(String(password)),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations: PASSWORD_ITERATIONS
    },
    key,
    256
  );
  return {
    algorithm: 'PBKDF2-SHA256',
    iterations: PASSWORD_ITERATIONS,
    salt: base64UrlEncode(salt),
    hash: base64UrlEncode(new Uint8Array(derived))
  };
}

export async function verifyPassword(password, passwordRecord) {
  if (!passwordRecord?.salt || !passwordRecord?.hash) return false;
  const iterations = Number.parseInt(passwordRecord.iterations || PASSWORD_ITERATIONS, 10);
  const salt = base64UrlDecode(String(passwordRecord.salt));
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(String(password || '')),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations
    },
    key,
    256
  );
  const expected = base64UrlDecode(String(passwordRecord.hash));
  const actual = new Uint8Array(derived);
  if (expected.length !== actual.length) return false;
  let diff = 0;
  for (let index = 0; index < expected.length; index += 1) {
    diff |= expected[index] ^ actual[index];
  }
  return diff === 0;
}

export async function createSessionCookie(request, env, session) {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = base64UrlEncode(JSON.stringify({ ...session, exp: expiresAt }));
  const signature = await sign(payload, getSessionSecret(env));
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${SESSION_COOKIE}=${payload}.${signature}; Path=/; Max-Age=${SESSION_TTL_SECONDS}; HttpOnly; SameSite=Lax${secure}`;
}

export async function createOAuthStateCookie(request, env, state) {
  const expiresAt = Date.now() + OAUTH_STATE_TTL_SECONDS * 1000;
  const payload = base64UrlEncode(JSON.stringify({ state, exp: expiresAt }));
  const signature = await sign(payload, getSessionSecret(env));
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${OAUTH_STATE_COOKIE}=${payload}.${signature}; Path=/; Max-Age=${OAUTH_STATE_TTL_SECONDS}; HttpOnly; SameSite=Lax${secure}`;
}

export function clearOAuthStateCookie() {
  return `${OAUTH_STATE_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;
}

export async function verifyOAuthState(request, env, state) {
  const value = getCookieValue(request, OAUTH_STATE_COOKIE);
  const [payload, signature] = value.split('.');
  if (!payload || !signature || !state) return false;
  const expected = await sign(payload, getSessionSecret(env));
  if (signature !== expected) return false;
  try {
    const data = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload)));
    return data.state === state && data.exp && Date.now() <= data.exp;
  } catch {
    return false;
  }
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;
}

export async function verifySession(request, env) {
  const value = getCookieValue(request, SESSION_COOKIE);
  if (!value) return null;
  const [payload, signature] = value.split('.');
  if (!payload || !signature) return null;

  const expected = await sign(payload, getSessionSecret(env));
  if (signature !== expected) return null;

  try {
    const data = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload)));
    if (!data.exp || Date.now() > data.exp) return null;
    return data;
  } catch {
    return null;
  }
}

export function isProtectedStudioPath(pathname) {
  return pathname === '/mv-studio' ||
    pathname === '/mv-studio.html' ||
    pathname.startsWith('/mv-studio/');
}

export function redirectToLogin(request) {
  const url = new URL(request.url);
  const login = new URL('/login', url.origin);
  login.searchParams.set('next', `${url.pathname}${url.search}${url.hash}`);
  return Response.redirect(login.toString(), 302);
}
