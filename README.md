# SunoFox Official Site

SunoFox 공식 사이트는 음악에서 시작한 감정과 장면을 웹소설, OST, 음악 아카이브, 스튜디오 제작 흐름으로 확장하는 Cloudflare Pages 기반 정적 사이트입니다.

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
| 공개 사이트 방향 | 웹소설 연재 허브, OST/음악 아카이브, SunoFox 소개, 스튜디오 진입 |
| 접근 모델 | 공개 사이트 + SF Studio 자체 승인/로그인 |

## Public Routes

아래 URL은 운영 URL로 유지해야 합니다.

| Route | 용도 | 소스 |
|---|---|---|
| `/` | SunoFox 메인, 공개 회차 상태와 소설/음악/스튜디오 CTA | `src/pages/index.astro` |
| `/novels/` | 웹소설 작품/회차 목록 | `src/pages/novels.astro` |
| `/novels/episode-001/` | 1화 | `src/pages/novels/episode-001.md` |
| `/novels/episode-002/` | 2화 | `src/pages/novels/episode-002.md` |
| `/novels/episode-003/` | 3화 | `src/pages/novels/episode-003.md` |
| `/novels/episode-004/` | 4화 | `src/pages/novels/episode-004.md` |
| `/novels/episode-005/` | 5화 | `src/pages/novels/episode-005.md` |
| `/novels/episode-006/` | 6화 | `src/pages/novels/episode-006.md` |
| `/music/` | Music Archive | `src/pages/music/index.astro` |
| `/music/archive-vol-1/` | ARCHIVE vol.1 앨범 상세 | `src/pages/music/archive-vol-1.astro` |
| `/profile/` | SunoFox 소개/필모그래피 | `src/pages/profile.astro` |
| `/updates/` | 공식 업데이트 로그 | `src/pages/updates.astro` |
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
| `/login` | 자체 로그인 | 인증 구조 변경 금지 |
| `/signup` | 입장 신청 | 인증 구조 변경 금지 |
| `/admin` | 승인/관리 화면 | 관리자 기능 변경 금지 |
| `/account` | 계정/입장 상태 | 인증 흐름 변경 금지, robots noindex/Disallow 유지 |
| `/api/auth/*` | 인증 API | 대규모 변경 금지 |
| `/api/community/*` | 레거시 커뮤니티 API | 삭제/DB 변경 금지 |

## Core Files

| 구분 | 경로 | 설명 |
|---|---|---|
| 공통 레이아웃 | `src/layouts/Layout.astro` | title, description, canonical, OG, Twitter card, footer |
| 에피소드 레이아웃 | `src/layouts/NovelEpisodeLayout.astro` | 본문, OST, 이전/다음/목록 이동 |
| 헤더/메뉴 | `src/components/SiteChrome.astro` | 고정 헤더와 오버레이 메뉴 |
| 사이트 데이터 집계 | `src/data/siteContent.js` | 프로필, JSON-LD 및 하위 데이터 re-export |
| 아티스트/OST 링크 데이터 | `src/data/artistContent.js` | YouTube, 음원 플랫폼, 대표 웹소설 OST 링크 |
| 음악 아카이브 데이터 | `src/data/musicContent.js` | 앨범, 음악 아카이브, YouTube/MV 허브 목록 |
| 웹소설 데이터 | `src/data/novelContent.js` | 작품 정보, 세계관, 인물, 에피소드 목록 |
| 메뉴 데이터 | `src/data/navigationContent.js` | 공개 overlay menu 항목 |
| 업데이트 데이터 | `src/data/updatesContent.js` | `/updates/` 공식 업데이트 로그 항목 |
| 전역 스타일 | `src/styles/global.css` | 모든 공개 페이지 UI |
| 정적 assets | `public/assets/` | 커버, 아이콘, 앨범 이미지 |
| Cloudflare 설정 | `wrangler.jsonc` | Pages output, KV/D1 binding, vars |
| headers/redirects | `_headers`, `_redirects`, `public/_headers`, `public/_redirects` | Cloudflare Pages 헤더/리다이렉트 |

## Operation Docs

| 문서 | 용도 |
|---|---|
| `docs/site-route-inventory.md` | 공개/보호 라우트, 콘텐츠 데이터 위치, 배포 후 확인 URL을 한 장으로 정리 |
| `docs/episode-release-checklist.md` | 신규 웹소설 회차 공개 전 콘텐츠, 파일, UI, 검증, 배포 체크리스트 |
| `docs/episode-authoring-template.md` | 신규 회차 데이터, frontmatter, 시즌/읽는 흐름 갱신 템플릿 |

## Content Model

