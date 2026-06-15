import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const episodeDir = path.join(rootDir, 'src', 'pages', 'novels');
const siteContentPath = path.join(rootDir, 'src', 'data', 'siteContent.js');
const siteUrl = 'https://sunofox.com';
const errors = [];

function fail(message) {
  errors.push(message);
}

function decodeHtml(value = '') {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function parseAttributes(tag) {
  const attrs = {};
  const attrPattern = /([\w:-]+)=["']([^"']*)["']/g;

  for (const match of tag.matchAll(attrPattern)) {
    attrs[match[1]] = decodeHtml(match[2]);
  }

  return attrs;
}

function parseHead(html) {
  const title = decodeHtml(html.match(/<title>(.*?)<\/title>/is)?.[1]?.trim() || '');
  const canonical = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*>/i);
  const meta = {};

  for (const match of html.matchAll(/<meta\s+[^>]*>/gi)) {
    const attrs = parseAttributes(match[0]);
    const key = attrs.name || attrs.property;
    if (key) meta[key] = attrs.content || '';
  }

  return {
    title,
    canonical: canonical ? parseAttributes(canonical[0]).href || '' : '',
    meta
  };
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return {};

  return match[1].split(/\r?\n/).reduce((frontmatter, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return frontmatter;
    const separatorIndex = trimmed.indexOf(':');
    if (separatorIndex === -1) return frontmatter;
    frontmatter[trimmed.slice(0, separatorIndex).trim()] = trimmed.slice(separatorIndex + 1).trim();
    return frontmatter;
  }, {});
}

function collectJsonLdTypes(value, types = new Set()) {
  if (!value || typeof value !== 'object') return types;

  if (Array.isArray(value)) {
    value.forEach((item) => collectJsonLdTypes(item, types));
    return types;
  }

  const type = value['@type'];
  if (Array.isArray(type)) {
    type.forEach((item) => types.add(item));
  } else if (type) {
    types.add(type);
  }

  Object.values(value).forEach((item) => collectJsonLdTypes(item, types));
  return types;
}

