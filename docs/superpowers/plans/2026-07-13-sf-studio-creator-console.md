# SF Studio Creator Console Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 저장 데이터와 SF 미디어 브릿지 1.5.23 동작을 보존하면서 SF 홈, Workflow 가져오기, 콘티 제작, 사용방법을 현대적인 Creator Console UI로 통합한다.

**Architecture:** `mv-studio.html`의 기존 화면과 DOM ID를 유지하면서 공통 좌측 레일과 상단 명령 바를 추가하고, `css/mv-storyboard.css` 끝에 SF Studio 전용 Creator Console 토큰과 레이아웃 규칙을 추가한다. 동작 변경은 `js/mvStoryboardStudio.js`의 기존 라우팅, 저장, 렌더 함수에 작은 상태 동기화 함수를 연결하는 방식으로 제한하며, 루트 파일과 `public/` 복사본을 각 작업에서 함께 동기화한다.

**Tech Stack:** 정적 HTML, CSS, 바닐라 JavaScript, Astro 5 빌드, Cloudflare Pages, Node.js 계약 검사

---

## 사전 조건과 범위

- 구현 시작 전 `git branch --show-current`, `git status --short --branch`, `git log -1 --oneline`, `git remote -v`를 실행한다.
- 현재 문서 커밋 `429a634`를 기준으로 시작하되, 원격 변경이 있으면 먼저 상태를 다시 확인한다.
- `.superpowers/`는 비교 시안용 미추적 폴더이므로 어떤 제품 커밋에도 포함하지 않는다.
- React, Radix, HeroUI, Framer Motion, daisyUI 또는 신규 UI 의존성을 설치하지 않는다.
- `localStorage`, `IndexedDB`, `sessionStorage`, 휴대용 JSON 백업 포맷은 변경하지 않는다.
- Bridge manifest, 권한, 소스 상수, ZIP과 버전 `1.5.23`은 변경하지 않는다.
- Cloudflare Pages 수동 배포는 실행하지 않는다. 검증된 `main` 푸시에 따른 자동 배포만 사용한다.

## 파일 구조

| 파일 | 책임 |
|---|---|
| `mv-studio.html` | SF Studio 정본 마크업과 공통 Creator Console 셸 |
| `public/mv-studio.html` | 빌드 입력용 공개 복사본, 정본 HTML과 바이트 수준 동기화 |
| `css/mv-storyboard.css` | 기존 스타일과 Creator Console 토큰·데스크톱·모바일 레이아웃 |
| `public/css/mv-storyboard.css` | 공개 CSS 복사본, 정본 CSS와 바이트 수준 동기화 |
| `js/mvStoryboardStudio.js` | 기존 라우팅·저장·렌더링과 신규 UI 상태 동기화 |
| `public/js/mvStoryboardStudio.js` | 공개 JavaScript 복사본, 정본 JS와 바이트 수준 동기화 |
| `scripts/check-studio-creator-console.mjs` | Creator Console 마크업, 스타일, JS 훅, 루트/공개 복사본 계약 검사 |
| `package.json` | 신규 계약 검사를 개별 및 전체 검사에 연결 |
| `sf-studio-sw.js` | 로컬 정적 실행용 Studio 캐시 키와 자산 버전 |
| `public/sf-studio-sw.js` | Cloudflare 빌드용 Studio 캐시 키와 자산 버전 |
| `scripts/check-dist-integrity.mjs` | Studio 자산 버전 계약 갱신 |

## Task 1: Creator Console 계약 검사와 공통 셸

**Files:**
- Create: `scripts/check-studio-creator-console.mjs`
- Modify: `package.json`
- Modify: `mv-studio.html:38-72`
- Modify: `public/mv-studio.html:38-72`
- Modify: `css/mv-storyboard.css:1-260, end of file`
- Modify: `public/css/mv-storyboard.css:1-260, end of file`

- [ ] **Step 1: 신규 셸이 없으면 실패하는 계약 검사를 작성한다**

```js
// scripts/check-studio-creator-console.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const html = read('mv-studio.html');
const publicHtml = read('public/mv-studio.html');
const css = read('css/mv-storyboard.css');
const publicCss = read('public/css/mv-storyboard.css');
const js = read('js/mvStoryboardStudio.js');
const publicJs = read('public/js/mvStoryboardStudio.js');

assert.equal(publicHtml, html, 'public/mv-studio.html must match mv-studio.html');
assert.equal(publicCss, css, 'public/css/mv-storyboard.css must match css/mv-storyboard.css');
assert.equal(publicJs, js, 'public/js/mvStoryboardStudio.js must match js/mvStoryboardStudio.js');

for (const marker of [
  'class="mv-console-shell"',
  'class="mv-console-rail"',
  'class="mv-console-commandbar"',
  'data-studio-route="home"',
  'data-studio-route="storyboard"',
  'data-studio-route="import"',
  'data-studio-route="help"'
]) assert.ok(html.includes(marker), `missing HTML marker: ${marker}`);

for (const marker of [
  '--mv-console-canvas: #080b11',
  '--mv-console-panel: #111722',
  '--mv-console-action: #8b78f6',
  '.mv-console-shell',
  '.mv-console-rail',
  '.mv-console-commandbar'
]) assert.ok(css.includes(marker), `missing CSS marker: ${marker}`);

console.log('SF Studio Creator Console contract passed.');
```

