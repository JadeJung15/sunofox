import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const episodeDir = path.join(rootDir, 'src', 'pages', 'novels');
const siteContentPath = path.join(rootDir, 'src', 'data', 'siteContent.js');
const siteUrl = 'https://sunofox.com';
const siteName = 'SunoFox 수노폭스';
const errors = [];
const validOgImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const baseUrlArg = process.argv.find((arg) => arg.startsWith('--base-url='));
const remoteBaseUrl = baseUrlArg ? baseUrlArg.slice('--base-url='.length).trim().replace(/\/+$/, '') : '';

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

function collectMetaContents(html, keyName) {
  const values = [];

  for (const match of html.matchAll(/<meta\s+[^>]*>/gi)) {
    const attrs = parseAttributes(match[0]);
    const key = attrs.name || attrs.property;
    if (key === keyName && attrs.content) values.push(attrs.content);
  }

  return values;
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

function parseJsonLdObjects(html, label) {
  const objects = [];
  const scripts = [...html.matchAll(/<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];

  for (const script of scripts) {
    try {
      objects.push(JSON.parse(script[1]));
    } catch (error) {
      fail(`${label}: invalid JSON-LD (${error.message})`);
    }
  }

  return objects;
}

function collectJsonLdByType(value, expectedType, matches = []) {
  if (!value || typeof value !== 'object') return matches;

  if (Array.isArray(value)) {
    value.forEach((item) => collectJsonLdByType(item, expectedType, matches));
    return matches;
  }

  const type = value['@type'];
  const hasType = Array.isArray(type) ? type.includes(expectedType) : type === expectedType;
  if (hasType) matches.push(value);

  Object.values(value).forEach((item) => collectJsonLdByType(item, expectedType, matches));
  return matches;
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

function readMinutes(readTime = '') {
  return Number(String(readTime).match(/\d+/)?.[0] || 0);
}

async function readHtml(route) {
  if (remoteBaseUrl) {
    const url = new URL(route.canonical);
    const source = `${remoteBaseUrl}${url.pathname}`;

    let response;
    try {
      response = await fetch(source, {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
    } catch (error) {
      fail(`${route.name}: failed to fetch ${source} (${error.message})`);
      return '';
    }

    const html = await response.text();
    if (!response.ok) {
      fail(`${route.name}: ${source} returned HTTP ${response.status}`);
    }

    return html;
  }

  const filePath = path.join(distDir, route.file);
  await stat(filePath).catch(() => {
    fail(`${route.name}: ${route.file} is missing. Run npm run build first.`);
  });
  return readFile(filePath, 'utf8');
}

const siteContentModule = await import(`${pathToFileURL(siteContentPath).href}?mtime=${Date.now()}`);
const {
  archiveAlbum,
  musicArchive,
  novelProject,
  publishedNovelEpisodes
} = siteContentModule;

const routes = [
  {
    name: 'home',
    file: 'index.html',
    canonical: `${siteUrl}/`,
    title: `${siteName} | Anime OST Studio`,
    descriptionIncludes: '애니메이션 감성의 OST',
    jsonLdTypes: ['Organization', 'WebSite', 'CreativeWorkSeries']
  },
  {
    name: 'novels',
    file: 'novels/index.html',
    canonical: `${siteUrl}/novels/`,
    title: `${novelProject.title} | ${siteName}`,
    descriptionIncludes: '몰락해야 했던 악녀',
    jsonLdTypes: ['CreativeWorkSeries', 'BreadcrumbList']
  },
  {
    name: 'music',
    file: 'music/index.html',
    canonical: `${siteUrl}/music/`,
    title: `${musicArchive.title} | Anime OST Studio`,
    descriptionIncludes: '필모그래피',
    jsonLdTypes: ['CollectionPage', 'BreadcrumbList']
  },
  {
    name: 'album',
    file: 'music/archive-vol-1/index.html',
    canonical: `${siteUrl}${archiveAlbum.href}`,
    title: `${archiveAlbum.title} | ${siteName}`,
    descriptionIncludes: '오리지널 트랙',
    jsonLdTypes: ['MusicAlbum', 'BreadcrumbList']
  },
  {
    name: 'profile',
    file: 'profile/index.html',
    canonical: `${siteUrl}/profile/`,
    title: `${siteName} 소개 | Anime OST Studio`,
    descriptionIncludes: '이야기 기반 Anime OST',
    jsonLdTypes: ['Organization', 'WebSite']
  },
];

for (const episode of publishedNovelEpisodes) {
  const number = String(Number(episode.number)).padStart(3, '0');
  const markdown = await readFile(path.join(episodeDir, `episode-${number}.md`), 'utf8');
  const frontmatter = parseFrontmatter(markdown);

  routes.push({
    name: `episode-${number}`,
    file: `novels/episode-${number}/index.html`,
    canonical: `${siteUrl}${episode.href}`,
    title: `${frontmatter.title} | ${siteName}`,
    shareTitle: episode.shareTitle,
    shareDescription: episode.shareDescription,
    descriptionIncludes: episode.shareDescription?.slice(0, 20) || frontmatter.description?.slice(0, 20) || episode.title,
    jsonLdTypes: ['Article', 'BreadcrumbList'],
    articlePublishedAt: episode.isoDate,
    episodeTitle: episode.title,
    episodeUpdate: episode.update,
    shareImageAlt: episode.shareImageAlt,
    timeRequired: `PT${readMinutes(episode.readTime)}M`,
    shareTags: episode.shareTags || []
  });
}

for (const route of routes) {
  const html = await readHtml(route);
  const head = parseHead(html);
  const meta = head.meta;
  const jsonLdTypes = parseJsonLdTypes(html, route.name);
  const jsonLdObjects = parseJsonLdObjects(html, route.name);

  assertEqual(`${route.name} title`, head.title, route.title);
  assertEqual(`${route.name} canonical`, head.canonical, route.canonical);
  assertEqual(`${route.name} og:url`, meta['og:url'], route.canonical);
  assertEqual(`${route.name} og:title`, meta['og:title'], route.shareTitle || route.title);
  assertEqual(`${route.name} og:site_name`, meta['og:site_name'], siteName);
  assertEqual(`${route.name} og:locale`, meta['og:locale'], 'ko_KR');
  assertEqual(`${route.name} twitter:title`, meta['twitter:title'], route.shareTitle || route.title);
  assertEqual(`${route.name} twitter:card`, meta['twitter:card'], 'summary_large_image');
  assertEqual(`${route.name} twitter:site`, meta['twitter:site'], '@sunofox');
  assertEqual(`${route.name} twitter:domain`, meta['twitter:domain'], 'sunofox.com');
  assertEqual(`${route.name} twitter:url`, meta['twitter:url'], route.canonical);
  assertEqual(`${route.name} robots`, meta.robots, 'index, follow');
  assertEqual(`${route.name} author`, meta.author, 'SunoFox');

  assertPresent(`${route.name} description`, meta.description);
  assertPresent(`${route.name} og:description`, meta['og:description']);
  assertPresent(`${route.name} twitter:description`, meta['twitter:description']);
  assertPresent(`${route.name} og:image`, meta['og:image']);
  assertPresent(`${route.name} og:image:secure_url`, meta['og:image:secure_url']);
  assertPresent(`${route.name} og:image:alt`, meta['og:image:alt']);
  assertPresent(`${route.name} twitter:image`, meta['twitter:image']);
  assertPresent(`${route.name} twitter:image:alt`, meta['twitter:image:alt']);
  assertPresent(`${route.name} og:image:width`, meta['og:image:width']);
  assertPresent(`${route.name} og:image:height`, meta['og:image:height']);
  assertPresent(`${route.name} og:image:type`, meta['og:image:type']);

  if (!meta.description.includes(route.descriptionIncludes)) {
    fail(`${route.name} description: expected to include "${route.descriptionIncludes}"`);
  }

  if (route.shareDescription) {
    assertEqual(`${route.name} description`, meta.description, route.shareDescription);
    assertEqual(`${route.name} og:description`, meta['og:description'], route.shareDescription);
    assertEqual(`${route.name} twitter:description`, meta['twitter:description'], route.shareDescription);
  }

  if (route.shareImageAlt) {
    assertEqual(`${route.name} og:image:alt`, meta['og:image:alt'], route.shareImageAlt);
    assertEqual(`${route.name} twitter:image:alt`, meta['twitter:image:alt'], route.shareImageAlt);
  }

  if (!meta['og:image']?.startsWith(`${siteUrl}/`)) {
    fail(`${route.name} og:image: must be an absolute sunofox.com URL`);
  }

  assertEqual(`${route.name} og:image:secure_url`, meta['og:image:secure_url'], meta['og:image']);

  if (meta['og:image:type'] && !validOgImageTypes.has(meta['og:image:type'])) {
    fail(`${route.name} og:image:type: unsupported value "${meta['og:image:type']}"`);
  }

  for (const type of route.jsonLdTypes) {
    assertIncludes(`${route.name} JSON-LD`, jsonLdTypes, type);
  }

  if (route.articlePublishedAt) {
    const articleTags = collectMetaContents(html, 'article:tag');

    assertEqual(`${route.name} og:type`, meta['og:type'], 'article');
    assertEqual(`${route.name} article:published_time`, meta['article:published_time'], route.articlePublishedAt);
    assertEqual(`${route.name} article:modified_time`, meta['article:modified_time'], route.articlePublishedAt);
    assertEqual(`${route.name} og:updated_time`, meta['og:updated_time'], route.articlePublishedAt);
    assertEqual(`${route.name} article:author`, meta['article:author'], 'SunoFox');
    assertEqual(`${route.name} article:section`, meta['article:section'], novelProject.genre);
    assertPresent(`${route.name} meta keywords`, meta.keywords);

    for (const expectedKeyword of [novelProject.title, novelProject.genre, route.episodeTitle]) {
      if (!meta.keywords.includes(expectedKeyword)) {
        fail(`${route.name} meta keywords: expected to include "${expectedKeyword}"`);
      }
    }

    if (articleTags.length === 0) {
      fail(`${route.name} article:tag: missing`);
    }

    for (const expectedTag of route.shareTags) {
      if (!articleTags.includes(expectedTag)) {
        fail(`${route.name} article:tag: expected to include "${expectedTag}"`);
      }
    }

    const article = collectJsonLdByType(jsonLdObjects, 'Article')[0];
    assertPresent(`${route.name} Article JSON-LD`, article);
    assertEqual(`${route.name} Article mainEntityOfPage`, article?.mainEntityOfPage, route.canonical);
    assertEqual(`${route.name} Article dateModified`, article?.dateModified, route.articlePublishedAt);
    assertEqual(`${route.name} Article articleSection`, article?.articleSection, novelProject.genre);
    assertEqual(`${route.name} Article position`, String(article?.position), String(Number(route.name.replace('episode-', ''))));
    assertEqual(`${route.name} Article description`, article?.description, route.shareDescription);
    assertEqual(`${route.name} Article abstract`, article?.abstract, route.episodeUpdate);
    assertEqual(`${route.name} Article timeRequired`, article?.timeRequired, route.timeRequired);

    if (!Array.isArray(article?.keywords) || article.keywords.length === 0) {
      fail(`${route.name} Article keywords: missing`);
    }

    for (const expectedTag of route.shareTags) {
      if (!article?.keywords?.includes(expectedTag)) {
        fail(`${route.name} Article keywords: expected to include "${expectedTag}"`);
      }
    }

    if (!article?.publisher?.logo?.url?.startsWith(`${siteUrl}/`)) {
      fail(`${route.name} Article publisher logo: must be an absolute sunofox.com URL`);
    }
  } else {
    assertEqual(`${route.name} og:type`, meta['og:type'], 'website');
  }
}

if (errors.length > 0) {
  console.error('SEO metadata check failed:');
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`SEO metadata check passed: ${routes.length} HTML routes${remoteBaseUrl ? ` from ${remoteBaseUrl}` : ''}.`);
