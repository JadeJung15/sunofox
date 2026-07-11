import { clearOAuthStateCookie, createOAuthStateCookie, createSessionCookie, getAdminEmail, normalizeEmail, readOAuthState, safeRedirectPath } from './auth.js';

function randomState() {
  return crypto.randomUUID ? crypto.randomUUID() : [...crypto.getRandomValues(new Uint8Array(16))].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function loginRedirect(request, reason, next = '/mv-studio') {
  const url = new URL('/login', new URL(request.url).origin);
  url.searchParams.set('next', safeRedirectPath(next, '/mv-studio'));
  if (reason) url.searchParams.set('oauth', reason);
  return url;
}

function studioRedirectPath(value) {
  const path = safeRedirectPath(value, '/mv-studio');
  return path === '/mv-studio' || path === '/mv-studio.html' || path.startsWith('/mv-studio/') ? path : '/mv-studio';
}

function googleConfig(env) {
  return {
    clientId: String(env.SF_GOOGLE_CLIENT_ID || '').trim(),
    clientSecret: String(env.SF_GOOGLE_CLIENT_SECRET || '').trim(),
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://openidconnect.googleapis.com/v1/userinfo'
  };
}

export function getOAuthProviderStatus(env) {
  const google = googleConfig(env);
  return { google: { label: 'Google', configured: Boolean(google.clientId && google.clientSecret), required: ['SF_GOOGLE_CLIENT_ID', 'SF_GOOGLE_CLIENT_SECRET'] } };
}

export async function startOAuth(context, provider) {
  if (provider !== 'google') return Response.redirect(loginRedirect(context.request, 'unsupported').toString(), 302);
  const config = googleConfig(context.env);
  if (!config.clientId || !config.clientSecret) return Response.redirect(loginRedirect(context.request, 'missing-google').toString(), 302);
  const requestUrl = new URL(context.request.url);
  const next = studioRedirectPath(requestUrl.searchParams.get('next'));
  const state = randomState();
  const redirectUri = `${requestUrl.origin}/api/auth/oauth/google/callback`;
  const authUrl = new URL(config.authUrl);
  for (const [key, value] of Object.entries({ client_id: config.clientId, redirect_uri: redirectUri, response_type: 'code', scope: 'openid email profile', state, access_type: 'online', prompt: 'select_account' })) authUrl.searchParams.set(key, value);
  const headers = new Headers({ location: authUrl.toString() });
  headers.append('set-cookie', await createOAuthStateCookie(context.request, context.env, { state, next }));
  return new Response(null, { status: 302, headers });
}

async function fetchGoogleProfile(config, code, redirectUri) {
  const body = new URLSearchParams({ grant_type: 'authorization_code', client_id: config.clientId, client_secret: config.clientSecret, redirect_uri: redirectUri, code });
  const tokenResponse = await fetch(config.tokenUrl, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded;charset=utf-8' }, body });
  const token = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || !token.access_token) throw new Error('token');
  const profileResponse = await fetch(config.userInfoUrl, { headers: { authorization: `Bearer ${token.access_token}` } });
  const profile = await profileResponse.json().catch(() => ({}));
  if (!profileResponse.ok) throw new Error('profile');
  return profile;
}

export async function handleOAuthCallback(context, provider) {
  if (provider !== 'google') return Response.redirect(loginRedirect(context.request, 'unsupported').toString(), 302);
  const requestUrl = new URL(context.request.url);
  const code = requestUrl.searchParams.get('code') || '';
  const state = requestUrl.searchParams.get('state') || '';
  const oauthState = await readOAuthState(context.request, context.env, state);
  const headers = new Headers();
  headers.append('set-cookie', clearOAuthStateCookie());
  if (!code || !oauthState) {
    headers.set('location', loginRedirect(context.request, 'state-error').toString());
    return new Response(null, { status: 302, headers });
  }
  try {
    const config = googleConfig(context.env);
    const profile = await fetchGoogleProfile(config, code, `${requestUrl.origin}/api/auth/oauth/google/callback`);
    const email = normalizeEmail(profile.email);
    if (!email || email !== getAdminEmail(context.env)) {
      headers.set('location', loginRedirect(context.request, 'owner-required', oauthState.next).toString());
      return new Response(null, { status: 302, headers });
    }
    headers.append('set-cookie', await createSessionCookie(context.request, context.env, { email, role: 'owner' }));
    headers.set('location', new URL(studioRedirectPath(oauthState.next), requestUrl.origin).toString());
    return new Response(null, { status: 302, headers });
  } catch {
    headers.set('location', loginRedirect(context.request, 'google-error', oauthState.next).toString());
    return new Response(null, { status: 302, headers });
  }
}
