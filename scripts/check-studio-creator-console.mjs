import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const html = read('mv-studio.html');
const publicHtml = read('public/mv-studio.html');
const protectedHtml = read('public/_sf-studio-entry');
const css = read('css/mv-storyboard.css');
const publicCss = read('public/css/mv-storyboard.css');
const js = read('js/mvStoryboardStudio.js');
const publicJs = read('public/js/mvStoryboardStudio.js');
const sw = read('sf-studio-sw.js');
const publicSw = read('public/sf-studio-sw.js');
const assetVersion = '20260713-creator-console';
assert.equal(publicHtml, html, 'public/mv-studio.html must match mv-studio.html');
assert.equal(protectedHtml, html, 'public/_sf-studio-entry must match mv-studio.html');
assert.equal(publicCss, css, 'public/css/mv-storyboard.css must match css/mv-storyboard.css');
assert.equal(publicJs, js, 'public/js/mvStoryboardStudio.js must match js/mvStoryboardStudio.js');
for (const marker of ['class="mv-console-shell"','class="mv-console-rail"','class="mv-console-commandbar"','data-studio-route="home"','data-studio-route="storyboard"','data-studio-route="import"','data-studio-route="help"','class="mv-home-resume-card"','id="mv-home-project-state"','id="mv-home-quick-restore"','class="mv-home-start-grid"','https://chatgpt.com/g/g-69f6ccaad32c8191a04a7d0a850be300-anime-ost-mv-cutscene-prompt-builder','https://chatgpt.com/g/g-69f19263544881919eb0c78f0153e8c6-sunopogseu-ost-sseomneil','https://chatgpt.com/g/g-69e396ce2fa08191a9dfd1a3445875f6-sunofox-eobrodeu-seteu']) assert.ok(html.includes(marker), `missing HTML marker: ${marker}`);
for (const marker of ['--mv-console-canvas: #080b11','--mv-console-panel: #111722','--mv-console-raised: #171f2d','--mv-console-border: #293449','--mv-console-text: #f5f7fb','--mv-console-muted: #96a2b4','--mv-console-action: #8b78f6','--mv-console-bridge: #5dd8e4','--mv-console-saved: #68dca4','.mv-console-shell','.mv-console-rail','.mv-console-commandbar','grid-template-columns: 78px minmax(0, 1fr)','height: 60px','padding: 16px','@media (max-width: 760px)','height: 64px','grid-template-columns: repeat(4, minmax(0, 1fr))','height: 56px']) assert.ok(css.includes(marker), `missing CSS marker: ${marker}`);
for (const marker of [`mv-storyboard.css?v=${assetVersion}`, `mvStoryboardStudio.js?v=${assetVersion}`]) assert.ok(html.includes(marker), `missing HTML asset version: ${marker}`);
assert.ok(js.includes(`/sf-studio-sw.js?v=${assetVersion}`), 'Studio service worker registration must use Creator Console asset version');
for (const marker of ['homeProjectState:','homeQuickRestore:','consoleProjectTitle:','consoleProjectState:','function syncHomeProjectState']) assert.ok(js.includes(marker), `missing JS marker: ${marker}`);
for (const [label, source] of [['sf-studio-sw.js', sw], ['public/sf-studio-sw.js', publicSw]]) {
  for (const marker of [`sf-studio-${assetVersion}`, `mv-storyboard.css?v=${assetVersion}`, `mvStoryboardStudio.js?v=${assetVersion}`]) assert.ok(source.includes(marker), `${label} missing asset version: ${marker}`);
}
console.log('SF Studio Creator Console contract passed.');
