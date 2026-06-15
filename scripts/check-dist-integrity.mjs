import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const siteOrigin = 'https://sunofox.com';
const protectedSourcePrefixes = [
  '/_sf-studio-entry',
  '/account',
  '/admin',
  '/login',
  '/mv-studio',
  '/signup'
];

const errors = [];
const checkedTargets = new Set();

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

function stripHashAndQuery(value) {
  return value.split('#')[0].split('?')[0];
}

function isExternalOrIgnored(value) {
  if (!value) return true;
  if (value.startsWith('#')) return true;
  if (/^(data|blob|javascript|mailto|tel|kakaomusic):/i.test(value)) return true;
  if (value.startsWith('/api/')) return true;

  try {
    const url = new URL(value);
    return url.origin !== siteOrigin;
  } catch {
    return false;
  }
}

function toSitePath(value, sourceSitePath) {
  if (isExternalOrIgnored(value)) return '';

  let candidate = value;
  try {
    const url = new URL(value);
    candidate = url.pathname;
  } catch {
    if (!value.startsWith('/')) {
      const basePath = sourceSitePath.endsWith('/')
        ? sourceSitePath
        : sourceSitePath.slice(0, sourceSitePath.lastIndexOf('/') + 1);
      candidate = path.posix.normalize(`${basePath}${value}`);
    }
  }

  candidate = stripHashAndQuery(candidate);
  if (!candidate || candidate === '.') return '';
  return candidate.startsWith('/') ? candidate : `/${candidate}`;
}

function candidateFilesForSitePath(sitePath) {
  if (!sitePath || sitePath.endsWith('/')) {
    return [`${sitePath}index.html`];
  }

  const extension = path.posix.extname(sitePath);
  if (extension) return [sitePath];

  return [
    sitePath,
    `${sitePath}.html`,
    `${sitePath}/index.html`
  ];
}

function fileExists(fileSet, sitePath) {
  return candidateFilesForSitePath(sitePath).some((candidate) => fileSet.has(candidate));
}

function addTarget(targets, value, sourceSitePath) {
  const sitePath = toSitePath(value.trim(), sourceSitePath);
  if (sitePath) targets.add(sitePath);
}

function extractHtmlTargets(content, sourceSitePath) {
  const targets = new Set();
  const attrPattern = /\b(?:href|src|poster)=["']([^"']+)["']/gi;
  const srcsetPattern = /\bsrcset=["']([^"']+)["']/gi;

  for (const match of content.matchAll(attrPattern)) {
    addTarget(targets, match[1], sourceSitePath);
  }

  for (const match of content.matchAll(srcsetPattern)) {
    for (const part of match[1].split(',')) {
      addTarget(targets, part.trim().split(/\s+/)[0] || '', sourceSitePath);
    }
  }

  return targets;
}

function extractCssTargets(content, sourceSitePath) {
  const targets = new Set();
  const urlPattern = /url\((["']?)([^"')]+)\1\)/gi;

  for (const match of content.matchAll(urlPattern)) {
    addTarget(targets, match[2], sourceSitePath);
  }

  return targets;
}

function extractManifestTargets(content, sourceSitePath) {
  const targets = new Set();
  const manifest = JSON.parse(content);

  for (const icon of manifest.icons || []) {
    addTarget(targets, icon.src || '', sourceSitePath);
  }

  return targets;
}

function sitePathFromFile(filePath) {
  const relative = normalizeSlash(path.relative(distDir, filePath));
  return `/${relative}`;
}

function isProtectedSource(sitePath) {
  return protectedSourcePrefixes.some((prefix) => (
    sitePath === prefix ||
    sitePath === `${prefix}.html` ||
    sitePath.startsWith(`${prefix}/`)
  ));
}

await stat(distDir).catch(() => {
  errors.push('dist directory is missing. Run npm run build before npm run check:dist.');
});

const distFiles = errors.length === 0 ? await collectFiles(distDir) : [];
const fileSet = new Set(distFiles.map(sitePathFromFile));

for (const filePath of distFiles) {
  const sitePath = sitePathFromFile(filePath);
  const extension = path.extname(filePath).toLowerCase();
  let targets = new Set();

  if (extension === '.html') {
    if (isProtectedSource(sitePath)) continue;
    targets = extractHtmlTargets(await readFile(filePath, 'utf8'), sitePath);
  } else if (extension === '.css') {
    targets = extractCssTargets(await readFile(filePath, 'utf8'), sitePath);
  } else if (sitePath === '/manifest.webmanifest') {
    targets = extractManifestTargets(await readFile(filePath, 'utf8'), sitePath);
  }

  for (const target of targets) {
    checkedTargets.add(target);
    if (!fileExists(fileSet, target)) {
      errors.push(`${sitePath}: missing internal target ${target}`);
    }
  }
}

if (errors.length > 0) {
  console.error('Dist integrity check failed:');
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`Dist integrity check passed: ${distFiles.length} files, ${checkedTargets.size} internal targets.`);
