import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { handleOAuthCallback, startOAuth } from '../functions/_shared/oauth.js';

const ownerEmail = 'owner-google-check@example.com';
const env = {
  SF_STUDIO_ADMIN_EMAIL: ownerEmail,
  SF_STUDIO_SESSION_SECRET: 'owner-google-check-secret',
  SF_GOOGLE_CLIENT_ID: 'google-client-id',
  SF_GOOGLE_CLIENT_SECRET: 'google-client-secret'
};

const startResponse = await startOAuth({
  request: new Request('https://sunofox.com/api/auth/oauth/start?provider=google&next=%2Fmv-studio'),
  env
}, 'google');
assert.equal(startResponse.status, 302, 'Google OAuth should start with a redirect');

const googleLocation = new URL(startResponse.headers.get('location'));
const state = googleLocation.searchParams.get('state');
const stateCookie = startResponse.headers.get('set-cookie');
assert.ok(state, 'Google OAuth should send a state value');
assert.match(stateCookie || '', /sf_oauth_state=/, 'Google OAuth should store signed state');

const originalFetch = globalThis.fetch;
globalThis.fetch = async (url) => {
  if (String(url).includes('oauth2.googleapis.com/token')) {
    return Response.json({ access_token: 'google-access-token' });
  }
  if (String(url).includes('openidconnect.googleapis.com/v1/userinfo')) {
    return Response.json({
      sub: 'google-owner-id',
      email: ownerEmail,
      name: 'Owner',
      given_name: 'Owner'
    });
  }
  throw new Error(`Unexpected OAuth request: ${url}`);
};

let callbackResponse;
try {
  callbackResponse = await handleOAuthCallback({
    request: new Request(`https://sunofox.com/api/auth/oauth/google/callback?code=oauth-code&state=${encodeURIComponent(state)}`, {
      headers: { cookie: stateCookie.split(';', 1)[0] }
    }),
    env
  }, 'google');
} finally {
  globalThis.fetch = originalFetch;
}

assert.equal(callbackResponse.status, 302, 'Google OAuth callback should redirect');
assert.equal(
  callbackResponse.headers.get('location'),
  'https://sunofox.com/mv-studio',
  'owner Google login should restore the requested Studio destination'
);
assert.match(
  callbackResponse.headers.get('set-cookie') || '',
  /sf_studio_session=/,
  'owner Google login should create a Studio session'
);

const authScript = await readFile(new URL('../public/js/sfAuth.js', import.meta.url), 'utf8');
assert.match(
  authScript,
  /searchParams\.set\(['"]next['"],\s*getNext\(\)\)/,
  'login OAuth buttons should forward the current next destination'
);

console.log('Owner Studio OAuth check passed: login button destination and Google callback redirect.');
