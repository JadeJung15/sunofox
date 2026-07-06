import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const siteContentPath = path.join(rootDir, 'src', 'data', 'siteContent.js');
const errors = [];

function fail(message) {
  errors.push(message);
}

function assertPresent(label, value) {
  if (value === undefined || value === null || value === '') {
    fail(`${label}: missing`);
  }
}

function assertArray(label, value, { min = 1 } = {}) {
  if (!Array.isArray(value)) {
    fail(`${label}: must be an array`);
    return [];
  }

  if (value.length < min) {
    fail(`${label}: must contain at least ${min} item(s)`);
  }

  return value;
}

function assertPattern(label, value, pattern) {
  if (!pattern.test(value || '')) {
    fail(`${label}: invalid format "${value || '(empty)'}"`);
  }
}

function assertUnique(label, values) {
  const seen = new Set();

  values.filter(Boolean).forEach((value) => {
    if (seen.has(value)) fail(`${label}: duplicate value "${value}"`);
    seen.add(value);
  });
}

function isAllowedHref(value) {
  if (!value || typeof value !== 'string') return false;
  if (value.startsWith('/')) return true;
  if (value.startsWith('#')) return true;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' || url.protocol === 'kakaomusic:';
  } catch {
    return false;
  }
}

function assertLink(label, href) {
  assertPresent(label, href);
  if (href && !isAllowedHref(href)) {
    fail(`${label}: unsupported href "${href}"`);
  }
}

