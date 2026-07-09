import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const cssPath = path.join(rootDir, 'src', 'styles', 'global.css');
const css = await readFile(cssPath, 'utf8');
const errors = [];

function fail(message) {
  errors.push(message);
}

function findBlockStart(selector, fromIndex = 0) {
  const selectorIndex = css.indexOf(selector, fromIndex);
  if (selectorIndex === -1) return null;

  const braceIndex = css.indexOf('{', selectorIndex);
  if (braceIndex === -1) return null;

  return { selectorIndex, braceIndex };
}

function blocksFor(selector, { after = 0 } = {}) {
  const blocks = [];
  let searchIndex = after;

  while (searchIndex < css.length) {
    const start = findBlockStart(selector, searchIndex);
    if (!start) break;

    let depth = 0;
    for (let index = start.braceIndex; index < css.length; index += 1) {
      const char = css[index];
      if (char === '{') depth += 1;
      if (char === '}') depth -= 1;
      if (depth === 0) {
        blocks.push(css.slice(start.braceIndex + 1, index).trim());
        searchIndex = index + 1;
        break;
      }
    }
  }

  return blocks;
}

function assertBlockIncludes(selector, expected, options = {}) {
  const blocks = blocksFor(selector, options);
  if (blocks.length === 0) {
    fail(`${selector}: missing CSS block`);
    return;
  }

  const hasMatchingBlock = blocks.some((block) => expected.every((needle) => block.includes(needle)));
  if (!hasMatchingBlock) {
    fail(`${selector}: expected one CSS block to include ${expected.map((needle) => `"${needle}"`).join(', ')}`);
  }
}

function assertBlockExcludes(selector, forbidden, options = {}) {
  const blocks = blocksFor(selector, options);
  if (blocks.length === 0) {
    fail(`${selector}: missing CSS block`);
    return;
  }

  const offenders = blocks.filter((block) => forbidden.some((needle) => block.includes(needle)));
  if (offenders.length > 0) {
    fail(`${selector}: expected CSS blocks to exclude ${forbidden.map((needle) => `"${needle}"`).join(', ')}`);
  }
}

function assertContains(label, needle) {
  if (!css.includes(needle)) {
    fail(`${label}: expected CSS to include "${needle}"`);
  }
}

const mobileMediaIndex = css.indexOf('@media (max-width: 640px)');
if (mobileMediaIndex === -1) {
  fail('mobile media query @media (max-width: 640px): missing');
}

const musicMobileMediaIndex = css.indexOf('@media (max-width: 760px)');
if (musicMobileMediaIndex === -1) {
  fail('music mobile media query @media (max-width: 760px): missing');
}

assertBlockIncludes('.menu-trigger', ['min-width: 44px;', 'min-height: 44px;']);
assertBlockIncludes('.main-button', ['min-height: 46px;']);
assertBlockIncludes('.micro-button', ['min-height: 44px;']);
assertBlockIncludes('.novel-reader-topbar a', ['min-width: 44px;', 'min-height: 44px;']);
assertBlockIncludes('.album-back-link', ['display: inline-flex;', 'min-height: 44px;']);
assertBlockIncludes('body:has(.anime-home) .site-header', ['width: 100%;', 'max-width: 100%;']);
assertBlockExcludes('body:has(.anime-home) .site-header', ['100vw']);
assertBlockIncludes(
  'body:has(.anime-home):has(.music-archive-page) .music-video-grid img',
  ['aspect-ratio: 16 / 9;', 'object-fit: cover;']
);
assertBlockIncludes(
  'body:has(.anime-home):has(.music-archive-page) .music-release-copy ol',
  ['display: none;']
);