- [ ] **Step 2: 검사 명령을 패키지 스크립트에 연결한다**

```json
"check:studio-console": "node scripts/check-studio-creator-console.mjs"
```

`check` 체인에서 `check:workflow-import` 바로 뒤에 `npm run check:studio-console`을 추가한다.

- [ ] **Step 3: 계약 검사가 실패하는지 확인한다**

Run: `npm run check:studio-console`

Expected: FAIL with `missing HTML marker: class="mv-console-shell"`.

- [ ] **Step 4: 기존 상단 영역을 공통 셸로 감싸고 기존 라우트 링크를 보존한다**

`mv-page-shell` 내부의 기존 `mv-topbar`와 `mv-section-nav`를 아래 구조로 교체하고, 기존 `main#view-mv-storyboard`는 `mv-console-content` 안에 둔다.

```html
<div class="mv-console-shell">
  <aside class="mv-console-rail" aria-label="SF Studio 주요 메뉴">
    <a class="mv-console-logo" href="/mv-studio" data-studio-route="home" aria-label="SF Studio 홈">SF</a>
    <nav class="mv-console-nav" aria-label="SF Studio 카테고리">
      <a class="active" href="/mv-studio" data-studio-route="home"><strong>홈</strong><span>시작</span></a>
      <a href="/mv-studio/storyboard" data-studio-route="storyboard"><strong>콘티</strong><span>제작</span></a>
      <a href="/mv-studio/import" data-studio-route="import"><strong>가져오기</strong><span>Workflow</span></a>
      <a href="/mv-studio/help" data-studio-route="help"><strong>도움말</strong><span>해결</span></a>
    </nav>
  </aside>
  <div class="mv-console-main">
    <header class="mv-console-commandbar">
      <div class="mv-console-project">
        <strong id="mv-console-project-title">SF Studio</strong>
        <span id="mv-console-project-state">저장된 작업 확인 중</span>
      </div>
      <div class="mv-top-actions">
        <button class="mv-install-button" id="mv-install-app" type="button" hidden>앱 설치</button>
        <button class="mv-logout-button" id="mv-auth-logout" type="button">로그아웃</button>
      </div>
    </header>
    <div class="mv-console-content">
      <main id="view-mv-storyboard" class="mv-storyboard-view">
      </main>
    </div>
  </div>
</div>
```

위 코드의 빈 `main`은 위치 표시용이다. 실제 적용에서는 기존 `main#view-mv-storyboard`의 네 화면 내용을 그대로 두고, `mv-console-shell`, `mv-console-main`, `mv-console-content` 래퍼만 앞뒤에 추가한다.

- [ ] **Step 5: Creator Console 토큰과 공통 데스크톱 셸을 추가한다**

```css
.mv-standalone-body {
  --mv-console-canvas: #080b11;
  --mv-console-panel: #111722;
  --mv-console-raised: #171f2d;
  --mv-console-border: #293449;
  --mv-console-text: #f5f7fb;
  --mv-console-muted: #96a2b4;
  --mv-console-action: #8b78f6;
  --mv-console-bridge: #5dd8e4;
  --mv-console-saved: #68dca4;
  background: var(--mv-console-canvas);
  color: var(--mv-console-text);
}

.mv-page-shell { padding: 0; }
.mv-console-shell { display: grid; grid-template-columns: 78px minmax(0, 1fr); min-height: 100vh; }
.mv-console-rail { background: #0d121b; border-right: 1px solid var(--mv-console-border); display: flex; flex-direction: column; gap: 16px; padding: 14px 10px; position: sticky; top: 0; height: 100vh; z-index: 30; }
.mv-console-logo { align-items: center; background: linear-gradient(135deg, var(--mv-console-action), #258e9d); border-radius: 12px; color: #fff; display: flex; font-weight: 950; height: 44px; justify-content: center; text-decoration: none; }
.mv-console-nav { display: grid; gap: 8px; }
.mv-console-nav a { border: 1px solid transparent; border-radius: 11px; color: var(--mv-console-muted); display: grid; gap: 2px; min-height: 54px; padding: 9px 6px; text-align: center; text-decoration: none; }
.mv-console-nav a.active { background: #182737; border-color: #355c68; color: var(--mv-console-bridge); }
.mv-console-nav strong { font-size: 11px; }
.mv-console-nav span { font-size: 9px; }
.mv-console-main { min-width: 0; }
.mv-console-commandbar { align-items: center; background: rgba(16, 23, 34, .96); border-bottom: 1px solid var(--mv-console-border); display: flex; justify-content: space-between; min-height: 60px; padding: 10px 18px; position: sticky; top: 0; z-index: 25; }
.mv-console-project { display: grid; gap: 3px; }
.mv-console-project strong { color: var(--mv-console-text); font-size: 14px; }
.mv-console-project span { color: var(--mv-console-muted); font-size: 11px; }
.mv-console-content { padding: 16px; }

@media (max-width: 760px) {
  .mv-console-shell { display: block; padding-bottom: 68px; }
  .mv-console-rail { border: 0; border-top: 1px solid var(--mv-console-border); bottom: 0; flex-direction: row; height: 64px; left: 0; padding: 6px 10px; position: fixed; right: 0; top: auto; }
  .mv-console-logo { display: none; }
  .mv-console-nav { display: grid; flex: 1; gap: 6px; grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .mv-console-nav a { min-height: 50px; padding: 6px 4px; }
  .mv-console-commandbar { min-height: 56px; padding: 8px 12px; }
  .mv-console-content { padding: 10px; }
}
```

