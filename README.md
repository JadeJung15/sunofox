# SunoFox Official Site

SunoFox 공식 사이트는 Anime OST, 웹소설, 필모그래피를 한 페이지에서 소개하고 내부 제작 스튜디오로 연결하는 Cloudflare Pages 기반 브랜드 사이트입니다.

## Current Production

| 항목 | 내용 |
|---|---|
| 정본 도메인 | `https://sunofox.com` |
| GitHub repo | `JadeJung15/sunofox` |
| 기본 브랜치 | `main` |
| 프레임워크 | Astro static site + Tailwind/Vite |
| 패키지 매니저 | npm |
| Cloudflare Pages 프로젝트 | `sf-studio` |
| 빌드 출력 | `dist` |
| 운영 배포 방식 | GitHub Actions에서 `main` push 시 Cloudflare Pages Direct Upload |
| 공개 사이트 방향 | `/` 단일 페이지의 소설·채널 소개·필모그래피·스튜디오 진입 |
| 접근 모델 | 공개 사이트 + 단일 오너 Google 계정 로그인 |

## Public Routes

아래 URL은 운영 URL로 유지해야 합니다.

| Route | 용도 | 소스 |
|---|---|---|
| `/` | SunoFox 공식 소개, 소설·채널·필모그래피·스튜디오 앵커 | `src/pages/index.astro` |
| `/novels/` | 대표 웹소설 소개와 6개 회차 목록 | `src/pages/novels.astro` |
| `/novels/episode-001/` | 1화 | `src/pages/novels/episode-001.md` |
| `/novels/episode-002/` | 2화 | `src/pages/novels/episode-002.md` |
| `/novels/episode-003/` | 3화 | `src/pages/novels/episode-003.md` |
| `/novels/episode-004/` | 4화 | `src/pages/novels/episode-004.md` |
| `/novels/episode-005/` | 5화 | `src/pages/novels/episode-005.md` |
| `/novels/episode-006/` | 6화 | `src/pages/novels/episode-006.md` |
| `/privacy/` | 개인정보 처리방침 | `src/pages/privacy.astro` |
| `/terms/` | 이용약관 | `src/pages/terms.astro` |
| `/404.html` | custom 404 fallback | `src/pages/404.astro` |
| `/robots.txt` | robots | `src/pages/robots.txt.ts` |
| `/sitemap-index.xml`, `/sitemap-0.xml` | sitemap | `@astrojs/sitemap` |
| `/sitemap.xml` | legacy sitemap 호환 XML | `src/pages/sitemap.xml.ts` |

## Protected / Operational Routes

아래 영역은 별도 승인 없이 구조를 변경하지 않습니다.

| Route | 용도 | 주의 |
|---|---|---|
| `/mv-studio` | 관리자 전용 제작 공간 | 구조 변경 금지, noindex 유지 |
| `/login` | 오너 Google 로그인 | Google OAuth와 안전한 `next` 유지 |
| `/api/auth/oauth/*` | OAuth 시작·상태·Google 콜백 | 서명 state와 오너 이메일 검증 유지 |
| `/api/auth/me`, `/api/auth/logout` | Studio 세션 확인·종료 | no-store 유지 |

## Core Files

