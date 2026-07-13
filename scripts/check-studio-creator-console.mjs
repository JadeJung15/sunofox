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
const helpTopics = [...html.matchAll(/<details class="mv-help-troubleshoot" data-help-topic="([^"]+)"( open)?>/g)];
assert.deepEqual(helpTopics.map((match) => match[1]), ['workflow-import', 'media-bridge', 'saved-project', 'export-format'], 'help must cover the four required troubleshooting topics');
assert.equal(helpTopics.filter((match) => Boolean(match[2])).length, 1, 'only the first troubleshooting item may be open by default');
for (const marker of ['증상', '확인', '해결', 'Workflow 가져오기 실패', 'SF 미디어 브릿지 연결 또는 이미지 수집 문제', '저장 프로젝트 복구 또는 초기화', '내보내기 또는 파일 형식 문제', 'SF 미디어 브릿지 1.5.23', '/extensions/sf-midjourney-bridge-v1.5.23.zip', 'data-studio-route="import"']) assert.ok(html.includes(marker), `missing help troubleshooting marker: ${marker}`);
for (const marker of ['화면별 역할', '앱 설치', '제출 후 Saved 화면 복귀']) assert.ok(html.includes(marker), `help must preserve existing operational guidance: ${marker}`);
for (const marker of ['--mv-console-canvas: #080b11','--mv-console-panel: #111722','--mv-console-raised: #171f2d','--mv-console-border: #293449','--mv-console-text: #f5f7fb','--mv-console-muted: #96a2b4','--mv-console-action: #8b78f6','--mv-console-bridge: #5dd8e4','--mv-console-saved: #68dca4','.mv-console-shell','.mv-console-rail','.mv-console-commandbar','grid-template-columns: 78px minmax(0, 1fr)','height: 60px','padding: 16px','@media (max-width: 760px)','height: 64px','grid-template-columns: repeat(4, minmax(0, 1fr))','height: 56px']) assert.ok(css.includes(marker), `missing CSS marker: ${marker}`);
for (const marker of [`mv-storyboard.css?v=${assetVersion}`, `mvStoryboardStudio.js?v=${assetVersion}`]) assert.ok(html.includes(marker), `missing HTML asset version: ${marker}`);
assert.ok(js.includes(`/sf-studio-sw.js?v=${assetVersion}`), 'Studio service worker registration must use Creator Console asset version');
for (const marker of ['homeProjectState:','homeQuickRestore:','consoleProjectTitle:','consoleProjectState:','function syncHomeProjectState','function importPreviewData(source)','function limitedImportIssues(issues, limit = 6)','function applyImportPreviewSummary(summary, targets, createElement)','function bindImportPreviewInput(textarea, render)','function renderImportPreview()','importPreviewData','limitedImportIssues','applyImportPreviewSummary','bindImportPreviewInput']) assert.ok(js.includes(marker), `missing JS marker: ${marker}`);
for (const marker of ['function applyFeedbackMessage(', 'applyFeedbackMessage']) assert.ok(js.includes(marker), `missing accessible feedback JS marker: ${marker}`);
assert.match(js, /function showError\(message\) \{[\s\S]*?applyFeedbackMessage\(els\.error, message, 'error'\);[\s\S]*?toast\(message, 'error'/, 'error path must use assertive feedback without duplicate toast announcements');
assert.doesNotMatch(js, /showError\([^;]+\);\s*toast\(/, 'a production error path must not add a second toast after showError already presents the error');
assert.doesNotMatch(js, /function setButtonBusy\(|setButtonBusy\(els\.generate|aria-busy/, 'synchronous storyboard generation must not claim an asynchronous busy state');
assert.match(js, /function setLoading\(isLoading\) \{[\s\S]*?els\.generate\.disabled = isLoading;/, 'existing loading disable behavior must remain without the fake busy helper');
for (const marker of [
  'class="mv-assist-board mv-console-workspace"',
  'data-action="toggle-cut-drawer"',
  'aria-controls="mv-console-cut-column"',
  'data-action="toggle-context-sheet"',
  'aria-controls="mv-console-context-column"',
  'data-action="close-cut-drawer" aria-label="컷 목록 닫기"',
  'data-action="close-context-sheet" aria-label="이미지 보관함 닫기"',
  'id="mv-console-cut-column"',
  'role="region" aria-labelledby="mv-console-cut-heading" aria-hidden="true" inert tabindex="-1"',
  'class="mv-assist-panel mv-console-canvas-column"',
  'id="mv-console-context-column"',
  'role="region" aria-labelledby="mv-console-context-heading" aria-hidden="true" inert tabindex="-1"',
  'function setMobileWorkspacePanels(',
  'function syncMobileWorkspaceBackground(',
  'function closeMobileWorkspacePanels(',
  'function toggleMobileWorkspacePanel(',
  'function handleMobileWorkspaceAction(',
  'function closeMobilePanelsForRoute(',
  'function handleMobileWorkspaceEscape(',
  'function handleMobileWorkspaceResize('
]) assert.ok(js.includes(marker), `missing storyboard workspace JS marker: ${marker}`);
for (const marker of [
  '.mv-console-mobile-actions',
  'grid-template-columns: 220px minmax(460px, 1fr) minmax(300px, 36%)',
  '.mv-console-cut-column',
  '.mv-console-canvas-column',
  '.mv-console-context-column',
  'body.mv-cut-drawer-open',
  'body.mv-context-sheet-open',
  'body.mv-mobile-panel-open',
  'max-height: 72vh'
]) assert.ok(css.includes(marker), `missing storyboard workspace CSS marker: ${marker}`);
for (const marker of ['.mv-help-troubleshoot', '.mv-console-shell :focus-visible', '@media (prefers-reduced-motion: reduce)', 'scroll-behavior: auto !important']) assert.ok(css.includes(marker), `missing help/accessibility CSS marker: ${marker}`);
assert.match(js, /if \(action === 'assist-cut'\) \{[\s\S]*?const restoreCutDrawerFocus = [^;]+;[\s\S]*?closeMobileWorkspacePanels\(\);[\s\S]*?renderAssist\(\);[\s\S]*?restoreCutDrawerFocus[\s\S]*?toggle-cut-drawer[\s\S]*?focus/, 'cut selection must restore focus to the newly rendered drawer trigger');
assert.ok(js.includes('closeMobilePanelsForRoute(state.studioRoute)'), 'route changes must use the mobile panel cleanup helper');
assert.match(js, /if \(event\.key === 'Escape'\) \{\s*handleMobileWorkspaceEscape\(event\);/, 'Escape must use the mobile panel cleanup helper');
assert.ok(js.includes("window.addEventListener('resize', handleMobileWorkspaceResize)"), 'desktop resize cleanup must be registered');
const creatorConsoleCssStart = css.indexOf('/* Creator Console storyboard workspace. */');
const mobileWorkspaceCssStart = css.indexOf('@media (max-width: 1180px)', creatorConsoleCssStart);
const mobileWorkspaceCssEnd = css.indexOf('@media (prefers-reduced-motion: reduce)', mobileWorkspaceCssStart);
assert.ok(creatorConsoleCssStart >= 0 && mobileWorkspaceCssStart > creatorConsoleCssStart && mobileWorkspaceCssEnd > mobileWorkspaceCssStart, 'Creator Console mobile workspace media block must be bounded');
const mobileWorkspaceCss = css.slice(mobileWorkspaceCssStart, mobileWorkspaceCssEnd);
const cutDrawerRule = mobileWorkspaceCss.match(/\.mv-console-workspace\s*>\s*\.mv-console-cut-column\s*\{([\s\S]*?)\}/)?.[1] || '';
assert.match(cutDrawerRule, /display:\s*none;/, 'closed mobile cut drawer must be removed from focus and layout');
assert.match(cutDrawerRule, /inset:\s*60px 0 64px 0;/, 'mobile cut drawer must fill the workspace between app bars');
assert.match(cutDrawerRule, /position:\s*fixed;/, 'mobile cut drawer must use fixed workspace positioning');
assert.doesNotMatch(cutDrawerRule, /max-width|translateX/, 'mobile cut drawer must not retain the narrow sliding rail layout');
assert.match(mobileWorkspaceCss, /body\.mv-cut-drawer-open\s+\.mv-console-cut-column\s*\{\s*display:\s*block;/, 'open mobile cut drawer must become visible');
assert.match(css, /\.mv-console-panel-close\s*\{[\s\S]*?display:\s*none;/, 'mobile panel close controls must be hidden on desktop');
assert.match(mobileWorkspaceCss, /\.mv-console-panel-close\s*\{[\s\S]*?display:\s*inline-flex;[\s\S]*?min-height:\s*44px;/, 'mobile panel close controls must be visible and touch safe');
const legacyDesktopAssistIndex = css.lastIndexOf('/* v6.7.137 sticky storyboard workspace. */');
const creatorDesktopOverrideIndex = css.lastIndexOf('/* Creator Console desktop collision override. */');
assert.ok(creatorDesktopOverrideIndex > legacyDesktopAssistIndex, 'Creator Console desktop collision override must follow legacy assist rules');
const creatorDesktopOverride = css.slice(creatorDesktopOverrideIndex);
assert.match(creatorDesktopOverride, /\.mv-assist-board\.mv-console-workspace\s*\{[\s\S]*?height:\s*auto\s*!important;[\s\S]*?max-height:\s*none\s*!important;[\s\S]*?overflow:\s*visible\s*!important;/, 'Creator Console desktop workspace must override legacy clipping');
assert.match(creatorDesktopOverride, /\.mv-studio:not\(\.is-basic\)\s+\.mv-console-workspace\s*>\s*\.mv-console-cut-column\s*\{[\s\S]*?overflow:\s*auto;/, 'advanced desktop cut column must retain internal scrolling');
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
assert.equal(typeof savedProjectTools?.setMobileWorkspacePanels, 'function', 'mobile workspace state helper test hook is required');
assert.equal(typeof savedProjectTools?.toggleMobileWorkspacePanel, 'function', 'mobile workspace toggle helper test hook is required');
assert.equal(typeof savedProjectTools?.closeMobileWorkspacePanels, 'function', 'mobile workspace close helper test hook is required');
assert.equal(typeof savedProjectTools?.handleMobileWorkspaceAction, 'function', 'mobile workspace delegated action helper test hook is required');
assert.equal(typeof savedProjectTools?.closeMobilePanelsForRoute, 'function', 'mobile workspace route cleanup helper test hook is required');
assert.equal(typeof savedProjectTools?.handleMobileWorkspaceEscape, 'function', 'mobile workspace Escape helper test hook is required');
assert.equal(typeof savedProjectTools?.handleMobileWorkspaceResize, 'function', 'mobile workspace resize helper test hook is required');
assert.equal(typeof savedProjectTools?.applyFeedbackMessage, 'function', 'feedback DOM helper test hook is required');
assert.equal(typeof savedProjectTools?.clearFeedbackMessage, 'function', 'feedback clear helper test hook is required');

const makeFeedbackElement = () => ({
  textContent: 'old',
  attributes: {},
  setAttribute(name, value) { this.attributes[name] = String(value); },
  removeAttribute(name) { delete this.attributes[name]; }
});
const infoFeedback = makeFeedbackElement();
savedProjectTools.applyFeedbackMessage(infoFeedback, '저장 완료', 'info', (callback) => callback());
assert.equal(infoFeedback.attributes.role, 'status', 'information feedback must use status semantics');
assert.equal(infoFeedback.attributes['aria-live'], 'polite', 'information feedback must announce politely');
assert.equal(infoFeedback.textContent, '저장 완료', 'information feedback must update through the announcement helper');
const errorFeedback = makeFeedbackElement();
savedProjectTools.applyFeedbackMessage(errorFeedback, '가져오기 실패', 'error', (callback) => callback());
assert.equal(errorFeedback.attributes.role, 'alert', 'error feedback must use alert semantics');
assert.equal(errorFeedback.attributes['aria-live'], 'assertive', 'error feedback must announce assertively');
assert.equal(errorFeedback.textContent, '가져오기 실패', 'error feedback must update through the announcement helper');
const queuedFeedback = makeFeedbackElement();
const queuedCallbacks = [];
savedProjectTools.applyFeedbackMessage(queuedFeedback, '오래된 메시지', 'info', (callback) => queuedCallbacks.push(callback));
savedProjectTools.clearFeedbackMessage(queuedFeedback);
queuedCallbacks[0]();
assert.equal(queuedFeedback.textContent, '', 'cleared feedback must ignore a stale scheduled announcement');


const mobileClasses = new Set();
const mobileClassList = {
  toggle(name, enabled) { enabled ? mobileClasses.add(name) : mobileClasses.delete(name); },
  contains(name) { return mobileClasses.has(name); }
};
const mobileButtons = {
  cut: { attributes: {}, textContent: '', focusCount: 0, setAttribute(name, value) { this.attributes[name] = String(value); }, focus() { this.focusCount += 1; } },
  context: { attributes: {}, textContent: '', focusCount: 0, setAttribute(name, value) { this.attributes[name] = String(value); }, focus() { this.focusCount += 1; } }
};
const makeMobilePanel = () => ({
  attributes: {},
  inert: false,
  focusCount: 0,
  firstFocusable: { focusCount: 0, focus() { this.focusCount += 1; } },
  setAttribute(name, value) { this.attributes[name] = String(value); },
  removeAttribute(name) { delete this.attributes[name]; },
  toggleAttribute(name, enabled) { enabled ? this.attributes[name] = '' : delete this.attributes[name]; },
  querySelector() { return this.firstFocusable; },
  focus() { this.focusCount += 1; }
});
const mobilePanels = {
  cut: makeMobilePanel(),
  context: makeMobilePanel()
};
const makeMobileBackground = () => ({
  attributes: {},
  inert: false,
  toggleAttribute(name, enabled) { enabled ? this.attributes[name] = '' : delete this.attributes[name]; }
});
const mobileBackgrounds = {
  overview: makeMobileBackground(),
  actions: makeMobileBackground(),
  canvas: makeMobileBackground()
};
const mobileShellBackgrounds = {
  rail: makeMobileBackground(),
  commandbar: makeMobileBackground(),
  input: makeMobileBackground(),
  toolbar: makeMobileBackground(),
  storage: makeMobileBackground()
};
const allMobileBackgrounds = () => [...Object.values(mobileBackgrounds), ...Object.values(mobileShellBackgrounds)];
const mobileActiveElement = { blurCount: 0, blur() { this.blurCount += 1; } };
mobilePanels.cut.contains = (element) => element === mobileActiveElement;
mobilePanels.context.contains = () => false;
const mobileWorkspaceContext = {
  body: { classList: mobileClassList },
  isMobile: true,
  activeElement: null,
  surface: {
    querySelectorAll(selector) {
      if (selector.includes('.mv-console-rail') && selector.includes('.mv-console-commandbar') && selector.includes('.mv-studio > .mv-input')) {
        return Object.values(mobileShellBackgrounds);
      }
      return [];
    }
  },
  root: {
    querySelector(selector) {
      if (selector.includes('toggle-cut-drawer')) return mobileButtons.cut;
      if (selector.includes('toggle-context-sheet')) return mobileButtons.context;
      if (selector === '#mv-console-cut-column') return mobilePanels.cut;
      if (selector === '#mv-console-context-column') return mobilePanels.context;
      return null;
    },
    querySelectorAll(selector) {
      if (selector.includes('.mv-console-workspace > .mv-progress-card') && selector.includes('.mv-console-mobile-actions') && selector.includes('.mv-console-canvas-column')) {
        return Object.values(mobileBackgrounds);
      }
      return [];
    }
  }
};
savedProjectTools.setMobileWorkspacePanels({ cut: false, context: false }, mobileWorkspaceContext);
assert.equal(mobilePanels.cut.inert, true, 'closed cut drawer must be inert');
assert.equal(mobilePanels.cut.attributes['aria-hidden'], 'true', 'closed cut drawer must be hidden from accessibility tree');
assert.equal(mobilePanels.context.inert, true, 'closed context sheet must be inert');
assert.equal(mobilePanels.context.attributes['aria-hidden'], 'true', 'closed context sheet must be hidden from accessibility tree');
assert.ok(allMobileBackgrounds().every((item) => item.inert === false), 'closed workspace must keep background controls active');
savedProjectTools.setMobileWorkspacePanels({ cut: true, context: false }, mobileWorkspaceContext, { focusOpen: true });
assert.equal(mobileClassList.contains('mv-cut-drawer-open'), true, 'cut drawer state must add its body class');
assert.equal(mobileClassList.contains('mv-context-sheet-open'), false, 'closed context sheet must omit its body class');
assert.equal(mobileClassList.contains('mv-mobile-panel-open'), true, 'any open mobile panel must lock body scrolling');
assert.equal(mobileButtons.cut.attributes['aria-expanded'], 'true', 'cut drawer trigger must expose expanded state');
assert.equal(mobileButtons.context.attributes['aria-expanded'], 'false', 'context trigger must expose collapsed state');
assert.equal(mobileButtons.cut.textContent, '컷 목록 닫기', 'open cut drawer trigger must use its close label');
assert.equal(mobilePanels.cut.inert, false, 'open cut drawer must not be inert');
assert.equal(mobilePanels.cut.attributes['aria-hidden'], 'false', 'open cut drawer must be exposed to accessibility tree');
assert.equal(mobilePanels.cut.firstFocusable.focusCount, 1, 'opening cut drawer must focus its first control');
assert.equal(mobilePanels.context.inert, true, 'opening cut drawer must keep context sheet inert');
assert.ok(allMobileBackgrounds().every((item) => item.inert === true), 'open cut drawer must isolate all background workspace and shell controls');
assert.equal(mobilePanels.cut.attributes.role, 'dialog', 'open mobile cut drawer must use dialog semantics');
assert.equal(mobilePanels.cut.attributes['aria-modal'], 'true', 'open mobile cut drawer must announce modal isolation');
assert.equal(savedProjectTools.handleMobileWorkspaceAction('close-cut-drawer', mobileWorkspaceContext), true, 'internal cut close action must be handled');
assert.equal(mobileClassList.contains('mv-cut-drawer-open'), false, 'internal cut close action must remove its body class');
assert.equal(mobilePanels.cut.inert, true, 'internal cut close action must make its panel inert');
assert.equal(mobilePanels.cut.attributes['aria-hidden'], 'true', 'internal cut close action must hide its panel from accessibility tree');
assert.ok(allMobileBackgrounds().every((item) => item.inert === false), 'internal cut close action must restore background controls');
assert.equal(mobileButtons.cut.focusCount, 1, 'internal cut close action must restore its external trigger focus');

savedProjectTools.setMobileWorkspacePanels({ cut: true }, mobileWorkspaceContext);
savedProjectTools.setMobileWorkspacePanels({ context: true }, mobileWorkspaceContext, { focusOpen: true });
assert.equal(mobileClassList.contains('mv-cut-drawer-open'), false, 'opening context sheet must close the cut drawer');
assert.equal(mobileClassList.contains('mv-context-sheet-open'), true, 'context toggle must open the context sheet');
assert.equal(mobilePanels.cut.inert, true, 'opening context sheet must make cut drawer inert');
assert.equal(mobilePanels.cut.attributes['aria-hidden'], 'true', 'opening context sheet must hide cut drawer from accessibility tree');
assert.equal(mobilePanels.context.inert, false, 'opening context sheet must remove inert');
assert.equal(mobilePanels.context.attributes['aria-hidden'], 'false', 'opening context sheet must expose it to accessibility tree');
assert.equal(mobilePanels.context.firstFocusable.focusCount, 1, 'opening context sheet must focus its first control');
assert.ok(allMobileBackgrounds().every((item) => item.inert === true), 'open context sheet must keep all background workspace and shell controls isolated');
assert.equal(mobilePanels.context.attributes.role, 'dialog', 'open mobile context sheet must use dialog semantics');
assert.equal(mobilePanels.context.attributes['aria-modal'], 'true', 'open mobile context sheet must announce modal isolation');
assert.equal(savedProjectTools.handleMobileWorkspaceAction('close-context-sheet', mobileWorkspaceContext), true, 'internal context close action must be handled');
assert.equal(mobileClassList.contains('mv-cut-drawer-open'), false, 'close helper must close the cut drawer');
assert.equal(mobileClassList.contains('mv-context-sheet-open'), false, 'close helper must close the context sheet');
assert.equal(mobileClassList.contains('mv-mobile-panel-open'), false, 'close helper must release body scrolling');
assert.equal(mobileButtons.cut.attributes['aria-expanded'], 'false', 'close helper must reset cut trigger state');
assert.equal(mobileButtons.context.attributes['aria-expanded'], 'false', 'close helper must reset context trigger state');
assert.equal(mobileButtons.context.focusCount, 1, 'internal context close action must restore focus to its trigger');
assert.ok(allMobileBackgrounds().every((item) => item.inert === false), 'closing panels must restore background workspace and shell controls');
assert.equal(mobilePanels.context.attributes.role, 'region', 'closed context panel must return to desktop-safe region semantics');
assert.equal(mobilePanels.context.attributes['aria-modal'], undefined, 'closed context panel must remove aria-modal');

savedProjectTools.setMobileWorkspacePanels({ cut: true }, mobileWorkspaceContext);
assert.equal(savedProjectTools.closeMobilePanelsForRoute('storyboard', mobileWorkspaceContext), false, 'storyboard route must preserve its open mobile panel');
assert.equal(mobileClassList.contains('mv-cut-drawer-open'), true, 'storyboard route must keep the drawer open');
mobileWorkspaceContext.activeElement = mobileActiveElement;
assert.equal(savedProjectTools.closeMobilePanelsForRoute('help', mobileWorkspaceContext), true, 'leaving storyboard must report panel cleanup');
assert.equal(mobileClassList.contains('mv-cut-drawer-open'), false, 'route cleanup must remove the drawer body class');
assert.equal(mobileButtons.cut.attributes['aria-expanded'], 'false', 'route cleanup must reset drawer aria-expanded');
assert.equal(mobileButtons.cut.textContent, '컷 목록 열기', 'route cleanup must reset drawer label');
assert.equal(mobileActiveElement.blurCount, 1, 'route cleanup must release focus held inside a panel that becomes inert');
assert.ok(allMobileBackgrounds().every((item) => item.inert === false), 'route cleanup must restore background workspace and shell controls');
mobileWorkspaceContext.activeElement = null;

savedProjectTools.setMobileWorkspacePanels({ context: true }, mobileWorkspaceContext);
let escapePrevented = 0;
const escapeEvent = { key: 'Escape', preventDefault() { escapePrevented += 1; } };
assert.equal(savedProjectTools.handleMobileWorkspaceEscape(escapeEvent, mobileWorkspaceContext), true, 'Escape must report closing an open panel');
assert.equal(escapePrevented, 1, 'Escape must prevent default when it closes a panel');
assert.equal(mobileClassList.contains('mv-context-sheet-open'), false, 'Escape must remove the context body class');
assert.equal(mobileButtons.context.attributes['aria-expanded'], 'false', 'Escape must reset context aria-expanded');
assert.equal(mobileButtons.context.textContent, '이미지 보관함 열기', 'Escape must reset context trigger label');
assert.equal(mobileButtons.context.focusCount, 2, 'Escape must restore focus to the context trigger');
assert.ok(allMobileBackgrounds().every((item) => item.inert === false), 'Escape must restore background workspace and shell controls');

savedProjectTools.setMobileWorkspacePanels({ cut: true }, mobileWorkspaceContext);
assert.equal(savedProjectTools.handleMobileWorkspaceResize({ currentTarget: { innerWidth: 1180 } }, mobileWorkspaceContext), false, 'mobile resize must preserve the open panel');
assert.equal(mobileClassList.contains('mv-cut-drawer-open'), true, 'mobile width must keep the drawer open');
assert.equal(savedProjectTools.handleMobileWorkspaceResize({ currentTarget: { innerWidth: 1181 } }, mobileWorkspaceContext), true, 'desktop resize must report panel cleanup');
assert.equal(mobileClassList.contains('mv-cut-drawer-open'), false, 'desktop resize must remove the drawer body class');
assert.equal(mobileButtons.cut.attributes['aria-expanded'], 'false', 'desktop resize must reset drawer aria-expanded');
assert.equal(mobileButtons.cut.textContent, '컷 목록 열기', 'desktop resize must reset drawer label');
assert.equal(mobilePanels.cut.inert, false, 'desktop resize must expose the visible cut column');
assert.equal(mobilePanels.cut.attributes['aria-hidden'], 'false', 'desktop resize must return cut column to accessibility tree');
assert.equal(mobilePanels.context.inert, false, 'desktop resize must expose the visible context column');
assert.equal(mobilePanels.context.attributes['aria-hidden'], 'false', 'desktop resize must return context column to accessibility tree');
assert.ok(allMobileBackgrounds().every((item) => item.inert === false), 'desktop resize must restore all background workspace and shell controls');
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