웹소설은 현재 두 곳을 함께 갱신합니다.

1. 회차 목록/카드/메타: `src/data/novelContent.js`의 `novelEpisodes`
2. 실제 본문: `src/pages/novels/episode-00N.md`

공개 확정 전 내부 원고는 `src/pages/novels/`에 먼저 만들지 않습니다. 이 폴더에 `episode-00N.md`를 추가하면 링크를 숨겨도 Astro 빌드에서 공개 URL이 생성될 수 있으므로, 7화나 시즌2 초안은 공개 확정 후 route 파일로 옮깁니다.
`npm run check:content`는 `novelEpisodes`에 공개 회차로 등록되지 않은 `src/pages/novels/episode-00N.md` 파일을 발견하면 실패합니다.

회차별 공유 카드 문구는 `src/data/novelContent.js`의 `shareTitle`, `shareDescription`, `shareImageAlt`, `shareTags`에서 관리합니다. `shareTitle`은 OG/Twitter 제목에 사용하고, `shareDescription`은 meta description, OG/Twitter description, Article JSON-LD description에 사용하며, `shareImageAlt`는 에피소드별 OG/Twitter 이미지 alt에 사용합니다.
OST와 YouTube 연결은 `src/data/artistContent.js`의 `artistLinks`, `featuredStoryOst`, `src/data/musicContent.js`의 `musicArchive`, `archiveAlbum`, 그리고 `src/data/siteContent.js`의 `sunofoxProfile`에서 관리합니다.
메뉴 항목은 `src/data/navigationContent.js`, 업데이트 로그 항목은 `src/data/updatesContent.js`에서 관리하고 `siteContent.js`가 기존 import 호환을 위해 다시 export합니다.

작품 목록과 에피소드 상세의 JSON-LD는 `src/data/siteContent.js`에서 생성합니다.
`/novels/`는 `CreativeWorkSeries`와 `BreadcrumbList`, 각 `/novels/episode-00N/`은 `Article`과 `BreadcrumbList`를 함께 출력합니다.

## Scripts

| script | command | 용도 |
|---|---|---|
| `npm run dev` | `astro dev` | 로컬 개발 서버 |
| `npm run build` | `astro build && node scripts/version-auth-assets.mjs` | 정적 빌드와 auth asset versioning |
| `npm run lint` | `npm run build && npm run check:seo && npm run check:a11y` | standalone 공유 메타/접근성 정적 점검 |
| `npm run test` | `npm run build && npm run check` | standalone 배포 전 전체 검증 |
| `npm run check` | `npm run check:content && npm run check:korean-reader && npm run check:music && npm run check:profile && npm run check:navigation && npm run check:updates && npm run check:dist && npm run check:seo && npm run check:a11y && npm run check:mobile-css && npm run check:public-routes` | 배포 전 콘텐츠/한글 병기/음악/프로필/메뉴 데이터/asset/SEO/접근성/모바일 CSS/공개 라우트 통합 검증 |
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
11. `npx wrangler pages deploy dist --project-name sf-studio --branch main`
12. `npx wrangler pages deployment list --project-name sf-studio`
13. `npm run check:production`
14. `npm run check:production-seo`
15. 운영 URL HTTP 200과 핵심 문자열 확인

