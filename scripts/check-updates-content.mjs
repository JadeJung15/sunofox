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

function assertUnique(label, values) {
  const seen = new Set();

  values.forEach((value) => {
    if (seen.has(value)) fail(`${label}: duplicate value "${value}"`);
    seen.add(value);
  });
}

function isAllowedHref(value) {
  if (!value || typeof value !== 'string') return false;
  if (value.startsWith('#')) return true;
  if (value.startsWith('/')) return true;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function assertLink(label, href, { allowEmpty = false } = {}) {
  if (!href) {
    if (!allowEmpty) fail(`${label}: missing`);
    return;
  }

  if (!isAllowedHref(href)) {
    fail(`${label}: unsupported href "${href}"`);
  }
}

const siteContentModule = await import(`${pathToFileURL(siteContentPath).href}?mtime=${Date.now()}`);
const { plannedContentHubs, siteUpdates, updateCategories } = siteContentModule;

const categoryKeys = updateCategories.map((category) => category.key);
const hubKeys = plannedContentHubs.map((hub) => hub.key);

assertUnique('updateCategories key', categoryKeys);
assertUnique('plannedContentHubs key', hubKeys);

for (const required of ['notice', 'novel', 'music', 'site', 'commerce', 'community']) {
  if (!categoryKeys.includes(required)) {
    fail(`updateCategories: missing required category "${required}"`);
  }
}

for (const required of ['novel', 'music', 'world', 'notice', 'commerce', 'community']) {
  if (!hubKeys.includes(required)) {
    fail(`plannedContentHubs: missing required hub "${required}"`);
  }
}

assertArray('updateCategories', updateCategories, { min: 6 }).forEach((category, index) => {
  const label = `updateCategories[${index}]`;

  for (const field of ['key', 'label', 'summary', 'href', 'cta', 'countLabel']) {
    assertPresent(`${label} ${field}`, category[field]);
  }

  assertLink(`${label} href`, category.href);
});

assertArray('plannedContentHubs', plannedContentHubs, { min: 6 }).forEach((hub, index) => {
  const label = `plannedContentHubs[${index}]`;

  for (const field of ['key', 'label', 'status', 'summary', 'nextAction', 'visibility', 'cta']) {
    assertPresent(`${label} ${field}`, hub[field]);
  }

  assertLink(`${label} href`, hub.href, { allowEmpty: true });

  if (!hub.href && !/(대기|비공개|확정|운영 기준)/.test(`${hub.cta} ${hub.nextAction} ${hub.visibility}`)) {
    fail(`${label}: waiting hub without href must explain what is pending`);
  }
});

assertArray('siteUpdates', siteUpdates, { min: 1 }).forEach((item, index) => {
  const label = `siteUpdates[${index}]`;

  for (const field of ['date', 'type', 'title', 'summary']) {
    assertPresent(`${label} ${field}`, item[field]);
  }

  if (!/^\d{4}\.\d{2}\.\d{2}$/.test(item.date || '')) {
    fail(`${label} date: invalid format "${item.date || '(empty)'}"`);
  }

  assertArray(`${label} areas`, item.areas).forEach((area) => {
    if (!categoryKeys.includes(area)) {
      fail(`${label} areas: unknown category "${area}"`);
    }
  });

  assertArray(`${label} links`, item.links).forEach((link, linkIndex) => {
    assertPresent(`${label} links[${linkIndex}] label`, link.label);
    assertLink(`${label} links[${linkIndex}] href`, link.href);
  });
});

if (errors.length > 0) {
  console.error('Updates content check failed:');
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`Updates content check passed: ${siteUpdates.length} updates, ${plannedContentHubs.length} hubs.`);