- [ ] **Step 6: 루트 정본을 공개 복사본에 동기화한다**

Run:

```powershell
Copy-Item mv-studio.html public/mv-studio.html -Force
Copy-Item css/mv-storyboard.css public/css/mv-storyboard.css -Force
```

- [ ] **Step 7: 계약 검사와 기존 라우팅 검사를 실행한다**

Run: `npm run check:studio-console && npm run check:workflow-import`

Expected: both commands PASS.

- [ ] **Step 8: 공통 셸을 커밋한다**

```powershell
git add package.json scripts/check-studio-creator-console.mjs mv-studio.html public/mv-studio.html css/mv-storyboard.css public/css/mv-storyboard.css
git commit -m "feat: add SF Studio creator console shell"
```

## Task 2: SF 홈을 작업 결정 화면으로 전환

**Files:**
- Modify: `scripts/check-studio-creator-console.mjs`
- Modify: `mv-studio.html:80-105`
- Modify: `public/mv-studio.html:80-105`
- Modify: `css/mv-storyboard.css`
- Modify: `public/css/mv-storyboard.css`
- Modify: `js/mvStoryboardStudio.js:1030-1110, 1180-1210, 3665-3685`
- Modify: `public/js/mvStoryboardStudio.js`

- [ ] **Step 1: 홈 작업 카드 계약을 추가한다**

```js
for (const marker of [
  'class="mv-home-resume-card"',
  'id="mv-home-project-state"',
  'id="mv-home-quick-restore"',
  'class="mv-home-start-grid"'
]) assert.ok(html.includes(marker), `missing home marker: ${marker}`);

for (const marker of ['homeProjectState:', 'homeQuickRestore:', 'syncHomeProjectState']) {
  assert.ok(js.includes(marker), `missing home JS marker: ${marker}`);
}
```

- [ ] **Step 2: 실패를 확인한다**

Run: `npm run check:studio-console`

Expected: FAIL with `missing home marker`.

- [ ] **Step 3: 기존 홈 소개 영역을 이어하기 우선 구조로 교체한다**

```html
<section class="mv-category-home" id="mv-category-home" aria-label="SF Studio 홈">
  <div class="mv-home-workspace">
    <header class="mv-home-heading">
      <span class="mv-page-kicker">SUNOFOX CREATOR CONSOLE</span>
      <h1>다시 제작을 시작하세요</h1>
      <p>마지막 작업을 이어가거나 새로운 Workflow와 이미지로 시작합니다.</p>
    </header>
    <section class="mv-home-resume-card" aria-labelledby="mv-home-resume-title">
      <div>
        <span class="mv-page-kicker">RECENT PROJECT</span>
        <h2 id="mv-home-resume-title">마지막 작업</h2>
        <p id="mv-home-project-state" aria-live="polite">저장된 작업을 확인하고 있습니다.</p>
      </div>
      <button class="mv-primary-btn" id="mv-home-quick-restore" type="button" disabled>마지막 작업 이어하기</button>
    </section>
    <div class="mv-home-start-grid">
      <a href="/mv-studio/import" data-studio-route="import"><strong>Workflow MD 가져오기</strong><span>원문 또는 파일로 새 프로젝트 시작</span></a>
      <label data-image-start-drop><input id="mv-image-start-files" type="file" accept="image/*" multiple><strong>이미지로 시작</strong><span>후보 이미지 보관함부터 시작</span></label>
    </div>
  </div>
</section>
```

- [ ] **Step 4: 홈 카드 스타일을 추가한다**

```css
.mv-home-workspace { display: grid; gap: 18px; margin: 0 auto; max-width: 1120px; padding: clamp(28px, 5vw, 72px) 0; }
.mv-home-heading { max-width: 720px; }
.mv-home-heading h1 { color: var(--mv-console-text); font-size: clamp(32px, 5vw, 58px); letter-spacing: -.04em; margin: 8px 0; }
.mv-home-heading p { color: var(--mv-console-muted); line-height: 1.65; }
.mv-home-resume-card { align-items: center; background: linear-gradient(120deg, #171f2d, #122632); border: 1px solid #355365; border-radius: 18px; display: flex; gap: 20px; justify-content: space-between; min-height: 170px; padding: 24px; }
.mv-home-resume-card h2 { color: var(--mv-console-text); margin: 8px 0; }
.mv-home-resume-card p { color: var(--mv-console-muted); margin: 0; }
.mv-primary-btn { background: linear-gradient(135deg, #735fd9, #258e9d); border: 0; border-radius: 10px; color: #fff; font: inherit; font-weight: 900; min-height: 44px; padding: 0 16px; }
.mv-home-start-grid { display: grid; gap: 12px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.mv-home-start-grid > * { background: var(--mv-console-panel); border: 1px solid var(--mv-console-border); border-radius: 15px; color: var(--mv-console-text); display: grid; gap: 6px; min-height: 120px; padding: 18px; text-decoration: none; }
.mv-home-start-grid input { position: absolute; inline-size: 1px; block-size: 1px; opacity: 0; }
```

