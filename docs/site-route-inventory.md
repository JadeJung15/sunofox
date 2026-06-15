# Site Route Inventory

SunoFox 공식 사이트의 공개 라우트, 보호 라우트, 콘텐츠 데이터 위치를 한 장으로 확인하기 위한 운영 문서입니다.

Last verified: 2026-06-16

## Production

| 항목 | 값 |
|---|---|
| 운영 도메인 | `https://sunofox.com` |
| GitHub repo | `JadeJung15/sunofox` |
| 기본 브랜치 | `main` |
| Cloudflare Pages project | `sf-studio` |
| framework | Astro static site + Tailwind/Vite |
| package manager | npm |
| build output | `dist` |

## Public Routes

| Route | 용도 | 소스 | 배포 후 확인 |
|---|---|---|---|
| `/` | SunoFox 메인 | `src/pages/index.astro` | 200, 소설/Music/Studio CTA |
| `/novels/` | 웹소설 작품/회차 목록 | `src/pages/novels.astro` | 200, 1~6화 목록, 최신화 표시 |
| `/novels/episode-001/` | 1화 상세 | `src/pages/novels/episode-001.md` | 200, Article/Breadcrumb meta |
| `/novels/episode-002/` | 2화 상세 | `src/pages/novels/episode-002.md` | 200, 이전/다음 링크 |
| `/novels/episode-003/` | 3화 상세 | `src/pages/novels/episode-003.md` | 200, 이전/다음 링크 |
| `/novels/episode-004/` | 4화 상세 | `src/pages/novels/episode-004.md` | 200, 이전/다음 링크 |
| `/novels/episode-005/` | 5화 상세 | `src/pages/novels/episode-005.md` | 200, 이전/다음 링크 |
| `/novels/episode-006/` | 6화 상세 | `src/pages/novels/episode-006.md` | 200, 최신화 배지 |
| `/music/` | Music Archive / YouTube-MV 허브 | `src/pages/music/index.astro` | 200, 대표 OST, 앨범, 영상 허브 |
| `/music/archive-vol-1/` | ARCHIVE vol.1 앨범 상세 | `src/pages/music/archive-vol-1.astro` | 200, 트랙/앨범 정보 |
| `/profile/` | SunoFox 소개/필모그래피 | `src/pages/profile.astro` | 200, YouTube/Music/Novel 탭 |
| `/updates/` | 공식 업데이트 로그 | `src/pages/updates.astro` | 200, 카테고리 허브, 최근 업데이트 |
| `/privacy/` | 개인정보 처리방침 | `src/pages/privacy.astro` | 200 |
| `/terms/` | 이용약관 | `src/pages/terms.astro` | 200 |
| `/robots.txt` | robots | `src/pages/robots.txt.ts` | 200, sitemap-index 연결 |
| `/sitemap-index.xml` | sitemap index | `@astrojs/sitemap` | 200, `sitemap-0.xml` 연결 |
| `/sitemap.xml` | legacy sitemap index | `src/pages/sitemap.xml.ts` | 200, `sitemap-0.xml` 연결 |
| `/sitemap-0.xml` | public route sitemap | `@astrojs/sitemap` | 200, 공개 URL 포함 |

## Protected Or Operational Routes

아래 라우트는 공개 콘텐츠 개선 Cycle에서 구조를 변경하지 않습니다.

| Route | 용도 | 주의 |
|---|---|---|
| `/mv-studio` | SF Studio 제작 공간 | noindex 유지, 구조 변경 별도 승인 필요 |
| `/login` | 자체 로그인 | 인증 구조 변경 별도 승인 필요 |
| `/signup` | 입장 신청 | 신청/승인 흐름 변경 별도 승인 필요 |
| `/admin` | 승인/관리 화면 | 관리자 기능 변경 별도 승인 필요 |
| `/account` | 계정/입장 상태 | 인증 흐름 변경 별도 승인 필요 |
| `/api/*` | Pages Functions/API | Functions, KV, D1 변경 별도 승인 필요 |

## Content Sources

| 콘텐츠 | 파일 | 신규 추가 시 확인 |
|---|---|---|
| 공개 메뉴 | `src/data/navigationContent.js` | overlay menu 라벨, active 상태 |
| 웹소설 작품 정보 | `src/data/novelContent.js` | 작품 요약, 세계관, 인물, 회차 목록, 회차별 공유 태그 |
| 회차 본문 | `src/pages/novels/episode-00N.md` | frontmatter, 이전/다음 링크, 본문 |
| 대표 OST/외부 링크 | `src/data/artistContent.js` | YouTube/음원 링크, 썸네일 alt |
| Music Archive | `src/data/musicContent.js` | 앨범, 영상 허브, 외부 소스 |
| 업데이트 로그 | `src/data/updatesContent.js` | 카테고리, 링크, 최근 변경 |
| JSON-LD/SEO 데이터 | `src/data/siteContent.js` | Organization, CreativeWorkSeries, Article, Breadcrumb |
| 공통 meta/layout | `src/layouts/Layout.astro` | title, description, canonical, OG/Twitter |
| 에피소드 레이아웃 | `src/layouts/NovelEpisodeLayout.astro` | 본문, OST, 이전/다음/목록 CTA |
| 전역 스타일 | `src/styles/global.css` | 모바일 간격, 버튼 터치 영역, 다크 판타지 톤 |

## Release Gates

배포 전에는 최소 아래 명령을 통과해야 합니다.

```powershell
git status -sb
git log --oneline -5
npm run build
npm run check
```

`npm run check`는 다음 범위를 포함합니다.

| check | 확인 범위 |
|---|---|
| `check:content` | `novelContent.js`와 1~6화 frontmatter/본문/shareTags 일치 |
| `check:dist` | 빌드 산출물의 내부 링크, 이미지, asset 존재 |
| `check:seo` | title, description, canonical, OG/Twitter, JSON-LD |
| `check:a11y` | lang, viewport, h1, alt, 링크/버튼 이름, 새 탭 rel |
| `check:public-routes` | 공개 URL 200과 핵심 문자열 |

## Post Deploy Verification

production 배포 후 아래 URL을 확인합니다.

```text
https://sunofox.com/
https://sunofox.com/novels/
https://sunofox.com/novels/episode-006/
https://sunofox.com/music/
https://sunofox.com/music/archive-vol-1/
https://sunofox.com/profile/
https://sunofox.com/updates/
https://sunofox.com/sitemap-0.xml
https://sunofox.com/robots.txt
```

권장 명령:

```powershell
npx wrangler pages deployment list --project-name sf-studio
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/check-public-routes.ps1 -BaseUrl https://sunofox.com
```

## Expansion Queue

| 기능 | 현재 상태 | 다음 작업 |
|---|---|---|
| 웹소설 연재 허브 | 1~6화 공개 | 7화 추가 구조 또는 시즌2 티저 결정 |
| OST/음악 아카이브 | 대표 OST, ARCHIVE vol.1, 영상 허브 운영 | 회차별 OST 매핑 데이터화 |
| 세계관/캐릭터 | `/novels/`에 요약 섹션 운영 | 캐릭터 상세 탭 또는 별도 섹션 확장 |
| 공지/업데이트 | `/updates/` 카테고리 허브 운영 | 공지 유형별 필터 또는 고정 공지 추가 |
| 굿즈샵 | 미운영 | 사용자 확인 후 외부 링크만 추가 |
| 팬 커뮤니티 | 미운영 | 사용자 확인 후 커뮤니티 진입점 정책 결정 |