function youtubeIdFromHref(value) {
  try {
    const url = new URL(value);

    if (url.hostname === 'youtu.be') {
      return url.pathname.split('/').filter(Boolean)[0] || '';
    }

    if (url.hostname.endsWith('youtube.com')) {
      return url.searchParams.get('v') || url.pathname.match(/\/(?:embed|shorts)\/([^/?#]+)/)?.[1] || '';
    }
  } catch {
    return '';
  }

  return '';
}

const siteContentModule = await import(`${pathToFileURL(siteContentPath).href}?mtime=${Date.now()}`);
const {
  archiveAlbum,
  artistLinks,
  latestChannelVideo,
  musicArchive,
  novelProject,
  sunofoxProfile
} = siteContentModule;

assertPattern('sunofoxProfile researchDate', sunofoxProfile?.researchDate, /^\d{4}\.\d{2}\.\d{2}$/);

const requiredHighlightKeys = ['novel', 'music', 'video', 'studio'];
const highlightKeys = assertArray('sunofoxProfile.highlights', sunofoxProfile?.highlights, { min: 4 })
  .map((item) => item.key);

for (const key of requiredHighlightKeys) {
  if (!highlightKeys.includes(key)) {
    fail(`sunofoxProfile.highlights: missing required key "${key}"`);
  }
}

assertUnique('sunofoxProfile.highlights key', highlightKeys);

(sunofoxProfile?.highlights || []).forEach((item, index) => {
  const label = `sunofoxProfile.highlights[${index}]`;

  for (const field of ['key', 'label', 'status', 'title', 'summary', 'href', 'cta']) {
    assertPresent(`${label} ${field}`, item[field]);
  }

  assertLink(`${label} href`, item.href);
});

assertArray('sunofoxProfile.quickActions', sunofoxProfile?.quickActions, { min: 3 }).forEach((action, index) => {
  assertPresent(`sunofoxProfile.quickActions[${index}] label`, action.label);
  assertLink(`sunofoxProfile.quickActions[${index}] href`, action.href);
});

const requiredTabIds = ['youtube', 'discography', 'platforms', 'story'];
const tabIds = assertArray('sunofoxProfile.tabs', sunofoxProfile?.tabs, { min: 4 }).map((tab) => tab.id);
assertUnique('sunofoxProfile.tabs id', tabIds);

for (const id of requiredTabIds) {
  if (!tabIds.includes(id)) {
    fail(`sunofoxProfile.tabs: missing required tab "${id}"`);
  }
}

(sunofoxProfile?.tabs || []).forEach((tab, index) => {
  const label = `sunofoxProfile.tabs[${index}]`;

  for (const field of ['id', 'label', 'kicker', 'title', 'summary']) {
    assertPresent(`${label} ${field}`, tab[field]);
  }

  assertArray(`${label}.facts`, tab.facts, { min: 3 }).forEach((fact, factIndex) => {
    assertPresent(`${label}.facts[${factIndex}] label`, fact.label);
    assertPresent(`${label}.facts[${factIndex}] value`, fact.value);
  });

  assertArray(`${label}.links`, tab.links, { min: 1 }).forEach((link, linkIndex) => {
    assertPresent(`${label}.links[${linkIndex}] label`, link.label);
    assertLink(`${label}.links[${linkIndex}] href`, link.href);
  });

  if (tab.videos) {
    assertArray(`${label}.videos`, tab.videos, { min: 1 }).forEach((video, videoIndex) => {
      const videoLabel = `${label}.videos[${videoIndex}]`;

      for (const field of ['date', 'title', 'href', 'videoId', 'stats']) {
        assertPresent(`${videoLabel} ${field}`, video[field]);
      }

      assertLink(`${videoLabel} href`, video.href);

      if (youtubeIdFromHref(video.href) !== video.videoId) {
        fail(`${videoLabel} href: must match videoId "${video.videoId || '(empty)'}"`);
      }
    });
  }
});

const youtubeTab = sunofoxProfile?.tabs?.find((tab) => tab.id === 'youtube');
const discographyTab = sunofoxProfile?.tabs?.find((tab) => tab.id === 'discography');
const storyTab = sunofoxProfile?.tabs?.find((tab) => tab.id === 'story');

if (youtubeTab?.links?.[0]?.href !== artistLinks.youtube) {
  fail('sunofoxProfile.tabs.youtube links: first link must point to artistLinks.youtube');
}

if (youtubeTab?.videos?.[0]?.videoId !== latestChannelVideo?.videoId) {
  fail('sunofoxProfile.tabs.youtube videos: first video must be latestChannelVideo');
}

const expectedYoutubeVideoIds = musicArchive.videos.slice(0, 4).map((video) => video.videoId).join('|');
const actualYoutubeVideoIds = (youtubeTab?.videos || []).map((video) => video.videoId).join('|');
if (actualYoutubeVideoIds !== expectedYoutubeVideoIds) {
  fail('sunofoxProfile.tabs.youtube videos: must mirror the first four musicArchive videos');
}

if (!discographyTab?.tracks || discographyTab.tracks.length !== archiveAlbum.tracks.length) {
  fail('sunofoxProfile.tabs.discography tracks: must mirror archiveAlbum track count');
}

if (!storyTab?.links?.some((link) => link.href === '/novels/')) {
  fail('sunofoxProfile.tabs.story links: must include /novels/');
}

if (!sunofoxProfile?.highlights?.some((item) => item.href === musicArchive.href)) {
  fail('sunofoxProfile.highlights: must include musicArchive href');
}

const musicHighlight = sunofoxProfile?.highlights?.find((item) => item.href === musicArchive.href);
if (musicHighlight?.label !== '음악 아카이브') {
  fail('sunofoxProfile.highlights music label: must be "음악 아카이브"');
}

if (!sunofoxProfile?.quickActions?.some((action) => action.href === novelProject.season.finalHref)) {
  fail('sunofoxProfile.quickActions: must include current season final href');
}

const musicQuickAction = sunofoxProfile?.quickActions?.find((action) => action.href === musicArchive.href);
if (musicQuickAction?.label !== '음악 아카이브') {
  fail('sunofoxProfile.quickActions music label: must be "음악 아카이브"');
}

assertArray('sunofoxProfile.sources', sunofoxProfile?.sources, { min: 3 }).forEach((source, index) => {
  assertPresent(`sunofoxProfile.sources[${index}] label`, source.label);
  assertLink(`sunofoxProfile.sources[${index}] href`, source.href);
});

if (errors.length > 0) {
  console.error('Profile content check failed:');
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`Profile content check passed: ${sunofoxProfile.highlights.length} highlights, ${sunofoxProfile.tabs.length} tabs.`);
