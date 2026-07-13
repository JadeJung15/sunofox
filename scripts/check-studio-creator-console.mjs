import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
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
for (const marker of ['class="mv-console-shell"','class="mv-console-rail"','class="mv-console-commandbar"','data-studio-route="home"','data-studio-route="storyboard"','data-studio-route="import"','data-studio-route="help"','class="mv-home-resume-card"','id="mv-home-project-state"','id="mv-home-quick-restore"','class="mv-home-start-grid"','id="mv-import-preview"','id="mv-import-preview-status"','id="mv-import-preview-meta"','id="mv-import-preview-issues"','https://chatgpt.com/g/g-69f6ccaad32c8191a04a7d0a850be300-anime-ost-mv-cutscene-prompt-builder','https://chatgpt.com/g/g-69f19263544881919eb0c78f0153e8c6-sunopogseu-ost-sseomneil','https://chatgpt.com/g/g-69e396ce2fa08191a9dfd1a3445875f6-sunofox-eobrodeu-seteu']) assert.ok(html.includes(marker), `missing HTML marker: ${marker}`);
assert.ok(html.includes('id="mv-import-preview-status" aria-live="polite"'), 'import preview status must own the polite live region');
assert.ok(!/<section[^>]*id="mv-import-preview"[^>]*aria-live=/i.test(html), 'import preview section must not announce every DOM change');
for (const marker of ['--mv-console-canvas: #080b11','--mv-console-panel: #111722','--mv-console-raised: #171f2d','--mv-console-border: #293449','--mv-console-text: #f5f7fb','--mv-console-muted: #96a2b4','--mv-console-action: #8b78f6','--mv-console-bridge: #5dd8e4','--mv-console-saved: #68dca4','.mv-console-shell','.mv-console-rail','.mv-console-commandbar','grid-template-columns: 78px minmax(0, 1fr)','height: 60px','padding: 16px','@media (max-width: 760px)','height: 64px','grid-template-columns: repeat(4, minmax(0, 1fr))','height: 56px']) assert.ok(css.includes(marker), `missing CSS marker: ${marker}`);
for (const marker of [`mv-storyboard.css?v=${assetVersion}`, `mvStoryboardStudio.js?v=${assetVersion}`]) assert.ok(html.includes(marker), `missing HTML asset version: ${marker}`);
assert.ok(js.includes(`/sf-studio-sw.js?v=${assetVersion}`), 'Studio service worker registration must use Creator Console asset version');
for (const marker of ['homeProjectState:','homeQuickRestore:','consoleProjectTitle:','consoleProjectState:','function syncHomeProjectState','function importPreviewData(source)','function limitedImportIssues(issues, limit = 6)','function applyImportPreviewSummary(summary, targets, createElement)','function bindImportPreviewInput(textarea, render)','function renderImportPreview()','importPreviewData','limitedImportIssues','applyImportPreviewSummary','bindImportPreviewInput']) assert.ok(js.includes(marker), `missing JS marker: ${marker}`);
for (const [label, source] of [['sf-studio-sw.js', sw], ['public/sf-studio-sw.js', publicSw]]) {
  for (const marker of [`sf-studio-${assetVersion}`, `mv-storyboard.css?v=${assetVersion}`, `mvStoryboardStudio.js?v=${assetVersion}`]) assert.ok(source.includes(marker), `${label} missing asset version: ${marker}`);
}

const storage = new Map();
const sandbox = {
  console,
  setTimeout,
  clearTimeout,
  navigator: {},
  localStorage: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key)
  },
  sessionStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  },
  document: {
    addEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    createElement: () => ({ style: {}, click: () => {}, remove: () => {} }),
    body: { appendChild: () => {} }
  },
  window: {
    addEventListener: () => {},
    removeEventListener: () => {},
    setTimeout,
    clearTimeout,
    location: {
      origin: 'http://127.0.0.1',
      pathname: '/mv-studio',
      search: '',
      hash: '',
      assign: () => {}
    }
  }
};
sandbox.window.window = sandbox.window;
sandbox.window.document = sandbox.document;
sandbox.window.navigator = sandbox.navigator;
sandbox.window.localStorage = sandbox.localStorage;
sandbox.window.sessionStorage = sandbox.sessionStorage;
sandbox.globalThis = sandbox;
vm.runInNewContext(js, sandbox, { filename: 'js/mvStoryboardStudio.js' });