if (mobileMediaIndex !== -1) {
  assertBlockIncludes('.main-button', ['min-height: 44px;'], { after: mobileMediaIndex });
  assertBlockIncludes('.hero-side-actions', ['grid-template-columns: repeat(2, minmax(0, 1fr));', 'width: calc(100% - 32px);'], { after: mobileMediaIndex });
  assertBlockIncludes('.hero-side-actions .main-button', ['width: 100%;', 'min-width: 0;'], { after: mobileMediaIndex });
  assertBlockIncludes('.novel-detail-tabs', ['grid-template-columns: repeat(3, minmax(0, 1fr));', 'overflow-x: visible;'], { after: mobileMediaIndex });
  assertBlockIncludes('.novel-list-actions', ['grid-template-columns: repeat(2, minmax(0, 1fr));', 'grid-auto-rows: minmax(44px, auto);'], { after: mobileMediaIndex });
  assertBlockIncludes('.novel-list-actions .micro-button', ['width: 100%;', 'min-width: 0;', 'margin-top: 0;'], { after: mobileMediaIndex });
  assertBlockIncludes('.novel-list-summary', ['grid-template-columns: repeat(2, minmax(0, 1fr));', 'gap: 8px;', 'border-bottom: 0;'], { after: mobileMediaIndex });
  assertBlockIncludes('.novel-list-summary div', ['border: 1px solid rgba(255, 255, 255, 0.09);', 'padding: 12px;'], { after: mobileMediaIndex });
  assertBlockIncludes('.novel-episode-row > span', ['width: 42px;', 'min-height: 42px;', 'justify-content: center;'], { after: mobileMediaIndex });
  assertBlockIncludes('.novel-anchor-strip', ['grid-template-columns: 1fr;'], { after: mobileMediaIndex });
  assertBlockIncludes('.novel-anchor-strip a', ['min-height: 44px;', 'text-align: center;'], { after: mobileMediaIndex });
  assertBlockIncludes('.novel-reader-ost-actions', ['grid-template-columns: 1fr;'], { after: mobileMediaIndex });
  assertBlockIncludes('.novel-reader-ost-actions .main-button', ['width: 100%;'], { after: mobileMediaIndex });
  assertBlockIncludes('.novel-reader-actions .main-button', ['overflow-wrap: anywhere;'], { after: mobileMediaIndex });
  assertBlockIncludes('.profile-current-actions', ['grid-template-columns: repeat(2, minmax(0, 1fr));'], { after: mobileMediaIndex });
  assertBlockIncludes('.profile-current-actions .micro-button', ['min-width: 0;'], { after: mobileMediaIndex });
  assertBlockIncludes('.music-archive-actions', ['grid-template-columns: repeat(2, minmax(0, 1fr));'], { after: mobileMediaIndex });
  assertBlockIncludes('.music-archive-actions .main-button', ['width: 100%;', 'min-width: 0;'], { after: mobileMediaIndex });
}

if (musicMobileMediaIndex !== -1) {
  assertBlockIncludes(
    'body:has(.anime-home):has(.music-archive-page) .music-video-direct-actions',
    ['display: flex;', 'flex-wrap: nowrap;', 'overflow-x: auto;', 'scrollbar-width: none;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.music-archive-page) .music-video-direct-actions .main-button',
    ['flex: 0 0 auto;', 'width: auto;', 'min-height: 44px;', 'white-space: nowrap;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.album-detail-page) .album-platform-links',
    ['grid-template-columns: repeat(2, minmax(0, 1fr));', 'gap: 8px;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.album-detail-page) .album-platform-links .music-platform-link',
    ['width: auto;', 'min-width: 0;', 'min-height: 42px;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.album-detail-page) .album-track-grid li',
    ['grid-template-columns: 34px minmax(0, 1fr);', 'min-height: 64px;'],
    { after: musicMobileMediaIndex }
  );
}

assertContains('body horizontal overflow guard', 'overflow-x: hidden;');
assertContains('episode title wrapping', '.novel-episode-row strong');
assertContains('reader title wrapping', '.novel-reader-header h1');
assertContains('music title wrapping', '.music-video-grid strong');
assertContains('footer mobile wrapping', '.site-footer-nav');
assertContains('novel anchor scroll offset', 'scroll-margin-top: 96px;');

if (errors.length > 0) {
  console.error('Mobile CSS check failed:');
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log('Mobile CSS check passed: responsive touch, auxiliary link, and wrapping rules are present.');
