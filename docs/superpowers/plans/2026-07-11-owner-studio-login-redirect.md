# Owner Studio Login Redirect Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 오너 스튜디오 로그인 요청에서 등록된 오너 이메일 계정만 `/mv-studio`로 이동시키고 일반 회원에게 명확한 권한 안내를 반환합니다.

**Architecture:** 기존 내비게이션과 로그인 화면의 `next=/mv-studio` 전달 구조는 유지합니다. Cloudflare Pages 로그인 함수가 안전하게 정규화된 목적지가 Studio 경로인지 판별하고, 인증 성공 후 세션을 만들기 전에 오너 이메일 여부를 검사합니다.

**Tech Stack:** Astro 5, Cloudflare Pages Functions, JavaScript ES modules, Node.js 계약 검사

---

### Task 1: 오너 스튜디오 로그인 계약 검사

**Files:**
- Create: `scripts/check-owner-studio-login.mjs`
- Modify: `package.json`

- [ ] **Step 1: 실패하는 계약 검사를 작성합니다**

`scripts/check-owner-studio-login.mjs`에서 인메모리 인증 저장소를 사용해 다음을 검증합니다.

```js
const ownerResponse = await login({
  email: ownerEmail,
  code: '4416',
  next: '/mv-studio'
});
assert.equal(ownerResponse.status, 200);
assert.equal((await ownerResponse.json()).next, '/mv-studio');

const memberResponse = await login({
  email: memberEmail,
  password: memberPassword,
  next: '/mv-studio'
});
assert.equal(memberResponse.status, 403);
assert.match((await memberResponse.json()).message, /제작자 전용/);
```

`package.json`에 `check:owner-studio-login` 명령을 등록하고 전체 `check` 체인에 연결합니다.

- [ ] **Step 2: 검사 실패를 확인합니다**

Run: `npm run check:owner-studio-login`

Expected: 일반 회원 응답이 현재 `200`이므로 `403` 기대 조건에서 FAIL

- [ ] **Step 3: 테스트 변경을 커밋합니다**

```powershell
git add scripts/check-owner-studio-login.mjs package.json
git commit -m "test: cover owner studio login redirect"
```

### Task 2: Studio 목적지 오너 권한 검사

**Files:**
- Modify: `functions/api/auth/login.js`

- [ ] **Step 1: 최소 권한 검사를 구현합니다**

인증 성공 후 세션 쿠키 생성 전에 Studio 경로와 오너 여부를 검사합니다.

```js
function isStudioPath(pathname) {
  return pathname === '/mv-studio' ||
    pathname === '/mv-studio.html' ||
    pathname.startsWith('/mv-studio/');
}

if (isStudioPath(next) && email !== adminEmail) {
  return json({
    ok: false,
    status: 'owner-required',
    message: '오너 스튜디오는 등록된 제작자 전용 계정으로만 이용할 수 있습니다.'
  }, { status: 403 });
}
```

- [ ] **Step 2: 전용 검사가 통과하는지 확인합니다**

Run: `npm run check:owner-studio-login`

Expected: owner, member, safe redirect 검사가 모두 PASS

- [ ] **Step 3: 전체 저장소 검사를 실행합니다**

Run: `npm run build && npm run check && git diff --check`

Expected: 모든 명령 종료 코드 `0`

- [ ] **Step 4: 구현 변경을 커밋합니다**

```powershell
git add functions/api/auth/login.js
git commit -m "feat: restrict owner studio login redirect"
```

### Task 3: 배포 및 운영 확인

**Files:**
- No file changes

- [ ] **Step 1: main 브랜치를 push합니다**

Run: `git push origin main`

Expected: `origin/main`이 로컬 `main`의 최신 구현 커밋으로 이동

- [ ] **Step 2: Cloudflare Pages 자동 배포 상태를 확인합니다**

Run: `npx wrangler pages deployment list --project-name sf-studio`

Expected: 최신 production 배포가 구현 커밋으로 성공 상태

- [ ] **Step 3: 운영 공개 흐름을 확인합니다**

Run: `npm run check:production`

Expected: 공개 페이지와 `/login?next=/mv-studio`가 정상 응답. 실제 오너 인증정보는 자동 입력하지 않음.