const savedProjectTools = sandbox.window.SFStudioImportTools;
assert.equal(typeof savedProjectTools?.readSavedProjectForTest, 'function', 'saved project read test hook is required');
assert.equal(typeof savedProjectTools?.importPreviewData, 'function', 'import preview summary test hook is required');
assert.equal(typeof savedProjectTools?.limitedImportIssues, 'function', 'limited import issues test hook is required');
assert.equal(typeof savedProjectTools?.applyImportPreviewSummary, 'function', 'import preview DOM apply test hook is required');
assert.equal(typeof savedProjectTools?.bindImportPreviewInput, 'function', 'import preview input binding test hook is required');
const emptyPreview = savedProjectTools.importPreviewData('');
assert.equal(emptyPreview.title, '—', 'empty preview must use the empty project title');
assert.equal(emptyPreview.cutCount, 0, 'empty preview must contain no cuts');
assert.equal(emptyPreview.issueCount, 0, 'empty preview must contain no issues');
assert.equal(emptyPreview.status, 'Workflow MD를 입력하면 컷 구성을 검사합니다.', 'empty preview must show guidance');
assert.ok(Array.isArray(emptyPreview.issues), 'empty preview issues must be an array');

const validWorkflowPreview = savedProjectTools.importPreviewData(`---
sf_studio_md_version: 2
project: 테스트 프로젝트
---

## Cut 01
time: 00:00.00~00:03.00
### midjourney_prompt
anime cinematic opening
### grok_prompt
camera pushes forward
`);
assert.equal(validWorkflowPreview.title, '테스트 프로젝트', 'workflow preview must expose project metadata');
assert.equal(validWorkflowPreview.cutCount, 1, 'workflow preview must count parsed cuts');
assert.equal(validWorkflowPreview.issueCount, 0, 'valid workflow preview must contain no issues');

const invalidWorkflowPreview = savedProjectTools.importPreviewData(`---
sf_studio_md_version: 2
project: 오류 프로젝트
---

## Cut 01
scene: 필수 필드 누락
`);
assert.equal(invalidWorkflowPreview.cutCount, 1, 'invalid workflow preview must preserve valid cut headings');
assert.equal(invalidWorkflowPreview.issueCount, 3, 'invalid one-cut workflow must contain three unique issues');
assert.equal(JSON.stringify(invalidWorkflowPreview.issues), JSON.stringify([
  'Cut 01: time 값이 없습니다.',
  'Cut 01: Midjourney 프롬프트가 없습니다.',
  'Cut 01: Grok 프롬프트가 없습니다.'
]), 'cut issues must use the same canonical display as global workflow issues');
assert.ok(invalidWorkflowPreview.issues.every((issue) => typeof issue === 'string'), 'preview issues must be strings');

const duplicateCutPreview = savedProjectTools.importPreviewData(`---
sf_studio_md_version: 2
project: 중복 컷 프로젝트
---

## Cut 01
time: 00:00.00~00:03.00
### midjourney_prompt
first image
### grok_prompt
first video

## Cut 01
time: 00:03.00~00:06.00
### midjourney_prompt
second image
### grok_prompt
second video
`);
assert.equal(duplicateCutPreview.issueCount, 1, 'duplicate cut number must produce one semantic preview issue');
assert.equal(JSON.stringify(duplicateCutPreview.issues), JSON.stringify([
  'Cut 01: 번호가 중복되었습니다.'
]), 'duplicate cut number variants must share one canonical display');

const separateCutPreview = savedProjectTools.importPreviewData(`---
sf_studio_md_version: 2
project: 컷 구분 프로젝트
---

## Cut 01
### midjourney_prompt
first image
### grok_prompt
first video

## Cut 02
### midjourney_prompt
second image
### grok_prompt
second video
`);
assert.equal(JSON.stringify(separateCutPreview.issues), JSON.stringify([
  'Cut 01: time 값이 없습니다.',
  'Cut 02: time 값이 없습니다.'
]), 'the same issue on different cut numbers must remain separate');

