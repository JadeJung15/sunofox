# Changelog

## 2026-06-16

### Improved

- 6화 완결화 하단에 미니시즌 완료 안내와 소설 목록, 음악 아카이브, SunoFox 소개 CTA를 추가하고 공개 라우트 검증이 해당 완료 흐름을 확인하도록 보강했습니다.
- Updates 확장 현황의 굿즈샵/팬 커뮤니티 대기 허브에 공개 전 확인 필요 항목을 데이터화하고, 화면과 `check:updates`/공개 라우트 검증에서 확인하도록 보강했습니다.
- `/music/` YouTube/MV 허브의 직접 CTA와 대표 영상 카드에 안정적인 `data-video-*` 마커를 추가하고, `check:music`과 공개 라우트 검증이 영상 허브 구조를 확인하도록 보강했습니다.
- 푸터 링크를 `footerItems` 데이터로 분리하고 `check:navigation`과 공개 라우트 검증이 푸터 허브 링크 계약을 확인하도록 보강했습니다.
- 에피소드 상세의 본문/전체 회차/OST, 이전/다음/목록/OST 이동 링크에 안정적인 검증 마커를 추가하고 `check:public-routes`가 이를 확인하도록 보강했습니다.
- `check:public-routes`가 로컬 `dist/_headers`의 `/robots.txt` 캐시 방어 헤더를 검증하도록 보강했습니다.
- `/robots.txt`에 `CDN-Cache-Control`과 `Cloudflare-CDN-Cache-Control`을 추가해 Cloudflare CDN stale robots 응답 재발 가능성을 줄였습니다.
- `check:public-routes`가 표에서 실패를 표시하고도 종료코드 0으로 끝나지 않도록 실패 판정을 명시적으로 보강했습니다.
- `robots.txt` 생성 소스와 공개 라우트 검증에 `/account` Disallow를 추가해 보호 라우트 노출 정책을 문서와 맞췄습니다.
- `check:public-routes`가 `sitemap-0.xml`의 공개 URL 포함과 보호/숨김 URL 미노출을 함께 검증하도록 보강했습니다.
- `check:navigation`을 추가해 공개 오버레이 메뉴의 한국어 라벨, 순서, 내부 canonical href, 업데이트 보조 계층이 배포 전 검증되도록 했습니다.
- README, 라우트 인벤토리, 회차 공개 체크리스트, Profile 설명 메타의 `Music/Studio` 잔여 표현을 현재 화면 기준인 음악/스튜디오 라벨에 맞춰 정리했습니다.
- 오버레이 메뉴와 홈/소설/음악 허브 CTA에 남아 있던 영문 행동 라벨을 한국어 중심으로 정리하고, 홈 공개 라우트 검증이 `음악 보기`와 `스튜디오` 라벨을 확인하도록 보강했습니다.
- `/novels/` 내부 탭과 앵커 이동 시 고정 헤더가 섹션 제목을 덮지 않도록 주요 섹션의 스크롤 여백을 보강했습니다.
- `/novels/` 모바일 목록의 공개 요약 정보를 2열 카드형으로 정리하고 회차 번호 배지를 보강해 1~6화 목록을 더 빠르게 훑을 수 있게 했습니다.
- 전체 공개 페이지 푸터의 주요 이동 링크 라벨을 한국어로 정리해 소설, 음악, 소개, 업데이트, 개인정보, 이용약관 목적지를 더 명확하게 표시했습니다.
- 404, Profile, Music Archive의 독자 행동 라벨을 한국어 기준으로 정리하고, `check:profile`과 공개 라우트 검증이 해당 라벨을 확인하도록 보강했습니다.
- `/music/archive-vol-1/` 하단 출처 링크를 `archiveAlbum.links` 기반 한국어 라벨로 통일하고, `check:music`이 앨범 외부 링크 목록까지 검증하도록 보강했습니다.
- `check:mobile-css`가 에피소드 상세 상단 보조 링크와 음악 상세 뒤로가기 링크의 44px 터치 영역을 검증하도록 보강했습니다.
- 에피소드 상세 상단 보조 링크와 음악 상세 뒤로가기 링크의 실제 터치 영역을 44px 기준으로 맞춰 모바일 조작 안정성을 보강했습니다.
- `check:seo`에 운영 URL 모드를 추가하고 `npm run check:production-seo`로 `https://sunofox.com`의 title, description, OG/Twitter, JSON-LD를 배포 후 검증할 수 있게 했습니다.
- 에피소드별 `shareTitle`과 `shareDescription`을 추가하고, 회차 상세의 OG/Twitter 공유 제목·설명과 Article JSON-LD 설명이 회차별 문구를 사용하도록 보강했습니다.
- `check:content`와 `check:seo`가 회차별 공유 제목/설명 누락과 OG/Twitter/Article JSON-LD 반영 여부를 배포 전에 검증하도록 확장했습니다.
- `/novels/` 목록 상단을 `READ ORDER` 중심으로 재구성해 1화 정주행, 완결화 보기, OST 감상, 음악 아카이브 CTA를 한 번에 고를 수 있게 했습니다.
- `/novels/` 회차 행의 우측 배지를 상태 중심에서 `읽기`/`완결화 읽기` 행동 중심으로 바꿔 독자가 목록에서 바로 클릭 의도를 이해할 수 있게 했습니다.
- `npm run check:profile`을 추가해 SunoFox 소개/필모그래피 허브, 탭, quick action, YouTube 영상 링크, 출처 링크 데이터가 깨지지 않는지 배포 전 검증하도록 했습니다.
- `npm run check:korean-reader`를 추가해 에피소드 본문과 시스템 영어 문장이 같은 줄에 한글 병기를 포함하는지 배포 전 검증하도록 했습니다.
- `npm run check:mobile-css`를 추가해 모바일 메뉴, CTA, 소설 탭, 회차 이동, Music Archive 버튼의 터치 영역과 줄바꿈 CSS 계약을 배포 전 검증하도록 했습니다.
- `check:content`가 `/novels/` 세계관과 캐릭터 카드의 `id`, `href`, 필수 설명 필드를 검증하도록 보강해 내부 앵커가 깨지는 문제를 배포 전에 잡을 수 있게 했습니다.
- `check:content`가 `novelEpisodes`에 없는 `src/pages/novels/episode-00N.md` 파일을 실패 처리하도록 보강해, 내부 초안이나 미승인 회차가 Astro 공개 route로 배포되는 사고를 막습니다.
- `/music/` 상단과 YouTube/MV 허브에 YouTube 채널, 재생목록, 최신 영상 감상 CTA를 추가해 OST와 영상 콘텐츠 접근성을 보강했습니다.
- 모바일 작품/프로필 탭을 화면 안에서 바로 보이는 그리드형 터치 영역으로 정리하고, 메뉴 버튼의 실제 클릭 박스를 44px 이상으로 고정했습니다.
- 공개 라우트 검증이 1~6화 상세의 Article JSON-LD, 회차 요약(`abstract`), 읽기 시간(`timeRequired`)을 함께 확인하도록 확장했습니다.
- 에피소드 Article JSON-LD에 회차 요약(`abstract`)과 읽기 시간(`timeRequired`)을 추가하고, `check:seo`가 1~6화 구조화 데이터 값을 배포 전 검증하도록 보강했습니다.
- 6화 상세의 다음 화 비활성 문구를 `미니시즌 1 완결`로 표시해 최종화에서 독자가 시즌 완료 상태를 바로 이해할 수 있게 했습니다.
- 6화 최종화 상태 검증을 한글 문자열 직접 매칭 대신 `season-final` 상태 마커로 확인하도록 보강해 운영 HTTP 검증의 인코딩 영향을 줄였습니다.
- 홈 첫 화면에 공개 회차, 읽는 순서, 확장 방향 상태 정보를 추가하고 모바일에서는 세로 스택으로 표시해 소설/Music/Studio CTA와 겹치지 않도록 보강했습니다.
- 7화 또는 시즌2 공개 전 route가 먼저 생성되지 않도록 신규 회차 데이터/frontmatter/시즌 갱신 기준을 `docs/episode-authoring-template.md`로 정리하고 공개 체크리스트에 연결했습니다.
- `/music/` YouTube/MV 영상 허브에 유형별 빠른 이동 앵커와 카드별 target 상태를 추가해 대표 OST, Live Archive, Anime OP, Dark Fantasy OST 영상을 더 빠르게 찾을 수 있게 했습니다.
- 에피소드 상세 상단에 `본문 읽기`, `전체 회차`, `회차 OST` 내부 이동과 회차 진행 표시를 추가해 모바일 독자가 바로 읽기 흐름을 잡을 수 있게 했습니다.
- `/novels/` 세계관과 주요 인물 섹션에 빠른 이동 앵커와 카드별 상태 정보를 추가해 작품 허브에서 설정과 캐릭터를 더 쉽게 훑을 수 있게 했습니다.
- custom 404 페이지를 추가하고 운영 라우트 검증에서 없는 URL이 홈 fallback 200이 아니라 404로 응답하는지 확인하도록 보강했습니다.
- `/profile/`에 공식 허브 스냅샷과 빠른 이동 CTA를 추가해 웹소설, Music Archive, YouTube/MV, Studio 진입점을 필모그래피 상단에서 바로 확인할 수 있게 했습니다.
- `/updates/`에 1~6화 미니시즌 고정 공지와 카테고리별 기록 섹션을 추가해 공지/웹소설/Music/사이트 개선 이력을 더 빠르게 찾을 수 있게 했습니다.
- `/novels/`에 1~6화 미니시즌 완결 상태와 정주행 CTA를 추가하고, 에피소드 상세 요약에도 시즌 상태를 표시하도록 정리했습니다.
- `/updates/`를 공식 콘텐츠 허브 상태판으로 보강해 공지, 사이트 개선, 굿즈샵, 팬 커뮤니티의 공개/대기 조건을 더 명확히 표시하고 `check:updates` 검증을 추가했습니다.
- 웹소설 회차에 `ostKey`를 추가하고 에피소드 상세의 OST 블록이 해당 키를 통해 표시되도록 정리해, 7화 이후 회차별 OST/YouTube 매핑을 쉽게 확장할 수 있게 했습니다.
- 전체 공개 페이지의 Open Graph/Twitter 공유 메타를 보강하고, `check:seo`가 site name, locale, Twitter URL, secure image, article updated time을 함께 검증하도록 강화했습니다.
- `/novels/` 목록과 에피소드 상세의 긴 회차명, 키워드 칩, 이전/다음 이동 문구가 모바일에서 넘치지 않도록 줄바꿈과 터치 영역 안정성을 보강했습니다.
- `/music/` YouTube/MV 카드의 긴 영상 제목, 메타, 타입 라벨이 좁은 화면에서 넘치지 않도록 텍스트 줄바꿈 방어를 보강했습니다.
- `npm run check:music`을 추가해 대표 OST, YouTube/MV 영상 목록, 앨범 트랙 순서, 영상 ID와 썸네일 URL 일치를 배포 전 검증합니다.
- `check:content`가 `/novels/` 읽는 흐름 데이터의 구간 형식, 공개 회차 포함 여부, 구간 첫 화 링크를 검증하도록 보강했습니다.
- `npm run check:production`을 추가해 Cloudflare Pages 배포 후 운영 도메인의 공개 라우트를 같은 검증 스크립트로 확인할 수 있게 했습니다.
- `npm run lint`와 `npm run test`를 추가해 공유 메타/접근성 점검과 배포 전 전체 검증을 표준 npm 명령으로 실행할 수 있게 했습니다.
- 에피소드 상세에 전체 회차 레일을 추가해 최신화에서도 다른 회차로 바로 이동할 수 있게 했습니다.
- `/novels/` 목록에 1~2화, 3~4화, 5~6화 단위의 읽는 흐름 요약을 추가해 모바일에서 회차 진입점을 더 빠르게 고를 수 있게 했습니다.
- `/updates/`에 웹소설, Music/MV, 세계관, 굿즈샵, 팬 커뮤니티의 공식 허브 확장 상태를 추가하고 깨진 외부 링크 없이 준비 중 항목을 표시했습니다.
- 공통 skip link와 `main-content` 대상 검증을 추가해 키보드 사용자가 공개 페이지 본문으로 바로 이동할 수 있게 했습니다.
- 공통 SEO meta에 `author`, `article:author`, `og:image:type`을 추가하고 공유 메타 검증 범위를 보강했습니다.
- 에피소드 상세 상단에 회차 위치, 공개일, 읽기 시간, 키워드를 요약하는 독자용 읽기 정보를 추가했습니다.
- `/novels/` 목록에 공개 회차, 누적 예상 읽기 시간, 최신 공개일, 현재 공개 상태를 요약하는 독자용 정보를 추가했습니다.
- `/music/` YouTube/MV 허브에 영상 수, 최근 공개일, 대표 분류, 기록 범위를 요약하는 스캔용 정보를 추가했습니다.
- 공통 footer에 `NOVELS`, `MUSIC`, `PROFILE` 허브 링크를 추가해 어느 페이지에서든 주요 콘텐츠 허브로 이동하기 쉽게 했습니다.
- `/novels/` 회차 목록에 회차별 공유 태그를 노출해 최신화와 주요 사건 키워드를 더 빠르게 스캔할 수 있게 했습니다.
- `robots.txt` 생성 소스와 루트 참고 파일의 sitemap 기준을 `sitemap-index.xml`로 맞추고, 보호 경로 Disallow 검증을 공개 라우트 체크에 추가했습니다.
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
- `/updates/`에 공지/운영, 웹소설, Music/MV 카테고리 허브를 추가하고 공개 라우트 검증 범위를 보강했습니다.
- `docs/site-route-inventory.md`를 추가해 공개/보호 라우트, 콘텐츠 데이터 위치, 배포 후 확인 URL을 운영 문서로 분리했습니다.
- 에피소드 상세 상단에 이전/목록/다음 빠른 이동을 추가하고, 모바일 회차 목록의 터치 영역과 카드형 여백을 보강했습니다.
- 에피소드별 공유 태그를 데이터화하고 `meta keywords`, `article:section`, `article:tag`, Article JSON-LD 키워드 검증을 보강했습니다.
- `check:content`가 공개 회차별 `shareTags` 배열, 중복, 빈 값, 회차 고유 태그 누락을 검증하도록 보강했습니다.

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
