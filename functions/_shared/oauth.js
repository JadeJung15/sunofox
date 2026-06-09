import {
  clearOAuthStateCookie,
  createOAuthStateCookie,
  createSessionCookie,
  getAdminEmail,
  getUser,
  json,
  normalizeEmail,
  normalizeNickname,
  randomUserIconId,
  saveUser,
  safeRedirectPath,
  verifyOAuthState
} from './auth.js';

function randomState() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function loginRedirect(request, reason) {
  const url = new URL('/login', new URL(request.url).origin);
  if (reason) url.searchParams.set('oauth', reason);
  return url;
}

function providerConfig(provider, env) {
  if (provider === 'google') {
    return {
      provider,
      label: 'Google',
      clientId: String(env.SF_GOOGLE_CLIENT_ID || '').trim(),
      clientSecret: String(env.SF_GOOGLE_CLIENT_SECRET || '').trim(),
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userInfoUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
      scope: 'openid email profile'
    };
  }
  if (provider === 'kakao') {
    return {
      provider,
      label: 'Kakao',
      clientId: String(env.SF_KAKAO_REST_API_KEY || '').trim(),
      clientSecret: String(env.SF_KAKAO_CLIENT_SECRET || '').trim(),
      authUrl: 'https://kauth.kakao.com/oauth/authorize',
      tokenUrl: 'https://kauth.kakao.com/oauth/token',
      userInfoUrl: 'https://kapi.kakao.com/v2/user/me',
      scope: 'account_email profile_nickname'
    };
  }
  return null;
}

export async function startOAuth(context, provider) {
  const config = providerConfig(provider, context.env);
  if (!config) {
    return json({ ok: false, message: '지원하지 않는 로그인 방식입니다.' }, { status: 400 });
  }
  if (!config.clientId || (provider === 'google' && !config.clientSecret)) {
    return Response.redirect(loginRedirect(context.request, `missing-${provider}`).toString(), 302);
  }

  const requestUrl = new URL(context.request.url);
  const state = randomState();
  const redirectUri = `${requestUrl.origin}/api/auth/oauth/${provider}/callback`;
  const authUrl = new URL(config.authUrl);
  authUrl.searchParams.set('client_id', config.clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', config.scope);
  authUrl.searchParams.set('state', state);
  if (provider === 'google') {
    authUrl.searchParams.set('access_type', 'online');
    authUrl.searchParams.set('prompt', 'select_account');
  }

  const stateCookie = await createOAuthStateCookie(context.request, context.env, state);
  const headers = new Headers({ location: authUrl.toString() });
  headers.append('set-cookie', stateCookie);
  return new Response(null, { status: 302, headers });
}

async function fetchToken(config, code, redirectUri) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: config.clientId,
    redirect_uri: redirectUri,
    code
  });
  if (config.clientSecret) {
    body.set('client_secret', config.clientSecret);
  }
  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded;charset=utf-8' },
    body
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || 'OAuth token exchange failed');
  }
  return data;
}

async function fetchOAuthProfile(config, accessToken) {
  const response = await fetch(config.userInfoUrl, {
    headers: { authorization: `Bearer ${accessToken}` }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.msg || data.error_description || data.error || 'OAuth profile fetch failed');
  }

  if (config.provider === 'google') {
    return {
      provider: 'google',
      providerId: String(data.sub || ''),
      email: normalizeEmail(data.email),
      name: String(data.name || ''),
      nickname: String(data.given_name || data.name || ''),
      avatarUrl: String(data.picture || '')
    };
  }

  const account = data.kakao_account || {};
  const profile = account.profile || {};
  return {
    provider: 'kakao',
    providerId: String(data.id || ''),
    email: normalizeEmail(account.email),
    name: String(profile.nickname || ''),
    nickname: String(profile.nickname || ''),
    avatarUrl: String(profile.thumbnail_image_url || profile.profile_image_url || '')
  };
}

async function upsertOAuthUser(env, profile) {
  const email = normalizeEmail(profile.email);
  if (!email) {
    throw new Error('OAuth email permission is required');
  }
  const now = new Date().toISOString();
  const adminEmail = getAdminEmail(env);
  const existing = await getUser(env, email);
  const providers = new Set([...(existing?.providers || []), profile.provider]);
  const providerIds = {
    ...(existing?.providerIds || {}),
    [profile.provider]: profile.providerId
  };
  const status = existing?.status || (email === adminEmail ? 'approved' : 'pending');
  const nickname = normalizeNickname(existing?.nickname || profile.nickname || profile.name, email);
  const user = {
    ...(existing || {}),
    email,
    name: existing?.name || profile.name || nickname,
    nickname,
    note: existing?.note || '',
    iconId: existing?.iconId || randomUserIconId(),
    provider: existing?.provider || profile.provider,
    providers: [...providers],
    providerIds,
    avatarUrl: existing?.avatarUrl || profile.avatarUrl || '',
    status,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    approvedAt: existing?.approvedAt || (status === 'approved' ? now : null),
    approvedBy: existing?.approvedBy || (status === 'approved' ? 'system' : null)
  };
  await saveUser(env, user);
  return user;
}

export async function handleOAuthCallback(context, provider) {
  const config = providerConfig(provider, context.env);
  if (!config) {
    return Response.redirect(loginRedirect(context.request, 'unsupported').toString(), 302);
  }

  const requestUrl = new URL(context.request.url);
  const code = requestUrl.searchParams.get('code') || '';
  const state = requestUrl.searchParams.get('state') || '';
  const redirectUri = `${requestUrl.origin}/api/auth/oauth/${provider}/callback`;
  const baseHeaders = new Headers();
  baseHeaders.append('set-cookie', clearOAuthStateCookie());

  if (!code || !(await verifyOAuthState(context.request, context.env, state))) {
    const target = loginRedirect(context.request, 'state-error');
    baseHeaders.set('location', target.toString());
    return new Response(null, { status: 302, headers: baseHeaders });
  }

  try {
    const token = await fetchToken(config, code, redirectUri);
    const profile = await fetchOAuthProfile(config, token.access_token);
    const user = await upsertOAuthUser(context.env, profile);
    if (user.status !== 'approved') {
      const target = loginRedirect(context.request, 'pending');
      baseHeaders.set('location', target.toString());
      return new Response(null, { status: 302, headers: baseHeaders });
    }

    const sessionCookie = await createSessionCookie(context.request, context.env, {
      email: user.email,
      role: normalizeEmail(user.email) === getAdminEmail(context.env) ? 'owner' : 'member'
    });
    const target = new URL(safeRedirectPath(requestUrl.searchParams.get('next') || '/account'), requestUrl.origin);
    baseHeaders.append('set-cookie', sessionCookie);
    baseHeaders.set('location', target.toString());
    return new Response(null, { status: 302, headers: baseHeaders });
  } catch {
    const target = loginRedirect(context.request, provider === 'kakao' ? 'kakao-error' : 'google-error');
    baseHeaders.set('location', target.toString());
    return new Response(null, { status: 302, headers: baseHeaders });
  }
}