- [ ] **Step 5: 홈 최근 작업 상태를 기존 저장 데이터와 연결한다**

`els` 객체에 아래 항목을 추가한다.

```js
homeProjectState: document.getElementById('mv-home-project-state'),
homeQuickRestore: document.getElementById('mv-home-quick-restore'),
consoleProjectTitle: document.getElementById('mv-console-project-title'),
consoleProjectState: document.getElementById('mv-console-project-state'),
```

기존 `els.quickRestore` 클릭 처리와 같은 위치에 다음 이벤트를 추가한다.

```js
els.homeQuickRestore?.addEventListener('click', loadProject);
```

`updateStorageState()` 끝에서 호출할 함수를 추가한다.

```js
function syncHomeProjectState(payload) {
  const hasProject = Boolean(payload?.storyboard?.cuts?.length);
  const title = payload?.inputs?.title || payload?.storyboard?.title || 'SF Studio';
  const cuts = payload?.storyboard?.cuts?.length || 0;
  const saved = hasProject ? formatSavedAt(payload.savedAt) : '저장된 작업 없음';
  if (els.homeQuickRestore) els.homeQuickRestore.disabled = !hasProject;
  if (els.homeProjectState) els.homeProjectState.textContent = hasProject ? `${title} · ${cuts}컷 · ${saved}` : saved;
  if (els.consoleProjectTitle) els.consoleProjectTitle.textContent = hasProject ? title : 'SF Studio';
  if (els.consoleProjectState) els.consoleProjectState.textContent = hasProject ? `${cuts}컷 · 마지막 저장 ${saved}` : '새 작업 준비됨';
}
```

`updateStorageState()`의 `payload` 판정 직후 `syncHomeProjectState(payload);`를 호출한다.

- [ ] **Step 6: 정본과 공개 복사본을 동기화하고 검사한다**

```powershell
Copy-Item mv-studio.html public/mv-studio.html -Force
Copy-Item css/mv-storyboard.css public/css/mv-storyboard.css -Force
Copy-Item js/mvStoryboardStudio.js public/js/mvStoryboardStudio.js -Force
npm run check:studio-console
npm run check:workflow-import
```

Expected: both checks PASS.

- [ ] **Step 7: 홈 개편을 커밋한다**

```powershell
git add scripts/check-studio-creator-console.mjs mv-studio.html public/mv-studio.html css/mv-storyboard.css public/css/mv-storyboard.css js/mvStoryboardStudio.js public/js/mvStoryboardStudio.js
git commit -m "feat: redesign SF Studio home workspace"
```

## Task 3: Workflow 가져오기 실시간 검증 패널

**Files:**
- Modify: `scripts/check-studio-creator-console.mjs`
- Modify: `mv-studio.html:107-190`
- Modify: `public/mv-studio.html`
- Modify: `css/mv-storyboard.css`
- Modify: `public/css/mv-storyboard.css`
- Modify: `js/mvStoryboardStudio.js:1080-1150, 1575-1665`
- Modify: `public/js/mvStoryboardStudio.js`

- [ ] **Step 1: 검증 패널 계약을 먼저 추가한다**

```js
for (const marker of [
  'id="mv-import-preview"',
  'id="mv-import-preview-status"',
  'id="mv-import-preview-meta"',
  'id="mv-import-preview-issues"'
]) assert.ok(html.includes(marker), `missing import marker: ${marker}`);

assert.ok(js.includes('function renderImportPreview()'), 'missing renderImportPreview');
```

- [ ] **Step 2: 실패를 확인한다**

Run: `npm run check:studio-console`

Expected: FAIL with `missing import marker`.

- [ ] **Step 3: 기존 import side 상단에 실시간 검증 패널을 추가한다**

```html
<section class="mv-workflow-card mv-import-preview" id="mv-import-preview" aria-live="polite">
  <div class="mv-flow-title">
    <strong>가져오기 미리보기</strong>
    <span id="mv-import-preview-status">Workflow MD를 입력하면 컷 구성을 검사합니다.</span>
  </div>
  <dl id="mv-import-preview-meta" class="mv-import-preview-meta">
    <div><dt>프로젝트</dt><dd>—</dd></div>
    <div><dt>컷 수</dt><dd>0</dd></div>
    <div><dt>오류</dt><dd>0</dd></div>
  </dl>
  <ul id="mv-import-preview-issues" class="mv-import-preview-issues"></ul>
</section>
```

- [ ] **Step 4: 파서를 변경하지 않고 미리보기만 갱신한다**

`els`에 다음 참조를 추가한다.

