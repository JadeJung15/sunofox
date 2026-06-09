import { createHash } from 'node:crypto';
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

const assets = [
  {
    source: 'css/sf-auth.css',
    target: (hash) => `css/sf-auth.${hash}.css`,
    pattern: /\/css\/sf-auth(?:\.[a-z0-9]+)?\.css(?:\?[^"]*)?/g
  },
  {
    source: 'js/sfAuth.js',
    target: (hash) => `js/sfAuth.${hash}.js`,
    pattern: /\/js\/sfAuth(?:\.[a-z0-9]+)?\.js(?:\?[^"]*)?/g
  }
];

const htmlFiles = [
  'admin.html',
  'admin/index.html',
  'login.html',
  'login/index.html',
  'signup.html',
  'signup/index.html'
];

const versioned = new Map();

for (const asset of assets) {
  const sourcePath = join(dist, asset.source);
  const content = await readFile(sourcePath);
  const hash = createHash('sha256').update(content).digest('hex').slice(0, 10);
  const target = asset.target(hash);
  await copyFile(sourcePath, join(dist, target));
  versioned.set(asset.source, { ...asset, target });
}

for (const htmlFile of htmlFiles) {
  const htmlPath = join(dist, htmlFile);
  let html = await readFile(htmlPath, 'utf8');
  for (const asset of versioned.values()) {
    html = html.replace(asset.pattern, `/${asset.target}`);
  }
  await writeFile(htmlPath, html);
}

for (const [source, asset] of versioned.entries()) {
  console.log(`versioned auth asset: ${source} -> ${asset.target}`);
}
