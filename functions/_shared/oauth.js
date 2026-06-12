import {
  clearOAuthStateCookie,
  createOAuthStateCookie,
  createSessionCookie,
  getAdminEmail,
  getUser,
  kvDelete,
  kvListUsers,
  normalizeEmail,
  normalizeNickname,
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

function isEnabled(value) {
  return ['1', 'true', 'yes', 'on', 'enabled'].includes(String(value || '').trim().toLowerCase());
}

function kakaoScope(env) {
  const scopes = ['profile_nickname'];
  if (isEnabled(env.SF_KAKAO_EMAIL_SCOPE)) {
    scopes.push('account_email');
  }
  return scopes.join(' ');
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
      scope: kakaoScope(env)
    };
  }
  return null;
}

export function getOAuthProviderStatus(env) {
  const google = providerConfig('google', env);
  const kakao = providerConfig('kakao', env);
  return {
    google: {
      label: 'Google',
      configured: Boolean(google?.clientId && google?.clientSecret),
      required: ['SF_GOOGLE_CLIENT_ID', 'SF_GOOGLE_CLIENT_SECRET']
    },
    kakao: {
      label: 'Kakao',
      configured: Boolean(kakao?.clientId),
      emailScopeRequested: isEnabled(env.SF_KAKAO_EMAIL_SCOPE),
      required: ['SF_KAKAO_REST_API_KEY']
    }
  };
}

export async function startOAuth(context, provider) {
  const config = providerConfig(provider, context.env);
  if (!config) {
    return Response.redirect(loginRedirect(context.request, 'unsupported').toString(), 302);
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

async function findUserByProviderId(env, provider, providerId) {
  if (!provider || !providerId) return null;
  const users = await kvListUsers(env).catch(() => []);
  return users.find((user) => String(user?.providerIds?.[provider] || '') === String(providerId)) || null;
}

async function migrateCommunityEmailReferences(env, fromEmail, toEmail) {
  const previous = normalizeEmail(fromEmail);
  const next = normalizeEmail(toEmail);
  if (!env.SF_COMMUNITY_DB || !previous || !next || previous === next) return;

  const db = env.SF_COMMUNITY_DB;
  const statements = [
    ['UPDATE posts SET author_email = ? WHERE author_email = ?', [next, previous]],
    ['UPDATE comments SET author_email = ? WHERE author_email = ?', [next, previous]],
    [
      `INSERT OR IGNORE INTO post_reactions (post_id, actor_email, value, created_at, updated_at)
       SELECT post_id, ?, value, created_at, updated_at FROM post_reactions WHERE actor_email = ?`,
      [next, previous]
    ],
    ['DELETE FROM post_reactions WHERE actor_email = ?', [previous]],
    [
      `UPDATE community_reports
       SET reporter_email = ?
       WHERE reporter_email = ?
         AND NOT EXISTS (
           SELECT 1 FROM community_reports existing
           WHERE existing.target_type = community_reports.target_type
             AND existing.target_id = community_reports.target_id
             AND existing.reporter_email = ?
         )`,
      [next, previous, next]
    ],
    ['DELETE FROM community_reports WHERE reporter_email = ?', [previous]]
  ];

  for (const [sql, params] of statements) {
    await db.prepare(sql).bind(...params).run().catch(() => {});
  }
}

function mergeOAuthExistingUsers(primary, secondary) {
  if (!secondary) return primary || null;
  if (!primary) return secondary || null;
  return {
    ...secondary,
    ...primary,
    providers: [...new Set([...(secondary.providers || []), ...(primary.providers || [])])],
    providerIds: {
      ...(secondary.providerIds || {}),
      ...(primary.providerIds || {})
    },
    createdAt: primary.createdAt || secondary.createdAt,
    note: primary.note || secondary.note || '',
    avatarUrl: primary.avatarUrl || secondary.avatarUrl || ''
  };
}

async function upsertOAuthUser(env, profile) {
  const profileEmail = normalizeEmail(profile.email);
  const fallbackEmail = !profileEmail && profile.provider === 'kakao' && profile.providerId
    ? normalizeEmail(`kakao-${profile.providerId}@oauth.sunofox.local`)
    : '';
  const email = profileEmail || fallbackEmail;
  if (!email) {
    throw new Error('OAuth email permission is required');
  }
  const now = new Date().toISOString();
  const adminEmail = getAdminEmail(env);
  const existingByEmail = await getUser(env, email);
  const existingByProvider = await findUserByProviderId(env, profile.provider, profile.providerId);
  const existing = mergeOAuthExistingUsers(existingByProvider || existingByEmail, existingByProvider && existingByEmail ? existingByEmail : null);
  const previousEmail = normalizeEmail(existing?.email);
  const providers = new Set([...(existing?.providers || []), profile.provider]);
  const providerIds = {
    ...(existing?.providerIds || {}),
    [profile.provider]: profile.providerId
  };
  const status = existing?.status === 'rejected' ? 'rejected' : 'approved';
  const nickname = normalizeNickname(existing?.nickname || profile.nickname || profile.name, email);
  const user = {
    ...(existing || {}),
    email,
    name: existing?.name || profile.name || nickname,
    nickname,
    note: existing?.note || '',
    provider: existing?.provider || profile.provider,
    providers: [...providers],
    providerIds,
    avatarUrl: existing?.avatarUrl || profile.avatarUrl || '',
    status,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    approvedAt: status === 'approved' ? existing?.approvedAt || now : existing?.approvedAt || null,
    approvedBy: status === 'approved'
      ? existing?.approvedBy || (email === adminEmail ? 'system' : 'self-service')
      : existing?.approvedBy || null
  };
  await saveUser(env, user);
  if (previousEmail && previousEmail !== email) {
    await migrateCommunityEmailReferences(env, previousEmail, email);
    await kvDelete(env, `user:${previousEmail}`);
  }
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
      const target = loginRedirect(context.request, user.status === 'rejected' ? 'rejected' : 'status-error');
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
