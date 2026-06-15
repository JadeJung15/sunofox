import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const siteContentPath = path.join(rootDir, 'src', 'data', 'siteContent.js');
const episodeDir = path.join(rootDir, 'src', 'pages', 'novels');
const siteUrl = 'https://sunofox.com';

const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function assertEqual(label, actual, expected) {
  if (actual !== expected) {
    fail(`${label}: expected "${expected}", got "${actual || '(empty)'}"`);
  }
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

function assertStringArray(label, value, { min = 1 } = {}) {
  if (!Array.isArray(value)) {
    fail(`${label}: must be an array`);
    return [];
  }

  if (value.length < min) {
    fail(`${label}: must contain at least ${min} item(s)`);
  }

  const normalized = value.map((item) => String(item || '').trim());
  const seen = new Set();

  normalized.forEach((item, index) => {
    if (!item) fail(`${label}[${index}]: must not be empty`);
    if (seen.has(item)) fail(`${label}: duplicate value "${item}"`);
    seen.add(item);
  });

  return normalized.filter(Boolean);
}

function parseFrontmatter(markdown, fileName) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    fail(`${fileName}: missing frontmatter block`);
    return {};
  }

  return match[1].split(/\r?\n/).reduce((frontmatter, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return frontmatter;

    const separatorIndex = trimmed.indexOf(':');
    if (separatorIndex === -1) return frontmatter;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    frontmatter[key] = value;
    return frontmatter;
  }, {});
}

function markdownBody(markdown) {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').trim();
}

function episodeFileNameFromHref(href) {
  const match = href?.match(/\/novels\/(episode-\d{3})\/$/);
  return match ? `${match[1]}.md` : '';
}

function episodeNumberFromHref(href) {
  const match = href?.match(/\/novels\/episode-(\d{3})\/$/);
  return match ? Number(match[1]) : null;
}

function parseReadingPathRange(range) {
  const match = String(range || '').trim().match(/^(\d+)~(\d+)화$/);
  if (!match) return null;

  return {
    start: Number(match[1]),
    end: Number(match[2])
  };
}

function previousPublishedEpisode(episodes, index) {
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    if (episodes[cursor].href) return episodes[cursor];
  }
  return null;
}

function nextPublishedEpisode(episodes, index) {
  for (let cursor = index + 1; cursor < episodes.length; cursor += 1) {
    if (episodes[cursor].href) return episodes[cursor];
  }
  return null;
}

const siteContentModule = await import(`${pathToFileURL(siteContentPath).href}?mtime=${Date.now()}`);
const {
  novelEpisodes,
  novelProject,
  publishedNovelEpisodes,
  latestNovelEpisode,
  storyOstMap
} = siteContentModule;

if (!Array.isArray(novelEpisodes) || novelEpisodes.length === 0) {
  fail('novelEpisodes must be a non-empty array');
}

if (!Array.isArray(publishedNovelEpisodes) || publishedNovelEpisodes.length === 0) {
  fail('publishedNovelEpisodes must be a non-empty array');
}

const files = await readdir(episodeDir);
const episodeFiles = files.filter((file) => /^episode-\d{3}\.md$/.test(file)).sort();
const publishedEpisodes = novelEpisodes.filter((episode) => episode.href);
const expectedFiles = publishedEpisodes.map((episode) => episodeFileNameFromHref(episode.href));
const expectedFileSet = new Set(expectedFiles);
const publishedHrefSet = new Set(publishedEpisodes.map((episode) => episode.href));
const publishedNumberSet = new Set(publishedEpisodes.map((episode) => Number(episode.number)));

for (const file of expectedFiles) {
  if (!file) {
    fail('published episode href must match /novels/episode-000/ pattern');
  } else if (!episodeFiles.includes(file)) {
    fail(`${file}: markdown file is missing for published episode`);
  }
}