| 구분 | 경로 | 설명 |
|---|---|---|
| 공통 레이아웃 | `src/layouts/Layout.astro` | title, description, canonical, OG, Twitter card, footer |
| 에피소드 레이아웃 | `src/layouts/NovelEpisodeLayout.astro` | 본문, OST, 이전/다음/목록 이동 |
| 헤더/메뉴 | `src/components/SiteChrome.astro` | 고정 헤더와 네 개 메뉴 |
| 사이트 데이터 집계 | `src/data/siteContent.js` | 프로필, JSON-LD 및 하위 데이터 re-export |
| 아티스트/OST 링크 데이터 | `src/data/artistContent.js` | YouTube, 음원 플랫폼, 대표 웹소설 OST 링크 |
| 음악 아카이브 데이터 | `src/data/musicContent.js` | 앨범, 음악 아카이브, YouTube/MV 허브 목록 |
| 웹소설 데이터 | `src/data/novelContent.js` | 작품 정보, 세계관, 인물, 에피소드 목록 |
| 메뉴 데이터 | `src/data/navigationContent.js` | 공개 메뉴 네 개와 법적 푸터 링크 |
| 전역 스타일 | `src/styles/global.css`, `src/styles/official-shell.css` | 기존 페이지와 공식 단일 페이지 셸 |
| 정적 assets | `public/assets/` | 커버, 아이콘, 앨범 이미지 |
| Cloudflare 설정 | `wrangler.jsonc` | Pages output과 오너 이메일 변수 |
| headers/redirects | `_headers`, `_redirects`, `public/_headers`, `public/_redirects` | Cloudflare Pages 헤더/리다이렉트 |

## Operation Docs

| 문서 | 용도 |
|---|---|
| `docs/site-route-inventory.md` | 공개/보호 라우트, 콘텐츠 데이터 위치, 배포 후 확인 URL을 한 장으로 정리 |
| `docs/episode-release-checklist.md` | 신규 웹소설 회차 공개 전 콘텐츠, 파일, UI, 검증, 배포 체크리스트 |
| `docs/episode-authoring-template.md` | 신규 회차 데이터, frontmatter, 시즌/읽는 흐름 갱신 템플릿 |

## Design Direction

SunoFox 공개 사이트는 Astro + Tailwind + `src/styles/global.css`의 커스텀 클래스 체계를 유지합니다. 새 UI 프레임워크를 기본 의존성으로 추가하지 않습니다.

| 기준 | 적용 |
|---|---|
| 기본 구현 | 기존 Astro 컴포넌트, Tailwind, 커스텀 CSS 토큰과 클래스 우선 |
| daisyUI | 설치하지 않고 `btn`, `card`, `badge`, `tabs`, `modal`, `toast` 같은 의미 체계만 참고 |
| shadcn/ui | React 도입 없이 정돈된 카드, 버튼, 탭, 다이얼로그, 상태 표현, 접근성 패턴 참고 |
| HeroUI | 메인 히어로, 앨범/OST 카드, hover/focus/loading 등 제한된 상호작용 참고 |
| Mantine / Ant Design | 관리자, 폼, 테이블 중심 화면의 정보 구조만 참고 |
| Bootstrap / Bulma / Chakra UI | 공개 홈페이지에는 사용하지 않음 |

공개 UI 톤은 Anime OST archive, 음악/세계관 브랜드 사이트 느낌을 유지합니다. 여러 UI 프레임워크 스타일을 섞지 않고, 어두운 무드와 선명한 accent, 읽기 쉬운 카드/버튼/섹션 구조를 기존 디자인 언어 안에서 확장합니다.

## Content Model

웹소설은 현재 두 곳을 함께 갱신합니다.

1. 회차 목록/카드/메타: `src/data/novelContent.js`의 `novelEpisodes`
2. 실제 본문: `src/pages/novels/episode-00N.md`

공개 확정 전 내부 원고는 `src/pages/novels/`에 먼저 만들지 않습니다. 이 폴더에 `episode-00N.md`를 추가하면 링크를 숨겨도 Astro 빌드에서 공개 URL이 생성될 수 있으므로, 7화나 시즌2 초안은 공개 확정 후 route 파일로 옮깁니다.
`npm run check:content`는 `novelEpisodes`에 공개 회차로 등록되지 않은 `src/pages/novels/episode-00N.md` 파일을 발견하면 실패합니다.

