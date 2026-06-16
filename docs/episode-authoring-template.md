# Episode Authoring Template

SunoFox 웹소설 회차를 추가할 때 사용하는 작성 템플릿입니다.

이 문서는 공개 route를 바로 만들기 위한 파일이 아닙니다. 7화, 시즌2, 외전처럼 공개 여부가 확정되지 않은 원고는 `src/pages/novels/`에 먼저 만들지 않습니다. 이 폴더에 `episode-00N.md`를 추가하면 링크를 노출하지 않아도 Astro 빌드에서 공개 URL이 생성될 수 있습니다.

## 1. 공개 전 결정

| 항목 | 기준 |
|---|---|
| 공개 범위 | 7화 연속 공개 / 시즌2 1화 / 외전 / 비공개 초안 중 하나로 확정 |
| 사건 구조 | 한 회차 안에 새 사건의 진입, 갈등, 반전 또는 다음 화 후킹이 있어야 함 |
| 장르 기준 | 로맨스 판타지, 먼치킨 주인공, 빠른 전개 유지 |
| 영어 문장 | 시스템 문구나 영어 제목은 바로 뒤에 한글 병기 |
| 공개 위치 | 공개 확정 전에는 `src/pages/novels/` 밖에서 원고 관리 |
| 외부 자료 | 저작권 리스크가 있는 이미지, 음악, 인용문 사용 금지 |

## 2. 회차 데이터 템플릿

`src/data/novelContent.js`의 `novelEpisodes`에 추가합니다.

```js
{
  number: '07',
  title: '확정된 회차 제목',
  status: '7화 공개',
  label: '7화',
  hook: '목록 카드에 표시될 한 문장 후킹입니다.',
  update: '업데이트 로그와 독자 안내에 사용할 짧은 설명입니다.',
  href: '/novels/episode-007/',
  cta: '7화 읽기',
  publishedAt: 'YYYY.MM.DD',
  isoDate: 'YYYY-MM-DD',
  readTime: '약 5분',
  ostKey: defaultStoryOstKey,
  shareTags: ['새 사건 키워드', '로맨스 긴장', '반전 포인트'],
  isFree: true
}
```

현재 `check:content` 기준:

- `number`는 두 자리 문자열이어야 합니다.
- `href`는 `/novels/episode-007/` 형식이어야 합니다.
- `status`는 `7화 공개`, `label`은 `7화` 형식이어야 합니다.
- `publishedAt`과 `isoDate`는 같은 날짜여야 합니다.
- `shareTags`는 3개 이상이며, 작품 공통 키워드가 아닌 회차 고유 키워드를 1개 이상 포함해야 합니다.
- `ostKey`는 `storyOstMap`에 등록된 키여야 합니다.

## 3. Markdown frontmatter 템플릿

공개 확정 후에만 `src/pages/novels/episode-007.md`를 추가합니다.

```md
---
layout: ../../layouts/NovelEpisodeLayout.astro
title: 7화. 확정된 회차 제목
subtitle: 회차 부제 또는 강한 후킹 문장
description: 검색과 공유에 표시될 40자 이상의 회차 요약입니다.
canonical: https://sunofox.com/novels/episode-007/
episodeLabel: EPISODE 07
publishedAt: YYYY.MM.DD
readTime: 약 5분
seriesTitle: 악녀는 첫 장에서 웃었다
backHref: /novels/
backLabel: NOVEL
previousHref: /novels/episode-006/
previousLabel: 이전 화
nextHref: /novels/episode-008/
nextLabel: 다음 화
---

본문을 여기에 작성합니다.
```

최신 공개화라면 `nextHref`와 `nextLabel`은 넣지 않습니다. 다음 화가 공개될 때 이전 최신화 파일에 `nextHref`와 `nextLabel`을 추가합니다.

## 4. 시즌/읽는 흐름 갱신

7화가 미니시즌 1의 연장이라면:

- `novelProject.season.finalHref`를 `/novels/episode-007/`로 변경합니다.
- `novelProject.season.status`, `title`, `summary`, `completedAt`, `nextPlan`을 현재 상태에 맞춥니다.
- `novelProject.readingPath`가 1화부터 7화까지 빠짐없이 덮도록 구간을 조정합니다.

7화가 시즌2의 시작이라면:

- 현재 단일 `season` 구조로는 시즌2 표시가 제한적입니다.
- 공개 전에 `novelProject.seasons` 같은 다중 시즌 구조를 도입할지 먼저 결정합니다.
- 기존 1~6화 URL은 유지하고, 시즌2는 새 사건과 새 무대가 첫 화면에서 분명히 보이게 구성합니다.

## 5. 공개 반영 파일

| 작업 | 파일 |
|---|---|
| 회차 데이터 추가 | `src/data/novelContent.js` |
| 본문 route 추가 | `src/pages/novels/episode-00N.md` |
| 이전 최신화 다음 링크 연결 | `src/pages/novels/episode-00(N-1).md` |
| 읽는 흐름/시즌 상태 갱신 | `src/data/novelContent.js` |
| 공개 라우트 검증 추가 | `scripts/check-public-routes.ps1` |
| README 공개 route 표 갱신 | `README.md` |
| 운영 route 문서 갱신 | `docs/site-route-inventory.md` |
| 업데이트 로그 추가 | `src/data/updatesContent.js` |
| 변경 기록 추가 | `CHANGELOG.md` |

## 6. 검증 명령

```powershell
git status -sb
npm run build
npm run test
git diff --check
```

운영 배포 후:

```powershell
npx wrangler pages deployment list --project-name sf-studio
npm run check:production
```

## 7. 공개 금지 조건

- 본문이 내부 작업본이면 공개 route를 만들지 않습니다.
- 7화 또는 시즌2 방향이 확정되지 않았으면 `src/pages/novels/episode-007.md`를 만들지 않습니다.
- 유료 결제, 굿즈샵, 팬 커뮤니티, 외부 CMS, DB, 인증 구조는 별도 승인 전에는 연결하지 않습니다.