for (const file of episodeFiles) {
  if (!expectedFileSet.has(file)) {
    warn(`${file}: markdown file exists but is not listed as a published episode`);
  }
}

if (!Array.isArray(novelProject.readingPath) || novelProject.readingPath.length === 0) {
  fail('novelProject.readingPath must be a non-empty array');
} else {
  const seenReadingHrefs = new Set();
  const coveredReadingNumbers = new Map();

  novelProject.readingPath.forEach((item, index) => {
    const label = `novelProject.readingPath[${index}]`;

    for (const field of ['range', 'title', 'text', 'href']) {
      assertPresent(`${label} ${field}`, item[field]);
    }

    if (!publishedHrefSet.has(item.href)) {
      fail(`${label} href: must point to a published episode (${item.href || '(empty)'})`);
    }

    if (seenReadingHrefs.has(item.href)) {
      fail(`${label} href: duplicate reading path target "${item.href}"`);
    }
    seenReadingHrefs.add(item.href);

    const range = parseReadingPathRange(item.range);
    if (!range) {
      fail(`${label} range: must use "1~2화" format`);
      return;
    }

    if (range.start > range.end) {
      fail(`${label} range: start must be less than or equal to end`);
    }

    const hrefNumber = episodeNumberFromHref(item.href);
    if (hrefNumber !== range.start) {
      fail(`${label} href: must point to the first episode in range ${item.range}`);
    }

    for (let number = range.start; number <= range.end; number += 1) {
      if (coveredReadingNumbers.has(number)) {
        fail(`${label} range: episode ${number} is covered more than once`);
      }
      coveredReadingNumbers.set(number, label);
    }
  });

  for (const episodeNumber of publishedNumberSet) {
    if (!coveredReadingNumbers.has(episodeNumber)) {
      fail(`novelProject.readingPath: published episode ${episodeNumber} is not covered`);
    }
  }

  for (const coveredNumber of coveredReadingNumbers.keys()) {
    if (!publishedNumberSet.has(coveredNumber)) {
      fail(`novelProject.readingPath: range covers unpublished episode ${coveredNumber}`);
    }
  }
}

const seenNumbers = new Set();
const seenHrefs = new Set();