회차별 공유 카드 문구는 `src/data/novelContent.js`의 `shareTitle`, `shareDescription`, `shareImageAlt`, `shareTags`에서 관리합니다. `shareTitle`은 OG/Twitter 제목에 사용하고, `shareDescription`은 meta description, OG/Twitter description, Article JSON-LD description에 사용하며, `shareImageAlt`는 에피소드별 OG/Twitter 이미지 alt에 사용합니다.
OST와 YouTube 연결은 `src/data/artistContent.js`의 `artistLinks`, `featuredStoryOst`, `src/data/musicContent.js`의 `musicArchive`, `archiveAlbum`, 그리고 `src/data/siteContent.js`의 `sunofoxProfile`에서 관리합니다.
메뉴 항목은 `src/data/navigationContent.js`에서 관리하고 `siteContent.js`가 기존 import 호환을 위해 다시 export합니다.

작품 목록과 에피소드 상세의 JSON-LD는 `src/data/siteContent.js`에서 생성합니다.
`/novels/`는 `CreativeWorkSeries`와 `BreadcrumbList`, 각 `/novels/episode-00N/`은 `Article`과 `BreadcrumbList`를 함께 출력합니다.

## Scripts

| script | command | 용도 |
|---|---|---|
| `npm run dev` | `astro dev` | 로컬 개발 서버 |
| `npm run build` | `astro build && node scripts/version-auth-assets.mjs` | 정적 빌드와 auth asset versioning |
| `npm run lint` | `npm run build && npm run check:seo && npm run check:a11y` | standalone 공유 메타/접근성 정적 점검 |
| `npm run test` | `npm run build && npm run check` | standalone 배포 전 전체 검증 |
| `npm run check` | `npm run check:content && npm run check:korean-reader && npm run check:music && npm run check:profile && npm run check:navigation && npm run check:workflow-import && npm run check:dist && npm run check:seo && npm run check:a11y && npm run check:mobile-css && npm run check:public-routes` | 배포 전 콘텐츠/한글 병기/음악/프로필/메뉴 데이터/asset/SEO/접근성/모바일 CSS/공개 라우트 통합 검증 |
| `npm run check:public-routes` | `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/check-public-routes.ps1` | `dist` 기준 공개 라우트, custom 404, 1~6화 핵심 문자열/회차 이동 마커, sitemap 공개/숨김 URL 정책, robots 보호 경로와 `_headers` 캐시 정책 확인 |
| `npm run check:production` | `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/check-public-routes.ps1 -BaseUrl https://sunofox.com` | 배포 후 운영 도메인 공개 라우트, 404 상태, sitemap 공개/숨김 URL 정책 검증 |
| `npm run check:production-seo` | `node scripts/check-seo-metadata.mjs --base-url=https://sunofox.com` | 배포 후 운영 도메인의 title, description, OG/Twitter, JSON-LD 검증 |
| `npm run check:content` | `node scripts/check-content-consistency.mjs` | 웹소설 목록 데이터와 에피소드 frontmatter 일치 확인 |
| `npm run check:korean-reader` | `node scripts/check-korean-reader-support.mjs` | 에피소드 본문과 시스템 영어 문장에 한글 병기가 있는지 확인 |
| `npm run check:music` | `node scripts/check-music-content.mjs` | OST, YouTube/MV, 영상 허브 요약/필수 링크, 앨범 트랙 데이터 일치 확인 |
| `npm run check:profile` | `node scripts/check-profile-content.mjs` | SunoFox 소개/필모그래피 허브, 탭, 출처 링크 데이터 확인 |
| `npm run check:navigation` | `node scripts/check-navigation-content.mjs` | 오버레이 메뉴와 푸터의 한국어 라벨, 순서, 내부 canonical href 확인 |
| `npm run check:dist` | `node scripts/check-dist-integrity.mjs` | 공개 `dist` 내부 링크와 이미지/asset 경로 존재 확인 |
| `npm run check:seo` | `node scripts/check-seo-metadata.mjs` | 공개 HTML의 title, description, canonical, OG/Twitter, JSON-LD 확인 |
| `npm run check:a11y` | `node scripts/check-accessibility-basics.mjs` | 공개 HTML의 lang, viewport, h1, img alt, 링크/버튼 이름 확인 |
| `npm run check:mobile-css` | `node scripts/check-mobile-css.mjs` | 메뉴/CTA/작품 탭/회차 이동/보조 링크/음악 버튼의 모바일 터치 영역과 줄바꿈 CSS 계약 확인 |
| `npm run preview` | `astro preview` | 빌드 결과 미리보기 |
| `npm run pages:dev` | `npm run build && wrangler pages dev dist --compatibility-date=2026-06-07` | Cloudflare Pages 로컬 검증 |
| `npm run deploy:preview` | `npm run build && wrangler pages deploy dist --project-name sf-studio --branch astro-redesign` | preview 배포 |
| `npm run deploy:production` | `npm run build && wrangler pages deploy dist --project-name sf-studio --branch main` | production 배포 |
| `npm run check:admin-oauth` | PowerShell checker | 관리자 OAuth 패널 정적 확인 |
| `npm run check:admin-feedback` | PowerShell checker | 관리자 피드백 요약 확인 |

