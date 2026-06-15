# SunoFox Official Site

SunoFox 공식 사이트는 음악에서 시작한 감정과 장면을 웹소설, OST, Music Archive, Studio 제작 흐름으로 확장하는 Cloudflare Pages 기반 정적 사이트입니다.

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
| 공개 사이트 방향 | 웹소설 연재 허브, OST/음악 아카이브, SunoFox 소개, Studio 진입 |
| 접근 모델 | 공개 사이트 + SF Studio 자체 승인/로그인 |

## Public Routes

아래 URL은 운영 URL로 유지해야 합니다.

| Route | 용도 | 소스 |
|---|---|---|
| `/` | SunoFox 메인 | `src/pages/index.astro` |
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
| `/api/auth/*` | 인증 API | 대규모 변경 금지 |
| `/api/community/*` | 레거시 커뮤니티 API | 삭제/DB 변경 금지 |

## Core Files

| 구분 | 경로 | 설명 |
|---|---|---|
| 공통 레이아웃 | `src/layouts/Layout.astro` | title, description, canonical, OG, Twitter card, footer |
| 에피소드 레이아웃 | `src/layouts/NovelEpisodeLayout.astro` | 본문, OST, 이전/다음/목록 이동 |
| 헤더/메뉴 | `src/components/SiteChrome.astro` | 고정 헤더와 오버레이 메뉴 |
| 사이트 데이터 | `src/data/siteContent.js` | 메뉴, 에피소드 목록, OST, 음악 아카이브, JSON-LD |
| 전역 스타일 | `src/styles/global.css` | 모든 공개 페이지 UI |
| 정적 assets | `public/assets/` | 커버, 아이콘, 앨범 이미지 |
| Cloudflare 설정 | `wrangler.jsonc` | Pages output, KV/D1 binding, vars |
| headers/redirects | `_headers`, `_redirects`, `public/_headers`, `public/_redirects` | Cloudflare Pages 헤더/리다이렉트 |

## Content Model

웹소설은 현재 두 곳을 함께 갱신합니다.

1. 회차 목록/카드/메타: `src/data/siteContent.js`의 `novelEpisodes`
2. 실제 본문: `src/pages/novels/episode-00N.md`

OST와 YouTube 연결은 `src/data/siteContent.js`의 `artistLinks`, `featuredStoryOst`, `musicArchive`, `sunofoxProfile`에서 관리합니다.

작품 목록과 에피소드 상세의 JSON-LD는 `src/data/siteContent.js`에서 생성합니다.
`/novels/`는 `CreativeWorkSeries`와 `BreadcrumbList`, 각 `/novels/episode-00N/`은 `Article`과 `BreadcrumbList`를 함께 출력합니다.

## Scripts

| script | command | 용도 |
|---|---|---|
| `npm run dev` | `astro dev` | 로컬 개발 서버 |
| `npm run build` | `astro build && node scripts/version-auth-assets.mjs` | 정적 빌드와 auth asset versioning |
| `npm run check:public-routes` | `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/check-public-routes.ps1` | `dist` 기준 공개 라우트와 1~6화 핵심 문자열 확인 |
| `npm run check:content` | `node scripts/check-content-consistency.mjs` | 웹소설 목록 데이터와 에피소드 frontmatter 일치 확인 |
| `npm run check:dist` | `node scripts/check-dist-integrity.mjs` | 공개 `dist` 내부 링크와 이미지/asset 경로 존재 확인 |
| `npm run preview` | `astro preview` | 빌드 결과 미리보기 |
| `npm run pages:dev` | `npm run build && wrangler pages dev dist --compatibility-date=2026-06-07` | Cloudflare Pages 로컬 검증 |
| `npm run deploy:preview` | `npm run build && wrangler pages deploy dist --project-name sf-studio --branch astro-redesign` | preview 배포 |
| `npm run deploy:production` | `npm run build && wrangler pages deploy dist --project-name sf-studio --branch main` | production 배포 |
| `npm run check:admin-oauth` | PowerShell checker | 관리자 OAuth 패널 정적 확인 |
| `npm run check:admin-feedback` | PowerShell checker | 관리자 피드백 요약 확인 |

`lint`와 `test` script는 아직 없습니다.

## Deployment Checklist

production 반영 전 기본 순서입니다.

1. `git status -sb`
2. `git log --oneline -5`
3. `npm run build`
4. `npm run check:content`
5. `npm run check:dist`
6. `npm run check:public-routes`
7. 주요 로컬/빌드 산출물 확인
8. `git add ...`
9. `git commit -m "..."`
10. `git push origin main`
11. `npx wrangler pages deploy dist --project-name sf-studio --branch main`
12. `npx wrangler pages deployment list --project-name sf-studio`
13. 운영 URL HTTP 200과 핵심 문자열 확인

`check:content`는 `src/data/siteContent.js`의 `novelEpisodes`와 `src/pages/novels/episode-00N.md` frontmatter의 title, canonical, publishedAt, readTime, 이전/다음 링크를 비교합니다.
`check:dist`는 빌드된 공개 HTML/CSS/manifest의 내부 링크, 이미지, asset 경로가 `dist` 안에 실제 존재하는지 확인합니다. 보호/운영 HTML인 `/mv-studio`, `/login`, `/signup`, `/admin`, `/account` 계열은 구조 변경 승인 범위와 분리해 제외합니다.
`check:public-routes`는 홈, 작품 목록, 1~6화 상세, Music Archive, 앨범 상세, Profile, Updates, sitemap-index, legacy sitemap, sitemap, robots를 확인합니다.
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
