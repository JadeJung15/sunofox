import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [home, globalCss, authCss] = await Promise.all([
  readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/styles/global.css', import.meta.url), 'utf8'),
  readFile(new URL('../public/css/sf-auth.css', import.meta.url), 'utf8')
]);

assert.match(home, /@media\s*\(max-width:900px\)/, 'tablet layout breakpoint is required');
assert.match(home, /@media\s*\(max-width:600px\)/, 'mobile layout breakpoint is required');
assert.match(home, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/, 'mobile filmography must use a two-column poster grid');
assert.match(home, /production-flow[\s\S]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/, 'mobile production flow must use an open 2x2 grid');
assert.match(home, /prefers-reduced-motion:reduce/, 'reduced-motion support is required');
assert.match(globalCss, /@media\(max-width:600px\)/, 'shared shell needs a compact mobile breakpoint');
assert.match(authCss, /@media\(max-width:390px\)/, 'login needs an exact 390px guard');
assert.match(authCss, /min-height:48px/, 'mobile Google login control needs a touch-safe height');
console.log('Mobile CSS check passed: 390px shell, 2x2 flow, two-column posters, touch target, and reduced motion.');