`lint`와 `test`는 별도 테스트 프레임워크 없이 현재 운영 검증 스크립트를 standalone으로 실행하는 alias입니다.

## GitHub Actions Auto Deploy

`main` 브랜치에 push되면 GitHub Actions가 빌드와 검증을 실행한 뒤 Cloudflare Pages production에 배포합니다.

| 항목 | 값 |
|---|---|
| workflow | `.github/workflows/cloudflare-pages-production.yml` |
| trigger | `push` to `main`, manual `workflow_dispatch` |
| runner | `windows-latest` |
| Node.js | `22` |
| install | `npm ci` |
| verify | `npm run test` |
| deploy action | `cloudflare/wrangler-action@v4` |
| wrangler | `4.80.0` |
| deploy command | `wrangler pages deploy dist --project-name=sf-studio --branch=main` |

GitHub repository의 `Settings > Secrets and variables > Actions`에 아래 secrets가 필요합니다.

| Secret | 용도 |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare Pages 배포 권한이 있는 API token |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account id |

`CLOUDFLARE_API_TOKEN`은 repo에 저장하지 않습니다. Cloudflare dashboard에서 생성한 뒤 GitHub Actions secret으로만 등록합니다.
`GITHUB_TOKEN`은 GitHub Actions가 자동 제공하며 별도 등록하지 않습니다.

## Deployment Checklist

production 반영 전 기본 순서입니다.

1. `git status -sb`
2. `git log --oneline -5`
3. `npm run build`
4. `npm run check`
5. 필요 시 개별 확인: `npm run check:content`, `npm run check:dist`, `npm run check:public-routes`
6. 운영 URL 검증 대상 확인
7. 주요 로컬/빌드 산출물 확인
8. `git add ...`
9. `git commit -m "..."`
10. `git push origin main`
11. GitHub Actions `Deploy Cloudflare Pages Production` 성공 확인
12. `npx wrangler pages deployment list --project-name sf-studio`
13. `npm run check:production`
14. `npm run check:production-seo`
15. 운영 URL HTTP 200과 핵심 문자열 확인

수동 복구 배포가 필요할 때만 아래 명령을 사용합니다.

```powershell
npm run deploy:production
```