```js
importPreviewStatus: document.getElementById('mv-import-preview-status'),
importPreviewMeta: document.getElementById('mv-import-preview-meta'),
importPreviewIssues: document.getElementById('mv-import-preview-issues'),
```

`gptMarkdownText` 이벤트 연결부에 다음을 추가한다.

```js
els.gptMarkdownText?.addEventListener('input', renderImportPreview);
```

파서 함수 아래에 다음 함수를 추가한다.

```js
function renderImportPreview() {
  if (!els.importPreviewStatus || !els.importPreviewMeta || !els.importPreviewIssues) return;
  const source = String(els.gptMarkdownText?.value || '').trim();
  if (!source) {
    els.importPreviewStatus.textContent = 'Workflow MD를 입력하면 컷 구성을 검사합니다.';
    els.importPreviewMeta.innerHTML = '<div><dt>프로젝트</dt><dd>—</dd></div><div><dt>컷 수</dt><dd>0</dd></div><div><dt>오류</dt><dd>0</dd></div>';
    els.importPreviewIssues.replaceChildren();
    return;
  }
  const imported = parseStudioMarkdownImport(source);
  const title = imported.metadata?.project || imported.metadata?.episode || '제목 없음';
  const issues = imported.issues || [];
  els.importPreviewStatus.textContent = imported.cuts.length ? `${imported.cuts.length}개 컷을 찾았습니다.` : imported.errorMessage;
  els.importPreviewMeta.innerHTML = `<div><dt>프로젝트</dt><dd>${escapeHtml(title)}</dd></div><div><dt>컷 수</dt><dd>${imported.cuts.length}</dd></div><div><dt>오류</dt><dd>${issues.length}</dd></div>`;
  els.importPreviewIssues.innerHTML = issues.slice(0, 6).map((issue) => `<li>${escapeHtml(issue)}</li>`).join('');
}
```

- [ ] **Step 5: 가져오기 패널의 데스크톱·모바일 스타일을 추가한다**

```css
.mv-import-grid { align-items: start; grid-template-columns: minmax(0, 1.35fr) minmax(300px, .65fr); }
.mv-import-preview { background: var(--mv-console-panel); border-color: var(--mv-console-border); }
.mv-import-preview-meta { display: grid; gap: 8px; grid-template-columns: repeat(3, minmax(0, 1fr)); margin: 0; }
.mv-import-preview-meta div { background: var(--mv-console-raised); border: 1px solid var(--mv-console-border); border-radius: 10px; padding: 10px; }
.mv-import-preview-meta dt { color: var(--mv-console-muted); font-size: 10px; }
.mv-import-preview-meta dd { color: var(--mv-console-text); font-size: 13px; font-weight: 850; margin: 5px 0 0; }
.mv-import-preview-issues { color: #f0b85b; display: grid; font-size: 11px; gap: 6px; margin: 0; padding-left: 18px; }
```

- [ ] **Step 6: 동기화 후 가져오기 파서 회귀 검사를 실행한다**

```powershell
Copy-Item mv-studio.html public/mv-studio.html -Force
Copy-Item css/mv-storyboard.css public/css/mv-storyboard.css -Force
Copy-Item js/mvStoryboardStudio.js public/js/mvStoryboardStudio.js -Force
npm run check:studio-console
npm run check:workflow-import
node scripts/check-sf-workflow-md-v2.mjs
```

Expected: all commands PASS.

- [ ] **Step 7: 가져오기 화면을 커밋한다**

```powershell
git add scripts/check-studio-creator-console.mjs mv-studio.html public/mv-studio.html css/mv-storyboard.css public/css/mv-storyboard.css js/mvStoryboardStudio.js public/js/mvStoryboardStudio.js
git commit -m "feat: add live Workflow import preview"
```

## Task 4: 콘티 제작 3단 작업 공간과 모바일 컷 드로어

**Files:**
- Modify: `scripts/check-studio-creator-console.mjs`
- Modify: `css/mv-storyboard.css:2454-3110, responsive sections`
- Modify: `public/css/mv-storyboard.css`
- Modify: `js/mvStoryboardStudio.js:4359-4475, 4485-4560`
- Modify: `public/js/mvStoryboardStudio.js`

- [ ] **Step 1: 콘티 레이아웃과 모바일 드로어 계약을 추가한다**

```js
for (const marker of [
  'mv-console-cut-column',
  'mv-console-canvas-column',
  'mv-console-context-column',
  'data-action="toggle-cut-drawer"',
  'data-action="toggle-context-sheet"'
]) assert.ok(js.includes(marker), `missing storyboard marker: ${marker}`);

for (const marker of ['.mv-console-cut-column', '.mv-console-canvas-column', '.mv-console-context-column', '.mv-mobile-cut-toggle']) {
  assert.ok(css.includes(marker), `missing storyboard CSS: ${marker}`);
}
```

- [ ] **Step 2: 실패를 확인한다**

Run: `npm run check:studio-console`

Expected: FAIL with `missing storyboard marker`.

- [ ] **Step 3: renderAssist의 기존 세 패널에 명시적 역할 클래스를 추가한다**

