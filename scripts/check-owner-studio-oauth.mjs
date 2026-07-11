import assert from 'node:assert/strict';

import { getOAuthProviderStatus, handleOAuthCallback, startOAuth } from '../functions/_shared/oauth.js';

const ownerEmail = 'owner-google-check@example.com';
const env = {
  SF_STUDIO_ADMIN_EMAIL: ownerEmail,
  SF_STUDIO_SESSION_SECRET: 'owner-google-check-secret',
  SF_GOOGLE_CLIENT_ID: 'google-client-id',
  SF_GOOGLE_CLIENT_SECRET: 'google-client-secret'
};

async function start(next = '/mv-studio') {
  const response = await startOAuth({ request: new Request(`https://sunofox.com/api/auth/oauth/start?provider=google&next=${encodeURIComponent(next)}`), env }, 'google');
  const location = new URL(response.headers.get('location'));
  return { response, state: location.searchParams.get('state'), cookie: response.headers.get('set-cookie').split(';', 1)[0] };
}

async function callback({ email, next = '/mv-studio', stateOverride = '' }) {
  const started = await start(next);
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    if (String(url).includes('oauth2.googleapis.com/token')) return Response.json({ access_token: 'google-access-token' });
    if (String(url).includes('openidconnect.googleapis.com/v1/userinfo')) return Response.json({ sub: 'google-id', email, name: 'Owner' });
    throw new Error(`Unexpected OAuth request: ${url}`);
  };
  try {
    return await handleOAuthCallback({
      request: new Request(`https://sunofox.com/api/auth/oauth/google/callback?code=oauth-code&state=${encodeURIComponent(stateOverride || started.state)}`, { headers: { cookie: started.cookie } }),
      env
    }, 'google');
  } finally {
    globalThis.fetch = originalFetch;
  }
}

const ownerResponse = await callback({ email: ownerEmail, next: '/privacy/' });
assert.equal(ownerResponse.status, 302);
assert.equal(ownerResponse.headers.get('location'), 'https://sunofox.com/mv-studio', 'owner Google login must always enter Studio');
assert.match(ownerResponse.headers.get('set-cookie') || '', /sf_studio_session=/, 'owner login must create a secure Studio session');
assert.match(ownerResponse.headers.get('set-cookie') || '', /HttpOnly/);
assert.match(ownerResponse.headers.get('set-cookie') || '', /SameSite=Lax/);
assert.match(ownerResponse.headers.get('set-cookie') || '', /Secure/);

const outsiderResponse = await callback({ email: 'outsider@example.com' });
assert.equal(outsiderResponse.status, 302);
assert.match(outsiderResponse.headers.get('location') || '', /oauth=owner-required/, 'non-owner Google login must explain owner-only access');
assert.doesNotMatch(outsiderResponse.headers.get('set-cookie') || '', /sf_studio_session=/, 'non-owner login must not create a session');

const tamperedStart = await start();
const tamperedResponse = await handleOAuthCallback({
  request: new Request('https://sunofox.com/api/auth/oauth/google/callback?code=oauth-code&state=tampered', { headers: { cookie: tamperedStart.cookie } }),
  env
}, 'google');
assert.match(tamperedResponse.headers.get('location') || '', /oauth=state-error/, 'tampered state must be rejected');
assert.doesNotMatch(tamperedResponse.headers.get('set-cookie') || '', /sf_studio_session=/);

const expiredStart = await start();
const realDateNow = Date.now;
Date.now = () => realDateNow() + (11 * 60 * 1000);
let expiredResponse;
try {
  expiredResponse = await handleOAuthCallback({
    request: new Request(`https://sunofox.com/api/auth/oauth/google/callback?code=oauth-code&state=${encodeURIComponent(expiredStart.state)}`, { headers: { cookie: expiredStart.cookie } }),
    env
  }, 'google');
} finally {
  Date.now = realDateNow;
}
assert.match(expiredResponse.headers.get('location') || '', /oauth=state-error/, 'expired state must be rejected');
assert.doesNotMatch(expiredResponse.headers.get('set-cookie') || '', /sf_studio_session=/);

const unsafeResponse = await callback({ email: ownerEmail, next: 'https://evil.example/steal' });
assert.equal(unsafeResponse.headers.get('location'), 'https://sunofox.com/mv-studio', 'external next must never be followed');

const unsupported = await startOAuth({ request: new Request('https://sunofox.com/api/auth/oauth/start?provider=kakao'), env }, 'kakao');
assert.match(unsupported.headers.get('location') || '', /oauth=unsupported/);
assert.deepEqual(Object.keys(getOAuthProviderStatus(env)), ['google'], 'OAuth status must expose Google only');

console.log('Owner Studio OAuth check passed: owner entry, non-owner denial, state integrity, secure cookies, and safe destination.');
