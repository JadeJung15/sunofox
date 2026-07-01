import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const siteContentPath = path.join(rootDir, 'src', 'data', 'siteContent.js');
const errors = [];

const expectedMenuItems = [
  { key: 'home', label: '홈', href: '/' },
  { key: 'profile', label: '소개', href: '/profile' },
  { key: 'novels', label: '소설 보러가기', href: '/novels/' },
  { key: 'music', label: '음악', href: '/music/' },
  { key: 'updates', label: '업데이트', href: '/updates/' },
  { key: 'studio', label: '제작실 로그인', href: '/login?next=/mv-studio' }
];

const expectedFooterItems = [
  { key: 'novels', label: '소설', href: '/novels/' },
  { key: 'music', label: '음악', href: '/music/' },
  { key: 'profile', label: '소개', href: '/profile/' },
  { key: 'updates', label: '업데이트', href: '/updates/' },
  { key: 'privacy', label: '개인정보', href: '/privacy/' },
  { key: 'terms', label: '이용약관', href: '/terms/' }
];

function fail(message) {
  errors.push(message);
}

function assertEqual(label, actual, expected) {
  if (actual !== expected) {
    fail(`${label}: expected "${expected}", got "${actual || '(empty)'}"`);
  }
}

function assertUnique(label, values) {
  const seen = new Set();

  values.forEach((value) => {
    if (!value) return;
    if (seen.has(value)) fail(`${label}: duplicate value "${value}"`);
    seen.add(value);
  });
}

function assertSiteRoute(label, href) {
  if (!href || !href.startsWith('/')) {
    fail(`${label}: href must be an internal route`);
    return;
  }

  if (href.includes('.html')) {
    fail(`${label}: href must use canonical route, not .html`);
  }
}

const siteContentModule = await import(`${pathToFileURL(siteContentPath).href}?mtime=${Date.now()}`);
const { footerItems, menuItems } = siteContentModule;

if (!Array.isArray(menuItems)) {
  fail('menuItems must be an array');
} else {
  assertEqual('menuItems length', String(menuItems.length), String(expectedMenuItems.length));
  assertUnique('menuItems key', menuItems.map((item) => item.key));
  assertUnique('menuItems href', menuItems.map((item) => item.href));

  expectedMenuItems.forEach((expected, index) => {
    const item = menuItems[index];
    const label = `menuItems[${index}]`;

    if (!item) {
      fail(`${label}: missing ${expected.key}`);
      return;
    }

    assertEqual(`${label} key`, item.key, expected.key);
    assertEqual(`${label} label`, item.label, expected.label);
    assertEqual(`${label} href`, item.href, expected.href);
    assertSiteRoute(`${label} href`, item.href);

    if (/[A-Z]{3,}/.test(item.label)) {
      fail(`${label} label: public action label should be Korean-first`);
    }
  });

  const updatesItem = menuItems.find((item) => item.key === 'updates');
  if (updatesItem?.secondary !== true) {
    fail('menuItems updates: must remain secondary to keep the overlay hierarchy compact');
  }

  const studioItem = menuItems.find((item) => item.key === 'studio');
  if (studioItem?.secondary !== true) {
    fail('menuItems studio: must remain secondary because it is a private tool entry');
  }

  if (studioItem?.href?.startsWith('/login') !== true) {
    fail('menuItems studio: must enter through the login route, not direct public Studio content');
  }
}

if (!Array.isArray(footerItems)) {
  fail('footerItems must be an array');
} else {
  assertEqual('footerItems length', String(footerItems.length), String(expectedFooterItems.length));
  assertUnique('footerItems key', footerItems.map((item) => item.key));
  assertUnique('footerItems href', footerItems.map((item) => item.href));

  expectedFooterItems.forEach((expected, index) => {
    const item = footerItems[index];
    const label = `footerItems[${index}]`;

    if (!item) {
      fail(`${label}: missing ${expected.key}`);
      return;
    }

    assertEqual(`${label} key`, item.key, expected.key);
    assertEqual(`${label} label`, item.label, expected.label);
    assertEqual(`${label} href`, item.href, expected.href);
    assertSiteRoute(`${label} href`, item.href);
  });
}

if (errors.length > 0) {
  console.error('Navigation content check failed:');
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`Navigation content check passed: ${menuItems.length} menu items, ${footerItems.length} footer items.`);
