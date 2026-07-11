import assert from 'node:assert/strict';

import { onRequestPost } from '../functions/api/auth/login.js';
import { hashPassword, saveUser } from '../functions/_shared/auth.js';

const ownerEmail = 'owner-studio-check@example.com';
const memberEmail = 'member-studio-check@example.com';
const memberPassword = 'member-pass-2026';
const env = {
  SF_STUDIO_ADMIN_EMAIL: ownerEmail,
  SF_STUDIO_LOGIN_CODE: 'owner-check-code',
  SF_STUDIO_SESSION_SECRET: 'owner-studio-check-secret'
};

async function login(body) {
  return onRequestPost({
    request: new Request('https://sunofox.com/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    }),
    env
  });
}

await saveUser(env, {
  email: memberEmail,
  name: 'Member',
  nickname: 'Member',
  provider: 'email',
  providers: ['email'],
  status: 'approved',
  password: await hashPassword(memberPassword),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

const ownerResponse = await login({
  email: ownerEmail,
  code: env.SF_STUDIO_LOGIN_CODE,
  next: '/mv-studio'
});
const ownerData = await ownerResponse.json();
assert.equal(ownerResponse.status, 200, 'owner login should succeed');
assert.equal(ownerData.next, '/mv-studio', 'owner login should preserve the studio destination');
assert.match(ownerResponse.headers.get('set-cookie') || '', /sf_studio_session=/, 'owner login should create a session');

const memberResponse = await login({
  email: memberEmail,
  password: memberPassword,
  next: '/mv-studio'
});
const memberData = await memberResponse.json();
assert.equal(memberResponse.status, 403, 'member login must not enter the owner studio');
assert.equal(memberData.status, 'owner-required', 'member rejection should expose the owner-required status');
assert.match(memberData.message, /제작자 전용/, 'member rejection should explain the creator-only requirement');

const memberAccountResponse = await login({
  email: memberEmail,
  password: memberPassword,
  next: '/account'
});
const memberAccountData = await memberAccountResponse.json();
assert.equal(memberAccountResponse.status, 200, 'member login to a normal account route should still succeed');
assert.equal(memberAccountData.next, '/account', 'member account destination should remain unchanged');

const safeRedirectResponse = await login({
  email: ownerEmail,
  code: env.SF_STUDIO_LOGIN_CODE,
  next: 'https://example.com/steal-session'
});
const safeRedirectData = await safeRedirectResponse.json();
assert.equal(safeRedirectResponse.status, 200, 'owner login with an unsafe destination should still authenticate');
assert.equal(safeRedirectData.next, '/', 'unsafe destinations should fall back to the home route');

console.log('Owner studio login check passed: owner redirect, member rejection, normal member login, safe redirect.');
