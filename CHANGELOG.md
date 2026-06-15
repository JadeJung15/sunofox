# Changelog

## 2026-06-16

### Improved

- `/sitemap.xml` legacy 호환 XML 라우트를 추가해 sitemap 요청이 HTML fallback으로 오인되지 않도록 정리했습니다.
- 공개 라우트 검증 스크립트가 `/sitemap.xml`도 XML sitemap index로 확인하도록 보강했습니다.
- `npm run check` 통합 스크립트를 추가해 콘텐츠, dist asset, 공개 라우트 검증을 배포 전 한 번에 실행할 수 있게 했습니다.
- `npm run check:seo`를 추가해 공개 HTML의 title, description, canonical, OG/Twitter card, JSON-LD 기본 타입을 배포 전에 점검합니다.
- `npm run check:a11y`를 추가해 공개 HTML의 lang, viewport, h1, 이미지 alt, 링크/버튼 접근 가능한 이름을 배포 전에 점검합니다.
- `siteContent.js`에서 메뉴 데이터와 업데이트 로그 데이터를 분리하고 기존 import 호환을 유지했습니다.
- `package.json`에 ESM 타입을 명시해 콘텐츠/SEO 검증 스크립트 실행 시 발생하던 Node 모듈 타입 경고를 제거했습니다.
- 대표 OST와 아티스트 외부 링크 데이터를 `artistContent.js`로 분리해 향후 OST/MV 허브 확장 범위를 좁혔습니다.
- 작품 정보, 세계관, 인물, 에피소드 목록을 `novelContent.js`로 분리해 신규 회차 추가 경로를 명확히 했습니다.
- 앨범, 음악 아카이브, YouTube/MV 허브 목록을 `musicContent.js`로 분리해 음악 콘텐츠 확장 경로를 명확히 했습니다.
- `/novels/` 소설 목록 상단에 최신화, 1화부터 읽기, OST, MUSIC 빠른 이동을 추가하고 모바일 회차 행 정렬을 보강했습니다.
- 에피소드 Article JSON-LD에 `mainEntityOfPage`, 수정일, 장르, 키워드, 회차 순서, publisher logo를 보강하고 SEO 검증 범위를 확장했습니다.
- 공개 라우트 검증 스크립트가 `/novels/` 빠른 이동, 1화부터 읽기, 최신 6화 문구를 함께 확인하도록 보강했습니다.
- `check:content`가 회차 데이터 필수값, 날짜 포맷, `publishedAt`/`isoDate` 일치, 공개 본문 누락 여부까지 확인하도록 보강했습니다.
- 공개 라우트 검증 스크립트가 `/music/`의 대표 OST, 앨범 카드, YouTube/MV 허브, 채널/재생목록 CTA, 최신화 연결을 확인하도록 보강했습니다.

## 2026-06-15

### Improved

- `npm run check:dist`를 추가해 빌드 산출물의 내부 링크와 asset 경로를 배포 전에 확인합니다.
- `npm run check:content`를 추가해 웹소설 목록 데이터와 에피소드 frontmatter 불일치를 배포 전에 확인합니다.
- `/novels/`와 1~6화 에피소드 상세에 Breadcrumb JSON-LD를 보강했습니다.
- 공개 라우트 검증 스크립트가 sitemap-index, 에피소드 article meta, Breadcrumb JSON-LD를 함께 확인하도록 확장했습니다.
- 모바일 공개 CTA, 작품 탭, footer 링크의 터치 영역 기준을 보강했습니다.
- 공개 라우트 검증 스크립트가 1~6화 전체 상세 페이지를 직접 확인하도록 범위를 넓혔습니다.
- `/novels/`에 작품 세계관과 주요 인물 요약 섹션을 추가했습니다.
- `/music/`에 YouTube/MV 영상 허브 요약, 대표 영상 카드, 채널/재생목록 CTA를 추가했습니다.
- 공개 라우트 검증 스크립트의 `/music/` 확인 범위에 영상 허브 핵심 문자열을 추가했습니다.
- 공식 업데이트 로그 라우트 `/updates/`를 추가하고 footer/overlay menu 진입점을 연결했습니다.
- 업데이트 로그용 CollectionPage JSON-LD와 모바일 목록 스타일을 추가했습니다.
- `npm run check:public-routes`를 추가해 공개 라우트가 홈 fallback 200으로 오인되지 않도록 핵심 문자열을 검증합니다.
- 공개 페이지의 일부 영어 CTA와 보조 라벨을 한글 중심 문구로 정리했습니다.
- 공통 OG/Twitter 공유 메타에 대표 이미지 크기 정보를 추가했습니다.
- 에피소드 상세 페이지에 `article:published_time`과 `article:modified_time` meta를 추가했습니다.
- `/music/` 및 앨범 상세 페이지의 메뉴 active 상태와 앨범 이미지 alt를 보강했습니다.
- `/novels/` 회차 목록에 최신화 표시와 읽기 시간 메타를 추가했습니다.
- 최신 공개화 상세 상단에 `최신화` 배지를 표시했습니다.
- 모바일 회차 목록에서 상태/읽기 시간 메타가 작은 칩으로 줄바꿈되도록 조정했습니다.

### Changed

- README를 현재 SunoFox 공식 사이트 운영 구조 기준으로 최신화했습니다.
- 공개 운영 라우트, 보호/운영 라우트, 배포 체크리스트, 변경 금지 경계를 문서화했습니다.
- 홈 히어로 CTA에서 `/music/` 내부 진입점을 명확히 노출했습니다.
- 오버레이 메뉴에 `MUSIC` 항목을 추가했습니다.

### Added

- `docs/episode-release-checklist.md`를 추가해 신규 웹소설 회차 공개 절차를 정리했습니다.