`renderAssist()` 템플릿에서 아래 문자열을 정확히 교체한다. 각 패널의 내부 HTML과 기존 `data-action`은 변경하지 않는다.

```diff
- <div class="mv-assist-board">
+ <div class="mv-assist-board mv-console-workspace">
    ${workflowOverviewHtml()}
+   <div class="mv-mobile-workspace-actions">
+     <button class="mv-mobile-cut-toggle" data-action="toggle-cut-drawer" type="button" aria-expanded="false" aria-controls="mv-console-cut-column">컷 목록 열기</button>
+     <button class="mv-mobile-context-toggle" data-action="toggle-context-sheet" type="button" aria-expanded="false" aria-controls="mv-console-context-column">컷 속성 열기</button>
+   </div>
-   <aside class="mv-assist-panel mv-cut-list-panel">
+   <aside class="mv-assist-panel mv-cut-list-panel mv-console-cut-column" id="mv-console-cut-column">
-   <section class="mv-assist-panel">
+   <section class="mv-assist-panel mv-console-canvas-column">
-   <section class="mv-file-panel">
+   <section class="mv-file-panel mv-console-context-column" id="mv-console-context-column">
```

- [ ] **Step 4: 모바일 드로어 토글을 기존 클릭 위임에 연결한다**

`handleResultClick()`의 `action` 판정 앞쪽에 다음 분기를 추가한다.

```js
if (action === 'toggle-cut-drawer') {
  const open = !document.body.classList.contains('mv-cut-drawer-open');
  document.body.classList.toggle('mv-cut-drawer-open', open);
  button.setAttribute('aria-expanded', String(open));
  button.textContent = open ? '컷 목록 닫기' : '컷 목록 열기';
  return;
}
if (action === 'toggle-context-sheet') {
  const open = !document.body.classList.contains('mv-context-sheet-open');
  document.body.classList.toggle('mv-context-sheet-open', open);
  button.setAttribute('aria-expanded', String(open));
  button.textContent = open ? '컷 속성 닫기' : '컷 속성 열기';
  return;
}
```

`assist-cut` 처리 마지막에 다음을 추가한다.

```js
document.body.classList.remove('mv-cut-drawer-open', 'mv-context-sheet-open');
```

- [ ] **Step 5: 데스크톱 3단 그리드와 모바일 드로어 스타일을 추가한다**

```css
.mv-console-workspace { background: transparent; grid-template-columns: 220px minmax(460px, 1fr) minmax(300px, 36%); }
.mv-console-workspace > .mv-workflow-md-summary { grid-column: 1 / -1; }
.mv-console-cut-column { background: #0f151f; border: 1px solid var(--mv-console-border); border-radius: 14px 0 0 14px; }
.mv-console-canvas-column { background: var(--mv-console-panel); border-block: 1px solid var(--mv-console-border); }
.mv-console-context-column { background: #101721; border: 1px solid var(--mv-console-border); border-radius: 0 14px 14px 0; }
.mv-current-prompt code { background: #0a1018; border-color: #2c394d; color: #cbd5e1; }
.mv-mobile-workspace-actions { display: none; }

@media (max-width: 1180px) {
  .mv-console-workspace { grid-template-columns: 1fr; }
  .mv-mobile-workspace-actions { display: grid; gap: 8px; grid-template-columns: 1fr 1fr; }
  .mv-mobile-cut-toggle, .mv-mobile-context-toggle { min-height: 44px; }
  .mv-console-cut-column { display: none; position: fixed; inset: 60px 0 64px 0; z-index: 80; overflow: auto; border-radius: 0; }
  .mv-cut-drawer-open .mv-console-cut-column { display: block; }
  .mv-console-canvas-column { border: 1px solid var(--mv-console-border); border-radius: 14px; }
  .mv-console-context-column { border: 1px solid var(--mv-console-border); border-radius: 18px 18px 0 0; bottom: 64px; left: 0; max-height: 72vh; overflow: auto; position: fixed; right: 0; transform: translateY(110%); transition: transform 180ms ease; z-index: 85; }
  .mv-context-sheet-open .mv-console-context-column { transform: translateY(0); }
}
```

- [ ] **Step 6: 동기화 후 렌더 계약과 저장 회귀를 확인한다**

```powershell
Copy-Item css/mv-storyboard.css public/css/mv-storyboard.css -Force
Copy-Item js/mvStoryboardStudio.js public/js/mvStoryboardStudio.js -Force
npm run check:studio-console
npm run check:workflow-import
```

Expected: both checks PASS.

- [ ] **Step 7: 콘티 제작 화면을 커밋한다**

```powershell
git add scripts/check-studio-creator-console.mjs css/mv-storyboard.css public/css/mv-storyboard.css js/mvStoryboardStudio.js public/js/mvStoryboardStudio.js
git commit -m "feat: modernize SF Studio storyboard workspace"
```

## Task 5: 문제 해결형 도움말과 접근 가능한 상태 피드백

**Files:**
- Modify: `scripts/check-studio-creator-console.mjs`
- Modify: `mv-studio.html:192-264, 338, 627-630`
- Modify: `public/mv-studio.html`
- Modify: `css/mv-storyboard.css`
- Modify: `public/css/mv-storyboard.css`
- Modify: `js/mvStoryboardStudio.js:3665-3685, 7990-8005`
- Modify: `public/js/mvStoryboardStudio.js`