const limitedIssues = savedProjectTools.limitedImportIssues([
  '오류 1', '오류 2', '오류 3', '오류 4', '오류 5', '오류 6', '오류 7'
]);
assert.equal(limitedIssues.length, 6, 'limited issue list must never exceed six entries');
assert.equal(limitedIssues[5], '외 2개', 'limited issue list must summarize all remaining errors');

const previewTargets = {
  status: { textContent: '' },
  meta: { innerHTML: '' },
  issues: {
    children: [],
    replaceChildren() { this.children = []; },
    appendChild(item) { this.children.push(item); }
  }
};
savedProjectTools.applyImportPreviewSummary({
  title: '<img src=x onerror=1>',
  cutCount: 2,
  issueCount: 7,
  status: '2개 컷을 찾았습니다.',
  issues: ['<b>오류 1</b>', '오류 2', '오류 3', '오류 4', '오류 5', '오류 6', '오류 7']
}, previewTargets, () => ({ textContent: '' }));
assert.equal(previewTargets.status.textContent, '2개 컷을 찾았습니다.', 'DOM apply must update status text');
assert.ok(previewTargets.meta.innerHTML.includes('&lt;img src=x onerror=1&gt;'), 'DOM apply must escape malicious project markup');
assert.ok(!previewTargets.meta.innerHTML.includes('<img'), 'DOM apply must not render a raw malicious project tag');
assert.equal(previewTargets.issues.children.length, 6, 'DOM apply must render at most six issue rows');
assert.equal(previewTargets.issues.children[0].textContent, '<b>오류 1</b>', 'DOM apply must assign issue content through textContent');
assert.equal(previewTargets.issues.children[0].innerHTML, undefined, 'DOM apply must not assign issue innerHTML');
assert.equal(previewTargets.issues.children[5].textContent, '외 2개', 'DOM apply must render the remaining issue summary');

const inputListeners = new Map();
const fakeTextarea = {
  addEventListener(type, listener) { inputListeners.set(type, listener); },
  dispatchEvent(event) { inputListeners.get(event.type)?.(event); }
};
let inputRenderCount = 0;
savedProjectTools.bindImportPreviewInput(fakeTextarea, () => { inputRenderCount += 1; });
assert.equal(typeof inputListeners.get('input'), 'function', 'input binding must register an input listener');
fakeTextarea.dispatchEvent({ type: 'input' });
assert.equal(inputRenderCount, 1, 'input dispatch must invoke preview rendering');

const legacyPreview = savedProjectTools.importPreviewData(`## Cut 01
\`\`\`text
anime heroine under moonlight --ar 16:9
\`\`\``);
assert.equal(legacyPreview.title, '제목 없음', 'legacy MJ Markdown preview must use the fallback title');
assert.equal(legacyPreview.cutCount, 1, 'legacy MJ Markdown preview must count parsed cuts');
const savedProjectStorageKey = 'webling_mv_studio_saved_project_v1';
const readStoredProject = (raw) => {
  if (raw === null) storage.delete(savedProjectStorageKey);
  else storage.set(savedProjectStorageKey, raw);
  return savedProjectTools.readSavedProjectForTest();
};
for (const [label, raw] of [
  ['null storage', null],
  ['invalid JSON', '{invalid'],
  ['string cuts', JSON.stringify({ storyboard: { cuts: '12' } })],
  ['object length cuts', JSON.stringify({ storyboard: { cuts: { length: 2 } } })],
  ['null cut', JSON.stringify({ storyboard: { cuts: [null] } })],
  ['string cut number', JSON.stringify({ storyboard: { cuts: [{ number: '1' }] } })],
  ['spaced string cut number', JSON.stringify({ storyboard: { cuts: [{ number: ' 2 ' }] } })],
  ['boolean cut number', JSON.stringify({ storyboard: { cuts: [{ number: true }] } })]
]) {
  assert.equal(readStoredProject(raw), null, `${label} must be rejected`);
}
const validProject = readStoredProject(JSON.stringify({ storyboard: { cuts: [{ number: 1 }] } }));
assert.equal(validProject?.storyboard?.cuts?.[0]?.number, 1, 'valid saved project must be returned unchanged');
console.log('SF Studio Creator Console contract passed.');
