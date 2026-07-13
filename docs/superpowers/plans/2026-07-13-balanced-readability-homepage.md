# Balanced Readability Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 선택된 2번 시안의 넓은 읽기 리듬, 명확한 제작 흐름, 3×2 필모그래피, 제작자 전용 Studio CTA를 기존 SunoFox 공식 홈페이지에 정밀 적용합니다.

**Architecture:** 기존 Astro 단일 페이지와 인라인 페이지 CSS를 유지하며, 공개 콘텐츠와 인증 라우트는 바꾸지 않습니다. `src/pages/index.astro`의 레이아웃 토큰만 조정하고 정적 계약 테스트와 브라우저 시각 비교로 회귀를 차단합니다.

**Tech Stack:** Astro 5, Tailwind CSS 4, custom CSS, Phosphor Icons Web, Node.js contract tests

---

### Task 1: 선택 시안 계약 고정

**Files:**
- Modify: `scripts/check-official-layout-contract.mjs`
- Create: `docs/design-references/selected-concept-02-balanced-reading-rhythm.png`

- [x] **Step 1: Write the failing test**

  데스크톱 필모그래피가 3열이고, 카드 제목·메타가 기존보다 읽기 쉬우며, Studio가 등록 제작자 전용임을 검증하는 정규식 계약을 추가합니다.

- [x] **Step 2: Run test to verify it fails**

  Run: `npm run check:official-layout`

  Expected: FAIL because the current desktop grid is six columns and the current Studio copy lacks the producer-only label.

- [x] **Step 3: Preserve the selected visual source**

  선택한 두 번째 ImageGen 결과를 `docs/design-references/selected-concept-02-balanced-reading-rhythm.png`로 복사합니다.

### Task 2: 2번 시안 레이아웃 구현

**Files:**
- Modify: `src/pages/index.astro`

- [x] **Step 1: Implement the minimal layout changes**

  기존 콘텐츠·링크·이미지는 유지하고 다음 CSS/마크업 계약만 적용합니다.

  - 본문과 섹션 여백 확대
  - 제작 흐름의 번호·아이콘·설명 위계 강화
  - 데스크톱 필모그래피 `repeat(3,minmax(0,1fr))`
  - 태블릿 2열, 모바일 2열 유지
  - 카드 제목 18px, 메타 13px 이상의 데스크톱 가독성
  - Studio에 `등록된 제작자 전용` 보조 문구 추가

- [x] **Step 2: Run focused tests**

  Run: `npm run check:official-layout && npm run check:mobile-css && npm run check:official-site`

  Expected: PASS.

### Task 3: 브라우저 시각 QA

**Files:**
- Create: `design-qa.md`
- Create: `docs/design-references/implementation-concept-02-desktop-1440.png`
- Create: `docs/design-references/implementation-concept-02-mobile-390.png`
- Create: `docs/design-references/comparison-concept-02-desktop.png`
- Create: `docs/design-references/comparison-concept-02-mobile.png`

- [x] **Step 1: Build and serve the site**

  Run: `npm run build` and start the existing Astro preview on a local port.

- [x] **Step 2: Capture matching states**

  In the user-selected in-app browser, capture `/` at desktop 1440px and mobile 390×844/full-page states.

- [x] **Step 3: Compare source and implementation together**

  Create combined comparison images, inspect typography, spacing, colors, image crops, copy, interactions, overflow, focus, and console state. Fix all P0/P1/P2 differences and repeat.

- [x] **Step 4: Record the blocking gate**

  Save `design-qa.md` with exact source/capture paths and `final result: passed` only when no actionable P0/P1/P2 findings remain.

### Task 4: Full verification and delivery

**Files:**
- Verify all modified files

- [x] **Step 1: Run the full suite**

  Run: `npm test`

  Expected: all build, content, auth, functions, SEO, accessibility, mobile CSS, and public-route checks pass.

- [x] **Step 2: Review scope and repository state**

  Run: `git diff --check`, `git diff --stat`, and `git status --short`.

- [ ] **Step 3: Commit and push**

  Commit only the approved homepage design, tests, plan, selected reference, and QA evidence, then run `git push origin main` so the existing Cloudflare Pages workflow deploys it.

- [ ] **Step 4: Verify production**

  Confirm the deployment source commit and inspect `https://sunofox.com/` anchors, responsive layout, Studio login link, and production checks without changing DNS, Access, KV/D1, or bridge files.
