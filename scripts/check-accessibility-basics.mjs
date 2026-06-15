import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const protectedSourcePrefixes = [
  '/_sf-studio-entry',
  '/account',
  '/admin',
  '/login',
  '/mv-studio',
  '/signup'
];
const ignoredExactPaths = new Set([
  '/google847c58fe0967b558.html'
]);

const errors = [];
const checkedFiles = [];

function fail(message) {
  errors.push(message);
}

function normalizeSlash(value) {
  return value.replaceAll(path.sep, '/');
}

async function collectFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function sitePathFromFile(filePath) {
  return `/${normalizeSlash(path.relative(distDir, filePath))}`;
}

function isProtectedSource(sitePath) {
  return protectedSourcePrefixes.some((prefix) => (
    sitePath === prefix ||
    sitePath === `${prefix}.html` ||
    sitePath.startsWith(`${prefix}/`)
  ));
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
  const attrPattern = /([\w:-]+)(?:=["']([^"']*)["'])?/g;

  for (const match of tag.matchAll(attrPattern)) {
    attrs[match[1]] = decodeHtml(match[2] ?? '');
  }

  return attrs;
}

function stripTags(value = '') {
  return decodeHtml(value)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function imageAltText(markup = '') {
  return [...markup.matchAll(/<img\b[\s\S]*?>/gi)]
    .map((match) => parseAttributes(match[0]).alt || '')
    .filter(Boolean)
    .join(' ')
    .trim();
}

function accessibleText(attrs, body) {
  return (attrs['aria-label'] || attrs.title || stripTags(body) || imageAltText(body)).trim();
}

await stat(distDir).catch(() => {
  fail('dist directory is missing. Run npm run build before npm run check:a11y.');
});

const files = errors.length === 0 ? await collectFiles(distDir) : [];

for (const filePath of files) {
  if (path.extname(filePath).toLowerCase() !== '.html') continue;

  const sitePath = sitePathFromFile(filePath);
  if (ignoredExactPaths.has(sitePath)) continue;
  if (isProtectedSource(sitePath)) continue;

  const html = await readFile(filePath, 'utf8');
  checkedFiles.push(sitePath);

  const htmlTag = html.match(/<html\b[\s\S]*?>/i)?.[0] || '';
  const htmlAttrs = parseAttributes(htmlTag);
  if (htmlAttrs.lang !== 'ko') {
    fail(`${sitePath}: html lang must be "ko"`);
  }

  if (!/<meta\s+[^>]*name=["']viewport["'][^>]*>/i.test(html)) {
    fail(`${sitePath}: missing viewport meta`);
  }

  if (!/<h1\b[\s\S]*?>[\s\S]*?<\/h1>/i.test(html)) {
    fail(`${sitePath}: missing h1`);
  }

  for (const match of html.matchAll(/<img\b[\s\S]*?>/gi)) {
    const tag = match[0];
    const attrs = parseAttributes(tag);
    const isDecorative = attrs['aria-hidden'] === 'true' || attrs.role === 'presentation';
    if (!Object.prototype.hasOwnProperty.call(attrs, 'alt')) {
      fail(`${sitePath}: img is missing alt (${tag.slice(0, 120)})`);
    } else if (!attrs.alt.trim() && !isDecorative) {
      fail(`${sitePath}: empty img alt must be marked aria-hidden or presentation`);
    }
  }

  for (const match of html.matchAll(/<a\b([\s\S]*?)>([\s\S]*?)<\/a>/gi)) {
    const attrs = parseAttributes(match[1]);
    const href = attrs.href || '';

    if (!accessibleText(attrs, match[2])) {
      fail(`${sitePath}: link has no accessible name (${href || 'no href'})`);
    }

    if (href === '#') {
      fail(`${sitePath}: link href="#" should use a real target or button`);
    }

    if (attrs.target === '_blank') {
      const rel = attrs.rel || '';
      if (!rel.includes('noopener') || !rel.includes('noreferrer')) {
        fail(`${sitePath}: target=_blank link must include rel="noopener noreferrer" (${href})`);
      }
    }
  }

  for (const match of html.matchAll(/<button\b([\s\S]*?)>([\s\S]*?)<\/button>/gi)) {
    const attrs = parseAttributes(match[1]);
    if (!accessibleText(attrs, match[2])) {
      fail(`${sitePath}: button has no accessible name`);
    }
  }
}

if (errors.length > 0) {
  console.error('Accessibility basics check failed:');
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`Accessibility basics check passed: ${checkedFiles.length} public HTML files.`);