- [ ] **Step 1: 도움말과 접근성 계약을 추가한다**

```js
for (const marker of [
  'class="mv-help-troubleshooting"',
  'Workflow가 인식되지 않아요',
  '브릿지가 준비되지 않아요',
  '이미지가 저장되지 않아요',
  'aria-live="polite"',
  'role="alert"'
]) assert.ok(html.includes(marker) || js.includes(marker), `missing feedback marker: ${marker}`);

assert.ok(css.includes('@media (prefers-reduced-motion: reduce)'), 'missing reduced-motion rule');
```

- [ ] **Step 2: 실패를 확인한다**

Run: `npm run check:studio-console`

Expected: FAIL with `missing feedback marker`.

- [ ] **Step 3: 기존 도움말 카드 4개를 문제 해결 details 목록으로 교체한다**

```html
<div class="mv-help-troubleshooting">
  <details open><summary>Workflow가 인식되지 않아요</summary><p><code>## Cut 01</code> 헤더와 time, Midjourney, Grok 프롬프트 블록을 확인합니다.</p><a href="/mv-studio/import" data-studio-route="import">가져오기 화면 열기</a></details>
  <details><summary>브릿지가 준비되지 않아요</summary><p>SF 미디어 브릿지 1.5.23 설치 여부와 같은 Chrome에서 Midjourney 또는 Grok 탭이 열려 있는지 확인합니다.</p></details>
  <details><summary>이미지가 저장되지 않아요</summary><p>브라우저 저장공간을 확인하고 이미지 포함 백업을 먼저 내려받은 뒤 다시 시도합니다.</p></details>
  <details><summary>외부 도구 전송이 실패했어요</summary><p>현재 컷은 유지됩니다. 대상 탭과 Bridge 상태를 확인한 뒤 현재 컷에서 다시 시도합니다.</p></details>
  <details><summary>백업을 복원하고 싶어요</summary><p>콘티 제작의 보조 도구에서 백업 불러오기를 선택하고 기존 JSON 파일을 지정합니다.</p></details>
</div>
```

- [ ] **Step 4: 상태 영역의 라이브 리전과 오류 역할을 명시한다**

```html
<div class="mv-error" id="mv-error" role="alert" hidden></div>
<div class="mv-storage-state" id="mv-storage-state" aria-live="polite">저장된 작업 없음</div>
```

`toast()`의 생성부를 다음처럼 보강한다.

```js
element.className = 'mv-toast';
element.setAttribute('role', 'status');
element.setAttribute('aria-live', 'polite');
element.textContent = message;
```

- [ ] **Step 5: 도움말, 포커스, reduced-motion 스타일을 추가한다**

```css
.mv-help-troubleshooting { display: grid; gap: 10px; margin: 0 auto; max-width: 980px; }
.mv-help-troubleshooting details { background: var(--mv-console-panel); border: 1px solid var(--mv-console-border); border-radius: 13px; padding: 14px; }
.mv-help-troubleshooting summary { color: var(--mv-console-text); cursor: pointer; font-weight: 850; }
.mv-help-troubleshooting p { color: var(--mv-console-muted); line-height: 1.6; }
.mv-standalone-body :focus-visible { outline: 3px solid rgba(93, 216, 228, .75); outline-offset: 3px; }

@media (prefers-reduced-motion: reduce) {
  .mv-standalone-body *, .mv-standalone-body *::before, .mv-standalone-body *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: .01ms !important;
  }
}
```

- [ ] **Step 6: 동기화하고 접근성 검사를 실행한다**

```powershell
Copy-Item mv-studio.html public/mv-studio.html -Force
Copy-Item css/mv-storyboard.css public/css/mv-storyboard.css -Force
Copy-Item js/mvStoryboardStudio.js public/js/mvStoryboardStudio.js -Force
npm run check:studio-console
npm run check:a11y
npm run check:mobile-css
```

Expected: all checks PASS.

- [ ] **Step 7: 도움말과 피드백을 커밋한다**

```powershell
git add scripts/check-studio-creator-console.mjs mv-studio.html public/mv-studio.html css/mv-storyboard.css public/css/mv-storyboard.css js/mvStoryboardStudio.js public/js/mvStoryboardStudio.js
git commit -m "feat: improve SF Studio help and feedback"
```

## Task 6: 자산 버전과 서비스워커 동기화

**Files:**
- Modify: `mv-studio.html:25, 643`
- Modify: `public/mv-studio.html:25, 643`
- Modify: `sf-studio-sw.js:1, 7, 9`
- Modify: `public/sf-studio-sw.js:1, 5-6`
- Modify: `scripts/check-dist-integrity.mjs:11`

- [ ] **Step 1: dist 검사에 신규 버전을 먼저 요구한다**

```js
const studioAssetVersion = '20260713-creator-console';
```

- [ ] **Step 2: 기존 버전이 실패하는지 확인한다**

Run: `npm run build && npm run check:dist`

Expected: FAIL because Studio HTML and service worker still use `20260710-mobile-home`.

