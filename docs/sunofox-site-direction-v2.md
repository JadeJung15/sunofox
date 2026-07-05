# SunoFox Site Direction v2

Last locked: 2026-07-05

이 문서는 SunoFox 공개 사이트 리뉴얼의 기준서입니다. 기존 쇼케이스 구조에 얽매이지 않고, 공개 사이트를 YouTube 구독과 음원 스트리밍 전환 중심으로 다시 제작합니다.

## Fixed Site Type

SunoFox 공개 사이트는 일반 브랜드 소개형이나 Story IP 우선 랜딩이 아니라, **Original Anime OST Music + YouTube-first Music Funnel**입니다.

핵심 문장:

> SunoFox creates original Anime OST music and music videos.

한국어 기준:

> SunoFox는 애니메이션 감성의 오리지널 OST와 MV를 만드는 음악 채널/스튜디오입니다.

## Goals

| 우선순위 | 목표 | 화면 처리 |
|---|---|---|
| 1 | YouTube 구독 증가 | Hero와 모바일 고정 CTA에 YouTube 구독 버튼 노출 |
| 2 | 음원 스트리밍 전환 | Hero 직후와 Featured OST에서 플랫폼 링크 노출 |
| 3 | 최신 영상 소비 | 최신 OST/MV 3~4개를 홈에서 바로 탐색 |
| 4 | Story IP 이해 | 홈 하단 보조 섹션으로 유지 |

## Information Priority

1. SunoFox가 애니메이션 OST/MV를 만드는 채널이라는 점
2. 대표 영상 또는 최신 OST 영상
3. YouTube 구독 CTA
4. 음원 스트리밍 CTA
5. 최신 영상 목록
6. 대표 앨범/OST
7. Story IP preview
8. About, Updates, Studio 보조 이동

## Page Roles

| Route | 고정 역할 |
|---|---|
| `/` | Watch + Listen 중심 퍼널 홈 |
| `/music/` | Listen / OST Archive |
| `/music/archive-vol-1/` | 대표 앨범 상세 |
| `/novels/` | Story IP와 웹소설 진입 |
| `/profile/` | About / 채널 소개 |
| `/updates/` | 릴리즈와 공지 |
| `/login/`, `/signup/`, `/account/`, `/admin/`, `/mv-studio/` | 내부/보호 흐름. 공개 사이트 리뉴얼과 분리 |

## Navigation

| Label | Target |
|---|---|
| Watch | `/` |
| Listen | `/music/#musicLinkHub` |
| OST Archive | `/music/` |
| Story IP | `/novels/` |
| About | `/profile/` |
| Studio | `/login?next=/mv-studio` 보조 메뉴 |

## Visual Direction

| 항목 | 기준 |
|---|---|
| 배경 | 깊은 블랙 네이비 |
| 하이라이트 | YouTube Red, Streaming Gold, OST Cyan |
| 이미지 | 실제 YouTube 썸네일, 앨범 커버, MV 프레임, 기존 브랜드 에셋 |
| 레이아웃 | Hero는 영상/썸네일과 CTA 중심 |
| CTA | YouTube 구독하기 -> 음원 바로 듣기 -> 최신 영상 보기 |
| 모션 | hover, focus, section fade 수준 |

## Do

- 첫 화면에서 YouTube 구독과 음원 듣기 CTA가 보여야 합니다.
- 홈 첫 화면의 주인공은 대표 영상/최신 영상이어야 합니다.
- Story IP는 유지하되 홈에서는 보조 콘텐츠로 둡니다.
- 신규 DB, Firestore, Storage를 도입하지 않습니다.
- Studio와 브릿지 흐름을 공개 사이트 리뉴얼에 섞지 않습니다.
- 실제 운영 전 desktop 1440/1024, mobile 390/430을 확인합니다.

## Do Not

- 생성 이미지 후보를 기본 hero 이미지로 쓰지 않습니다.
- 추상 그라데이션만 있는 Hero를 만들지 않습니다.
- Story IP가 홈의 1순위 CTA를 가져가지 않게 합니다.
- 무거운 3D, autoplay 배경 영상, 의미 없는 장식을 넣지 않습니다.
- UI 카드를 중첩 카드로 만들지 않습니다.
- Studio, 인증, 승인, 브릿지 파일을 리뉴얼 범위에 끌어들이지 않습니다.

## Acceptance Checklist

| 체크 | 기준 |
|---|---|
| 첫 화면 | YouTube 구독 CTA와 음원 CTA가 스크롤 없이 보임 |
| 최신 영상 | 홈에서 3개 이상 노출 |
| 스트리밍 | 주요 플랫폼 버튼이 Hero 또는 Hero 직후 노출 |
| 모바일 | 하단 고정 CTA가 보이고 본문을 가리지 않음 |
| Story IP | 보조 섹션으로 유지 |
| 기존 페이지 | `/music/`, `/novels/`, `/profile/`, `/updates/` 접근 유지 |
| Studio | `/mv-studio`와 인증/브릿지 흐름 변경 없음 |
