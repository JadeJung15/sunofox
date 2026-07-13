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
assert.match(
  shell,
  /\.site-header\{[^}]*pointer-events:auto;?/,
  'official header must remain interactive over the legacy non-interactive header rule'
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
  home,
  /\.official-hero\s*\{[^}]*min-height:680px;/,
  'desktop hero must preserve the selected compact cinematic height'
);
assert.match(
  home,
  /\.chapter\s*\{[^}]*min-height:0;[^}]*padding:24px 0;/,
  'desktop chapters must use the selected compact vertical rhythm'
);
assert.match(
  home,
  /\.chapter-image\s*\{[^}]*height:440px;/,
  'desktop narrative imagery must preserve the selected balanced proportion'
);
assert.match(
  home,
  /\.about-image\s*\{[^}]*height:350px;/,
  'desktop channel image must preserve the selected compact proportion'
);
assert.match(
  home,
  /\.filmography-grid\s*\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/,
  'desktop filmography must use the selected three-column reading layout'
);
assert.match(
  home,
  /\.work-card strong\s*\{[^}]*font-size:18px;/,
  'desktop filmography titles must remain comfortably readable'
);
assert.match(
  home,
  /\.work-card span\s*\{[^}]*font-size:13px;/,
  'desktop filmography metadata must remain comfortably readable'
);
assert.match(
  home,
  /\.studio-section\s*\{[^}]*padding:24px 0 40px;/,
  'desktop Studio chapter must preserve the selected compact closing rhythm'
);
assert.match(
  home,
  /src="\/assets\/release-desk\/cozy-drift\.jpg" alt="SF Studio 헤드폰과 제작 데스크"/,
  'Studio panel must use the selected warm headphone visual'
);
assert.match(
  home,
  /등록된 제작자 전용/,
  'Studio entry panel must clearly identify its producer-only audience'
);
assert.match(
  shell,
  /@media\(max-width:600px\)[\s\S]*\.site-nav a\{[^}]*min-height:44px;[^}]*font-size:10px;/,
  'mobile navigation must keep readable text and 44px touch targets'
);

console.log('Official layout contract passed: dark canvas, single anchor offset, stable headings, balanced flow, and mobile navigation.');
