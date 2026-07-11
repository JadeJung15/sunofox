const SESSION_COOKIE = 'sf_studio_session';
const OAUTH_STATE_COOKIE = 'sf_oauth_state';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const OAUTH_STATE_TTL_SECONDS = 60 * 10;

export const ADMIN_EMAIL = 'jadejung15@gmail.com';

export function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...(init.headers || {}) }
  });
}

export function getAdminEmail(env) {
  return normalizeEmail(env.SF_STUDIO_ADMIN_EMAIL || ADMIN_EMAIL);
}

function getSessionSecret(env) {
  return String(env.SF_STUDIO_SESSION_SECRET || env.SF_STUDIO_ADMIN_KEY || 'local-dev-session-secret');
}

export function safeRedirectPath(value, fallback = '/') {
  const next = String(value || fallback).trim() || fallback;
  if (!next.startsWith('/') || next.startsWith('//')) return fallback;
  try {
    const url = new URL(next, 'https://sunofox.com');
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

function base64UrlEncode(input) {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecode(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function getCookieValue(request, name) {
  const match = (request.headers.get('cookie') || '').split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1) : '';
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return base64UrlEncode(new Uint8Array(signature));
}

export async function createSessionCookie(request, env, session) {
  const payload = base64UrlEncode(JSON.stringify({ ...session, exp: Date.now() + SESSION_TTL_SECONDS * 1000 }));
  const signature = await sign(payload, getSessionSecret(env));
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${SESSION_COOKIE}=${payload}.${signature}; Path=/; Max-Age=${SESSION_TTL_SECONDS}; HttpOnly; SameSite=Lax${secure}`;
}

export async function createOAuthStateCookie(request, env, state) {
  const payload = base64UrlEncode(JSON.stringify({ ...state, exp: Date.now() + OAUTH_STATE_TTL_SECONDS * 1000 }));
  const signature = await sign(payload, getSessionSecret(env));
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${OAUTH_STATE_COOKIE}=${payload}.${signature}; Path=/; Max-Age=${OAUTH_STATE_TTL_SECONDS}; HttpOnly; SameSite=Lax${secure}`;
}

export function clearOAuthStateCookie() {
  return `${OAUTH_STATE_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;
}

export async function readOAuthState(request, env, state) {
  const [payload, signature] = getCookieValue(request, OAUTH_STATE_COOKIE).split('.');
  if (!payload || !signature || !state || signature !== await sign(payload, getSessionSecret(env))) return null;
  try {
    const data = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload)));
    return data.state === state && Number(data.exp) >= Date.now() ? data : null;
  } catch {
    return null;
  }
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;
}

export async function verifySession(request, env) {
  const [payload, signature] = getCookieValue(request, SESSION_COOKIE).split('.');
  if (!payload || !signature || signature !== await sign(payload, getSessionSecret(env))) return null;
  try {
    const data = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload)));
    if (!data.exp || Date.now() > data.exp || normalizeEmail(data.email) !== getAdminEmail(env)) return null;
    return data;
  } catch {
    return null;
  }
}

export function isProtectedStudioPath(pathname) {
  return pathname === '/mv-studio' || pathname === '/mv-studio.html' || pathname.startsWith('/mv-studio/');
}

export function redirectToLogin(request) {
  const url = new URL(request.url);
  const login = new URL('/login', url.origin);
  login.searchParams.set('next', `${url.pathname}${url.search}${url.hash}`);
  return Response.redirect(login.toString(), 302);
}
