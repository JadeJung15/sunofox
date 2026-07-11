import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [home, shell] = await Promise.all([
  readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/styles/official-shell.css', import.meta.url), 'utf8')
]);

assert.match(
  shell,
  /body:has\(\.official-home\)\{[^}]*background:#050509!important/,
  'official home must force the page canvas to the dark brand background'
);
assert.doesNotMatch(
  home,
  /\.chapter\s*\{[^}]*scroll-margin-top:/,
  'chapter anchors must not double the shared scroll-padding offset'
);
assert.match(
  home,
  /class="about-title-line"[^>]*>애니 OST로 완성하는<\/span>\s*<span class="about-title-line"[^>]*>감정의 서사<\/span>/,
  'about title must use explicit lines that preserve word spacing'
);
assert.match(
  home,
  /class="novel-title-line"[^>]*>악녀는 첫 장에서<\/span>\s*<span class="novel-title-line"[^>]*>웃었다<\/span>/,
  'novel title must preserve the approved two-line composition without orphan syllables'
);
assert.match(
  home,
  /\.about-title-line,\.novel-title-line\s*\{\s*display:block;/,
  'narrative title lines must render as stable blocks'
);
assert.doesNotMatch(
  home,
  /about-copy br:first-of-type\s*\{\s*display:none;/,
  'mobile CSS must not hide a br and concatenate Korean words'
);
assert.match(
  home,
  /\.chapter\s*\{[^}]*grid-template-columns:90px minmax\(280px,420px\) 1fr/,
  'default desktop narrative column must preserve the approved novel title wrap'
);
assert.match(
  home,
  /\.about-section\s*\{[^}]*grid-template-columns:90px minmax\(340px,470px\) 1fr/,
  'about section alone must widen the narrative column for its approved two-line heading'
);
assert.match(
  home,
  /\.production-flow p\s*\{[^}]*max-width:15em;/,
  'desktop production descriptions must share a consistent two-line measure'
);
assert.match(
  shell,
  /@media\(max-width:600px\)[\s\S]*\.site-nav a\{[^}]*min-height:44px;[^}]*font-size:10px;/,
  'mobile navigation must keep readable text and 44px touch targets'
);

console.log('Official layout contract passed: dark canvas, single anchor offset, stable headings, balanced flow, and mobile navigation.');