`check:content`는 `src/data/siteContent.js`의 `novelEpisodes`와 `src/pages/novels/episode-00N.md` frontmatter의 title, canonical, publishedAt, readTime, 이전/다음 링크, 공유 제목/설명/태그를 비교합니다. 또한 `/novels/`의 `readingPath`가 공개 회차를 빠짐없이 덮고 각 구간의 첫 화로 연결되는지 확인하며, 공개 데이터에 없는 에피소드 route 파일이 실수로 배포되지 않도록 실패 처리합니다. 세계관/캐릭터 카드의 `id`와 `/novels/#...` 앵커도 함께 검증합니다.
`check:korean-reader`는 에피소드 본문과 시스템 문구에 영어 문장이 들어갈 경우 같은 줄에 한글 설명 또는 괄호 병기가 있는지 확인합니다.
`check:official-site`는 홈 앵커, 메뉴 네 개, 필모그래피 여섯 개, 리다이렉트, 제거 라우트/API, Google 전용 로그인과 Wrangler 바인딩 제거를 확인합니다.
`check:navigation`은 `소설`, `채널 소개`, `필모그래피`, `스튜디오` 링크와 법적 푸터 링크 두 개를 확인합니다.
`check:dist`는 빌드된 공개 HTML/CSS/manifest의 내부 링크, 이미지, asset 경로가 `dist` 안에 실제 존재하는지 확인합니다.
`check:seo`는 홈, 작품 목록, 1~6화 상세의 title, description, canonical, OG/Twitter card, 회차별 공유 문구, JSON-LD 기본 타입을 확인합니다.
`check:a11y`는 공개 HTML의 lang, viewport, h1, 이미지 alt, 링크/버튼 접근 가능한 이름, 새 탭 링크 rel 값을 확인합니다.
`check:mobile-css`는 390px 단일 열, 2×2 제작 흐름, 2열 포스터, 로그인 터치 영역과 reduced motion을 확인합니다.
`check:public-routes`는 홈, 작품 목록, 1~6화, 법적 문서, 로그인, sitemap, robots와 기존 URL 리다이렉트를 확인합니다. 운영 URL 모드에서는 제거 API의 404도 함께 확인합니다.
`check:production-seo`는 같은 SEO 검증 기준을 운영 도메인 HTML에 적용해 배포 후 title, description, OG/Twitter card, JSON-LD 반영 여부를 확인합니다.
작품 목록과 에피소드 상세는 Breadcrumb JSON-LD, 에피소드는 article publish meta도 함께 검증합니다.
모바일 검증 시 공개 CTA, 작품 탭, footer 링크는 44px 안팎의 터치 영역을 유지해야 합니다.

배포 후 최소 확인 URL:

```text
https://sunofox.com/
https://sunofox.com/novels/
https://sunofox.com/novels/episode-006/
https://sunofox.com/#filmography
https://sunofox.com/login?next=/mv-studio
https://sunofox.com/sitemap.xml
https://sunofox.com/sitemap-0.xml
https://sunofox.com/robots.txt
```

## Boundaries

승인 없이 진행 가능한 작업:

- README/문서 최신화
- 공개 라우트 문구/CTA 개선
- `/`, `/novels/`, 에피소드 페이지 접근성 개선
- SEO/meta/alt/JSON-LD 보강
- 모바일 레이아웃 소규모 개선
- 에피소드 추가 체크리스트 작성
- build, commit, push, Cloudflare Pages production 배포 확인

별도 승인 필요한 작업:

- 도메인/DNS/Cloudflare 계정 설정 변경
- Cloudflare Access 변경
- 환경변수/API 키/시크릿 추가, 삭제, 출력
- DB 또는 외부 CMS 도입
- 인증/로그인/관리자/Functions 대규모 변경
- `/mv-studio`, `/login`, OAuth 구조 변경
- 기존 공개 URL 변경
- 콘텐츠 대량 삭제
- 에피소드 본문 대량 변환
- `_headers/_redirects` 대규모 정리

## Bridge Extension

브릿지 확장 프로그램은 현재 운영 버전을 기준으로 관리합니다.

- 패키지: `public/extensions/sf-midjourney-bridge-v1.5.23.zip`
- 소스: `public/extensions/midjourney-bridge`
- Chrome 확장 이름: `SF 미디어 브릿지`
- required version: `1.5.23`

기능 변경 또는 권한 변경 시 manifest, 소스 상수, ZIP 파일, Studio 요구 버전, 문서를 함께 갱신합니다.
