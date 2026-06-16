import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const episodeDir = path.join(rootDir, 'src', 'pages', 'novels');
const siteContentPath = path.join(rootDir, 'src', 'data', 'siteContent.js');
const errors = [];

function fail(message) {
  errors.push(message);
}

function stripFrontmatter(markdown) {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

function hasLatinText(value) {
  return /[A-Za-z]{3,}/.test(value || '');
}

function hasHangulText(value) {
  return /[가-힣]/.test(value || '');
}

function hasInlineKoreanSupport(value) {
  if (!hasLatinText(value)) return true;
  return /\([^)가-힣]*[가-힣][^)]*\)/.test(value) || hasHangulText(value);
}

function normalizeLine(line) {
  return line
    .replace(/https?:\/\/\S+/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[[^\]]*]\([^)]*\)/g, '')
    .trim();
}

const allowedTokens = new Set([
  'SunoFox',
  'OST',
  'SF',
  'Studio'
]);

function removeAllowedTokens(value) {
  return value.replace(/[A-Za-z][A-Za-z0-9-]*/g, (token) => (
    allowedTokens.has(token) ? '' : token
  ));
}

const siteContentModule = await import(`${pathToFileURL(siteContentPath).href}?mtime=${Date.now()}`);
const { novelProject } = siteContentModule;

if (hasLatinText(novelProject?.systemLine) && !hasInlineKoreanSupport(novelProject.systemLine)) {
  fail('novelProject.systemLine: English system line must include Korean support on the same line');
}

const episodeFiles = (await readdir(episodeDir))
  .filter((file) => /^episode-\d{3}\.md$/.test(file))
  .sort();

for (const file of episodeFiles) {
  const markdown = await readFile(path.join(episodeDir, file), 'utf8');
  const body = stripFrontmatter(markdown);
  const lines = body.split(/\r?\n/);

  lines.forEach((line, index) => {
    const normalized = removeAllowedTokens(normalizeLine(line));
    if (!hasLatinText(normalized)) return;

    if (!hasInlineKoreanSupport(line)) {
      fail(`${file}:${index + 1}: English text must include Korean support on the same line`);
    }
  });
}

if (errors.length > 0) {
  console.error('Korean reader support check failed:');
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`Korean reader support check passed: ${episodeFiles.length} episode files.`);
