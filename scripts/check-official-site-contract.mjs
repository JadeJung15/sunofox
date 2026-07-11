import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const missing = async (path) => {
  try {
    await access(new URL(path, root), constants.F_OK);
    return false;
  } catch {
    return true;
  }
};

const [index, navigation, redirects, wrangler, login, authScript, packageJson] = await Promise.all([
  read('src/pages/index.astro'),
  read('src/data/navigationContent.js'),
  read('public/_redirects'),
  read('wrangler.jsonc'),
  read('public/login.html'),
  read('public/js/sfAuth.js'),
  read('package.json').then(JSON.parse)
]);

for (const id of ['novel', 'about', 'filmography', 'studio']) {
  assert.match(index, new RegExp(`id=["']${id}["']`), `home must expose #${id}`);
}

const expectedMenu = [
  ['novel', '소설', '/#novel'],
  ['about', '채널 소개', '/#about'],
  ['filmography', '필모그래피', '/#filmography'],
  ['studio', '스튜디오', '/login?next=/mv-studio']
];
for (const [key, label, href] of expectedMenu) {
  assert.match(navigation, new RegExp(`key:\\s*['"]${key}['"]`), `menu key ${key} must exist`);
  assert.match(navigation, new RegExp(`label:\\s*['"]${label}['"]`), `menu label ${label} must exist`);
  assert.ok(navigation.includes(`href: '${href}'`) || navigation.includes(`href: "${href}"`), `menu href ${href} must exist`);
}
assert.equal((navigation.match(/key:/g) || []).length, 6, 'navigation data must contain exactly four menu and two legal footer items');

const requiredTitles = [
  '유리 밤의 장미',
  'Mask of a Good Girl',
  'ARCHIVE vol.1',
  '악녀는 첫 장에서 웃었다',
  '웹소설 OST｜악녀는 첫 장에서 웃었다',
  '아직 데려가지 마'
];
for (const title of requiredTitles) assert.ok(index.includes(title), `home filmography must include ${title}`);
assert.match(index, /data-filmography-card=/, 'filmography cards need a stable test hook');
assert.equal((index.match(/data-filmography-card=/g) || []).length, 1, 'filmography should be rendered from one six-item collection');

for (const rule of [
  '/profile/ /#about 301',
  '/music/ /#filmography 301',
  '/music/archive-vol-1/ /#filmography 301',
  '/updates/ / 301',
  '/signup /login?next=/mv-studio 302',
  '/signup/* /login?next=/mv-studio 302',
  '/account /mv-studio 302',
  '/account/* /mv-studio 302',
  '/admin /mv-studio 302',
  '/admin/* /mv-studio 302'
]) assert.ok(redirects.includes(rule), `redirect rule missing: ${rule}`);

for (const path of [
  'src/pages/profile.astro',
  'src/pages/music/index.astro',
  'src/pages/music/archive-vol-1.astro',
  'src/pages/account.astro',
  'src/pages/admin.astro',
  'public/signup.html',
  'public/account.html',
  'public/admin.html',
  'functions/api/auth/login.js',
  'functions/api/auth/signup.js',
  'functions/api/auth/profile.js',
  'functions/api/admin/users.js',
  'functions/api/auth/oauth/kakao/callback.js',
  'functions/api/community/posts/index.js',
  'functions/api/community/comments/index.js',
  'functions/api/community/reactions/index.js',
  'functions/api/community/reports/index.js',
  'functions/api/posts/index.js',
  'functions/api/contact/index.js'
]) assert.equal(await missing(path), true, `${path} must be removed so production returns 404`);

assert.doesNotMatch(wrangler, /kv_namespaces|d1_databases|SF_STUDIO_AUTH|SF_COMMUNITY_DB/, 'active Wrangler config must not bind member KV or community D1');
assert.match(login, /등록된 제작자 계정만 입장할 수 있습니다/, 'login must explain the owner-only policy');
assert.match(login, /provider=google/, 'login must keep Google OAuth');
assert.doesNotMatch(login, /Kakao|password|회원가입|입장 코드/, 'login must not expose Kakao, password, signup, or entry-code flows');
assert.doesNotMatch(authScript, /api\/auth\/login|api\/auth\/signup|provider=kakao/, 'auth client must only support Google OAuth status and next forwarding');
assert.equal(packageJson.dependencies['@phosphor-icons/web'], '2.1.2', 'Phosphor web bold icons must be pinned');

console.log('Official site contract passed: single-page navigation, six works, redirects, owner-only auth, and retired routes.');
