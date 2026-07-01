import path from 'node:path';
import { existsSync } from 'node:fs';
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

function assertPattern(label, value, pattern) {
  if (!pattern.test(value || '')) {
    fail(`${label}: invalid format "${value || '(empty)'}"`);
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

function isAllowedHref(value) {
  if (!value || typeof value !== 'string') return false;
  if (value.startsWith('/')) return true;
  if (value.startsWith('kakaomusic:')) return true;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
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

function assertLink(label, href) {
  assertPresent(label, href);
  if (href && !isAllowedHref(href)) {
    fail(`${label}: unsupported href "${href}"`);
  }
}

function assertThumbnail(label, thumbnail, videoId) {
  assertLink(`${label} thumbnail`, thumbnail);

  const isYoutubeThumbnail = thumbnail?.includes(`/vi/${videoId}/`);
  const isPublicAsset = /^\/assets\/.+\.(?:avif|jpe?g|png|webp|svg)$/i.test(thumbnail || '');

  if (!isYoutubeThumbnail && !isPublicAsset) {
    fail(`${label} thumbnail: expected a YouTube thumbnail for "${videoId}" or a public /assets image`);
    return;
  }

  if (isPublicAsset) {
    const publicPath = path.join(rootDir, 'public', thumbnail.slice(1));
    if (!existsSync(publicPath)) {
      fail(`${label} thumbnail: local asset not found at "${thumbnail}"`);
    }
  }
}

function assertYoutubeVideo(label, video) {
  for (const field of ['date', 'title', 'meta', 'type', 'href', 'videoId', 'thumbnail', 'thumbnailAlt', 'publishedAt']) {
    assertPresent(`${label} ${field}`, video[field]);
  }

  assertPattern(`${label} date`, video.date, /^\d{4}\.\d{2}\.\d{2}$/);
  assertPattern(`${label} videoId`, video.videoId, /^[\w-]{6,}$/);
  assertLink(`${label} href`, video.href);
  assertThumbnail(label, video.thumbnail, video.videoId);

  const hrefVideoId = youtubeIdFromHref(video.href);
  if (hrefVideoId !== video.videoId) {
    fail(`${label} href: expected YouTube video id "${video.videoId}", got "${hrefVideoId || '(empty)'}"`);
  }

  if (Number.isNaN(Date.parse(video.publishedAt))) {
    fail(`${label} publishedAt: invalid ISO timestamp "${video.publishedAt}"`);
  }
}

const siteContentModule = await import(`${pathToFileURL(siteContentPath).href}?mtime=${Date.now()}`);
const {
  artistLinks,
  archiveAlbum,
  featuredStoryOst,
  latestStoryOst,
  musicArchive,
  storyOsts
} = siteContentModule;

for (const [key, href] of Object.entries(artistLinks || {})) {
  assertLink(`artistLinks.${key}`, href);
}

for (const field of ['date', 'title', 'englishTitle', 'type', 'href', 'youtubeHref', 'videoId', 'thumbnail', 'thumbnailAlt', 'publishedAt', 'summary']) {
  assertPresent(`featuredStoryOst ${field}`, featuredStoryOst?.[field]);
}

assertYoutubeVideo('featuredStoryOst', {
  ...featuredStoryOst,
  meta: featuredStoryOst?.englishTitle
});

const storyOstKeys = new Set();
assertArray('storyOsts', storyOsts).forEach((ost, index) => {
  const label = `storyOsts[${index}]`;

  assertPresent(`${label} key`, ost.key);
  assertPattern(`${label} key`, ost.key, /^[a-z0-9-]+$/);
  assertYoutubeVideo(label, {
    ...ost,
    meta: ost.englishTitle
  });

  if (storyOstKeys.has(ost.key)) {
    fail(`${label} key: duplicate story OST key "${ost.key}"`);
  }
  storyOstKeys.add(ost.key);
});

if (!storyOsts?.some((ost) => ost.key === featuredStoryOst?.key)) {
  fail('storyOsts: must include featuredStoryOst');
}

if (featuredStoryOst?.href !== artistLinks?.featuredOst) {
  fail('featuredStoryOst href: must match artistLinks.featuredOst');
}

if (youtubeIdFromHref(featuredStoryOst?.youtubeHref) !== featuredStoryOst?.videoId) {
  fail('featuredStoryOst youtubeHref: must match featuredStoryOst.videoId');
}

for (const field of ['title', 'artist', 'href', 'externalHref', 'bugsHref', 'releaseDate', 'isoDate', 'type', 'genre', 'distributor', 'agency', 'direction', 'image', 'imageAlt', 'summary']) {
  assertPresent(`archiveAlbum ${field}`, archiveAlbum?.[field]);
}

assertPattern('archiveAlbum releaseDate', archiveAlbum?.releaseDate, /^\d{4}\.\d{2}\.\d{2}$/);
assertPattern('archiveAlbum isoDate', archiveAlbum?.isoDate, /^\d{4}-\d{2}-\d{2}$/);
assertLink('archiveAlbum href', archiveAlbum?.href);
assertLink('archiveAlbum externalHref', archiveAlbum?.externalHref);
assertLink('archiveAlbum bugsHref', archiveAlbum?.bugsHref);
assertLink('archiveAlbum image', archiveAlbum?.image);

const albumLinkHrefs = new Set();
assertArray('archiveAlbum.links', archiveAlbum?.links, { min: 2 }).forEach((link, index) => {
  assertPresent(`archiveAlbum.links[${index}] label`, link.label);
  assertLink(`archiveAlbum.links[${index}] href`, link.href);
  albumLinkHrefs.add(link.href);
});

if (!albumLinkHrefs.has(archiveAlbum?.externalHref)) {
  fail('archiveAlbum.links: must include archiveAlbum.externalHref');
}

if (!albumLinkHrefs.has(archiveAlbum?.bugsHref)) {
  fail('archiveAlbum.links: must include archiveAlbum.bugsHref');
}

const trackTitles = new Set();
assertArray('archiveAlbum.tracks', archiveAlbum?.tracks).forEach((track, index) => {
  const label = `archiveAlbum.tracks[${index}]`;
  const expectedPosition = String(index + 1).padStart(2, '0');

  assertPresent(`${label} position`, track.position);
  assertPresent(`${label} title`, track.title);

  if (track.position !== expectedPosition) {
    fail(`${label} position: expected "${expectedPosition}", got "${track.position || '(empty)'}"`);
  }

  if (trackTitles.has(track.title)) {
    fail(`${label} title: duplicate track title "${track.title}"`);
  }
  trackTitles.add(track.title);
});

for (const field of ['title', 'href', 'researchDate', 'summary']) {
  assertPresent(`musicArchive ${field}`, musicArchive?.[field]);
}

assertPattern('musicArchive researchDate', musicArchive?.researchDate, /^\d{4}\.\d{2}\.\d{2}$/);
assertLink('musicArchive href', musicArchive?.href);

const releaseHrefs = new Set();
assertArray('musicArchive.releases', musicArchive?.releases).forEach((release, index) => {
  assertPresent(`musicArchive.releases[${index}] title`, release.title);
  assertLink(`musicArchive.releases[${index}] href`, release.href);
  releaseHrefs.add(release.href);
});

if (!releaseHrefs.has(archiveAlbum?.href)) {
  fail('musicArchive.releases: must include archiveAlbum');
}

const videoIds = new Set();
let previousVideoPublishedAt = Number.POSITIVE_INFINITY;
assertArray('musicArchive.videos', musicArchive?.videos).forEach((video, index) => {
  const label = `musicArchive.videos[${index}]`;
  assertYoutubeVideo(label, video);

  if (videoIds.has(video.videoId)) {
    fail(`${label} videoId: duplicate video id "${video.videoId}"`);
  }
  videoIds.add(video.videoId);

  const publishedAt = Date.parse(video.publishedAt);
  if (!Number.isNaN(publishedAt)) {
    if (publishedAt > previousVideoPublishedAt) {
      fail(`${label} publishedAt: videos must be sorted newest first`);
    }
    previousVideoPublishedAt = publishedAt;
  }
});

if (musicArchive?.videos?.[0]?.videoId !== latestStoryOst?.videoId) {
  fail('musicArchive.videos[0]: must be the latest story OST');
}

if (!musicArchive?.videos?.some((video) => video.videoId === featuredStoryOst?.videoId)) {
  fail('musicArchive.videos: must include featured story OST');
}

assertArray('musicArchive.videoHub.links', musicArchive?.videoHub?.links).forEach((link, index) => {
  assertPresent(`musicArchive.videoHub.links[${index}] label`, link.label);
  assertLink(`musicArchive.videoHub.links[${index}] href`, link.href);
});

for (const field of ['title', 'summary']) {
  assertPresent(`musicArchive.videoHub ${field}`, musicArchive?.videoHub?.[field]);
}

assertArray('musicArchive.videoHub.facts', musicArchive?.videoHub?.facts, { min: 3 }).forEach((fact, index) => {
  assertPresent(`musicArchive.videoHub.facts[${index}] label`, fact.label);
  assertPresent(`musicArchive.videoHub.facts[${index}] value`, fact.value);
});

const videoHubLinkHrefs = new Set((musicArchive?.videoHub?.links || []).map((link) => link.href));
for (const requiredHref of [artistLinks?.youtube, artistLinks?.youtubePlaylists, featuredStoryOst?.youtubeHref]) {
  if (!videoHubLinkHrefs.has(requiredHref)) {
    fail(`musicArchive.videoHub.links: missing required href "${requiredHref || '(empty)'}"`);
  }
}

assertArray('musicArchive.sources', musicArchive?.sources).forEach((source, index) => {
  assertPresent(`musicArchive.sources[${index}] label`, source.label);
  assertLink(`musicArchive.sources[${index}] href`, source.href);
});

if (errors.length > 0) {
  console.error('Music content check failed:');
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`Music content check passed: ${musicArchive.videos.length} videos, ${archiveAlbum.tracks.length} album tracks.`);
