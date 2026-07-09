import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const cssPath = path.join(rootDir, 'src', 'styles', 'global.css');
const authCssPath = path.join(rootDir, 'public', 'css', 'sf-auth.css');
const mvCssPath = path.join(rootDir, 'public', 'css', 'mv-storyboard.css');
const css = await readFile(cssPath, 'utf8');
const authCss = await readFile(authCssPath, 'utf8');
const mvCss = await readFile(mvCssPath, 'utf8');
const errors = [];

function fail(message) {
  errors.push(message);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findSelectorMatchIn(source, selector, fromIndex = 0) {
  const selectorPattern = selector.trim().split(/\s+/).map(escapeRegExp).join('\\s+');
  const selectorRegex = new RegExp(selectorPattern, 'g');
  selectorRegex.lastIndex = fromIndex;

  let match = selectorRegex.exec(source);
  while (match) {
    const nextChar = source[match.index + match[0].length] ?? '';
    if (nextChar === '{' || nextChar === ',' || /\s/.test(nextChar)) {
      return match;
    }

    match = selectorRegex.exec(source);
  }

  return null;
}

function findBlockStartIn(source, selector, fromIndex = 0) {
  const selectorMatch = findSelectorMatchIn(source, selector, fromIndex);
  if (!selectorMatch) return null;

  const selectorIndex = selectorMatch.index;
  const braceIndex = source.indexOf('{', selectorIndex + selectorMatch[0].length);
  if (braceIndex === -1) return null;

  return { selectorIndex, braceIndex };
}

function findBlockStart(selector, fromIndex = 0) {
  return findBlockStartIn(css, selector, fromIndex);
}

function blocksForIn(source, selector, { after = 0 } = {}) {
  const blocks = [];
  let searchIndex = after;

  while (searchIndex < source.length) {
    const start = findBlockStartIn(source, selector, searchIndex);
    if (!start) break;

    let depth = 0;
    for (let index = start.braceIndex; index < source.length; index += 1) {
      const char = source[index];
      if (char === '{') depth += 1;
      if (char === '}') depth -= 1;
      if (depth === 0) {
        blocks.push(source.slice(start.braceIndex + 1, index).trim());
        searchIndex = index + 1;
        break;
      }
    }

    if (searchIndex <= start.braceIndex) break;
  }

  return blocks;
}

function blocksFor(selector, { after = 0 } = {}) {
  return blocksForIn(css, selector, { after });
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

function assertAuthContains(label, needle) {
  if (!authCss.includes(needle)) {
    fail(`${label}: expected auth CSS to include "${needle}"`);
  }
}

function assertAuthBlockIncludes(selector, expected, options = {}) {
  const blocks = blocksForIn(authCss, selector, options);
  if (blocks.length === 0) {
    fail(`${selector}: missing auth CSS block`);
    return;
  }

  const hasMatchingBlock = blocks.some((block) => expected.every((needle) => block.includes(needle)));
  if (!hasMatchingBlock) {
    fail(`${selector}: expected one auth CSS block to include ${expected.map((needle) => `"${needle}"`).join(', ')}`);
  }
}

function assertMvBlockIncludes(selector, expected, options = {}) {
  const blocks = blocksForIn(mvCss, selector, options);
  if (blocks.length === 0) {
    fail(`${selector}: missing MV Studio CSS block`);
    return;
  }

  const hasMatchingBlock = blocks.some((block) => expected.every((needle) => block.includes(needle)));
  if (!hasMatchingBlock) {
    fail(`${selector}: expected one MV Studio CSS block to include ${expected.map((needle) => `"${needle}"`).join(', ')}`);
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

const authAnimeIndex = authCss.indexOf('Final anime auth alignment');
const authMobileMediaIndex = authAnimeIndex === -1 ? -1 : authCss.indexOf('@media (max-width: 640px)', authAnimeIndex);
const authCompactMobileIndex = authCss.indexOf('Final compact auth mobile pass');
const authNarrowMobileIndex = authCompactMobileIndex === -1 ? -1 : authCss.indexOf('@media (max-width: 400px)', authCompactMobileIndex);
const authFocusMobileIndex = authCss.indexOf('mobile auth focus pass');
if (authMobileMediaIndex === -1) {
  fail('auth mobile media query after final anime pass: missing');
}
if (authCompactMobileIndex === -1) {
  fail('auth compact mobile pass: missing');
}
if (authNarrowMobileIndex === -1) {
  fail('auth narrow mobile media query after final compact pass: missing');
}
if (authFocusMobileIndex === -1) {
  fail('auth mobile focus pass: missing');
}

const authAdminIndex = authCss.indexOf('Final admin console readability pass');
const authAdminMobileIndex = authAdminIndex === -1 ? -1 : authCss.indexOf('@media (max-width: 720px)', authAdminIndex);
if (authAdminIndex === -1) {
  fail('admin console readability pass: missing');
}
if (authAdminMobileIndex === -1) {
  fail('admin mobile media query after readability pass: missing');
}
const mvMobileMediaIndex = mvCss.indexOf('@media (max-width: 760px)');
if (mvMobileMediaIndex === -1) {
  fail('MV Studio mobile media query @media (max-width: 760px): missing');
}

assertBlockIncludes('.menu-trigger', ['min-width: 44px;', 'min-height: 44px;']);
assertBlockIncludes('.main-button', ['min-height: 46px;']);
assertBlockIncludes('.micro-button', ['min-height: 44px;']);
assertBlockIncludes('.novel-reader-topbar a', ['min-width: 44px;', 'min-height: 44px;']);
assertBlockIncludes('.album-back-link', ['display: inline-flex;', 'min-height: 44px;']);
assertBlockIncludes('.legal-page .profile-copy h2', ['font-size: clamp(1rem, 2.1vw, 1.3rem);', 'text-transform: none;']);
assertBlockIncludes('.legal-page .profile-copy a', ['display: inline;', 'min-height: 0;']);
assertBlockIncludes('body:has(.legal-page)', ['--sf-paper: #050509;', 'background: #050509;', 'color: #fff7fb;']);
assertBlockIncludes('body:has(.legal-page) .site-main.legal-page', ['linear-gradient(180deg, #050509 0%, #090a10 54%, #050509 100%);']);
assertBlockIncludes('body:has(.legal-page) .profile-copy', ['border-color: rgba(255, 247, 251, 0.16);', 'rgba(5, 5, 9, 0.64);']);
assertBlockIncludes('body:has(.legal-page) .site-footer', ['background: #050509;']);
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
assertBlockIncludes(
  'body:has(.anime-home):has(.music-archive-page) .music-release-cover',
  ['width: min(64vw, 220px);', 'justify-self: center;']
);
assertBlockIncludes(
  'body:has(.anime-home):has(.music-archive-page) .music-release-platforms',
  ['grid-template-columns: repeat(2, minmax(0, 1fr));', 'margin-top: 14px;']
);
assertBlockIncludes(
  'body:has(.anime-home):has(.music-archive-page) .music-release-platforms .music-platform-link',
  ['min-height: 44px;', 'font-size: 0.76rem;']
);
assertBlockIncludes(
  'body:has(.anime-home):has(.novel-episode-page) .novel-reader-body p',
  ['color: rgba(255, 247, 251, 0.86);', 'line-height: 2.05;']
);
assertBlockIncludes(
  '.novel-reader-header h1',
  ['overflow-wrap: anywhere;', 'word-break: keep-all;']
);
assertBlockIncludes(
  '.novel-reader-ost-thumb img',
  ['aspect-ratio: 16 / 9;', 'object-fit: cover;']
);
assertBlockIncludes(
  'body:has(.anime-home):has(.not-found-page) .not-found-page',
  ['background:', 'linear-gradient(180deg, #050509 0%, #090a10 54%, #050509 100%);']
);
assertBlockIncludes(
  'body:has(.anime-home):has(.not-found-page) .not-found-actions .main-button',
  ['min-height: 48px;', 'border-radius: 8px;']
);
assertBlockIncludes(
  'body:has(.anime-home):has(.not-found-page) .not-found-secondary-links a',
  ['min-height: 44px;']
);
assertBlockIncludes(
  'body:has(.anime-home):has(.not-found-page) .not-found-hero h1',
  ['font-size: clamp(3.1rem, 8vw, 6.4rem);']
);
assertBlockIncludes(
  'body:has(.anime-home):has(.album-detail-page) .album-back-link',
  ['min-height: 44px;', 'border-radius: 999px;', 'padding-inline: 13px;']
);
assertBlockIncludes(
  'body:has(.anime-home):has(.profile-page) .category-hero p:last-child',
  ['overflow-wrap: break-word;', 'word-break: keep-all;']
);
assertBlockIncludes(
  'body:has(.anime-home):has(.novel-list-page) .novel-detail-summary',
  ['overflow-wrap: break-word;', 'word-break: keep-all;']
);
assertBlockIncludes(
  'body:has(.anime-home):has(.novel-list-page) .novel-episode-row strong',
  ['overflow-wrap: break-word;', 'word-break: keep-all;']
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
  assertBlockIncludes('.legal-page .profile-copy a', ['display: inline-flex;', 'min-height: 44px;', 'vertical-align: middle;'], { after: mobileMediaIndex });
  assertBlockIncludes('.novel-reader-ost-actions', ['grid-template-columns: 1fr;'], { after: mobileMediaIndex });
  assertBlockIncludes('.novel-reader-ost-actions .main-button', ['width: 100%;'], { after: mobileMediaIndex });
  assertBlockIncludes(
    'body:has(.anime-home):has(.novel-episode-page) .novel-reader-ost',
    ['grid-template-columns: 92px minmax(0, 1fr);', 'gap: 12px;', 'padding: 18px 0;'],
    { after: mobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.novel-episode-page) .novel-reader-index-links',
    ['grid-template-columns: repeat(2, minmax(0, 1fr));', 'gap: 8px;'],
    { after: mobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.novel-episode-page) .novel-reader-ost-actions',
    ['grid-column: 1 / -1;'],
    { after: mobileMediaIndex }
  );
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
    'body:has(.anime-home):has(.music-archive-page) .music-video-hub',
    ['display: grid;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.music-archive-page) .music-video-grid',
    ['grid-template-columns: 1fr;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.music-archive-page) .music-video-grid a',
    ['grid-template-columns: 1fr;', 'min-height: 0;', 'gap: 8px;', 'padding: 10px;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.music-archive-page) .music-video-grid img',
    ['grid-row: auto;', 'aspect-ratio: 16 / 9;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.music-archive-page) .music-release-card',
    ['gap: 12px;', 'padding: 12px;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.music-archive-page) .music-release-copy h3',
    ['font-size: clamp(1.8rem, 9vw, 2.6rem);'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.music-archive-page) .music-release-copy > strong',
    ['margin-top: 10px;', 'font-size: 0.88rem;', 'line-height: 1.5;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.music-archive-page) .music-release-copy dl',
    ['margin-top: 12px;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.album-detail-page) .album-cover-mark img',
    ['max-width: min(78vw, 280px);'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.album-detail-page) .album-back-link',
    ['border-radius: 999px;', 'padding-inline: 12px;', 'font-size: 0.72rem;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.album-detail-page) .album-cover-mark',
    ['justify-items: center;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.album-detail-page) .album-meta-grid',
    ['grid-template-columns: repeat(2, minmax(0, 1fr));', 'margin-top: 18px;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.album-detail-page) .album-meta-grid dd',
    ['overflow-wrap: break-word;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.album-detail-page) .album-platform-links',
    ['grid-template-columns: repeat(2, minmax(0, 1fr));', 'gap: 8px;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.album-detail-page) .album-platform-links .music-platform-link',
    ['width: 100%;', 'min-width: 0;', 'min-height: 44px;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.album-detail-page) .album-platform-links .music-platform-link:last-child:nth-child(odd)',
    ['grid-column: 1 / -1;', 'justify-content: center;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.album-detail-page) .album-track-grid',
    ['grid-template-columns: repeat(2, minmax(0, 1fr));', 'gap: 8px;', 'margin-top: 16px;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.album-detail-page) .album-track-grid li',
    ['grid-template-columns: 24px minmax(0, 1fr);', 'min-height: 58px;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.album-detail-page) .album-track-grid li:last-child:nth-child(odd)',
    ['grid-column: 1 / -1;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.album-detail-page) .album-track-grid strong',
    ['overflow-wrap: anywhere;', 'font-size: 0.86rem;', 'line-height: 1.22;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.album-detail-page) .album-track-grid em',
    ['display: none;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.profile-page) .profile-current-actions',
    ['display: flex;', 'flex-wrap: nowrap;', 'overflow-x: auto;', 'scrollbar-width: none;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.profile-page) .category-hero',
    ['min-height: 32svh;', 'padding: 28px 0 22px;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.profile-page) .about-route-grid a',
    ['grid-template-columns: 42px minmax(0, 1fr);', 'min-height: 86px;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.profile-page) .about-route-grid p',
    ['-webkit-line-clamp: 2;', 'font-size: 0.82rem;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.profile-page) .about-line-list',
    ['display: none;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.profile-page) .profile-snapshot-card p',
    ['-webkit-line-clamp: 2;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.profile-page) .profile-video-list a',
    ['gap: 8px;', 'padding: 10px;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.profile-page) .profile-video-thumb',
    ['aspect-ratio: 16 / 9;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.profile-page) .profile-video-list strong',
    ['-webkit-line-clamp: 2;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.profile-page) .profile-video-list p',
    ['-webkit-line-clamp: 2;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.profile-page) .profile-detail-tabs',
    ['display: flex;', 'flex-wrap: nowrap;', 'overflow-x: auto;', 'scrollbar-width: none;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.profile-page) .profile-track-list',
    ['display: grid;', 'grid-template-columns: repeat(2, minmax(0, 1fr));', 'counter-reset: profile-track;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.profile-page) .profile-track-list li',
    ['grid-template-columns: 2ch minmax(0, 1fr);', 'min-height: 42px;', 'overflow-wrap: anywhere;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.profile-page) .profile-track-list li::before',
    ['content: counter(profile-track, decimal-leading-zero);', 'color: var(--anime-accent);'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.profile-page) .profile-source-actions',
    ['display: grid;', 'grid-template-columns: repeat(2, minmax(0, 1fr));', 'gap: 8px;', 'padding-bottom: 0;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.profile-page) .profile-source-actions .main-button',
    ['width: 100%;', 'min-width: 0;', 'min-height: 44px;', 'white-space: normal;', 'overflow-wrap: anywhere;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.profile-page) .profile-source-actions .main-button:last-child:nth-child(odd)',
    ['grid-column: 1 / -1;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.novel-list-page) .novel-detail-tabs',
    ['display: flex;', 'flex-wrap: nowrap;', 'overflow-x: auto;', 'scrollbar-width: none;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.novel-list-page) .novel-info-list',
    ['grid-template-columns: repeat(2, minmax(0, 1fr));', 'margin-top: 18px;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.novel-list-page) .novel-platform-actions',
    ['grid-template-columns: repeat(2, minmax(0, 1fr));', 'margin-top: 18px;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.novel-list-page) .novel-platform-actions .main-button:first-child',
    ['grid-column: 1 / -1;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.novel-list-page) .novel-list-actions',
    ['display: flex;', 'flex-wrap: nowrap;', 'overflow-x: auto;', 'scrollbar-width: none;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.novel-list-page) .novel-season-facts',
    ['grid-template-columns: repeat(3, minmax(0, 1fr));', 'padding: 12px 0 0;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.novel-list-page) .novel-reading-grid',
    ['display: flex;', 'overflow-x: auto;', 'scrollbar-width: none;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.novel-list-page) .novel-reading-card',
    ['flex: 0 0 min(82vw, 320px);', 'min-height: 128px;', 'scroll-snap-align: start;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.novel-list-page) .novel-episode-tags',
    ['display: none;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.novel-list-page) .novel-anchor-strip',
    ['display: flex;', 'flex-wrap: nowrap;', 'overflow-x: auto;', 'scrollbar-width: none;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.novel-episode-page) .novel-reader-topbar',
    ['overflow-x: auto;', 'scrollbar-width: none;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.novel-episode-page) .novel-reader-back',
    ['width: fit-content;', 'min-width: 96px;', 'margin-bottom: 16px;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.novel-episode-page) .novel-reader-quicklinks',
    ['display: flex;', 'flex-wrap: nowrap;', 'overflow-x: auto;', 'scrollbar-width: none;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.novel-episode-page) .novel-reader-jumpbar',
    ['display: flex;', 'flex-wrap: nowrap;', 'overflow-x: auto;', 'scrollbar-width: none;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.novel-episode-page) .novel-reader-body',
    ['max-width: 100%;', 'padding: 24px 0 12px;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.novel-episode-page) .novel-reader-actions',
    ['grid-template-columns: repeat(2, minmax(0, 1fr));', 'padding-top: 22px;', 'margin-top: 24px;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.novel-episode-page) .novel-reader-index-links',
    ['grid-template-columns: repeat(2, minmax(0, 1fr));', 'gap: 8px;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.novel-episode-page) .novel-reader-index-links strong',
    ['-webkit-line-clamp: 2;', 'font-size: 0.84rem;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.novel-episode-page) .novel-reader-ost',
    ['grid-template-columns: 92px minmax(0, 1fr);', 'gap: 12px;', 'padding: 18px 0;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.novel-episode-page) .novel-reader-ost-thumb span',
    ['display: none;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.novel-episode-page) .novel-reader-ost-actions',
    ['grid-column: 1 / -1;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.novel-episode-page) .novel-reader-completion-actions',
    ['grid-template-columns: repeat(2, minmax(0, 1fr));', 'gap: 8px;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.novel-episode-page) .novel-reader-ost-actions .main-button:first-child',
    ['grid-column: 1 / -1;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.novel-episode-page) .novel-reader-completion-actions .main-button:first-child',
    ['grid-column: 1 / -1;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.not-found-page) .not-found-page',
    ['padding: 86px 14px 46px;'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.not-found-page) .not-found-hero h1',
    ['font-size: clamp(2.45rem, 11vw, 3.25rem);'],
    { after: musicMobileMediaIndex }
  );
  assertBlockIncludes(
    'body:has(.anime-home):has(.not-found-page) .not-found-panel h2',
    ['font-size: clamp(1.7rem, 8.2vw, 2.2rem);'],
    { after: musicMobileMediaIndex }
  );
}

assertContains('body horizontal overflow guard', 'overflow-x: hidden;');
assertContains('episode title wrapping', '.novel-episode-row strong');
assertContains('reader title wrapping', '.novel-reader-header h1');
assertContains('music title wrapping', '.music-video-grid strong');
assertContains('footer mobile wrapping', '.site-footer-nav');
assertContains('novel anchor scroll offset', 'scroll-margin-top: 96px;');
assertAuthContains('auth anime pass', 'Final anime auth alignment');
assertAuthContains('auth compact mobile pass', 'Final compact auth mobile pass');
assertAuthContains('auth mobile focus pass', 'mobile auth focus pass');
assertAuthContains('auth dark color scheme', 'color-scheme: dark;');
assertAuthContains('auth mobile route scroll', 'scrollbar-width: none;');
assertAuthBlockIncludes(
  '.sf-auth-login:not(.sf-admin-body) .sf-auth-copy > p',
  ['-webkit-line-clamp: 1;', 'overflow-wrap: break-word;', 'word-break: keep-all;'],
  { after: authFocusMobileIndex }
);
assertAuthBlockIncludes(
  '.sf-auth-signup:not(.sf-admin-body) .sf-auth-copy > p',
  ['display: -webkit-box;', '-webkit-line-clamp: 1;', 'overflow-wrap: break-word;', 'word-break: keep-all;'],
  { after: authFocusMobileIndex }
);
assertAuthBlockIncludes(
  '.sf-auth-account:not(.sf-admin-body) .sf-auth-copy > p',
  ['display: -webkit-box;', '-webkit-line-clamp: 1;', 'overflow-wrap: break-word;', 'word-break: keep-all;'],
  { after: authFocusMobileIndex }
);
assertAuthBlockIncludes(
  '.sf-auth-body:not(.sf-admin-body) .sf-auth-stage .sf-auth-brand',
  ['min-height: 44px;'],
  { after: authCompactMobileIndex }
);
assertAuthBlockIncludes(
  '.sf-auth-body:not(.sf-admin-body) .sf-auth-stage',
  ['border: 0;', 'background: transparent;', 'box-shadow: none;', 'padding: 0;'],
  { after: authCompactMobileIndex }
);
assertAuthBlockIncludes(
  '.sf-auth-body:not(.sf-admin-body) .sf-auth-links',
  ['grid-template-columns: repeat(2, minmax(0, 1fr));', 'gap: 6px;'],
  { after: authNarrowMobileIndex }
);
assertAuthBlockIncludes(
  '.sf-auth-login:not(.sf-admin-body) .sf-auth-links a:first-child',
  ['grid-column: 1 / -1;'],
  { after: authNarrowMobileIndex }
);
assertAuthBlockIncludes(
  '.sf-auth-body:not(.sf-admin-body) .sf-auth-result-actions',
  ['grid-template-columns: 1fr;'],
  { after: authNarrowMobileIndex }
);
assertAuthBlockIncludes(
  '.sf-admin-body',
  ['--sf-admin-bg: #050509;', 'color-scheme: dark;'],
  { after: authAdminIndex }
);
assertAuthBlockIncludes(
  '.sf-admin-body .sf-admin-head',
  ['border: 1px solid var(--sf-admin-line);', 'border-radius: 8px;'],
  { after: authAdminIndex }
);
assertAuthBlockIncludes(
  '.sf-admin-body .sf-admin-head h1',
  ['color: var(--sf-admin-ink);', 'letter-spacing: 0;'],
  { after: authAdminIndex }
);
assertAuthBlockIncludes(
  '.sf-admin-body .sf-admin-head-actions a',
  ['min-height: 44px;', 'border-radius: 8px;'],
  { after: authAdminIndex }
);

if (authMobileMediaIndex !== -1) {
  assertAuthBlockIncludes(
    '.sf-auth-body:not(.sf-admin-body) .sf-auth-title',
    ['display: none;'],
    { after: authMobileMediaIndex }
  );
  assertAuthBlockIncludes(
    '.sf-auth-body:not(.sf-admin-body) .sf-auth-route',
    ['display: none;'],
    { after: authMobileMediaIndex }
  );
  assertAuthBlockIncludes(
    '.sf-auth-body:not(.sf-admin-body) .sf-auth-status-list',
    ['display: none;'],
    { after: authMobileMediaIndex }
  );
  assertAuthBlockIncludes(
    '.sf-auth-body:not(.sf-admin-body) .sf-auth-card-head p',
    ['display: none;'],
    { after: authMobileMediaIndex }
  );
  assertAuthBlockIncludes(
    '.sf-auth-body:not(.sf-admin-body) .sf-social-status-note',
    ['display: none;'],
    { after: authMobileMediaIndex }
  );
  assertAuthBlockIncludes(
    '.sf-auth-body:not(.sf-admin-body) .sf-auth-stage',
    ['gap: 12px;', 'border: 0;', 'background: transparent;', 'padding: 0;'],
    { after: authMobileMediaIndex }
  );
  assertAuthBlockIncludes(
    '.sf-auth-body:not(.sf-admin-body) .sf-auth-form input',
    ['min-height: 44px;'],
    { after: authMobileMediaIndex }
  );
  assertAuthBlockIncludes(
    '.sf-auth-body:not(.sf-admin-body) .sf-auth-form textarea',
    ['min-height: 44px;'],
    { after: authMobileMediaIndex }
  );
  assertAuthBlockIncludes(
    '.sf-auth-body:not(.sf-admin-body) .sf-auth-form button',
    ['min-height: 44px;'],
    { after: authMobileMediaIndex }
  );
  assertAuthBlockIncludes(
    '.sf-auth-body:not(.sf-admin-body) .sf-auth-links button',
    ['min-height: 44px;'],
    { after: authMobileMediaIndex }
  );
  assertAuthBlockIncludes(
    '.sf-auth-body:not(.sf-admin-body) .sf-auth-links button[hidden]',
    ['display: none !important;']
  );
  assertAuthBlockIncludes(
    '.sf-auth-signup:not(.sf-admin-body) .sf-auth-form textarea',
    ['height: 56px;', 'min-height: 56px;', 'line-height: 1.45;'],
    { after: authMobileMediaIndex }
  );
  assertAuthBlockIncludes(
    '.sf-auth-body:not(.sf-admin-body) .sf-social-auth',
    ['display: none;'],
    { after: authFocusMobileIndex }
  );
  assertAuthBlockIncludes(
    '.sf-auth-body:not(.sf-admin-body) .sf-auth-divider',
    ['display: none;'],
    { after: authFocusMobileIndex }
  );
  assertAuthBlockIncludes(
    '.sf-account-login-state a',
    ['width: 100%;', 'min-height: 44px;', 'border-radius: 8px;'],
    { after: authMobileMediaIndex }
  );
  assertAuthBlockIncludes(
    '.sf-auth-account:not(.sf-admin-body) .sf-account-login-state',
    ['gap: 8px;', 'padding: 14px;'],
    { after: authMobileMediaIndex }
  );
  assertAuthBlockIncludes(
    '.sf-auth-account:not(.sf-admin-body) .sf-auth-shell',
    ['min-height: auto;'],
    { after: authMobileMediaIndex }
  );
  assertAuthBlockIncludes(
    '.sf-auth-account:not(.sf-admin-body) .sf-auth-stage',
    ['min-height: auto;'],
    { after: authMobileMediaIndex }
  );
  assertAuthBlockIncludes(
    '.sf-auth-account:not(.sf-admin-body) .sf-account-login-state p',
    ['display: block;', 'font-size: 0.84rem;', 'line-height: 1.45;'],
    { after: authMobileMediaIndex }
  );
}

if (authAdminMobileIndex !== -1) {
  assertAuthBlockIncludes(
    '.sf-admin-body .sf-admin-shell',
    ['width: min(100% - 20px, 560px);', 'padding: 10px 0 48px;'],
    { after: authAdminMobileIndex }
  );
  assertAuthBlockIncludes(
    '.sf-admin-body .sf-admin-dashboard-meta',
    ['display: none;'],
    { after: authAdminMobileIndex }
  );
  assertAuthBlockIncludes(
    '.sf-admin-body .sf-admin-jump-nav',
    ['grid-template-columns: repeat(2, minmax(0, 1fr));'],
    { after: authAdminMobileIndex }
  );
}

if (mvMobileMediaIndex !== -1) {
  assertMvBlockIncludes(
    '.mv-topbar',
    ['flex-direction: row;', 'gap: 8px;', 'margin-bottom: 8px;'],
    { after: mvMobileMediaIndex }
  );
  assertMvBlockIncludes(
    '.mv-top-actions',
    ['gap: 6px;', 'margin-left: auto;', 'width: auto;'],
    { after: mvMobileMediaIndex }
  );
  assertMvBlockIncludes(
    '.mv-creator,\n  .mv-version,\n  .mv-top-actions a[data-studio-route="home"]',
    ['display: none;'],
    { after: mvMobileMediaIndex }
  );
  assertMvBlockIncludes(
    '.mv-section-nav',
    ['display: flex;', 'overflow-x: auto;', 'scrollbar-width: none;'],
    { after: mvMobileMediaIndex }
  );
  assertMvBlockIncludes(
    '.mv-section-nav a,\n  .mv-section-slot',
    ['flex: 0 0 120px;', 'min-height: 46px;', 'scroll-snap-align: start;'],
    { after: mvMobileMediaIndex }
  );
  assertMvBlockIncludes(
    '.mv-section-nav a span,\n  .mv-section-slot span',
    ['display: none;'],
    { after: mvMobileMediaIndex }
  );
  assertMvBlockIncludes(
    '.mv-category-home',
    ['min-height: auto;', 'padding: 30px 16px 46px;'],
    { after: mvMobileMediaIndex }
  );
  assertMvBlockIncludes(
    '.mv-gpts-links a',
    ['min-height: 72px;', 'padding: 12px;'],
    { after: mvMobileMediaIndex }
  );
  assertMvBlockIncludes(
    '.mv-top-actions a,\n  .mv-install-button,\n  .mv-logout-button',
    ['flex: 0 0 auto;', 'min-height: 40px;', 'padding-inline: 10px;'],
    { after: mvMobileMediaIndex }
  );
}

if (errors.length > 0) {
  console.error('Mobile CSS check failed:');
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log('Mobile CSS check passed: responsive touch, auxiliary link, and wrapping rules are present.');