`check:content`는 `src/data/siteContent.js`의 `novelEpisodes`와 `src/pages/novels/episode-00N.md` frontmatter의 title, canonical, publishedAt, readTime, 이전/다음 링크, 공유 제목/설명/태그를 비교합니다. 또한 `/novels/`의 `readingPath`가 공개 회차를 빠짐없이 덮고 각 구간의 첫 화로 연결되는지 확인하며, 공개 데이터에 없는 에피소드 route 파일이 실수로 배포되지 않도록 실패 처리합니다. 세계관/캐릭터 카드의 `id`와 `/novels/#...` 앵커도 함께 검증합니다.
`check:korean-reader`는 에피소드 본문과 시스템 문구에 영어 문장이 들어갈 경우 같은 줄에 한글 설명 또는 괄호 병기가 있는지 확인합니다.
`check:music`은 대표 OST, YouTube/MV 영상 목록, 영상 허브 요약/필수 링크, ARCHIVE vol.1 트랙 순서, 영상 ID와 썸네일 URL의 일치 여부를 확인합니다.
`check:profile`은 SunoFox 소개 페이지의 허브 카드, quick action, 필모그래피 탭, YouTube 영상 링크, 출처 링크가 기본 구조를 유지하는지 확인합니다.
`check:updates`는 Updates의 고정 공지, 카테고리별 기록, 공식 허브 상태, 링크가 없는 대기 허브의 사유와 공개 전 확인 필요 항목, 업데이트 링크 구조를 확인합니다.
`check:navigation`은 오버레이 메뉴의 `홈`, `소개`, `소설 보러가기`, `음악`, `업데이트`, `스튜디오` 라벨과 내부 canonical href, compact hierarchy를 확인하고, 푸터의 `소설`, `음악`, `소개`, `업데이트`, `개인정보`, `이용약관` 링크 순서도 함께 검증합니다.
`check:dist`는 빌드된 공개 HTML/CSS/manifest의 내부 링크, 이미지, asset 경로가 `dist` 안에 실제 존재하는지 확인합니다. 보호/운영 HTML인 `/mv-studio`, `/login`, `/signup`, `/admin`, `/account` 계열은 구조 변경 승인 범위와 분리해 제외합니다.
`check:seo`는 홈, 작품 목록, 1~6화 상세, Music Archive, 앨범 상세, Profile, Updates의 title, description, canonical, OG/Twitter card, 회차별 공유 문구, JSON-LD 기본 타입을 확인합니다.
`check:a11y`는 공개 HTML의 lang, viewport, h1, 이미지 alt, 링크/버튼 접근 가능한 이름, 새 탭 링크 rel 값을 확인합니다.
`check:mobile-css`는 모바일에서 메뉴, CTA, 소설 탭, 회차 이동, 에피소드/음악 보조 링크, 음악 아카이브 버튼이 최소 터치 영역과 줄바꿈 방어 규칙을 유지하는지 확인합니다.
`check:public-routes`는 홈, 작품 목록, 1~6화 상세, Music Archive, 앨범 상세, Profile, Updates, custom 404, sitemap-index, legacy sitemap, sitemap, robots의 sitemap 연결과 보호 경로 Disallow 정책을 확인합니다. 에피소드 상세는 본문/전체 회차/OST 내부 이동, 이전/다음/목록/OST 하단 이동 마커를 함께 확인합니다. 로컬 `dist` 검증에서는 `_headers`의 `/robots.txt` 블록이 `Cache-Control`, `CDN-Cache-Control`, `Cloudflare-CDN-Cache-Control`로 짧은 재검증 정책을 유지하는지도 함께 확인합니다. `robots.txt`는 `/account`, `/admin`, `/api/`, `/login`, `/signup`, `/mv-studio`를 Disallow해야 합니다. `sitemap-0.xml`에는 공개 URL이 포함되어야 하고 `/admin`, `/api/`, `/login`, `/signup`, `/mv-studio`, `/account`, 레거시 커뮤니티/뉴스/미디어/굿즈 계열 URL은 포함되면 실패합니다. 운영 URL 모드에서는 존재하지 않는 probe URL이 홈 fallback 200이 아니라 404로 응답하는지도 확인합니다.
`check:production-seo`는 같은 SEO 검증 기준을 운영 도메인 HTML에 적용해 배포 후 title, description, OG/Twitter card, JSON-LD 반영 여부를 확인합니다.
작품 목록과 에피소드 상세는 Breadcrumb JSON-LD, 에피소드는 article publish meta도 함께 검증합니다.
모바일 검증 시 공개 CTA, 작품 탭, footer 링크는 44px 안팎의 터치 영역을 유지해야 합니다.

배포 후 최소 확인 URL:

```text
https://sunofox.com/
https://sunofox.com/novels/
https://sunofox.com/novels/episode-006/
https://sunofox.com/music/
https://sunofox.com/music/archive-vol-1/
https://sunofox.com/profile/
https://sunofox.com/updates/
https://sunofox.com/__sunofox_not_found_probe__/
https://sunofox.com/sitemap.xml
https://sunofox.com/sitemap-0.xml
https://sunofox.com/robots.txt
```

## Boundaries

승인 없이 진행 가능한 작업:

- README/문서 최신화
- 공개 라우트 문구/CTA 개선
- `/music/`, `/novels/`, 에피소드 페이지 접근성 개선
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
- `/mv-studio`, `/login`, `/signup`, `/admin` 구조 변경
- 기존 공개 URL 변경
- 콘텐츠 대량 삭제
- 에피소드 본문 대량 변환
- `_headers/_redirects` 대규모 정리

## Bridge Extension

브릿지 확장 프로그램은 기존 운영 버전을 유지합니다.

- 패키지: `public/extensions/sf-midjourney-bridge-v1.5.17.zip`
- 소스: `public/extensions/midjourney-bridge`
- Chrome 확장 이름: `SF 미디어 브릿지`
- required version: `1.5.17`

기능 변경 없이 새 도메인 권한만 관리합니다.