function parseJsonLdTypes(html, label) {
  const types = new Set();
  const scripts = [...html.matchAll(/<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];

  if (scripts.length === 0) {
    fail(`${label}: missing JSON-LD script`);
    return types;
  }

  for (const script of scripts) {
    try {
      collectJsonLdTypes(JSON.parse(script[1]), types);
    } catch (error) {
      fail(`${label}: invalid JSON-LD (${error.message})`);
    }
  }

  return types;
}

function assertEqual(label, actual, expected) {
  if (actual !== expected) {
    fail(`${label}: expected "${expected}", got "${actual || '(empty)'}"`);
  }
}

function assertPresent(label, value) {
  if (!value) fail(`${label}: missing`);
}

function assertIncludes(label, set, expected) {
  if (!set.has(expected)) fail(`${label}: missing JSON-LD type ${expected}`);
}

async function readHtml(route) {
  const filePath = path.join(distDir, route.file);
  await stat(filePath).catch(() => {
    fail(`${route.name}: ${route.file} is missing. Run npm run build first.`);
  });
  return readFile(filePath, 'utf8');
}

const siteContentSource = await readFile(siteContentPath, 'utf8');
const siteContentModule = await import(`data:text/javascript;base64,${Buffer.from(siteContentSource).toString('base64')}`);
const {
  archiveAlbum,
  musicArchive,
  novelProject,
  publishedNovelEpisodes,
  siteUpdates
} = siteContentModule;

const routes = [
  {
    name: 'home',
    file: 'index.html',
    canonical: `${siteUrl}/`,
    title: 'SunoFox | Music to Novel',
    descriptionIncludes: '음악에서 시작한 감정',
    jsonLdTypes: ['Organization', 'WebSite', 'CreativeWorkSeries']
  },
  {
    name: 'novels',
    file: 'novels/index.html',
    canonical: `${siteUrl}/novels/`,
    title: `${novelProject.title} | SunoFox`,
    descriptionIncludes: '몰락해야 했던 악녀',
    jsonLdTypes: ['CreativeWorkSeries', 'BreadcrumbList']
  },
  {
    name: 'music',
    file: 'music/index.html',
    canonical: `${siteUrl}/music/`,
    title: `${musicArchive.title} | Music to Novel`,
    descriptionIncludes: '필모그래피',
    jsonLdTypes: ['CollectionPage', 'BreadcrumbList']
  },
  {
    name: 'album',
    file: 'music/archive-vol-1/index.html',
    canonical: `${siteUrl}${archiveAlbum.href}`,
    title: `${archiveAlbum.title} | SunoFox`,
    descriptionIncludes: '오리지널 트랙',
    jsonLdTypes: ['MusicAlbum', 'BreadcrumbList']
  },
  {
    name: 'profile',
    file: 'profile/index.html',
    canonical: `${siteUrl}/profile/`,
    title: 'SunoFox 소개 | Music to Novel',
    descriptionIncludes: 'IP 스튜디오',
    jsonLdTypes: ['Organization', 'WebSite']
  },
  {
    name: 'updates',
    file: 'updates/index.html',
    canonical: `${siteUrl}/updates/`,
    title: 'SunoFox Updates | Official Log',
    descriptionIncludes: '업데이트 로그',
    jsonLdTypes: ['CollectionPage']
  }
];

for (const episode of publishedNovelEpisodes) {
  const number = String(Number(episode.number)).padStart(3, '0');
  const markdown = await readFile(path.join(episodeDir, `episode-${number}.md`), 'utf8');
  const frontmatter = parseFrontmatter(markdown);

  routes.push({
    name: `episode-${number}`,
    file: `novels/episode-${number}/index.html`,
    canonical: `${siteUrl}${episode.href}`,
    title: `${frontmatter.title} | SunoFox`,
    descriptionIncludes: frontmatter.description?.slice(0, 20) || episode.title,
    jsonLdTypes: ['Article', 'BreadcrumbList'],
    articlePublishedAt: episode.isoDate
  });
}

for (const route of routes) {
  const html = await readHtml(route);
  const head = parseHead(html);
  const meta = head.meta;
  const jsonLdTypes = parseJsonLdTypes(html, route.name);

  assertEqual(`${route.name} title`, head.title, route.title);
  assertEqual(`${route.name} canonical`, head.canonical, route.canonical);
  assertEqual(`${route.name} og:url`, meta['og:url'], route.canonical);
  assertEqual(`${route.name} og:title`, meta['og:title'], route.title);
  assertEqual(`${route.name} twitter:title`, meta['twitter:title'], route.title);
  assertEqual(`${route.name} twitter:card`, meta['twitter:card'], 'summary_large_image');
  assertEqual(`${route.name} robots`, meta.robots, 'index, follow');

  assertPresent(`${route.name} description`, meta.description);
  assertPresent(`${route.name} og:description`, meta['og:description']);
  assertPresent(`${route.name} twitter:description`, meta['twitter:description']);
  assertPresent(`${route.name} og:image`, meta['og:image']);
  assertPresent(`${route.name} og:image:alt`, meta['og:image:alt']);
  assertPresent(`${route.name} twitter:image`, meta['twitter:image']);
  assertPresent(`${route.name} twitter:image:alt`, meta['twitter:image:alt']);
  assertPresent(`${route.name} og:image:width`, meta['og:image:width']);
  assertPresent(`${route.name} og:image:height`, meta['og:image:height']);

  if (!meta.description.includes(route.descriptionIncludes)) {
    fail(`${route.name} description: expected to include "${route.descriptionIncludes}"`);
  }

  if (!meta['og:image']?.startsWith(`${siteUrl}/`)) {
    fail(`${route.name} og:image: must be an absolute sunofox.com URL`);
  }

  for (const type of route.jsonLdTypes) {
    assertIncludes(`${route.name} JSON-LD`, jsonLdTypes, type);
  }

  if (route.articlePublishedAt) {
    assertEqual(`${route.name} og:type`, meta['og:type'], 'article');
    assertEqual(`${route.name} article:published_time`, meta['article:published_time'], route.articlePublishedAt);
    assertEqual(`${route.name} article:modified_time`, meta['article:modified_time'], route.articlePublishedAt);
  } else {
    assertEqual(`${route.name} og:type`, meta['og:type'], 'website');
  }
}

if (!Array.isArray(siteUpdates) || siteUpdates.length === 0) {
  fail('siteUpdates must contain at least one update for /updates/ SEO context.');
}

if (errors.length > 0) {
  console.error('SEO metadata check failed:');
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`SEO metadata check passed: ${routes.length} HTML routes.`);
