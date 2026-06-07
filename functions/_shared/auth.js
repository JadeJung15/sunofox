const SESSION_COOKIE = 'sf_studio_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
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

export async function createSessionCookie(request, env, session) {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = base64UrlEncode(JSON.stringify({ ...session, exp: expiresAt }));
  const signature = await sign(payload, getSessionSecret(env));
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${SESSION_COOKIE}=${payload}.${signature}; Path=/; Max-Age=${SESSION_TTL_SECONDS}; HttpOnly; SameSite=Lax${secure}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;
}

export async function verifySession(request, env) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  if (!cookie) return null;

  const value = cookie.slice(SESSION_COOKIE.length + 1);
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