- [ ] **Step 3: HTML의 CSS와 JS 버전을 함께 갱신한다**

```html
<link rel="stylesheet" href="./css/mv-storyboard.css?v=20260713-creator-console">
<script src="./js/mvStoryboardStudio.js?v=20260713-creator-console"></script>
```

- [ ] **Step 4: 두 서비스워커의 구조 차이는 유지하고 캐시 키와 Studio CSS/JS URL만 갱신한다**

```js
const SF_STUDIO_CACHE = 'sf-studio-20260713-creator-console';
```

두 파일 모두 자산 배열에서 다음 URL을 사용한다.

```js
'/css/mv-storyboard.css?v=20260713-creator-console',
'/js/mvStoryboardStudio.js?v=20260713-creator-console',
```

루트 `sf-studio-sw.js`의 `cache.addAll` 구조와 공개 `public/sf-studio-sw.js`의 `Promise.allSettled` 구조는 서로 다르므로 파일 전체를 복사하지 않는다.

- [ ] **Step 5: HTML만 공개 복사본과 동기화한다**

```powershell
Copy-Item mv-studio.html public/mv-studio.html -Force
```

- [ ] **Step 6: 빌드와 dist 계약을 실행한다**

Run: `npm run build && npm run check:dist && npm run check:studio-console`

Expected: all commands PASS.

- [ ] **Step 7: 자산 버전을 커밋한다**

```powershell
git add mv-studio.html public/mv-studio.html sf-studio-sw.js public/sf-studio-sw.js scripts/check-dist-integrity.mjs
git commit -m "chore: version SF Studio creator console assets"
```

## Task 7: 통합 검증, 자동 배포 푸시, 운영 확인

**Files:**
- Verify only unless a test reveals an in-scope regression

- [ ] **Step 1: 작업 범위와 복사본 일치를 확인한다**

Run:

```powershell
git status --short --branch
git diff --check origin/main...HEAD
Get-FileHash mv-studio.html,public/mv-studio.html,css/mv-storyboard.css,public/css/mv-storyboard.css,js/mvStoryboardStudio.js,public/js/mvStoryboardStudio.js
```

Expected: `.superpowers/` 외에 의도하지 않은 미추적 파일이 없고, HTML/CSS/JS 각 루트·공개 쌍의 해시가 일치한다.

- [ ] **Step 2: 전체 자동 검사를 실행한다**

Run: `npm test`

Expected: build와 모든 `check:*` 명령 PASS.

- [ ] **Step 3: 사용자가 열어 둔 일반 Chrome의 SF Studio 탭에서 데스크톱을 확인한다**

확인 URL: `https://sunofox.com/mv-studio/storyboard` 또는 로컬 `npm run pages:dev` URL

확인 항목:

- 1440×900에서 좌측 레일, 상단 명령 바, 컷 목록, 중앙 캔버스, 우측 패널이 겹치지 않는다.
- 마지막 프로젝트 제목, 컷 수, 저장 시간이 표시된다.
- Workflow 가져오기 미리보기가 입력에 따라 갱신된다.
- 컷 선택, 저장, 불러오기, 백업, MJ/Grok 버튼이 기존 동작을 유지한다.
- 콘솔 오류가 없다.

- [ ] **Step 4: 같은 Chrome 탭을 390×844로 확인한다**

확인 항목:

- 하단 또는 축약 탐색이 44px 이상 터치 영역을 제공한다.
- 컷 목록 열기/닫기와 컷 선택 후 드로어 닫기가 정상이다.
- 가로 페이지 스크롤이 없다.
- 저장 상태, 오류 메시지, Primary 버튼이 화면 안에 보인다.

- [ ] **Step 5: 단일 오너 인증과 Bridge 경계를 확인한다**

Run:

```powershell
npm run check:owner-studio-oauth
rg -n '1\.5\.23' extensions public/extensions mv-studio.html public/mv-studio.html README.md AGENTS.md
git diff --name-only origin/main...HEAD -- extensions public/extensions
```

Expected: OAuth check PASS, Bridge 기준은 1.5.23, extension 파일 변경 없음.

- [ ] **Step 6: main을 푸시해 Cloudflare Pages 자동 배포를 시작한다**

Run: `git push origin main`

Expected: push succeeds without force.

- [ ] **Step 7: 자동 배포 완료 후 운영 라우트를 확인한다**

Run:

```powershell
npm run check:production
npm run check:production-seo
```

운영 Chrome에서 다음을 확인한다.

- `https://sunofox.com/mv-studio`
- `https://sunofox.com/mv-studio/import`
- `https://sunofox.com/mv-studio/storyboard`
- `https://sunofox.com/mv-studio/help`

Expected: 오너 로그인 유지, 네 라우트 정상, Creator Console CSS/JS 버전 `20260713-creator-console`, 화면 오류 없음.

## 완료 보고 형식

1. 작업 요약
2. 수정 파일 목록
3. 테스트 결과
4. 배포 여부
5. Git 상태
6. 운영 확인
7. Access 보호 확인
8. 브릿지 확인
9. 남은 이슈
10. 다음 작업 제안
