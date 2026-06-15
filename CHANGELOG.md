# Changelog

## 2026-06-16

### Improved

- `/sitemap.xml` legacy 호환 XML 라우트를 추가해 sitemap 요청이 HTML fallback으로 오인되지 않도록 정리했습니다.
- 공개 라우트 검증 스크립트가 `/sitemap.xml`도 XML sitemap index로 확인하도록 보강했습니다.
- `npm run check` 통합 스크립트를 추가해 콘텐츠, dist asset, 공개 라우트 검증을 배포 전 한 번에 실행할 수 있게 했습니다.

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