for (const [index, episode] of publishedEpisodes.entries()) {
  const label = `${episode.number} ${episode.title}`;
  const fileName = episodeFileNameFromHref(episode.href);
  const numberPadded = String(Number(episode.number)).padStart(2, '0');
  const numberThree = String(Number(episode.number)).padStart(3, '0');
  const expectedIsoDate = episode.publishedAt?.replaceAll('.', '-');

  for (const field of ['title', 'status', 'label', 'hook', 'update', 'href', 'cta', 'publishedAt', 'isoDate', 'readTime', 'ostKey']) {
    assertPresent(`${label} ${field}`, episode[field]);
  }

  if (seenNumbers.has(episode.number)) fail(`${label}: duplicate episode number`);
  if (seenHrefs.has(episode.href)) fail(`${label}: duplicate episode href`);
  seenNumbers.add(episode.number);
  seenHrefs.add(episode.href);

  if (episode.number !== numberPadded) {
    fail(`${label}: episode number must be two digits`);
  }

  assertEqual(`${label} href`, episode.href, `/novels/episode-${numberThree}/`);
  assertEqual(`${label} status`, episode.status, `${Number(episode.number)}화 공개`);
  assertEqual(`${label} label`, episode.label, `${Number(episode.number)}화`);
  assertPattern(`${label} publishedAt`, episode.publishedAt, /^\d{4}\.\d{2}\.\d{2}$/);
  assertPattern(`${label} isoDate`, episode.isoDate, /^\d{4}-\d{2}-\d{2}$/);
  assertEqual(`${label} isoDate`, episode.isoDate, expectedIsoDate);

  if (!storyOstMap?.[episode.ostKey]) {
    fail(`${label} ostKey: must reference a registered story OST`);
  }

  if (episode.isFree !== true) {
    fail(`${label}: published episode must set isFree to true`);
  }

  const shareTags = assertStringArray(`${label} shareTags`, episode.shareTags, { min: 3 });
  const projectKeywordSet = new Set(novelProject.keywords || []);
  const hasEpisodeSpecificTag = shareTags.some((tag) => !projectKeywordSet.has(tag));
  if (!hasEpisodeSpecificTag) {
    fail(`${label} shareTags: must include at least one episode-specific tag`);
  }

  const markdownPath = path.join(episodeDir, fileName);
  const markdown = await readFile(markdownPath, 'utf8');
  const frontmatter = parseFrontmatter(markdown, fileName);
  const body = markdownBody(markdown);
  const sourceIndex = novelEpisodes.indexOf(episode);
  const previous = previousPublishedEpisode(novelEpisodes, sourceIndex);
  const next = nextPublishedEpisode(novelEpisodes, sourceIndex);

  assertEqual(`${fileName} layout`, frontmatter.layout, '../../layouts/NovelEpisodeLayout.astro');
  assertEqual(`${fileName} title`, frontmatter.title, `${Number(episode.number)}화. ${episode.title}`);
  assertEqual(`${fileName} canonical`, frontmatter.canonical, `${siteUrl}${episode.href}`);
  assertEqual(`${fileName} episodeLabel`, frontmatter.episodeLabel, `EPISODE ${episode.number}`);
  assertEqual(`${fileName} publishedAt`, frontmatter.publishedAt, episode.publishedAt);
  assertEqual(`${fileName} readTime`, frontmatter.readTime, episode.readTime);
  assertEqual(`${fileName} seriesTitle`, frontmatter.seriesTitle, novelProject.title);
  assertEqual(`${fileName} backHref`, frontmatter.backHref, '/novels/');
  assertEqual(`${fileName} backLabel`, frontmatter.backLabel, 'NOVEL');

  if (!frontmatter.description) fail(`${fileName}: description is required`);
  if (!frontmatter.subtitle) fail(`${fileName}: subtitle is required`);
  if ((frontmatter.description || '').length < 40) fail(`${fileName}: description is too short`);
  if ((frontmatter.subtitle || '').length < 8) fail(`${fileName}: subtitle is too short`);
  if (body.length < 500) fail(`${fileName}: body is too short or missing`);

  if (previous) {
    assertEqual(`${fileName} previousHref`, frontmatter.previousHref, previous.href);
    assertEqual(`${fileName} previousLabel`, frontmatter.previousLabel, '이전 화');
  } else if (frontmatter.previousHref) {
    fail(`${fileName}: first published episode must not have previousHref`);
  }

  if (next) {
    assertEqual(`${fileName} nextHref`, frontmatter.nextHref, next.href);
    assertEqual(`${fileName} nextLabel`, frontmatter.nextLabel, '다음 화');
  } else if (frontmatter.nextHref) {
    fail(`${fileName}: latest published episode must not have nextHref`);
  }
}

if (latestNovelEpisode?.href !== publishedEpisodes.at(-1)?.href) {
  fail(`latestNovelEpisode must point to the last published episode (${publishedEpisodes.at(-1)?.href || 'none'})`);
}

for (let index = 0; index < publishedEpisodes.length; index += 1) {
  const expectedNumber = String(index + 1).padStart(2, '0');
  if (publishedEpisodes[index].number !== expectedNumber) {
    fail(`published episode order mismatch at index ${index}: expected ${expectedNumber}, got ${publishedEpisodes[index].number}`);
  }
}

if (warnings.length > 0) {
  console.log('Content consistency warnings:');
  warnings.forEach((message) => console.log(`- ${message}`));
}

if (errors.length > 0) {
  console.error('Content consistency check failed:');
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`Content consistency check passed: ${publishedEpisodes.length} published episodes, ${episodeFiles.length} episode files.`);
